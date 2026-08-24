const fs = require('fs');

// Read the Wortschatz A1 file
const wortschatzPath = '.curriculum-analysis/books/netzwerk-neu-a1-b1/wortschatz-a1.txt';
const content = fs.readFileSync(wortschatzPath, 'utf8');

// Split into lines
const lines = content.split('\n');

// Track current context
let currentChapter = '';
let currentSection = '';

// Extract vocabulary by detecting patterns
const vocabulary = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i].trim();
  
  // Skip empty lines
  if (!line) {
    i++;
    continue;
  }
  
  // Check for chapter headers
  if (line.startsWith('KAPITEL')) {
    currentChapter = line;
    i++;
    continue;
  }
  
  // Check for section headers
  if (/^(NOMEN|VERBEN|ADJEKTIVE|ADVERBIEN|PRÄPOSITIONEN|KONJUNKTIONEN|SONSTIGES)$/.test(line)) {
    currentSection = line;
    i++;
    continue;
  }
  
  // Simple heuristic: if line starts with article (der/die/das) or capital letter, it's German
  // If line starts with lowercase, it's Indonesian
  const isGerman = /^(der|die|das|ein|eine|kein|keine|[A-ZÄÖÜ])/i.test(line);
  const isIndonesian = /^[a-zäöüß]/i.test(line) && !/^(KAPITEL|NOMEN|VERBEN|ADJEKTIVE|ADVERBIEN|PRÄPOSITIONEN|KONJUNKTIONEN|SONSTIGES)$/i.test(line);
  
  // Look ahead to see if this is a German-Indonesian pair
  if (isGerman && i + 1 < lines.length) {
    const nextLine = lines[i + 1].trim();
    if (nextLine && /^[a-zäöüß]/i.test(nextLine) && !/^(KAPITEL|NOMEN|VERBEN|ADJEKTIVE|ADVERBIEN|PRÄPOSITIONEN|KONJUNKTIONEN|SONSTIGES)$/i.test(nextLine)) {
      vocabulary.push({
        word: line,
        translation: nextLine,
        chapter: currentChapter,
        section: currentSection
      });
      i += 2;
      continue;
    }
  }
  
  i++;
}

console.log(`Extracted ${vocabulary.length} vocabulary items`);

// Group by chapter
const byChapter = {};
for (const v of vocabulary) {
  if (!byChapter[v.chapter]) byChapter[v.chapter] = [];
  byChapter[v.chapter].push(v);
}

// Print summary
for (const [chapter, words] of Object.entries(byChapter)) {
  console.log(`${chapter}: ${words.length} words`);
}

// Save to JSON for later use
fs.writeFileSync('.curriculum-analysis/wortschatz-a1-extracted.json', JSON.stringify(vocabulary, null, 2));
console.log('Saved to .curriculum-analysis/wortschatz-a1-extracted.json');
