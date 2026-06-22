# Global Search Feature — Design Document

**Date:** 2026-06-22  
**Status:** Design ready for implementation  
**Scope:** Global search across vocabulary, lessons, and verb conjugations

---

## 1. Problem Statement

Users currently have no way to quickly find a specific word, lesson topic, or verb conjugation across the entire app. Each page (VocabTrainer, VerbTrainer, LessonView) has its own local search, but there's no unified entry point. This forces users to navigate to the correct page first, then search within it.

**Goal:** One keyboard shortcut opens a search overlay that finds anything in the app instantly.

---

## 2. Data Sources to Index

All data lives in static TypeScript modules — no API calls needed for search.

| Source | File | Record Count | Searchable Fields |
|--------|------|-------------|-------------------|
| Lesson Vocabulary | `src/data/lessons.ts` → `allVocab` | ~368 entries | `word`, `translation`, `article`, `exampleSentence`, `phonetic` |
| Lesson Metadata | `src/data/lessons.ts` → `courseData` | 70 lessons | `title`, `grammarDescription`, `canDoGoals`, `id` |
| Verb Conjugations | `src/data/verbs.ts` → `verbDatabase` | 30 verbs | `infinitive`, `translation`, `type`, all present/perfekt/prateritum forms |
| Common Vocabulary | `src/data/vocabulary.ts` | 368 entries | `german`, `indonesian`, `level` |
| Vocabulary Index | `src/data/lessonIndex.ts` → `courseIndex` | 70 entries | `title`, `canDoGoals`, `id` |

**Note:** `allVocab` (from `lessons.ts`) and `vocabulary.ts` overlap significantly. The search index should deduplicate by German word, preferring the richer `allVocab` record (which includes `article`, `phonetic`, `exampleSentence`).

---

## 3. Component Architecture

### 3.1 New Files

```
src/
├── components/
│   └── search/
│       ├── SearchOverlay.tsx      — Main overlay container (modal)
│       ├── SearchInput.tsx        — Input field with keyboard hints
│       ├── SearchResultGroup.tsx  — Grouped result section (Vocabulary / Lessons / Verbs)
│       ├── SearchResultItem.tsx   — Single clickable result row
│       └── useSearch.ts           — Custom hook: indexing + fuzzy search + recent searches
```

### 3.2 Component Responsibilities

**`SearchOverlay.tsx`**
- Renders full-screen overlay (mobile) or centered modal (desktop)
- Manages open/close state via React context or zustand store
- Handles Escape key to close
- Renders `<SearchInput />` at top, results below
- Animates in/out with `framer-motion` (already in project)

**`SearchInput.tsx`**
- Text input with auto-focus
- Shows keyboard shortcut hint (`⌘K` on macOS, `Ctrl+K` elsewhere)
- Displays recent searches as chips below input when focused/empty
- Debounced input (150ms) to avoid lag on every keystroke

**`SearchResultGroup.tsx`**
- Receives a category label ("Vocabulary", "Lessons", "Verbs") and array of results
- Renders section header with count badge
- Limits to top 5 results per group (with "Show all" link if more exist)

**`SearchResultItem.tsx`**
- Single row: icon + primary text + secondary text + level badge
- Click handler navigates to relevant page and closes overlay
- Keyboard navigation (arrow keys + Enter)

**`useSearch.ts`**
- Builds search index on mount (lightweight — all data is in memory)
- Exposes `search(query)` → `SearchResult[]`
- Manages recent searches in localStorage
- Handles fuzzy matching + ranking

---

## 4. Search Algorithm

### 4.1 Index Structure

Build a flat array on first render:

