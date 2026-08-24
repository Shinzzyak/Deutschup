#!/usr/bin/env node
/**
 * DeutschUp Vocabulary Extractor v3
 * 
 * Handles the actual file structure:
 * - Chapter intro: German words only
 * - NOMEN section: German block → Indonesian block
 * - VERBEN section: Alternating Indonesian/German pairs
 * - andere wichtige Wörter: Mixed content
 */

const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, '../.curriculum-analysis/books/netzwerk-neu-a1-b1/wortschatz-a1.txt');
const OUTPUT_FILE = path.join(__dirname, '../src/data/vocabulary.ts');

// Read source file
const content = fs.readFileSync(SOURCE_FILE, 'utf-8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

console.log(`Read ${lines.length} lines from ${SOURCE_FILE}`);

// Helper to detect German words
function isGermanWord(line) {
  if (line.match(/^(der|die|das|ein|eine|einem|einer|einen|dem|des)\s/)) return true;
  if (line.match(/^[A-ZÄÖÜ][a-zäöüß]/) && !line.match(/^(NOMEN|VERBEN|KAPITEL|ADJEKTIVE|ADVERBIEN|PRÄPOSITIONEN|KONJUNKTIONEN|ANDERE)/)) return true;
  return false;
}

// Parse sections
const vocabulary = [];
let currentChapter = 'KAPITEL 1';
let currentSection = 'general';

// Section-specific buffers
let germanBlock = [];
let indonesianBlock = [];

function flushNomenBlock() {
  // NOMEN: German block → Indonesian block
  // Pair by position: german[0]↔indonesian[0], etc.
  const pairs = Math.min(germanBlock.length, indonesianBlock.length);
  
  for (let i = 0; i < pairs; i++) {
    const german = germanBlock[i];
    const indonesian = indonesianBlock[i];
    
    let article = '';
    let cleanWord = german;
    const articleMatch = german.match(/^(der|die|das|ein|eine)\s+(.+)/);
    if (articleMatch) {
      article = articleMatch[1];
      cleanWord = articleMatch[2];
    }
    
    vocabulary.push({
      id: `v-${vocabulary.length + 1}`,
      word: german,
      translation: indonesian,
      article: article,
      cleanWord: cleanWord,
      level: 'A1',
      theme: currentChapter,
      chapter: parseInt(currentChapter.match(/\d+/)?.[0] || '1'),
      section: currentSection,
      type: article ? 'noun' : 'other'
    });
  }
  
  germanBlock = [];
  indonesianBlock = [];
}

function flushVerbenPairs(pairs) {
  // VERBEN: Alternating Indonesian/German pairs
  for (const pair of pairs) {
    let article = '';
    let cleanWord = pair.german;
    const articleMatch = pair.german.match(/^(der|die|das|ein|eine)\s+(.+)/);
    if (articleMatch) {
      article = articleMatch[1];
      cleanWord = articleMatch[2];
    }
    
    vocabulary.push({
      id: `v-${vocabulary.length + 1}`,
      word: pair.german,
      translation: pair.indonesian,
      article: article,
      cleanWord: cleanWord,
      level: 'A1',
      theme: currentChapter,
      chapter: parseInt(currentChapter.match(/\d+/)?.[0] || '1'),
      section: currentSection,
      type: pair.german.match(/(en|ern|eln|ieren)$/) ? 'verb' : 'other'
    });
  }
}

// Process file
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  
  // Chapter marker
  if (line.match(/^KAPITEL \d+/)) {
    // Flush any pending data
    if (currentSection === 'NOMEN') flushNomenBlock();
    currentChapter = line;
    currentSection = 'general';
    i++;
    continue;
  }
  
  // Section markers
  if (line === 'NOMEN') {
    if (currentSection === 'NOMEN') flushNomenBlock();
    currentSection = 'NOMEN';
    germanBlock = [];
    indonesianBlock = [];
    i++;
    continue;
  }
  
  if (line === 'VERBEN') {
    if (currentSection === 'NOMEN') flushNomenBlock();
    currentSection = 'VERBEN';
    i++;
    continue;
  }
  
  if (line.match(/^ADJEKTIVE|^ADVERBIEN|^PRÄPOSITIONEN|^KONJUNKTIONEN|^ANDERE|andere wichtige/i)) {
    if (currentSection === 'NOMEN') flushNomenBlock();
    currentSection = 'ANDERE';
    i++;
    continue;
  }
  
  // Skip empty lines
  if (!line) {
    i++;
    continue;
  }
  
  // Process based on section type
  if (currentSection === 'NOMEN') {
    // NOMEN: German block → Indonesian block
    if (isGermanWord(line)) {
      germanBlock.push(line);
    } else {
      indonesianBlock.push(line);
    }
  } else if (currentSection === 'VERBEN') {
    // VERBEN: Alternating Indonesian/German pairs
    // Collect pairs until next section
    let verbenPairs = [];
    let tempIndonesian = [];
    let tempGerman = [];
    
    while (i < lines.length && !lines[i].match(/^(NOMEN|VERBEN|ADJEKTIVE|ADVERBIEN|PRÄPOSITIONEN|KONJUNKTIONEN|ANDERE|KAPITEL)/i)) {
      const l = lines[i];
      if (l && !l.match(/^(Seite|---|$)/)) {
        if (isGermanWord(l)) {
          tempGerman.push(l);
        } else {
          tempIndonesian.push(l);
        }
      }
      i++;
    }
    
    // Pair them
    const pairs = Math.min(tempGerman.length, tempIndonesian.length);
    for (let j = 0; j < pairs; j++) {
      verbenPairs.push({
        german: tempGerman[j],
        indonesian: tempIndonesian[j]
      });
    }
    
    flushVerbenPairs(verbenPairs);
    continue; // Already incremented i
  } else {
    // General/ANDERE section: skip or handle separately
    // For now, skip these
  }
  
  i++;
}

