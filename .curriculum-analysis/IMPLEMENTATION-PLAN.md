# DeutschUp Curriculum Restructuring Plan

## Current State
- 50 lessons (A1: 13, A2: 13, B1: 12, B2: 12)
- 50 grammar topics
- ~750 vocabulary words

## Target State (Based on Netzwerk Neu Analysis)
- 60+ lessons (A1: 18, A2: 18, B1: 14, B2: 10)
- 69 grammar topics (+19)
- ~9,500 vocabulary words (+8,750)

---

## PHASE 1: GRAMMAR TIMING CORRECTION (Week 1)

### Fix 1.1: Move 8 A1 Topics from A2 to A1

**Current A2 Lessons to Move:**
```
A2 L21: Akkusativ → Move to A1 L14
A2 L22: Dativ → Move to A1 L15
A2 L23: Modalverben → Move to A1 L16
A2 L24: Perfekt → Move to A1 L17
A2 L25: Trennbare Verben → Move to A1 L18
A2 L26: Reflexive Verben → Move to A1 L19
A2 L27: Konjunktionen → Move to A1 L20
A2 L28: Komparativ → Move to A1 L21
```

**New A1 Structure (18 lessons):**
```
L1: Perkenalan & Salam
L2: Artikel: Der, Die, Das
L3: Angka 1-100 & Umur
L4: Warna, Hari, Bulan
L5: Kata Ganti Orang
L6: Konjugasi sein & haben
L7: Kalimat Sederhana
L8: Partikel & Tenses (sein/haben)
L9: Fragesätze (W-Fragen)
L10: Nomen & Plural
L11: Wechselpräpositionen
L12: Possessivartikel
L13: Verneinung (nicht/kein)
L14: AKKUSATIV (from A2)
L15: DATIV (from A2)
L16: MODALVERBEN (from A2)
L17: PERFEKT (from A2)
L18: TRENNBARE VERBEN (from A2)
```

### Fix 1.2: Add 5 Missing A1 Topics

**New Lessons to Add:**
```
A1 L19: REFLEXIVE VERBEN (from A2)
A1 L20: KONJUNKTIONEN (from A2)
A1 L21: KOMPARATIV (from A2)
A1 L22: IMPERATIV (NEW)
A1 L23: SOLLEN/DÜRLEN (NEW)
A1 L24: KONJUNKTION DENN (NEW)
A1 L25: INDIREKTE FRAGESÄTZE (NEW)
A1 L26: MAN + PARTIZIP I (NEW)
```

---

## PHASE 2: VOCABULARY EXPANSION (Week 2-3)

### Fix 2.1: Extract All Vocabulary from Wortschatz Books

**Source Books:**
- A1 Wortschatz (word list): 2,012 words
- A1 Wortschatz (full book): ~1,500 words
- A2 Wortschatz: ~1,200 words
- B1 Wortschatz: ~1,500 words
- B2 Wortschatz: ~2,000 words

**Target Distribution:**
```
A1: 2,500 words (from 200)
A2: 2,500 words (from 200)
B1: 2,500 words (from 200)
B2: 2,000 words (from 150)
```

### Fix 2.2: Add Vocabulary to Each Lesson

**Format per lesson:**
```typescript
vocabulary: [
  {
    id: "v-a1-1-1",
    word: "Hallo",
    translation: "Halo",
    exampleSentence: "Hallo, wie geht es dir?",
    phonetic: "HAL-lo",
    level: "A1",
    theme: "Perkenalan"
  },
  // ... 15-20 words per lesson
]
```

---

## PHASE 3: MISSING TOPICS (Week 3-4)

### Fix 3.1: Add Missing A2 Topics (6 topics)

**New A2 Lessons:**
```
A2 L22: PASSIV PRÄSENS (NEW)
A2 L23: KONJUNKTIV II WÜRDE (NEW)
A2 L24: KONJUNKTIV II SOLLTE (NEW)
A2 L25: RELATIVSÄTZE (NEW)
A2 L26: INDEFINITPRONOMEN (NEW)
A2 L27: INTERROGATIVARTIKEL (NEW)
A2 L28: WUNSCHSÄTZE (NEW)
```

### Fix 3.2: Add Missing B1 Topics (13 topics)

