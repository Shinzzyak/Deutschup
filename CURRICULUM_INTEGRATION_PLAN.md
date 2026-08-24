# Deutschup Curriculum Integration Plan

## Data Available
- Netzwerk Neu A1: 12 chapters, ~2012 words (nomen ~1200, verben ~400, adjektive ~200, andere ~212)
- Wortschatz A1-B2: extracted JSON files with vocabulary lists
- Existing Deutschup lessons: 7 chapters (A1.1-A2.2)

## Recommended Strategy: Hybrid Approach

### Phase 1: Enrich Existing Lessons (Week 1)
- Add Netzwerk Neu vocabulary to existing Deutschup chapters
- Map: Deutschup A1.1 ↔ Netzwerk K1-K3, A1.2 ↔ K4-K6, A2.1 ↔ K7-K9, A2.2 ↔ K10-K12
- Add Indonesian translations to all words

### Phase 2: Create Wortschatz Trainer (Week 2)
- New page: `/wortschatz` — vocabulary trainer
- Filter by: level (A1-B2), topic, chapter, word type
- Flashcard mode + quiz mode
- Track mastery per word

### Phase 3: Goethe Exam Prep (Week 3)
- Add Goethe A1 exam topic modules
- Practice tests matching exam format
- Vocabulary coverage check per topic

## JSON Schema for Vocabulary

```typescript
interface VocabWord {
  id: string;
  word: string;
  translation: string; // Indonesian
  article?: 'der' | 'die' | 'das';
  plural?: string;
  type: 'noun' | 'verb' | 'adjective' | 'other';
  level: 'A1' | 'A2' | 'B1' | 'B2';
  chapter: string;
  topic: string;
  examples: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
}
```

## Content Gaps to Fill
1. Indonesian translations for all Netzwerk Neu words
2. Audio pronunciation for each word
3. Example sentences in context
4. Goethe exam topic alignment

## Implementation Priority
1. Vocabulary data transformation (JSON files)
2. WortschatzTrainer page component
3. Integration with existing lessons
4. Goethe exam prep modules
