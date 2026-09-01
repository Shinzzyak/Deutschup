#!/usr/bin/env python3
"""F4: Apply book-sourced exercises (80 rows) + grammar enrichment (27 appends).
- Backup curriculum_exercises (27 lessons) + curriculum_lessons.grammar_description -> JSON
- Exercises: id uuid default, answer jsonb, hint text. ON CONFLICT none (new uuids);
  idempotency via lookup (lesson_id+sort_order 60/61 exist -> skip).
- Grammar: append 'Dari buku (Netzwerk neu): ...' if not already appended.
"""
import json, subprocess, sys, datetime

DB = open('/home/ubuntu/.config/supabase_db_url').read().strip()
LESSONS = ['a1-16','a1-17','a1-18','a2-16','a2-17','a2-18','a2-19','a2-20','a2-21','a2-22','a2-23','a2-24','a2-25','a2-26','a2-27','b1-14','b1-15','b1-16','b1-17','b1-18','b1-19','b1-20','b1-21','b1-22','b1-23','b1-24','b1-25']
LIDS = ','.join(f"'{l}'" for l in LESSONS)

def psql(sql, flags=()):
    r = subprocess.run(['psql', DB, '-t', '-A', *flags, '-c', sql], capture_output=True, text=True)
    if r.returncode != 0:
        print('PSQL ERROR:', r.stderr[:400]); sys.exit(1)
    return r.stdout.strip()

# 1. Backups
ts = datetime.date.today().isoformat()
ex_backup = psql(f"SELECT json_agg(t) FROM (SELECT * FROM curriculum_exercises WHERE lesson_id IN ({LIDS})) t")
json.dump(json.loads(ex_backup or '[]'), open(f'/tmp/ex_backup_{ts}.json','w'), ensure_ascii=False, indent=1)
print('ex backup rows:', len(json.loads(ex_backup or '[]')))
gr_backup = psql(f"SELECT json_agg(t) FROM (SELECT id, grammar_description FROM curriculum_lessons WHERE id IN ({LIDS})) t")
json.dump(json.loads(gr_backup or '[]'), open(f'/tmp/grammar_backup_{ts}.json','w'), ensure_ascii=False, indent=1)
print('grammar backup rows:', len(json.loads(gr_backup or '[]')))

# 2. Exercises: idempotency by (lesson_id, sort_order in 60,61)
have = set()
for line in psql(f"SELECT lesson_id || '|' || sort_order FROM curriculum_exercises WHERE lesson_id IN ({LIDS}) AND sort_order IN (60,61)").splitlines():
    if '|' in line:
        have.add(line.strip())
ex = json.load(open('/tmp/enrich_exercises.json'))
todo = [e for e in ex if f"{e['lesson_id']}|{e['sort']}" not in have]
print(f'exercises to insert: {len(todo)} (skip {len(ex)-len(todo)} existing)')

if todo:
    def esc(s):
        return s.replace("'", "''")
    vals = []
    for e in todo:
        ans = json.dumps(e['answer'], ensure_ascii=False)
        vals.append(f"('{e['lesson_id']}','{e['type']}','{esc(e['question'])}','[]'::jsonb,0,{e['sort']},'{ans}'::jsonb)")
    sql = ("INSERT INTO curriculum_exercises (lesson_id, exercise_type, question, options, correct_answer, sort_order, answer) VALUES\n"
           + ',\n'.join(vals) + ';')
    print(psql(sql))

# sanity: fill_blank rows must have hint; matching must not need options
n60 = psql(f"SELECT count(*) FROM curriculum_exercises WHERE lesson_id IN ({LIDS}) AND sort_order=60")
n61 = psql(f"SELECT count(*) FROM curriculum_exercises WHERE lesson_id IN ({LIDS}) AND sort_order=61")
print('fill_blank 60:', n60, '| matching 61:', n61)

# 3. Grammar enrichment (append)
g = json.load(open('/tmp/enrich_grammar.json'))
appended, skipped = 0, 0
for lid, text in g.items():
    cur = psql(f"SELECT grammar_description FROM curriculum_lessons WHERE id='{lid}'")
    if 'Dari buku (Netzwerk neu)' in (cur or ''):
        skipped += 1
        continue
    new = (cur.rstrip() + '\n\n📚 Dari buku (Netzwerk neu): ' + text).strip()
    new_sql = new.replace("'", "''")
    psql(f"UPDATE curriculum_lessons SET grammar_description='{new_sql}', updated_at=now() WHERE id='{lid}'")
    appended += 1
print(f'grammar appended: {appended} | already-enriched skipped: {skipped}')

# 4. Verify
print('--- exercise counts per lesson (expect 14 = 6 v2 seed + 6 legacy + 2 new; a1 legacy 0) ---')
print(psql(f"SELECT lesson_id, count(*) FROM curriculum_exercises WHERE lesson_id IN ({LIDS}) GROUP BY lesson_id ORDER BY lesson_id"))
