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
  'src/data/lessons-b1-13.ts', 'src/data/lessons-b1-14.ts',
  'src/data/lessons-a2-19.ts', 'src/data/lessons-a2-20.ts', 'src/data/lessons-a2-21.ts',
  'src/data/lessons-a2-22.ts', 'src/data/lessons-a2-23.ts', 'src/data/lessons-a2-24.ts',
  'src/data/lessons-a2-25.ts'
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

// Find the position of ]; at the end
const endMarker = '\n];';
const endPos = content.lastIndexOf(endMarker);
if (endPos === -1) {
  console.error('Cannot find end marker ];');
  process.exit(1);
}

// Check if we need to add a comma before new lessons
// Look at the character just before endPos
const charBefore = content[endPos - 1];
const needsComma = charBefore !== ',' && charBefore !== '[';

// Build the new lessons array
let newLessons = [];

for (const file of newFiles) {
  if (!fs.existsSync(file)) {
    console.log(`File not found: ${file}`);
    continue;
  }
  
  const fileContent = fs.readFileSync(file, 'utf8');
  
  // Find the object literal
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
  
  const lesson = convertLesson(data);
  newLessons.push(lesson);
  console.log(`Converted: ${data.id} (${data.title})`);
}

// Format the new lessons with proper indentation
const formattedLessons = newLessons.map(lesson => {
  const json = JSON.stringify(lesson, null, 2);
  return json.split('\n').map(line => '  ' + line).join('\n');
});

// Build the insertion string
let insertion = '';
if (needsComma) {
  insertion = ',\n';
}
insertion += formattedLessons.join(',\n') + '\n';

// Insert before the end marker
content = content.slice(0, endPos) + insertion + content.slice(endPos);

// Write updated lessons.ts
fs.writeFileSync(lessonsPath, content, 'utf8');
console.log('\nDone! Updated lessons.ts');
