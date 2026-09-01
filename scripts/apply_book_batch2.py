#!/usr/bin/env python3
"""G5: Master applier — everything additive, backup-first, idempotent.
1. Backups: vocab (B2 lessons), exercises (all affected), lessons (affected cols)
2. B2 vocab: dedupe vs DB (strip article) -> insert, ids b2-N-v20+ (after existing max)
3. Old-lesson exercises: fill_blank (EX_OLD) + matching (/tmp/g_matching.json)
4. B2 exercises: /tmp/g2_payload.json exercises (fb sort 60, mc sort 61.. hmm:
   MC got sort 60+k from builder — keep as-is but ensure no collision with 60 fb)
5. Sentence breakdowns + can_do_goals (fill empty only)
6. Dialogues (fill empty only, 16 lessons)
7. Exam questions: write to repo src/data/goethe-exam-book.ts + import in GoetheExam.tsx
"""
import json, subprocess, sys, re, datetime
sys.path.insert(0, '/tmp')

DB = open('/home/ubuntu/.config/supabase_db_url').read().strip()
TS = datetime.date.today().isoformat()

def psql(sql, flags=()):
    r = subprocess.run(['psql', DB, '-t', '-A', *flags, '-c', sql], capture_output=True, text=True)
    if r.returncode != 0:
        print('PSQL ERR:', r.stderr[:300]); raise SystemExit(1)
    return r.stdout.strip()

B2_LESSONS = [f'b2-{i}' for i in range(1, 16)]
OLD_LESSONS = ['a1-2','a1-3','a1-4','a1-5','a1-6','a1-7','a1-8','a1-9','a1-10','a1-11','a1-12','a1-13','a1-14',
               'a2-1','a2-2','a2-3','a2-4','a2-5','a2-6','a2-7','a2-8','a2-9','a2-10','a2-11','a2-12','a2-13',
               'b1-1','b1-2','b1-3','b1-4','b1-5','b1-6','b1-7','b1-8','b1-9','b1-10','b1-11','b1-12']
ALL_B2 = ','.join(f"'{l}'" for l in B2_LESSONS)
ALL_OLD = ','.join(f"'{l}'" for l in OLD_LESSONS)

print('== 1. BACKUPS ==')
b = psql(f"SELECT json_agg(t) FROM (SELECT * FROM curriculum_vocabulary WHERE lesson_id IN ({ALL_B2})) t")
json.dump(json.loads(b or '[]'), open(f'/tmp/g_b2vocab_backup_{TS}.json', 'w'), ensure_ascii=False)
print('b2 vocab backup:', len(json.loads(b or '[]')))
b = psql(f"SELECT json_agg(t) FROM (SELECT * FROM curriculum_exercises WHERE lesson_id IN ({ALL_B2},{ALL_OLD})) t")
json.dump(json.loads(b or '[]'), open(f'/tmp/g_ex_backup_{TS}.json', 'w'), ensure_ascii=False)
print('exercises backup:', len(json.loads(b or '[]')))
b = psql("SELECT json_agg(t) FROM (SELECT id, sentence_breakdowns, can_do_goals, dialogues FROM curriculum_lessons) t")
json.dump(json.loads(b or '[]'), open(f'/tmp/g_lessons_backup_{TS}.json', 'w'), ensure_ascii=False)
print('lessons cols backup:', len(json.loads(b or '[]')))

def esc(s):
    return s.replace("'", "''").replace('\\', '')

print('== 2. B2 VOCAB ==')
payload = json.load(open('/tmp/g2_payload.json'))
existing = set()
for line in psql(f"SELECT lesson_id || '|' || lower(word) FROM curriculum_vocabulary WHERE lesson_id IN ({ALL_B2})").splitlines():
    if '|' in line:
        existing.add(line.strip())
todo = []
for r in payload['vocab']:
    eff = re.sub(r'^(der|die|das)\s+', '', r['word']).lower()
    if f"{r['lesson_id']}|{eff}" in existing or f"{r['lesson_id']}|{r['word'].lower()}" in existing:
        print('  skip dup:', r['lesson_id'], r['word'])
        continue
    existing.add(f"{r['lesson_id']}|{eff}")
    todo.append(r)
vals = []
maxn = {}
for i in psql(f"SELECT id FROM curriculum_vocabulary WHERE lesson_id IN ({ALL_B2})").splitlines():
    m = re.match(r'^(b2-\d+)-v(\d+)$', i.strip())
    if m:
        maxn[m.group(1)] = max(maxn.get(m.group(1), 0), int(m.group(2)))
