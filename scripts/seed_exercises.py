#!/usr/bin/env python3
# seed_exercises.py — generate v2 exercise rows (6 per lesson) for all numbered lessons.
# Deterministic: everything derived from curriculum_vocabulary + lesson metadata. No randomness.
# Contract: mirrors src/lib/exercise-mapper.ts (answer jsonb: int=MC index, bool=TF, array=text/matching).
# Usage: python3 scripts/seed_exercises.py > /tmp/seed_v2.sql   (then review + psql -f)
import json, subprocess, sys

DBURL = open('/home/ubuntu/.config/supabase_db_url').read().strip()

def q(sql):
    r = subprocess.run(['psql', DBURL, '-t', '-A', '-F', '\t', '-c', sql], capture_output=True, text=True, check=True)
    return [line.split('\t') for line in r.stdout.strip().split('\n') if line]

def esc(s):
    return s.replace("'", "''")

def jb(v):
    return esc(json.dumps(v, ensure_ascii=False))

# ---------- load data ----------
lessons = {r[0]: {'title': r[1]} for r in q("SELECT id, title FROM curriculum_lessons WHERE id ~ '-[0-9]+$' ORDER BY id;")}
vocab = {}
for r in q("SELECT lesson_id, word, article, translation, example_sentence FROM curriculum_vocabulary WHERE lesson_id ~ '-[0-9]+$' ORDER BY lesson_id, sort_order;"):
    vocab.setdefault(r[0], []).append({'word': r[1], 'article': r[2], 'translation': r[3], 'example': r[4]})

# level vocab pools for MC distractors
pool = {}
for lid, rows in vocab.items():
    pool.setdefault(lid.split('-')[0], []).extend(rows)

