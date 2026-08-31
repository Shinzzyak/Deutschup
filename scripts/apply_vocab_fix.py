#!/usr/bin/env python3
# apply_vocab_fix.py — fill vocab gaps (b2-13/14/15 + thin lessons) + grammar b2-15.
# Insert-only (id collision skip), grammar update guarded to empty column.
import subprocess, sys
sys.path.insert(0, '/home/ubuntu/Deutschup/scripts')
from notes_b2_content import B2_VOCAB, GRAMMAR_B2_15

def dburl():
    return subprocess.check_output(['bash', '-c', 'cat ~/.config/supabase_db_url']).decode().strip()

def run(sql, capture=True):
    r = subprocess.run(['psql', dburl(), '-v', 'ON_ERROR_STOP=1', '-t', '-A', '-F', '|',
                        '-c', sql], capture_output=True, text=True)
    if r.returncode != 0:
        print('SQL ERROR:', r.stderr[:400]); sys.exit(1)
    return r.stdout

def esc(s):
    return s.replace("'", "''")

# 1) existing ids per lesson
existing = {}
for line in run("SELECT lesson_id, id FROM curriculum_vocabulary WHERE lesson_id IN (%s);" %
                ','.join("'%s'" % l for l in B2_VOCAB)).split('\n'):
    if '|' in line:
        lid, vid = line.split('|', 1)
        existing.setdefault(lid, set()).add(vid)

# 2) build inserts (skip colliding ids)
inserts = []
summary = {}
for lid, items in B2_VOCAB.items():
    have = existing.get(lid, set())
    n = len(have)  # continue sort_order/id numbering after existing
    added = 0
    for word, tr, ex, ph in items:
        while f'{lid}-v{n+1}' in have:
            n += 1
        n += 1
        inserts.append(
            "INSERT INTO curriculum_vocabulary (id, lesson_id, level_id, word, article, translation, example_sentence, phonetic, sort_order) "
            "VALUES ('%s', '%s', '%s', '%s', '', '%s', '%s', '%s', %d) ON CONFLICT (id) DO NOTHING;" %
            (f'{lid}-v{n}', lid, lid.split('-')[0].upper(), esc(word), esc(tr), esc(ex), esc(ph), 50 + n))
        added += 1
    summary[lid] = added

sql = 'BEGIN;\n' + '\n'.join(inserts) + '\nCOMMIT;'
print('vocab rows to insert:', sum(summary.values()), summary)
r = subprocess.run(['psql', dburl(), '-v', 'ON_ERROR_STOP=1', '-c', sql], capture_output=True, text=True)
print(r.stdout[-500:] if r.stdout else '', r.stderr[:400] if r.returncode else 'INSERT OK')

# 3) grammar b2-15 (only if empty)
has = run("SELECT coalesce(grammar_description,'')='' FROM curriculum_lessons WHERE id='b2-15';").strip()
if has == 't':
    g = esc(GRAMMAR_B2_15)
    r2 = subprocess.run(['psql', dburl(), '-v', 'ON_ERROR_STOP=1', '-c',
                         "UPDATE curriculum_lessons SET grammar_description='%s' WHERE id='b2-15';" % g],
                        capture_output=True, text=True)
    print('grammar b2-15:', 'OK' if r2.returncode == 0 else r2.stderr[:300])
else:
    print('grammar b2-15 already filled, skipped')
