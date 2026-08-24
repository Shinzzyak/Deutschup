import { ExamQuestion } from './goethe-exam-questions';

export const extendedExamQuestions: ExamQuestion[] = [
  // ==========================================
  // A1 - BASIC (13 Questions)
  // ==========================================
  {
    id: 'a1-r-004',
    type: 'reading',
    level: 'a1',
    question: 'Lesen Sie den Text:\n\n"Hallo! Ich bin Marc. Ich bin 20 Jahre alt. Ich wohne in München. Ich habe einen Hund. Er heißt Bello."',
    options: ['Marc wohnt in Berlin', 'Marc ist 30 Jahre alt', 'Marc hat einen Hund', 'Marc hat eine Katze'],
    correctAnswer: 'Marc hat einen Hund',
    explanation: 'Im Text steht: "Ich habe einen Hund."',
    points: 5
  },
  {
    id: 'a1-r-005',
    type: 'reading',
    level: 'a1',
    question: 'Lesen Sie:\n\n"Supermarkt Müller: Montag bis Samstag 7:00 - 21:00. Sonntag: Geschlossen"',
    options: ['Der Supermarkt ist sonntags offen', 'Der Supermarkt schließt samstags um 21:00', 'Der Supermarkt öffnet montags um 8:00', 'Der Supermarkt ist immer offen'],
    correctAnswer: 'Der Supermarkt schließt samstags um 21:00',
    explanation: 'Montag bis Samstag 7:00 - 21:00 bedeutet, dass er am Samstag um 21:00 schließt.',
    points: 5
  },
  {
    id: 'a1-r-006',
    type: 'reading',
    level: 'a1',
    question: 'Lesen Sie die E-Mail:\n\n"Lieber Peter, kommst du morgen ins Kino? Der Film beginnt um 20 Uhr. Liebe Grüße, Sarah"',
    options: ['Sarah möchte morgen ins Kino gehen', 'Peter lädt Sarah ins Kino ein', 'Der Film beginnt um 20 Uhr morgen', 'Sarah und Peter gehen heute ins Kino'],
    correctAnswer: 'Sarah möchte morgen ins Kino gehen',
    explanation: 'Sarah fragt Peter: "kommst du morgen ins Kino?"',
    points: 5
  },
  {
    id: 'a1-r-007',
    type: 'reading',
    level: 'a1',
    question: 'Lesen Sie:\n\n"Ich heiße Maria. Meine Mutter ist Lehrerin und mein Vater ist Arzt."',
    options: ['Marias Vater ist Lehrer', 'Marias Mutter ist Ärztin', 'Marias Mutter ist Lehrerin', 'Maria ist Ärztin'],
    correctAnswer: 'Marias Mutter ist Lehrerin',
    explanation: 'Im Text steht: "Meine Mutter ist Lehrerin"',
    points: 5
  },
  {
    id: 'a1-g-004',
    type: 'grammar',
    level: 'a1',
    question: 'Wir ___ aus Indonesien.',
    options: ['bin', 'bist', 'ist', 'sind'],
    correctAnswer: 'sind',
    explanation: 'Wir + sind (1. Person Plural)',
    points: 5
  },
  {
    id: 'a1-g-005',
    type: 'grammar',
    level: 'a1',
    question: 'Hast du ___ Apfel?',
    options: ['ein', 'eine', 'einen', 'einer'],
    correctAnswer: 'einen',
    explanation: 'Apfel ist maskulin (der Apfel). Im Akkusativ wird "ein" zu "einen".',
    points: 5
  },
  {
    id: 'a1-g-006',
    type: 'grammar',
    level: 'a1',
    question: 'Das ist ___ Kind.',
    options: ['ein', 'eine', 'einen', 'einer'],
    correctAnswer: 'ein',
    explanation: 'Kind ist neutrum (das Kind) → ein Kind',
    points: 5
  },
  {
    id: 'a1-g-007',
    type: 'grammar',
    level: 'a1',
    question: 'Ich ___ kein Auto.',
    options: ['bin', 'habe', 'hat', 'hast'],
    correctAnswer: 'habe',
    explanation: 'Ich + habe (1. Person Singular)',
    points: 5
  },
  {
    id: 'a1-g-008',
    type: 'grammar',
    level: 'a1',
    question: '___ du Deutsch?',
    options: ['Sprech', 'Sprechen', 'Sprichst', 'Spricht'],
    correctAnswer: 'Sprichst',
    explanation: 'Du + sprichst (2. Person Singular)',
    points: 5
  },
  {
    id: 'a1-g-009',
    type: 'grammar',
    level: 'a1',
    question: 'Mein Bruder ___ in Jakarta.',
    options: ['wohne', 'wohnst', 'wohnt', 'wohnen'],
    correctAnswer: 'wohnt',
    explanation: 'Mein Bruder (er) + wohnt (3. Person Singular)',
    points: 5
  },
  {
    id: 'a1-v-004',
    type: 'vocab',
    level: 'a1',
    question: 'Was bedeutet "Die Schule"?',
    options: ['Rumah', 'Sekolah', 'Kantor', 'Pasar'],
    correctAnswer: 'Sekolah',
    explanation: 'Schule = sekolah',
    points: 5
  },
  {
    id: 'a1-v-005',
    type: 'vocab',
    level: 'a1',
    question: 'Was bedeutet "Das Wasser"?',
    options: ['Api', 'Tanah', 'Udara', 'Air'],
    correctAnswer: 'Air',
    explanation: 'Wasser = air',
    points: 5
  },
  {
    id: 'a1-v-006',
    type: 'vocab',
    level: 'a1',
    question: 'Wie heißt "Buku" auf Deutsch?',
    options: ['Das Haus', 'Das Buch', 'Der Tisch', 'Die Tasche'],
    correctAnswer: 'Das Buch',
    explanation: 'Buku = das Buch',
    points: 5
  },

  // ==========================================
  // A2 - ELEMENTARY (13 Questions)
  // ==========================================
  {
    id: 'a2-r-001',
    type: 'reading',
    level: 'a2',
    question: 'Lesen Sie die Anzeige:\n\n"Helle 2-Zimmer-Wohnung im Zentrum zu vermieten. 60 qm, Balkon, Küche, Bad. Miete: 500 Euro inkl. Nebenkosten. Frei ab 1. Juli."',
    options: ['Die Wohnung hat drei Zimmer', 'Die Wohnung ist außerhalb des Zentrums', 'Die Wohnung kostet 500 Euro im Monat', 'Die Wohnung ist ab sofort frei'],
    correctAnswer: 'Die Wohnung kostet 500 Euro im Monat',
    explanation: 'Im Text steht: "Miete: 500 Euro inkl. Nebenkosten."',
    points: 5
  },
  {
    id: 'a2-r-002',
    type: 'reading',
    level: 'a2',
    question: 'Lesen Sie den Text:\n\n"Letztes Jahr bin ich nach Deutschland geflogen. Ich habe dort drei Monate einen Sprachkurs besucht. Ich habe viele neue Freunde gefunden."',
    options: ['Die Person wohnt jetzt in Deutschland', 'Die Person war drei Monate in Deutschland', 'Die Person hat keinen Sprachkurs besucht', 'Die Person ist letztes Jahr in Indonesien geblieben'],
    correctAnswer: 'Die Person war drei Monate in Deutschland',
    explanation: 'Im Text steht: "Ich habe dort drei Monate einen Sprachkurs besucht."',
    points: 5
  },
  {
    id: 'a2-r-003',
    type: 'reading',
    level: 'a2',
    question: 'Lesen Sie den Zettel:\n\n"Lieber Max, ich bin beim Arzt. Ich komme heute etwas später nach Hause. Bitte koche schon mal das Abendessen. Liebe Grüße, Lisa"',
    options: ['Lisa ist zu Hause', 'Max muss zum Arzt gehen', 'Lisa kommt später nach Hause', 'Max kocht kein Abendessen'],
    correctAnswer: 'Lisa kommt später nach Hause',
    explanation: 'Lisa schreibt: "Ich komme heute etwas später nach Hause."',
    points: 5
  },
  {
    id: 'a2-r-004',
    type: 'reading',
    level: 'a2',
    question: 'Lesen Sie:\n\n"Der Zug nach Hamburg fährt heute leider von Gleis 4 statt Gleis 2 ab. Bitte beachten Sie die Durchsagen."',
    options: ['Der Zug fährt von Gleis 2', 'Der Zug fährt gar nicht', 'Der Zug fährt von Gleis 4', 'Der Zug fährt nach Berlin'],
    correctAnswer: 'Der Zug fährt von Gleis 4',
    explanation: 'Im Text steht: "fährt heute leider von Gleis 4 statt Gleis 2 ab."',
    points: 5
  },
  {
    id: 'a2-g-001',
    type: 'grammar',
    level: 'a2',
    question: 'Ich ___ gestern im Kino gewesen.',
    options: ['habe', 'war', 'bin', 'hatte'],
    correctAnswer: 'bin',
    explanation: 'Perfekt von "sein" ist "bin gewesen".',
    points: 5
  },
  {
    id: 'a2-g-002',
    type: 'grammar',
    level: 'a2',
    question: 'Ich gebe ___ Kind das Spielzeug.',
    options: ['das', 'dem', 'den', 'des'],
    correctAnswer: 'dem',
    explanation: 'Geben + jemandem (Dativ). Kind ist neutrum → dem Kind.',
    points: 5
  },
  {
    id: 'a2-g-003',
    type: 'grammar',
    level: 'a2',
    question: 'Er möchte ___ neuen Computer kaufen.',
    options: ['ein', 'eine', 'einen', 'einer'],
    correctAnswer: 'einen',
    explanation: 'Kaufen + etwas (Akkusativ). Computer ist maskulin → einen neuen Computer.',
    points: 5
  },
  {
    id: 'a2-g-004',
    type: 'grammar',
    level: 'a2',
    question: 'Ich ___ heute nicht kommen, weil ich krank bin.',
    options: ['kann', 'muss', 'will', 'darf'],
    correctAnswer: 'kann',
    explanation: "können (kemampuan/kemungkinan) - I cannot come because I am sick.",
    points: 5
  },
  {
    id: 'a2-g-005',
    type: 'grammar',
    level: 'a2',
    question: 'Ich freue ___ auf den Urlaub.',
    options: ['dir', 'mich', 'sich', 'uns'],
    correctAnswer: 'mich',
    explanation: 'Reflexivverb "sich freuen auf" (menantikan). Ich freue mich.',
    points: 5
  },
  {
    id: 'a2-g-006',
    type: 'grammar',
    level: 'a2',
    question: 'Dieses Auto ist ___ als das andere.',
    options: ['schnell', 'schneller', 'am schnellsten', 'schnellste'],
    correctAnswer: 'schneller',
    explanation: 'Komparativ (perbandingan) → schneller als.',
    points: 5
  },
  {
    id: 'a2-v-001',
    type: 'vocab',
    level: 'a2',
    question: 'Was bedeutet "Der Kopfschmerz"?',
    options: ['Sakit perut', 'Sakit kepala', 'Sakit gigi', 'Sakit tenggorokan'],
    correctAnswer: 'Sakit kepala',
    explanation: 'Kopf = kepala, Schmerz = sakit/nyeri.',
    points: 5
  },
  {
    id: 'a2-v-002',
    type: 'vocab',
    level: 'a2',
    question: 'Was bedeutet "Der Beruf"?',
    options: ['Hobi', 'Pekerjaan/Profesi', 'Sekolah', 'Alamat'],
    correctAnswer: 'Pekerjaan/Profesi',
    explanation: 'Beruf = pekerjaan atau profesi.',
    points: 5
  },
  {
    id: 'a2-v-003',
    type: 'vocab',
    level: 'a2',
    question: 'Wie heißt "Bandara" auf Deutsch?',
    options: ['Der Bahnhof', 'Der Flughafen', 'Die Haltestelle', 'Der Hafen'],
    correctAnswer: 'Der Flughafen',
    explanation: 'Bandara = der Flughafen.',
    points: 5
  },

  // ==========================================
  // B1 - INTERMEDIATE (12 Questions)
  // ==========================================
  {
    id: 'b1-r-001',
    type: 'reading',
    level: 'b1',
    question: 'Lesen Sie den Text:\n\n"Viele Menschen glauben, dass Homeoffice die Produktivität steigert. Studien zeigen jedoch, dass die soziale Isolation zu einer geringeren Motivation führen kann. Eine Mischung aus Büro und Homeoffice scheint die beste Lösung zu sein."',
    options: ['Homeoffice steigert immer die Produktivität', 'Soziale Isolation kann die Motivation senken', 'Büroarbeit ist immer besser als Homeoffice', 'Studien lehnen Homeoffice komplett ab'],
    correctAnswer: 'Soziale Isolation kann die Motivation senken',
    explanation: 'Im Text steht: "...dass die soziale Isolation zu einer geringeren Motivation führen kann."',
    points: 5
  },
  {
    id: 'b1-r-002',
    type: 'reading',
    level: 'b1',
    question: 'Lesen Sie den Brief:\n\n"Sehr geehrte Damen und Herren, ich schreibe Ihnen, weil ich mit dem gelieferten Produkt unzufrieden bin. Der Bildschirm ist beschädigt. Ich bitte um einen Ersatz oder eine Rückerstattung."',
    options: ['Der Kunde möchte das Produkt behalten', 'Der Kunde ist glücklich mit der Lieferung', 'Das Produkt ist defekt', 'Der Kunde möchte keine Rückerstattung'],
    correctAnswer: 'Das Produkt ist defekt',
    explanation: 'Der Kunde schreibt: "Der Bildschirm ist beschädigt."',
    points: 5
  },
  {
    id: 'b1-r-003',
    type: 'reading',
    level: 'b1',
    question: 'Lesen Sie:\n\n"Die Energiewende in Deutschland zielt darauf ab, fossile Brennstoffe durch erneuerbare Energien wie Wind und Sonne zu ersetzen. Dies ist ein wichtiger Schritt zum Klimaschutz."',
    options: ['Deutschland nutzt nur noch Kohle', 'Erneuerbare Energien schaden dem Klima', 'Die Energiewende soll den Klimaschutz fördern', 'Windenergie ist nicht Teil der Energiewende'],
    correctAnswer: 'Die Energiewende soll den Klimaschutz fördern',
    explanation: 'Im Text steht: "Dies ist ein wichtiger Schritt zum Klimaschutz."',
    points: 5
  },
  {
    id: 'b1-r-004',
    type: 'reading',
    level: 'b1',
    question: 'Lesen Sie:\n\n"In einer modernen Gesellschaft ist lebenslanges Lernen essenziell, da sich technologische Entwicklungen rasant beschleunigen. Wer nicht kontinuierlich lernt, verliert den Anschluss an den Arbeitsmarkt."',
    options: ['Technologie entwickelt sich langsam', 'Lebenslanges Lernen ist unnötig', 'Kontinuierliches Lernen hilft beim Erhalt des Arbeitsplatzes', 'Nur junge Menschen müssen lernen'],
    correctAnswer: 'Kontinuierliches Lernen hilft beim Erhalt des Arbeitsplatzes',
    explanation: 'Der Text warnt: "Wer nicht kontinuierlich lernt, verliert den Anschluss an den Arbeitsmarkt."',
    points: 5
  },
  {
    id: 'b1-g-001',
    type: 'grammar',
    level: 'b1',
    question: 'Wenn ich mehr Zeit ___, ___ ich eine Weltreise machen.',
    options: ['habe / werde', 'hätte / würde', 'hatte / würde', 'hätte / werde'],
    correctAnswer: 'hätte / würde',
    explanation: 'Konjunktiv II (Irrealis) für Wünsche/Hypothesen: hätte (haben) + würde + Infinitiv.',
    points: 5
  },
  {
    id: 'b1-g-002',
    type: 'grammar',
    level: 'b1',
    question: 'Das ist der Mann, ___ ich gestern im Park gesehen habe.',
    options: ['der', 'den', 'dem', 'dessen'],
    correctAnswer: 'den',
    explanation: 'Relativsatz im Akkusativ: Ich habe *den Mann* (maskulin, Akkusativ) gesehen.',
    points: 5
  },
  {
    id: 'b1-g-003',
    type: 'grammar',
    level: 'b1',
    question: 'Das Haus ___ im Jahr 1920 gebaut.',
    options: ['wurde', 'ist', 'war', 'worden'],
    correctAnswer: 'wurde',
    explanation: 'Passiv Präteritum: werden (Präteritum: wurde) + Partizip II.',
    points: 5
  },
  {
    id: 'b1-g-004',
    type: 'grammar',
    level: 'b1',
    question: 'Ich gehe heute nicht spazieren, ___ es stark regnet.',
    options: ['weil', 'obwohl', 'dass', 'damit'],
    correctAnswer: 'weil',
    explanation: 'Kausalsatz (sebab): "weil" (karena) leitet einen Nebensatz ein.',
    points: 5
  },
  {
    id: 'b1-g-005',
    type: 'grammar',
    level: 'b1',
    question: 'Das ist das Auto ___ Vaters.',
    options: ['des', 'der', 'dem', 'den'],
    correctAnswer: 'des',
    explanation: 'Genitiv (kepemilikan): des Vaters (maskulin Genitiv).',
    points: 5
  },
  {
    id: 'b1-g-006',
    type: 'grammar',
    level: 'b1',
    question: 'Trotz ___ schlechten Wetters gingen wir wandern.',
    options: ['das', 'dem', 'des', 'den'],
    correctAnswer: 'des',
    explanation: 'Präposition "trotz" verlangt den Genitiv: des schlechten Wetters.',
    points: 5
  },
  {
    id: 'b1-v-001',
    type: 'vocab',
    level: 'b1',
    question: 'Was bedeutet "Die Herausforderung"?',
    options: ['Kesempatan', 'Tantangan', 'Keberhasilan', 'Kegagalan'],
    correctAnswer: 'Tantangan',
    explanation: 'Herausforderung = tantangan.',
    points: 5
  },
  {
    id: 'b1-v-002',
    type: 'vocab',
    level: 'b1',
    question: 'Was bedeutet "Nachhaltigkeit"?',
    options: ['Keadilan', 'Keberlanjutan (Sustainability)', 'Kemajuan', 'Kestabilan'],
    correctAnswer: 'Keberlanjutan (Sustainability)',
    explanation: 'Nachhaltigkeit = keberlanjutan / sustainability.',
    points: 5
  },

  // ==========================================
  // B2 - UPPER-INTERMEDIATE (12 Questions)
  // ==========================================
  {
    id: 'b2-r-001',
    type: 'reading',
    level: 'b2',
    question: 'Lesen Sie den Text:\n\n"Die kognitive Dissonanz tritt auf, wenn ein Individuum zwei oder mehr widersprüchliche Kognitionen gleichzeitig hält. Um dieses unangenehme Gefühl zu reduzieren, neigen Menschen dazu, ihre Überzeugungen an die Realität anzupassen oder die widersprüchlichen Informationen zu ignorieren."',
    options: ['Kognitive Dissonanz ist ein angenehmes Gefühl', 'Menschen akzeptieren Widersprüche immer ohne Anpassung', 'Das Gehirn versucht, Widersprüche zu auflösen', 'Kognitive Dissonanz führt immer zu einer Änderung der Realität'],
    correctAnswer: 'Das Gehirn versucht, Widersprüche zu auflösen',
    explanation: 'Der Text beschreibt, dass Menschen versuchen, das unangenehme Gefühl zu reduzieren, indem sie Überzeugungen anpassen oder Informationen ignorieren.',
    points: 5
  },
  {
    id: 'b2-r-002',
    type: 'reading',
    level: 'b2',
    question: 'Lesen Sie das Abstract:\n\n"Die vorliegende Studie untersucht den Einfluss von Künstlicher Intelligenz auf den akademischen Diskurs. Es wird argumentiert, dass KI zwar die Effizienz der Literaturrecherche steigert, jedoch das kritische Denken gefährdet, sofern keine didaktischen Gegenmaßnahmen ergriffen werden."',
    options: ['KI hat keinen Einfluss auf die Literaturrecherche', 'KI steigert das kritische Denken automatisch', 'Es besteht ein Risiko für das kritische Denken durch KI', 'Didaktische Maßnahmen sind unnötig'],
    correctAnswer: 'Es besteht ein Risiko für das kritische Denken durch KI',
    explanation: 'Im Text heißt es, dass KI "das kritische Denken gefährdet".',
    points: 5
  },
  {
    id: 'b2-r-003',
    type: 'reading',
    level: 'b2',
    question: 'Lesen Sie die Kritik:\n\n"Der Roman besticht durch eine nuancierte Charakterzeichnung und eine meisterhafte Beherrschung der Sprache. Dennoch wirkt das Ende überhastet und lässt wesentliche Fragen der Handlung unbeantwortet."',
    options: ['Die Sprache des Romans ist schwach', 'Die Charaktere sind oberflächlich', 'Das Ende wird als unbefriedigend empfunden', 'Der Roman ist in jeder Hinsicht perfekt'],
    correctAnswer: 'Das Ende wird als unbefriedigend empfunden',
    explanation: 'Der Kritiker schreibt: "dennoch wirkt das Ende überhastet und lässt wesentliche Fragen... unbeantwortet."',
    points: 5
  },
  {
    id: 'b2-r-004',
    type: 'reading',
    level: 'b2',
    question: 'Lesen Sie:\n\n"Die Implementierung einer steuerlichen Anreizstruktur für Elektrofahrzeuge hat kurzfristig zu einem Anstieg der Verkaufszahlen geführt. Langfristig ist jedoch der Ausbau der Ladeinfrastruktur entscheidender für die Marktdurchdringung als bloße Subventionen."',
    options: ['Subventionen sind der wichtigste langfristige Faktor', 'Ladeinfrastruktur ist wichtiger als Subventionen für den langfristigen Erfolg', 'Elektroautos werden langfristig nicht verkauft', 'Die Verkaufszahlen sind kurzfristig gesunken'],
    correctAnswer: 'Ladeinfrastruktur ist wichtiger als Subventionen für den langfristigen Erfolg',
    explanation: 'Im Text steht: "Langfristig ist jedoch der Ausbau der Ladeinfrastruktur entscheidender... als bloße Subventionen."',
    points: 5
  },
  {
    id: 'b2-g-001',
    type: 'grammar',
    level: 'b2',
    question: 'Das Projekt ___ bis nächsten Monat abgeschlossen werden müssen.',
    options: ['wurde', 'wird', 'ist', 'hat'],
    correctAnswer: 'wird',
    explanation: 'Passiv Futur I: werden + Partizip II + werden (Modalverb Passiv).',
    points: 5
  },
  {
    id: 'b2-g-002',
    type: 'grammar',
    level: 'b2',
    question: 'Die ___ der Produktivität führte zu einer Gehaltserhöhung.',
    options: ['Steigerung', 'steigern', 'gesteigert', 'steigernd'],
    correctAnswer: 'Steigerung',
    explanation: 'Nominalisierung: Das Verb "steigern" wird zum Nomen "die Steigerung".',
    points: 5
  },
  {
    id: 'b2-g-003',
    type: 'grammar',
    level: 'b2',
    question: 'Das ___ Kind weinte laut.',
    options: ['singende', 'gesungen', 'Singen', 'gesungene'],
    correctAnswer: 'singende',
    explanation: 'Partizip I als Attribut: beschreibt eine gleichzeitige Handlung (the singing child).',
    points: 5
  },
  {
    id: 'b2-g-004',
    type: 'grammar',
    level: 'b2',
    question: 'Der Minister sagte, er ___ die Steuern senken.',
    options: ['würde', 'werde', 'will', 'hat'],
    correctAnswer: 'werde',
    explanation: 'Konjunktiv I für indirekte Rede (berichtet, was jemand gesagt hat).',
    points: 5
  },
  {
    id: 'b2-g-005',
    type: 'grammar',
    level: 'b2',
    question: 'Wir müssen uns ___ die neuen Richtlinien halten.',
    options: ['an', 'auf', 'zu', 'nach'],
    correctAnswer: 'an',
    explanation: 'Feste Verb-Präposition-Verbindung: "sich halten an + Akkusativ" (mematuhi).',
    points: 5
  },
  {
    id: 'b2-g-006',
    type: 'grammar',
    level: 'b2',
    question: '___ mehr man lernt, ___ besser werden die Noten.',
    options: ['Je / desto', 'Je / so', 'Wenn / dann', 'Als / so'],
    correctAnswer: 'Je / desto',
    explanation: 'Proportionaler Vergleich: je + Komparativ ..., desto/umso + Komparativ ...',
    points: 5
  },
  {
    id: 'b2-v-001',
    type: 'vocab',
    level: 'b2',
    question: 'Was ist ein Synonym für "fundamental"?',
    options: ['oberflächlich', 'grundlegend', 'unwichtig', 'temporär'],
    correctAnswer: 'grundlegend',
    explanation: 'Fundamental und grundlegend bedeuten beide "das Basis-Fundament betreffend".',
    points: 5
  },
  {
    id: 'b2-v-002',
    type: 'vocab',
    level: 'b2',
    question: 'Was bedeutet "Die Verhandlung"?',
    options: ['Perjanjian', 'Negosiasi', 'Keputusan', 'Kritik'],
    correctAnswer: 'Negosiasi',
    explanation: 'Verhandlung = negosiasi.',
    points: 5
  }
];
