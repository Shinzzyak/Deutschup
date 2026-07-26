-- 20_checkpoint_kapitel_backfill.sql
-- ============================================================================
-- MEMBUKA JALAN BUNTU PROGRESI: lulus checkpoint tidak membuka apa pun.
--
-- MASALAH 1 — kapitel_id kosong
-- -----------------------------
-- Ke-15 baris curriculum_checkpoints punya kapitel_id = NULL. Seeder-nya
-- memang tidak pernah mengisinya: supabase/09_curriculum_migration.sql
-- meng-INSERT tanpa kolom kapitel_id (11 baris), dan
-- supabase/15_curriculum_alignment_final.sql menuliskan NULL secara eksplisit
-- (4 baris).
--
-- RPC submit_checkpoint di supabase/11_checkpoint_system.sql memakai kolom itu
-- untuk mencari "pelajaran berikutnya":
--
--     SELECT MAX(ccl.sort_order)
--     FROM curriculum_checkpoints ccp
--     JOIN curriculum_lessons ccl ON ccl.kapitel_id = ccp.kapitel_id
--     WHERE ccp.id = p_checkpoint_id
--
-- Dengan kapitel_id NULL, join itu tidak pernah cocok, MAX(...) = NULL, dan
-- syarat `cl.sort_order > NULL` bernilai NULL — bukan true. Subquery tidak
-- mengembalikan baris, UPDATE tidak menyentuh apa pun, dan lulus checkpoint
-- TIDAK membuka pelajaran mana pun. Tidak ada error yang muncul: kegagalannya
-- diam.
--
-- MASALAH 2 — baris checkpoint yang tidak ada
-- -------------------------------------------
-- Peta pelajaran di klien (src/data/lessonIndex.ts) menampilkan 16 checkpoint:
-- {a1,a2,b1,b2}-checkpoint-{1..4}. Produksi hanya punya 15 baris. Menurut seed
-- di repo yang hilang adalah b1-checkpoint-4: 09_ menyeed 11 baris (termasuk
-- b1-checkpoint-1..3) dan 15_ menambahkan 4 baris (checkpoint-4 untuk A1, A2,
-- B2, plus a2-checkpoint-3) — B1 terlewat. 11 + 4 = 15, cocok dengan jumlah
-- baris di produksi. LANGKAH 0c memastikannya langsung ke database.
-- Akibatnya submit_checkpoint('b1-checkpoint-4') gagal dengan
-- 23503 foreign_key_violation pada user_checkpoint_progress.checkpoint_id.
--
-- MASALAH 3 — batas antar level tidak pernah terbuka
-- --------------------------------------------------
-- Blok "buka pelajaran berikutnya" hanya mencari di dalam LEVEL YANG SAMA
-- (JOIN ... ON cl.level_id = cp.level_id). Untuk checkpoint penutup level
-- (a1-checkpoint-4) tidak ada pelajaran A1 setelahnya, jadi tidak ada yang
-- dibuka — a2-1 tidak pernah masuk unlocked_lessons dan current_level_id tidak
-- pernah naik ke 'A2'. Di UI, LevelView menampilkan "Level A2 masih terkunci"
-- karena current_level_id masih 'A1'. Inilah tembok A1 -> A2 di sisi server.
--
-- Jalankan di Supabase SQL Editor, berurutan dari atas.
-- Idempoten: aman dijalankan berulang.
--
-- CATATAN: skrip ini TIDAK bisa saya uji — tidak ada akses ke database saat
-- menulisnya. Jalankan LANGKAH 0 dulu dan baca hasilnya sebelum melanjutkan.
-- ============================================================================


-- ============================================================
-- LANGKAH 0 — DISKOVERI (jalankan sendiri dulu, baca hasilnya)
-- ============================================================
-- Repo bukan sumber kebenaran. Lihat keadaan sebenarnya lebih dulu.

