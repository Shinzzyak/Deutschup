# UX-001: Progressive Disclosure Strategy

**Status:** FINAL  
**Date:** 2026-06-11  
**Author:** Exilio 🧠  
**Focus:** Feature visibility, cognitive load reduction, user progression

---

## Executive Summary

All learning features appear immediately regardless of user level. This creates cognitive overload. Progressive disclosure reveals features as users progress, reducing confusion while maintaining full functionality.

**Core Principle:** Show users what they need NOW, reveal more as they grow.

---

## A. Feature Visibility Matrix

### By User Type

| Feature | Guest | New User | Active User | Pro User | Admin |
|---------|-------|----------|-------------|----------|-------|
| Landing Page | ✅ | — | — | — | — |
| Login/Signup | ✅ | — | — | — | — |
| Dashboard | — | ✅ | ✅ | ✅ | ✅ |
| Kurikulum | — | ⚠️ Basic | ✅ Full | ✅ Full | ✅ |
| Vocab Trainer | — | ⚠️ Basic | ✅ Full | ✅ Full | ✅ |
| Verb Trainer | — | — | ✅ | ✅ | ✅ |
| Koreksi Pintar | — | — | — | ✅ | ✅ |
| Catatan Belajar | — | — | ✅ | ✅ | ✅ |
| Simulasi Ujian | — | — | ⚠️ Limited | ✅ Full | ✅ |
| Pricing | — | ⚠️ Teaser | ✅ | — | — |
| Admin Panel | — | — | — | — | ✅ |
| AI Chat Widget | — | — | — | ✅ | ✅ |

**Legend:**
- ✅ = Fully visible
- ⚠️ = Limited/teaser
- — = Hidden

### Feature Categories

| Category | Features | Visibility Rule |
|----------|----------|-----------------|
| **Core Learning** | Kurikulum, Vocab | Always visible after login |
| **Practice** | Verb Trainer, Simulasi | After first lesson completed |
| **AI Tools** | Koreksi, Catatan, Chat | Pro users only |
| **Account** | Pricing, Admin | Role-based |
| **Stats** | Streak, XP | Always visible |

---

## B. Progressive Disclosure Plan

### Stage 1: First Login (Day 0)

**Visible:**
- Dashboard (simplified)
- Kurikulum (Lesson 1 only)
- Vocab Trainer (basic mode)
- Streak/XP stats

**Hidden:**
- Verb Trainer
- Koreksi Pintar
- Catatan Belajar
- Simulasi Ujian
- AI Chat Widget

**Unlock Condition:** Complete Lesson 1

---

### Stage 2: First Week (Day 1-7)

**Visible:**
- Dashboard (full)
- Kurikulum (all lessons)
- Vocab Trainer (full)
- Verb Trainer (basic)
- Catatan Belajar (basic)
- Pricing teaser

**Hidden:**
- Koreksi Pintar
- Simulasi Ujian (full)
- AI Chat Widget

**Unlock Conditions:**
- Verb Trainer: Complete 3 vocab sessions
- Catatan: Complete 5 lessons
- Simulasi: Complete 10 lessons

---

### Stage 3: Active Learner (Week 2-4)

**Visible:**
- Dashboard (full)
- Kurikulum (all)
- Vocab Trainer (full)
- Verb Trainer (full)
- Catatan Belajar (full)
- Simulasi Ujian (limited)
- Pricing (full)

**Hidden:**
- Koreksi Pintar
- AI Chat Widget

**Unlock Conditions:**
- Simulasi (full): Complete 15 lessons
- Koreksi: Pro subscription
- AI Chat: Pro subscription

---

### Stage 4: Advanced Learner (Month 2+)

**Visible:**
- All features
- Advanced stats
- Learning analytics

**Unlock Conditions:**
- Pro subscription for AI tools
- 20+ lessons for advanced stats

---

## C. Dashboard Learning Path Specification

### First Login

```
┌─────────────────────────────────────────────────────────┐
│  Selamat datang di DeutschUp! 👋                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🎯 MULAI BELAJAR                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Lesson 1: Alfabet Jerman                       │   │
│  │  [Mulai Belajar →]                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📊 PROGRESS ANDA                                      │
│  Streak: 0 hari  |  XP: 0                             │
│                                                         │
│  💡 TIPS                                               │
│  Selesaikan 1 lesson setiap hari untuk menjaga streak! │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Actions:**
- Single CTA: "Mulai Belajar"
- No other navigation
- Clear first step

---

### First Week

```
┌─────────────────────────────────────────────────────────┐
│  Selamat datang kembali! 🔥 Streak: 3 hari             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📚 LANJUTKAN BELAJAR                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Lesson 4: Perkenalan                           │   │
│  │  [Lanjutkan →]                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ✍️ LATIHAN HARI INI                                   │
│  ┌──────────────────────┐ ┌──────────────────────┐     │
│  │  Vocab Trainer       │  │  Verb Trainer        │     │
│  │  10 kata baru        │  │  [Mulai →]           │     │
│  │  [Mulai →]           │  │                      │     │
│  └──────────────────────┘ └──────────────────────┘     │
│                                                         │
│  📊 PROGRESS                                            │
│  4/30 lesson selesai  |  XP: 450                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Actions:**
- Continue lesson (primary)
- Daily practice (secondary)
- Progress visible

