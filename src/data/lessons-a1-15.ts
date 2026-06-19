// A1 L15: Kasus Dativ
export const a1Lesson15 = {
  "id": "a1-15",
  "level": "A1",
  "title": "Kasus Dativ",
  "sections": [
    {
      "id": "a1-15-intro",
      "title": "Intro",
      "type": "intro",
      "content": {
        "title": "Kasus Dativ",
        "subtitle": "Objek tidak langsung — untuk siapa, kepada siapa",
        "description": "Dativ digunakan untuk objek tidak langsung (indirektes Objek). Menunjukkan kepada siapa atau untuk siapa sesuatu dilakukan. Artikel berubah: der→dem, die→der, das→dem."
      }
    },
    {
      "id": "a1-15-vocab",
      "title": "Vokabular",
      "type": "vocab",
      "content": {
        "vocabulary": [
          { "word": "helfen + Dat", "translation": "membantu", "example": "Ich helfe dem Mann.", "article": "dem" },
          { "word": "danken + Dat", "translation": "berterima kasih", "example": "Ich danke der Frau.", "article": "der" },
          { "word": "gefallen + Dat", "translation": "menyenangi", "example": "Das Buch gefällt dem Kind.", "article": "dem" },
          { "word": "gehören + Dat", "translation": "milik", "example": "Das Auto gehört dem Mann.", "article": "dem" },
          { "word": "der Arzt", "translation": "dokter", "example": "Ich gehe zum Arzt.", "article": "der" },
          { "word": "die Ärztin", "translation": "dokter wanita", "example": "Die Ärztin hilft mir.", "article": "die" },
          { "word": "das Krankenhaus", "translation": "rumah sakit", "example": "Er ist im Krankenhaus.", "article": "das" },
          { "word": "die Adresse", "translation": "alamat", "example": "Was ist Ihre Adresse?", "article": "die" },
          { "word": "das Rezept", "translation": "resep", "example": "Der Arzt gibt mir ein Rezept.", "article": "das" },
          { "word": "die Medizin", "translation": "obat", "example": "Die Medizin hilft mir.", "article": "die" }
        ]
      }
    },
    {
      "id": "a1-15-grammar",
      "title": "Grammatik",
      "type": "grammar",
      "content": {
        "title": "Deklinasi Dativ",
        "rules": [
          "Dativ = objek tidak langsung (kepada siapa, untuk siapa)",
          "Artikel berubah:",
          "  der → dem, die → der, das → dem, die (pl) → den",
          "Artikel tidak tentu: ein → einem, eine → einer, ein → einem",
          "Verba yang membutuhkan Dativ: helfen, danken, gefallen, gehören, sagen, geben, schicken",
          "Präposisi selalu Dativ: mit, aus, zu, bei, nach, von, seit"
        ],
        "examples": [
          "Ich gebe dem Mann das Buch. (Akk: das Buch, Dat: dem Mann)",
          "Sie hilft der Frau. (Dat: der Frau)",
          "Das Buch gehört dem Kind. (Dat: dem Kind)",
          "Er schickt der Lehrerin eine E-Mail. (Dat: der Lehrerin)",
          "Ich komme aus Deutschland. (aus + Dat)"
        ],
        "tables": [
          {
            "title": "Deklinasi Artikel Dativ",
            "headers": ["Kasus", "Maskulin", "Feminin", "Neuter", "Plural"],
            "rows": [
              ["Nominativ", "der", "die", "das", "die"],
              ["Akkusativ", "den", "die", "das", "die"],
              ["Dativ", "dem", "der", "dem", "den"]
            ]
          },
          {
            "title": "Artikel Tidak Tentu Dativ",
            "headers": ["Kasus", "Maskulin", "Feminin", "Neuter"],
            "rows": [
              ["Nominativ", "ein", "eine", "ein"],
              ["Akkusativ", "einen", "eine", "ein"],
              ["Dativ", "einem", "einer", "einem"]
            ]
          }
        ]
      }
    },
    {
      "id": "a1-15-exercises",
      "title": "Übungen",
      "type": "exercises",
      "content": {
        "exercises": [
          {
            "type": "multiple_choice",
            "question": "Ich helfe ___ Mann. (Dativ)",
            "options": ["der", "den", "dem", "das"],
            "correct": 2,
            "explanation": "Helfen + Dativ → dem Mann"
          },
          {
            "type": "fill_in",
            "question": "Sie dankt ___ Frau. (Dativ)",
            "correct": "der",
            "explanation": "Frau = feminin, Dativ → der"
          },
          {
            "type": "multiple_choice",
            "question": "Das Buch gehört ___ Kind. (Dativ)",
            "options": ["der", "den", "dem", "die"],
            "correct": 2,
            "explanation": "Kind = neutrum, Dativ → dem"
          },
          {
            "type": "fill_in",
            "question": "Er schickt ___ Lehrerin eine E-Mail. (Dativ)",
            "correct": "der",
            "explanation": "Lehrerin = feminin, Dativ → der"
          },
          {
            "type": "multiple_choice",
            "question": "Ich komme aus ___ (Frankreich).",
            "options": ["der", "den", "dem", "die"],
            "correct": 0,
            "explanation": "aus + Dativ, Frankreich = feminin → aus der"
          },
          {
            "type": "fill_in",
            "question": "Das Auto gehört ___ Mann. (Dativ)",
            "correct": "dem",
            "explanation": "Mann = maskulin, Dativ → dem"
          },
          {
            "type": "multiple_choice",
            "question": "Welcher Satz ist richtig?",
            "options": [
              "Ich gebe den Mann das Buch.",
              "Ich gebe dem Mann das Buch.",
              "Ich gebe der Mann das Buch.",
              "Ich gebe das Mann das Buch."
            ],
            "correct": 1,
            "explanation": "geben + Dativ (kepada siapa) + Akkusativ (apa) → dem Mann"
          },
          {
            "type": "fill_in",
            "question": "Er ist im (in dem) ___. (Krankenhaus = neutrum, Dativ)",
            "correct": "Krankenhaus",
            "explanation": "im = in + dem, Krankenhaus tetap bentuknya"
          }
        ]
      }
    }
  ]
};
