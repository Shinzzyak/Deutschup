-- 09_curriculum_migration.sql
-- Seed curriculum tables from current in-memory data
-- Date: 2026-06-12
-- Run AFTER 08_curriculum_tables.sql
-- ============================================================

-- 1. SEED LEVELS
INSERT INTO curriculum_levels (id, title, description, sort_order)
VALUES
  ('A1', 'A1 - Pemula', 'Bahasa Jerman dasar: sapaan, artikel, angka, kalimat sederhana', 1),
  ('A2', 'A2 - Dasar', 'Kasus Nominativ/Akkusativ/Dativ, Perfekt, trennbare Verben', 2),
  ('B1', 'B1 - Menengah', 'Genitiv, Relativsätze, Konjunktiv II, Passiv, Futur', 3),
  ('B2', 'B2 - Mahir', 'Partizipalkonstruktionen, Modalpartikeln, Wissenschaftsstil, Goethe B2 Prep', 4)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED KAPITEL
INSERT INTO kapitel (id, level_id, title, sort_order)
VALUES
  ('a1-k1', 'A1', 'Sapaan & Dasar', 1),
  ('a1-k2', 'A1', 'Kata & Warna', 2),
  ('a1-k3', 'A1', 'Kalimat & Lokasi', 3),
  ('a1-k4', 'A1', 'Kehidupan Sehari-hari', 4),
  ('a2-k1', 'A2', 'Kasus & Deklinasi', 1),
  ('a2-k2', 'A2', 'Waktu Lampau', 2),
  ('a2-k3', 'A2', 'Preposisi & Perbandingan', 3),
  ('a2-k4', 'A2', 'Verben Lanjutan', 4),
  ('b1-k1', 'B1', 'Genitiv & Relativsätze', 1),
  ('b1-k2', 'B1', 'Passiv & Konjungsi', 2),
  ('b1-k3', 'B1', 'Infinitiv & Adjektiv', 3),
  ('b1-k4', 'B1', 'Wortbildung & Tenses', 4),
  ('b2-k1', 'B2', 'Partizip & Relativsätze Lanjutan', 1),
  ('b2-k2', 'B2', 'Gaya Tulisan & Pelaporan', 2),
  ('b2-k3', 'B2', 'Idiom & Fachvokabular', 3),
  ('b2-k4', 'B2', 'Persiapan Ujian Goethe B2', 4)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED LESSONS (structural metadata only — content stays in lessons.ts for now)
-- A1 Lessons
INSERT INTO curriculum_lessons (id, level_id, kapitel_id, title, sort_order, can_do_goals) VALUES
  ('a1-1', 'A1', 'a1-k1', 'Perkenalan & Salam', 1, '["Memperkenalkan diri","Mengeja nama","Mengucapkan salam","Menjawab kabar","Formal vs informal"]'),
  ('a1-2', 'A1', 'a1-k1', 'Artikel: Der, Die, Das', 2, '["Gender kata benda","Artikel pasti","Artikel tidak pasti","Kata ganti orang"]'),
  ('a1-3', 'A1', 'a1-k1', 'Angka 1-100 & Umur', 3, '["Berhitung 1-100","Menyatakan umur","Nomor telepon","Harga dalam Euro"]'),
  ('a1-4', 'A1', 'a1-k2', 'Warna, Hari, Bulan', 4, '["Nama hari","Nama bulan","Warna benda","Pertanyaan Wann?"]'),
  ('a1-5', 'A1', 'a1-k2', 'Kata Ganti Orang', 5, '["Personalpronomen subjek","Orang ketiga","Ihr vs Sie"]'),
  ('a1-6', 'A1', 'a1-k2', 'Konjugasi sein & haben', 6, '["Konjugasi sein","Konjugasi haben","Kalimat deskripsi"]'),
  ('a1-7', 'A1', 'a1-k3', 'Kalimat Sederhana', 7, '["Kalimat pernyataan","W-Fragen","Ja/Nein-Fragen","Posisi 2 verb"]'),
  ('a1-8', 'A1', 'a1-k3', 'Preposisi Dasar', 8, '["Preposisi tempat","Posisi benda","Lokasi Dativ/Akkusativ"]'),
  ('a1-9', 'A1', 'a1-k3', 'Keluarga & Pekerjaan', 9, '["Anggota keluarga","Profesi","Possessivartikel"]'),
  ('a1-10', 'A1', 'a1-k4', 'Makanan & Belanja', 10, '["Jenis makanan","Pesan makanan","Percakapan belanja","Kelaparan"]'),
  ('a1-11', 'A1', 'a1-k4', 'Waktu dan Jam', 11, '["Menyebut jam","Janji temu","Waktu sibuk/luang"]'),
  ('a1-12', 'A1', 'a1-k4', 'Hobi & Waktu Luang', 12, '["Ceritakan hobi","Kata gern","Bertanya hobi"]'),
  ('a1-13', 'A1', 'a1-k4', 'Cuaca dan Musim', 13, '["Deskripsi cuaca","Empat musim","Cuaca kesukaan"]')