# ---------- essay prompts (authored per lesson; Indonesian + German task, app copy style) ----------
ESSAY = {
 'a1-2': 'Schreibe drei Sätze über drei Dinge in deinem Zimmer. Benutze der, die, das. (Tulis 3 kalimat tentang 3 benda di kamarmu, pakai der/die/das.)',
 'a1-3': 'Schreibe kurz über dich: Wie alt bist du? Wann hast du Geburtstag? (Tulis singkat: umur & tanggal lahirmu, pakai angka.)',
 'a1-4': 'Beschreibe deinen Lieblingstag: Welcher Tag ist es und welche Farbe hat er für dich? (Deskripsikan hari favoritmu dan warnanya.)',
 'a1-5': 'Schreibe vier Sätze über deine Familie: Ich, du, er/sie, wir. (Tulis 4 kalimat tentang keluargamu dengan kata ganti orang.)',
 'a1-6': 'Schreibe über deinen Tag: Was ist wichtig für dich? Benutze sein und haben. (Ceritakan hari Anda, pakai sein & haben.)',
 'a1-7': 'Schreibe fünf einfache Sätze über dein Morgen: Ich stehe um ... auf. (Tulis 5 kalimat sederhana tentang pagi harimu.)',
 'a1-8': 'Wo ist was? Beschreibe dein Zimmer mit mit, auf, unter und neben. (Deskripsikan kamarmu dengan preposisi.)',
 'a1-10': 'Was kaufst du gern ein? Schreibe über dein Lieblingsessen und -getränk. (Apa yang biasa kamu beli? Tulis makanan & minuman favoritmu.)',
 'a1-11': 'Schreibe deinen Tagesplan: Wann machst du was? Benutze Uhrzeiten. (Buat jadwal harimu dengan jam.)',
 'a1-12': 'Was machst du gern in deiner Freizeit? Schreibe drei Sätze. (Apa hobimu? Tulis 3 kalimat.)',
 'a1-13': 'Wie ist das Wetter heute bei dir? Und im Winter? (Bagaimana cuaca hari ini? Dan di musim dingin?)',
 'a1-14': 'Du bist im Hotel. Schreibe eine kurze Nachricht an die Rezeption: Check-in und eine Frage. (Kamu di hotel: tulis pesan singkat ke resepsionis.)',
 'a1-15': 'Schreibe einen kurzen Text über dich: Name, Alter, Familie, Hobby und ein Traum. (Perkenalan lengkap: nama, umur, keluarga, hobi, satu cita-cita.)',
 'a2-1': 'Beschreibe dein Schlafzimmer: Was siehst du? Benutze Nominativ und Akkusativ. (Deskripsikan kamar, pakai nominativ & akusatif.)',
 'a2-2': 'Schreibe, wem was gehört: Der Vater schenkt der Mutter ... Benutze den Dativ. (Tulis siapa memberi apa kepada siapa, pakai dativ.)',
 'a2-3': 'Was musst du, kannst du und willst du diese Woche machen? (Apa yang wajib, bisa, dan ingin kamu lakukan minggu ini?)',
 'a2-4': 'Was hast du am Wochenende gemacht? Schreibe vier Sätze im Perfekt. (Apa yang kamu lakukan akhir pekan lalu? 4 kalimat perfekt.)',
 'a2-5': 'Wie war dein Leben als Kind? Schreibe drei Sätze im Präteritum. (Bagaimana masa kecilmu? 3 kalimat präteritum.)',
 'a2-6': 'Wohin stellst du deine Dinge? Beschreibe mit in, an, auf, unter + Dativ/Akkusativ. (Di mana kamu menaruh barangmu?)',
 'a2-7': 'Vergleiche deine Stadt mit Jakarta: Was ist besser, was ist schöner? (Bandingkan kotamu dengan Jakarta.)',
 'a2-8': 'Dein Handy funktioniert nicht. Schreibe die Geschichte: Es geht nicht an, ich rufe ... an. (HP-mu rusak: ceritakan dengan verba terpisah.)',
 'a2-10': 'Du planst eine Party. Was gibt es und was gibt es nicht? Benutze nicht und kein. (Rencana pesta: pakai negasi nicht & kein.)',
 'a2-11': 'Was machst du morgens? Schreibe mit sich freuen, sich waschen, sich beeilen. (Rutinitas pagi dengan verba refleksif.)',
 'a2-12': 'Schreibe über dein Studium: Worüber freust du dich? Worauf wartest du? (Tentang kuliahmu: pakai pronominaladverbien.)',
 'a2-13': 'Ich glaube, dass ... Schreibe vier Sätze über deine Pläne und Hoffnungen. (Kepercayaan & harapanmu dengan nebensatz.)',
 'a2-14': 'Welche deutsche Gewohnheit findest du interessant? Und welche indonesische? (Adat Jerman mana yang menarik? Dan Indonesia?)',
 'a2-15': 'Rückblick: Was konntest du am Anfang nicht und jetzt gut? (Kilas balik: apa yang dulu sulit dan sekarang bisa?)',
 'b1-1': 'Erkläre mit dem Genitiv: die Bedeutung von drei Wörtern aus dieser Lektion. (Jelaskan 3 kata leksikon ini pakai genitiv.)',
 'b1-2': 'Beschreibe eine Person, die dich inspiriert. Benutze Relativsätze. (Orang yang menginspirasi, pakai relativsätze.)',
 'b1-3': 'Was würdest du machen, wenn du einen Monat frei hättest? (Apa yang akan kamu lakukan bila punya satu bulan libur?)',
 'b1-4': 'Wie wird Recycling in deiner Stadt organisiert? Schreibe im Passiv. (Bagaimana daur ulang di kotamu? Pakai passiv.)',
 'b1-5': 'Einerseits ..., andererseits ...: Diskutiere Social Media. (Diskusikan medsos dengan konjungsi dua bagian.)',
 'b1-6': 'Berichte indirekt, was dein Freund gestern gesagt hat. (Sampaikan ucapan temanmu secara tidak langsung.)',
 'b1-7': 'Warum lernst du Deutsch? Erkläre mit um ... zu und damit. (Kenapa belajar Jerman? Pakai tujuan.)',
 'b1-8': 'Beschreibe ein Foto aus deinem Leben mit Adjektivendungen. (Deskripsikan foto kenanganmu, deklinasi adjektiv.)',
 'b1-9': 'Wie siehst du deine Zukunft aus? Benutze Futur I und II. (Bagaimana masa depanmu? Pakai futur.)',
 'b1-10': 'Bilde und erkläre fünf Komposita aus deinem Fachgebiet. (Buat & jelaskan 5 kata majemuk bidangmu.)',
 'b1-11': 'Was hattest du getan, bevor du heute aufgestanden bist? (Apa yang sudah kamu lakukan sebelum bangun tadi?)',
 'b1-12': 'Beschreibe drei Personen mit n-Deklination: der Kollege, der Nachbar, der Student. (Deskripsikan 3 orang dengan deklinasi-n.)',
 'b2-1': 'Analysiere einen Satz mit Partizipialkonstruktion und schreibe ihn um. (Ubah satu kalimat partisipial jadi kalimat biasa.)',
 'b2-2': 'Schreibe einen Absatz über ein Buch oder eine Serie mit erweiterten Relativsätzen. (Satu paragraf tentang buku/serial favorit.)',
 'b2-3': 'Welche Partikel benutzt du, um deine Meinung zu soften: ja, mal, denn? Erkläre mit Beispielen. (Jelaskan 3 partikel dengan contohmu sendiri.)',
 'b2-4': 'Schreibe eine kurze These zu KI im Unterricht — wissenschaftlich, mit Begründung. (Tesiski AI di kelas, gaya ilmiah.)',
 'b2-5': 'Man sage, der Minister habe ... Erkläre den Unterschied zu Konjunktiv II mit einem Beispiel. (Bedakan konjunktiv I vs II.)',
 'b2-6': 'Verbinde drei kurze Texte zu einem komplexen Satz mit Partizipien und Relativsätzen. (Gabungkan 3 ide jadi 1 kalimat kompleks.)',
 'b2-7': 'Erkläre eine deutsche Redewendung und eine indonesische mit ähnlicher Bedeutung. (Jelaskan satu idiom Jerman dan padanannya.)',
 'b2-8': 'Definiere drei Fachbegriffe aus deinem Studium/Beruf — präzise. (Definisikan 3 istilah teknis bidangmu.)',
 'b2-9': 'Analysiere die Argumentation eines kurzen Zeitungsartikels: These, Belege, Schluss. (Analisis struktur argumen sebuah artikel.)',
 'b2-11': 'Welche Nomen-Verb-Verbindungen benutzt du oft? Nenne fünf mit Beispielsätzen. (5 kolokasi noun-verb yang sering kamu pakai.)',
 'b2-12': 'Ersetze in einem eigenen Text dreimal das Passiv durch alternative Formen. (Ganti 3 kalimat pasif dengan bentuk alternatif.)',
 'b2-13': 'Diskutiere: Klimaschutz ist vor allem Aufgabe der Politik. Deine Position mit drei Argumenten. (Posisi & 3 argumenmu soal iklim.)',
 'b2-14': 'Beschreibe eine Technologie, die dein Leben verändert hat — Chancen und Risiken. (Teknologi yang mengubah hidupmu: peluang & risiko.)',
 'b2-15': 'Schreibe einen Text (150 Wörter): Dein Weg von A1 bis B2 — Meilensteine und Tipps für andere. (Perjalananmu A1→B2 + tips.)',
}
FALLBACK_ESSAY = {
 'a1': 'Schreibe drei Sätze über das Thema dieser Lektion. (Tulis 3 kalimat sesuai topik pelajaran ini.)',
 'a2': 'Schreibe vier Sätze zum Thema dieser Lektion. Benutze die neue Grammatik. (Tulis 4 kalimat dengan gramatika baru ini.)',
 'b1': 'Schreibe einen kurzen Text zum Thema dieser Lektion. Benutze die neue Struktur mindestens zweimal. (Tulis dengan struktur baru ini minimal 2×.)',
 'b2': 'Verfasse einen zusammenhängenden Text zum Thema dieser Lektion — präzise und strukturiert. (Tulis teks runtut & presisi sesuai topik.)',
}