// Flush final section
if (currentSection === 'NOMEN') flushNomenBlock();

console.log(`\nExtracted ${vocabulary.length} vocabulary pairs`);

// Stats
const bySection = {};
vocabulary.forEach(v => {
  bySection[v.section] = (bySection[v.section] || 0) + 1;
});
console.log('By section:', bySection);

// Sample
console.log('\nSample pairs:');
vocabulary.slice(0, 20).forEach((v, i) => {
  console.log(`${i + 1}. ${v.word} → ${v.translation}`);
});

// Generate TypeScript
const tsContent = `import { VocabWord } from './course';

export interface VocabWord {
  id: string;
  word: string;
  translation: string;
  exampleSentence: string;
  phonetic: string;
  level: string;
  theme: string;
  chapter: number;
  type: string;
}

// Auto-generated by extract-vocabulary-v3.cjs
// Source: Netzwerk Neu A1 Wortschatz book
// Total: ${vocabulary.length} word pairs
// Generated: ${new Date().toISOString()}

export const vocabularyData: VocabWord[] = [
${vocabulary.map(v => `  {
    id: "${v.id}",
    word: "${v.word.replace(/"/g, '\\"')}",
    translation: "${v.translation.replace(/"/g, '\\"')}",
    exampleSentence: "",
    phonetic: "",
    level: "${v.level}",
    theme: "${v.theme.replace(/"/g, '\\"')}",
    chapter: ${v.chapter},
    type: "${v.type}"
  }`).join(',\n')}
];

export const vocabularyByLevel = {
  A1: vocabularyData.filter(v => v.level === 'A1'),
  A2: vocabularyData.filter(v => v.level === 'A2'),
  B1: vocabularyData.filter(v => v.level === 'B1'),
  B2: vocabularyData.filter(v => v.level === 'B2')
};

export const vocabularyByTheme = vocabularyData.reduce((acc, word) => {
  if (!acc[word.theme]) {
    acc[word.theme] = [];
  }
  acc[word.theme].push(word);
  return acc;
}, {} as Record<string, VocabWord[]>);

export const vocabularyByChapter = vocabularyData.reduce((acc, word) => {
  const key = word.level + '-K' + word.chapter;
  if (!acc[key]) {
    acc[key] = [];
  }
  acc[key].push(word);
  return acc;
}, {} as Record<string, VocabWord[]>);

export const vocabularyByType = vocabularyData.reduce((acc, word) => {
  if (!acc[word.type]) {
    acc[word.type] = [];
  }
  acc[word.type].push(word);
  return acc;
}, {} as Record<string, VocabWord[]>);
`;

fs.writeFileSync(OUTPUT_FILE, tsContent);
console.log(`\n✅ Written to ${OUTPUT_FILE}`);
console.log(`File size: ${(Buffer.byteLength(tsContent) / 1024).toFixed(1)} KB`);