**New B1 Lessons:**
```
B1 L15: FUTUR I (NEW)
B1 L16: PLUSQUAMPERFEKT (NEW)
B1 L17: PASSIV (ADVANCED) (NEW)
B1 L18: KONJUNKTIV II (ADVANCED) (NEW)
B1 L19: RELATIVSÄTZE (ADVANCED) (NEW)
B1 L20: WORTBILDUNG (NEW)
B1 L21: NOMEN mit -UNG (NEW)
B1 L22: NOMEN mit -HEIT/-KEIT (NEW)
B1 L23: ADJEKTIVE mit -IG/-LICH (NEW)
B1 L24: VERBEN mit VORSILBEN (NEW)
B1 L25: ADJEKTIVE mit -BAR (NEW)
B1 L26: ADVERBIEN (NEW)
B1 L27: HER-/HIN- (NEW)
```

---

## PHASE 4: GOETHE EXAM PREPARATION (Week 4-5)

### Fix 4.1: Create Exam Preparation Modules

**Goethe A1 Prüfung:**
```
Module 1: Hören Teil 1 (5 questions)
Module 2: Hören Teil 2 (5 questions)
Module 3: Hören Teil 3 (5 questions)
Module 4: Lesen Teil 1 (5 questions)
Module 5: Lesen Teil 2 (5 questions)
Module 6: Schreiben Teil 1 (1 task)
Module 7: Schreiben Teil 2 (1 task)
Module 8: Sprechen Teil 1 (1 task)
Module 9: Sprechen Teil 2 (1 task)
Module 10: Sprechen Teil 3 (1 task)
```

**Goethe A2 Prüfung:**
```
Same structure with increased difficulty
```

**Goethe B1 Prüfung:**
```
Same structure with increased difficulty
```

### Fix 4.2: Add Exam-Style Exercises

**Exercise Types to Add:**
1. Hörverstehen (Listening comprehension)
2. Leseverstehen (Reading comprehension)
3. Schreiben (Writing tasks)
4. Sprechen (Speaking tasks)
5. Prüfungstraining (Exam training)

---

## PHASE 5: EXERCISE ENHANCEMENT (Week 5-6)

### Fix 5.1: Add Exam-Style Exercises to All Lessons

**Format per lesson:**
```typescript
exercises: {
  hoeren: [...],      // Listening exercises
  lesen: [...],       // Reading exercises
  schreiben: [...],   // Writing exercises
  sprechen: [...],    // Speaking exercises
  pruefung: [...]     // Exam-style exercises
}
```

---

## IMPLEMENTATION ORDER

### Week 1: Grammar Timing
1. Restructure lesson index
2. Move 8 A1 topics from A2 to A1
3. Add 5 missing A1 topics
4. Update lesson data

### Week 2-3: Vocabulary
1. Extract all vocabulary from Wortschatz books
2. Organize by level and theme
3. Add to lessons with context sentences
4. Create vocabulary exercises

### Week 3-4: Missing Topics
1. Add 6 missing A2 topics
2. Add 13 missing B1 topics
3. Create lesson content for each

### Week 4-5: Goethe Exam Prep
1. Create exam preparation modules
2. Add Hörverstehen exercises
3. Add Leseverstehen exercises
4. Add Schreiben tasks
5. Add Sprechen tasks

### Week 5-6: Exercise Enhancement
1. Add exam-style exercises to all lessons
2. Create Prüfungstraining sections
3. Add audio content references

---

## SUCCESS METRICS

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Grammar topics | 50 | 69 | +19 |
| Vocabulary words | 750 | 9,500 | +8,750 |
| Exercise types | 6 | 10 | +4 |
| Exam preparation | None | Full | Complete |
| Level coverage | A1-B2 | A1-B2 | Complete |

---

## NEXT STEPS

1. ✅ Create implementation plan
2. 🔄 Start Phase 1: Grammar timing correction
3. 🔄 Start Phase 2: Vocabulary expansion
4. 🔄 Start Phase 3: Missing topics
5. 🔄 Start Phase 4: Goethe exam preparation
6. 🔄 Start Phase 5: Exercise enhancement
7. 🔄 Update FINAL-REPORT.md with progress
8. 🔄 Commit and push changes

**Status: READY TO IMPLEMENT**