# Authored extras for lessons with no vocabulary to derive from (b2-13/14/15).
# Shape: (type, question, options_json, correct_answer, answer_json)
EXTRA = {
 'b2-13': [
   ('multiple_choice', 'Wie sagt man „pelestarian lingkungan" auf Deutsch?', '["der Umweltschutz","die Gesellschaft","die Wissenschaft","die Entscheidung"]', 0, '0'),
   ('multiple_choice', 'Was gehört NICHT zur Energiewende?', '["Windkraft","Solarenergie","Braunkohle","Wasserkraft"]', 2, '2'),
   ('matching', 'Jodohkan verba lingkungan dengan artinya.', '[]', 0, '[["vermeiden","menghindari"],["verschwenden","menyia-nyiakan"],["erzeugen","menghasilkan"],["schützen","melindungi"]]'),
 ],
 'b2-14': [
   ('multiple_choice', 'Wie sagt man „penelitian" auf Deutsch?', '["die Forschung","die Fabrik","die Folge","die Förderung"]', 0, '0'),
   ('multiple_choice', 'Welcher Artikel? „___ Fortschritt" (kemajuan)', '["der","die","das","den"]', 0, '0'),
   ('matching', 'Jodohkan kata teknik/sains dengan artinya.', '[]', 0, '[["die Entwicklung","pengembangan"],["die Erfindung","penciptaan"],["die Entdeckung","penemuan"],["der Fortschritt","kemajuan"]]'),
 ],
 'b2-15': [
   ('multiple_choice', 'Welche Struktur drückt einen höflichen Wunsch aus?', '["Ich würde gern …","Ich werde …","Ich muss …","Ich darf …"]', 0, '0'),
   ('true_false', 'Im Passiv steht der Vorgang im Mittelpunkt, nicht der Täter.', '["Richtig","Falsch"]', 0, 'true'),
   ('matching', 'Jodohkan struktur B2 dengan fungsinya.', '[]', 0, '[["Konjunktiv II","Wünsche und Höflichkeit"],["Passiv","Vorgang betont"],["Relativsätze","nähere Angaben"],["Modalpartikeln","Textklang"]]'),
 ],
}

