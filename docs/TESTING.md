# Panduan Menjalankan Tes — DeutschUp

Dokumen ini menjelaskan cara menjalankan tes di repo ini, variabel lingkungan
yang dibutuhkan, kenapa tes e2e **tidak** menyasar produksi secara default, dan
cara membuat akun uji khusus.

Aturan yang tidak bisa ditawar:

> **Tidak ada email, password, atau nama host produksi yang boleh ditulis di
> dalam file mana pun di bawah `tests/`.** Semuanya masuk lewat environment.
> Meng-clone repo ini tidak boleh cukup untuk bisa login sebagai siapa pun.

---

## 1. Dua lapis tes

| Lapis | Alat | Perintah | Butuh browser? | Butuh akun? |
|---|---|---|---|---|
| Unit / komponen | Vitest + jsdom | `npm run test` | tidak | tidak |
| End-to-end (e2e) | Playwright + Chromium | `npm run test:e2e` | ya | sebagian |

Dua-duanya berdiri sendiri. Tes unit adalah yang wajib hijau sebelum merge;
tes e2e adalah alat verifikasi manual dan belum dijalankan di CI (lihat bagian 8).

---

## 2. Tes unit (Vitest)

```bash
npm run test            # sekali jalan
npm run test:watch      # mode watch saat ngoding
npm run test:coverage   # dengan laporan coverage
```

Konfigurasi: `vitest.config.ts`. Yang diambil hanya `src/**/*.{test,spec}.{ts,tsx}`
— jadi file di `tests/` (punya Playwright) tidak ikut terbawa, dan sebaliknya.

Tes unit tidak menyentuh jaringan, tidak butuh Supabase, tidak butuh Clerk, dan
tidak butuh satu pun variabel lingkungan.

---

## 3. Tes e2e (Playwright)

```bash
npm run test:e2e                       # ke localhost, tanpa login
npx playwright test tests/suites/pricing.spec.ts   # satu file saja
npx playwright test --headed           # lihat browsernya
npx playwright show-report             # buka laporan HTML terakhir
```

Sekali saja di mesin baru (mengunduh binary Chromium):

```bash
npx playwright install chromium
```

**Target default: `http://localhost:5173`.** Kalau belum ada dev server yang
jalan, Playwright menyalakannya sendiri (`npm run dev`) dan mematikannya lagi
setelah selesai. Kalau kamu sudah menjalankan `npm run dev` di terminal lain,
server itu dipakai ulang.

### Prasyarat untuk target lokal

Dev server memuat `.env` milikmu. Kalau `VITE_CLERK_PUBLISHABLE_KEY` tidak ada
di sana, Clerk **dimatikan** (lihat `src/lib/clerk/ClerkProvider.tsx`) — halaman
`/sign-in` tidak menampilkan form, jadi tes yang menyentuh login akan gagal
bukan karena ada bug. Isi kunci itu dulu (kunci *publishable*, bukan rahasia),
atau jalankan hanya spec yang tidak butuh login.

Semua spec ada di `tests/suites/`. Helper bersama ada di `tests/helpers/`:

| File | Isi |
|---|---|
| `tests/helpers/target.ts` | penentuan URL target (dipakai bareng `playwright.config.ts`) |
| `tests/helpers/env.ts` | kredensial dari environment + fungsi skip yang informatif |
| `tests/helpers/auth.ts` | login Clerk + melewati onboarding |

---

## 4. Variabel lingkungan

| Variabel | Wajib? | Default | Fungsi |
|---|---|---|---|
| `E2E_BASE_URL` | tidak | `http://localhost:5173` | Host yang dites. Isi hanya kalau kamu memang sengaja menyasar host lain. |
| `E2E_EMAIL` | untuk tes yang butuh login | — | Email **akun uji**. Jangan akun admin. |
| `E2E_PASSWORD` | untuk tes yang butuh login | — | Password akun uji. |
| `E2E_EDGE_TESTS` | tidak | — | Isi `1` kalau target lokalmu benar-benar menyajikan `/api/*` (misal `wrangler pages dev`). |
| `CI` | tidak | — | Kalau ada: `test.only` ditolak dan dev server tidak dipakai ulang. |

