#!/usr/bin/env python3
# apply_a2_lessons.py — insert kapitel a2-k5 + 12 A2 chapter lessons + 10 vocab each.
# Idempotent (ON CONFLICT DO NOTHING). Insert-only.
import subprocess, sys, json
sys.path.insert(0, '/home/ubuntu/Deutschup/scripts')
from content_a2_p1 import LESSONS_A2_P1
from content_a2_p2 import LESSONS_A2_P2
from content_a2_p2b import LESSONS_A2_P2B
from content_a2_p3 import LESSONS_A2_P3
from content_a2_p4 import LESSONS_A2_P4

LESSONS = {}
for d in (LESSONS_A2_P1, LESSONS_A2_P2, LESSONS_A2_P2B, LESSONS_A2_P3, LESSONS_A2_P4):
    LESSONS.update(d)

DB = open('/home/ubuntu/.config/supabase_db_url').read().strip()

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "''")

def q(sql):
    r = subprocess.run(['psql', DB, '-t', '-A', '-c', sql], capture_output=True, text=True)
    if r.returncode != 0:
        print('SQL FAIL:', r.stderr[:300]); sys.exit(1)
    return r.stdout.strip()

q("INSERT INTO kapitel (id, level_id, title, description, sort_order, is_published) "
  "VALUES ('a2-k5', 'A2', 'Themen aus dem Buch (1-12)', "
  "'Dua belas bab Netzwerk neu A2 sebagai pelajaran topik: hobi, sekolah, online, perasaan, kota, kerja, mobilitas, belajar, olahraga, hidup bersama, waktu, hiburan.', "
  "5, true) ON CONFLICT (id) DO NOTHING")
print('kapitel a2-k5 ok')

for lid, l in sorted(LESSONS.items()):
    dlgs = json.dumps(l['dialogues'], ensure_ascii=False).replace("'", "''")
    goals = json.dumps(l['goals'], ensure_ascii=False).replace("'", "''")
    q(f"INSERT INTO curriculum_lessons "
      f"(id, level_id, kapitel_id, title, sort_order, grammar_description, dialogues, "
      f" cultural_notes, indonesian_mistakes, can_do_goals, is_published) VALUES "
      f"('{lid}', 'A2', 'a2-k5', '{esc(l['title'])}', {l['sort']}, '{esc(l['grammar'])}', "
      f"'{dlgs}'::jsonb, '{esc(l['cultural'])}', '{esc(l['mistakes'])}', "
      f"'{goals}'::jsonb, true) ON CONFLICT (id) DO NOTHING")
    for i, (w, art, tr, ex, ph) in enumerate(l['vocab'], 1):
        vid = f"{lid}-v{i}"
        q(f"INSERT INTO curriculum_vocabulary "
          f"(id, lesson_id, level_id, word, article, translation, example_sentence, phonetic) VALUES "
          f"('{vid}', '{lid}', 'A2', '{esc(w)}', '{esc(art)}', '{esc(tr)}', '{esc(ex)}', '{esc(ph)}') "
          f"ON CONFLICT (id) DO NOTHING")
    n = q(f"SELECT count(*) FROM curriculum_vocabulary WHERE lesson_id='{lid}'")
    lv = q(f"SELECT count(*) FROM curriculum_lessons WHERE id='{lid}'")
    print(f'{lid}: lesson={lv} vocab={n}')
print('DONE A2')
