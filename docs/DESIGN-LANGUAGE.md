# DeutschUp — Bahasa Desain (MENGIKAT)

**Status:** normatif. Dokumen ini adalah satu-satunya sumber kebenaran untuk tipografi, spasi,
permukaan, dan gerak di seluruh aplikasi — landing page maupun dalaman.
**Berlaku untuk:** `src/**` (semua `.tsx` dan `.css`).
**Kata kunci:** WAJIB / DILARANG / BOLEH dipakai dalam arti harfiah. Kalau sebuah aturan
di sini bertabrakan dengan audit, rencana, atau kebiasaan file yang ada — dokumen ini menang.

Sebelum menyentuh kode, baca §0 (putusan), §5 (gerak), §6 (larangan). Tiga bagian itu yang
paling sering dilanggar tanpa sadar.

---

## 0. PUTUSAN ATAS PERMINTAAN PEMILIK — baca ini dulu

Pemilik meminta empat hal. Tiga dituruti. Satu **tidak dituruti mentah-mentah**, dan itu
disengaja.

**1. "Sesuaikan tema dari dashboard sampai admin dengan landing page."** → DITURUTI PENUH.
Palet, sudut tajam, garis rambut, eyebrow, easing, dan struktur editorial diwariskan utuh.

**2. "Cari referensi yang bagus dan tidak terasa AI slop."** → DITURUTI PENUH. §6 adalah
daftar larangan yang bisa di-grep, bukan selera.

**3. "Terasa premium di harga $10.000."** → DITURUTI, tapi definisinya diperjelas. Rasa mahal
tidak datang dari efek tambahan. Ia datang dari **lebih sedikit variabel yang dipakai lebih
konsisten**, plus **kelengkapan state**. Dalaman DeutschUp saat ini punya 18 resep H1 berbeda
di 13 halaman, 6 tingkat opacity garis rambut, 9 nilai tracking, dan ~130 nilai spasi
setengah-langkah. Itu terbaca sebagai "tiap layar ditulis orang berbeda" — kebalikan dari
mahal. Menyeragamkannya adalah 70% dari pekerjaan ini.

**4. "Punya animasi sendiri saat scroll."** → **TIDAK DITURUTI SECARA HARFIAH. Ini penilaian
kami, dan kami bertanggung jawab atasnya.**

Alasannya: landing dikunjungi sekali seumur hidup, dashboard dibuka lima kali sehari. Gerak
reveal 600–900ms yang terasa mewah sekali, terasa **rusak** pada kali kelima puluh. Studi
usability Nielsen Norman Group tentang scroll-triggered text animation menemukan peserta
melambat dan — ini bagian yang fatal — **mengira sistemnya lambat atau rusak**; reveal
disalahartikan sebagai loading. Untuk produk berbayar Rp49.000/bulan, kesimpulan user bukan
"ini indah" melainkan "ini lemot". NN/g juga menetapkan >500ms mulai terasa lamban, dan
Doherty Threshold (400ms) adalah batas di mana interaksi masih terasa instan.

Kalau kita membungkus 29 `<section>` dalaman dengan `<Reveal>` durasi 0.6s seperti landing,
kita tidak membuat aplikasi terasa $10.000 — kita membuatnya terasa seperti situs template
yang lambat. Itu justru sinyal AI slop.

**Yang kami lakukan sebagai gantinya** — dan ini memberi pemilik gerak yang dia inginkan tanpa
biayanya:

| Yang diminta | Yang kami kerjakan | Kenapa lebih baik |
|---|---|---|
| Reveal saat scroll di tiap seksi | **Scroll-LINKED** kontinu: header pelajaran memadat jadi rule tipis, rel progres bab terisi mengikuti scroll, garis rambut menguat saat konten lewat | Terikat 1:1 ke jari. Nol penantian, bisa dibalik, tidak pernah disalahartikan sebagai loading. Ini yang membuat aplikasi native terasa mahal |
| Animasi masuk per-seksi | **Choreography sekali per mount rute**, total ≤500ms, maksimal 6 elemen | User tetap melihat halaman "tersusun" saat pindah rute — tapi sekali, cepat, dan tidak diulang saat scroll |
| — | **Gerak bermakna**: umpan balik jawaban, XP naik, penyelesaian pelajaran, pembalikan kartu | Inilah yang benar-benar dirasakan sebagai kualitas di aplikasi pembelajaran (§5.5) |

Easing `cubic-bezier(0.22, 1, 0.36, 1)` **tetap dipertahankan** di dalam aplikasi — itu tanda
tangan merek. Yang dipotong adalah durasinya, jadi sepertiga. Aplikasi akan tetap terasa
DeutschUp tanpa terasa lambat.

**Catatan teknis kenapa 900ms bukan cuma "agak lama":** `cubic-bezier(0.22, 1, 0.36, 1)` adalah
ease-out sangat agresif (kedua control point y=1). Pada durasi 800ms, gerak yang benar-benar
terlihat selesai di ~250ms; ~550ms sisanya adalah pergerakan sub-piksel yang tidak terlihat
mata. User tidak melihat keindahan di 550ms itu — dia hanya merasakan penundaan.

> **Konsekuensi langsung:** rekomendasi "bungkus 29 `<section>` dengan `<Reveal>`" dan
> "naikkan `PageWrapper` dari 0.3s ke 0.6s" yang muncul di audit sebelumnya **DIBATALKAN**.
> Gantinya ada di §5.3 dan §5.4.

---

## 1. PRINSIP

1. **Ini majalah cetak yang kebetulan interaktif, bukan dashboard SaaS yang kebetulan pakai
   serif.** Setiap keputusan tunduk pada logika halaman cetak: sudut tajam, garis rambut,
   hierarki tipografi yang tegas, ruang putih yang disengaja.
2. **Nol sudut membulat, nol bayangan.** Kedalaman diciptakan oleh tangga permukaan dan garis
   rambut 1px — tidak pernah oleh benda melayang. `gap-px` adalah primitif pemisah kami.
3. **Serif adalah suara, bukan bumbu; sans adalah alat kerja.** DM Serif Display membawa
   momen naratif berukuran ≥24px. Semua yang lebih kecil, semua angka, semua kontrol — Geist.
4. **Lebih sedikit variabel, dipakai lebih sering.** Satu skala spasi, satu opacity garis
   rambut, satu resep per peran tipografi. Nilai ad-hoc adalah bug, bukan kreativitas.
5. **Gerak menjelaskan, bukan menghias.** Di landing gerak boleh membujuk; di aplikasi gerak
   hanya boleh memberi umpan balik, mempertahankan kontinuitas, atau mengikuti jari. Segala
   gerak yang membuat user menunggu adalah cacat.
6. **State kosong, memuat, dan gagal adalah desain — bukan sisa.** "Belum ada data" punya
   empat makna berbeda dan masing-masing punya komposisi sendiri. Aplikasi yang hanya punya
   happy path terbaca sebagai hasil generate.
7. **Pemiliknya memakai ini dari HP Android.** Target sentuh 44px, input ≥16px, nol
   `backdrop-filter`, hover selalu dibungkus `@media (hover: hover)`. Kalau sebuah keputusan
   indah di desktop tapi berat di Android mid-range, keputusan itu salah.

---

## 2. SKALA TIPOGRAFI

### 2.1 Putusan: serif TIDAK untuk semua heading di dalaman — dan ini alasannya

Landing memakai `font-serif` untuk 7 dari 7 heading. Itu **benar untuk landing** dan
**salah kalau disalin mentah ke layar padat data.** Tiga alasan teknis, bukan selera:

