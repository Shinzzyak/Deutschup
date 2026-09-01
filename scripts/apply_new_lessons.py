#!/usr/bin/env python3
# apply_new_lessons.py — insert kapitel a1-k5 + A1 chapter lessons (a1-16..18) + 10 vocab each.
# Idempotent: ON CONFLICT (id) DO NOTHING everywhere. Insert-only, no UPDATE/DELETE.
import subprocess, sys
sys.path.insert(0, '/home/ubuntu/Deutschup/scripts')
from content_a1 import KAPITEL, LESSONS

DB = open('/home/ubuntu/.config/supabase_db_url').read().strip()

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "''")

def q(sql):
    r = subprocess.run(['psql', DB, '-t', '-A', '-c', sql], capture_output=True, text=True)
    if r.returncode != 0:
        print('SQL FAIL:', r.stderr[:300]); sys.exit(1)
    return r.stdout.strip()

# 1. kapitel
k = KAPITEL['a1-k5']
desc = 'Bab 8, 9 & 11 dari Netzwerk Neu A1: kesehatan, rumah, dan pakaian.'
q(f"INSERT INTO kapitel (id, level_id, title, description, sort_order, is_published) "
  f"VALUES ('a1-k5', 'A1', '{esc(k['title'])}', '{desc}', 5, true) "
  f"ON CONFLICT (id) DO NOTHING")
print('kapitel a1-k5 ok')

# 2. lessons
import json
for lid, l in LESSONS.items():
    dlgs = json.dumps(l['dialogues'], ensure_ascii=False).replace("'", "''")
    goals = json.dumps(l['goals'], ensure_ascii=False).replace("'", "''")
    q(f"INSERT INTO curriculum_lessons "
      f"(id, level_id, kapitel_id, title, sort_order, grammar_description, dialogues, "
      f" cultural_notes, indonesian_mistakes, can_do_goals, is_published) VALUES "
      f"('{lid}', 'A1', 'a1-k5', '{esc(l['title'])}', {l['sort']}, '{esc(l['grammar'])}', "
      f"'{dlgs}'::jsonb, '{esc(l['cultural'])}', '{esc(l['mistakes'])}', "
      f"'{goals}'::jsonb, true) ON CONFLICT (id) DO NOTHING")
    # 3. vocab (id = {lesson}-v{n} ... 1-based, skip existing)
    for i, (w, art, tr, ex, ph) in enumerate(l['vocab'], 1):
        vid = f"{lid}-v{i}"
        q(f"INSERT INTO curriculum_vocabulary "
          f"(id, lesson_id, level_id, word, article, translation, example_sentence, phonetic) VALUES "
          f"('{vid}', '{lid}', 'A1', '{esc(w)}', '{esc(art)}', '{esc(tr)}', '{esc(ex)}', '{esc(ph)}') "
          f"ON CONFLICT (id) DO NOTHING")
    n = q(f"SELECT count(*) FROM curriculum_vocabulary WHERE lesson_id='{lid}'")
    lv = q(f"SELECT count(*) FROM curriculum_lessons WHERE id='{lid}'")
    print(f'{lid}: lesson={lv} vocab={n}')
print('DONE A1')
