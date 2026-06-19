const fs = require('fs');

// Load common vocabulary using Function constructor
const commonContent = fs.readFileSync('src/data/common-vocabulary.ts', 'utf8');
const commonMatch = commonContent.match(/commonVocabulary\s*=\s*\[([\s\S]*?)\];/);
const common = commonMatch ? new Function('return [' + commonMatch[1] + ']')() : [];

// Load lesson vocabulary using Function constructor
const lessonContent = fs.readFileSync('src/data/vocabulary.ts', 'utf8');
const lessonMatch = lessonContent.match(/vocabularyData: VocabWord\[\] = \[([\s\S]*?)\];/);
const lesson = lessonMatch ? new Function('return [' + lessonMatch[1] + ']')() : [];

// Merge + deduplicate (by German word)
const merged = {};
[...common.map(c => ({ german: c.german, indonesian: c.indonesian, level: c.level })),
 ...lesson.map(l => ({ german: l.word, indonesian: l.translation, level: l.level }))
].forEach(entry => {
  const key = entry.german.toLowerCase();
  if (!merged[key]) {
    merged[key] = entry;
  }
});

const allWords = Object.values(merged);

// Generate merged vocabulary.ts
const ts = `// Merged vocabulary (common + lesson)
// Total: ${allWords.length} entries (deduplicated)

export const vocabulary = [
${allWords.map(w => `  { german: "${w.german}", indonesian: "${w.indonesian}", level: "${w.level || 'A1'}" }`).join(',\n')}
];

export default vocabulary;
`;

fs.writeFileSync('src/data/vocabulary-merged.ts', ts);
console.log(`✅ Merged ${allWords.length} entries → vocabulary-merged.ts`);
