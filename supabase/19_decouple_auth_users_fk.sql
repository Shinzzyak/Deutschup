-- 19_decouple_auth_users_fk.sql
-- ============================================================================
-- MELEPAS FK ke auth.users — penyelesaian migrasi Clerk di lapisan database.
--
-- MASALAH
-- -------
-- Aplikasi sudah pindah dari Supabase Auth ke Clerk. Identitas Clerk dipetakan
-- di public.user_identities dengan internal_id UUID = gen_random_uuid().
-- UUID itu TIDAK PERNAH ada di auth.users.
--
-- Tetapi hampir semua tabel data pengguna masih menyatakan:
--     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
--
-- Tersebar di supabase/01_tables.sql (7x), 08_curriculum_tables.sql (3x),
-- orders_migration.sql, 06_ai_requests.sql, 17_provider_secrets.sql, dan
-- scripts/setup_db.sql — dan tidak ada satu pun migrasi di repo ini yang
-- pernah mencabutnya.
--
-- AKIBATNYA setiap INSERT untuk pengguna Clerk gagal dengan
--     23503 foreign_key_violation
-- BAHKAN memakai service_role, karena FK ditegakkan di lapisan penyimpanan,
-- bukan di lapisan RLS. Ini berlaku untuk profiles, seluruh tabel progres,
-- notes, study_plans, quick_notes, mock_tests, dan orders.
--
-- CATATAN PENTING: skrip ini menurunkan integritas referensial secara sengaja.
-- Kita TIDAK memasang FK pengganti ke user_identities(internal_id), karena
-- baris warisan dari era Supabase Auth memiliki user_id yang ada di auth.users
-- tetapi TIDAK ada di user_identities — FK baru akan langsung gagal validasi.
-- Penegakan kepemilikan sudah dilakukan di api/db-proxy.ts, yang selalu
-- memakai userId hasil verifikasi Clerk JWT dan tidak pernah percaya klien.
--
-- Jalankan di Supabase SQL Editor. Idempoten: aman dijalankan berulang.
-- ============================================================================


-- ============================================================
-- LANGKAH 0 — DISKOVERI (jalankan sendiri dulu, baca hasilnya)
-- ============================================================
-- Lihat FK apa saja yang SEKARANG benar-benar hidup di database produksi.
-- Repo bukan sumber kebenaran di sini: bisa saja sebagian sudah pernah
-- di-drop manual tanpa tercatat. Jalankan blok ini lebih dulu.

SELECT
  tc.table_name          AS tabel,
  tc.constraint_name     AS nama_constraint,
  kcu.column_name        AS kolom,
  ccu.table_schema || '.' || ccu.table_name AS menunjuk_ke
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
 AND tc.table_schema    = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
 AND ccu.table_schema    = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema    = 'public'
  AND ccu.table_schema   = 'auth'
  AND ccu.table_name     = 'users'
ORDER BY tc.table_name;

-- Kalau hasilnya KOSONG: FK sudah pernah dicabut, tidak perlu lanjut.
-- Kalau ada isinya: itulah penyebab progres tidak pernah tersimpan.


-- ============================================================
-- LANGKAH 1 — CABUT SEMUA FK KE auth.users PADA SCHEMA public
-- ============================================================
-- Dicari secara dinamis, bukan dengan menebak nama constraint. Nama default
-- Postgres (<tabel>_<kolom>_fkey) tidak selalu dipakai kalau tabel pernah
-- dibuat ulang, jadi menebak nama berisiko melewatkan satu-dua.

DO $$
DECLARE
  r RECORD;
  n INT := 0;
BEGIN
  FOR r IN
    SELECT DISTINCT tc.table_name, tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
     AND ccu.table_schema    = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema    = 'public'
      AND ccu.table_schema   = 'auth'
      AND ccu.table_name     = 'users'
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I',
                   r.table_name, r.constraint_name);
    RAISE NOTICE 'dicabut: %.% -> auth.users', r.table_name, r.constraint_name;
    n := n + 1;
  END LOOP;

  IF n = 0 THEN
    RAISE NOTICE 'Tidak ada FK ke auth.users — kemungkinan sudah dicabut sebelumnya.';
  ELSE
    RAISE NOTICE 'Total % FK dicabut.', n;
  END IF;
END $$;


-- ============================================================
-- LANGKAH 2 — INDEKS PENGGANTI
-- ============================================================
-- FK sebelumnya membuat indeks secara implisit di sebagian kasus. Setelah
-- dicabut, pastikan kolom user_id tetap terindeks supaya kueri per-pengguna
-- tidak berubah jadi sequential scan.

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user
  ON public.user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_checkpoint_progress_user
  ON public.user_checkpoint_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user
  ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user
  ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_user
  ON public.quick_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_user
  ON public.study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_tests_user
  ON public.mock_tests(user_id);
-- user_curriculum_progress.user_id sudah PRIMARY KEY, jadi sudah terindeks.


-- ============================================================
-- LANGKAH 3 — VERIFIKASI
-- ============================================================
-- Harus mengembalikan 0 baris.

SELECT
  tc.table_name AS masih_menunjuk_auth_users
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
 AND ccu.table_schema    = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema    = 'public'
  AND ccu.table_schema   = 'auth'
  AND ccu.table_name     = 'users';


-- ============================================================
-- LANGKAH 4 — UJI ASAP (opsional tapi disarankan)
-- ============================================================
-- Membuktikan insert untuk UUID gaya Clerk sekarang benar-benar berhasil.
-- Memakai UUID acak yang dijamin tidak ada di auth.users, lalu dibersihkan.
-- Kalau blok ini lolos tanpa error, penyebab utama sudah hilang.

DO $$
DECLARE
  uji_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO public.user_curriculum_progress (user_id, xp, streak)
  VALUES (uji_id, 0, 0);

  DELETE FROM public.user_curriculum_progress WHERE user_id = uji_id;

  RAISE NOTICE 'OK — insert dengan UUID non-auth.users berhasil. FK sudah tidak menghalangi.';
EXCEPTION
  WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'MASIH GAGAL: FK ke auth.users belum sepenuhnya tercabut.';
  WHEN undefined_column THEN
    RAISE NOTICE 'Kolom xp/streak tidak ada — sesuaikan kolom uji dengan skema sebenarnya.';
END $$;


-- ============================================================
-- CATATAN LANJUTAN
-- ============================================================
-- 1. Setelah ini, jalankan supabase/18_set_admin_role.sql untuk menaikkan
--    role admin pemilik (SETELAH login Google pertama).
--
-- 2. Kebijakan RLS pada tabel-tabel ini masih memakai auth.uid(), yang selalu
--    NULL untuk koneksi service_role maupun untuk klien anon berautentikasi
--    Clerk. Kebijakan itu kini efektif hanya sebagai penolakan menyeluruh bagi
--    akses langsung dari klien — dan itu justru yang kita inginkan, karena
--    seluruh akses seharusnya lewat /api/db-proxy. Jangan melonggarkannya
--    tanpa alasan: melonggarkan RLS berarti membuka tabel ke anon key yang
--    ada di bundle publik.
--
-- 3. Baris warisan era Supabase Auth tetap ada dan user_id-nya tidak terpetakan
--    di user_identities. Pengguna lama tidak akan otomatis melihat progres
--    lamanya setelah login lewat Clerk. Backfill memerlukan pencocokan email
--    antara auth.users dan user_identities — sengaja TIDAK dilakukan di sini
--    karena pencocokan berbasis email perlu keputusan sadar soal email mana
--    yang dianggap tepercaya.
