#!/usr/bin/env node
/**
 * DeutschUp Vocabulary Extractor v2
 * 
 * Fixes the mapping bug in v1:
 * - v1 paired consecutive lines (German↔German)
 * - v2 properly detects alternating Indonesian↔German pairs
 * 
 * File structure (NOMEN/VERBEN sections):
 *   NOMEN
 *   janji temu       ← Indonesian
 *   der Computer     ← German
 *   teman perempuan  ← Indonesian
 *   der Freund       ← German
 *   ...
 */

const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, '../.curriculum-analysis/books/netzwerk-neu-a1-b1/wortschatz-a1.txt');
const OUTPUT_FILE = path.join(__dirname, '../src/data/vocabulary.ts');

// Read source file
const content = fs.readFileSync(SOURCE_FILE, 'utf-8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

console.log(`Read ${lines.length} lines from ${SOURCE_FILE}`);

// Parse the file
const vocabulary = [];
let currentChapter = 'KAPITEL 1';
let currentSection = 'general';
let germanBuffer = [];
let indonesianBuffer = [];

function isGermanWord(line) {
  // German words typically start with articles or are capitalized nouns
  if (line.match(/^(der|die|das|ein|eine|einem|einer|einen|dem|des)\s/)) return true;
  if (line.match(/^[A-ZÄÖÜ][a-zäöüß]/) && !line.match(/^(NOMEN|VERBEN|KAPITEL|ADJEKTIVE|ADVERBIEN|PRÄPOSITIONEN|KONJUNKTIONEN|ANDERE)/)) return true;
  return false;
}

function flushBuffers() {
  if (germanBuffer.length === 0 && indonesianBuffer.length === 0) return;
  
  // Pair German and Indonesian words
  const pairs = Math.min(germanBuffer.length, indonesianBuffer.length);
  
  for (let i = 0; i < pairs; i++) {
    const german = germanBuffer[i];
    const indonesian = indonesianBuffer[i];
    
    // Extract article
    let article = '';
    let cleanWord = german;
    const articleMatch = german.match(/^(der|die|das|ein|eine|einem|einer|einen|dem|des)\s+(.+)/);
    if (articleMatch) {
      article = articleMatch[1];
      cleanWord = articleMatch[2];
    }
    
    // Determine word type
    let wordType = 'other';
    if (article) {
      wordType = 'noun';
    } else if (cleanWord.match(/(en|ern|eln|ieren)$/) && !cleanWord.match(/(ung|heit|keit|schaft|nis|ling|tum)$/)) {
      wordType = 'verb';
    } else if (cleanWord.match(/(ig|lich|isch|bar|los|sam)$/)) {
      wordType = 'adjective';
    } else if (cleanWord.match(/(schaft|heit|keit|ung|nis|ling|tum)$/)) {
      wordType = 'noun';
    }
    
    vocabulary.push({
      id: `v-${vocabulary.length + 1}`,
      word: german,
      translation: indonesian,
      article: article,
      cleanWord: cleanWord,
      exampleSentence: '',
      phonetic: '',
      level: 'A1',
      theme: currentChapter,
      chapter: parseInt(currentChapter.match(/\d+/)?.[0] || '1'),
      section: currentSection,
      type: wordType
    });
  }
  
  germanBuffer = [];
  indonesianBuffer = [];
}

// Process lines
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Chapter marker
  if (line.match(/^KAPITEL \d+/)) {
    flushBuffers();
    currentChapter = line;
    currentSection = 'general';
    continue;
  }
  
  // Section markers
  if (line === 'NOMEN') {
    flushBuffers();
    currentSection = 'NOMEN';
    continue;
  }
  if (line === 'VERBEN') {
    flushBuffers();
    currentSection = 'VERBEN';
    continue;
  }
  if (line.match(/^ADJEKTIVE/i)) {
    flushBuffers();
    currentSection = 'ADJEKTIVE';
    continue;
  }
  if (line.match(/^ADVERBIEN/i)) {
    flushBuffers();
    currentSection = 'ADVERBIEN';
    continue;
  }
  if (line.match(/^PRÄPOSITIONEN/i)) {
    flushBuffers();
    currentSection = 'PRÄPOSITIONEN';
    continue;
  }
  if (line.match(/^KONJUNKTIONEN/i)) {
    flushBuffers();
    currentSection = 'KONJUNKTIONEN';
    continue;
  }
  if (line.match(/^ANDERE|andere wichtige/i)) {
    flushBuffers();
    currentSection = 'ANDERE';
    continue;
  }
  
  // Skip empty lines and other non-word content
  if (!line || line.match(/^(Seite|---|$)/)) continue;
  
  // Classify as German or Indonesian
  if (isGermanWord(line)) {
    germanBuffer.push(line);
  } else {
    indonesianBuffer.push(line);
  }
}

// Flush remaining
flushBuffers();

console.log(`\nExtracted ${vocabulary.length} vocabulary pairs`);

// Stats
const bySection = {};
const byType = {};

vocabulary.forEach(v => {
  bySection[v.section] = (bySection[v.section] || 0) + 1;
  byType[v.type] = (byType[v.type] || 0) + 1;
});

console.log('\nBy section:', bySection);
console.log('By type:', byType);

// Sample output
console.log('\nSample pairs (first 20):');
vocabulary.slice(0, 20).forEach((v, i) => {
  console.log(`${i + 1}. ${v.word} → ${v.translation} (${v.type})`);
});

// Check for bad mappings
const badMappings = vocabulary.filter(v => {
  // German word paired with German word
  return isGermanWord(v.translation);
});

if (badMappings.length > 0) {
  console.log(`\n⚠️  WARNING: ${badMappings.length} bad mappings found (German→German):`);
  badMappings.slice(0, 10).forEach(v => {
    console.log(`  ${v.word} → ${v.translation}`);
  });
}

// Generate TypeScript file
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

// Auto-generated by extract-vocabulary-v2.cjs
// Source: Netzwerk Neu A1 Wortschatz book
// Total: ${vocabulary.length} word pairs
// Generated: ${new Date().toISOString()}

export const vocabularyData: VocabWord[] = [
${vocabulary.map(v => `  {
    id: "${v.id}",
    word: "${v.word.replace(/"/g, '\\"')}",
    translation: "${v.translation.replace(/"/g, '\\"')}",
    exampleSentence: "${v.exampleSentence}",
    phonetic: "${v.phonetic}",
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
