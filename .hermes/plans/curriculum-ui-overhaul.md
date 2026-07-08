# DeutschUp Curriculum + UI/UX Overhaul

## Intent
Rombak area authenticated app supaya konsisten dengan landing page editorial style dan memanfaatkan full curriculum database, tanpa membuang engine latihan lama.

## Current inventory
- Landing style: cream background, ink/rust/gold palette, serif editorial headings, flag stripe, subtle grid, sharp cards.
- Curriculum static index: 86 units total.
  - A1: 26 lessons + 4 checkpoints.
  - A2: 18 lessons + 4 checkpoints.
  - B1: 14 lessons + 4 checkpoints.
  - B2: 12 lessons + 4 checkpoints.
- DB vocabulary: `curriculum_vocabulary` already exposed on `/vocab` and count helpers.
- Existing exercise routes stay authoritative:
  - `/lesson/:id`
  - `/checkpoint/:id`
  - `/vocab`
  - `/simulasi`, `/goethe`, `/verbs`

## Phase 1 — Curriculum Studio shell
1. Add tested helper `buildCurriculumOverview()` as shared source for level counts, unit totals, checkpoint grouping, and current/next unit metadata.
2. Add `/curriculum` route with landing-style editorial UI:
   - Overview hero: total roadmap units, DB vocabulary, current level, progress.
   - Level cards: A1-B2 with lesson/checkpoint/vocab counts.
   - Unit map: lessons/checkpoints link to old engines.
   - Practice rail: keep existing exercises visible.
3. Update nav labels so users see “Kurikulum” instead of only “Level”.
4. Keep `/level/:id` and old routes intact for backwards compatibility.

## Phase 2 — DB-first lesson detail
1. Gradually hydrate lesson pages from `curriculum_lessons` when available.
2. Fallback to existing static `courseData` so exercises never break.
3. Add lesson-level vocab/context panels from `curriculum_vocabulary`.

## Phase 3 — Full design-system parity
1. Extract reusable editorial components/tokens from landing/dashboard pages.
2. Apply to LessonView, CheckpointView, Simulasi, Goethe, Catatan.
3. Browser QA desktop + mobile after every page batch.

## Verification gates
- TDD for curriculum helper and page behavior.
- Full `npm test`.
- Build with dummy public env only; no secrets in Vite bundle.
- Browser smoke `/curriculum`, `/vocab`, `/lesson/a1-1`, `/checkpoint/a1-checkpoint-1`.
- Include untracked files in static scan and independent review.
- Delete `dist/` after dummy build.