for r in todo:
    n = maxn.get(r['lesson_id'], 0) + 1
    maxn[r['lesson_id']] = n
    vid = f"{r['lesson_id']}-v{n:02d}"
    vals.append(f"('{vid}','{r['lesson_id']}','B2','{esc(r['word'])}','{esc(r['article'])}','{esc(r['translation'])}','{esc(r['example_sentence'])}','{esc(r['phonetic'])}',{r['sort_order']})")
if vals:
    sql = ("INSERT INTO curriculum_vocabulary (id, lesson_id, level_id, word, article, translation, example_sentence, phonetic, sort_order) VALUES\n"
           + ',\n'.join(vals) + "\nON CONFLICT (id) DO NOTHING;")
    print(psql(sql))
print(f'B2 vocab inserted: {len(vals)}')

def insert_exercises(rows, label):
    have = set()
    for line in psql(f"SELECT lesson_id || '|' || sort_order || '|' || exercise_type FROM curriculum_exercises WHERE lesson_id IN ({ALL_B2},{ALL_OLD}) AND sort_order IN (60,61)").splitlines():
        parts = line.split('|')
        if len(parts) == 3:
            have.add((parts[0], parts[1], parts[2]))
    vals = []
    for e in rows:
        key = (e['lesson_id'], str(e['sort']), e['type'])
        if key in have:
            print(f'  skip {label} {key}')
            continue
        have.add(key)
        if e['type'] == 'fill_blank':
            ans = json.dumps(e['answer'], ensure_ascii=False)
            vals.append(f"('{e['lesson_id']}','fill_blank','{esc(e['question'])}','[]'::jsonb,0,{e['sort']},'{ans}'::jsonb)")
        elif e['type'] == 'matching':
            ans = json.dumps(e['answer'], ensure_ascii=False)
            vals.append(f"('{e['lesson_id']}','matching','{esc(e['question'])}','[]'::jsonb,0,{e['sort']},'{ans}'::jsonb)")
        elif e['type'] == 'multiple_choice':
            opts = json.dumps(e['options'], ensure_ascii=False)
            ans = json.dumps(e['correct_answer'], ensure_ascii=False)
            vals.append(f"('{e['lesson_id']}','multiple_choice','{esc(e['question'])}','{esc(opts)}'::jsonb,{e['correct_answer']},{e['sort']},'{ans}'::jsonb)")
    if vals:
        for i in range(0, len(vals), 40):
            chunk = vals[i:i+40]
            sql = ("INSERT INTO curriculum_exercises (lesson_id, exercise_type, question, options, correct_answer, sort_order, answer) VALUES\n"
                   + ',\n'.join(chunk) + ';')
            print(psql(sql))
    print(f'{label} inserted: {len(vals)}')

print('== 3. OLD-LESSON EXERCISES ==')
from g_ex_old import EX_OLD
MT = json.load(open('/tmp/g_matching.json'))
insert_exercises(EX_OLD, 'old fill_blank')
insert_exercises(MT, 'old matching')

print('== 4. B2 EXERCISES ==')
insert_exercises(payload['exercises'], 'b2 exercises')

print('== 5. SENTENCE BREAKDOWNS + CAN-DO ==')
from g_fill import SB, CD
n_sb = n_cd = 0
for lid, items in SB.items():
    cur = psql(f"SELECT coalesce(sentence_breakdowns::text,'null') FROM curriculum_lessons WHERE id='{lid}'")
    if cur not in ('null', '[]', ''):
        continue
    arr = json.dumps(items, ensure_ascii=False)
    psql(f"UPDATE curriculum_lessons SET sentence_breakdowns='{esc(arr)}'::jsonb, updated_at=now() WHERE id='{lid}'")
    n_sb += 1
for lid, items in CD.items():
    cur = psql(f"SELECT coalesce(can_do_goals::text,'null') FROM curriculum_lessons WHERE id='{lid}'")
    if cur not in ('null', '[]', ''):
        continue
    arr = json.dumps(items, ensure_ascii=False)
    psql(f"UPDATE curriculum_lessons SET can_do_goals='{esc(arr)}'::jsonb, updated_at=now() WHERE id='{lid}'")
    n_cd += 1
print(f'sentence_breakdowns filled: {n_sb} | can_do_goals filled: {n_cd}')

print('== 6. DIALOGUES ==')
from g_dialogs import DIALOGS
n_d = 0
for lid, items in DIALOGS.items():
    cur = psql(f"SELECT coalesce(dialogues::text,'null') FROM curriculum_lessons WHERE id='{lid}'")
    if cur not in ('null', '[]', ''):
        print('  skip existing dialog:', lid)
        continue
    arr = json.dumps(items, ensure_ascii=False)
    psql(f"UPDATE curriculum_lessons SET dialogues='{esc(arr)}'::jsonb, updated_at=now() WHERE id='{lid}'")
    n_d += 1
print(f'dialogues filled: {n_d}')
