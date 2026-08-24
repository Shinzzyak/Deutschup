const fs = require('fs');
const { execSync } = require('child_process');

const pdfDir = '.curriculum-analysis/books/wortschatz-pdfs';

// OCR A2 images
console.log('=== OCR A2 ===');
const a2ImgDir = `${pdfDir}/a2-images`;
const a2Images = fs.readdirSync(a2ImgDir).filter(f => f.endsWith('.png')).sort();
console.log(`Found ${a2Images.length} images`);

const a2Text = [];
for (let i = 0; i < a2Images.length; i++) {
  const img = a2Images[i];
  console.log(`OCR ${i+1}/${a2Images.length}: ${img}`);
  try {
    const text = execSync(`tesseract -l deu "${a2ImgDir}/${img}" stdout 2>/dev/null`, { timeout: 60000 }).toString();
    a2Text.push(text);
  } catch (e) {
    console.log(`Failed: ${img}`);
  }
}

const a2FullText = a2Text.join('\n');
fs.writeFileSync(`${pdfDir}/wortschatz-a2-ocr.txt`, a2FullText);
console.log(`A2 OCR complete: ${a2FullText.length} characters`);

// Extract A2 vocabulary
const a2Lines = a2FullText.split('\n');
const a2Vocab = [];
let a2Chapter = '';

for (let i = 0; i < a2Lines.length; i++) {
  const line = a2Lines[i].trim();
  if (!line) continue;
  
  if (/^KAPITEL|^\d+\s+[A-ZÄÖÜ]/.test(line)) {
    a2Chapter = line;
    continue;
  }
  
  const isGerman = /^(der|die|das|ein|eine|kein|keine|[A-ZÄÖÜ][a-zäöüß]+)/i.test(line);
  if (isGerman && i + 1 < a2Lines.length) {
    const nextLine = a2Lines[i + 1].trim();
    if (nextLine && /^[a-zäöüß]/i.test(nextLine)) {
      a2Vocab.push({
        word: line,
        translation: nextLine,
        chapter: a2Chapter
      });
      i++;
    }
  }
}

console.log(`A2 extracted: ${a2Vocab.length} words`);
fs.writeFileSync(`${pdfDir}/wortschatz-a2-extracted.json`, JSON.stringify(a2Vocab, null, 2));

// Cleanup A2 images
execSync(`rm -rf "${a2ImgDir}"`, { timeout: 10000 });
console.log('A2 done');