---

### Returning Learner

```
┌─────────────────────────────────────────────────────────┐
│  Selamat datang kembali! 🔥 Streak: 12 hari            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📚 LANJUTKAN BELAJAR                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Lesson 12: Kasus Akusativ                      │   │
│  │  [Lanjutkan →]                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ✍️ LATIHAN HARI INI                                   │
│  ┌───────────────┐ ┌───────────────┐ ┌─────────────┐  │
│  │  Vocab        │  │  Verb         │  │  Catatan    │  │
│  │  [Mulai →]    │  │  [Mulai →]    │  │  [Buka →]   │  │
│  └───────────────┘ └───────────────┘ └─────────────┘  │
│                                                         │
│  📊 PROGRESS                                            │
│  12/30 lesson  |  XP: 1,850  |  Level: 3              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Actions:**
- Continue lesson (primary)
- Multiple practice options
- Advanced progress

---

### Advanced Learner

```
┌─────────────────────────────────────────────────────────┐
│  Willkommen zurück! 🔥 Streak: 45 hari                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📚 LANJUTKAN BELAJAR                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Lesson 25: Konjunktiv II                       │   │
│  │  [Lanjutkan →]                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ✍️ LATIHAN HARI INI                                   │
│  ┌───────────────┐ ┌───────────────┐ ┌─────────────┐  │
│  │  Vocab        │  │  Verb         │  │  Simulasi   │  │
│  │  [Mulai →]    │  │  [Mulai →]    │  │  [Mulai →]  │  │
│  └───────────────┘ └───────────────┘ └─────────────┘  │
│                                                         │
│  🤖 AI TOOLS (Pro)                                     │
│  ┌───────────────┐ ┌───────────────┐ ┌─────────────┐  │
│  │  Koreksi      │  │  Catatan      │  │  Chat       │  │
│  │  [Coba →]     │  │  [Buka →]     │  │  [Mulai →]  │  │
│  └───────────────┘ └───────────────┘ └─────────────┘  │
│                                                         │
│  📊 PROGRESS                                            │
│  25/30 lesson  |  XP: 4,200  |  Level: 7              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Actions:**
- All features available
- AI tools prominent
- Full progress visibility

---

## D. UX-P0 Final Scope

### Items with Highest Impact

| Item | Retention Impact | Learning Completion | Effort | **Priority** |
|------|------------------|---------------------|--------|--------------|
| Learning Path Clarity | HIGH | HIGH | 8h | **P0** |
| Progressive Disclosure | HIGH | HIGH | 12h | **P0** |
| Onboarding Tutorial | HIGH | MEDIUM | 6h | **P0** |
| Simplified Menu | MEDIUM | HIGH | 4h | **P0** |
| Mobile Navigation Fix | HIGH | MEDIUM | 6h | **P0** |

**Total P0 Effort:** 36 hours

### P0 Scope Definition

**Include:**
- Dashboard learning path (3 states)
- Progressive disclosure (4 stages)
- Onboarding tutorial (4 steps)
- Simplified menu (5 items)
- Mobile bottom nav

**Exclude:**
- Visual redesign
- Color changes
- Animation polish
- Advanced analytics
- Design system documentation

---

## E. New Heuristics

### Progressive Disclosure Pattern

**Problem:** All features visible immediately = cognitive overload.

**Solution:** Reveal features as users progress.

**Stages:**
1. First Login → Core only
2. First Week → Core + Practice
3. Active Learner → All learning
4. Advanced → All features

**Why It Works:** Reduces decision paralysis, guides progression.

### Feature Unlock Pattern

**Problem:** Users don't know when to use advanced features.

**Solution:** Unlock based on completion milestones.

**Rules:**
- Verb Trainer → After 3 vocab sessions
- Catatan → After 5 lessons
- Simulasi → After 10 lessons
- AI Tools → Pro subscription

**Why It Works:** Creates progression, rewards engagement.

### Dashboard State Pattern

**Problem:** Same dashboard for all users = one-size-fits-none.

**Solution:** Different dashboard states for different stages.

**States:**
- First login → Single CTA
- First week → Continue + Practice
- Returning → Multiple options
- Advanced → Full features

**Why It Works:** Matches user needs to experience level.

---

## F. Implementation Summary

### Phase 1: Progressive Disclosure (Week 1)

| Task | Effort |
|------|--------|
| Add user stage detection | 4h |
| Implement feature visibility rules | 6h |
| Create 4 dashboard states | 8h |
| Add unlock conditions | 4h |
| Test progression flow | 4h |

**Total:** 26 hours

### Phase 2: Onboarding + Menu (Week 2)

| Task | Effort |
|------|--------|
| Create 4-step tutorial | 4h |
| Add tutorial trigger logic | 2h |
| Simplify sidebar menu | 3h |
| Add bottom navigation bar | 4h |
| Fix mobile scroll | 2h |

**Total:** 15 hours

**Grand Total:** 41 hours

---

*Document generated by Exilio 🧠 — 2026-06-11*
