<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2606d214-cab6-4242-bdfd-6070cb05f75e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`

2. Set environment variables in `.env.local`:
   - `GEMINI_API_KEY=...`
   - `ADMIN_EMAIL=abdullahalmughiroh@gmail.com`
   - `VITE_ADMIN_EMAIL=abdullahalmughiroh@gmail.com`
   - `VITE_FIREBASE_API_KEY=...` (wajib, jangan commit key asli ke repo)
3. Run the app:
   `npm run dev`


## Deployment (Vercel)

Aplikasi sudah direfactor untuk model **Vercel Serverless Functions**:
- Semua backend endpoint berjalan dari file di folder `api/` (mis. `/api/chat`, `/api/admin/*`, `/api/payment/*`).
- Frontend tetap SPA Vite, dengan rewrite ke `index.html` untuk non-API route.

Pastikan environment variables berikut diset di Vercel Project Settings:
- `GEMINI_API_KEY`
- `ADMIN_EMAIL=abdullahalmughiroh@gmail.com`
- `VITE_ADMIN_EMAIL=abdullahalmughiroh@gmail.com`
- `IPAYMU_VA`, `IPAYMU_API_KEY`, `IPAYMU_URL`
- `APP_URL`


> Security note: jika API key Firebase pernah ter-publish, segera rotate key di Google Cloud Console lalu update Vercel env variables.


## Firebase Auth domain checklist

Jika login Google dipakai di custom domain production, tambahkan domain tersebut di Firebase Console:
Authentication → Settings → Authorized domains.

Contoh untuk production ini:
- `deutschup.sintec.my.id`

Tanpa ini biasanya muncul error `auth/unauthorized-domain` atau login redirect balik ke awal.


## Supabase Migration (Auth + User Profile)

1. Install package: `npm install @supabase/supabase-js`
2. Set env:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run SQL in Supabase SQL Editor: `SUPABASE_SETUP.sql`.
4. Enable Google OAuth provider in Supabase Auth and set redirect URLs:
   - `http://localhost:5173/`
   - `https://deutschup.sintec.my.id/`

Note: DELETE policy sengaja tidak dibuat untuk mencegah user menghapus profil sendiri tanpa kontrol tambahan.
