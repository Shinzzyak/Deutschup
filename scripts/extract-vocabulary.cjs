#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const wortschatzA1Path = path.join(__dirname, '../.curriculum-analysis/books/netzwerk-neu-a1-b1/wortschatz-a1.txt');
const wortschatzA1 = fs.readFileSync(wortschatzA1Path, 'utf-8');

const lines = wortschatzA1.split('\n');
const vocabulary = [];
let currentChapter = '';
let currentTheme = '';

const chapterThemes = {
  'KAPITEL 1': 'Guten Tag! (Perkenalan)',
  'KAPITEL 2': 'Die Schule (Sekolah)',
  'KAPITEL 3': 'Freunde (Teman)',
  'KAPITEL 4': 'Mein Tag (Hari Saya)',
  'KAPITEL 5': 'Essen und Trinken (Makanan)',
  'KAPITEL 6': 'Stadt und Land (Kota)',
  'KAPITEL 7': 'Körper und Gesundheit (Tubuh)',
  'KAPITEL 8': 'Kleidung (Pakaian)',
  'KAPITEL 9': 'Wohnen (Tinggal)',
  'KAPITEL 10': 'Familie (Keluarga)',
  'KAPITEL 11': 'Geld und Einkaufen (Uang)',
  'KAPITEL 12': 'Freizeit (Waktu Luang)'
};

// Better parsing: collect German words and Indonesian translations separately
let germanWords = [];
let indonesianWords = [];
let inGermanSection = true;
let i = 0;

while (i < lines.length) {
  const line = lines[i].trim();
  
  // Detect chapter headers
  if (line.match(/^KAPITEL \d+/)) {
    // Process previous batch
    if (germanWords.length > 0 && indonesianWords.length > 0) {
      const minLength = Math.min(germanWords.length, indonesianWords.length);
      for (let j = 0; j < minLength; j++) {
        const german = germanWords[j];
        const indonesian = indonesianWords[j];
        
        // Determine word type
        let wordType = 'noun';
        let article = '';
        let cleanWord = german;
        
        const articleMatch = german.match(/^(der |die |das |ein |eine |einem |einer |einen |dem |des )(.+)/);
        if (articleMatch) {
          article = articleMatch[1];
          cleanWord = articleMatch[2];
        }
        
        // Check if it's a verb
        if (!article && cleanWord.match(/(en|ern|eln|ieren)$/) && !cleanWord.match(/(ung|heit|keit|schaft|nis|ling|tum)$/)) {
          wordType = 'verb';
        }
        // Check if it's an adjective
        else if (!article && cleanWord.match(/(ig|lich|isch|bar|los|sam|isch)$/)) {
          wordType = 'adjective';
        }
        
        vocabulary.push({
          id: `v-a1-${vocabulary.length + 1}`,
          word: german,
          translation: indonesian,
          exampleSentence: '',
          phonetic: '',
          level: 'A1',
          theme: currentTheme,
          chapter: parseInt(currentChapter.match(/\d+/)?.[0] || '1'),
          type: wordType
        });
      }
    }
    
    currentChapter = line;
    currentTheme = chapterThemes[line] || line;
    germanWords = [];
    indonesianWords = [];
    inGermanSection = true;
    i++;
    continue;
  }
  
  // Skip section headers and empty lines
  if (line === '' || line.match(/^(NOMEN|VERBEN|ADJEKTIVE|ADVERBIEN|PRÄPOSITIONEN|KONJUNKTIONEN|ANDERE|andere|Nomen|Verben)/i)) {
    if (line === '' && germanWords.length > 0 && indonesianWords.length === 0) {
      inGermanSection = false;
    }
    i++;
    continue;
  }
  
  // Collect words
  if (inGermanSection) {
    germanWords.push(line);
  } else {
    indonesianWords.push(line);
  }
  
  i++;
}

// Process final batch
if (germanWords.length > 0 && indonesianWords.length > 0) {
  const minLength = Math.min(germanWords.length, indonesianWords.length);
  for (let j = 0; j < minLength; j++) {
    const german = germanWords[j];
    const indonesian = indonesianWords[j];
    
    let wordType = 'noun';
    let article = '';
    let cleanWord = german;
    
    const articleMatch = german.match(/^(der |die |das |ein |eine |einem |einer |einen |dem |des )(.+)/);
    if (articleMatch) {
      article = articleMatch[1];
      cleanWord = articleMatch[2];
    }
    
    if (!article && cleanWord.match(/(en|ern|eln|ieren)$/) && !cleanWord.match(/(ung|heit|keit|schaft|nis|ling|tum)$/)) {
      wordType = 'verb';
    } else if (!article && cleanWord.match(/(ig|lich|isch|bar|los|sam)$/)) {
      wordType = 'adjective';
    }
    
    vocabulary.push({
      id: `v-a1-${vocabulary.length + 1}`,
      word: german,
      translation: indonesian,
      exampleSentence: '',
      phonetic: '',
      level: 'A1',
      theme: currentTheme,
      chapter: parseInt(currentChapter.match(/\d+/)?.[0] || '1'),
      type: wordType
    });
  }
}

// Create the vocabulary.ts file
const output = `import { VocabWord } from './course';

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

export const vocabularyData: VocabWord[] = [
${vocabulary.map(v => `  {
    id: "${v.id}",
    word: "${v.word.replace(/"/g, '\\"')}",
    translation: "${v.translation.replace(/"/g, '\\"')}",
    exampleSentence: "${v.exampleSentence}",
    phonetic: "${v.phonetic}",
    level: "${v.level}",
    theme: "${v.theme}",
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

fs.writeFileSync(path.join(__dirname, '../src/data/vocabulary.ts'), output);
console.log(`Extracted ${vocabulary.length} vocabulary words from Wortschatz A1`);
console.log(`Chapters: ${new Set(vocabulary.map(v => v.chapter)).size}`);
console.log(`Themes: ${new Set(vocabulary.map(v => v.theme)).size}`);
