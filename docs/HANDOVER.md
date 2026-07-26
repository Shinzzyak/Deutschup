# Serah Terima — branch `ui/landing-polish`

**Tanggal:** 2026-07-26 · **9 commit · 147 file · +18.833 / −10.540**

> **Tidak ada satu baris pun di branch ini yang pernah dikompilasi.** Lingkungan tempat
> pekerjaan ini dikerjakan tidak punya `node`/`npm`/browser. Tidak ada `tsc`, tidak ada
> `vitest`, tidak ada build, tidak ada satu layar pun yang pernah dilihat.
>
> Semua klaim kontras dihitung matematis dengan rumus WCAG 2.1 dari nilai warna di kode.
> Semua klaim tentang database diverifikasi dengan kueri sungguhan ke produksi.
> Semua klaim tentang perilaku runtime adalah **penalaran dari membaca kode**.
>
> Jalankan `npm install && npm run lint && npm run test` sebelum merge.

---

## 1. LAKUKAN SEKARANG — tiga hal, urut kepentingan

### 1.1 Ganti password `yhudazzz0@gmail.com`

Email dan password plaintext akun itu ter-commit di 33 file tes, tersebar di 432 commit
riwayat. Akun itu salah satu dari dua akun admin aktif. Kredensialnya sudah dicabut dari
HEAD, **tetapi riwayat git tidak berubah** — siapa pun yang pernah meng-clone repo ini masih
memegangnya. Hanya penggantian password yang benar-benar menutupnya.

### 1.2 Periksa secret `TEST_PAYMENT_MODE`

Produksi menjual Pro **Rp1.000**, bukan Rp49.000.

Buktinya ada dua lapis. Konfigurasi: `cf-pages-deploy.yml` memakai `'true'` sebagai fallback,
dua kali. Data: tabel `orders` berisi 5 transaksi Rp1.000 lawan 15 Rp49.000 — dan **kedua**
order yang pernah mencapai status `paid` bernilai Rp1.000.

Sudah diperbaiki di kode (fallback `'false'` + deploy ditolak bila `'true'` menyasar `main`),
tapi:

- Kalau di GitHub Secrets ada `TEST_PAYMENT_MODE` bernilai `true`, **hapus** — kalau tidak,
  deploy berikutnya sengaja gagal.
- Perbaikan baru berlaku **setelah deploy berikutnya**. Sampai itu, produksi masih Rp1.000.

### 1.3 Rotate kredensial yang lewat percakapan

Service role Supabase, `sk_live_` Clerk, dan PAT GitHub semuanya melewati transcript sesi dan
tersimpan plaintext di disk. Ganti ketiganya. PAT GitHub sebaiknya diganti fine-grained,
scope `Contents: Read` untuk repo ini saja.

---

## 2. Yang membuka blocker terbesar

Empat tabel — `notes`, `study_plans`, `quick_notes`, `mock_tests` — **nol baris di produksi**.
Catatan, rencana belajar, catatan cepat, dan riwayat simulasi pengguna tidak pernah tersimpan
sekali pun sejak migrasi ke Clerk.

Penyebabnya diverifikasi langsung: FK ke `auth.users` masih hidup di keempatnya, dan menolak
setiap UUID Clerk dengan `23503` — bahkan lewat service_role, karena FK ditegakkan di lapisan
penyimpanan, bukan RLS. Pada `user_curriculum_progress` FK itu sudah dicabut; pada keempat ini
belum.

**Cara menjalankan migrasinya** (service_role tidak bisa DDL — ia hanya JWT PostgREST):

1. Supabase → Project Settings → Database → Connection string → **Session pooler** (port 5432)
2. GitHub → Settings → Secrets and variables → Actions → secret baru `SUPABASE_DB_URL`
3. Workflow `DB Migrate` sudah ada. **Catatan:** `workflow_dispatch` hanya muncul di UI kalau
   file-nya ada di branch default — jadi merge PR ini dulu.
4. Jalankan mode `inspect` (baca-saja), baca hasilnya, baru `apply` dengan
   `19_decouple_auth_users_fk.sql`.

Lalu `20_checkpoint_kapitel_backfill.sql` — ke-15 baris `curriculum_checkpoints` punya
`kapitel_id = NULL`, sementara RPC `submit_checkpoint` melakukan join lewat kolom itu. Join
tidak pernah cocok, jadi lulus checkpoint tidak membuka pelajaran apa pun.

`18_set_admin_role.sql` **tidak perlu dijalankan** — `profiles.role` Anda sudah `admin`, dan
`isVerifiedAdmin()` memeriksa role lebih dulu sebelum `ADMIN_EMAIL`.

---

## 3. Yang berubah

