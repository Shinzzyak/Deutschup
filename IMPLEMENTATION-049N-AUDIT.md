# 🔍 IMPLEMENTATION-049N: DESIGN TOKEN AUDIT (Before)

## Color Inventory

### Purple/Indigo Usage (TO REPLACE)

| File | Current Color | Replacement |
|------|--------------|-------------|
| `LandingPage.tsx` | Logo bars: `bg-indigo-600`, `bg-purple-500` | ⚫🔴🟡 (German flag) |
| `LandingPage.tsx` | CTA: `from-indigo-600 to-purple-600` | Gold gradient |
| `Hero.tsx` | Section bg: `via-indigo-50/50 to-purple-50/30` | `via-[#FFF8E1]/30` |
| `Hero.tsx` | Decorations: `bg-indigo-200/30`, `bg-purple-200/30` | `bg-[#F2C94C]/20` |
| `Hero.tsx` | AI badge: `bg-indigo-100 text-indigo-700` | `bg-[#FFF8E1] text-[#1F2937]` |
| `Hero.tsx` | Headline gradient: `from-indigo-600 to-purple-600` | Gold accent |
| `Hero.tsx` | Primary CTA: `from-indigo-600 to-purple-600` | Gold gradient |
| `Hero.tsx` | Trust checks: `text-indigo-500` | `text-[#F2C94C]` |
| `Hero.tsx` | Floating cards: `shadow-indigo-100`, `shadow-purple-100` | `shadow-[#F2C94C]/20` |
| `Hero.tsx` | AI icon bg: `from-indigo-500 to-purple-500` | Gold accent |
| `Hero.tsx` | Chat bubble: `bg-indigo-50`, `text-indigo-600` | Gold tones |
| `Hero.tsx` | Vocabulary card: `from-purple-500 to-pink-500` | `from-[#D32F2F] to-[#F2C94C]` |
| `Hero.tsx` | Progress bar: `from-indigo-500 to-purple-500` | `from-[#F2C94C]` |
| `Hero.tsx` | Learning Path: `from-indigo-500 to-purple-500` | Gold accent |
| `ProductShowcase.tsx` | Section heading: `from-indigo-600 to-purple-600` | Gold accent |
| `ProductShowcase.tsx` | AI Tutor icon: `from-indigo-500 to-blue-500` | `from-[#F2C94C] to-[#E0B73A]` |
| `ProductShowcase.tsx` | Vocabulary icon: `from-purple-500 to-pink-500` | `from-[#D32F2F] to-[#F2C94C]` |
| `LearningRoadmap.tsx` | Section bg: `to-indigo-50/30` | `to-[#FFF8E1]/30` |
| `LearningRoadmap.tsx` | Heading: `from-indigo-600 to-purple-600` | Gold accent |
| `LearningRoadmap.tsx` | Timeline: `from-indigo-200 via-purple-200` | `from-[#F2C94C]/40` |
| `LearningRoadmap.tsx` | Active level: `from-indigo-600 to-purple-600` | Gold gradient |
| `LearningRoadmap.tsx` | Active card: `shadow-indigo-100`, `border-indigo-100` | Gold tones |
| `LearningRoadmap.tsx` | Check marks: `text-indigo-500` | `text-[#F2C94C]` |
| `LearningRoadmap.tsx` | Active text: `text-indigo-600`, `text-indigo-100` | Gold tones |
| `CTASection.tsx` | Section bg: `to-indigo-50/30` | `to-[#FFF8E1]/30` |
| `CTASection.tsx` | Card: `from-indigo-600 via-purple-600 to-indigo-700` | Charcoal dark |
| `CTASection.tsx` | Text: `text-indigo-200`, `text-indigo-100/80` | White/warm white |
| `CTASection.tsx` | Button: `text-indigo-700` | Gold |
| `CTASection.tsx` | CTA bg blur: `bg-purple-300/20` | `bg-[#F2C94C]/10` |
| `SocialProof.tsx` | Heading: `from-indigo-600 to-purple-600` | Gold accent |
| `SocialProof.tsx` | Feature cards: `hover:border-indigo-100 hover:shadow-indigo-50` | Gold tones |
| `SocialProof.tsx` | Icon bg: `from-indigo-500 to-purple-500` | `from-[#F2C94C] to-[#E0B73A]` |
| `SocialProof.tsx` | Check marks: `text-indigo-500` | `text-[#F2C94C]` |
| `AdminAI.tsx` | Header: `from-blue-600 via-indigo-600 to-purple-600` | Keep (admin) |
| `AdminAI.tsx` | Tab active: `from-blue-600 to-indigo-600` | Keep (admin) |
| `AdminAI.tsx` | Zap icon: `text-purple-400` | `text-[#F2C94C]` |
| `Catatan.tsx` | Title icon: `text-blue-600` | `text-[#F2C94C]` |
| `Catatan.tsx` | Study plan icon: `text-indigo-500` | `text-[#F2C94C]` |
| `Catatan.tsx` | Generate btn: `bg-indigo-600 hover:bg-indigo-700` | Gold gradient |
| `Catatan.tsx` | Update btn: `text-indigo-600 hover:text-indigo-700` | `text-[#F2C94C]` |
| `Catatan.tsx` | Loading spinner: `text-blue-500` | `text-[#F2C94C]` |

### Blue Usage (KEEP — technically required)

| File | Usage | Action |
|------|-------|--------|
| `App.tsx` | Active nav: `bg-blue-50 text-blue-600` | KEEP (mobile nav) |
| `App.tsx` | Focus ring: `ring-blue-500` | KEEP |
| `ChatWidget.tsx` | Button: `bg-blue-600` | KEEP (chat widget identity) |
| `DebugOverlay.tsx` | Tab active: `border-blue-500` | KEEP (debug) |
| `LessonView.tsx` | Tab active: `text-blue-600` | KEEP (form focus) |
| `LessonView.tsx` | Focus ring: `ring-blue-500` | KEEP |
| `VerbTrainer.tsx` | Article colors: `bg-blue-500` (der) | KEEP (German article convention) |
| `VocabTrainer.tsx` | Article colors: `bg-blue-500` (der) | KEEP |
| `LessonView.tsx` | Article colors: `bg-blue-500` (der) | KEEP |
| `CheckpointView.tsx` | Loading spinner: `text-blue-500` | KEEP |
| `Admin.tsx` | Loading spinner: `text-blue-500` | KEEP |
| `Simulasi.tsx` | Loading spinner: `text-blue-600` | KEEP |
| Various | Form focus rings: `ring-blue-500` | KEEP |

---

## Summary

**Replace:** ~45 indigo/purple instances across 8 landing/design files
**Keep:** ~30 blue instances (form focus, nav, admin, article colors)
**German Design System:** Gold as primary CTA, Charcoal for dark sections, Red as accent only

---

## Files to Change

| File | Changes | Est. Lines |
|------|---------|-----------|
| `LandingPage.tsx` | Logo bars, CTA button | ~10 |
| `Hero.tsx` | Background, badge, headline, CTA, floating cards | ~50 |
| `ProductShowcase.tsx` | Section heading, icon gradients | ~8 |
| `LearningRoadmap.tsx` | Background, timeline, active states | ~25 |
| `CTASection.tsx` | Background, card, text, button | ~12 |
| `SocialProof.tsx` | Heading, cards, icons, checks | ~10 |
| `Pricing.tsx` | Popular badge, CTA button | ~4 |
| `Catatan.tsx` | Icons, buttons | ~6 |
| `AdminAI.tsx` | Zap icon only | ~1 |
