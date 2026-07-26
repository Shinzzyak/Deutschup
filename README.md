# DeutschUp 🇩🇪

Platform belajar Bahasa Jerman interaktif berbasis AI.

## Fitur

- **Kurikulum Terstruktur** — Level A1-B2 dengan XP dan streak tracking
- **Vocab Trainer** — Flashcard spaced repetition + contoh kalimat AI
- **Kamus Mini** — Referensi verb Jerman lengkap
- **Koreksi Kalimat** — AI koreksi grammar dan tata bahasa
- **Catatan Belajar** — Auto-generated study plan
- **Simulasi Ujian** — Mock test A1-B2 dengan AI-powered scoring
- **Chat AI (Herr Deutsch)** — Tutor bahasa Jerman virtual
- **Pembayaran** — Integrasi Bayar.gg untuk upgrade Pro

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + Zustand
- **Backend:** Cloudflare Pages Functions (TypeScript, handler di `api/`)
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini API
- **Auth:** Clerk (Google OAuth) — Supabase dipakai hanya sebagai database
- **Payment:** Bayar.gg

## Run Locally

**Prerequisites:** Node.js v18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables di `.env.local`:
   ```
   GEMINI_API_KEY=your_key
   ADMIN_EMAIL=your_email
   VITE_ADMIN_EMAIL=your_email
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   IPAYMU_VA=your_va
   IPAYMU_API_KEY=your_api_key
   IPAYMU_URL=your_ipaymu_url
   APP_URL=http://localhost:5173
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## Deployment (Cloudflare Pages)

Deploy dijalankan lewat GitHub Actions: `.github/workflows/cf-pages-deploy.yml`.

- Frontend: SPA Vite di `dist/`, fallback routing via `public/_redirects`
- Backend: Pages Functions — `functions/api/[[path]].ts` merutekan `/api/*` ke handler di `api/`
- Security + cache header: `public/_headers`

Environment variables diset di Cloudflare Pages → Project Settings (workflow di atas
me-restore sebagian setelah deploy karena `wrangler pages deploy` bisa menghapusnya):
- `GEMINI_API_KEY`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `CLERK_SECRET_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`
- `BAYAR_GG_API_KEY`
- `ADMIN_EMAIL`, `VITE_ADMIN_EMAIL`
- `APP_URL`

## License

Private — DeutschUp