# ---------- helpers ----------
def norm_word(v):
    return v['word'].strip()

def word_no_article(v):
    w = norm_word(v)
    for art in ('der ', 'die ', 'das ', 'Der ', 'Die ', 'Das ', 'das ', 'der ', 'die '):
        if w.lower().startswith(art.lower() + ' '):
            return w[len(art):].strip()
    return w

def distractors(lid, level, correct_translation, exclude_words, n=3):
    out = []
    for cand in pool.get(level, []):
        t = cand['translation'].strip()
        if not t or t.lower() == correct_translation.lower() or cand['word'] in exclude_words:
            continue
        if t in out:
            continue
        out.append(t)
    # deterministic spread: take evenly across the pool
    if len(out) <= n:
        return out
    step = len(out) // (n + 1)
    return [out[i * step] for i in range(n)]

def mc_options_index(correct, distr):
    opts = [correct] + distr[:3]
    while len(opts) < 4:
        opts.append(f'Keine der genannten ({len(opts)})')  # ponytail: only if pool too small (<3 distractors)
    return opts, 0

def fill_from_example(v):
    ex = (v['example'] or '').strip()
    w = word_no_article(v)
    art = v['article'].strip()
    for target in (f'{art} {w}', w):
        if target and target.lower() in ex.lower():
            i = ex.lower().index(target.lower())
            replaced = ex[:i] + '___' + ex[i + len(target):]
            return replaced, target
    return None, None

def accepted_forms(v):
    w = word_no_article(v)
    forms = [w, w.lower()]
    art = v['article'].strip()
    full = f'{art} {w}'.strip() if art else w
    if full != w:
        forms.append(full)
    seen, out = set(), []
    for f in forms:
        if f not in seen:
            seen.add(f); out.append(f)
    return out