-- 0a. Berapa checkpoint yang kapitel_id-nya masih kosong?
SELECT
  id                                        AS checkpoint,
  level_id                                  AS level,
  kapitel_id                                AS kapitel_sekarang,
  required_score                            AS nilai_lulus,
  jsonb_array_length(COALESCE(review_lessons, '[]'::jsonb)) AS jumlah_review_lessons,
  sort_order
FROM curriculum_checkpoints
ORDER BY level_id, sort_order;

-- 0b. Kapitel mana yang AKAN diisi oleh LANGKAH 1, dan dari pelajaran mana.
--     "kapitel_penutup" = kapitel dari pelajaran ter-akhir (sort_order terbesar)
--     yang di-review checkpoint itu. Itulah kapitel yang ditutup oleh checkpoint
--     tersebut, dan itu yang dibutuhkan RPC untuk menemukan pelajaran sesudahnya.
SELECT
  c.id                                                              AS checkpoint,
  c.level_id                                                        AS level,
  c.kapitel_id                                                      AS kapitel_sekarang,
  (ARRAY_AGG(cl.kapitel_id ORDER BY cl.sort_order DESC))[1]         AS kapitel_penutup_usulan,
  (ARRAY_AGG(cl.id         ORDER BY cl.sort_order DESC))[1]         AS pelajaran_terakhir_direview,
  COUNT(DISTINCT cl.kapitel_id)                                     AS kapitel_tersentuh,
  MAX(cl.sort_order)                                                AS sort_order_review_tertinggi
FROM curriculum_checkpoints c
CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(c.review_lessons, '[]'::jsonb)) AS rl(lesson_id)
JOIN curriculum_lessons cl
  ON cl.id = rl.lesson_id
 AND cl.level_id = c.level_id
WHERE cl.kapitel_id IS NOT NULL
GROUP BY c.id, c.level_id, c.kapitel_id
ORDER BY c.level_id, c.id;

-- PERHATIKAN kolom kapitel_tersentuh. Kalau nilainya > 1, pelajaran yang
-- di-review checkpoint itu melintasi batas kapitel, jadi "kapitel checkpoint"
-- memang ambigu. Berdasarkan data seed di repo, minimal a2-checkpoint-2
-- (review a2-4, a2-5, a2-6) begitu: a2-4 dan a2-5 ada di a2-k2 sementara a2-6
-- ada di a2-k3. Untuk kasus seperti ini LANGKAH 3 tidak lagi bergantung pada
-- kapitel sama sekali — ia memakai sort_order pelajaran yang di-review, yang
-- tepat tanpa perlu menebak kapitel.

-- 0c. Checkpoint yang dipakai klien tetapi TIDAK ADA barisnya di database.
--     Daftar 16 id di bawah persis seperti yang dirender src/data/lessonIndex.ts.
SELECT diminta.id AS checkpoint_hilang_di_database
FROM (
  SELECT lower(lv.id) || '-checkpoint-' || g.n AS id
  FROM curriculum_levels lv
  CROSS JOIN generate_series(1, 4) AS g(n)
) diminta
LEFT JOIN curriculum_checkpoints c ON c.id = diminta.id
WHERE c.id IS NULL
ORDER BY 1;

-- 0d. Nilai lulus yang berbeda dari 0.70. Klien SELALU menilai dengan 0.70
--     (src/lib/checkpointAdapter.ts dan seluruh data checkpoint di lessons.ts),
--     jadi baris apa pun yang bukan 0.70 membuat pengguna melihat "lulus"
--     sementara server mencatat "gagal" — dan unlock tidak terjadi.
SELECT id, level_id, required_score
FROM curriculum_checkpoints
WHERE required_score IS DISTINCT FROM 0.70
ORDER BY id;


-- ============================================================
-- LANGKAH 1 — ISI kapitel_id DARI PELAJARAN YANG DI-REVIEW
-- ============================================================
-- Nilainya diturunkan dari data, bukan ditulis manual: kapitel dari pelajaran
-- dengan sort_order tertinggi di antara review_lessons checkpoint tersebut.
-- Hanya mengisi yang masih NULL — menjalankan ulang tidak akan menimpa nilai
-- yang sudah pernah diperbaiki tangan.

