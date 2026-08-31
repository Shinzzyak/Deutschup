#!/usr/bin/env python3
# apply_notes.py — write indonesian_mistakes + cultural_notes into curriculum_lessons.
# Update-only on two text columns; never touches rows that already have content.
import sys, subprocess
sys.path.insert(0, 'scripts')
from notes_a1 import MISTAKES_A1
from notes_a2 import MISTAKES_A2
from notes_b1 import MISTAKES_B1
from notes_b2 import MISTAKES_B2
from notes_b2b import MISTAKES_B2_PART2
from notes_cultural import CULTURAL

MISTAKES = {**MISTAKES_A1, **MISTAKES_A2, **MISTAKES_B1, **MISTAKES_B2, **MISTAKES_B2_PART2}

def esc(s):
    return s.replace("'", "''")

dburl = open('/home/ubuntu/.config/supabase_db_url').read().strip()

# fetch current state — skip anything already filled
r = subprocess.run(['psql', dburl, '-t', '-A', '-F', '|', '-c',
    "SELECT id, coalesce(indonesian_mistakes,'') <> '' AS has_m, coalesce(cultural_notes,'') <> '' AS has_c FROM curriculum_lessons WHERE id ~ '-[0-9]+$';"],
    capture_output=True, text=True, check=True)
has_m, has_c = {}, {}
for line in r.stdout.strip().split('\n'):
    if not line: continue
    lid, m, c = line.split('|')
    has_m[lid], has_c[lid] = m == 't', c == 't'

stmts = []
m_skip = [lid for lid in MISTAKES if has_m.get(lid)]
c_skip = [lid for lid in CULTURAL if has_c.get(lid)]
for lid, txt in MISTAKES.items():
    if not has_m.get(lid, False):
        stmts.append(f"UPDATE curriculum_lessons SET indonesian_mistakes='{esc(txt)}' WHERE id='{lid}';")
for lid, txt in CULTURAL.items():
    if not has_c.get(lid, False):
        stmts.append(f"UPDATE curriculum_lessons SET cultural_notes='{esc(txt)}' WHERE id='{lid}';")

if '--dry' in sys.argv:
    print(f'dry-run: {len(stmts)} statements (mistakes={len(MISTAKES)-len(m_skip)}, cultural={len(CULTURAL)-len(c_skip)})')
    print('skipped (already filled):', len(m_skip) + len(c_skip))
    sys.exit(0)

sql = 'BEGIN;\n' + '\n'.join(stmts) + '\nCOMMIT;'
open('/tmp/notes_apply.sql', 'w').write(sql)
r = subprocess.run(['psql', dburl, '-f', '/tmp/notes_apply.sql'], capture_output=True, text=True)
upd = r.stdout.count('UPDATE 1')
print(f'applied {upd} UPDATEs, errors: {r.stderr.strip()[:200] or "none"}')

# verify
r = subprocess.run(['psql', dburl, '-t', '-A', '-c',
    "SELECT count(*) FILTER (WHERE coalesce(indonesian_mistakes,'') <> ''), count(*), count(*) FILTER (WHERE coalesce(cultural_notes,'') <> '') FROM curriculum_lessons WHERE id ~ '-[0-9]+$';"],
    capture_output=True, text=True, check=True)
print('mistakes-filled / total / cultural-filled:', r.stdout.strip())
