# PAYMENT.md — Panduan Pembayaran DeutschUp

> Untuk pemilik repo. Ditulis 26 Juli 2026.
> Isi: cara kerja pembayaran sekarang, cara mengganti gateway, cara menjalankan
> jalur QRIS manual, dan apa yang harus dipastikan sebelum uang sungguhan lewat.

---

## Ringkasan 60 detik

| Pertanyaan | Jawaban |
|---|---|
| Gateway aktif sekarang | **Bayar.gg**, lewat `PAYMENT_PROVIDER` yang belum diset (default `bayargg`) |
| Harga | Rp49.000 / 30 hari. **Rp1.000 kalau `TEST_PAYMENT_MODE=true`** — lihat §9, ini sedang aktif di produksi |
| Ganti gateway | Tambah 1 file di `lib/payments/`, daftarkan di `lib/payments/index.ts`, set `PAYMENT_PROVIDER`. **`api/payment.ts` tidak perlu disentuh** |
| Aturan keamanan inti | Status pembayaran **hanya** boleh datang dari `verifyCharge()`. Body webhook cuma boleh dipakai untuk mengambil ID |
| Jalur "kosong dulu" | `PAYMENT_PROVIDER=manual` — QRIS statis + konfirmasi admin. Sisi server sudah jadi, **UI-nya belum** (§5) |
| Rekomendasi jangka menengah | **Midtrans** (0,7%, tanpa biaya tetap, menerima perorangan) — §7 |

**Peta file:**

```
lib/payments/types.ts     kontrak PaymentProvider + aturan keamanan (baca komentarnya)
lib/payments/bayargg.ts   implementasi Bayar.gg (pindahan dari api/payment.ts, perilaku sama persis)
lib/payments/manual.ts    QRIS statis + konfirmasi admin
lib/payments/index.ts     pemilih provider + pagar pengaman parseWebhook
api/payment.ts            HTTP handler. Tidak tahu apa-apa soal gateway mana pun
```

---

## 1. Alur pembayaran sekarang, langkah demi langkah

### 1.1 Membuat tagihan — `POST /api/payment?action=create`

```
Browser (halaman Pricing)
  │  Authorization: Bearer <token Clerk>
  │  body: { planType: 'pro', ... }
  ▼
api/payment.ts
  1. OPTIONS?                       -> 200, selesai
  2. bukan POST?                    -> 405 Method not allowed
  3. getVerifiedIdentity(req)       -> userId + email DARI TOKEN, bukan dari body
     tidak ada identitas?           -> 401 Unauthorized — token required
  4. rate limit 5 permintaan/menit per IP
     lewat batas?                   -> 429 Too many requests
  5. planType di-normalisasi ke daftar paket yang boleh dijual ('pro')
  6. harga ditentukan SERVER: TEST_PAYMENT_MODE ? 1000 : 49000
  7. getPaymentProvider()           -> provider aktif (env PAYMENT_PROVIDER)
  8. provider.createCharge({ amount, planType, description, customer*, callbackUrl, redirectUrl })
        gateway menolak             -> 400 Payment gateway error
        jawaban gateway tidak jelas -> 502 Payment gateway unavailable
        env/kredensial kurang       -> 500 Payment gateway misconfigured
        jaringan mati               -> 500 Internal server error (lewat catch terluar)
  9. INSERT orders { id: providerRef, user_id, plan_type, status:'pending', amount, payment_method }
        gagal                       -> 500 Failed to save order
 10. 200 { url, invoice_id, amount, expires_at }
```

Tiga hal penting di sini, jangan diubah tanpa alasan kuat:

- **`userId` dan `email` datang dari token, bukan dari body.** Body boleh berisi
  `userId` apa pun; server mengabaikannya. Ini yang mencegah orang membelikan Pro
  untuk akun orang lain — atau lebih tepatnya, mencegah orang menaruh tagihan
  Rp49.000 atas nama akun orang lain lalu mengambil aksesnya.
- **Harga dihitung di server.** Browser tidak pernah mengirim nominal.
- **`orders.id` = `providerRef`.** Satu baris order per percobaan bayar.

### 1.2 Menerima konfirmasi — `POST /api/payment?action=callback`

Ini bagian yang paling gampang salah, jadi urutannya dijaga ketat:

```
Gateway (atau siapa pun — URL ini publik)
  │  body: { invoice_id: "...", status: "paid", ... }   <- status DIABAIKAN
  ▼
api/payment.ts
  1. bukan POST?                        -> 405
  2. rate limit 20/menit per IP         -> 429
  3. body bukan objek JSON?             -> 400 Invalid webhook payload
  4. provider.parseWebhook()            -> AMBIL ID SAJA
        tidak ada ID / bentuknya aneh   -> 200 { message: 'Ignored' }
  5. SELECT orders WHERE id = <ID>      <- pagar lokal
        error DB                        -> 500 Internal server error
        order tidak ada                 -> 202 Not paid yet     (kita tidak kenal tagihan ini)
        order sudah 'paid'              -> 200 Already processed (IDEMPOTEN)
  6. provider.verifyCharge(<ID>)        <- SATU-SATUNYA SUMBER KEBENARAN
        kredensial hilang               -> 500 Payment gateway misconfigured
        gateway tak terjangkau          -> 502 Failed to verify payment with gateway
        status != 'paid'                -> 202 Not paid yet
  7. cocokkan nominal: verifikasi.amount vs orders.amount
        beda                            -> 400 Amount verification failed
  8. UPDATE profiles   { tier, subscription, tier_expiry, pro_expires_at = now + 30 hari }
        gagal                           -> 500 Failed to update profile
  9. UPDATE orders     { status:'paid', paid_at, payment_method, paid_reff_num }
        gagal                           -> hanya dicatat di log, tidak membatalkan akses
 10. notifikasi Discord (tidak memblokir)
 11. 200 { success: true }
```

**Kenapa langkah 5 (pagar lokal) ada sebelum langkah 6.**
Tanpa itu, siapa pun bisa memaksa server kita menembak API gateway berkali-kali
dengan ID karangan — endpoint kita berubah jadi alat probe/DoS ke akun gateway
kita sendiri. Dengan pagar itu, ID yang tidak pernah kita buat langsung dibuang.

**Kenapa langkah 4 dan 6 dipisah tegas.**
Ini inti seluruh desain. Body webhook adalah **klaim**, bukan bukti. URL callback
itu publik; siapa pun bisa POST `{"invoice_id":"X","status":"paid"}`. Yang bisa
dilakukan penyerang paling jauh cuma **memaksa server kita bertanya ke gateway
soal tagihan X**, dan gateway akan menjawab "pending". Klaim di body tidak pernah
menyentuh keputusan apa pun.

Aturan itu ditegakkan oleh kode, bukan cuma oleh komentar:
`lib/payments/index.ts → readWebhookRef()` membangun ulang hasil `parseWebhook()`
field demi field dan **membuang** apa pun selain `providerRef`. Provider baru yang
"tidak sengaja" mengembalikan `status` tetap tidak bisa membobol aturannya.

### 1.3 Apa yang didapat pembeli

`pro_expires_at = sekarang + 30 hari`, **ditimpa, bukan ditambahkan**. Bayar dua
kali dalam sebulan = tetap 30 hari dari pembayaran terakhir, bukan 60 hari.
Ini perilaku yang sudah berjalan; kalau mau diubah jadi perpanjangan, ubah di
`api/payment.ts` langkah 8 (`Math.max(sisa_lama, sekarang) + 30 hari`).

---

## 2. Kontrak yang WAJIB dipenuhi gateway apa pun

Gateway boleh diganti; lima hal berikut tidak boleh hilang. Kalau sebuah penyedia
tidak bisa memenuhi nomor 1 dan 2, **jangan dipakai untuk langganan** — apa pun
tarifnya.

### 2.1 Verifikasi status di sisi server (WAJIB)