UPDATE curriculum_checkpoints cp
SET kapitel_id = src.kapitel_penutup,
    updated_at = NOW()
FROM (
  SELECT
    c.id AS checkpoint_id,
    (ARRAY_AGG(cl.kapitel_id ORDER BY cl.sort_order DESC))[1] AS kapitel_penutup
  FROM curriculum_checkpoints c
  CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(c.review_lessons, '[]'::jsonb)) AS rl(lesson_id)
  JOIN curriculum_lessons cl
    ON cl.id = rl.lesson_id
   AND cl.level_id = c.level_id
  WHERE cl.kapitel_id IS NOT NULL
  GROUP BY c.id
) src
WHERE cp.id = src.checkpoint_id
  AND cp.kapitel_id IS NULL
  AND src.kapitel_penutup IS NOT NULL;

-- Cadangan: checkpoint yang review_lessons-nya kosong atau menunjuk pelajaran
-- yang tidak ada di curriculum_lessons tidak tersentuh di atas. Untuk itu
-- pakai kapitel terakhir di levelnya — checkpoint tanpa daftar review praktis
-- selalu checkpoint penutup.
UPDATE curriculum_checkpoints cp
SET kapitel_id = (
      SELECT k.id
      FROM kapitel k
      WHERE k.level_id = cp.level_id
      ORDER BY k.sort_order DESC
      LIMIT 1
    ),
    updated_at = NOW()
WHERE cp.kapitel_id IS NULL
  AND EXISTS (SELECT 1 FROM kapitel k WHERE k.level_id = cp.level_id);


-- ============================================================
-- LANGKAH 2 — BUAT BARIS CHECKPOINT YANG DIPAKAI KLIEN TAPI HILANG
-- ============================================================
-- Peta klien menawarkan checkpoint-4 di setiap level. Yang hilang di database
-- (b1-checkpoint-4 menurut seed di repo) dibuat di sini, dengan seluruh nilai
-- diturunkan dari data yang sudah ada: level dari curriculum_levels, kapitel
-- dari kapitel terakhir level itu, review_lessons dari seluruh pelajaran level
-- itu, dan judul mengikuti pola baris checkpoint-4 yang sudah ada
-- ("Review: A1 Gesamt").
--
-- Tanpa baris ini, submit_checkpoint('b1-checkpoint-4') selalu gagal dengan
-- foreign_key_violation dan B1 tidak pernah bisa ditutup.

INSERT INTO curriculum_checkpoints (
  id, level_id, kapitel_id, title, required_score, review_lessons, sort_order, is_published
)
SELECT
  lower(lv.id) || '-checkpoint-4',
  lv.id,
  (SELECT k.id FROM kapitel k WHERE k.level_id = lv.id ORDER BY k.sort_order DESC LIMIT 1),
  'Review: ' || lv.id || ' Gesamt',
  0.70,
  COALESCE(
    (SELECT jsonb_agg(cl.id ORDER BY cl.sort_order)
     FROM curriculum_lessons cl
     WHERE cl.level_id = lv.id),
    '[]'::jsonb
  ),
  4,
  true
