const fs = require('fs');

// Read extracted Wortschatz A1
const wortschatzA1 = JSON.parse(fs.readFileSync('.curriculum-analysis/wortschatz-a1-extracted.json', 'utf8'));

// Read existing vocabulary.ts
let vocabContent = fs.readFileSync('src/data/vocabulary.ts', 'utf8');

// Convert Wortschatz to VocabWord format
const newVocabWords = wortschatzA1.map((w, idx) => {
  // Extract article from word if present
  let article = '';
  let word = w.word;
  if (word.startsWith('der ')) { article = 'der'; word = word.slice(4); }
  else if (word.startsWith('die ')) { article = 'die'; word = word.slice(4); }
  else if (word.startsWith('das ')) { article = 'das'; word = word.slice(4); }
  else if (word.startsWith('ein ')) { article = 'ein'; word = word.slice(4); }
  else if (word.startsWith('eine ')) { article = 'eine'; word = word.slice(5); }
  
  return {
    id: `v-wa1-${idx + 1}`,
    word: w.word,
    translation: w.translation,
    exampleSentence: '',
    phonetic: '',
    level: 'A1',
    theme: w.chapter || 'Wortschatz A1',
    chapter: parseInt(w.chapter?.match(/\d+/)?.[0] || '0'),
    type: w.section === 'NOMEN' ? 'noun' : w.section === 'VERBEN' ? 'verb' : w.section === 'ADJEKTIVE' ? 'adjective' : 'other'
  };
});

console.log(`Generated ${newVocabWords.length} new vocabulary entries`);

// Find the insertion point in vocabulary.ts
const lastEntry = vocabContent.lastIndexOf('];');
if (lastEntry === -1) {
  console.error('Could not find insertion point');
  process.exit(1);
}

// Format new entries
const newEntries = newVocabWords.map(v => `  {
    id: "${v.id}",
    word: "${v.word.replace(/"/g, '\\"')}",
    translation: "${v.translation.replace(/"/g, '\\"')}",
    exampleSentence: "${v.exampleSentence}",
    phonetic: "${v.phonetic}",
    level: "${v.level}",
    theme: "${v.theme.replace(/"/g, '\\"')}",
    chapter: ${v.chapter},
    type: "${v.type}"
  }`).join(',\n');

// Insert before the closing ];
const updatedContent = vocabContent.slice(0, lastEntry) + newEntries + '\n' + vocabContent.slice(lastEntry);

// Write updated file
fs.writeFileSync('src/data/vocabulary.ts', updatedContent, 'utf8');
console.log('Updated vocabulary.ts');
