export interface VerbConjugation {
  infinitive: string;
  translation: string;
  type: 'regular' | 'irregular';
  present: {
    ich: string;
    du: string;
    'er/sie/es': string;
    wir: string;
    ihr: string;
    sie: string;
  };
  perfekt: string;
  prateritum: {
    ich: string;
    'er/sie/es': string;
  };
}

export const verbDatabase: VerbConjugation[] = [
  // ========== IRREGULAR (STRONG) VERBS ==========
  {
    infinitive: 'sein',
    translation: 'adalah',
    type: 'irregular',
    present: {
      ich: 'bin',
      du: 'bist',
      'er/sie/es': 'ist',
      wir: 'sind',
      ihr: 'seid',
      sie: 'sind',
    },
    perfekt: 'ist gewesen',
    prateritum: {
      ich: 'war',
      'er/sie/es': 'war',
    },
  },
  {
    infinitive: 'haben',
    translation: 'memiliki',
    type: 'irregular',
    present: {
      ich: 'habe',
      du: 'hast',
      'er/sie/es': 'hat',
      wir: 'haben',
      ihr: 'habt',
      sie: 'haben',
    },
    perfekt: 'hat gehabt',
    prateritum: {
      ich: 'hatte',
      'er/sie/es': 'hatte',
    },
  },
  {
    infinitive: 'gehen',
    translation: 'pergi',
    type: 'irregular',
    present: {
      ich: 'gehe',
      du: 'gehst',
      'er/sie/es': 'geht',
      wir: 'gehen',
      ihr: 'geht',
      sie: 'gehen',
    },
    perfekt: 'ist gegangen',
    prateritum: {
      ich: 'ging',
      'er/sie/es': 'ging',
    },
  },
  {
    infinitive: 'fahren',
    translation: 'berkendara',
    type: 'irregular',
    present: {
      ich: 'fahre',
      du: 'fährst',
      'er/sie/es': 'fährt',
      wir: 'fahren',
      ihr: 'fahrt',
      sie: 'fahren',
    },
    perfekt: 'ist gefahren',
    prateritum: {
      ich: 'fuhr',
      'er/sie/es': 'fuhr',
    },
  },
  {
    infinitive: 'geben',
    translation: 'memberi',
    type: 'irregular',
    present: {
      ich: 'gebe',
      du: 'gibst',
      'er/sie/es': 'gibt',
      wir: 'geben',
      ihr: 'gebt',
      sie: 'geben',
    },
    perfekt: 'hat gegeben',
    prateritum: {
      ich: 'gab',
      'er/sie/es': 'gab',
    },
  },
  {
    infinitive: 'nehmen',
    translation: 'mengambil',
    type: 'irregular',
    present: {
      ich: 'nehme',
      du: 'nimmst',
      'er/sie/es': 'nimmt',
      wir: 'nehmen',
      ihr: 'nehmt',
      sie: 'nehmen',
    },
    perfekt: 'hat genommen',
    prateritum: {
      ich: 'nahm',
      'er/sie/es': 'nahm',
    },
  },
  {
    infinitive: 'sehen',
    translation: 'melihat',
    type: 'irregular',
    present: {
      ich: 'sehe',
      du: 'siehst',
      'er/sie/es': 'sieht',
      wir: 'sehen',
      ihr: 'seht',
      sie: 'sehen',
    },
    perfekt: 'hat gesehen',
    prateritum: {
      ich: 'sah',
      'er/sie/es': 'sah',
    },
  },
  {
    infinitive: 'wissen',
    translation: 'mengetahui',
    type: 'irregular',
    present: {
      ich: 'weiß',
      du: 'weißt',
      'er/sie/es': 'weiß',
      wir: 'wissen',
      ihr: 'wisst',
      sie: 'wissen',
    },
    perfekt: 'hat gewusst',
    prateritum: {
      ich: 'wusste',
      'er/sie/es': 'wusste',
    },
  },
  {
    infinitive: 'kennen',
    translation: 'mengenal',
    type: 'irregular',
    present: {
      ich: 'kenne',
      du: 'kennst',
      'er/sie/es': 'kennt',
      wir: 'kennen',
      ihr: 'kennt',
      sie: 'kennen',
    },
    perfekt: 'hat gekannt',
    prateritum: {
      ich: 'kannte',
      'er/sie/es': 'kannte',
    },
  },
  {
    infinitive: 'denken',
    translation: 'berpikir',
    type: 'irregular',
    present: {
      ich: 'denke',
      du: 'denkst',
      'er/sie/es': 'denkt',
      wir: 'denken',
      ihr: 'denkt',
      sie: 'denken',
    },
    perfekt: 'hat gedacht',
    prateritum: {
      ich: 'dachte',
      'er/sie/es': 'dachte',
    },
  },
  {
    infinitive: 'lesen',
    translation: 'membaca',
    type: 'irregular',
    present: {
      ich: 'lese',
      du: 'liest',
      'er/sie/es': 'liest',
      wir: 'lesen',
      ihr: 'lest',
      sie: 'lesen',
    },
    perfekt: 'hat gelesen',
    prateritum: {
      ich: 'las',
      'er/sie/es': 'las',
    },
  },
  {
    infinitive: 'schreiben',
    translation: 'menulis',
    type: 'irregular',
    present: {
      ich: 'schreibe',
      du: 'schreibst',
      'er/sie/es': 'schreibt',
      wir: 'schreiben',
      ihr: 'schreibt',
      sie: 'schreiben',
    },
    perfekt: 'hat geschrieben',
    prateritum: {
      ich: 'schrieb',
      'er/sie/es': 'schrieb',
    },
  },
  {
    infinitive: 'essen',
    translation: 'makan',
    type: 'irregular',
    present: {
      ich: 'esse',
      du: 'isst',
      'er/sie/es': 'isst',
      wir: 'essen',
      ihr: 'esst',
      sie: 'essen',
    },
    perfekt: 'hat gegessen',
    prateritum: {
      ich: 'aß',
      'er/sie/es': 'aß',
    },
  },
  {
    infinitive: 'trinken',
    translation: 'minum',
    type: 'irregular',
    present: {
      ich: 'trinke',
      du: 'trinkst',
      'er/sie/es': 'trinkt',
      wir: 'trinken',
      ihr: 'trinkt',
      sie: 'trinken',
    },
    perfekt: 'hat getrunken',
    prateritum: {
      ich: 'trank',
      'er/sie/es': 'trank',
    },
  },
  {
    infinitive: 'helfen',
    translation: 'membantu',
    type: 'irregular',
    present: {
      ich: 'helfe',
      du: 'hilfst',
      'er/sie/es': 'hilft',
      wir: 'helfen',
      ihr: 'helft',
      sie: 'helfen',
    },
    perfekt: 'hat geholfen',
    prateritum: {
      ich: 'half',
      'er/sie/es': 'half',
    },
  },

  // ========== REGULAR (WEAK) VERBS ==========
  {
    infinitive: 'machen',
    translation: 'melakukan',
    type: 'regular',
    present: {
      ich: 'mache',
      du: 'machst',
      'er/sie/es': 'macht',
      wir: 'machen',
      ihr: 'macht',
      sie: 'machen',
    },
    perfekt: 'hat gemacht',
    prateritum: {
      ich: 'machte',
      'er/sie/es': 'machte',
    },
  },
  {
    infinitive: 'spielen',
    translation: 'bermain',
    type: 'regular',
    present: {
      ich: 'spiele',
      du: 'spielst',
      'er/sie/es': 'spielt',
      wir: 'spielen',
      ihr: 'spielt',
      sie: 'spielen',
    },
    perfekt: 'hat gespielt',
    prateritum: {
      ich: 'spielte',
      'er/sie/es': 'spielte',
    },
  },
  {
    infinitive: 'lernen',
    translation: 'belajar',
    type: 'regular',
    present: {
      ich: 'lerne',
      du: 'lernst',
      'er/sie/es': 'lernt',
      wir: 'lernen',
      ihr: 'lernt',
      sie: 'lernen',
    },
    perfekt: 'hat gelernt',
    prateritum: {
      ich: 'lernte',
      'er/sie/es': 'lernte',
    },
  },
  {
    infinitive: 'wohnen',
    translation: 'tinggal',
    type: 'regular',
    present: {
      ich: 'wohne',
      du: 'wohnst',
      'er/sie/es': 'wohnt',
      wir: 'wohnen',
      ihr: 'wohnt',
      sie: 'wohnen',
    },
    perfekt: 'hat gewohnt',
    prateritum: {
      ich: 'wohnte',
      'er/sie/es': 'wohnte',
    },
  },
  {
    infinitive: 'arbeiten',
    translation: 'bekerja',
    type: 'regular',
    present: {
      ich: 'arbeite',
      du: 'arbeitest',
      'er/sie/es': 'arbeitet',
      wir: 'arbeiten',
      ihr: 'arbeitet',
      sie: 'arbeiten',
    },
    perfekt: 'hat gearbeitet',
    prateritum: {
      ich: 'arbeitete',
      'er/sie/es': 'arbeitete',
    },
  },
  {
    infinitive: 'kaufen',
    translation: 'membeli',
    type: 'regular',
    present: {
      ich: 'kaufe',
      du: 'kaufst',
      'er/sie/es': 'kauft',
      wir: 'kaufen',
      ihr: 'kauft',
      sie: 'kaufen',
    },
    perfekt: 'hat gekauft',
    prateritum: {
      ich: 'kaufte',
      'er/sie/es': 'kaufte',
    },
  },
  {
    infinitive: 'fragen',
    translation: 'menanyakan',
    type: 'regular',
    present: {
      ich: 'frage',
      du: 'fragst',
      'er/sie/es': 'fragt',
      wir: 'fragen',
      ihr: 'fragt',
      sie: 'fragen',
    },
    perfekt: 'hat gefragt',
    prateritum: {
      ich: 'fragte',
      'er/sie/es': 'fragte',
    },
  },
  {
    infinitive: 'brauchen',
    translation: 'membutuhkan',
    type: 'regular',
    present: {
      ich: 'brauche',
      du: 'brauchst',
      'er/sie/es': 'braucht',
      wir: 'brauchen',
      ihr: 'braucht',
      sie: 'brauchen',
    },
    perfekt: 'hat gebraucht',
    prateritum: {
      ich: 'brauchte',
      'er/sie/es': 'brauchte',
    },
  },
  {
    infinitive: 'sagen',
    translation: 'mengatakan',
    type: 'regular',
    present: {
      ich: 'sage',
      du: 'sagst',
      'er/sie/es': 'sagt',
      wir: 'sagen',
      ihr: 'sagt',
      sie: 'sagen',
    },
    perfekt: 'hat gesagt',
    prateritum: {
      ich: 'sagte',
      'er/sie/es': 'sagte',
    },
  },
  {
    infinitive: 'antworten',
    translation: 'menjawab',
    type: 'regular',
    present: {
      ich: 'antworte',
      du: 'antwortest',
      'er/sie/es': 'antwortet',
      wir: 'antworten',
      ihr: 'antwortet',
      sie: 'antworten',
    },
    perfekt: 'hat geantwortet',
    prateritum: {
      ich: 'antwortete',
      'er/sie/es': 'antwortete',
    },
  },
  {
    infinitive: 'kochen',
    translation: 'memasak',
    type: 'regular',
    present: {
      ich: 'koche',
      du: 'kochst',
      'er/sie/es': 'kocht',
      wir: 'kochen',
      ihr: 'kocht',
      sie: 'kochen',
    },
    perfekt: 'hat gekocht',
    prateritum: {
      ich: 'kochte',
      'er/sie/es': 'kochte',
    },
  },
  {
    infinitive: 'lieben',
    translation: 'mencintai',
    type: 'regular',
    present: {
      ich: 'liebe',
      du: 'liebst',
      'er/sie/es': 'liebt',
      wir: 'lieben',
      ihr: 'liebt',
      sie: 'lieben',
    },
    perfekt: 'hat geliebt',
    prateritum: {
      ich: 'liebte',
      'er/sie/es': 'liebte',
    },
  },
  {
    infinitive: 'glauben',
    translation: 'percaya',
    type: 'regular',
    present: {
      ich: 'glaube',
      du: 'glaubst',
      'er/sie/es': 'glaubt',
      wir: 'glauben',
      ihr: 'glaubt',
      sie: 'glauben',
    },
    perfekt: 'hat geglaubt',
    prateritum: {
      ich: 'glaubte',
      'er/sie/es': 'glaubte',
    },
  },
  {
    infinitive: 'rufen',
    translation: 'memanggil',
    type: 'irregular',
    present: {
      ich: 'rufe',
      du: 'rufst',
      'er/sie/es': 'ruft',
      wir: 'rufen',
      ihr: 'ruft',
      sie: 'rufen',
    },
    perfekt: 'hat gerufen',
    prateritum: {
      ich: 'rief',
      'er/sie/es': 'rief',
    },
  },
  {
    infinitive: 'versuchen',
    translation: 'mencoba',
    type: 'regular',
    present: {
      ich: 'versuche',
      du: 'versuchst',
      'er/sie/es': 'versucht',
      wir: 'versuchen',
      ihr: 'versucht',
      sie: 'versuchen',
    },
    perfekt: 'hat versucht',
    prateritum: {
      ich: 'versuchte',
      'er/sie/es': 'versuchte',
    },
  },
];