FROM curriculum_levels lv
WHERE NOT EXISTS (
  SELECT 1 FROM curriculum_checkpoints c WHERE c.id = lower(lv.id) || '-checkpoint-4'
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- LANGKAH 3 — SAMAKAN NILAI LULUS DENGAN KLIEN (0.70)
-- ============================================================
-- Klien memakai 0.70 untuk SEMUA checkpoint. Baris dengan nilai lain (di repo:
-- b2-checkpoint-4 = 0.75) membuat pengguna melihat layar "Checkpoint
-- terlewati" sementara server menyimpan passed = false, lalu heran kenapa
-- tidak ada yang terbuka. Kalau Anda memang ingin B2 lebih ketat, ubah juga
-- konstanta di src/lib/checkpointAdapter.ts dan LEWATI perintah ini.

UPDATE curriculum_checkpoints
SET required_score = 0.70,
    updated_at = NOW()
WHERE required_score IS DISTINCT FROM 0.70;


-- ============================================================
-- LANGKAH 4 — PERBAIKI RPC submit_checkpoint
-- ============================================================
-- Menggantikan definisi di supabase/11_checkpoint_system.sql. Yang berubah:
--
--   1. Posisi "pelajaran berikutnya" dihitung dari sort_order tertinggi
--      pelajaran yang DI-REVIEW, bukan dari MAX(sort_order) satu kapitel.
--      Ini tepat walau review_lessons melintasi dua kapitel (a2-checkpoint-2),
--      dan tidak bergantung pada kapitel_id sama sekali. LANGKAH 1 tetap
--      berguna: kapitel_id dipakai sebagai cadangan di sini dan oleh kueri
--      lain yang membaca kolom itu.
--   2. Kalau tidak ada pelajaran tersisa di level ini DAN semua checkpoint
--      level ini sudah lulus, pelajaran pertama level berikutnya dibuka dan
--      current_level_id dinaikkan. Inilah yang membuat A1 -> A2 benar-benar
--      terjadi.
--   3. Checkpoint yang tidak ada barisnya ditolak dengan pesan jelas, bukan
--      dengan foreign_key_violation dari tabel progres.
--   4. required_score NULL tidak lagi membuat v_passed bernilai NULL.
--   5. Penggabungan unlocked_lessons dihitung di variabel PL/pgSQL, bukan lewat
--      subquery FROM yang menunjuk kolom baris yang sedang di-UPDATE. Bentuk
--      lama itu adalah referensi luar ke dalam FROM-item, yang ditolak
--      PostgreSQL tanpa LATERAL — dan LATERAL pun tidak menjangkau level query
--      di luarnya.
--
-- Nilai balik tetap memuat passed / score / required / attempts / best_score
-- (dipakai src/stores/progressStore.ts), dengan tambahan next_lesson dan
-- next_level yang bersifat informasional.
--
-- Untuk mengembalikan perilaku lama: jalankan ulang blok submit_checkpoint di
-- supabase/11_checkpoint_system.sql.

CREATE OR REPLACE FUNCTION submit_checkpoint(
  p_user_id UUID,
  p_checkpoint_id TEXT,
  p_score DECIMAL,
  p_total_questions INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_level_id       TEXT;
  v_required_score DECIMAL;
  v_passed         BOOLEAN;
  v_attempts       INTEGER;
  v_best_score     DECIMAL;
  v_review_max     INTEGER;
  v_next_lesson    TEXT;
  v_next_level     TEXT;
  v_level_cleared  BOOLEAN;
  v_unlocked       JSONB;
  v_to_add         JSONB;
BEGIN
  SELECT level_id, COALESCE(required_score, 0.70)
    INTO v_level_id, v_required_score
  FROM curriculum_checkpoints
  WHERE id = p_checkpoint_id;

  IF v_level_id IS NULL THEN
    RAISE EXCEPTION 'Checkpoint % tidak ada di curriculum_checkpoints', p_checkpoint_id
      USING HINT = 'Jalankan LANGKAH 2 pada supabase/20_checkpoint_kapitel_backfill.sql.';
  END IF;

  v_passed := p_score >= v_required_score;

  SELECT attempts, best_score INTO v_attempts, v_best_score
  FROM user_checkpoint_progress
  WHERE user_id = p_user_id AND checkpoint_id = p_checkpoint_id;

  v_attempts   := COALESCE(v_attempts, 0) + 1;
  v_best_score := GREATEST(COALESCE(v_best_score, 0), p_score);

  INSERT INTO user_checkpoint_progress (
    user_id, checkpoint_id, passed, score, attempts, best_score, last_attempt_at
  )
  VALUES (p_user_id, p_checkpoint_id, v_passed, p_score, v_attempts, v_best_score, NOW())
  ON CONFLICT (user_id, checkpoint_id) DO UPDATE SET
    passed          = COALESCE(user_checkpoint_progress.passed, false) OR v_passed,
    score           = p_score,
    attempts        = v_attempts,
    best_score      = v_best_score,
    last_attempt_at = NOW(),
    updated_at      = NOW();

  IF v_passed THEN
    -- (a) Keadaan sekarang, dibaca ke variabel supaya penggabungan array tidak
    --     perlu menunjuk kolom baris yang sedang di-UPDATE dari dalam FROM.
    SELECT COALESCE(unlocked_lessons, '[]'::jsonb) INTO v_unlocked
    FROM user_curriculum_progress
    WHERE user_id = p_user_id;
    v_unlocked := COALESCE(v_unlocked, '[]'::jsonb);

    -- Pelajaran yang di-review selalu dibuka kembali, supaya pengguna bisa
    -- mengulang materinya setelah gagal maupun setelah lulus.
    SELECT COALESCE(review_lessons, '[]'::jsonb) INTO v_to_add
    FROM curriculum_checkpoints
    WHERE id = p_checkpoint_id;
    v_to_add := COALESCE(v_to_add, '[]'::jsonb);

    -- (b) Di mana blok yang baru saja diuji berakhir?
    SELECT MAX(cl.sort_order) INTO v_review_max
    FROM curriculum_checkpoints cp
    CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(cp.review_lessons, '[]'::jsonb)) AS rl(lesson_id)
    JOIN curriculum_lessons cl
      ON cl.id = rl.lesson_id
     AND cl.level_id = cp.level_id
    WHERE cp.id = p_checkpoint_id;

    -- Cadangan lewat kapitel, untuk checkpoint tanpa review_lessons yang valid.
    IF v_review_max IS NULL THEN
      SELECT MAX(cl.sort_order) INTO v_review_max
      FROM curriculum_checkpoints cp
      JOIN curriculum_lessons cl ON cl.kapitel_id = cp.kapitel_id
      WHERE cp.id = p_checkpoint_id;
    END IF;

    -- (c) Pelajaran berikutnya di level yang sama.
    IF v_review_max IS NOT NULL THEN
      SELECT cl.id INTO v_next_lesson
      FROM curriculum_lessons cl
      WHERE cl.level_id = v_level_id
        AND cl.sort_order > v_review_max
      ORDER BY cl.sort_order
      LIMIT 1;
    END IF;

    -- (d) Tidak ada lagi di level ini: buka level berikutnya kalau seluruh
    --     checkpoint level ini sudah lulus. Syaratnya sengaja dibuat sama
    --     dengan can_access_lesson(), supaya unlock dan pemeriksaan akses
    --     tidak pernah berbeda pendapat.
    IF v_next_lesson IS NULL THEN
      SELECT NOT EXISTS (
        SELECT 1
        FROM curriculum_checkpoints c
        WHERE c.level_id = v_level_id
          AND NOT EXISTS (
            SELECT 1
            FROM user_checkpoint_progress ucp
            WHERE ucp.user_id       = p_user_id
              AND ucp.checkpoint_id = c.id
              AND ucp.passed        = true
          )
      ) INTO v_level_cleared;

      IF v_level_cleared THEN
        SELECT nx.id INTO v_next_level
        FROM curriculum_levels cur
        JOIN curriculum_levels nx ON nx.sort_order = cur.sort_order + 1
        WHERE cur.id = v_level_id;

        IF v_next_level IS NOT NULL THEN
          SELECT cl.id INTO v_next_lesson
          FROM curriculum_lessons cl
          WHERE cl.level_id = v_next_level
          ORDER BY cl.sort_order
          LIMIT 1;
        END IF;
      END IF;
    END IF;

    -- (e) Gabungkan dan tulis sekali. jsonb_agg(DISTINCT ...) menyaring
    --     duplikat, jadi menjalankan checkpoint yang sama dua kali tidak
    --     menggandakan isi unlocked_lessons.
    IF v_next_lesson IS NOT NULL THEN
      v_to_add := v_to_add || to_jsonb(v_next_lesson);
    END IF;

    SELECT COALESCE(jsonb_agg(DISTINCT val), v_unlocked) INTO v_unlocked
    FROM jsonb_array_elements_text(v_unlocked || v_to_add) AS t(val);

    UPDATE user_curriculum_progress
    SET unlocked_lessons  = v_unlocked,
        current_lesson_id = COALESCE(current_lesson_id, v_next_lesson),
        current_level_id  = COALESCE(v_next_level, current_level_id),
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'passed',      v_passed,
    'score',       p_score,
    'required',    v_required_score,
    'attempts',    v_attempts,
    'best_score',  v_best_score,
    'next_lesson', v_next_lesson,
    'next_level',  v_next_level
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- LANGKAH 5 — VERIFIKASI
-- ============================================================

-- 5a. Harus 0 baris: tidak ada lagi checkpoint tanpa kapitel.
SELECT id AS checkpoint_masih_tanpa_kapitel
FROM curriculum_checkpoints
WHERE kapitel_id IS NULL
ORDER BY id;

-- 5b. Harus 16 baris (4 level x 4 checkpoint), semuanya punya kapitel.
SELECT level_id, COUNT(*) AS jumlah_checkpoint, COUNT(kapitel_id) AS punya_kapitel
FROM curriculum_checkpoints
GROUP BY level_id
ORDER BY level_id;

-- 5c. Harus 0 baris: semua checkpoint yang dipakai klien ada di database.
SELECT diminta.id AS checkpoint_hilang_di_database
FROM (
  SELECT lower(lv.id) || '-checkpoint-' || g.n AS id
  FROM curriculum_levels lv
  CROSS JOIN generate_series(1, 4) AS g(n)
) diminta
LEFT JOIN curriculum_checkpoints c ON c.id = diminta.id
WHERE c.id IS NULL
ORDER BY 1;

-- 5d. Ke mana setiap checkpoint akan mengantar setelah lulus? Kolom
--     "membuka_berikutnya" TIDAK BOLEH kosong untuk checkpoint tengah level,
--     dan untuk checkpoint penutup level ia harus berisi pelajaran pertama
--     level berikutnya (a1-checkpoint-4 -> a2-1). b2-checkpoint-4 boleh kosong
--     karena B2 adalah level terakhir.
WITH batas AS (
  SELECT
    c.id AS checkpoint_id,
    c.level_id,
    MAX(cl.sort_order) AS review_max
  FROM curriculum_checkpoints c
  CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(c.review_lessons, '[]'::jsonb)) AS rl(lesson_id)
  JOIN curriculum_lessons cl
    ON cl.id = rl.lesson_id
   AND cl.level_id = c.level_id
  GROUP BY c.id, c.level_id
)
SELECT
  b.checkpoint_id,
  b.level_id,
  b.review_max,
  COALESCE(
    (SELECT cl.id FROM curriculum_lessons cl
      WHERE cl.level_id = b.level_id AND cl.sort_order > b.review_max
      ORDER BY cl.sort_order LIMIT 1),
    (SELECT cl.id FROM curriculum_lessons cl
      JOIN curriculum_levels cur ON cur.id = b.level_id
      JOIN curriculum_levels nx  ON nx.sort_order = cur.sort_order + 1
      WHERE cl.level_id = nx.id
      ORDER BY cl.sort_order LIMIT 1)
  ) AS membuka_berikutnya
