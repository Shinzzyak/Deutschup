const fs = require('fs');

// Read Wortschatz A1
const wortschatz = JSON.parse(fs.readFileSync('.curriculum-analysis/wortschatz-a1-extracted.json', 'utf8'));

// Read lessons.ts as text
const lessonsContent = fs.readFileSync('src/data/lessons.ts', 'utf8');

// Extract all vocabulary words from lessons using regex
const vocabRegex = /"word":\s*"([^"]+)"/g;
const lessonVocab = new Set();
let match;
while ((match = vocabRegex.exec(lessonsContent)) !== null) {
  lessonVocab.add(match[1].toLowerCase());
}

console.log(`Lesson vocabulary count: ${lessonVocab.size}`);

// Find words in Wortschatz but not in lessons
const missing = wortschatz.filter(w => !lessonVocab.has(w.word.toLowerCase()));
console.log(`Words in Wortschatz A1 but not in lessons: ${missing.length}`);

// Group missing words by chapter
const missingByChapter = {};
for (const w of missing) {
  if (!missingByChapter[w.chapter]) missingByChapter[w.chapter] = [];
  missingByChapter[w.chapter].push(w);
}

// Print summary
for (const [chapter, words] of Object.entries(missingByChapter)) {
  console.log(`${chapter}: ${words.length} missing words`);
}

// Save missing words
fs.writeFileSync('.curriculum-analysis/wortschatz-a1-missing.json', JSON.stringify(missing, null, 2));
console.log('Saved to .curriculum-analysis/wortschatz-a1-missing.json');
