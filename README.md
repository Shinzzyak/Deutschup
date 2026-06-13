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
- **Pembayaran** — Integrasi iPaymu untuk upgrade Pro

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + Zustand
- **Backend:** Vercel Serverless Functions (TypeScript)
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini API
- **Auth:** Supabase Auth (Google OAuth)
- **Payment:** iPaymu

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

## Deployment (Vercel)

Aplikasi sudah dikonfigurasi untuk Vercel:
- Frontend: SPA Vite dengan rewrite ke `index.html`
- Backend: Serverless Functions di folder `api/`

Pastikan environment variables berikut diset di Vercel Project Settings:
- `GEMINI_API_KEY`
- `ADMIN_EMAIL`
- `VITE_ADMIN_EMAIL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `IPAYMU_VA`, `IPAYMU_API_KEY`, `IPAYMU_URL`
- `APP_URL`

## License

Private — DeutschUp