FROM batas b
ORDER BY b.level_id, b.checkpoint_id;

-- 5e. Uji asap tanpa menyentuh data pengguna sungguhan: seorang pengguna uji
--     melulusi SELURUH checkpoint A1, lalu kita periksa apakah a2-1 terbuka
--     dan current_level_id naik ke 'A2'. Semua barisnya dihapus lagi di akhir.
--     CATATAN: blok ini butuh FK ke auth.users sudah dicabut — jalankan
--     supabase/19_decouple_auth_users_fk.sql lebih dulu, kalau belum.
DO $$
DECLARE
  uji_id     UUID := gen_random_uuid();
  v_cp       TEXT;
  v_hasil    JSONB;
  v_unlocked JSONB;
  v_level    TEXT;
BEGIN
  INSERT INTO user_curriculum_progress (user_id, current_level_id, unlocked_lessons, xp, streak)
  VALUES (uji_id, 'A1', '["a1-1"]'::jsonb, 0, 0);

  FOR v_cp IN
    SELECT id FROM curriculum_checkpoints WHERE level_id = 'A1' ORDER BY sort_order
  LOOP
    v_hasil := submit_checkpoint(uji_id, v_cp, 1.0, 10);
    RAISE NOTICE '% -> %', v_cp, v_hasil;
  END LOOP;

  SELECT unlocked_lessons, current_level_id INTO v_unlocked, v_level
  FROM user_curriculum_progress WHERE user_id = uji_id;

  RAISE NOTICE 'unlocked = %', v_unlocked;
  RAISE NOTICE 'current_level_id = %', v_level;

  IF jsonb_exists(v_unlocked, (SELECT id FROM curriculum_lessons WHERE level_id = 'A2' ORDER BY sort_order LIMIT 1)) THEN
    RAISE NOTICE 'OK — pelajaran pertama A2 terbuka setelah seluruh checkpoint A1 lulus.';
  ELSE
    RAISE WARNING 'MASIH BUNTU — A2 tidak terbuka. Periksa hasil 5d di atas.';
  END IF;

  DELETE FROM user_checkpoint_progress  WHERE user_id = uji_id;
  DELETE FROM user_curriculum_progress  WHERE user_id = uji_id;
