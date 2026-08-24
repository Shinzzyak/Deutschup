const fs = require('fs');

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
  
  const intro = sections.find(s => s.type === 'intro');
  const vocab = sections.find(s => s.type === 'vocab');
  const grammar = sections.find(s => s.type === 'grammar');
  const exercises = sections.find(s => s.type === 'exercises');
  
  const vocabulary = (vocab?.content?.vocabulary || []).map(v => ({
    id: v.word.replace(/\s+/g, '-').toLowerCase(),
    word: v.word,
    article: v.article || '',
    translation: v.translation,
    exampleSentence: v.example,
    phonetic: '',
    level: data.level
  }));
  
  const exerciseData = (exercises?.content?.exercises || []).map(e => ({
    question: e.question,
    options: e.options || [],
    correctAnswer: typeof e.correct === 'number' ? e.correct : 0
  }));
  
  const grammarRules = grammar?.content?.rules || [];
  const grammarExamples = grammar?.content?.examples || [];
  const grammarDescription = [
    ...grammarRules.map(r => `• ${r}`),
    '',
    'Contoh:',
    ...grammarExamples.map(e => `- ${e}`)
  ].join('\n');
  
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

// Find the insertion point (before the closing of courseData array)
// The array ends with ]; at the end of the file
const arrayEnd = content.lastIndexOf('];');
if (arrayEnd === -1) {
  console.error('Cannot find array end ];');
  process.exit(1);
}

// Build the new lessons string
let newLessonsStr = '';

for (const file of newFiles) {
  if (!fs.existsSync(file)) {
    console.log(`File not found: ${file}`);
    continue;
  }
  
  const fileContent = fs.readFileSync(file, 'utf8');
  
  // Extract the exported variable name and data
  const exportMatch = fileContent.match(/export const (\w+)/);
  if (!exportMatch) {
    console.log(`No export found in ${file}`);
    continue;
  }
  
  // Find the object literal - everything between the first { and last }
  const firstBrace = fileContent.indexOf('{');
  const lastBrace = fileContent.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
    console.log(`Cannot parse ${file}`);
    continue;
  }
  
  const objectStr = fileContent.slice(firstBrace, lastBrace + 1);
  
  let data;
  try {
    data = eval('(' + objectStr + ')');
  } catch (e) {
    console.log(`Cannot parse ${file}: ${e.message}`);
    continue;
  }
  
  // Convert to Lesson format
  const lesson = convertLesson(data);
  
  // Format with 2-space indentation
  const lessonJson = JSON.stringify(lesson, null, 2);
  // Add 2 spaces indentation to each line
  const indented = lessonJson.split('\n').map(line => '  ' + line).join('\n');
  
  newLessonsStr += indented + ',\n';
  console.log(`Converted: ${data.id} (${data.title})`);
}

// Insert before the array end
content = content.slice(0, arrayEnd) + newLessonsStr + content.slice(arrayEnd);

// Write updated lessons.ts
fs.writeFileSync(lessonsPath, content, 'utf8');
console.log('\nDone! Updated lessons.ts');
