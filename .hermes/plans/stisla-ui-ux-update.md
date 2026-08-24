# Stisla-inspired UI/UX Update for DeutschUp

## Reference scan
- Stisla repo is a modern CSS/component system with token-first architecture.
- Useful patterns for DeutschUp: `.page` rhythm, card/header/body/footer anatomy, dense tables, soft intent badges, compact dashboard stats, explicit runtime states.
- Avoid direct template copy. Adapt the design language into DeutschUp Tailwind/CSS tokens so auth, routing, and Supabase flows stay stable.

## Current DeutschUp mapping
- `/vocab` uses `curriculum_vocabulary` directly and is the safest pilot for database-aware UI.
- `/dashboard` is progress-store/user-session heavy, but can display database coverage from `curriculum_vocabulary` without changing learning logic.
- `/level/:id` still uses local `courseIndex` for lesson routing. It can show database context per level while preserving existing lesson/checkpoint behavior.

## Implementation steps
1. Add reusable vocabulary stats helper with tests.
2. Restyle `/vocab` into a Stisla-inspired command center: hero, level matrix, filter card, dense DB table, status badges.
3. Add dashboard database coverage panel from live Supabase counts.
4. Add level database context panel per CEFR level.
5. Run targeted tests, full unit tests/build, and browser smoke on dashboard/vocab/level.

## Verification gates
- `npm test -- src/lib/__tests__/vocabStats.test.ts`
- `npm test`
- `npm run build`
- Browser smoke against local preview routes: `/`, `/vocab`, `/level/A1`
