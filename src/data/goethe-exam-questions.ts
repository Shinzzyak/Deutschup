export interface ExamQuestion {
  id: string;
  type: 'reading' | 'listening' | 'writing' | 'speaking' | 'grammar' | 'vocab';
  level: 'a1' | 'a2' | 'b1' | 'b2';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
}

export const goetheExamQuestions: ExamQuestion[] = [
  // A1 Reading
  {
    id: 'a1-r-001',
    type: 'reading',
    level: 'a1',
    question: 'Lesen Sie den Text:\n\n"Mein Name ist Anna. Ich bin 25 Jahre alt. Ich komme aus Indonesien und wohne jetzt in Berlin. Ich studiere Informatik an der Universität."\n\nWoher kommt Anna?',
    options: ['Aus Deutschland', 'Aus Indonesien', 'Aus Österreich', 'Aus der Schweiz'],
    correctAnswer: 'Aus Indonesien',
    explanation: 'Im Text steht: "Ich komme aus Indonesien"',
    points: 5
  },
  {
    id: 'a1-r-002',
    type: 'reading',
    level: 'a1',
    question: 'Lesen Sie:\n\n"Öffnungszeiten: Mo-Fr 8:00-18:00, Sa 9:00-14:00, So geschlossen"\n\nWann ist das Geschäft am Samstag offen?',
    options: ['8:00-18:00', '9:00-14:00', 'Geschlossen', '8:00-14:00'],
    correctAnswer: '9:00-14:00',
    explanation: 'Sa (Samstag) = 9:00-14:00',
    points: 5
  },
  {
    id: 'a1-r-003',
    type: 'reading',
    level: 'a1',
    question: 'Was bedeutet "Termin"?',
    options: ['Ein Ort', 'Eine Zeitvereinbarung', 'Ein Essen', 'Ein Buch'],
    correctAnswer: 'Eine Zeitvereinbarung',
    explanation: 'Termin = janji temu / waktu yang sudah ditentukan',
    points: 5
  },
  // A1 Grammar
  {
    id: 'a1-g-001',
    type: 'grammar',
    level: 'a1',
    question: 'Ich ___ aus Indonesien.',
    options: ['bin', 'ist', 'bist', 'sind'],
    correctAnswer: 'bin',
    explanation: 'Ich + bin (1. Person Singular)',
    points: 5
  },
  {
    id: 'a1-g-002',
    type: 'grammar',
    level: 'a1',
    question: 'Das ist ___ Buch.',
    options: ['ein', 'eine', 'einer', 'eines'],
    correctAnswer: 'ein',
    explanation: 'Buch = neutrum → ein Buch',
    points: 5
  },
  {
    id: 'a1-g-003',
    type: 'grammar',
    level: 'a1',
    question: 'Ich ___ Deutsch.',
    options: ['spreche', 'sprichst', 'spricht', 'sprechen'],
    correctAnswer: 'spreche',
    explanation: 'Ich + spreche (1. Person Singular)',
    points: 5
  },
  // A1 Vocabulary
  {
    id: 'a1-v-001',
    type: 'vocab',
    level: 'a1',
    question: 'Was bedeutet "Kühlschrank"?',
    options: ['Kulkas', 'Kompor', 'Televisi', 'Meja'],
    correctAnswer: 'Kulkas',
    explanation: 'Kühlschrank = lemari es / kulkas',
    points: 5
  },
  {
    id: 'a1-v-002',
    type: 'vocab',
    level: 'a1',
    question: 'Was bedeutet "Bahnhof"?',
    options: ['Stasiun kereta', 'Bandara', 'Pelabuhan', 'Halte bus'],
    correctAnswer: 'Stasiun kereta',
    explanation: 'Bahnhof = stasiun kereta api',
    points: 5
  },
  // A2 Reading
  {
    id: 'a2-r-001',
    type: 'reading',
    level: 'a2',
    question: 'Lesen Sie:\n\n"Sehr geehrte Damen und Herren, ich möchte einen Termin für nächsten Montag um 14 Uhr vereinbaren. Mit freundlichen Grüßen, Hans Müller."\n\nWas möchte Hans?',
    options: ['Arztbesuch', 'Termin vereinbaren', 'Kündigen', 'Umziehen'],
    correctAnswer: 'Termin vereinbaren',
    explanation: '"ich möchte einen Termin...vereinbaren"',
    points: 5
  },
  {
    id: 'a2-r-002',
    type: 'reading',
    level: 'a2',
    question: 'Was steht in der Anzeige?\n\n"3-Zimmer-Wohnung, 75m², Balkon, 850€ warm, ab 1. März"\n\nWie viele Zimmer hat die Wohnung?',
    options: ['2', '3', '4', '5'],
    correctAnswer: '3',
    explanation: '3-Zimmer-Wohnung = apartemen 3 kamar',
    points: 5
  },
  // A2 Grammar
  {
    id: 'a2-g-001',
    type: 'grammar',
    level: 'a2',
    question: 'Gestern ___ ich ins Kino gegangen.',
    options: ['bin', 'habe', 'war', 'hatte'],
    correctAnswer: 'bin',
    explanation: 'Perfekt mit "sein" bei Bewegung: ich bin gegangen',
    points: 5
  },
  {
    id: 'a2-g-002',
    type: 'grammar',
    level: 'a2',
    question: 'Wenn ich Zeit ___, würde ich dich besuchen.',
    options: ['habe', 'hätte', 'hatte', 'haben'],
    correctAnswer: 'hätte',
    explanation: 'Konjunktiv II: wenn ich Zeit hätte',
    points: 5
  },
  // B1 Reading
  {
    id: 'b1-r-001',
    type: 'reading',
    level: 'b1',
    question: 'Lesen Sie:\n\n"Trotz der steigenden Mietpreise ziehen immer mehr Menschen in die Städte. Die Nachfrage nach Wohnungen ist hoch, das Angebot jedoch gering."\n\nWas ist das Problem?',
    options: ['Zu viele Menschen', 'Hohe Mietpreise', 'Wenig Arbeit', 'Schlechte Schulen'],
    correctAnswer: 'Hohe Mietpreise',
    explanation: '"steigende Mietpreise" + "Nachfrage hoch, Angebot gering"',
    points: 10
  },
  {
    id: 'b1-r-002',
    type: 'reading',
    level: 'b1',
    question: 'Was ist die Meinung des Autors?\n\n"Obwohl Remote-Work viele Vorteile hat, fehlt den Mitarbeitern oft der soziale Kontakt. Unternehmen sollten hybride Modelle anbieten."\n\nDer Autor ist für:',
    options: ['Nur Office-Work', 'Nur Remote-Work', 'Hybride Modelle', 'Keine Arbeit'],
    correctAnswer: 'Hybride Modelle',
    explanation: '"Unternehmen sollten hybride Modelle anbieten"',
    points: 10
  },
  // B1 Grammar
  {
    id: 'b1-g-001',
    type: 'grammar',
    level: 'b1',
    question: 'Das Buch, ___ ich gelesen habe, war sehr spannend.',
    options: ['das', 'den', 'dem', 'dessen'],
    correctAnswer: 'das',
    explanation: 'Relativpronomen Akkusativ Neutrum: das Buch → das',
    points: 10
  },
  {
    id: 'b1-g-002',
    type: 'grammar',
    level: 'b1',
    question: 'Er hat gesagt, er ___ morgen kommen.',
    options: ['wird', 'würde', 'will', 'wollte'],
    correctAnswer: 'würde',
    explanation: 'Indirekte Rede + Konjunktiv I: er würde kommen',
    points: 10
  },
  // B2 Reading
  {
    id: 'b2-r-001',
    type: 'reading',
    level: 'b2',
    question: 'Lesen Sie:\n\n"Die Digitalisierung der Bildung birgt sowohl Chancen als auch Risiken. Während einerseits der Zugang zu Wissen demokratisiert wird, verschärft sich andererseits die digitale Kluft zwischen sozialen Schichten."\n\nWas wird demokratisiert?',
    options: ['Die Politik', 'Der Zugang zu Wissen', 'Die Wirtschaft', 'Das Gesundheitssystem'],
    correctAnswer: 'Der Zugang zu Wissen',
    explanation: '"der Zugang zu Wissen demokratisiert wird"',
    points: 15
  },
  {
    id: 'b2-r-002',
    type: 'reading',
    level: 'b2',
    question: 'Was ist die Hauptaussage?\n\n"Künstliche Intelligenz wird zwar bestimmte Arbeitsplätze ersetzen, jedoch gleichzeitig neue Berufsfelder schaffen. Entscheidend ist die Weiterbildung der Arbeitnehmer."\n\nDie Hauptaussage ist:',
    options: ['KI ist schlecht', 'KI ersetzt alle Jobs', 'Weiterbildung ist wichtig', 'Arbeit ist unnötig'],
    correctAnswer: 'Weiterbildung ist wichtig',
    explanation: '"Entscheidend ist die Weiterbildung der Arbeitnehmer"',
    points: 15
  },
  // B2 Grammar
  {
    id: 'b2-g-001',
    type: 'grammar',
    level: 'b2',
    question: '___ des Regens blieben wir zu Hause.',
    options: ['Wegen', 'Trotz', 'Während', 'Statt'],
    correctAnswer: 'Wegen',
    explanation: 'Wegen + Genitiv: wegen des Regens',
    points: 15
  },
  {
    id: 'b2-g-002',
    type: 'grammar',
    level: 'b2',
    question: 'Er verhielt sich so, ___ ob er nichts wüsste.',
    options: ['als', 'wie', 'ob', 'dass'],
    correctAnswer: 'als',
    explanation: 'als ob / als wenn: irrealer Vergleich',
    points: 15
  },
];

export const examLevels = [
  { id: 'a1', name: 'Goethe A1', color: 'green', icon: '🌱', description: 'Start Deutsch - Grundkenntnisse' },
  { id: 'a2', name: 'Goethe A2', color: 'blue', icon: '📘', description: 'Grundlegende Kenntnisse' },
  { id: 'b1', name: 'Goethe B1', color: 'purple', icon: '📚', description: 'Selbstständige Sprachverwendung' },
  { id: 'b2', name: 'Goethe B2', color: 'red', icon: '🎯', description: 'Fortgeschrittene Kenntnisse' },
];

export const examSections = [
  { id: 'reading', name: 'Leseverstehen', icon: '📖', description: 'Reading Comprehension' },
  { id: 'grammar', name: 'Grammatik', icon: '📝', description: 'Grammar & Structure' },
  { id: 'vocab', name: 'Wortschatz', icon: '💬', description: 'Vocabulary' },
];
