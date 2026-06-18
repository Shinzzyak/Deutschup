# Goethe Exam Preparation Structure

## Goethe-Zertifikat A1: Start Deutsch 1

### Prüfungsteile (Exam Parts)

**1. Hören (Listening) - 15 minutes**
- Teil 1: 5 multiple choice questions
- Teil 2: 5 matching questions
- Teil 3: 5 true/false questions

**2. Lesen (Reading) - 20 minutes**
- Teil 1: 5 multiple choice questions
- Teil 2: 5 matching questions
- Teil 3: 5 true/false questions

**3. Schreiben (Writing) - 15 minutes**
- Teil 1: Fill in a form (10 items)
- Teil 2: Write a short message (40-50 words)

**4. Sprechen (Speaking) - 15 minutes**
- Teil 1: Introduce yourself (1 minute)
- Teil 2: Make a suggestion (1 minute)
- Teil 3: Talk about daily routine (1 minute)

---

## Goethe-Zertifikat A2

### Prüfungsteile (Exam Parts)

**1. Hören (Listening) - 15 minutes**
- Teil 1: 5 multiple choice questions
- Teil 2: 5 matching questions
- Teil 3: 5 true/false questions

**2. Lesen (Reading) - 20 minutes**
- Teil 1: 5 multiple choice questions
- Teil 2: 5 matching questions
- Teil 3: 5 true/false questions

**3. Schreiben (Writing) - 20 minutes**
- Teil 1: Fill in a form (10 items)
- Teil 2: Write a short message (40-50 words)
- Teil 3: Write a short email (40-50 words)

**4. Sprechen (Speaking) - 15 minutes**
- Teil 1: Introduce yourself (1 minute)
- Teil 2: Make a suggestion (1 minute)
- Teil 3: Talk about daily routine (1 minute)

---

## Goethe-Zertifikat B1

### Prüfungsteile (Exam Parts)

**1. Hören (Listening) - 15 minutes**
- Teil 1: 5 multiple choice questions
- Teil 2: 5 matching questions
- Teil 3: 5 true/false questions

**2. Lesen (Reading) - 20 minutes**
- Teil 1: 5 multiple choice questions
- Teil 2: 5 matching questions
- Teil 3: 5 true/false questions

**3. Schreiben (Writing) - 20 minutes**
- Teil 1: Fill in a form (10 items)
- Teil 2: Write a short message (40-50 words)
- Teil 3: Write a short email (40-50 words)

**4. Sprechen (Speaking) - 15 minutes**
- Teil 1: Introduce yourself (1 minute)
- Teil 2: Make a suggestion (1 minute)
- Teil 3: Talk about daily routine (1 minute)

---

## DeutschUp Exam Preparation Modules

### A1 Exam Prep Module
```typescript
export interface ExamModule {
  id: string;
  level: 'A1' | 'A2' | 'B1';
  part: 'hoeren' | 'lesen' | 'schreiben' | 'sprechen';
  section: number;
  questions: Question[];
  timeLimit: number; // minutes
  passingScore: number; // percentage
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'matching' | 'true_false' | 'fill_in' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string | boolean;
  explanation: string;
  audioFile?: string; // for listening exercises
  imageFile?: string; // for visual questions
}
```

### Module Structure
```
src/data/exam/
├── a1/
│   ├── hoeren.ts
│   ├── lesen.ts
│   ├── schreiben.ts
│   └── sprechen.ts
├── a2/
│   ├── hoeren.ts
│   ├── lesen.ts
│   ├── schreiben.ts
│   └── sprechen.ts
└── b1/
    ├── hoeren.ts
    ├── lesen.ts
    ├── schreiben.ts
    └── sprechen.ts
```

---

## Implementation Plan

### Phase 1: Create Exam Data Structure
1. Define TypeScript interfaces for exam questions
2. Create sample questions for each level
3. Add audio file references

### Phase 2: Create Exam Components
1. ExamTimer component
2. ExamQuestion component
3. ExamResult component
4. ExamNavigation component

### Phase 3: Create Exam Pages
1. A1 Exam page
2. A2 Exam page
3. B1 Exam page

### Phase 4: Integrate with Existing App
1. Add exam routes to App.tsx
2. Add exam navigation to sidebar
3. Add exam progress tracking

---

## Sample Questions

### A1 Hören Teil 1
**Question:** Hören Sie den Satz. Was hören Sie?
- A) Guten Morgen
- B) Guten Tag
- C) Guten Abend

**Correct Answer:** A

**Explanation:** The sentence "Guten Morgen" means "Good morning" in German.

### A1 Lesen Teil 1
**Question:** Was bedeutet "Ich heiße Anna"?
- A) Ich bin Anna
- B) Ich heiße Anna
- C) Ich bin Anna

**Correct Answer:** B

**Explanation:** "Ich heiße Anna" means "My name is Anna" in German.

### A1 Schreiben Teil 2
**Question:** Schreiben Sie eine kurze Nachricht an Ihren Freund. (40-50 Wörter)

**Sample Answer:**
"Lieber Tom, wie geht es dir? Ich möchte mit dir am Samstag ins Kino gehen. Hast du Zeit? Schreib mir bald zurück. Viele Grüße, Anna"

---

## Audio File Structure

### File Naming Convention
```
audio/
├── a1/
│   ├── hoeren/
│   │   ├── teil1-q1.mp3
│   │   ├── teil1-q2.mp3
│   │   └── ...
│   ├── lesen/
│   ├── schreiben/
│   └── sprechen/
├── a2/
└── b1/
```

### Audio Content
- Native German speakers
- Clear pronunciation
- Various speeds (normal, slow)
- Background noise for realistic scenarios

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Exam modules | 0 | 36 (12 per level) |
| Sample questions | 0 | 180 (60 per level) |
| Audio files | 0 | 180 (60 per level) |
| Exam components | 0 | 4 |
| Exam pages | 0 | 3 |

---

## Next Steps

1. ✅ Create exam structure plan
2. 🔄 Create TypeScript interfaces
3. 🔄 Create sample questions
4. 🔄 Create exam components
5. 🔄 Create exam pages
6. 🔄 Add audio files
7. 🔄 Integrate with app
8. 🔄 Test and refine

**Status: READY TO IMPLEMENT**