ON CONFLICT (id) DO NOTHING;

-- A2 Lessons
INSERT INTO curriculum_lessons (id, level_id, kapitel_id, title, sort_order, can_do_goals) VALUES
  ('a2-1', 'A2', 'a2-k1', 'Kasus Nominativ vs Akkusativ', 1, '["Subjek vs Objek","Artikel Akkusativ","Verba Akkusativ"]'),
  ('a2-2', 'A2', 'a2-k1', 'Kasus Dativ', 2, '["Objek tidak langsung","Artikel Dativ","Verba Dativ"]'),
  ('a2-3', 'A2', 'a2-k1', 'Modal Verben', 3, '["Können/müssen/wollen/dürfen","Satzklammer","Konjugasi modal"]'),
  ('a2-4', 'A2', 'a2-k2', 'Perfekt', 4, '["Cerita masa lalu","haben vs sein","Partizip II"]'),
  ('a2-5', 'A2', 'a2-k2', 'Präteritum', 5, '["sein/haben lampau","Modal Präteritum","Perfekt vs Präteritum"]'),
  ('a2-6', 'A2', 'a2-k3', 'Wechselpräpositionen', 6, '["9 Wechselpräpositionen","Dativ lokasi","Akkusativ arah"]'),
  ('a2-7', 'A2', 'a2-k3', 'Komparativ & Superlativ', 7, '["Membandingkan","Tingkatan tertinggi","Irregular adjektif"]'),
  ('a2-8', 'A2', 'a2-k4', 'Trennbare Verben', 8, '["Prefix terpisah","Posisi prefix","Aktivitas harian"]'),
  ('a2-9', 'A2', 'a2-k4', 'W-Fragen Lanjutan', 9, '["W-Fragen kasus","Wer vs Wen vs Wem","Wo vs Wohin"]'),
  ('a2-10', 'A2', 'a2-k4', 'Negasi: nicht vs kein', 10, '["Posisi nicht","Kein/keine","Penekanan kalimat"]'),
  ('a2-11', 'A2', 'a2-k4', 'Verba Refleksif', 11, '["Reflexivverben","Reflexivpronomen","Rutinitas"]'),
  ('a2-12', 'A2', 'a2-k4', 'Preposisi Tetap & Pronominaladverbien', 12, '["Preposisi terkunci","Pronominaladverbien","Minat/memori"]'),
  ('a2-13', 'A2', 'a2-k4', 'Nebensätze', 13, '["Klausa anak","weil/wenn","Pengandaian dass"]')
ON CONFLICT (id) DO NOTHING;

-- B1 Lessons
INSERT INTO curriculum_lessons (id, level_id, kapitel_id, title, sort_order, can_do_goals) VALUES
  ('b1-1', 'B1', 'b1-k1', 'Kasus Genitiv', 1, '["Kepemilikan formal","Deklinasi artikel Genitiv","Preposisi Genitiv"]'),
  ('b1-2', 'B1', 'b1-k1', 'Relativsätze', 2, '["Anak kalimat relatif","Kata ganti relatif","Kasus relatif"]'),
  ('b1-3', 'B1', 'b1-k1', 'Konjunktiv II', 3, '["Pengandaian","würde + Infinitiv","Kesopanan tinggi"]'),
  ('b1-4', 'B1', 'b1-k2', 'Passiv', 4, '["Subjek vs pelaku","Aktif → Passiv","Präsens & Präteritum"]'),
  ('b1-5', 'B1', 'b1-k2', 'Zweiteilige Konjunktionen', 5, '["Konjungsi ganda","Entweder...oder","Nicht nur...sondern"]'),
  ('b1-6', 'B1', 'b1-k2', 'Indirekte Rede', 6, '["Tutur langsung/tidak","Tanpa tanda kutip","Persepsi"]'),
  ('b1-7', 'B1', 'b1-k3', 'Infinitivkonstruktionen', 7, '["zu + Infinitiv","um...zu","ohne...zu"]'),
  ('b1-8', 'B1', 'b1-k3', 'Adjektivdeklination', 8, '["Deklinasi adjektif","Schwache Deklination","Starke Deklination"]'),
  ('b1-9', 'B1', 'b1-k3', 'Futur I & II', 9, '["Prediksi masa depan","werden + Infinitiv","Futur II"]'),
  ('b1-10', 'B1', 'b1-k4', 'Wortbildung', 10, '["Komposita","Präfixe/Suffixe","Tebak arti kata"]'),
  ('b1-11', 'B1', 'b1-k4', 'Plusquamperfekt', 11, '["Past Perfect","hatten/waren + Partizip","Kronologis lampau"]'),
  ('b1-12', 'B1', 'b1-k4', 'n-Deklination', 12, '["Maskulin n-Deklination","Sufiks n/en","Kata internasional"]')