rows = []  # (lesson_id, sort_order, exercise_type, question, options, correct_answer, answer)
LEVEL_OF = lambda lid: lid.split('-')[0]

for lid in sorted(lessons):
    level = LEVEL_OF(lid)
    lv = vocab.get(lid, [])
    title = lessons[lid]['title']
    if lid == 'a1-1':
        continue  # pilot already seeded
    o = 100  # start beyond any legacy/pilot sort_order
    if len(lv) >= 4:
        v0, v1, v2_, v3 = lv[0], lv[1], lv[2], lv[3]
        # 1) MC — meaning
        correct = v0['translation'].strip()
        dis = distractors(lid, level, correct, {v0['word']})
        if len(dis) >= 3:
            opts, idx = mc_options_index(correct, dis)
            rows.append((lid, o, 'multiple_choice',
                         f'Was bedeutet „{norm_word(v0)}"? („{norm_word(v0)}" artinya …)',
                         jb(opts), 0, jb(idx)))
            o += 1
        # 2) TF — meaning claim (parity: even lesson true, odd false)
        claim_true = int(lid.split('-')[1]) % 2 == 0
        if claim_true:
            rows.append((lid, o, 'true_false', f'„{norm_word(v1)}" bedeutet „{v1["translation"].strip()}".', '["Richtig","Falsch"]', 0, 'true'))
        else:
            wrong = next((c['translation'].strip() for c in pool.get(level, []) if c['translation'].strip() and c['word'] != v1['word'] and c['translation'].strip().lower() != v1['translation'].strip().lower()), None)
            if wrong:
                rows.append((lid, o, 'true_false', f'„{norm_word(v1)}" bedeutet „{wrong}".', '["Richtig","Falsch"]', 0, 'false'))
            else:
                rows.append((lid, o, 'true_false', f'„{norm_word(v1)}" bedeutet „{v1["translation"].strip()}".', '["Richtig","Falsch"]', 0, 'true'))
        o += 1
        # 3) short_answer — translate
        rows.append((lid, o, 'short_answer', f'Wie sagt man „{v2_["translation"].strip()}" auf Deutsch?', '[]', 0, jb(accepted_forms(v2_))))
        o += 1
        # 4) fill_blank — example sentence or article
        filled, target = fill_from_example(v3)
        if filled and len(filled) <= 160:
            rows.append((lid, o, 'fill_blank', f'Ergänze: {filled}', '[]', 0, jb(accepted_forms(v3))))
        elif v3['article'].strip():
            rows.append((lid, o, 'fill_blank', f'Artikel? „___ {word_no_article(v3)}" = {v3["translation"].strip()}', '[]', 0, jb([v3['article'].strip()])))
        else:
            rows.append((lid, o, 'fill_blank', f'Ergänze das Wort: {v3["translation"].strip()} = ___', '[]', 0, jb(accepted_forms(v3))))
        o += 1
        # 5) matching — 4 pairs (or fewer if vocab thin)
        pairs = [[norm_word(v), v['translation'].strip()] for v in lv[:4]]
        rows.append((lid, o, 'matching', 'Jodohkan kata dengan artinya.', '[]', 0, jb(pairs)))
        o += 1
        # 6) essay
        rows.append((lid, o, 'essay', ESSAY.get(lid) or FALLBACK_ESSAY[level], '[]', 0, 'null'))
    else:
        # thin lesson: no/low vocab — grammar-flavored MC from title + essay + TF + matching from whatever exists
        v = lv[0] if lv else None
        if v:
            rows.append((lid, o, 'true_false', f'„{norm_word(v)}" bedeutet „{v["translation"].strip()}".', '["Richtig","Falsch"]', 0, 'true'))
            rows.append((lid, o + 1, 'short_answer', f'Wie sagt man „{v["translation"].strip()}" auf Deutsch?', '[]', 0, jb(accepted_forms(v))))
            filled, _ = fill_from_example(v)
            if filled and len(filled) <= 160:
                rows.append((lid, o + 2, 'fill_blank', f'Ergänze: {filled}', '[]', 0, jb(accepted_forms(v))))
                rows.append((lid, o + 3, 'matching', 'Jodohkan kata dengan artinya.', '[]', 0, jb([[norm_word(x), x['translation'].strip()] for x in lv[:2]])))
                rows.append((lid, o + 4, 'essay', ESSAY.get(lid) or FALLBACK_ESSAY[level], '[]', 0, 'null'))
            else:
                pairs = [[norm_word(x), x['translation'].strip()] for x in lv[:2]]
                rows.append((lid, o + 2, 'matching', 'Jodohkan kata dengan artinya.', '[]', 0, jb(pairs)))
                rows.append((lid, o + 3, 'essay', ESSAY.get(lid) or FALLBACK_ESSAY[level], '[]', 0, 'null'))
        else:
            rows.append((lid, o, 'true_false', f'„{title}" ist ein Thema dieser Lektion.', '["Richtig","Falsch"]', 0, 'true'))
            rows.append((lid, o + 1, 'essay', ESSAY.get(lid) or FALLBACK_ESSAY[level], '[]', 0, 'null'))
            for i, (typ, question, options_json, ca, answer_json) in enumerate(EXTRA.get(lid, [])):
                a = json.loads(answer_json)
                if isinstance(a, str) and a.isdigit(): a = int(a)
                rows.append((lid, o + 2 + i, typ, question, options_json, ca, jb(a)))