```typescript
interface SearchIndexItem {
  id: string;
  type: 'vocabulary' | 'lesson' | 'verb';
  primaryText: string;       // German word / lesson title / infinitive
  secondaryText: string;     // Indonesian translation / lesson topic / translation
  tertiaryText?: string;     // exampleSentence / canDoGoals[0] / conjugation sample
  level?: Level;             // A1, A2, B1, B2
  route: string;             // e.g. '/vocab', '/lesson/a1-1', '/verbs'
  routeParams?: Record<string, string>; // for pre-filling search on target page
  article?: string;          // der/die/das for vocabulary
  verbType?: 'regular' | 'irregular';
}
```

### 4.2 Matching Strategy

**No external library needed.** Use a simple, fast approach:

1. **Normalize:** lowercase everything, strip articles (der/die/das) for matching
2. **Prefix match:** exact prefix gets highest score (e.g., "morg" matches "Morgen")
3. **Contains match:** substring match gets medium score
4. **Word-boundary match:** match at word start gets bonus (e.g., "tag" matches "Guten **Tag**")
5. **Translation match:** also search Indonesian translation field
6. **Typo tolerance:** Allow 1 character difference for queries >3 characters (Levenshtein distance ≤1)

### 4.3 Ranking

Score = weighted sum:
- **Exact match:** 100 points
- **Prefix match:** 80 points
- **Word-boundary match:** 60 points
- **Contains match:** 40 points
- **Typo match:** 20 points
- **Boost recent:** +10 if item was recently searched
- **Boost vocabulary over lessons:** +5 (users search words more than lessons)

### 4.4 Search Result Types

```typescript
interface SearchResult {
  item: SearchIndexItem;
  score: number;
  matchType: 'exact' | 'prefix' | 'contains' | 'fuzzy';
  matchedField: 'primary' | 'secondary' | 'tertiary';
}
```

---

## 5. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` (Windows/Linux) / `⌘K` (macOS) | Open search overlay |
| `/` (when no input focused) | Open search overlay |
| `Escape` | Close search overlay |
| `↑` / `↓` | Navigate between results |
| `Enter` | Open selected result |
| `Tab` | Jump to next result group |

**Implementation:** Global `keydown` listener on `document`. Guard against firing when user is typing in an input/textarea (except the search input itself).

---

## 6. Recent Searches

### 6.1 Storage

localStorage key: `deutschup_recent_searches`  
Format: `string[]` (max 8 items, most recent first)

### 6.2 Behavior

- On search submit (Enter or click), save query to front of array
- Deduplicate (move existing to front)
- Show recent searches as chips when input is empty and focused
- Clicking a recent chip fills the input and triggers search
- "Clear recent" button to wipe history

---

## 7. Mobile vs Desktop Behavior

### 7.1 Desktop (≥1024px)

- **Trigger:** `Ctrl+K` or click search icon in TopNav
- **UI:** Centered modal, `max-w-lg`, with backdrop blur
- **Position:** Center of viewport, `z-[100]`
- **Backdrop:** Semi-transparent dark overlay, click to close

### 7.2 Mobile (<1024px)

- **Trigger:** Same shortcuts + search icon in TopNav
- **UI:** Full-screen overlay (slide up from bottom)
- **Position:** `fixed inset-0 z-[100]`
- **Backdrop:** None needed (full screen)
- **Keyboard:** Auto-focus input, keyboard stays open
- **Safe area:** Respect `env(safe-area-inset-top)` for notch devices

### 7.3 Animation

- Desktop: `framer-motion` fade + scale (0.95 → 1)
- Mobile: `framer-motion` slide up from bottom (`y: '100%'` → `y: 0`)

---

## 8. Integration Points

### 8.1 TopNav Changes

**File:** `src/components/layout/TopNav.tsx`

Replace the existing search toggle button with a proper trigger:

```tsx
// BEFORE: inline search bar toggle
<button onClick={() => setShowSearch(!showSearch)}>

// AFTER: open global search overlay
<button onClick={() => openSearch()}>
  <Search className="w-4.5 h-4.5" />
  <kbd className="hidden md:inline-flex ml-1.5 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1">
    ⌘K
  </kbd>
</button>
```

