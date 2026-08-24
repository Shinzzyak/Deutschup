const fs = require('fs');
const path = require('path');

// Read new lesson files
const newFiles = [
  'src/data/lessons-a1-new.ts',
  'src/data/lessons-a1-15.ts', 'src/data/lessons-a1-16.ts', 'src/data/lessons-a1-17.ts',
  'src/data/lessons-a1-18.ts', 'src/data/lessons-a1-19.ts', 'src/data/lessons-a1-20.ts',
  'src/data/lessons-a1-21.ts', 'src/data/lessons-a1-22.ts', 'src/data/lessons-a1-23.ts',
  'src/data/lessons-a1-24.ts', 'src/data/lessons-a1-25.ts', 'src/data/lessons-a1-26.ts',
  'src/data/lessons-a2-14.ts', 'src/data/lessons-a2-15.ts', 'src/data/lessons-a2-16.ts',
  'src/data/lessons-a2-17.ts', 'src/data/lessons-a2-18.ts',
  'src/data/lessons-b1-13.ts', 'src/data/lessons-b1-14.ts'
];

function convertLesson(data) {
  const sections = data.sections || [];
  
  // Find sections by type
  const intro = sections.find(s => s.type === 'intro');
  const vocab = sections.find(s => s.type === 'vocab');
  const grammar = sections.find(s => s.type === 'grammar');
  const exercises = sections.find(s => s.type === 'exercises');
  
  // Convert vocabulary
  const vocabulary = (vocab?.content?.vocabulary || []).map(v => ({
    id: v.word.replace(/\s+/g, '-').toLowerCase(),
    word: v.word,
    article: v.article || '',
    translation: v.translation,
    exampleSentence: v.example,
    phonetic: '',
    level: data.level
  }));
  
  // Convert exercises
  const exerciseData = (exercises?.content?.exercises || []).map(e => ({
    question: e.question,
    options: e.options || [],
    correctAnswer: e.correct
  }));
  
  // Get grammar rules
  const grammarRules = grammar?.content?.rules || [];
  const grammarExamples = grammar?.content?.examples || [];
  const grammarDescription = [
    ...grammarRules.map(r => `• ${r}`),
    '',
    'Contoh:',
    ...grammarExamples.map(e => `- ${e}`)
  ].join('\n');
  
  // Get intro content
  const introContent = intro?.content || {};
  
  return {
    id: data.id,
    level: data.level,
    title: data.title,
    grammarDescription: grammarDescription,
    vocabulary: vocabulary,
    exercises: exerciseData,
    canDoGoals: [],
    culturalNotes: '',
    indonesianMistakes: '',
    sentenceBreakdowns: grammarExamples.slice(0, 3),
    pronunciationTips: [],
    listeningSimulation: null
  };
}

// Read existing lessons.ts
const lessonsPath = 'src/data/lessons.ts';
let content = fs.readFileSync(lessonsPath, 'utf8');

// For each new file, convert and add
for (const file of newFiles) {
  const filePath = file;
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    continue;
  }
  
  // Read the file
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Extract the exported variable name
  const exportMatch = fileContent.match(/export const (\w+)/);
  if (!exportMatch) {
    console.log(`No export found in ${file}`);
    continue;
  }
  
  const varName = exportMatch[1];
  
  // Eval the file to get the data
  // Remove TypeScript type annotations for eval
  const jsContent = fileContent
    .replace(/export const \w+:/, 'const data =')
    .replace(/: any\[\]/g, '')
    .replace(/: string/g, '')
    .replace(/: number/g, '')
    .replace(/: object/g, '')
    .replace(/: string\[\]/g, '');
  
  let data;
  try {
    // Use Function constructor to eval safely
    const fn = new Function('const data = ' + jsContent.replace(/^const data = /, '').replace(/export const \w+ = /, '') + '; return data;');
    data = fn();
  } catch (e) {
    // Try different approach - extract JSON-like structure
    try {
      // Find the object literal
      const objMatch = fileContent.match(/export const \w+ = (\{[\s\S]*\});/);
      if (objMatch) {
        data = eval('(' + objMatch[1] + ')');
      } else {
        console.log(`Cannot parse ${file}: ${e.message}`);
        continue;
      }
    } catch (e2) {
      console.log(`Cannot parse ${file}: ${e2.message}`);
      continue;
    }
  }
  
  // Convert to Lesson format
  const lesson = convertLesson(data);
  
  // Insert before the closing bracket of courseData
  const insertPoint = content.lastIndexOf('];');
  const lessonStr = `  ${JSON.stringify(lesson, null, 2)},\n`;
  content = content.slice(0, insertPoint) + lessonStr + content.slice(insertPoint);
  
  console.log(`Converted and added: ${data.id} (${data.title})`);
}

// Write updated lessons.ts
fs.writeFileSync(lessonsPath, content, 'utf8');
console.log('\nDone! Updated lessons.ts');
