const fs = require('fs');
const { execSync } = require('child_process');

const pdfDir = '.curriculum-analysis/books/wortschatz-pdfs';

console.log('=== OCR B2 ===');
const b2ImgDir = `${pdfDir}/b2-images`;
const b2Images = fs.readdirSync(b2ImgDir).filter(f => f.endsWith('.png')).sort();
console.log(`Found ${b2Images.length} images`);

const b2Text = [];
for (let i = 0; i < b2Images.length; i++) {
  const img = b2Images[i];
  console.log(`OCR ${i+1}/${b2Images.length}: ${img}`);
  try {
    const text = execSync(`tesseract -l deu "${b2ImgDir}/${img}" stdout 2>/dev/null`, { timeout: 60000 }).toString();
    b2Text.push(text);
  } catch (e) {
    console.log(`Failed: ${img}`);
  }
}

const b2FullText = b2Text.join('\n');
fs.writeFileSync(`${pdfDir}/wortschatz-b2-ocr.txt`, b2FullText);
console.log(`B2 OCR complete: ${b2FullText.length} characters`);

// Extract B2 vocabulary
const b2Lines = b2FullText.split('\n');
const b2Vocab = [];
let b2Chapter = '';

for (let i = 0; i < b2Lines.length; i++) {
  const line = b2Lines[i].trim();
  if (!line) continue;
  
  if (/^KAPITEL|^\d+\s+[A-ZÄÖÜ]/.test(line)) {
    b2Chapter = line;
    continue;
  }
  
  const isGerman = /^(der|die|das|ein|eine|kein|keine|[A-ZÄÖÜ][a-zäöüß]+)/i.test(line);
  if (isGerman && i + 1 < b2Lines.length) {
    const nextLine = b2Lines[i + 1].trim();
    if (nextLine && /^[a-zäöüß]/i.test(nextLine)) {
      b2Vocab.push({
        word: line,
        translation: nextLine,
        chapter: b2Chapter
      });
      i++;
    }
  }
}

console.log(`B2 extracted: ${b2Vocab.length} words`);
fs.writeFileSync(`${pdfDir}/wortschatz-b2-extracted.json`, JSON.stringify(b2Vocab, null, 2));

// Cleanup
execSync(`rm -rf "${b2ImgDir}"`, { timeout: 10000 });
console.log('B2 done');