1. **DM Serif Display hanya punya satu bobot: 400 (plus italic).** Tidak ada 500, 600, 700.
   Artinya serif secara fisik **tidak bisa membawa hierarki UI** — Anda tidak bisa membedakan
   judul kartu dari sub-judulnya lewat bobot. Lebih buruk lagi: `font-serif font-bold` yang
   sudah muncul di `Koreksi.tsx` menghasilkan **faux bold** — browser menebalkan glyph secara
   sintetis, hasilnya buram dan lumer, terutama di layar Android non-Retina. Kombinasi itu
   DILARANG (§6, grep #7).
2. **Serif kehilangan bentuk di ukuran kecil.** Kait dan serif mengaburkan bentuk huruf di
   bawah ~24px. Label, chip, kolom tabel, breadcrumb — semuanya rusak.
3. **Serif display tidak punya tabular figures.** Angka DM Serif Display lebar-variabel:
   kolom XP akan bergoyang tiap kali angka berubah, timer akan bergeser tiap detik. Ini
   masalah fungsional, bukan estetis.

**ATURAN KERAS: `font-serif` hanya boleh dipakai pada elemen dengan computed font-size ≥ 24px
(`text-2xl` ke atas), dan tidak pernah pada angka.** Di bawah itu — dan pada semua angka —
`font-sans` (Geist Variable), yang punya rentang bobot penuh dan tabular numerals.

Ini tidak melemahkan bahasa desain. Justru sebaliknya: serif menjadi penanda "ini momen
naratif" alih-alih font default. Kontinuitas dengan landing dijaga oleh **eyebrow + garis
rambut rust + sudut tajam + easing**, bukan oleh serif di setiap label 11px.

### 2.2 Tabel peran → kelas persis

Salin string ini apa adanya. Jangan mengarang varian.

| Peran | Font | Kelas Tailwind persis | Dipakai di |
|---|---|---|---|
| **Judul halaman** (h1, 1× per rute) | serif | `font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.02em] text-brand-ink` | `<PageHeader>` saja |
| **Judul halaman di atas ink** | serif | idem + `text-brand-cream` | halaman/section gelap |
| **Judul bagian** (h2) | serif | `font-serif text-2xl leading-[1.1] tracking-[-0.015em] text-brand-ink md:text-3xl` | `<Section>` |
| **Judul sub-bagian** (h3) | sans | `font-sans text-lg font-semibold leading-[1.25] tracking-[-0.01em] text-brand-ink` | dalam kartu/panel |
| **Judul kartu / baris** (h4) | sans | `font-sans text-base font-semibold leading-[1.3] tracking-[-0.005em] text-brand-ink` | sel grid, baris daftar |
| **Lede / paragraf pengantar** | sans | `font-sans text-lg leading-relaxed text-ink-muted max-w-[62ch]` | tepat di bawah h1/h2 |
| **Isi (body)** | sans | `font-sans text-base leading-relaxed text-brand-ink max-w-[68ch]` | prosa, materi belajar |
| **Isi sekunder** | sans | `font-sans text-sm leading-relaxed text-ink-muted` | keterangan, deskripsi |
| **Label / caption** | sans | `font-sans text-sm text-ink-subtle` | di bawah field, meta |
| **Eyebrow** (penanda taksonomi) | sans | `text-xs font-bold uppercase tracking-[0.2em] text-ink-muted` | `<Eyebrow>` |
| **Eyebrow di atas ink** | sans | idem + `text-brand-tan` | section gelap |
| **Angka besar / stat** | sans | `font-sans text-4xl font-semibold tabular-nums tracking-[-0.02em] text-brand-ink` | `<Stat>` |
| **Angka inline** (XP, streak, skor, durasi, harga, %) | sans | `tabular-nums font-medium` | `<Num>` |
| **Angka tabel** | sans | `font-sans text-sm tabular-nums` | `<DataTable>` |
| **Teks Jerman** (kosakata, kalimat contoh) | sans | `font-sans text-base font-medium text-brand-ink` | trainer, pelajaran |
| **Terjemahan Indonesia** | sans | `font-sans text-base text-ink-muted` | trainer, pelajaran |
| **Aksen italic** | serif | `italic text-brand-rust` (di atas cream) / `italic text-brand-tan` (di atas ink) | 1 frasa per h1 |
| **Kode / input Jerman mentah** | mono | `font-mono text-sm tabular-nums` | admin, debug |

**Kurva tracking (wajib, ini yang membuat headline terasa "dicetak" bukan "di-scale"):**
semakin besar ukuran, semakin negatif tracking; eyebrow membalik ke positif.

```
≥48px  → tracking-[-0.02em]
32-40px→ tracking-[-0.015em]
24-28px→ tracking-[-0.01em]
16-20px→ tracking-[-0.005em]
14px   → tracking-normal
12px eyebrow → tracking-[0.2em]   ← satu-satunya nilai positif
```

**Nilai `leading` yang boleh dipakai — hanya lima:**
`leading-[1.02]` (judul halaman) · `leading-[1.1]` (h2) · `leading-[1.25]` (h3/h4) ·
`leading-relaxed` (body) · `leading-none` (khusus angka besar & baris tunggal).
`leading-tight`, `leading-snug`, `leading-[1.05]`, `leading-[1.08]` **dihapus dari kosakata.**

**Nilai `tracking` yang boleh dipakai — hanya enam:**
`tracking-[-0.02em]` · `tracking-[-0.015em]` · `tracking-[-0.01em]` · `tracking-[-0.005em]` ·
`tracking-normal` · `tracking-[0.2em]`.
`tracking-[0.1em]`, `[0.12em]`, `[0.14em]`, `[0.16em]`, `[0.18em]`, `[0.15em]`, `tracking-wide`,
`tracking-tight` **DILARANG** (74+ kemunculan harus diganti).

**Ukuran teks yang boleh dipakai — hanya tujuh:**
`text-xs` (12) · `text-sm` (14) · `text-base` (16) · `text-lg` (18) · `text-xl` (20) ·
`text-2xl` (24) · `text-3xl` (30) · `text-4xl` (36) · plus satu `clamp()` di `<PageHeader>`.
`text-[10px]`, `text-[11px]`, `text-[13px]`, `text-[15px]` **DILARANG** (53 kemunculan).
Kalau 11px terasa perlu, yang salah adalah kepadatan layoutnya, bukan ukuran fontnya.

**Bobot yang boleh dipakai:** `font-normal` (400) · `font-medium` (500) · `font-semibold` (600)
· `font-bold` (700, hanya untuk eyebrow dan sans).
`font-light`, `font-thin`, `font-extralight` **DILARANG** — termasuk untuk lede. (Landing saat
ini memakai `text-lg font-light` di 4 tempat; itu boleh dibiarkan sebagai warisan, tapi
**tidak boleh disalin ke dalaman**. Kalau ada agen menyentuh file landing itu untuk alasan
lain, ganti ke `font-normal` sekalian.)

**Alias font:** `font-serif` saja. `font-heading` (11 kemunculan di `Admin.tsx`, `AdminAI.tsx`)
adalah alias untuk font yang sama dan menciptakan ilusi dua sistem — ganti semua ke
`font-serif`.

### 2.3 Aturan angka (non-negotiable)

- **Setiap angka yang bisa berubah WAJIB `tabular-nums`.** XP, streak, skor, persentase,
  durasi, timer, harga Rp49.000, jumlah baris admin, nomor bab. Saat ini hanya 18 kemunculan
  `tabular-nums` di seluruh repo — itu jauh dari cukup.
- Angka tidak pernah `font-serif`. (Pengecualian tunggal: angka pemasaran di landing seperti
  `1.600+` di `Hero.tsx` — biarkan.)
- Angka sebagai stat besar: sans 600, bukan 700. Bobot 700 pada angka besar terbaca murah.
- **Bobot font tidak boleh berubah saat hover/selected/active** — itu memicu layout shift.
  Kalau butuh penekanan pada state, ubah warna atau garis rambut, bukan bobot.

---

## 3. SPASI & RITME

### 3.1 Satu skala. Titik.

Nilai yang BOLEH dipakai pada `p-* px-* py-* pt-* pb-* pl-* pr-* m-* gap-* space-x-* space-y-*`:

```
px   1   2   3   4   6   8   10   12   16   20   24   32
     ↑
   gap-px = garis rambut, bukan spasi. Selalu berpasangan dengan bg-brand-ink/10.
```

**DILARANG:** semua nilai setengah-langkah — `0.5`, `1.5`, `2.5`, `3.5`. Saat ini ada ~130
kemunculan di dalaman vs 3 di landing. Bulatkan ke langkah penuh terdekat, ke ATAS kalau
ragu (ruang lebih murah daripada sesak).
**DILARANG:** `5`, `7`, `9`, `11`, `14`, `18`, `28` dan nilai arbitrer `p-[13px]`.

### 3.2 Ritme berjenjang — inilah yang membaca sebagai "bernafas"

Yang membuat layout terasa mahal bukan spasi besar merata, melainkan **rasio ekstrem antara
lompatan besar antar-blok dan lompatan kecil di dalam komponen.**

| Tingkat | Nilai | Contoh |
|---|---|---|
| Antar-section dalam satu halaman | `space-y-12 md:space-y-20` (48/80px) | root tiap page |
| Header halaman → konten pertama | `mb-10 md:mb-16` | `<PageHeader>` |
| Judul section → isinya | `mb-6` | `<Section>` |
| Antar-baris dalam daftar | `gap-px` (garis rambut) | daftar pelajaran, tabel |
| Interior kartu/sel | `p-6` desktop, `p-4` mobile | `p-4 md:p-6` |
| Interior panel besar / CTA | `p-8 md:p-12` | banner upgrade |
| Antar-elemen di dalam kartu | `gap-2` atau `gap-3` | ikon+teks, label+nilai |
| Antar-chip / tag | `gap-2` | filter, tag |

**Catatan kalibrasi:** dalaman memakai ~3/4 ritme landing, bukan 100%. Landing memakai
`py-20 md:py-32` antar-section karena user menggulir sekali sambil dibujuk. Dashboard yang
dibuka lima kali sehari dengan jarak 128px antar-blok memaksa scroll yang tidak perlu. 48/80px
adalah titik di mana ruang terasa disengaja tanpa membuat pekerjaan harian jadi lebih panjang.
Ini kenaikan besar dari kondisi sekarang (`space-y-8 md:space-y-12` = 32/48px).

### 3.3 Padding berbeda per tipe komponen (ini disengaja)

Padding seragam 24px di semua komponen adalah sinyal AI slop. Yang benar:

| Komponen | Padding | Tinggi minimum |
|---|---|---|
| Tombol (touch) | `px-4 py-3` | `min-h-11` (44px) — WAJIB di dalaman |
| Tombol (desktop-only chrome) | `px-3 py-2` | `min-h-9` |
| Input / textarea / select | `px-3 py-3` | `min-h-11`, `text-base` (≥16px, cegah zoom) |
| Sel grid / kartu | `p-4 md:p-6` | — |
| Baris daftar dapat-diklik | `px-4 py-4 md:px-6` | `min-h-14` |
| Panel CTA / banner | `p-8 md:p-12` | — |
| Chip / badge | `px-2 py-1` | — |
| Sel tabel | `px-4 py-3` | — |

> **Temuan penting:** `Button` `size="default"` saat ini `h-8` = **32px**. Itu di bawah target
> sentuh 44px dan pemilik memakai HP Android. Setiap `<Button>` di dalam halaman (bukan chrome
> desktop) WAJIB diberi `size="lg"` + `min-h-11`, atau `size` default-nya diubah. Lihat §7.1.

### 3.4 Shell & lebar

```
Shell dalaman (App.tsx, desktop + mobile):
  bg-brand-cream
  max-w-[1400px] mx-auto
  px-6 sm:px-10 lg:px-16       ← gutter mobile naik 16px → 24px
  py-10 md:py-16
```

- **DILARANG** menambahkan `max-w-*` kedua di dalam shell pada file halaman. Saat ini ada 8
  lebar berbeda di 13 halaman (`max-w-2xl`, `3xl`, `4xl`, `5xl`, `6xl`, `xl`, `md`, `xs`) —
  hapus semua.
- Satu-satunya pembatas lebar yang dibolehkan di halaman: `max-w-[68ch]` pada blok **prosa**
  (materi belajar, penjelasan tata bahasa). Itu measure, bukan layout.
- Lebar 1400px dikonsumsi secara **struktural**, bukan dengan meregangkan paragraf: pakai grid
  asimetris `lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] gap-px bg-brand-ink/10`.
- **DILARANG** grid tiga kolom sama besar berisi ikon+judul+paragraf identik (sinyal slop).
  Kalau butuh tiga hal, buat satu dominan dan dua reses.

---

## 4. STRUKTUR & PERMUKAAN

### 4.1 Sudut

**Radius = 0 di seluruh produk. Tanpa pengecualian.**

Itu berarti, di CSS:

```css
/* src/index.css */
--radius: 0rem;                         /* saat ini 0.625rem */

/* src/styles/liquid-glass.css */
--glass-radius: 0; --glass-radius-sm: 0; --glass-radius-lg: 0;
--glass-shadow: none; --glass-shadow-lg: none;
```

Grep kelas `rounded-*` di JSX sudah bersih (7 kemunculan, semuanya `rounded-none`). Radius yang
tersisa masuk lewat CSS: `.st-card` (14px + 2 box-shadow), `.st-badge` (9999px), `.st-level-card`,
`.st-progress` (9999px), `.st-input`, `.st-segmented`, `.st-study-card` (2xl + shadow), `.st-note`,
`.glass` (20px), `.glass-subtle` (14px), `.glass-heavy` (28px). Semua ternetralkan oleh dua
perubahan token di atas.

Satu-satunya bentuk melengkung yang dibolehkan: **avatar foto profil** (`rounded-full` pada
`<img>` avatar saja) — karena wajah dalam kotak tajam terbaca sebagai foto paspor. Ini
pengecualian tunggal dan harus ditulis inline dengan komentar `/* satu-satunya pengecualian radius */`.

### 4.2 Bayangan

**Nol `box-shadow`. Nol `drop-shadow`. Nol `shadow-*`.**
Kedalaman datang dari dua mekanisme saja: tangga permukaan + garis rambut.

Satu pengecualian, dan bentuknya bukan bayangan lembut: **focus ring** (§4.5).

### 4.3 Tangga permukaan (4 tingkat, tidak lebih)

Tambahkan token ini di `:root`:

```css
--surface-0: #f5f0eb;   /* = brand-cream. Latar halaman. Default segalanya.   */
--surface-1: #faf7f4;   /* Sel/kartu yang naik satu tingkat dari halaman.     */
--surface-2: #ece5dd;   /* Reses: header tabel, input, area disabled.         */
--surface-3: #0a0a0a;   /* = brand-ink. Section terbalik, satu per halaman.   */
--surface-3-raised: #141414; /* Sel di dalam section ink.                     */
```

Aturan pakai:

| Kondisi | Permukaan |
|---|---|
| Latar halaman | `bg-brand-cream` (surface-0) |
| Sel dalam grid `gap-px` | `bg-surface-1` — garis rambut sudah dari `bg-brand-ink/10` di grid |
| Baris tabel | `bg-surface-1`, header `bg-surface-2` |
| Input / textarea / select | `bg-surface-2`, fokus → `bg-surface-1` |
| Section penekanan (maks 1 per halaman) | `bg-brand-ink` + teks `text-brand-cream` |
| Overlay/dialog/sheet | `bg-surface-0` opak penuh + `border border-brand-ink/20` |

**`bg-white` DILARANG (64 kemunculan di dalaman, 0 di landing).** Putih murni di atas cream
terbaca sebagai kartu melayang meski tanpa shadow — ia menciptakan kedalaman palsu dan
membocorkan bahwa dalaman berasal dari sistem lain. Ganti ke `bg-surface-1` (atau hapus sama
sekali kalau elemennya memang harus rata dengan halaman).

**`bg-background`, `bg-card`, `bg-popover`, `bg-primary/5`, `bg-muted` DILARANG** — semuanya
token shadcn `oklch(x 0 0)` dengan chroma nol, jadi menghasilkan abu-abu netral dingin di
tengah palet hangat. Chrome (`TopNav` 7×, `DesktopSidebar` 5×) masih memakainya.

### 4.4 Garis rambut — dua tingkat, bukan enam

```
border-brand-ink/10   ← DEFAULT. Semua pemisah, semua tepi sel, semua grid gap-px.
border-brand-ink/20   ← STRUKTURAL. Pemisah header tabel, batas section, tepi dialog,
                         state aktif/selected.
```

`ink/8`, `ink/12`, `ink/15`, `ink/25` **DILARANG** (135 kemunculan → dikompres jadi 2 nilai).
Di atas ink: `border-brand-cream/15` (default) dan `border-brand-cream/30` (struktural).

**Kapan garis rambut, kapan permukaan solid:**

| Situasi | Pakai |
|---|---|
| Sekumpulan hal setara (daftar pelajaran, grid stat, tabel) | **`gap-px` + `bg-brand-ink/10` pada kontainer grid.** Sel-selnya `bg-surface-1`. Tidak ada border per-sel |
| Satu hal berdiri sendiri (panel CTA, kartu detail) | **Permukaan solid** `bg-surface-1 border border-brand-ink/10` |
| Pemisah horizontal dalam prosa | `<div className="h-px bg-brand-ink/10" />` — bukan `<hr>` bergaya |
| Penekanan pada satu blok | **`bg-brand-ink`**, bukan border tebal berwarna |

**DILARANG:** `border-l-4`/`border-t-4` berwarna pada kartu. Ini penanda AI slop paling
reliabel yang teridentifikasi di dua sumber independen. Kalau sebuah kartu perlu ditandai
(mis. "pelajaran aktif"), tandai dengan `bg-surface-2` + eyebrow rust, bukan pita warna.

**DILARANG:** kartu bersarang. Satu tingkat permukaan saja. Kalau ada `bg-surface-1` di dalam
`bg-surface-1`, salah satunya harus jadi garis rambut.

### 4.5 Focus ring & seleksi

Ganti `src/index.css:186-190` seluruhnya:

```css
*:focus-visible {
  outline: none;                                     /* outline tidak menghormati radius 0 dgn benar */
  box-shadow: 0 0 0 2px var(--brand-cream), 0 0 0 4px var(--brand-rust);
  border-radius: 0;
}
/* Di atas permukaan ink */
.on-ink *:focus-visible {
  box-shadow: 0 0 0 2px var(--brand-ink), 0 0 0 4px var(--brand-tan);
}
::selection { background: #8b2500; color: #f5f0eb; }
```

Alasan: `outline: 2px solid #3b82f6` yang sekarang aktif menampilkan **kotak biru bersudut 4px
di seluruh aplikasi** setiap kali pemilik menyentuh apa pun di Android. Ini perbaikan paling
terlihat per baris kode di repo ini.

### 4.6 Tekstur & tanda tangan landing yang dibawa masuk

Tiga elemen ini yang membuat dalaman terbaca sebagai **bab lanjutan**, bukan aplikasi lain:

1. **Overlay grid 60px** di header halaman (landing pakai 3×, dalaman 0×):
   ```jsx
   <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{ backgroundImage:
          'linear-gradient(to right, rgba(10,10,10,.06) 1px, transparent 1px),' +
          'linear-gradient(to bottom, rgba(10,10,10,.06) 1px, transparent 1px)',
          backgroundSize: '60px 60px' }} />
   ```
   Dipakai HANYA di dalam `<PageHeader>`, tidak di badan halaman.
2. **Garis rambut rust di atas eyebrow**: `<div className="h-px w-12 bg-brand-rust" />`.
   Landing: 5×. Dalaman: 3×. Harus jadi bagian wajib `<Eyebrow>`.
3. **Aksen `italic text-brand-rust`** pada satu frasa di tiap judul halaman. Landing: 5×.
   Dalaman: 1×. Ini tanda tangan headline yang paling hilang.

**`<Magnetic>` DILARANG di dalaman.** Pemilik memakai HP Android — tidak ada pointer. Komponen
itu memasang `onPointerMove` yang tidak pernah bermakna di sentuh, sambil tetap membayar biaya
listener dan spring. Ia tetap boleh di landing (desktop pengunjung), tapi bungkus pemakaiannya
dengan `@media (hover: hover) and (pointer: fine)`.

---

## 5. SISTEM GERAK

> Bagian ini paling mudah salah. Kalau Anda hanya sempat membaca satu bagian, baca yang ini.

### 5.1 Dua rezim gerak yang tidak boleh dicampur

| | **GERAK PEMASARAN** | **GERAK APLIKASI** |
|---|---|---|
| Berlaku di | `src/components/{Hero,CTASection,LearningRoadmap,ProductShowcase,SocialProof,LandingPage}.tsx`, `Pricing.tsx` versi publik | semua `src/pages/**` + `src/components/layout/**` + `src/components/ui/**` |
| Frekuensi dilihat | 1× seumur hidup | 5×/hari |
| Tujuan | membujuk, membangun kesan | menjelaskan, memberi umpan balik |
| Durasi | 400–900ms | **80–320ms** |
| Scroll-triggered reveal | ya | **tidak** (lihat 5.3) |
| Stagger | 80ms, tak terbatas | ≤50ms, maks 6 elemen |
| `<Magnetic>` | boleh (pointer: fine) | dilarang |

**Yang DIWARISKAN dari landing ke aplikasi:** kurva easing, arah gerak, kosakata bentuk
(wipe/rule/mask — bukan bounce/spring pantul), disiplin.
**Yang TIDAK diwariskan:** durasi, reveal per-seksi, stagger panjang.

Easing adalah tanda tangan merek; durasi adalah konteks.

### 5.2 Token gerak (buat file `src/lib/motion.ts`, §8.1)

```ts
/* DURASI (detik, untuk motion/react) */
export const DUR = {
  instant:  0.08,  //  80ms  press, hover, toggle, checkbox
  quick:    0.14,  // 140ms  chip select, ikon berganti, tooltip, badge
  base:     0.20,  // 200ms  entrance elemen standar, accordion, tab
  panel:    0.28,  // 280ms  sheet/drawer/modal MASUK
  exit:     0.16,  // 160ms  SEMUA yang keluar (selalu < masuk)
  route:    0.32,  // 320ms  transisi antar halaman
  celebrate:0.70,  // 700ms  DICADANGKAN: maks 1× per pelajaran selesai
} as const;

/* EASING */
export const EASE = {
  enter:   [0.22, 1, 0.36, 1],   // SAMA dengan landing — tanda tangan merek
  exit:    [0.4, 0, 1, 1],       // accelerate keluar
  move:    [0.2, 0, 0, 1],       // gerak di dalam layar (M3 standard)
  express: [0.22, 1, 0.36, 1],   // perayaan
} as const;
```

**Peta cepat:**

| Interaksi | Durasi | Easing |
|---|---|---|
| Tekan tombol (feedback) | `instant` | `move` |
| Toggle / checkbox | `instant` | `move` |
| Hover kartu (desktop saja) | `quick` | `move` |
| Chip/tab terpilih | `quick` | `move` |
| Accordion / dropdown buka | `base` | `enter` |
| Accordion / dropdown tutup | `exit` | `exit` |
| Bottom sheet naik / turun | `panel` / `base` | `enter` / `exit` |
| Dialog masuk / keluar | `panel` / `exit` | `enter` / `exit` |
| Pindah rute | `route` | `move` |
| Skeleton → konten | `base` crossfade | `move` |
| Angka XP naik | 0.5 | `enter` |
| Pembalikan kartu kosakata | `route` | `move` |
| Pelajaran selesai | `celebrate` | `express` |

### 5.3 Apa yang boleh bergerak saat scroll di dalam aplikasi

Jawabannya **bukan "semuanya"**, dan bukan "tidak ada". Ada dua hal berbeda yang sering
disebut dengan nama sama:

|  | **Scroll-TRIGGERED** (diskrit) | **Scroll-LINKED** (kontinu) |
|---|---|---|
| Mekanisme | elemen masuk viewport → mainkan animasi berdurasi | properti terikat langsung ke posisi scroll |
| User menunggu? | **Ya** — ini sumber keluhan | **Tidak pernah** — mengikuti jari 1:1 |
| Bisa dibalik? | Tidak | Ya |
| Cocok di aplikasi? | **Hampir tidak pernah** | **Ya — ini sumber rasa premium** |

**BOLEH bergerak saat scroll di dalam aplikasi (semuanya scroll-linked):**

1. **Header pelajaran/halaman memadat.** Saat scroll turun, `<PageHeader>` menyusut jadi rule
   tipis + judul kecil yang sticky. Gunakan `useScroll` + `useTransform` pada `scrollY`
   container. Animasikan hanya `opacity`, `scaleY`, dan `y` — **tidak** `height`.
2. **Rel progres bab.** Garis vertikal/horizontal 2px yang terisi `scaleX`/`scaleY` mengikuti
   posisi scroll di dalam halaman pelajaran.
3. **Penguatan garis rambut sticky.** Border bawah TopNav dari `ink/10` → `ink/20` saat
   `scrollY > 8`. Transisi warna 140ms, bukan animasi terikat scroll (ini biner).

**BOLEH tapi bukan scroll:**

4. **Choreography sekali per mount rute.** Saat pindah ke `/dashboard`, elemen yang **sudah
   ada di viewport** tersusun sekaligus. Dipicu oleh mount, bukan oleh scroll.

   **Anggaran keras — dari elemen pertama bergerak sampai elemen terakhir diam: ≤500ms total,
   berapa pun jumlah elemennya.**
   ```
   elemen_dianimasikan = min(jumlah_sebenarnya, 6)
   stagger = min(0.05, (0.5 - DUR.base) / elemen_dianimasikan)
   /* elemen ke-7 dan seterusnya: muncul instan, delay 0 */
   ```
   Perangkap yang dilarang: 20 kartu × stagger 60ms → elemen terakhir mulai di 1,14 detik.
   Itu resep dashboard yang terasa rusak.

5. **Konten sekunder jauh di bawah lipatan** yang benar-benar tidak esensial (mis. grafik
   statistik di kaki halaman Profile): boleh `whileInView` dengan `once: true`,
   durasi ≤ `DUR.base`, offset ≤ 8px. Maksimal **satu** blok seperti ini per halaman.

**DILARANG bergerak saat scroll di dalam aplikasi:**

- Reveal per-baris pada daftar kosakata, daftar pelajaran, tabel admin, hasil trainer.
- Reveal apa pun pada teks yang sedang dibaca untuk belajar. Ini bukan sekadar lambat — ini
  mengganggu pembelajaran, yang merupakan produknya.
- Parallax dalam bentuk apa pun (WCAG 2.3.3 menyebutnya pemicu gangguan vestibular).
- `viewport={{ once: false }}` — reveal yang terulang saat scroll naik-turun.
- `<Reveal>` (komponen landing, durasi 0.6s) di dalam `src/pages/**`. **Impor `Reveal` di
  `src/pages/**` adalah pelanggaran yang bisa di-grep.**

### 5.4 Transisi rute — perbaiki `PageWrapper`

`App.tsx` saat ini: satu fade `duration: 0.3`, easing default, tanpa stagger, tanpa guard
reduced-motion, dengan fallback `<Loader2 className="animate-spin text-slate-400" />`.

Yang benar:

```jsx
// exit lebih cepat dari enter; easing merek dipertahankan; stagger di dalam anggaran
const page = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.route, ease: EASE.move,
                                             staggerChildren: 0.05, delayChildren: 0.04 } },
  exit:    { opacity: 0, y: -6, transition: { duration: DUR.exit, ease: EASE.exit } },
};
```

- `y: 15` → `y: 8`. **Nilai animasi harus proporsional terhadap ukuran pemicu.** Seluruh
  halaman bergerak 15px terasa seperti halaman "jatuh"; 8px terasa seperti halaman "terpasang".
- Guard `useReducedMotion()` wajib: kalau true, `initial={false}` dan tanpa transition.
- Fallback Suspense: ganti spinner slate dengan skeleton yang meniru bentuk halaman tujuan
  (§5.7), atau — kalau tunggu <300ms — **tidak menampilkan apa pun**.

### 5.5 Gerak BERMAKNA — yang benar-benar menaikkan kualitas yang dirasakan

Diurutkan berdasarkan nilai-terhadap-risiko. Ini yang membuat aplikasi pembelajaran terasa
mahal — bukan reveal saat scroll.

**a. Umpan balik jawaban (trainer, checkpoint, simulasi) — prioritas #1.**

Umpan balik WAJIB muncul dalam **<100ms** dari tap, sebelum jaringan apa pun. Pakai
`useOptimistic` (React 19) atau state lokal; validasi server menyusul.

```
BENAR (jawaban benar):
  border sel: brand-ink/10 → brand-green, DUR.instant, EASE.move
  latar sel:  surface-1 → rgba(45,138,78,0.08)
  ikon centang muncul: opacity 0→1, DUR.quick
  TIDAK ADA scale, TIDAK ADA bounce, TIDAK ADA confetti

SALAH (jawaban keliru):
  border sel: brand-ink/10 → brand-rust, DUR.instant
  goyang horizontal: x: [0,-4,4,-2,0], DUR 0.16, EASE.move   ← amplitudo ≤4px, satu siklus
  jawaban benar terungkap: DUR.base, EASE.enter
  reduced-motion: warna + ikon saja, TANPA goyang

ROLLBACK (server menolak jawaban optimistis):
  WAJIB punya gerak + pesan sendiri. Rollback diam-diam terbaca sebagai tombol rusak,
  bukan permintaan yang ditolak.
```

**b. Kenaikan XP / streak.**
Count-up `DUR` 0.5s dengan `EASE.enter`, `tabular-nums` (wajib, kalau tidak angkanya bergoyang),
**tanpa perubahan skala atau warna berkedip**. Kalau delta ≥ satu milestone, tambahkan satu
garis rambut rust yang menyapu di bawah angka (`scaleX` 0→1, `DUR.base`).

**c. Penyelesaian pelajaran — satu-satunya momen ekspresif yang dibolehkan.**
Maksimal **1× per pelajaran**, `DUR.celebrate` (700ms), `EASE.express`.
Bentuknya harus editorial, bukan game: **rule wipe** — garis rust setinggi 2px menyapu dari
kiri ke kanan melintasi lebar header, diikuti stempel eyebrow "SELESAI" yang muncul.
**DILARANG:** confetti, partikel, emoji beterbangan, bounce, suara. Itu semua terbaca murah
dan bertentangan langsung dengan bahasa cetak.

**d. Pembalikan kartu kosakata.**
`rotateY` 3D, `DUR.route` (320ms), `EASE.move`, `transform-style: preserve-3d`,
`backface-visibility: hidden`, `perspective: 1000px` pada induk.
`prefers-reduced-motion` → crossfade opacity `DUR.quick`, tanpa rotasi.
(`VocabTrainerDB.tsx:596` sudah punya ini dan sudah punya guard reduced-motion — jadikan itu
acuan, ekstrak jadi primitif `<FlipCard>`, jangan tulis ulang.)

**e. Transisi shared-element daftar → detail.**
Ini pola tunggal yang paling kuat menciptakan kesan "aplikasi mahal": elemen yang **bertahan
melintasi potongan** mengomunikasikan kontinuitas — user paham ini benda yang sama, bukan
penggantinya. Terapkan dengan `layoutId` motion/react:
kartu pelajaran di `/level/:id` → header di `/lesson/:id`. Judul dan nomor bab **morph**, bukan
fade. Motion melakukan pengukuran DOM sekali lalu menganimasikan lewat `transform` (FLIP), jadi
biayanya murah bahkan di Android.

**f. Indikasi progres.**
Rel progres bab dimulai di **~8% saat nol pelajaran selesai** (endowed progress effect —
progres yang sudah "diberikan" meningkatkan motivasi menyelesaikan). Terisi dengan `scaleX`,
400ms, `EASE.enter`. **Jangan animasikan `width`** — itu memicu layout, mahal di Android.

### 5.6 `prefers-reduced-motion` — aturan wajib

`src/index.css` sudah punya `@media (prefers-reduced-motion: reduce)` yang memaksa
`animation-duration: 0.01ms !important`. **Itu TIDAK menutupi animasi motion/react**, karena
motion menganimasikan lewat Web Animations API / style inline, bukan CSS transition.

Karena itu:

- **Setiap komponen yang memakai `motion/react` WAJIB memanggil `useReducedMotion()`** dan
  menonaktifkan gerak posisi/rotasi/skala. Saat ini hanya 2 dari seluruh dalaman yang
  melakukannya.
- Yang boleh tetap hidup saat reduced-motion: perubahan **warna** dan **opacity** (≤150ms).
  Yang wajib mati: translate, rotate, scale, goyang, count-up (langsung tampilkan angka akhir),
  wipe, flip, layout/shared-element.
- Shimmer skeleton wajib mati.
- **Pergantian tema tidak boleh memicu transisi apa pun.**

### 5.7 State: memuat, kosong, gagal

Aplikasi yang hanya punya happy path terbaca sebagai hasil generate. Ini bagian dari bahasa
desain, bukan tambahan.

**Memuat:**
- Tunggu **<300ms → jangan tampilkan apa pun.** Loader berkedip lebih buruk daripada diam.
- Tunggu **300ms–3s → skeleton**, dan hanya jika geometrinya **persis** sama dengan konten
  final (jumlah baris, tinggi, lebar kolom). Skeleton yang tidak sebangun menyebabkan layout
  shift saat swap — itu justru terasa murah.
- Tunggu **>3s → skeleton + teks status manusiawi** ("Menyiapkan 40 kartu…").
- Bentuk skeleton = **blok solid `bg-surface-2`, sudut tajam, garis rambut** — sesuai bahasa
  cetak. **DILARANG shimmer gradient sweep**; itu penanda AI slop paling khas.
  `Skeleton` saat ini memakai `animate-pulse bg-foreground/5` → ganti ke `bg-surface-2` tanpa
  pulse, atau pulse opacity 0.6↔1 yang dimatikan di reduced-motion.
- Transisi skeleton→konten: crossfade opacity `DUR.base`, **nol pergeseran layout**. Jangan
  slide masuk — itu scroll-reveal terselubung.
- **45 `animate-spin` yang ada sekarang adalah utang.** Spinner hanya boleh untuk aksi dalam
  tombol (`<Button>` loading), tidak pernah untuk memuat halaman atau daftar.

**Kosong — "tidak ada data" punya empat makna dan masing-masing punya komposisi sendiri:**

| Makna | Judul (contoh) | Aksi |
|---|---|---|
| `empty` — user belum membuat/mengerjakan apa pun | "Belum ada pelajaran selesai" | tombol utama: mulai pelajaran pertama |
| `filtered` — filter/pencarian menghapus semua hasil | "Tidak ada yang cocok dengan 'X'" | tombol: hapus filter |
| `syncing` — masih sinkronisasi | "Menyinkronkan progres…" | skeleton, tanpa tombol |
| `error` — permintaan gagal | "Gagal memuat daftar" | tombol: coba lagi + detail teknis dilipat |

Meruntuhkan keempatnya jadi satu ilustrasi kosong adalah kegagalan desain. `EmptyState` yang
ada sekarang hanya melayani kasus pertama.

**Gagal:** bahasa Indonesia manusiawi + jalur pemulihan. **DILARANG** menampilkan kode error
atau stack trace sebagai pesan utama (boleh di dalam `<details>` untuk admin).

### 5.8 Batasan kinerja Android — keras

- Animasikan **hanya `transform` dan `opacity`**. Dilarang menganimasikan `width`, `height`,
  `top`, `left`, `margin`, `padding`, `box-shadow`, `filter`.
- **Nol `backdrop-filter` di dalaman.** `--glass-blur: 24px` dan `--glass-blur-heavy: 40px`
  yang aktif sekarang adalah beban compositing berkelanjutan di GPU mid-range Android, dan ia
  melanggar §4 juga. Hapus dari semua permukaan dalaman.
- `blur()` besar dan scaling pada rectangle solid menyebabkan **banding** — kalau butuh
  gradasi lembut, pakai radial gradient, bukan blur.
- Maksimal **6 elemen beranimasi bersamaan**. Ini juga anggaran stagger di §5.3.
- `will-change` hanya di-set **selama** animasi berlangsung, lalu dihapus. Jangan pernah
  statis di CSS.
- Animasi loop (kalau ada) **pause saat tidak terlihat** — pakai IntersectionObserver.
- `-webkit-tap-highlight-color` sudah di-set ke rust 16% di `body` — pertahankan.
- Input `font-size` **tidak boleh <16px** (cegah zoom otomatis di browser mobile).
- **Hover jangan pernah muncul saat tap.** Semua `hover:` yang mengubah geometri wajib
  dibungkus `@media (hover: hover)`. Di Tailwind 4: `@media (hover:hover){ ... }` di CSS
  komponen, atau varian `hover:` hanya untuk perubahan warna (aman di tap karena hilang cepat).
- **Jangan auto-focus input** di perangkat sentuh — keyboard langsung membuka dan menutupi
  konten.
- Elemen interaktif dalam daftar **tidak boleh punya area mati** antar elemen — perbesar
  `padding`, jangan `margin`.

---

## 6. DAFTAR LARANGAN (bisa di-grep)

Agen verifikasi menjalankan blok ini. **Setiap pola di bawah harus mengembalikan nol hasil di
`src/pages/**`, `src/components/layout/**`, `src/components/ui/**`, `src/components/admin/**`,
dan `src/components/search/**`.** File landing (`src/components/{Hero,CTASection,LearningRoadmap,
ProductShowcase,SocialProof,LandingPage}.tsx`) dikecualikan hanya di aturan yang ditandai
`[landing OK]`.

```bash
R=src; L='src/components/(Hero|CTASection|LearningRoadmap|ProductShowcase|SocialProof|LandingPage).tsx'

# 1. Sudut membulat (kecuali avatar berkomentar)
grep -rnE 'rounded-(sm|md|lg|xl|2xl|3xl|full)\b' $R --include=*.tsx
grep -rnE 'border-radius:\s*(?!0)' $R --include=*.css

# 2. Bayangan
grep -rnE 'shadow-(sm|md|lg|xl|2xl)\b|drop-shadow|box-shadow:' $R --include=*.tsx --include=*.css

# 3. Glassmorphism
grep -rnE 'backdrop-blur|backdrop-filter|glass-subtle|glass-heavy|\bglass\b|bg-white/[0-9]' $R

# 4. Hue Tailwind mentah (semuanya)
grep -rnE '\b(indigo|violet|purple|fuchsia|pink|rose|red|blue|sky|cyan|teal|emerald|green|lime|amber|orange|yellow|slate|gray|zinc|neutral|stone)-[0-9]{2,3}\b' $R --include=*.tsx

# 5. Token shadcn abu-abu di permukaan
grep -rnE 'bg-(background|card|popover|muted|primary|secondary|accent)(/[0-9]+)?\b' $R --include=*.tsx

# 6. Putih murni
grep -rn 'bg-white\b' $R --include=*.tsx

# 7. Gradien & gradien-teks
grep -rnE 'bg-gradient-to-|bg-clip-text|from-[a-z]+-[0-9]|via-[a-z]+-[0-9]' $R

# 8. Bobot di bawah 400
grep -rnE 'font-(light|thin|extralight)' $R                        # [landing OK: 4 lede]

# 9. Faux bold pada serif (DM Serif Display hanya punya 400)
grep -rnE 'font-serif[^"'\'']*font-(bold|semibold|medium)|font-(bold|semibold|medium)[^"'\'']*font-serif' $R
grep -rnE 'font-heading' $R                                        # alias terlarang

# 10. Setengah langkah spasi
grep -rnE '\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|gap|gap-x|gap-y|space-x|space-y)-(0\.5|1\.5|2\.5|3\.5)\b' $R

# 11. Tracking ad-hoc
grep -rnE 'tracking-\[0\.(1|12|14|15|16|18)em\]|tracking-(wide|wider|widest|tight|tighter)' $R

# 12. Ukuran teks arbitrer
grep -rnE 'text-\[(9|10|11|13|15)px\]' $R

# 13. Leading di luar kosakata
grep -rnE 'leading-(tight|snug|loose)|leading-\[(1\.05|1\.08|1\.15|1\.2)\]' $R

# 14. Opacity garis rambut di luar 2 tingkat
grep -rnE '(border|bg)-brand-ink/(8|12|15|25|30|40|50)\b' $R

# 15. Scroll-reveal di dalam aplikasi  ← PELANGGARAN PALING SERIUS
grep -rn 'whileInView' src/pages src/components/layout src/components/ui src/components/admin
grep -rnE "from ['\"].*/Reveal['\"]" src/pages src/components/layout src/components/admin
grep -rn 'once: false' $R

# 16. Durasi pemasaran di dalam aplikasi
grep -rnE 'duration: 0\.[4-9]|duration: [1-9]' src/pages src/components/layout src/components/ui
grep -rnE 'duration-(300|400|500|700|1000)' src/pages src/components/layout

# 17. Parallax
grep -rniE 'parallax|useParallax|translateZ\(' $R

# 18. Magnetic di dalaman
grep -rn 'Magnetic' src/pages src/components/layout src/components/admin

# 19. Spinner sebagai state memuat halaman/daftar
grep -rn 'animate-spin' src/pages src/components/layout

# 20. Shimmer
grep -rniE 'shimmer|animate-shimmer|skeleton-wave' $R

# 21. Focus ring biru & outline
grep -rn '#3b82f6' $R
grep -rnE 'outline:\s*[0-9]' $R --include=*.css

# 22. Border aksen kiri/atas berwarna (tell paling reliabel)
grep -rnE 'border-(l|t)-[248]\b' $R --include=*.tsx

# 23. max-width kedua di dalam shell
grep -rnE 'max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)\b' src/pages

# 24. Rata tengah di level section
grep -rn 'text-center' src/pages src/components/admin

# 25. Emoji sebagai ikon navigasi/label
grep -rnP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' src/components/layout src/pages --include=*.tsx

# 26. Angka tanpa tabular-nums (heuristik: cari stat besar)
grep -rnE 'text-(3xl|4xl|5xl)[^"'\'']*\{[a-zA-Z]*(xp|streak|score|count|total|jumlah)' -i src/pages

# 27. Hex arbitrer alih-alih token
grep -rnE '\[#[0-9a-fA-F]{3,8}\]' $R --include=*.tsx

# 28. Kartu bersarang
grep -rnE 'bg-surface-1[^>]*>[^<]*<[^>]*bg-surface-1' $R

# 29. Grid 3 kolom seragam ikon+judul+paragraf
grep -rn 'grid-cols-3' src/pages

# 30. Kode mati animasi
grep -rn 'animate-fade-in-up\|delay-100\|delay-200\|delay-300\|delay-400\|delay-500' $R
```

**Larangan non-visual (diperiksa manual saat review):**

- Judul/copy generik yang tidak akan pernah diucapkan pemilik keras-keras ("Platform belajar
  all-in-one", "Tingkatkan skill tanpa batas"). Tes: apakah kalimat ini spesifik untuk orang
  Indonesia yang belajar bahasa Jerman? Kalau bisa ditempel di produk lain, ganti.
- Hanya happy path — tidak ada empty/loading/error untuk sebuah daftar atau permintaan.
- Gerak seragam: semua elemen fade-in identik tanpa hierarki.
- Ilustrasi/gambar stok AI: blob 3D abstrak, gradient mesh, orang di kantor terang sempurna.
- Badge tepat di atas `<h1>`. (Eyebrow + garis rambut rust BUKAN badge — itu dibolehkan dan
  memang tanda tangan kami.)
- Baris "3 angka besar" berdiri sendiri tanpa konteks naratif.
- Urutan bernomor "01 02 03" sebagai dekorasi.
- Elemen ikon-saja tanpa `aria-label`.

---

## 7. RENCANA PENERAPAN

Urutan global berdasarkan **dampak ÷ usaha**. Fase 0 dan 1 memblokir yang lain — jangan
kerjakan halaman sebelum token dan shell beres, atau pekerjaannya akan diulang.

### Urutan eksekusi global

| # | Aksi | File | Usaha | Dampak |
|---|---|---|---|---|
| 1 | Token: radius 0, glass mati, focus ring rust, ::selection, surface ladder, font-smoothing | `src/index.css`, `src/styles/liquid-glass.css` | ~20 baris | seluruh app |
| 2 | Shell disamakan dengan landing | `src/App.tsx:92,105-126` | ~4 baris | 13 halaman |
| 3 | `PageWrapper` diperbaiki + `motion.ts` | `src/App.tsx:180-191`, `src/lib/motion.ts` | 1 file baru | setiap rute |
| 4 | Primitif dibangun (§8) | `src/components/ds/**` | 11 komponen | prasyarat 5–11 |
| 5 | Kerangka & navigasi | `layout/**`, `search/**` | sedang | tiap layar |
| 6 | Dashboard | `pages/Dashboard.tsx` | sedang | layar #1 |
| 7 | Loop belajar | `LevelView`, `LessonView`, `CheckpointView`, `CurriculumStudio` | besar | inti produk |
| 8 | Trainer | `VocabTrainerDB`, `VerbTrainer`, `VocabTrainer`, `Simulasi`, `GoetheExam` | besar | inti produk |
| 9 | Fitur AI | `Koreksi`, `Catatan`, `ChatWidget`, `QuickNoteWidget` | sedang | diferensiator |
| 10 | Akun | `Profile`, `Pricing` | kecil | titik konversi |
| 11 | Admin | `Admin`, `AdminAI`, `CanaryDashboard` | besar | 1 user |

---

### 7.0 FASE 0 — Token (blokir semuanya)

`src/index.css`:
- `:116` `--radius: 0.625rem` → `--radius: 0rem`. Ini sendirian mematikan radius di `.st-card`,
  `.st-level-card`, `.st-input`, `.st-segmented`, `.st-study-card`, `.st-note`.
- `.st-badge` dan `.st-progress` memakai `border-radius: 9999px` literal → `0`.
- `.st-card:338` dan `.st-study-card:539` punya `box-shadow` → hapus, ganti
  `border: 1px solid rgba(10,10,10,0.10)`.
- `:186-190` focus ring → blok di §4.5. Tambah `::selection`.
- Tambahkan `--surface-0..3` (§4.3).
- Tambahkan di `html`: `-webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;`
- Hapus kode mati `.animate-fade-in-up` + `.delay-100..500` (`:246-266`, 0 pemakaian).
- Tambahkan utilitas `.num { font-variant-numeric: tabular-nums; }`.

`src/styles/liquid-glass.css`:
- `--glass-radius/-sm/-lg` → `0`; `--glass-shadow/-lg` → `none`;
  `--glass-blur/-heavy` → `0px`; `--glass-bg` → `var(--surface-0)`;
  `--glass-border` → `rgba(10,10,10,0.10)`; hapus `--glass-inset-*`.
  (Menetralkan file ini lebih aman daripada menghapus impor — 12+ komponen masih memakai
  kelasnya. Penghapusan kelas dilakukan di fase per-permukaan.)

`src/components/ui/button.tsx`:
- `variant="outline"` dan `variant="secondary"`: buang `glass-subtle` dan `bg-white/35` →
  `bg-surface-1 border-brand-ink/10 hover:bg-surface-2`.
- `variant="destructive"` dan `link`: `[#8b2500]` → `brand-rust`.
- `size` default `h-8` → tambah varian `touch: "min-h-11 px-4 gap-2"` dan jadikan itu default
  untuk pemakaian di `src/pages/**`.
- Fokus: buang `focus-visible:ring-3 focus-visible:ring-ring/50` (abu-abu) → biarkan focus ring
  global rust bekerja.

### 7.1 FASE 1 — Shell & navigasi (`src/App.tsx`, `src/components/layout/**`)

`App.tsx` `Layout()`:
```
bg-background                                   → bg-brand-cream
main desktop: px-6 py-6                         → px-6 sm:px-10 lg:px-16 py-10 md:py-16
main mobile:  px-4 py-6                         → px-6 sm:px-10 py-10
inner:        max-w-5xl                         → max-w-[1400px]
skip-link:    focus:bg-background focus:text-foreground → focus:bg-brand-ink focus:text-brand-cream
<div className="glass-bg-ambient" />            → hapus (blur ambient, beban GPU Android)
```

`App.tsx` `PageWrapper()`: ganti sesuai §5.4. Fallback Suspense: `<PageSkeleton />` bukan
`<Loader2 className="animate-spin text-slate-400" />`.

`App.tsx:263`: `border-amber-500 rounded-full` → `border-brand-rust` tanpa radius.

`TopNav.tsx`:
- `max-w-[1400px]` sudah benar — pertahankan, sekarang selaras dengan shell.
- Dropdown profil: `.glass` → `bg-surface-0 border border-brand-ink/20`.
- 7 `bg-primary/5|10` → `bg-surface-2` / `bg-brand-ink/5`.
- Tambahkan penguatan border bawah saat `scrollY > 8` (§5.3 poin 3).

`DesktopSidebar.tsx`: 2 `.glass-subtle` → `bg-surface-1`; 5 token shadcn → surface/brand;
item aktif ditandai `bg-surface-2 + border-l-0` **plus** eyebrow rust — bukan `border-l-4`.

`MobileBottomNav.tsx`: target sentuh `min-h-14`, label `text-xs font-bold tracking-[0.2em]
uppercase`, ikon vektor (bukan emoji), state aktif = warna rust + garis rambut atas 2px, tanpa
skala/bounce.

`search/SearchOverlay.tsx:15-17`: `text-blue-700` → `text-brand-rust`, `text-green-700` →
`text-brand-green`, `text-purple-700` → `text-ink-muted`. Overlay ini muncul di semua halaman —
tiga hue mentah di sini merusak seluruh app.
`.glass-subtle`/`.glass-heavy` di file ini → `bg-surface-0` + garis rambut.

`ErrorBoundary.tsx`, `DebugOverlay.tsx`: `red-*`/`yellow-*` → `brand-rust` + `brand-ink`;
`rounded-full` → dihapus. (Debug boleh jelek secara fungsional, tapi tidak boleh membawa hue
asing ke bundle produksi.)

### 7.2 Dashboard (`pages/Dashboard.tsx`)

1. Ganti H1 dengan `<PageHeader eyebrow="Beranda" title={...} accent="…" />` — hapus resep
   `font-serif text-3xl leading-[1.08] text-brand-cream md:text-5xl`.
2. `space-y-8 md:space-y-12` → `space-y-12 md:space-y-20`.
3. Baris statistik: bungkus dengan `<StatRow>`; setiap angka `<Num>` + `tabular-nums`.
   Jangan tiga kolom seragam — buat satu dominan (streak / XP hari ini) dan sisanya reses
   dalam grid `gap-px`.
4. 2 `bg-white` → `bg-surface-1`.
5. Kartu "lanjutkan belajar" → `layoutId={'lesson-' + id}` agar morph ke `/lesson/:id` (§5.5e).
6. Choreography mount: maksimal 6 anak dengan `<Enter>` (§8.2). Bukan `<Reveal>`.
7. State: `empty` (belum mulai) vs `syncing` vs `error` — tiga komposisi (§5.7).

### 7.3 Loop belajar (`LevelView`, `LessonView`, `CheckpointView`, `CurriculumStudio`)

1. **Tiga H1 berbeda → satu `<PageHeader>`.** `LessonView` punya dua resep judul dalam satu
   file (`text-2xl` tanpa leading, dan `text-3xl md:text-5xl`) — keduanya diganti.
2. **28 `bg-white`** (`LessonView` 11, `CheckpointView` 7, `LevelView` 4, `CurriculumStudio`)
   → `bg-surface-1`.
3. Daftar pelajaran: `grid gap-px bg-brand-ink/10`, sel `bg-surface-1 p-4 md:p-6`,
   `min-h-14`, seluruh sel dapat diklik (tanpa area mati).
4. Progres bab: `<ProgressRail>` scroll-linked (§8.7), mulai 8%.
5. Prosa materi: `max-w-[68ch] text-base leading-relaxed`. **Tidak ada gerak apa pun pada teks
   materi.**
6. `.st-card` di `LevelView.tsx:153` dan `CurriculumStudio` (2×) → `<Surface>`.
7. 6 `variant="outline"|"secondary"` (`LessonView` 4, `LevelView` 1, `CheckpointView` 1) →
   sudah aman setelah Fase 0, tapi tambahkan `size="touch"`.
8. `CheckpointView`: umpan balik jawaban sesuai §5.5a. Ini prioritas tertinggi di kelompok ini.
9. Penyelesaian pelajaran: `<CompletionWipe>` (§8.9), maks 1×.
10. Header pelajaran memadat saat scroll (§5.3 poin 1) — inilah "animasi saat scroll" yang
    dijanjikan ke pemilik, dan satu-satunya yang boleh terasa mewah.

### 7.4 Trainer (`VocabTrainerDB`, `VerbTrainer`, `VocabTrainer`, `Simulasi`, `GoetheExam`)

1. `VerbTrainer.tsx:140,152,167` — tiga `<h4>` **tanpa className sama sekali**. Beri resep
   judul kartu sans.
2. Judul: `VocabTrainerDB` (`leading-none tracking-tight`) dan `VerbTrainer` (`leading-none`,
   tanpa ladder) → `<PageHeader>`.
3. **Ekstrak flip card** dari `VocabTrainerDB.tsx:596` jadi `<FlipCard>` (§8.8) dan pakai di
   semua trainer. Ini satu-satunya `<motion.>` di seluruh dalaman dan sudah benar — jadikan
   standar, jangan tulis ulang.
4. Tombol jawaban: `min-h-14`, `<AnswerFeedback>` (§8.10), umpan balik <100ms, optimistic.
5. Skor/timer/akurasi: `<Num>` + `tabular-nums` wajib. Timer tanpa tabular-nums bergoyang tiap
   detik — cacat yang paling terlihat di trainer.
6. `Simulasi.tsx`: 10 `bg-white`, 5 max-w berbeda, `.glass-heavy`, `text-center` level section
   → semua dibersihkan.
7. Kartu benar/salah: `bg-surface-1` + border `brand-green`/`brand-rust`, tanpa `border-l-4`.
8. `animate-spin` saat memuat set kartu → `<SkeletonMirror rows={…}>` yang meniru bentuk kartu.

### 7.5 Fitur AI (`Koreksi`, `Catatan`, `ChatWidget`, `QuickNoteWidget`)

1. `Koreksi.tsx` — **`font-serif ... font-bold` = faux bold.** Hapus `font-bold`, ganti ke
   `<PageHeader>`.
2. Diff koreksi: teks salah `line-through text-ink-subtle`, koreksi `text-brand-rust`
   (bukan hijau/merah Tailwind). Ini kesempatan terbaik memakai palet secara semantik.
3. `Catatan.tsx`: `max-w-5xl/xl/xs` → hapus; daftar catatan → `gap-px`; 7 `bg-white` →
   `bg-surface-1`.
4. Streaming respons AI: **tanpa animasi masuk per token.** Teks muncul; hanya kursor blok
   `bg-brand-rust` 1ch yang berkedip 1s. Fade per token membuat teks tidak bisa dibaca.
5. Loading AI: teks status manusiawi ("Herr Deutsch sedang membaca…"), bukan spinner.
6. `ChatWidget` / `QuickNoteWidget`: sheet naik `DUR.panel` / turun `DUR.base`, sudut tajam,
   `bg-surface-0`, garis rambut `ink/20`, tanpa backdrop-blur (pakai `bg-brand-ink/40` polos).

### 7.6 Akun (`Profile`, `Pricing`)

1. `Profile.tsx:91` heading sans tanpa resep → perbaiki. H1 Profile sudah paling dekat dengan
   landing — tetap ganti ke `<PageHeader>` demi konsistensi.
2. Ini satu-satunya tempat yang boleh punya **satu** blok `whileInView` (grafik statistik di
   kaki halaman), `once: true`, ≤200ms, offset ≤8px.
3. `Pricing.tsx`: harga `Rp49.000` wajib `tabular-nums`. Perbandingan Free vs Pro → tabel
   `gap-px`, bukan dua kartu melayang. Kolom Pro ditandai `bg-brand-ink` + teks cream (satu
   section terbalik per halaman — pakai jatahnya di sini).
4. Avatar: satu-satunya `rounded-full` yang dibolehkan, dengan komentar.
5. CTA upgrade: satu tombol utama, `min-h-11`, tanpa `<Magnetic>`.

### 7.7 Admin (`Admin`, `AdminAI`, `CanaryDashboard`, `admin/**`)

Dikerjakan terakhir (1 user), tapi tidak dikecualikan — pemilik memakainya, dan inkonsistensi
di sini terasa saat dia berpindah dari dashboard ke admin.

1. **11 `font-heading` → `font-serif`.** Ini satu-satunya tempat alias itu hidup.
2. **7 heading sans tanpa resep** di `AdminAI.tsx` (`1431,1517,1779,1865,1894,1922,1963`) dan
   `Admin.tsx` → resep judul sub-bagian sans.
3. `max-w-6xl` di dalam shell `max-w-[1400px]` → hapus (sebelumnya mati karena shell 5xl).
4. **Tabel → `<DataTable>`** (§8.6): `gap-px`, header `bg-surface-2`, semua angka
   `tabular-nums`, tanpa zebra striping (zebra + hairline = redundan dan berisik).
5. 12 `bg-white` di `AdminAI` → `bg-surface-1`. `.glass-heavy` di `AdminUI`/`AddSecretModal` →
   `bg-surface-0`.
6. `ui/pagination.tsx:44` `rounded-lg` → hapus.
7. Admin **tidak boleh punya animasi masuk sama sekali** selain transisi rute. Ini layar kerja.

---

## 8. PRIMITIF YANG HARUS DIBANGUN

Bangun semuanya di `src/components/ds/` **sebelum** menyentuh halaman mana pun. API di bawah
mengikat — agen penerap tidak boleh mengarang prop tambahan.

### 8.1 `src/lib/motion.ts` — token gerak

```ts
export const DUR: {
  instant: 0.08; quick: 0.14; base: 0.20;
  panel: 0.28; exit: 0.16; route: 0.32; celebrate: 0.70;
};
export const EASE: {
  enter: [0.22, 1, 0.36, 1];
  exit:  [0.4, 0, 1, 1];
  move:  [0.2, 0, 0, 1];
  express: [0.22, 1, 0.36, 1];
};
/** Menghitung stagger di dalam anggaran 500ms. */
export function staggerFor(count: number): number;   // = min(0.05, (0.5 - DUR.base) / min(count, 6))
/** Varian container + item siap pakai untuk choreography mount. */
export const enterContainer: Variants;
export const enterItem: Variants;
```

### 8.2 `<Enter>` — pengganti `<Reveal>` untuk dalaman

```tsx
interface EnterProps {
  children: ReactNode;
  /** Urutan dalam choreography. index ≥ 6 → tanpa delay, muncul instan. */
  index?: number;          // default 0
  /** Offset vertikal awal, px. Maks 12. */
  y?: number;              // default 8
  className?: string;
}
export function Enter(props: EnterProps): JSX.Element;
```

- Dipicu **oleh mount**, bukan viewport. Tidak ada `whileInView`. Tidak ada `viewport`.
- `duration: DUR.base`, `ease: EASE.enter`, `delay: index < 6 ? index * staggerFor(n) : 0`.
- `useReducedMotion()` → render `<div className={className}>` polos.
- **`<Reveal>` yang ada tetap di `src/components/Reveal.tsx` dan hanya boleh diimpor oleh file
  landing.** Tambahkan komentar di kepalanya: `// LANDING ONLY — lihat docs/DESIGN-LANGUAGE.md §5.1`

### 8.3 `<PageHeader>` — 18 resep H1 → 1

```tsx
interface PageHeaderProps {
  /** Label taksonomi, uppercase otomatis. Selalu didahului garis rambut rust. */
  eyebrow: string;
  /** Judul. Bagian yang di-italic rust ditulis lewat `accent`. */
  title: string;
  /** Frasa dalam `title` yang dirender `italic text-brand-rust`. Opsional tapi sangat dianjurkan. */
  accent?: string;
  /** Paragraf pengantar, maks ~2 baris. */
  lede?: string;
  /** Aksi di sisi kanan (desktop) / di bawah (mobile). Maks 2 tombol. */
  actions?: ReactNode;
  /** Header memadat jadi rule sticky saat scroll. Default true di halaman pelajaran. */
  condenseOnScroll?: boolean;   // default false
  /** Render di atas permukaan ink. */
  onInk?: boolean;              // default false
  /** Overlay tekstur grid 60px. */
  texture?: boolean;            // default true
}
```

Render tetap:
```
<div className="relative mb-10 md:mb-16">
  [texture grid 60px]
  <div className="mb-4 flex items-center gap-3">
    <div className="h-px w-12 bg-brand-rust" />
    <span className="text-xs font-bold tracking-[0.2em] uppercase text-ink-muted">{eyebrow}</span>
  </div>
  <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.02em] text-brand-ink">
    {title dengan accent → <em className="italic text-brand-rust">}
  </h1>
  {lede && <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-ink-muted">{lede}</p>}
</div>
```

### 8.4 `<Eyebrow>` & `<Section>`

```tsx
interface EyebrowProps { children: string; onInk?: boolean; rule?: boolean; /* default true */ }

interface SectionProps {
  eyebrow?: string;
  title?: string;            // dirender serif text-2xl md:text-3xl
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}
```
`<Section>` memberi `mb-6` antara judul dan isi, dan tidak menambah margin luar — jarak
antar-section diatur oleh `space-y-12 md:space-y-20` di root halaman.

### 8.5 `<Surface>`, `<HairlineGrid>`, `<Num>`

```tsx
interface SurfaceProps {
  level?: 0 | 1 | 2 | 3;     // default 1  → surface-0..3
  border?: boolean;          // default true → border-brand-ink/10
  as?: ElementType;          // default 'div'
  className?: string;
  children: ReactNode;
}

/** Kontainer grid dengan garis rambut sebagai gap. Anaknya WAJIB <Surface level={1}>. */
interface HairlineGridProps {
  cols?: 1 | 2 | 3 | 4;                  // default 1
  colsMd?: 1 | 2 | 3 | 4;
  /** Grid asimetris editorial 7fr/3fr. Mengabaikan cols. */
  split?: '7-3' | '3-7' | false;         // default false
  className?: string;
  children: ReactNode;
}
// render: grid gap-px bg-brand-ink/10

/** Angka. SELALU dipakai untuk nilai yang bisa berubah. */
interface NumProps {
  value: number | string;
  /** Animasikan dari nilai sebelumnya. 500ms, EASE.enter. Mati saat reduced-motion. */
  countUp?: boolean;                     // default false
  /** Pemformatan lokal id-ID. */
  format?: 'plain' | 'idr' | 'percent' | 'duration';  // default 'plain'
  className?: string;
}
// selalu merender: font-sans tabular-nums
```

### 8.6 `<DataTable>` — bungkus tabel admin & daftar padat

```tsx
interface Column<T> {
  key: string;
  header: string;                        // dirender eyebrow-style
  align?: 'start' | 'end';               // 'end' otomatis untuk numeric
  numeric?: boolean;                     // → tabular-nums
  width?: string;                        // grid-template fraction
  render?: (row: T) => ReactNode;
}
interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  /** Wajib. Menentukan komposisi kosong/gagal. */
  state: 'ready' | 'loading' | 'empty' | 'filtered' | 'error';
  onRetry?: () => void;
  onClearFilter?: () => void;
  emptyAction?: ReactNode;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
}
```
Render: header `bg-surface-2` + eyebrow; baris `gap-px bg-brand-ink/10`, sel `bg-surface-1
px-4 py-3`; **tanpa zebra**; horizontal scroll di kontainer sendiri (`overflow-x-auto`), badan
halaman tidak pernah scroll horizontal.

### 8.7 `<StatRow>`, `<Stat>`, `<ProgressRail>`

```tsx
interface StatProps {
  label: string;                 // eyebrow-style
  value: number | string;
  format?: NumProps['format'];
  /** Satu stat per baris boleh dominan — ukurannya naik, sisanya reses. */
  emphasis?: boolean;            // default false
  delta?: { value: number; label: string };   // mis. "+120 hari ini"
  countUp?: boolean;
}
interface StatRowProps { children: ReactNode; }   // HairlineGrid + logika emphasis

interface ProgressRailProps {
  /** 0..1 */
  value: number;
  /** Nilai minimum yang selalu ditampilkan (endowed progress). */
  floor?: number;                // default 0.08
  orientation?: 'x' | 'y';       // default 'x'
  /** Terikat ke scroll container, bukan ke `value`. */
  scrollLinked?: boolean;        // default false
  label?: string;
}
```
`ProgressRail` menganimasikan `scaleX`/`scaleY`, **tidak pernah `width`**. Tinggi 2px, warna
`bg-brand-rust`, rel `bg-brand-ink/10`, sudut tajam.

### 8.8 `<FlipCard>`

```tsx
interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  flipped: boolean;              // dikendalikan dari luar
  onFlip?: () => void;
  className?: string;
}
```
`rotateY`, `DUR.route`, `EASE.move`, `preserve-3d`, `backface-visibility: hidden`,
`perspective: 1000px`. Reduced-motion → crossfade `DUR.quick`.
Diekstrak dari `VocabTrainerDB.tsx:596` — jangan implementasi ulang dari nol.

### 8.9 `<StateBlock>`, `<SkeletonMirror>`, `<CompletionWipe>`

```tsx
interface StateBlockProps {
  /** Empat makna berbeda. Tidak ada default — pemanggil harus memutuskan. */
  kind: 'empty' | 'filtered' | 'syncing' | 'error';
  title: string;
  description?: string;
  action?: ReactNode;
  /** Hanya untuk kind='error'. Dirender di dalam <details>. */
  technical?: string;
}

/** Skeleton yang meniru geometri konten final. Wajib menerima bentuknya, bukan menebak. */
interface SkeletonMirrorProps {
  shape: 'stat-row' | 'lesson-list' | 'card-grid' | 'table' | 'prose' | 'page';
  rows?: number;                 // default sesuai shape
}
// blok solid bg-surface-2, sudut tajam, tanpa shimmer.
// Tidak dirender sama sekali kalau tunggu <300ms — pemanggil mengatur lewat useDelayedFlag.

interface CompletionWipeProps {
  children: ReactNode;           // header yang disapu
  active: boolean;
  label?: string;                // default "SELESAI"
  onDone?: () => void;
}
// rule rust 2px menyapu kiri→kanan, DUR.celebrate, EASE.express, sekali. Reduced-motion → label saja.
```

Tambahan hook: `useDelayedFlag(active: boolean, delayMs = 300): boolean` — supaya skeleton
tidak berkedip pada permintaan cepat.

### 8.10 `<AnswerFeedback>` / `useAnswerFeedback`

```tsx
type AnswerState = 'idle' | 'correct' | 'wrong' | 'revealed';

interface AnswerFeedbackProps {
  state: AnswerState;
  children: ReactNode;           // isi tombol/kartu jawaban
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}
```
Wajib memenuhi enam microstate: `default → hover (hanya @media hover:hover) → focus-visible →
active → disabled → loading`. Ini yang paling sering hilang dan paling terasa saat ada.
Gerak persis: §5.5a. Reduced-motion → warna + ikon saja.

### 8.11 `<Sheet>` / `<Modal>` (mengganti pemakaian `.glass-heavy`)

```tsx
interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** mobile: naik dari bawah; desktop: dialog tengah. Otomatis. */
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}
```
Masuk `DUR.panel`/`EASE.enter`, keluar `DUR.base`/`EASE.exit`. Backdrop `bg-brand-ink/40`
polos — **tanpa `backdrop-blur`**. Permukaan `bg-surface-0`, garis rambut `ink/20`, sudut tajam.
Focus trap + `aria-modal` + kembalikan fokus ke pemicu saat tutup.

---

## 9. DEFINISI SELESAI

Sebuah permukaan dianggap selesai kalau **semua** ini benar:

- [ ] Seluruh blok grep §6 mengembalikan nol untuk file tersebut.
- [ ] Judul halaman memakai `<PageHeader>`; nol resep H1 lokal.
- [ ] Setiap angka yang bisa berubah memakai `<Num>` / `tabular-nums`.
- [ ] Setiap daftar/permintaan punya empat state (`ready/loading/empty|filtered/error`) dengan
      komposisi berbeda.
- [ ] Setiap elemen interaktif punya enam microstate dan `min-h-11`.
- [ ] Setiap komponen `motion/react` memanggil `useReducedMotion()`.
- [ ] Total choreography mount ≤500ms, ≤6 elemen beranimasi.
- [ ] Nol `whileInView` (kecuali maksimal satu blok sekunder di `Profile`).
- [ ] Hanya `transform` dan `opacity` yang dianimasikan.
- [ ] Elemen ikon-saja punya `aria-label`; kontras teks lolos WCAG AA memakai ramp
      `ink-muted`/`ink-subtle`/`cream-muted`/`cream-subtle` yang sudah terukur.

---

## 10. RINGKASAN SATU HALAMAN (tempel di PR)

```
WARNA      brand-ink #0a0a0a · brand-cream #f5f0eb · brand-rust #8b2500 · brand-tan #c8956c
           brand-green #2d8a4e (status saja) · teks: ink-muted / ink-subtle / cream-muted / cream-subtle
PERMUKAAN  surface-0 #f5f0eb · surface-1 #faf7f4 · surface-2 #ece5dd · surface-3 #0a0a0a
GARIS      brand-ink/10 (default) · brand-ink/20 (struktural). Tidak ada nilai lain.
SUDUT      0. Selalu. (kecuali avatar)
BAYANGAN   tidak ada. Kedalaman = surface + hairline.
SERIF      hanya ≥24px, tidak pernah untuk angka, tidak pernah dengan font-bold.
SPASI      1 2 3 4 6 8 10 12 16 20 24 32 (+gap-px). Tanpa setengah langkah.
RITME      section space-y-12 md:space-y-20 · header mb-10 md:mb-16 · kartu p-4 md:p-6
SHELL      bg-brand-cream · max-w-[1400px] · px-6 sm:px-10 lg:px-16 · py-10 md:py-16
GERAK      app 80–320ms · exit < enter · easing enter [0.22,1,0.36,1] · move [0.2,0,0,1]
SCROLL     hanya scroll-LINKED (header memadat, rel progres). Nol whileInView di pages.
BUDGET     choreography ≤500ms total, ≤6 elemen, stagger ≤50ms.
SENTUH     min-h-11 · input text-base · hover di @media(hover:hover) · nol backdrop-filter
```

---

*Pertanyaan tentang aturan yang tidak tercakup di sini: default-nya adalah **jangan tambahkan
variabel baru.** Cari padanan terdekat di tabel yang sudah ada dan pakai itu. Sistem yang
sedikit tidak sempurna tapi konsisten selalu terbaca lebih mahal daripada sistem yang sempurna
di tiap layar tapi berbeda di antara layar.*

---

# AMANDEMEN 1 — Liquid Glass (permintaan pemilik, sesudah spesifikasi ini ditulis)

**Status:** menimpa §4 dan larangan #3 sebagian. Bagian lain dokumen tetap berlaku penuh.

Pemilik meminta liquid glass dan bahasa iOS terbaru *setelah* spesifikasi di atas disusun,
jadi penulisnya tidak mengetahuinya. Larangan #3 (`glassmorphism`) dan "nol `backdrop-filter`"
di §5 dikoreksi di sini — tetapi hanya sejauh yang bisa dipertahankan tanpa merusak bahasa
editorial.

## Yang sudah ada

`src/styles/liquid-glass.css` — 275 baris, 12 kelas, 21 `backdrop-filter`. Sudah bernuansa
merek: `.glass-nav` memakai `rgba(245,240,235,0.7)`, yaitu brand cream 70%. Sudah dipakai di
TopNav, MobileBottomNav, DesktopSidebar, SearchOverlay. Ini bukan penambahan dari nol.

## Aturan

**Glass hanya untuk CHROME. Tidak pernah untuk KONTEN.**

Ini panduan Apple sendiri untuk Liquid Glass: material kaca adalah lapisan yang melayang
DI ATAS konten — tab bar, toolbar, sheet, overlay. Lapisan konten tetap solid. Membalik
aturan itu, yakni menempelkan kaca ke setiap permukaan, menghapus hierarki: kalau semuanya
mengambang, tidak ada lagi yang di atas apa pun. Itu justru sinyal desain generik yang
dilarang §6.

| BOLEH glass | HARUS solid |
|---|---|
| TopNav, MobileBottomNav, DesktopSidebar | Kartu pelajaran, kartu statistik |
| SearchOverlay, Dialog, Sheet | Tabel data (admin, riwayat order) |
| Toast, tooltip, popover | Isi halaman, blok teks, daftar |
| Tombol mengambang (ChatWidget, QuickNote) | Field input dan form |

## Kaca tetap BERSUDUT TAJAM

§4 menang di sini. `--glass-radius: 0` dan `--glass-shadow: none` **tetap diterapkan**.

Kaca bersudut tajam tetap terbaca sebagai kaca — materialnya datang dari blur dan saturasi,
bukan dari sudutnya. Mempertahankan sudut tajam berarti aplikasi ini berbicara satu bahasa,
bukan dua yang bertengkar. Halaman terasa seperti kertas; chrome terasa seperti kaca di
atasnya; keduanya bersudut tajam.

Pengecualian radius tunggal di §4 (avatar) tidak berubah.

## Dua penyimpangan yang harus diperbaiki

1. `src/components/ui/input.tsx` memakai `glass-subtle` pada field form. Latar tembus pandang
   di atas konten yang berubah-ubah membuat kontras teks tidak bisa diprediksi — kelas cacat
   yang sama yang dibersihkan sepanjang audit ini. Ganti ke permukaan solid.
2. `src/components/admin/AdminUI.tsx` memakai glass pada permukaan tabel. Angka harus tajam,
   bukan berkabut. Ganti ke solid.

## Anggaran kinerja (Android mid-range)

Kekhawatiran §5 tetap sah, dan dijawab dengan membatasi jumlah — bukan menghapus:

- Maksimal **2 lapisan blur aktif bersamaan** di satu layar. Chrome tetap (nav + satu overlay)
  memenuhi anggaran ini; ia tidak bertambah saat user menggulir.
- **DILARANG** memakai glass pada item di dalam daftar panjang: katalog 86 pelajaran, tabel
  admin, daftar kosakata 2.472 baris. Satu blur untuk kontainer, tidak pernah per baris.
- Turunkan `--glass-blur` dari 24px ke **16px**, dan `--glass-blur-heavy` dari 40px ke **24px**.
  Biaya compositing naik tajam terhadap radius blur; di atas ~16px mata hampir tidak bisa
  membedakannya, GPU sangat bisa.
- Sediakan fallback solid: `@supports not (backdrop-filter: blur(1px))`.
- Tetap **dilarang** menganimasikan `filter`/`backdrop-filter` (§5 tidak berubah).

## Grep #3 diganti

Larangan lama menandai semua pemakaian glass. Yang benar adalah menandai glass **di luar
chrome**:

```bash
# 3. Glass di permukaan konten (chrome dikecualikan)
grep -rnE 'backdrop-blur|backdrop-filter|glass-subtle|glass-heavy|\bglass\b' src/ --include=*.tsx \
  | grep -vE 'layout/(TopNav|MobileBottomNav|DesktopSidebar)|search/SearchOverlay|ui/(dialog|toast|tooltip)'
```

## Yang membatalkan amandemen ini

Kalau pemilik secara eksplisit meminta glass pada permukaan konten setelah membaca alasan di
atas, turuti — ini produknya. Dokumen ini merekam penilaian, bukan larangan.