# ---------- validation (mirror of exercise-mapper.ts) ----------
errors = []
seen_keys = set()
for lid, so, typ, question, options, ca, answer in rows:
    key = (lid, so)
    if key in seen_keys: errors.append(f'dup key {key}'); continue
    seen_keys.add(key)
    if not question or len(question) > 300: errors.append(f'{key}: question len {len(question)}')
    a = json.loads(answer) if answer != 'null' else None
    if typ == 'multiple_choice':
        opts = json.loads(options)
        if not (isinstance(a, int) and 0 <= a < len(opts) and len(opts) >= 2): errors.append(f'{key}: MC contract')
    elif typ == 'true_false':
        if a not in (True, False): errors.append(f'{key}: TF contract')
    elif typ in ('short_answer', 'fill_blank'):
        if not (isinstance(a, list) and a and all(isinstance(x, str) and x.strip() for x in a)): errors.append(f'{key}: text contract')
        if typ == 'fill_blank' and '___' not in question: errors.append(f'{key}: fill no ___')
    elif typ == 'matching':
        if not (isinstance(a, list) and len(a) >= 2 and all(isinstance(p, list) and len(p) == 2 and p[0].strip() and p[1].strip() for p in a)): errors.append(f'{key}: matching contract')
        lefts = [p[0] for p in a]
        if len(set(lefts)) != len(lefts): errors.append(f'{key}: duplicate lefts')
    elif typ == 'essay':
        if a is not None: errors.append(f'{key}: essay must be null')

by_lesson = {}
for r in rows: by_lesson.setdefault(r[0], 0); by_lesson[r[0]] += 1
bad_counts = {k: v for k, v in by_lesson.items() if not (4 <= v <= 7)}
if errors or bad_counts:
    print('VALIDATION FAILED', file=sys.stderr)
    print(json.dumps({'errors': errors[:20], 'bad_counts': bad_counts}, ensure_ascii=False, indent=1), file=sys.stderr)
    sys.exit(1)

# ---------- emit SQL ----------
print('-- seed_exercises.py: v2 exercise rows, additive only. Generated deterministically.')
print('BEGIN;')
for lid, so, typ, question, options, ca, answer in rows:
    print(f"INSERT INTO curriculum_exercises (lesson_id, exercise_type, question, options, correct_answer, sort_order, answer) "
          f"VALUES ('{esc(lid)}', '{typ}', '{esc(question)}', '{options}'::jsonb, {ca}, {so}, '{answer}'::jsonb);")
print('COMMIT;')
print(f'-- rows: {len(rows)} across {len(by_lesson)} lessons', file=sys.stderr)