Cara memberikannya (jangan simpan di file yang ikut ter-commit):

```bash
# hanya untuk satu perintah. Spasi di depan baris membuat perintahnya tidak
# tercatat di history, asal shell-mu memakai HISTCONTROL=ignorespace.
 E2E_EMAIL='e2e+bot@contoh.com' E2E_PASSWORD='...' npm run test:e2e
```

Atau taruh di file lokal yang sudah diabaikan git (`.env*` masuk `.gitignore`),
lalu muat manual sebelum menjalankan:

```bash
set -a; source .env.e2e; set +a
npm run test:e2e
```

> Playwright **tidak** memuat `.env` secara otomatis di repo ini. Itu disengaja:
> `.env` berisi kunci produksi, dan tes tidak boleh diam-diam kebagian kunci itu.

---

## 5. Kenapa e2e tidak menyasar produksi secara default

Sebelumnya `playwright.config.ts` memakai `baseURL` produksi dan helper login
memakai email + password akun admin yang ditulis langsung di dalam file. Artinya
siapa pun yang mengetik `npm run test:e2e` akan:

1. login ke situs produksi sebagai admin,
2. mengklik-klik data pengguna sungguhan,
3. sampai menekan tombol pembelian pada halaman `/pricing` — di beberapa spec
   lama, alur pembayaran benar-benar ditembak,
4. dan menyimpan screenshot halaman ber-sesi ke dalam repo.

Sekarang menyasar produksi harus jadi **pilihan sadar**:

```bash
E2E_BASE_URL='https://host-yang-ter-deploy' \
E2E_EMAIL='e2e+bot@contoh.com' \
E2E_PASSWORD='...' \
npm run test:e2e
```

Saat target bukan localhost, konfigurasi mencetak peringatan besar sebelum tes
mulai. Kalau bisa, arahkan ke **preview deployment** Cloudflare Pages, bukan ke
domain produksi.

---

## 6. Membuat akun uji khusus (JANGAN pakai akun admin)

Akun uji harus akun biasa, bukan admin, dan boleh rusak kapan saja.

1. Buka **Clerk Dashboard → Users → Create user**.
2. Pakai alamat sub-address supaya masuk ke inbox yang sama tapi tetap akun
   berbeda, contoh: `namamu+e2e@gmail.com`.
   *Jangan* memakai domain palsu seperti `@deutschup.test` — Clerk bisa menolak
   pengiriman verifikasinya dan akunnya jadi tidak bisa login (ini yang terjadi
   pada akun `e2etest@...` di spec lama).
3. Set password acak yang panjang, simpan di password manager. Password ini
   **tidak boleh** sama dengan password akun mana pun yang lain.
4. Centang email sebagai verified supaya tidak ada langkah OTP saat login.
5. Pastikan email akun ini **tidak** sama dengan `ADMIN_EMAIL` /
   `VITE_ADMIN_EMAIL` di environment produksi — kalau sama, akun itu jadi admin
   dan tes akan mengklik panel admin sungguhan.
6. Login manual sekali lewat `/sign-in` untuk menuntaskan onboarding, supaya
   tes tidak selalu mengulang alur onboarding.
7. Kalau akun uji perlu status Pro, berikan lewat data (`orders` / role), bukan
   dengan menembak alur pembayaran sungguhan.

Setelah itu:

```bash
export E2E_EMAIL='namamu+e2e@gmail.com'
export E2E_PASSWORD='...'
```

Rotasi password akun uji ini kalau pernah tampil di log, screenshot, atau di
laporan CI.

---

## 7. Tes yang dilewati, dan kenapa

Tes tidak pernah gagal hanya karena environment-nya belum lengkap — tapi juga
tidak pernah diam. Setiap yang dilewati mencetak alasannya:

| Grup | Dilewati kalau | Cara menjalankannya |
|---|---|---|
| `Authentication Flow (butuh akun uji)`, `Page Rendering` | `E2E_EMAIL`/`E2E_PASSWORD` kosong | isi kedua variabel itu |
| `API Health`, `Security: HTTP Headers`, `Security: Information Disclosure`, `Security: API Protection`, `Security: Input Validation (API)` | target lokal | pakai host ter-deploy, atau `wrangler pages dev` + `E2E_EDGE_TESTS=1` |
| `Performance: *` | target lokal | sama seperti di atas |

Grup keamanan dilewati di lokal karena yang diperiksa adalah header dari
Cloudflare (`public/_headers`) dan fungsi serverless di `functions/` — dua-duanya
tidak ada di depan dev server Vite. Grup performa dilewati karena dev server
menyajikan modul mentah tanpa CDN, jadi angkanya mengukur dev server, bukan
produk. Menjalankan keduanya di lokal hanya menghasilkan merah palsu yang
lama-lama diabaikan orang.

Yang **tetap jalan** di lokal tanpa akun apa pun: `Landing Page`, `SPA Routing`,
`Pricing (publik)`, `Authentication Flow (publik)`, `UAT`, dan
`Security: Input Validation (SPA)`.

Saat mulai, runner mencetak ringkasan seperti ini:

```
[e2e] target  : http://localhost:5173 (lokal)
[e2e] akun uji: TIDAK ADA — tes yang butuh login akan DILEWATI. ...
```

Baca dua baris itu sebelum percaya hasil "semua hijau".

---

## 8. Status CI

`.github/workflows/test.yml` hanya menjalankan **unit test + build**. Playwright
tidak pernah dijalankan di CI. Jadi jangan pernah menganggap suite e2e sebagai
jaring pengaman otomatis — sampai ada job khusus, e2e adalah alat manual.

Kalau nanti ditambahkan job e2e:

- targetnya **preview deployment**, bukan produksi;
- `E2E_EMAIL` / `E2E_PASSWORD` diisi dari GitHub Secrets, bukan dari file;
- jangan unggah screenshot/trace dari sesi yang sudah login ke artifact publik.

---

## 9. Artefak hasil run

| Path | Isi | Status |
|---|---|---|
| `playwright-report/` | laporan HTML + screenshot | diabaikan git |
| `tests/results/` | trace, screenshot kegagalan | diabaikan git |
| `test-results/`, `blob-report/` | keluaran bawaan Playwright | diabaikan git |

Screenshot diambil **hanya saat gagal** (`screenshot: 'only-on-failure'`). Dulu
setelannya `'on'`, jadi setiap run yang lolos pun menyimpan foto dashboard akun
sungguhan.

Kalau kamu perlu melampirkan screenshot ke laporan bug, periksa dulu isinya:
email pengguna, nama, dan status langganan sering ikut kelihatan.

---

## 10. Catatan sejarah

Direktori `tests/archive/` (38 file) sudah dihapus. Isinya skrip debug sekali
pakai: 36 dari 38 file tanpa satu pun assertion, semuanya menyasar produksi,
memuat email + password akun admin secara literal, dan sebagian menuju rute yang
sudah tidak ada lagi (`/quiz`, `/settings`, `/chat`, `/vocabulary`, `/progress`,
`/admin/users`, `/admin/content`). Yang masih bernilai dipindahkan ke
`tests/suites/`:

- pemeriksaan harga & paket pada `/pricing` → `tests/suites/pricing.spec.ts`;
- halaman `/level/A1` dan pemeriksaan identitas pada `/profile` →
  `tests/suites/pages.spec.ts`.

Menghapus kredensial dari file **tidak** menghapusnya dari riwayat git. Password
apa pun yang pernah ter-commit harus dianggap bocor dan **wajib diganti
sekarang** — termasuk kedua akun admin yang kredensialnya pernah tertulis di
`tests/archive/`. Mengganti passwordnya jauh lebih penting (dan lebih cepat)
daripada menulis ulang riwayat git.