Harus ada endpoint yang bisa kita panggil sendiri, dengan kredensial kita, yang
menjawab "tagihan ini sudah dibayar atau belum". Contoh:

| Gateway | Endpoint status |
|---|---|
| Bayar.gg | `GET /api/check-payment.php?invoice=...` |
| Midtrans | `GET /v2/{order_id}/status` |
| Duitku | `POST /webapi/api/merchant/transactionStatus` |
| Tripay | `GET` detail transaksi / check-status |
| QRIS statis | **tidak ada** — karena itu ada provider `manual` |

Di kode: `verifyCharge()`. Aturannya **fail closed** — kalau jawaban tidak bisa
diparse, HTTP-nya error, atau kata statusnya tidak dikenali, kembalikan
`'pending'`. Jangan pernah menebak ke arah `'paid'`.

Perhatikan juga: pemetaan status di `bayargg.ts` sengaja **case-sensitive**.
Hanya string persis `'paid'` yang membuka langganan. `"PAID"` tidak. Kalau sebuah
gateway memang mengirim huruf besar, tulis itu eksplisit di `mapStatus()` provider
tersebut — jangan menormalisasi dengan `.toLowerCase()` di jalur generik, karena
itu memperluas himpunan string yang bisa membuka akses.

### 2.2 Verifikasi signature (kalau tersedia — lapis kedua, bukan pengganti)

| Gateway | Cara |
|---|---|
| Midtrans | `SHA512(order_id + status_code + gross_amount + ServerKey)` == `signature_key` |
| Tripay | `HMAC-SHA256(raw body, private key)` == header `X-Callback-Signature` |
| Duitku | signature sesuai spesifikasi endpoint |
| Xendit | header `x-callback-token` |
| Bayar.gg | body callback **tidak ditandatangani** — makanya §2.1 jadi satu-satunya pengaman |

Tiga jebakan:

1. **Hitung HMAC dari byte mentah**, bukan dari hasil `JSON.parse()` lalu
   `JSON.stringify()` ulang. Re-serialisasi mengubah spasi dan urutan key →
   signature tidak akan pernah cocok.
2. **Bandingkan constant-time** (`crypto.subtle` / `timingSafeEqual`), bukan `===`.
3. **Signature yang valid tetap tidak berarti "sudah dibayar".** Signature cuma
   membuktikan pengirimnya gateway. Statusnya tetap diambil dari §2.1.

> ⚠️ **Catatan teknis yang harus dibereskan sebelum memakai gateway ber-signature.**
> `WebhookRequest.rawBody` sudah ada di kontrak, tapi di Cloudflare Pages nilainya
> saat ini `undefined` pada jalur cepat: adaptor sudah mem-parse body lebih dulu.
> Perbaikannya satu baris di `functions/lib/http-adapter.ts` — variabel `rawBody`
> sudah ada di scope fungsi `toApiRequest()`, tinggal disertakan di objek yang
> di-`return`:
>
> ```ts
> return { method: request.method, url: request.url, headers, query, body, rawBody, cookies: {}, ... };
> ```
>
> `api/payment.ts` sudah membaca `req.rawBody` kalau ada, jadi setelah baris itu
> ditambahkan, provider mana pun langsung menerima body mentahnya.

### 2.3 Idempotensi

Webhook **akan** datang lebih dari sekali. Midtrans saja me-retry sampai 5x
(2 / 10 / 30 / 90 / 210 menit) kalau endpoint kita tidak menjawab cepat.

Yang sudah ada sekarang: `if (order.status === 'paid') return 'Already processed'`
sebelum verifikasi. Itu menutup kasus umum.

Yang **belum** ada dan sebaiknya ditambah kalau volume naik: kunci idempotensi di
level database, bukan di level aplikasi, supaya dua webhook yang datang bersamaan
tidak lolos berbarengan.

```sql
CREATE TABLE payment_events (
  id          BIGSERIAL PRIMARY KEY,
  gateway     TEXT NOT NULL,
  order_id    TEXT NOT NULL,
  status      TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (gateway, order_id, status)   -- ini yang mencegah double-grant
);
```

Pakai `UNIQUE constraint`, jangan `SELECT ... IF NOT EXISTS ... INSERT` (race
condition). Perlakukan status sebagai state machine satu arah:
`pending → paid → fulfilled`. Sekali `paid`, event `pending` yang datang telat
**diabaikan**, bukan menimpa.

> Catatan realitas: tabel itu **belum dibuat**, dan `orders` masih punya FK ke
> `auth.users` (lihat `supabase/19_decouple_auth_users_fk.sql` yang belum
> dijalankan). Kalau nanti membuat `payment_events`, **jangan** bikin FK ke
> `auth.users` — DeutschUp memakai Clerk, dan `auth.uid()` selalu NULL di sini.

### 2.4 Pencocokan nominal

```
bandingkan integer rupiah, JANGAN float
bandingkan terhadap nominal yang TERSIMPAN DI DATABASE KITA, bukan yang datang di request
kurang bayar  -> TOLAK, jangan beri akses
lebih bayar   -> tandai untuk penanganan manual
mata uang     -> pastikan IDR kalau gateway multi-currency
```

Di kode: `verifyCharge()` mengembalikan `amount` (opsional), `api/payment.ts`
membandingkannya dengan `orders.amount`. Kalau gateway tidak melaporkan nominal,
kembalikan `undefined` — **jangan** menggemakan balik nominal kita sendiri, karena
itu memalsukan verifikasi yang sebenarnya tidak terjadi (provider `manual` memberi
contoh, dan alasannya ditulis di komentar).

### 2.5 Callback yang tidak pernah datang

Ini **pasti** terjadi: deploy pas webhook dikirim, jaringan putus, gateway error.
Wajib ada dua jaring pengaman:

**(a) Poller rekonsiliasi**

```
Setiap 2 menit:
  ambil semua order status='pending' berumur 3 menit – 24 jam
  untuk masing-masing: provider.verifyCharge(id)
  proses lewat jalur yang SAMA dengan webhook (idempotensi menangani duplikasi)
```

Di DeutschUp poller ini **belum ada**. Bentuk paling murah tanpa infrastruktur
baru: Cloudflare Cron Trigger atau GitHub Actions terjadwal yang mem-POST
`/api/payment?action=callback` dengan `{"invoice_id": "<id>"}` untuk tiap order
pending. Endpoint-nya sudah idempoten dan sudah memverifikasi ulang ke gateway,
jadi "menembak ulang callback" itu aman — itu memang desainnya.

**(b) Cek terakhir sebelum menandai kedaluwarsa**
Jangan pernah menandai order `expired` hanya berdasarkan timer lokal. Panggil
status API sekali lagi tepat sebelum expiry.

**(c) Settlement terlambat**
Uang bisa masuk *setelah* kita menandai expired. Butuh keputusan produk tertulis:
berikan akses retroaktif, atau refund. Jangan biarkan kasus ini tidak tertangani —
ini sumber komplain nomor satu.

### 2.6 Rekonsiliasi harian

Signature + status API mencegah penipuan. **Rekonsiliasi mencegah kerugian diam-diam.**

```
Setiap hari, untuk D-1:
  A = SUM(settlement menurut laporan/dashboard gateway)
  B = SUM(orders yang ditandai paid di database kita)
  C = mutasi masuk sungguhan ke rekening bank

  A == B ?  -> beda = webhook hilang, atau double-grant
  A ≈ C  ?  -> selisih harus persis MDR + biaya payout
```

Ada satu lubang yang layak dicatat sekarang: kalau `INSERT orders` gagal setelah
tagihan berhasil dibuat di gateway (langkah 9 di §1.1 → 500 Failed to save order),
tagihan itu **ada di gateway tapi tidak ada di database kita**. Kalau pembeli
terlanjur membayarnya, callback-nya akan ditolak di langkah 5 dengan 202 dan
uangnya masuk tanpa akses diberikan. Rekonsiliasi harian adalah satu-satunya cara
menemukan kasus ini.

