#!/usr/bin/env python3
"""E3: Apply enrichment vocab — additive-only, backup first, idempotent.
- Backup: curriculum_vocabulary rows for the 27 lessons -> /tmp/vocab_backup_<date>.json
- Insert new rows with explicit ids <lesson>-vN01.. where N = next free suffix.
- ON CONFLICT (id) DO NOTHING.
"""
import json, subprocess, sys, datetime

DB = open('/home/ubuntu/.config/supabase_db_url').read().strip()
rows = json.load(open('/tmp/enrich_vocab.json'))
LESSONS = sorted({r['lesson_id'] for r in rows})
print('lessons:', len(LESSONS))

def psql(sql, capture=False):
    r = subprocess.run(['psql', DB, '-t', '-A'] + (['-F', '|'] if capture else []) + ['-c', sql],
                       capture_output=True, text=True)
    if r.returncode != 0:
        print('PSQL ERROR:', r.stderr[:300])
        sys.exit(1)
    return r.stdout.strip()

# 1. Backup existing vocab rows for these lessons
ts = datetime.date.today().isoformat()
backup_path = f'/tmp/vocab_backup_{ts}.json'
r = subprocess.run(['psql', DB, '-t', '-A', '-c',
                    f"SELECT json_agg(t) FROM (SELECT * FROM curriculum_vocabulary WHERE lesson_id IN ({','.join(chr(39)+l+chr(39) for l in LESSONS)})) t"],
                   capture_output=True, text=True)
backup = json.loads(r.stdout or '[]')
json.dump(backup, open(backup_path, 'w'), ensure_ascii=False, indent=1)
print(f'backup: {len(backup)} existing rows -> {backup_path}')

# 2. Idempotency: skip rows already present (lesson+word)
existing = set()
out = psql("SELECT lesson_id || '|' || lower(word) FROM curriculum_vocabulary")
for line in out.splitlines():
    if '|' in line:
        existing.add(line.strip())
todo = [r for r in rows if (r['lesson_id'], r['word'].lower()) not in existing]
print(f'to insert: {len(todo)} (skipped {len(rows)-len(todo)} dupes)')

# 3. Build INSERT with explicit ids: find max numeric suffix per lesson
cur = psql("SELECT id FROM curriculum_vocabulary WHERE lesson_id IN (" + ','.join(f"'{l}'" for l in LESSONS) + ")")
import re
maxn = {}
for i in cur.splitlines():
    m = re.match(r'^(.+)-v(\d+)$', i.strip())
    if m:
        lid, n = m.group(1), int(m.group(2))
        maxn[lid] = max(maxn.get(lid, 0), n)

vals = []
for r in todo:
    n = maxn.get(r['lesson_id'], 0) + 1
    maxn[r['lesson_id']] = n
    vid = f"{r['lesson_id']}-v{n:02d}"
    def esc(s):
        return s.replace("'", "''")
    vals.append(
        f"('{vid}','{r['lesson_id']}','{r['level_id']}','{esc(r['word'])}','{esc(r['article'])}','{esc(r['translation'])}','{esc(r['example_sentence'])}','{esc(r['phonetic'])}',{r['sort_order']})"
    )

sql = ("INSERT INTO curriculum_vocabulary (id, lesson_id, level_id, word, article, translation, example_sentence, phonetic, sort_order) VALUES\n"
       + ',\n'.join(vals) + "\nON CONFLICT (id) DO NOTHING;")
p = subprocess.run(['psql', DB, '-c', sql], capture_output=True, text=True)
print(p.stdout.strip()[:200] or p.stderr[:300])

# 4. Verify counts per lesson
print('--- post-apply counts (total vocab per lesson) ---')
out = psql(f"SELECT lesson_id, count(*) FROM curriculum_vocabulary WHERE lesson_id IN ({','.join(chr(39)+l+chr(39) for l in LESSONS)}) GROUP BY lesson_id ORDER BY lesson_id")
print(out)
