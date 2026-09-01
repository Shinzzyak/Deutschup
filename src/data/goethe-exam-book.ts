import { ExamQuestion } from './goethe-exam-questions';

// Book-sourced exam questions (Goethe Modellsatz OCR, 2026-09-01):
// A2_Modellsatz_Erwachsene (TV-Koch Lesen Teil 1, Kaufhaus Teil 2),
// sd_1_modellsatz + Fit fürs Goethe A1 (Anzeigen/Kurztexte).
export const bookExamQuestions: ExamQuestion[] = [
  {
    id: 'a2-r-100',
    type: 'reading',
    level: 'a2',
    question: 'Lesen Sie den Text:\n\n"Bei Stefan Berger gibt es Gerichte, von denen man vorher noch nie gehört hat. Er hat dauernd neue Ideen. Den Gästen gefällt das. Man muss unbedingt vorher anrufen und einen der wenigen Tische bestellen, wenn man in seinem Restaurant „Bremer Lokal" essen möchte."\n\nBei Stefan Berger können Gäste ...',
    options: [
      'bekannte Gerichte essen.',
      'interessante Getränke bestellen.',
      'neue Speisen probieren.',
    ],
    correctAnswer: 'neue Speisen probieren.',
    explanation: '„Gerichte, von denen man vorher noch nie gehört hat" = neue Speisen.',
    points: 5
  },
  {
    id: 'a2-r-101',
    type: 'reading',
    level: 'a2',
    question: 'Die Gäste im „Bremer Lokal" ...',
    options: [
      'finden immer einen Tisch.',
      'müssen anrufen und Essen bestellen.',
      'sollen Plätze reservieren.',
    ],
    correctAnswer: 'sollen Plätze reservieren.',
    explanation: '„Man muss unbedingt vorher anrufen und einen der wenigen Tische bestellen" = reservieren.',
    points: 5
  },
  {
    id: 'a2-r-102',
    type: 'reading',
    level: 'a2',
    question: 'Stefan Berger möchte kein zweites Lokal aufmachen, weil ...',
    options: [
      'er zu wenig Geld hat.',
      'er seinen Stil lieber so behält.',
      'das erste Lokal zu klein ist.',
    ],
    correctAnswer: 'er seinen Stil lieber so behält.',
    explanation: '„Ich mag es einfach, wie wir hier arbeiten" — bewusste Entscheidung gegen Wachstum.',
    points: 5
  },
  {
    id: 'a2-r-103',
    type: 'reading',
    level: 'a2',
    question: 'Sie suchen ein Sofa. In welchen Stock gehen Sie?\n\nKaufhaus Alexa: 4. Stock: Bücher, Geschenke, Spielsachen | 3. Stock: Koffer, Brieftaschen, Café | 2. Stock: Handys, Computer, Drucker | 1. Stock: Möbel, Lampen, Teppiche | EG: Kosmetik, Schmuck | UG: Schuhreparatur',
    options: [
      'in den 4. Stock.',
      'in den 1. Stock.',
      'in den 3. Stock.',
    ],
    correctAnswer: 'in den 1. Stock.',
    explanation: 'Möbel = 1. Stock.',
    points: 5
  },
  {
    id: 'a2-r-104',
    type: 'reading',
    level: 'a2',
    question: 'Sie möchten einer Freundin Rosen schenken. In welchen Stock gehen Sie?',
    options: [
      'in den 4. Stock (Geschenke).',
      'in das UG (Schuhreparatur).',
      'in den 2. Stock (Computer).',
    ],
    correctAnswer: 'in den 4. Stock (Geschenke).',
    explanation: 'Geschenke = 4. Stock.',
    points: 5
  },
  {
    id: 'a2-r-105',
    type: 'reading',
    level: 'a2',
    question: 'Sie wollen Ihre Schuhe reparieren lassen. In welchen Stock gehen Sie?',
    options: [
      'in das UG.',
      'in das EG.',
      'in den 3. Stock.',
    ],
    correctAnswer: 'in das UG.',
    explanation: 'Schuhreparatur = UG (Untergeschoss).',
    points: 5
  },
  {
    id: 'a1-r-100',
    type: 'reading',
    level: 'a1',
    question: 'Lesen Sie die Anzeige:\n\n"Zimmer frei! Schönes Zimmer mit Balkon, 12 m², 380 Euro im Monat, Küche und Bad zur gemeinsamen Nutzung. Ab 1. Oktober. Telefon 030/554433"\n\nWas kostet das Zimmer pro Monat?',
    options: [
      '380 Euro',
      '12 Euro',
      '1 Euro',
      '544 Euro',
    ],
    correctAnswer: '380 Euro',
    explanation: '„380 Euro im Monat" steht in der Anzeige.',
    points: 5
  },
  {
    id: 'a1-r-101',
    type: 'reading',
    level: 'a1',
    question: 'Lesen Sie:\n\n"Das Schwimmbad ist Montag geschlossen. Dienstag bis Freitag: 9-20 Uhr. Wochenende: 8-18 Uhr."\n\nWann ist das Schwimmbad offen?',
    options: [
      'Am Montag',
      'Dienstag bis Freitag von 9 bis 20 Uhr',
      'Nur am Wochenende',
      'Immer bis 22 Uhr',
    ],
    correctAnswer: 'Dienstag bis Freitag von 9 bis 20 Uhr',
    explanation: 'Montag geschlossen; Di-Fr 9-20.',
    points: 5
  },
  {
    id: 'a1-r-102',
    type: 'reading',
    level: 'a1',
    question: 'Was bedeutet „Zimmer frei"?',
    options: [
      'Das Zimmer ist kostenlos.',
      'Man kann hier ein Zimmer mieten.',
      'Das Zimmer ist schon weg.',
      'Man darf nicht hereinkommen.',
    ],
    correctAnswer: 'Man kann hier ein Zimmer mieten.',
    explanation: '„Zimmer frei" = ein Zimmer ist zu mieten (Wohnungsanzeige).',
    points: 5
  },
  {
    id: 'a1-r-103',
    type: 'reading',
    level: 'a1',
    question: 'Lesen Sie die Nachricht:\n\n"Lieber Tom, das Konzert beginnt leider erst um 20.30 Uhr, nicht um 20 Uhr. Ich warte vor dem Eingang. Bis später! Anna"\n\nWann beginnt das Konzert?',
    options: [
      'Um 20.00 Uhr',
      'Um 20.30 Uhr',
      'Um 19.30 Uhr',
      'Um 21.00 Uhr',
    ],
    correctAnswer: 'Um 20.30 Uhr',
    explanation: '„beginnt leider erst um 20.30 Uhr".',
    points: 5
  },
  {
    id: 'a1-r-104',
    type: 'reading',
    level: 'a1',
    question: 'Wo sieht man diesen Hinweis: "Nicht rauchen!"',
    options: [
      'Auf dem Fußballplatz',
      'Im Krankenhaus',
      'Auf der Autobahn',
      'Im Garten',
    ],
    correctAnswer: 'Im Krankenhaus',
    explanation: 'Rauchverbot gilt z. B. im Krankenhaus.',
    points: 5
  },
];