---

## 3. CHECKLIST: menambah gateway baru

Contoh: Midtrans. Waktu realistis: setengah hari kerja + waktu tunggu verifikasi
akun.

### Langkah 1 — Buat file provider

Buat `lib/payments/midtrans.ts`. Salin kerangka dari `bayargg.ts`. Yang wajib
diimplementasikan hanya tiga method:

```ts
export const midtransProvider: PaymentProvider = {
  id: 'midtrans',

  async createCharge(input) {
    // - Midtrans MEWAJIBKAN kita yang membuat order_id. Bikin di sini
    //   (crypto.randomUUID), jangan pakai counter, dan kembalikan sebagai providerRef.
    // - order_id TIDAK BOLEH dipakai ulang. Satu order_id per PERCOBAAN bayar.
    // - POST /v2/charge  { payment_type: 'qris', transaction_details: { order_id, gross_amount } }
    // - Auth: Basic base64(ServerKey + ':')
    // - QR-nya ada di actions[] -> 'generate-qr-code'
    // - Lempar PaymentProviderError('rejected'|'unavailable'|'misconfigured', ...)
    //   supaya kode HTTP-nya konsisten dengan provider lain.
  },

  async verifyCharge(providerRef) {
    // GET /v2/{order_id}/status
    // settlement/capture -> 'paid' | expire -> 'expired' | deny/cancel -> 'failed' | sisanya -> 'pending'
    // amount: Number(String(gross_amount).split('.')[0])  <- gross_amount berupa "49000.00"
    // Fail closed: apa pun yang meragukan -> 'pending'
  },

  parseWebhook(req) {
    // Verifikasi signature_key DI SINI kalau mau (butuh rawBody, lihat §2.2),
    // lalu kembalikan { providerRef: body.order_id }.
    // JANGAN kembalikan status. Tidak pernah. Tidak dalam bentuk apa pun.
  },
};
```

### Langkah 2 — Daftarkan

`lib/payments/index.ts`:

```ts
import { midtransProvider } from './midtrans.js';

const REGISTRY: Record<string, PaymentProvider> = {
  bayargg: bayarGgProvider,
  manual: manualProvider,
  midtrans: midtransProvider,   // <- satu baris
};
```

### Langkah 3 — Set env var

Di Cloudflare Pages → Settings → Environment variables (lihat §8):

```
PAYMENT_PROVIDER=midtrans
MIDTRANS_SERVER_KEY=<secret>
MIDTRANS_BASE_URL=https://api.sandbox.midtrans.com   (produksi: https://api.midtrans.com)
```

Nama env baru itu urusan file provider-nya sendiri; `api/payment.ts` tidak perlu
tahu. **Jangan pernah** menaruh server key dengan awalan `VITE_` — apa pun yang
berawalan `VITE_` ikut ter-bundle ke JavaScript browser.

### Langkah 4 — Daftarkan URL callback di dashboard gateway

```
https://deutschup.sintec.my.id/api/payment?action=callback
```

Hanya HTTPS. Kalau gateway menyediakan daftar IP, allowlist juga.

### Langkah 5 — Uji di sandbox SEBELUM go-live

Yang wajib diuji, bukan cuma jalur bahagia:

- [ ] bayar sukses → order jadi `paid`, `profiles.pro_expires_at` = +30 hari
- [ ] bayar kurang dari nominal → **ditolak**, akses tidak diberikan
- [ ] tagihan kedaluwarsa → tetap `pending`, tidak pernah jadi `paid`
- [ ] webhook dikirim **dua kali** → order tidak diproses dua kali (cek log
      "Already processed", dan pastikan `pro_expires_at` tidak bergeser)
- [ ] webhook palsu: `curl -d '{"invoice_id":"<id order asli>","status":"paid"}'`
      → harus **202 Not paid yet**. Kalau ini memberi akses, hentikan semuanya.
- [ ] webhook dengan ID yang tidak dikenal → 202, dan **tidak ada** panggilan
      keluar ke gateway
- [ ] signature salah (kalau gateway pakai signature) → ditolak
- [ ] webhook tidak pernah dikirim → jalankan poller/tembak ulang callback secara
      manual, akses tetap bisa diberikan
- [ ] `PAYMENT_PROVIDER` diisi nama ngawur → 500, **bukan** diam-diam jatuh balik
      ke gateway lama (ini sengaja: lihat `getPaymentProvider()`)

### Langkah 6 — Go-live

- [ ] `TEST_PAYMENT_MODE` = `false` (§9 — ini sedang `true`)
- [ ] kredensial produksi terpasang sebagai **secret**, bukan plain text
- [ ] satu transaksi sungguhan Rp1.000–Rp49.000 dari HP sendiri, cek uangnya
      benar-benar masuk ke rekening
- [ ] rekonsiliasi hari pertama: jumlah di dashboard gateway == jumlah `orders`
      berstatus `paid` == mutasi rekening
- [ ] provider lama dibiarkan di repo minimal 1 siklus penagihan (buat rollback
      dan buat menutup tagihan yang masih pending di gateway lama)

### Langkah 7 — Rollback

Ganti `PAYMENT_PROVIDER` kembali ke nilai lama, redeploy. Tidak ada perubahan kode
yang perlu dibatalkan. Itulah gunanya seluruh abstraksi ini.

---

## 4. Yang TIDAK boleh dilakukan saat menambah provider

Daftar ini pendek karena tiap barisnya sudah pernah bikin orang kehilangan uang.

| Jangan | Kenapa |
|---|---|
| Mengembalikan `status` dari `parseWebhook()` | Body webhook itu klaim publik. Ini setara dengan membiarkan siapa pun menulis "sudah bayar" |
| Memberi akses berdasarkan signature yang valid saja | Signature membuktikan pengirim, bukan pembayaran |
| Memakai `.toLowerCase()` pada status di jalur generik | Memperluas himpunan string yang bisa membuka akses |
| Menggemakan nominal kita sendiri sebagai `verification.amount` | Memalsukan pengecekan nominal |
| Membalas non-200 untuk webhook duplikat | Memicu retry yang tidak perlu |
| Menaruh secret di env berawalan `VITE_` | Ikut ter-bundle ke JS browser |
| `console.log` seluruh payload gateway di produksi | Membocorkan email pelanggan dan data tagihan |
| Menandai `expired` hanya dari timer lokal | Uang bisa masuk sesudahnya |
| Memakai `order_id` berurutan (`INV-1`, `INV-2`) | Bisa ditebak, dan membocorkan volume penjualan |

---

## 5. Provider `manual` — QRIS statis + konfirmasi admin

> Ini jalur "pembayaran kosong dulu" yang jujur: pengguna tetap bisa membayar,
> sistem tidak berbohong soal otomatisasi, dan tidak ada akses yang diberikan
> tanpa ada manusia yang benar-benar melihat mutasi.

### 5.1 🚨 Status: sisi server SUDAH, UI BELUM

**Jangan set `PAYMENT_PROVIDER=manual` di produksi sekarang.**

Halaman Pricing saat ini hanya tahu satu hal: kalau respons `create` berisi `url`,
redirect ke sana; kalau tidak, tampilkan pesan error. Provider `manual` **tidak**
mengembalikan `url` (memang tidak ada halaman checkout), jadi hari ini pengguna
akan melihat "Pesanan pembayaran belum bisa dibuat" padahal ordernya berhasil
dibuat — dan setiap klik meninggalkan satu baris `orders` berstatus `pending`.

### 5.2 Yang dikembalikan server (kontrak untuk UI)

`POST /api/payment?action=create` dengan `PAYMENT_PROVIDER=manual`:

```jsonc
{
  "invoice_id": "MANUAL-8f0a2b1c-....",
  "amount": 49000,
  "expires_at": "2026-07-27T12:00:00.000Z",   // ADVISORY. Tidak ada yang meng-expire otomatis
  "payment": {
    "mode": "manual_transfer",
    "qrImageUrl": "https://.../qris.png",     // dari env MANUAL_QRIS_IMAGE_URL
    "qr_string": "00020101021126...",         // dari env MANUAL_QRIS_PAYLOAD (opsional)
    "accountLabel": "QRIS DeutschUp",
    "contact": "wa.me/62xxx",
    "instructions": [
      "Buka aplikasi e-wallet atau m-banking kamu, lalu scan kode QRIS di atas.",
      "Masukkan nominal tepat Rp49.000. Nominal yang berbeda tidak bisa kami proses otomatis.",
      "Simpan bukti pembayaran, lalu kirim ke <kontak> beserta kode pesanan di bawah.",
      "Kode pesanan kamu: MANUAL-8f0a2b1c-....",
      "Admin akan mengaktifkan akun Pro kamu secara manual, maksimal 24 jam setelah bukti diterima."
    ],
    "note": "Pembayaran ini dikonfirmasi manual oleh admin, bukan otomatis. ..."
  }
}
```

Tidak ada `url`. Itu disengaja.

### 5.3 Yang harus dibangun di UI (belum dikerjakan)

Di `src/pages/Pricing.tsx`, pada `handleUpgrade()`:

1. Setelah `const data = await res.json()`, **cek `data.payment` lebih dulu**,
   sebelum cek `data.url`. Kalau ada, jangan redirect — buka panel/modal instruksi.
2. Panel menampilkan: gambar QR (`payment.qrImageUrl`), nominal, daftar
   `payment.instructions` apa adanya (sudah bahasa Indonesia, siap render),
   `payment.note`, dan tombol **salin kode pesanan** (`invoice_id`) — kode itu
   satu-satunya cara admin mencocokkan pembayaran dengan akun.
3. Sediakan tombol/tautan ke `payment.contact` untuk mengirim bukti.
4. Jangan tampilkan hitung mundur yang seolah membatalkan otomatis. `expires_at`
   itu janji layanan, bukan mekanisme.
5. Setelah panel ditutup, halaman Profil/Pricing sebaiknya menampilkan order
   `pending` beserta kode pesanannya, supaya pengguna bisa menemukannya lagi.
   (`db-proxy?action=get-orders` sekarang **hanya mengembalikan order berstatus
   `paid`** — kalau mau menampilkan yang pending, action itu perlu diperluas.)

Jangan menampilkan kalimat seperti "Pro aktif otomatis setelah bayar". Tidak
otomatis. Katakan apa adanya: maksimal 24 jam setelah bukti diterima.

### 5.4 Runbook admin — mengaktifkan pembayaran manual

Prasyarat: akses SQL Supabase (service role). Ini sengaja tidak dibuatkan tombol
di UI admin: satu-satunya hal yang mengamankan jalur ini adalah bahwa penandanya
hanya bisa ditulis oleh orang yang punya akses database.

```sql
-- 1. Cari ordernya. Cocokkan dengan kode pesanan yang dikirim pembeli,
--    lalu cocokkan nominal + waktu dengan mutasi sungguhan di aplikasi QRIS.
SELECT id, user_id, amount, status, created_at
FROM orders
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 20;

-- 2. Tulis PENANDA konfirmasi: nomor referensi/RRN dari mutasi asli.
--    Penulisan baris inilah yang berfungsi sebagai "otorisasi".
--    Statusnya BIARKAN 'pending' — jangan diubah manual jadi 'paid',
--    karena langkah 3 yang memberi akses Pro-nya.
UPDATE orders
SET paid_reff_num = '<RRN / referensi dari mutasi asli>'
WHERE id = '<KODE_PESANAN>' AND status = 'pending';
```

```bash
# 3. Picu pemenuhan. Endpoint ini idempoten dan tetap memverifikasi ulang
#    (untuk provider manual, "verifikasi" = membaca penanda di langkah 2).
curl -X POST 'https://deutschup.sintec.my.id/api/payment?action=callback' \
     -H 'Content-Type: application/json' \
     -d '{"invoice_id":"<KODE_PESANAN>"}'
# Harapan: {"success":true}
# Kalau {"success":true,"message":"Not paid yet"} -> penanda di langkah 2 belum tersimpan.
```

```sql
-- 4. Verifikasi hasilnya.
SELECT o.id, o.status, o.paid_at, p.subscription, p.pro_expires_at
FROM orders o JOIN profiles p ON p.id = o.user_id
WHERE o.id = '<KODE_PESANAN>';
-- status='paid', subscription='pro', pro_expires_at = sekarang + 30 hari
```

**Kenapa aman meski endpoint callback-nya publik?** Karena langkah 3 tidak
memutuskan apa pun. Ia cuma bilang "coba periksa ulang order X". Yang memutuskan
adalah `verifyCharge()`, dan untuk provider manual sumber kebenarannya adalah
kolom `paid_reff_num` yang hanya bisa ditulis lewat service role. Orang asing yang
menebak-nebak kode pesanan akan selalu dapat `202 Not paid yet`.

### 5.5 Batas jujur jalur manual

- Tidak ada rekonsiliasi otomatis. Kamu yang jadi rekonsiliasinya.
- Tidak skalabel. Di ~20 pelanggan/bulan masih wajar; di 100 sudah menyiksa.
- Bukti transfer berupa screenshot **bisa diedit** dan **bisa dipakai ulang**.
  Cocokkan selalu ke mutasi sungguhan di aplikasi, bukan ke screenshot.
- Nominal bisa salah ketik pembeli. Kalau kurang, jangan aktifkan.
- Tidak ada refund otomatis, tidak ada dispute handling.
- QRIS statis pribadi/UMI yang dipakai menampung pendapatan SaaS komersial adalah
  misrepresentasi kategori merchant — risiko pemblokiran akun ada di §6.

---

## 6. QRIS statis vs dinamis, dan penilaian jujur atas trik "statis → dinamis"

### 6.1 Definisi menurut Bank Indonesia

| Mode | Cara kerja | Nominal |
|---|---|---|
| **MPM Statis** | Merchant memajang **satu** QR yang sama selamanya | **Tidak ada di payload.** Pembeli mengetik sendiri |
| **MPM Dinamis** | Perangkat/API menghasilkan QR **baru per transaksi** | **Ter-embed**, pembeli tidak bisa mengubah |
| **CPM** | Pembeli menampilkan QR, merchant yang scan | Diinput di sisi merchant |

> Koreksi miskonsepsi yang beredar luas: **MPM ≠ statis dan CPM ≠ dinamis.**
> MPM punya dua varian. CPM adalah dimensi berbeda (siapa yang men-scan).

Dasar regulasi: **PADG No. 3/2025** (19 Feb 2025), sebelumnya PADG 24/1/PADG/2022
dan 21/18/PADG/2019; **PBI No. 23/6/PBI/2021** soal Penyedia Jasa Pembayaran.
Batas nominal QRIS: **maksimal Rp10.000.000 per transaksi**.

### 6.2 Kenapa QRIS dinamis wajib lewat PJP/acquirer

**(a) Regulatif.** BI: *"PJP dan Lembaga Switching yang melaksanakan kegiatan
pemrosesan Transaksi QRIS wajib terlebih dahulu memperoleh persetujuan dari Bank
Indonesia."* Hanya PJP front-end (Penerbit/Acquirer) yang boleh menerbitkan QR
code QRIS. Merchant bukan penerbit.

**(b) Arsitektural — transaksi harus terdaftar SEBELUM dibayar.**

```
1. Server kita → acquirer: "buat QR untuk invoice INV-8891, Rp49.000"
2. Acquirer    → mendaftarkan transaksi, mengembalikan qr_string + transaction_id
                 yang TERIKAT ke order_id kita
3. Pembeli     → scan, bayar
4. Acquirer    → webhook: "INV-8891 settlement"
5. Server kita → GET /status/INV-8891 untuk konfirmasi ulang
```

