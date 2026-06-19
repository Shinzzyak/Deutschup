// A1 L14: Kasus Nominativ vs Akkusativ
export const a1Lesson14 = {
  "id": "a1-14",
  "level": "A1",
  "title": "Kasus Nominativ vs Akkusativ",
  "sections": [
    {
      "id": "a1-14-intro",
      "title": "Intro",
      "type": "intro",
      "content": {
        "title": "Kasus Nominativ vs Akkusativ",
        "subtitle": "Memahami subjek dan objek langsung dalam kalimat Jerman",
        "description": "Dalam bahasa Jerman, kata benda berubah bentuk tergantung perannya dalam kalimat. Nominatif = subjek (siapa yang melakukan). Akkusatif = objek langsung (apa/mana yang dikenai)."
      }
    },
    {
      "id": "a1-14-vocab",
      "title": "Vokabular",
      "type": "vocab",
      "content": {
        "vocabulary": [
          { "word": "der Mann", "translation": "pria", "example": "Der Mann liest ein Buch.", "article": "der" },
          { "word": "die Frau", "translation": "wanita", "example": "Die Frau trinkt Kaffee.", "article": "die" },
          { "word": "das Kind", "translation": "anak", "example": "Das Kind spielt im Garten.", "article": "das" },
          { "word": "das Buch", "translation": "buku", "example": "Ich lese ein Buch.", "article": "das" },
          { "word": "der Kaffee", "translation": "kopi", "example": "Er trinkt den Kaffee.", "article": "der" },
          { "word": "die Zeitung", "translation": "koran", "example": "Sie liest die Zeitung.", "article": "die" },
          { "word": "das Auto", "translation": "mobil", "example": "Er fährt ein Auto.", "article": "das" },
          { "word": "der Hund", "translation": "anjing", "example": "Ich sehe den Hund.", "article": "der" },
          { "word": "die Katze", "translation": "kucing", "example": "Sie streichelt die Katze.", "article": "die" },
          { "word": "das Wasser", "translation": "air", "example": "Er trinkt das Wasser.", "article": "das" }
        ]
      }
    },
    {
      "id": "a1-14-grammar",
      "title": "Grammatik",
      "type": "grammar",
      "content": {
        "title": "Nominativ vs Akkusativ",
        "rules": [
          "Nominatif = subjek (siapa yang melakukan aksi)",
          "Akkusatif = objek langsung (apa yang dikenai aksi)",
          "Artikel berubah di Akkusatif:",
          "  der → den, die → die, das → das, die (pl) → die",
          "Hanya maskulin yang berubah: der → den",
          "Verba yang membutuhkan Akkusativ: haben, brauchen, lesen, sehen, kaufen, trinken, essen, spielen"
        ],
        "examples": [
          "Der Mann (Nominativ) liest das Buch (Akkusativ).",
          "Die Frau (Nom) trinkt den Kaffee (Akk).",
          "Das Kind (Nom) spielt mit dem Hund (Dat) — tidak Akkusatif karena 'mit'.",
          "Ich (Nom) sehe die Katze (Akk).",
          "Er (Nom) kauft ein Auto (Akk)."
        ],
        "tables": [
          {
            "title": "Deklinasi Artikel",
            "headers": ["Kasus", "Maskulin (der)", "Feminin (die)", "Neuter (das)", "Plural (die)"],
            "rows": [
              ["Nominativ", "der", "die", "das", "die"],
              ["Akkusativ", "den", "die", "das", "die"]
            ]
          }
        ]
      }
    },
    {
      "id": "a1-14-exercises",
      "title": "Übungen",
      "type": "exercises",
      "content": {
        "exercises": [
          {
            "type": "multiple_choice",
            "question": "___ Mann liest ein Buch. (Subjek)",
            "options": ["Der", "Den", "Dem", "Das"],
            "correct": 0,
            "explanation": "Subjek = Nominativ → der Mann"
          },
          {
            "type": "multiple_choice",
            "question": "Ich sehe ___ Hund. (Objek langsung)",
            "options": ["der", "den", "dem", "das"],
            "correct": 1,
            "explanation": "Objek langsung = Akkusativ → den Hund"
          },
          {
            "type": "fill_in",
            "question": "Die Frau trinkt ___ Kaffee. (Akkusativ)",
            "correct": "den",
            "explanation": "Kaffee = maskulin, Akkusativ → den"
          },
          {
            "type": "fill_in",
            "question": "Das Kind spielt ___ Ball. (Akkusativ)",
            "correct": "den",
            "explanation": "Ball = maskulin, Akkusativ → den"
          },
          {
            "type": "multiple_choice",
            "question": "Welcher Satz ist richtig?",
            "options": [
              "Der Mann kauft der Zeitung.",
              "Der Mann kauft die Zeitung.",
              "Der Mann kauft dem Zeitung.",
              "Der Mann kauft den Zeitung."
            ],
            "correct": 1,
            "explanation": "Zeitung = feminin, Akkusativ tetap die"
          },
          {
            "type": "fill_in",
            "question": "Er liest ___ Buch. (Akkusativ)",
            "correct": "das",
            "explanation": "Buch = neutrum, Akkusativ tetap das"
          },
          {
            "type": "multiple_choice",
            "question": "___ Kinder spielen im Garten. (Subjek)",
            "options": ["Der", "Den", "Die", "Das"],
            "correct": 2,
            "explanation": "Kinder = plural, Nominativ → die"
          },
          {
            "type": "fill_in",
            "question": "Ich kaufe ___ Auto. (Akkusativ)",
            "correct": "das",
            "explanation": "Auto = neutrum, Akkusativ tetap das"
          }
        ]
      }
    }
  ]
};
