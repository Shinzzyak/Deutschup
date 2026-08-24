const fs = require('fs');
const { execSync } = require('child_process');

const pdfDir = '.curriculum-analysis/books/wortschatz-pdfs';

// Extract B1 (text PDF)
console.log('=== Extracting B1 ===');
const b1Text = fs.readFileSync(`${pdfDir}/wortschatz-b1.txt`, 'utf8');
const b1Lines = b1Text.split('\n');

const b1Vocab = [];
let b1Chapter = '';

for (let i = 0; i < b1Lines.length; i++) {
  const line = b1Lines[i].trim();
  
  // Skip empty lines
  if (!line) continue;
  
  // Check for chapter headers (numbers at start of line)
  if (/^\d+\s+[A-ZÄÖÜ]/.test(line)) {
    b1Chapter = line;
    continue;
  }
  
  // Simple extraction: German words (with articles) followed by something on next line
  const isGerman = /^(der|die|das|ein|eine|kein|keine|[A-ZÄÖÜ][a-zäöüß]+)/i.test(line);
  
  if (isGerman && i + 1 < b1Lines.length) {
    const nextLine = b1Lines[i + 1].trim();
    // If next line looks like Indonesian/translation
    if (nextLine && /^[a-zäöüß]/i.test(nextLine)) {
      b1Vocab.push({
        word: line,
        translation: nextLine,
        chapter: b1Chapter
      });
      i++; // Skip translation line
    }
  }
}

console.log(`B1 extracted: ${b1Vocab.length} words`);

// Save B1
fs.writeFileSync(`${pdfDir}/wortschatz-b1-extracted.json`, JSON.stringify(b1Vocab, null, 2));

// For A1, A2, B2 - use OCR
const ocrFiles = ['wortschatz-a1.pdf', 'wortschatz-a2.pdf', 'wortschatz-b2.pdf'];
const levels = ['A1', 'A2', 'B2'];

for (let idx = 0; idx < ocrFiles.length; idx++) {
  const pdfFile = ocrFiles[idx];
  const level = levels[idx];
  
  console.log(`\n=== OCR ${level} ===`);
  
  // Convert PDF to images
  const imgDir = `${pdfDir}/${level.toLowerCase()}-images`;
  fs.mkdirSync(imgDir, { recursive: true });
  
  try {
    execSync(`pdftoppm -r 100 -png "${pdfDir}/${pdfFile}" "${imgDir}/page"`, { timeout: 300000 });
    
    // Get list of images
    const images = fs.readdirSync(imgDir).filter(f => f.endsWith('.png')).sort();
    console.log(`Generated ${images.length} images`);
    
    // OCR each image
    const allText = [];
    for (const img of images) {
      try {
        const text = execSync(`tesseract -l deu "${imgDir}/${img}" stdout 2>/dev/null`, { timeout: 30000 }).toString();
        allText.push(text);
      } catch (e) {
        console.log(`OCR failed for ${img}`);
      }
    }
    
    // Save extracted text
    const fullText = allText.join('\n');
    fs.writeFileSync(`${pdfDir}/wortschatz-${level.toLowerCase()}-ocr.txt`, fullText);
    console.log(`OCR complete: ${fullText.length} characters`);
    
    // Extract vocabulary
    const lines = fullText.split('\n');
    const vocab = [];
    let chapter = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Chapter detection
      if (/^KAPITEL|^\d+\s+[A-ZÄÖÜ]/.test(line)) {
        chapter = line;
        continue;
      }
      
      // Vocabulary extraction
      const isGerman = /^(der|die|das|ein|eine|kein|keine|[A-ZÄÖÜ][a-zäöüß]+)/i.test(line);
      if (isGerman && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine && /^[a-zäöüß]/i.test(nextLine)) {
          vocab.push({
            word: line,
            translation: nextLine,
            chapter: chapter
          });
          i++;
        }
      }
    }
    
    console.log(`${level} extracted: ${vocab.length} words`);
    fs.writeFileSync(`${pdfDir}/wortschatz-${level.toLowerCase()}-extracted.json`, JSON.stringify(vocab, null, 2));
    
    // Cleanup images
    execSync(`rm -rf "${imgDir}"`, { timeout: 10000 });
    
  } catch (e) {
    console.log(`Failed to process ${pdfFile}: ${e.message}`);
  }
}

console.log('\n=== Done ===');