Langkah 2 mustahil tanpa acquirer: yang menyimpan pemetaan
`transaction_id ↔ order_id` adalah sistem acquirer, bukan QR-nya.

**(c) Operasional.** QR itu data pasif. Tidak ada mekanisme di dalam QR yang bisa
memberi tahu server kita bahwa pembayaran terjadi. Satu-satunya yang tahu adalah
acquirer.

### 6.3 Yang TIDAK bisa dilakukan dengan QRIS statis

Semua pembayaran masuk ke **NMID yang sama lewat QR yang sama**. Tidak ada satu
pun field di payload yang membawa `user_id` atau `invoice_id`. Yang tersimpan di
acquirer hanya `(nominal, timestamp, nama pembayar, RRN)`.

| Masalah | Akibat untuk langganan Rp49.000 |
|---|---|
| Tabrakan nominal | Semua pelanggan bayar Rp49.000. Dua orang dalam 10 menit yang sama → tidak terbedakan |
| Tidak ada order_id | Tidak ada cara memetakan pembayaran ke akun mana pun |
| Tidak ada webhook | Tidak ada callback ke server; hanya notifikasi ke HP/dashboard |
| Nominal bisa salah | Pembeli mengetik sendiri → Rp4.900, Rp490.000 |
| Tidak ada expiry | QR statis berlaku selamanya |
| Tidak ada refund | Midtrans: *"No refunds currently supported for static QRIS"* |

Midtrans mendokumentasikan batasan ini terang-terangan: nominal tidak ditentukan
merchant, **tidak ada API creation**, order ID di-generate sistem dalam format
`QRIS-xxx`, verifikasi hanya lewat dashboard MAP.

Workaround yang sering dicoba, dan kenapa gagal:

| Workaround | Kenapa tidak layak |
|---|---|
| Nominal unik (49.001, 49.002, …) | Butuh tabel reservasi + lock + TTL; ruang kode habis di volume kecil; pembeli tetap bisa salah ketik; dan kita tetap tidak punya feed transaksi untuk mencocokkannya |
| Cocokkan nama pembayar | Nama dari issuer tidak konsisten, tidak selalu ada, dan bukan identitas akun DeutschUp |
| Tag 62-05 (Reference Label) | QR statis dari dashboard bank umumnya tidak menyertakannya, dan aplikasi issuer tidak menyediakan input untuk pembeli mengisinya |
| Upload bukti transfer | Bukan otomatis. Rentan screenshot editan / dipakai ulang |

### 6.4 Penilaian jujur: repo "QRIS statis jadi dinamis"

Repo seperti `verssache/qris-dinamis`, `DioSaputra28/qris-statis-to-dinamis`,
`AmmarrBN/Qris-Dynamic`, `Adytm404/qris-dinamis-generator`,
`dpangestuw/Qris-Statis-to-Dinamis` — dan endpoint `POST /api/qris-convert.php`
milik Bayar.gg — semuanya melakukan hal yang sama: memodifikasi string TLV EMVCo
secara langsung.

```
1. Parse payload QRIS statis jadi struktur TLV
2. Ubah tag 01: "11" (statis) → "12" (dinamis)
3. Sisipkan tag 54: nominal
4. (opsional) Sisipkan tag 55/56/57: "biaya layanan"
5. Hitung ulang tag 63: CRC16-CCITT (poly 0x1021, init 0xFFFF)
6. Render ulang jadi QR image
```

**Yang perlu dipahami:** NMID di tag 26–51 **tidak berubah**. QR hasil konversi
tetap mengarah ke merchant yang sama lewat acquirer yang sama. Yang berubah hanya
nominal yang tampil di aplikasi pembeli.

#### 🔴 Risiko #1 — Rekonsiliasi tetap TIDAK terpecahkan (ini yang fatal)

Menyuntikkan nominal ke QR **sama sekali tidak** menyelesaikan §6.3. Server kita
tetap: tidak terdaftar sebagai pihak dalam transaksi, tidak menerima callback,
tidak punya `order_id` yang dikenal acquirer, dan tidak tahu SIAPA yang membayar.

Yang hilang cuma risiko salah ketik nominal. Masalah identitas — yang justru inti
dari langganan — utuh tidak tersentuh.

**Bukti empiris:** repo `alrescha79-cmd/bot-vpn` memakai library konverter
`@agungjsp/qris-dinamis`, lalu untuk verifikasi pembayaran **jatuh kembali ke
persetujuan manual admin atas screenshot yang diupload user**. Dokumentasinya
mengakui: *"Manual Verification: Admin harus approve setiap deposit"*.

