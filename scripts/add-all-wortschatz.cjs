const fs = require('fs');
const pdfDir = '.curriculum-analysis/books/wortschatz-pdfs';

// Read all extracted vocabulary
const levels = ['a1', 'a2', 'b1', 'b2'];
const levelNames = ['A1', 'A2', 'B1', 'B2'];

let allNewVocab = [];

for (let i = 0; i < levels.length; i++) {
  const level = levels[i];
  const levelName = levelNames[i];
  
  const extractedFile = `${pdfDir}/wortschatz-${level}-extracted.json`;
  if (!fs.existsSync(extractedFile)) {
    console.log(`Skipping ${level} - no extracted file`);
    continue;
  }
  
  const vocab = JSON.parse(fs.readFileSync(extractedFile, 'utf8'));
  console.log(`${levelName}: ${vocab.length} words`);
  
  // Convert to VocabWord format
  const converted = vocab.map((w, idx) => {
    let article = '';
    let word = w.word;
    if (word.startsWith('der ')) { article = 'der'; word = word.slice(4); }
    else if (word.startsWith('die ')) { article = 'die'; word = word.slice(4); }
    else if (word.startsWith('das ')) { article = 'das'; word = word.slice(4); }
    
    return {
      id: `v-w${level}-${idx + 1}`,
      word: w.word,
      translation: w.translation,
      exampleSentence: '',
      phonetic: '',
      level: levelName,
      theme: w.chapter || `Wortschatz ${levelName}`,
      chapter: 0,
      type: 'other'
    };
  });
  
  allNewVocab = allNewVocab.concat(converted);
}

console.log(`\nTotal new vocabulary: ${allNewVocab.length}`);

// Read existing vocabulary.ts
let vocabContent = fs.readFileSync('src/data/vocabulary.ts', 'utf8');

// Find insertion point
const lastEntry = vocabContent.lastIndexOf('];');
if (lastEntry === -1) {
  console.error('Could not find insertion point');
  process.exit(1);
}

// Format new entries
const newEntries = allNewVocab.map(v => `  {
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

// Insert
const updatedContent = vocabContent.slice(0, lastEntry) + newEntries + '\n' + vocabContent.slice(lastEntry);

fs.writeFileSync('src/data/vocabulary.ts', updatedContent, 'utf8');
console.log('Updated vocabulary.ts');