Remove the inline search bar (`{showSearch && ...}` block) from TopNav — it's replaced by the overlay.

### 8.2 App.tsx Changes

**File:** `src/App.tsx`

Add `<SearchOverlay />` as a sibling to `<ChatWidget />` inside `<Layout>`:

```tsx
<Layout>
  <AnimatedRoutes />
  <SearchOverlay />    {/* ← NEW */}
  <ChatWidget />
  <DebugOverlay />
  <QuickNoteWidget />
</Layout>
```

### 8.3 Search Context

Create a lightweight zustand store (or React context) for open/close state:

```typescript
// src/stores/searchStore.ts
import { create } from 'zustand';

interface SearchStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
```

This allows any component (TopNav, keyboard handler, MobileBottomNav) to open the search.

### 8.4 Route Navigation from Search

When a user clicks a search result, navigate and optionally pre-fill context:

| Result Type | Navigation Target | Pre-fill Action |
|-------------|-------------------|-----------------|
| Vocabulary | `/vocab` | Could pre-highlight word (future enhancement) |
| Lesson | `/lesson/{id}` | Direct navigation |
| Verb | `/verbs` | Could pre-fill search term (future enhancement) |

For MVP: simple `navigate(route)` is sufficient. Pre-filling is a follow-up.

---

## 9. Implementation Plan

### Phase 1: Core Search (1-2 hours)

1. Create `useSearch.ts` hook with indexing + fuzzy matching
2. Create `SearchOverlay.tsx` with basic modal UI
3. Create `SearchInput.tsx` and `SearchResultItem.tsx`
4. Create `SearchResultGroup.tsx`
5. Wire up keyboard shortcuts (`Ctrl+K`, `Escape`)
6. Add to `App.tsx`

### Phase 2: Polish (1 hour)

7. Add recent searches (localStorage)
8. Add mobile full-screen behavior
9. Add `framer-motion` animations
10. Add keyboard navigation (↑↓ Enter)
11. Replace TopNav inline search with overlay trigger
12. Add `⌘K` hint to search icon

### Phase 3: Optional Enhancements

13. Pre-fill search on target pages
14. Search history analytics (what users search for most)
15. "Did you mean...?" suggestions for typos
16. Search within lesson content (grammarDescription, culturalNotes)

---

## 10. File Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/search/SearchOverlay.tsx` | **CREATE** | Main overlay container |
| `src/components/search/SearchInput.tsx` | **CREATE** | Input field with hints |
| `src/components/search/SearchResultGroup.tsx` | **CREATE** | Grouped result section |
| `src/components/search/SearchResultItem.tsx` | **CREATE** | Single result row |
| `src/components/search/useSearch.ts` | **CREATE** | Search hook (index + fuzzy + recent) |
| `src/stores/searchStore.ts` | **CREATE** | Open/close state store |
| `src/components/layout/TopNav.tsx` | **MODIFY** | Replace inline search with overlay trigger |
| `src/App.tsx` | **MODIFY** | Add `<SearchOverlay />` to Layout |

---

## 11. Data Index Summary

```typescript
// Approximate index size (all in-memory, no lazy loading needed)
// Vocabulary: ~368 items × ~200 bytes = ~70 KB
// Lessons:    ~70 items  × ~300 bytes = ~21 KB
// Verbs:      ~30 items  × ~400 bytes = ~12 KB
// Total:      ~468 items, ~103 KB in-memory
// Build time: <5ms on modern hardware
// Search time: <2ms for typical queries
```

No debouncing needed below 100 queries/sec. 150ms debounce is for UX feel, not performance.

---

## 12. Accessibility

- Focus trap inside overlay when open
- `role="dialog"` and `aria-label="Cari materi"`
- `aria-live="polite"` on results count
- Screen reader announces result count on each keystroke
- All results are keyboard-navigable
- Escape always closes overlay

---

*End of design document.*