Itulah **plafon jujur** teknik ini — dan plafon itu persis sama dengan yang sudah
diberikan provider `manual` di repo ini, **tanpa** menyentuh payload QRIS sama
sekali. Untuk mendapat otomasi, orang lalu men-scrape mutasi rekening lewat
kredensial aplikasi merchant, dan di situlah risiko sesungguhnya dimulai (#4).

#### 🔴 Risiko #2 — Legalitas

**Yang jelas melanggar: penyisipan tag 55/56/57 (biaya layanan).** BI menyatakan
tanpa ambiguitas: *"Besarnya biaya MDR ini ditanggung oleh merchant dan tidak
boleh dibebankan kepada konsumen."* Membebankan "biaya layanan" ke pembeli lewat
tag 55/57 **adalah surcharge yang dilarang**. Sanksi: teguran tertulis, PJP wajib
menghentikan kerja sama, sampai masuk daftar hitam sistem pembayaran digital.

**Wilayah abu-abu: penerbitan QR itu sendiri.** Menandatangani ulang payload QRIS
di luar sistem acquirer bukan jalur penerbitan yang disanksikan regulator. Tidak
ditemukan ketentuan BI yang secara eksplisit mempidanakan merchant yang menambah
nominalnya sendiri ke QR miliknya sendiri — jadi jangan mengklaim ini "ilegal".
Tapi juga **tidak ditemukan** dasar yang menyatakannya sah. Klaim "tidak ilegal"
yang beredar di forum berasal dari opini pengguna media sosial, **bukan dari BI**.

**Risiko klasifikasi merchant.** QRIS pribadi/UMI (MDR 0% untuk ≤Rp500.000) yang
dipakai menampung pendapatan SaaS komersial adalah misrepresentasi kategori
merchant — persis yang ingin dicegah sistem tiering MDR BI. Ini alasan konkret
yang bisa memicu pemblokiran akun.

#### 🟠 Risiko #3 — Keandalan

Tidak ada jaminan kontraktual bahwa aplikasi issuer akan menerima payload yang
ditandatangani ulang; ini bergantung pada perilaku implementasi, bukan kontrak.
Perubahan di sisi issuer bisa memutus alur pembayaran semalam **tanpa SLA, tanpa
notice, tanpa jalur support**. Tidak ada refund, tidak ada dispute handling, tidak
ada laporan settlement yang terkunci ke nomor invoice kita, **tidak ada sandbox**
(setiap tes memakai uang sungguhan).

#### 🔴 Risiko #4 — Pelanggaran ketentuan penyedia

Untuk mendapat otomasi sesungguhnya, pola ini menuntut penyerahan kredensial
aplikasi merchant ke pihak ketiga. T&C Bayar.gg mendokumentasikannya terang-
terangan: GoPay butuh **verifikasi OTP (SMS/WhatsApp)**, Livin butuh **nomor HP
dan password**, BRI butuh kredensial API merchant, OVO butuh koneksi nomor akun.

- Hampir pasti **melanggar T&C bank/e-wallet** (larangan berbagi kredensial dan
  OTP adalah klausul standar)
- **Memindahkan tanggung jawab transaksi tidak sah ke kamu** — posisimu adalah
  pihak yang menyerahkan kredensial secara sukarela
- **Memberi pihak ketiga kemampuan memindahkan dana kamu**
- **Berbagi OTP adalah pola penipuan klasik.** Bahkan bila penyedianya jujur, kamu
  sedang melatih dirimu melakukan hal yang seharusnya tidak pernah dilakukan

#### Vonis

| Dimensi | Nilai |
|---|---|
| Menyelesaikan input nominal | ✅ Ya |
| Menyelesaikan rekonsiliasi otomatis | ❌ **Tidak. Sama sekali.** |
| Legalitas | 🟠 Abu-abu untuk nominal · 🔴 **Melanggar untuk tag fee (surcharge)** |
| Keandalan | 🔴 Tanpa jaminan, SLA, support, atau sandbox |
| Kepatuhan T&C | 🔴 Melanggar bila memakai credential sharing untuk otomasi |
| Layak untuk SaaS berlangganan | ❌ **Tidak** |

Teknik ini menghemat **Rp343 per transaksi** dibanding Midtrans, dengan imbalan:
tidak ada rekonsiliasi otomatis, tidak ada refund, tidak ada dukungan, risiko
pemblokiran akun QRIS, dan (bila memakai credential sharing) pelanggaran T&C bank
plus eksposur keamanan serius. **Pertukaran itu tidak sepadan.**

### 6.5 ⚠️ QRIS tidak bisa auto-debit

Sering terlewat saat merancang "langganan". **QRIS bukan instrumen recurring.**
Setiap bulan pelanggan harus scan ulang secara manual.

Untuk penagihan otomatis, Midtrans Subscription API hanya mendukung **Card
Payment** (token_id) dan **GoPay Tokenization/Linking** (account_id + token).

**Implikasi desain:** dengan QRIS saja, DeutschUp harus mengirim reminder +
invoice link tiap periode dan menerima churn involunter yang tinggi. Pertimbangkan
menawarkan GoPay Tokenization sebagai opsi "bayar otomatis", atau paket 3/6/12
bulan sekali bayar untuk memperbesar tiket dan mengurangi frekuensi.

---

## 7. Perbandingan penyedia (riset per 26 Juli 2026)

### 7.1 Konteks tarif: MDR yang ditetapkan BI (berlaku sejak 15 Maret 2025)

| Kategori merchant | MDR |
|---|---|
| Usaha Mikro (UMI), transaksi ≤ Rp500.000 | **0%** |
| Usaha Mikro (UMI), transaksi > Rp500.000 | 0,3% |
| UKE / UME / UBE | **0,7%** |
| Pendidikan | 0,6% |
| G2P / P2G / Donasi | 0% |

> Tarif UMI 0% berlaku untuk merchant yang terdaftar sebagai usaha mikro langsung
> di PJP/bank. **Merchant lewat agregator umumnya diklasifikasikan UKE/UME dan
> kena 0,7%.** Jangan berasumsi dapat 0%.
>
> **Larangan surcharge:** MDR ditanggung merchant dan **tidak boleh dibebankan ke
> konsumen.** Sanksi sampai penghentian layanan QRIS dan blacklist.

### 7.2 Ekonomi pada tiket Rp49.000

| Penyedia | Biaya/transaksi | % efektif | Biaya tetap/bulan | Perorangan? |
|---|---:|---:|---:|:--:|
| **Midtrans** | Rp343 | **0,70%** | Rp0 | ✅ |
| **Duitku** ⚠️ | ~Rp343 | ~0,70% | Rp0 | ✅ ⚠️ |
| **iPaymu** (H+2) | Rp343 | 0,70% | Rp0 | ⚠️ |
| **iPaymu** (instan) | Rp1.225 | 2,50% | Rp0 | ⚠️ |
| **Bayar.gg** (QRIS Admin) | Rp980 | 2,00% | Rp0* | ✅ |
| **Bayar.gg** (BAYAR GG / direct) | Rp343 / Rp0 | 0,7% / 0% | **Rp240.000** + setup Rp100k | ✅ |
| **Tripay** | Rp1.093 | 2,23% | Rp0, +Rp7.500/tarik | ✅ |
| **Xendit** | **Rp4.343** | **8,86%** | Rp0 | ❌ |

\* konfirmasi ke Bayar.gg apakah "QRIS Admin" benar-benar tidak butuh langganan
Premium — ini menentukan seluruh perhitungan.

### 7.3 Catatan per penyedia

**Midtrans** (grup GoTo) — ✅ menerima perorangan (**KTP + NPWP**). QRIS **0,7%
sudah termasuk PPN**, tanpa biaya setup/bulanan. Dokumentasi terbaik di kelasnya,
SDK resmi banyak bahasa, sandbox penuh. Webhook bertanda tangan
`SHA512(order_id + status_code + gross_amount + ServerKey)`, status endpoint
`GET /v2/{order_id}/status`, jadwal retry terdokumentasi (2/10/30/90/210 menit,
maks 5x). QRIS Core API: `payment_type: "qris"`, acquirer GoPay atau AirPay
Shopee, status `pending → settlement / expire / deny`.

**Xendit** — ❌ **tidak menerima perorangan** (wajib PT/CV/Perseroan Perorangan),
dan fatal secara ekonomi: 0,70% **+ Rp4.000 flat** = **8,86%** pada tiket Rp49.000.
Dirancang untuk tiket besar.

**Duitku** — ✅ perorangan (⚠️ belum terverifikasi dari sumber primer; halaman
resminya memblokir fetch, HTTP 403). ~0,7% ⚠️ belum terverifikasi. Status endpoint
ada. **Verifikasi tarif langsung ke sales sebelum memutuskan.**

**Tripay** — ✅ perorangan, eksplisit di T&C. **Rp750 + 0,7%** = 2,23%, plus
**Rp7.500 per penarikan**, minimum tarik Rp30.000, clearing **3 hari kerja**.
Webhook HMAC-SHA256 atas raw body (`X-Callback-Signature`).

**iPaymu** — QRIS dinamis 0,7% (settlement H+2) atau 0,7%+1,8% (settlement hari
yang sama). Tanpa biaya bulanan. Minimum transaksi Rp10.000. ⚠️ syarat perorangan
dan detail signature webhook belum terverifikasi dari sumber primer.

**Bayar.gg — yang dipakai sekarang.** Tiga hal yang perlu disadari:

1. **Biaya tetap Rp240.000/bulan** (Rp8.000/hari) untuk Premium — akun belum
   terverifikasi Rp12.000/hari. Pada Rp49.000/langganan, butuh **~5 pelanggan
   aktif hanya untuk menutup biaya langganan gateway**, sebelum menghitung MDR.
   (Jalur "QRIS Admin" 2% disebut tersedia tanpa Premium — konfirmasi sendiri.)
2. **Jalur "0%" menuntut penyerahan kredensial** aplikasi merchant (OTP GoPay,
   password Livin, kredensial API BRI). Lihat §6.4 risiko #4.
3. **T&C mereka tidak memuat pernyataan izin BI atau status PJP**, dan men-disclaim
   tanggung jawab atas *"downtime system"* dan *"dispute between merchant and
   customer"*.

Sisi teknisnya sendiri baik dan sudah terintegrasi: `X-API-Key` di header,
`GET /api/check-payment.php` sebagai status endpoint, dan dokumentasi mereka
sendiri yang menyuruh **jangan percaya status di body callback**.

### 7.4 Rekomendasi

**Midtrans** paling tepat untuk profil DeutschUp: menerima perorangan dengan
KTP+NPWP, 0,7% tanpa komponen flat, tanpa biaya tetap, Core API QRIS paling matang
dengan webhook bertanda tangan + status API + jadwal retry terdokumentasi.
**Duitku** sebagai cadangan (verifikasi tarif dulu). **Xendit tidak layak** di
tiket ini, secara ekonomi maupun karena tidak menerima perorangan.

Migrasinya sendiri sekarang murah: satu file baru + satu env var (§3).

---

## 8. Tabel environment variable

### 8.1 Umum (semua provider)

| Variabel | Wajib | Tipe di CF Pages | Default | Fungsi |
|---|:--:|---|---|---|
| `PAYMENT_PROVIDER` | – | plain | `bayargg` | Provider aktif: `bayargg` \| `manual`. Nama tak dikenal → **500**, bukan fallback diam-diam |
| `APP_URL` | ✅ | secret | `https://deutschup.sintec.my.id` | Basis `callback_url` dan `redirect_url` |
| `TEST_PAYMENT_MODE` | – | secret | **`true` di produksi** | `true` → harga Rp1.000. **Baca §9** |
| `DEBUG_PAYMENTS` | – | plain | – | `true` → log diagnostik pembayaran. Matikan di produksi |
| `SUPABASE_URL` | ✅ | secret | – | Akses tabel `orders` / `profiles` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | secret | – | RLS memakai `auth.uid()` yang selalu NULL di Clerk → semua akses server pakai service role |
| `DISCORD_WEBHOOK_URL` | – | secret | – | Notifikasi sukses/gagal bayar. Tidak memengaruhi alur |

### 8.2 Provider `bayargg`

| Variabel | Wajib | Fungsi |
|---|:--:|---|
| `BAYAR_GG_API_KEY` | ✅ | `X-API-Key` untuk create **dan** verifikasi. Tanpa ini, callback dijawab **500 misconfigured** — sengaja, supaya verifikasi tidak pernah lolos diam-diam |
| `BAYAR_GG_API_KEY_FALLBACK` | – | Alias cadangan, **hanya dibaca saat create**. Ada karena `wrangler pages deploy` pernah menghapus plain env var |

Base URL `https://www.bayar.gg/api` sengaja hardcoded di `lib/payments/bayargg.ts`
— tidak ada env yang bisa mengarahkan API key kita ke host lain.

### 8.3 Provider `manual`

| Variabel | Wajib | Fungsi |
|---|:--:|---|
| `MANUAL_QRIS_IMAGE_URL` | ✅¹ | URL gambar QRIS statis yang ditampilkan ke pembeli |
| `MANUAL_QRIS_PAYLOAD` | ✅¹ | String EMVCo mentah, kalau UI mau me-render QR-nya sendiri |
| `MANUAL_PAYMENT_CONTACT` | ✅ | Tujuan pengiriman bukti (WhatsApp/email). Tanpa ini → **500 misconfigured** |
| `MANUAL_PAYMENT_ACCOUNT` | – | Label akun tujuan. Default `QRIS DeutschUp` |
| `MANUAL_PAYMENT_WINDOW_HOURS` | – | Janji waktu aktivasi, default `24`. Advisory, tidak ada yang meng-expire otomatis |

¹ minimal salah satu dari `MANUAL_QRIS_IMAGE_URL` atau `MANUAL_QRIS_PAYLOAD` harus
ada, kalau tidak `createCharge` menolak — supaya pembeli tidak pernah melihat
kotak QR kosong.

### 8.4 Cara menaruhnya di Cloudflare Pages

Kredensial → **secret_text**, bukan plain_text. Alasan operasional, bukan cuma
kerapian: `wrangler pages deploy` pernah menghapus plain env var pada deployment,
dan workflow `.github/workflows/cf-pages-deploy.yml` sudah punya langkah khusus
untuk memulihkannya. Kalau menambah env baru yang runtime-critical, tambahkan juga
ke daftar `need = [...]` di workflow itu agar deploy gagal keras kalau hilang.

**Jangan pernah** memberi awalan `VITE_` pada secret — ikut ter-bundle ke JS browser.

---

## 9. Menguji tanpa uang sungguhan

### 9.1 🚨 PERINGATAN KERAS soal `TEST_PAYMENT_MODE`

**`TEST_PAYMENT_MODE` bukan flag lokal. Ia ter-wire ke deploy PRODUKSI.**

Di `.github/workflows/cf-pages-deploy.yml`:

```yaml
env:
  TEST_PAYMENT_MODE: ${{ secrets.TEST_PAYMENT_MODE }}
...
  TEST_PAYMENT_MODE_DEFAULT: 'true'        # <- default kalau GitHub secret kosong
...
  test_pay = (os.environ.get('TEST_PAYMENT_MODE') or os.environ.get('TEST_PAYMENT_MODE_DEFAULT') or 'true')
  secrets = { 'AI_ENABLED': ai, 'TEST_PAYMENT_MODE': test_pay, 'APP_URL': app }
```

Artinya:

1. Kalau GitHub secret `TEST_PAYMENT_MODE` **tidak diset**, workflow memakai
   **`'true'`** dan menuliskannya ke environment **production** Cloudflare Pages
   setiap kali deploy.
2. Selama nilainya `'true'`, `api/payment.ts` menjual Pro seharga **Rp1.000**,
   bukan Rp49.000 — **di situs produksi, untuk siapa pun yang membuka halaman
   Pricing**. Halaman Pricing tetap menampilkan Rp49.000.
3. Mengubahnya lewat dashboard Cloudflare **tidak cukup**: deploy berikutnya akan
   menuliskannya kembali.

**Cara membereskannya (dua-duanya, bukan salah satu):**

```
1. GitHub → Settings → Secrets and variables → Actions
   set secret  TEST_PAYMENT_MODE = false
2. .github/workflows/cf-pages-deploy.yml
   ubah  TEST_PAYMENT_MODE_DEFAULT: 'true'  →  'false'
   (dan pertimbangkan menghapus fallback `or 'true'` di baris test_pay)
3. Redeploy, lalu verifikasi: beli sekali dan pastikan tagihannya Rp49.000
```

Sampai itu dilakukan, anggap harga produksi = Rp1.000.

> File workflow itu bukan milik dokumen ini untuk diubah — perubahannya harus kamu
> lakukan sendiri, karena menyentuh proses deploy produksi.

### 9.2 Menguji tanpa menyentuh produksi

**A. Provider `manual` (paling aman, nol uang, nol gateway).**
Set `PAYMENT_PROVIDER=manual` di environment **preview** (bukan production),
isi `MANUAL_*`, lalu jalankan runbook §5.4 sampai `profiles.pro_expires_at`
berubah. Ini menguji seluruh jalur pemenuhan — order, verifikasi, idempotensi,
pemberian akses — tanpa satu rupiah pun berpindah.

**B. Sandbox gateway.** Midtrans, Xendit, dan iPaymu punya sandbox penuh. Bayar.gg
**tidak** — setiap tes di sana memakai uang sungguhan. Ini salah satu alasan nyata
untuk pindah.

**C. Uji negatif yang wajib dijalankan (di preview).**

```bash
BASE=https://<preview>.deutschup.pages.dev

# 1. Webhook palsu untuk order yang benar-benar ada dan masih pending.
#    HARUS 202 "Not paid yet". Kalau ini memberi akses, ada yang rusak parah.
curl -i -X POST "$BASE/api/payment?action=callback" \
     -H 'Content-Type: application/json' \
     -d '{"invoice_id":"<ID_ORDER_PENDING>","status":"paid","final_amount":49000}'

# 2. ID karangan -> 202, dan TIDAK ada panggilan keluar ke gateway (cek log).
curl -i -X POST "$BASE/api/payment?action=callback" \
     -H 'Content-Type: application/json' -d '{"invoice_id":"tidak-ada-ini"}'

# 3. Body bukan objek -> 400 Invalid webhook payload
curl -i -X POST "$BASE/api/payment?action=callback" \
     -H 'Content-Type: application/json' -d '[]'

# 4. Tanpa invoice_id -> 200 Ignored
curl -i -X POST "$BASE/api/payment?action=callback" \
     -H 'Content-Type: application/json' -d '{"status":"paid"}'

# 5. Create tanpa token -> 401
curl -i -X POST "$BASE/api/payment?action=create" \
     -H 'Content-Type: application/json' -d '{"planType":"pro"}'

# 6. Panggil callback dua kali untuk order yang sudah paid -> 200 "Already processed",
#    dan pro_expires_at TIDAK bergeser.
```

**D. Uji unit yang sudah ada.** `src/lib/__tests__/payment.test.ts` menguji
`getWebhookPayload` (fungsi itu tetap diekspor dari `api/payment.ts`, jangan
dihapus). Kandidat tes berikutnya, semuanya murni tanpa jaringan:
`mapStatus()` di `bayargg.ts`, dan `readWebhookRef()` di `index.ts` — khususnya
kasus provider yang mencoba mengembalikan `status`, yang harus terbuang.

---

## 10. Hal yang belum terverifikasi — konfirmasi sendiri sebelum berkomitmen

Empat penyedia memblokir akses otomatis ke halaman resminya (HTTP 403/404).
Poin berikut **harus dikonfirmasi sendiri**:

1. **Tarif QRIS Duitku (~0,7%)** dan penerimaan merchant perorangan — konfirmasi
   ke sales Duitku.
2. **Syarat pendaftaran perorangan iPaymu**; biaya aktivasi QRIS statis Rp50.000
   berasal dari blog mereka, bukan halaman pricing.
3. **Detail signature webhook iPaymu** — tidak ada di sumber primer.
4. **Status izin BI/PJP** untuk iPaymu, Tripay, dan Bayar.gg — tidak satu pun
   menyatakannya di halaman yang dibaca. Verifikasi di
   [Daftar Lembaga Berizin BI](https://www.bi.go.id/id/layanan/informasi-perizinan/default.aspx).
5. **Apakah "QRIS Admin 2%" Bayar.gg benar-benar bebas dari langganan Premium
   Rp8.000/hari** — ini menentukan apakah biaya efektifnya 2% atau 2% + Rp240.000/bulan.
6. **Klasifikasi merchant DeutschUp di Midtrans** — mereka menyatakan perusahaan
   *digital product* dikenai tarif berbeda dari merchant standar. Minta konfirmasi
   **tertulis** bahwa 0,7% berlaku sebelum berkomitmen.

### Kewajiban di Indonesia (ringkasan faktual, **bukan nasihat hukum/pajak**)

- **Badan usaha tidak wajib** untuk menerima pembayaran sebagai perorangan.
  Midtrans dan Tripay menerima perorangan; Xendit tidak.
- **PPh Final UMKM — PP 20/2026** (berlaku 22 April 2026): tarif **0,5%** dari
  peredaran bruto, batas omzet Rp4,8 miliar/tahun, dan **Rp500 juta pertama per
  tahun bagi orang pribadi tidak dikenai PPh**.
  Pada Rp49.000/bulan, omzet setahun per pelanggan Rp588.000 → butuh **≈850
  pelanggan aktif sepanjang tahun** untuk menembus batas bebas pajak.
  Di bawah itu: **PPh terutang Rp0**, tetapi **kewajiban lapor SPT Tahunan tetap ada**.
- **PPN:** ambang Pengusaha Kena Pajak Rp4,8 miliar/tahun. Di bawah itu tidak wajib
  memungut PPN. ⚠️ ambang ini pernah berubah — verifikasi ke DJP.
- **PMK 37/2025:** yang ditunjuk sebagai pemungut PPh 22 adalah **marketplace**,
  bukan payment gateway. Midtrans/Duitku/Tripay **tidak** memotong PPh dari
  settlement kamu.
- Yang tidak bisa ditentukan dari sini dan mengubah jawaban secara material:
  kepemilikan NPWP, adanya penghasilan lain, status pernikahan (PP 20/2026
  menggabungkan omzet suami-istri), pelanggan luar negeri, riwayat pemakaian tarif
  PPh Final, dan perizinan usaha daerah (NIB/OSS).

---

## Lampiran: sumber

**Regulasi & BI** — [QRIS](https://www.bi.go.id/id/fungsi-utama/sistem-pembayaran/ritel/kanal-layanan/qris/default.aspx) ·
[MDR QRIS bagi merchant](https://www.bi.go.id/id/publikasi/ruang-media/cerita-bi/Pages/mdr-qris.aspx) ·
[Ketentuan pelaksanaan QRIS](https://www.bi.go.id/id/publikasi/ruang-media/news-release/Pages/Bank-Indonesia-Terbitkan-Ketentuan-Pelaksanaan-QRIS.aspx) ·
[Daftar lembaga berizin](https://www.bi.go.id/id/layanan/informasi-perizinan/default.aspx) ·
[RRI — larangan membebankan biaya QRIS ke konsumen](https://rri.co.id/mataram/berita-lain/2247282/pelaku-usaha-dilarang-membebankan-biaya-qris-kepada-konsumen)

**Perpajakan** — [DJP: PP 20/2026](https://www.pajak.go.id/en/node/119950) ·
[DJP: pemungutan PPh oleh marketplace](https://pajak.go.id/en/node/120044) ·
[DDTC: PPh Final UMKM pasca PP 20/2026](https://news.ddtc.co.id/berita/nasional/1820074/memahami-pph-final-umkm-pasca-terbit-pp-202026)

**Midtrans** — [pricing](https://midtrans.com/pricing) ·
[dokumen legal registrasi](https://docs.midtrans.com/docs/what-are-the-legal-documents-required-for-midtrans-account-registration) ·
[QRIS Charge API](https://docs.midtrans.com/reference/qris) ·
[pengenalan QRIS statis](https://docs.midtrans.com/docs/pengenalan-qris-statis) ·
[webhooks](https://docs.midtrans.com/docs/https-notification-webhooks) ·
[recurring](https://midtrans.com/features/recurring-payment) ·
[GoPay tokenization](https://docs.midtrans.com/reference/gopay-tokenization)

**Xendit** — [pricing](https://www.xendit.co/en/pricing/) ·
[bisnis perorangan tidak didukung](https://help.xendit.co/hc/en-us/articles/360035083911-Can-Individual-businesses-use-Xendit-s-services)

**Duitku** — [API reference](https://docs.duitku.com/api/en/) · [QRIS](https://www.duitku.com/qris/)
**Tripay** — [developer docs](https://tripay.co.id/developer) · [T&C](https://tripay.co.id/page/terms-and-conditions)
**iPaymu** — [pricing](https://ipaymu.com/id/pricing/) · [FAQ](https://ipaymu.com/id/faq-product-and-service/)
**Bayar.gg** — [beranda](https://www.bayar.gg/) · [API docs](https://bayar.gg/api-docs) · [terms](https://bayar.gg/terms)

**Repo konverter QRIS (untuk konteks §6.4, bukan rekomendasi)** —
[verssache/qris-dinamis](https://github.com/verssache/qris-dinamis) ·
[DioSaputra28/qris-statis-to-dinamis](https://github.com/DioSaputra28/qris-statis-to-dinamis) ·
[AmmarrBN/Qris-Dynamic](https://github.com/AmmarrBN/Qris-Dynamic) ·
[Adytm404/qris-dinamis-generator](https://github.com/Adytm404/qris-dinamis-generator) ·
[dpangestuw/Qris-Statis-to-Dinamis](https://github.com/dpangestuw/Qris-Statis-to-Dinamis) ·
[bot-vpn QRIS_SETUP.md](https://github.com/alrescha79-cmd/bot-vpn/blob/main/docs/QRIS_SETUP.md)

**Dokumen terkait di repo ini** —
`docs/PAYMENT-BAYARGG-CROSSCHECK-2026-07-03.md` (perbandingan lapangan dengan repo
integrasi resmi Bayar.gg) · `docs/incidents/PAY-001-payment-url-required.md`
(kenapa `payment_url` wajib ada di payload create).