EXCEPTION
  WHEN OTHERS THEN
    DELETE FROM user_checkpoint_progress WHERE user_id = uji_id;
    DELETE FROM user_curriculum_progress WHERE user_id = uji_id;
    RAISE;
END $$;


-- ============================================================
-- CATATAN LANJUTAN
-- ============================================================
-- 1. curriculum_lessons hanya memuat sebagian pelajaran yang ditampilkan peta
--    klien: 58 baris di produksi versus 70 unit pelajaran di
--    src/data/lessonIndex.ts. Konsekuensinya, unlock server berhenti di
--    pelajaran terakhir yang ADA di tabel. Selama urutan peta tetap diambil
--    dari courseIndex, ini tidak menghalangi progresi (LevelView membuka
--    checkpoint begitu unit sebelumnya selesai) — tetapi menyeed sisa pelajaran
--    akan membuat can_access_lesson dan unlock jauh lebih akurat. Kueri
--    pembanding:
--      SELECT level_id, COUNT(*) FROM curriculum_lessons GROUP BY level_id;
--
-- 2. review_lessons pada a1-checkpoint-4 dan a2-checkpoint-4 berhenti di
--    pelajaran ke-14, sementara peta klien punya 26 pelajaran A1 dan 18 A2.
--    Daftar itu hanya dipakai untuk (i) membuka kembali materi ulangan dan
--    (ii) menghitung batas "pelajaran berikutnya", jadi tidak merusak apa pun.
--    Perbaiki bersamaan dengan poin 1 kalau tabel pelajaran dilengkapi.
--
-- 3. RLS pada tabel curriculum_* memakai auth.uid() yang selalu NULL di
--    lingkungan Clerk. Seluruh pemanggilan tetap harus lewat /api/db-proxy
--    dengan service_role. Jangan melonggarkan RLS di sini.