ON CONFLICT (id) DO NOTHING;

-- B2 Lessons
INSERT INTO curriculum_lessons (id, level_id, kapitel_id, title, sort_order, can_do_goals) VALUES
  ('b2-1', 'B2', 'b2-k1', 'Partizipalkonstruktionen', 1, '["Atribut padat akademik","Partizip I aktif","Partizip II pasif"]'),
  ('b2-2', 'B2', 'b2-k1', 'Erweiterte Relativsätze', 2, '["Kalimat nominal","Struktur partisipial","Sintaksis formal"]'),
  ('b2-3', 'B2', 'b2-k1', 'Modalpartikeln', 3, '["doch/mal/ja/eben","Nada bicara","Natural native"]'),
  ('b2-4', 'B2', 'b2-k2', 'Wissenschaftlicher Schreibstil', 4, '["Gaya ilmiah","Passiversatz","Persiapan DaF"]'),
  ('b2-5', 'B2', 'b2-k2', 'Konjunktiv I', 5, '["Indirekte Rede formal","Reportase netral","Fallback ke KII"]'),
  ('b2-6', 'B2', 'b2-k2', 'Komplexe Satzstrukturen', 6, '["Schachtelsätze","Nebensätze berlapis","Reading comprehension"]'),
  ('b2-7', 'B2', 'b2-k3', 'Idiome & Redewendungen', 7, '["Idiom populer","Terjemahan kiasan","Bukan harfiah"]'),
  ('b2-8', 'B2', 'b2-k3', 'Fachvokabular', 8, '["Terminologi medis/hukum/bisnis","Resume terminologi","Investigasi leksikon"]'),
  ('b2-9', 'B2', 'b2-k3', 'Textanalyse & Argumentation', 9, '["Debat formal","Dafür/Dagegen","Opini tajam"]'),
  ('b2-10', 'B2', 'b2-k4', 'Persiapan Goethe B2', 10, '["Modul ujian","Lesen/Hören/Schreiben/Sprechen","Tips hemati waktu"]'),
  ('b2-11', 'B2', 'b2-k4', 'Nomen-Verb-Verbindungen', 11, '["Kombinasi Noun-Verb","Frase tinggi","Birokrasi formal"]'),
  ('b2-12', 'B2', 'b2-k4', 'Passiversatzformen', 12, '["sich lassen","Suffix -bar/-lich","sein + zu + infinitiv"]')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED CHECKPOINTS
INSERT INTO curriculum_checkpoints (id, level_id, title, required_score, review_lessons, sort_order) VALUES
  ('a1-checkpoint-1', 'A1', 'Review: Salam, Artikel, Angka', 0.70, '["a1-1","a1-2","a1-3"]', 1),
  ('a1-checkpoint-2', 'A1', 'Review: Kata Ganti, Konjugasi, Warna', 0.70, '["a1-4","a1-5","a1-6"]', 2),
  ('a1-checkpoint-3', 'A1', 'Review: Kalimat, Preposisi, Keluarga', 0.70, '["a1-7","a1-8","a1-9"]', 3),
  ('a2-checkpoint-1', 'A2', 'Review: Kasus, Modal Verben', 0.70, '["a2-1","a2-2","a2-3"]', 1),
  ('a2-checkpoint-2', 'A2', 'Review: Perfekt, Wechselpräp', 0.70, '["a2-4","a2-5","a2-6"]', 2),
  ('b1-checkpoint-1', 'B1', 'Review: Genitiv, Relativ, Konjunktiv II', 0.70, '["b1-1","b1-2","b1-3"]', 1),
  ('b1-checkpoint-2', 'B1', 'Review: Passiv, Konjungsi, Indirekte Rede', 0.70, '["b1-4","b1-5","b1-6"]', 2),
  ('b1-checkpoint-3', 'B1', 'Review: Infinitiv, Adjektiv, Futur', 0.70, '["b1-7","b1-8","b1-9"]', 3),
  ('b2-checkpoint-1', 'B2', 'Review: Partizip, Relativ, Modalpartikeln', 0.70, '["b2-1","b2-2","b2-3"]', 1),
  ('b2-checkpoint-2', 'B2', 'Review: Schreibstil, Konjunktiv I, Schachtelsätze', 0.70, '["b2-4","b2-5","b2-6"]', 2),
  ('b2-checkpoint-3', 'B2', 'Review: Idiom, Fachvokab, Argumentation', 0.70, '["b2-7","b2-8","b2-9"]', 3)
ON CONFLICT (id) DO NOTHING;