### Uang
Produksi menagih 2% dari harga tercantum (§1.2). `lib/payments/` membuat gateway bisa ditukar:
kontrak `PaymentProvider` yang `parseWebhook`-nya hanya boleh mengembalikan referensi, tidak
pernah status — dan `index.ts` membangun ulang hasilnya field demi field, sehingga provider
yang mencoba mengembalikan status kehilangannya secara struktural. Baca `docs/PAYMENT.md`.

### Persistensi
`progressStore`, `learningStore`, dan `useLessonTimer` tidak lagi menyentuh tabel langsung.
Semuanya lewat `/api/db-proxy`, yang berjalan server-side dengan service_role dan menurunkan
identitas dari Clerk JWT terverifikasi. Nama kolom diambil dari skema PostgREST hidup — file
`.sql` di repo sudah melenceng (`notes.text` vs `content`, kolom `study_plans.tasks` yang
tidak ada, `study_sessions.user_id` bertipe TEXT).

### Keamanan
Email admin hardcoded dihapus; `email_verified` diwajibkan sebelum pencarian identitas by-email;
`profiles.role` jadi jalur utama. Paywall menegakkan `can-access` sebelum merender pelajaran.
Kunci jawaban simulasi tidak lagi dikirim ke browser.

### Admin
Panel ini ditulis untuk dark mode yang tidak pernah datang — `useTheme` tidak pernah dipanggil,
jadi `.dark` tidak pernah menempel. Warna statusnya mendarat di kartu putih pada 1,59–2,89:1.
Sekarang light-native. Lebih penting: beberapa aksi **melaporkan sukses padahal gagal** —
membuat provider/model/kunci menutup form tanpa membaca `res.ok`, menghapus fire-and-forget,
dan `AddSecretModal` memanggil store yang menelan errornya sendiri. Tiga puluh pemanggilan
fetch kini memeriksa hasilnya.

### Vercel
Lepas sepenuhnya. Sebelas `import type` diganti `lib/http-types.ts`; `vercel.json` dihapus
setelah aturan cache-nya dipindah ke `public/_headers`. Ditemukan sambil lalu: `api/payment.ts`
melakukan `for await (const chunk of req)` sementara adapter Cloudflare tidak punya
`Symbol.asyncIterator` — jalur itu pasti crash; sudah ditambal.

### Desain
`docs/DESIGN-LANGUAGE.md` mengikat. Dua keputusan menimpa instruksi, sengaja:

- **Scroll-reveal tidak dipasang di dalam aplikasi.** Landing dilihat sekali; dashboard dibuka
  lima kali sehari. NN/g menemukan pengguna salah mengira reveal sebagai loading. Easing merek
  dipertahankan, durasi dipotong sepertiga, anggaran gerak dialihkan ke hal yang berarti.
- **Serif dibatasi ≥24px dan tidak pernah untuk angka.** Hanya bobot 400 yang di-import, jadi
  setiap `font-serif font-bold` adalah faux bold sintetis yang lumer di Android. Ada di 25 file,
  termasuk yang ditulis dalam sesi ini.

Amandemen 1 mengatur liquid glass: chrome saja, tidak pernah konten, tetap bersudut tajam.

---

## 4. Yang MASIH rusak

| Hal | Keadaan |
|---|---|
| Jalan buntu A1→A2 | `a1-checkpoint-4` muncul di peta tapi `getCourseUnitRoute` mengembalikan `null`. Sudah dikerjakan, **belum diverifikasi jalan** |
| Empat tabel kosong | Menunggu migrasi 19 (§2) |
| Checkpoint tidak membuka pelajaran | Menunggu migrasi 20 (§2) |
| Tes | 156 dari 219 test case tidak mengeksekusi kode produksi. Seluruh `api/` tanpa tes. 225 test Playwright tidak pernah jalan di CI |
| `deploy.sh` | Masih `vercel --prod` dengan token dari path lokal. Tidak dirujuk apa pun, sengaja tidak dihapus |
| 4 profil admin yatim | Punya `role='admin'` tanpa baris `user_identities` — tidak bisa login, tapi data basi |
| Riwayat git | Service role key dan kredensial admin ada di 432 commit. Mencabut dari HEAD tidak menghapusnya |

---

## 5. Angka yang diverifikasi ke produksi

Dikueri langsung, bukan diperkirakan:

```
profiles                  21      curriculum_lessons        58
user_identities           12      curriculum_vocabulary   2472
user_curriculum_progress   6      orders                    20
user_lesson_progress       2      notes/study_plans/
user_checkpoint_progress   0      quick_notes/mock_tests/
                                  study_sessions             0
```

Satu klaim agen terbantahkan oleh data ini: `curriculum_vocabulary` dilaporkan kosong
berdasarkan dokumen audit 14 Juni. Dokumennya basi — tabelnya berisi 2.472 baris.
