// A2 L22: Adjektive nach unbestimmtem Artikel
export const a2Lesson22 = {
  "id": "a2-22",
  "level": "A2",
  "title": "Adjektive nach unbestimmtem Artikel",
  "sections": [
    {
      "id": "a2-22-intro",
      "title": "Intro",
      "type": "intro",
      "content": {
        "title": "Adjektive nach unbestimmtem Artikel",
        "subtitle": "Endings setelah ein, eine, kein",
        "description": "Adjektif setelah artikel tidak pasti (ein, eine) atau negasi (kein, keine) memiliki pola akhiran yang berbeda dari artikel pasti."
      }
    },
    {
      "id": "a2-22-vocab",
      "title": "Vokabular",
      "type": "vocab",
      "content": {
        "vocabulary": [
          { "word": "ein roter Apfel", "translation": "apel merah", "example": "Ich esse einen roten Apfel.", "article": "" },
          { "word": "eine grüne Farbe", "translation": "warna hijau", "example": "Das ist eine grüne Farbe.", "article": "" },
          { "word": "ein weißes Haus", "translation": "rumah putih", "example": "Das ist ein weißes Haus.", "article": "" },
          { "word": "ein alter Mann", "translation": "pria tua", "example": "Ich sehe einen alten Mann.", "article": "" },
          { "word": "eine junge Frau", "translation": "wanita muda", "example": "Das ist eine junge Frau.", "article": "" },
          { "word": "ein neues Auto", "translation": "mobil baru", "example": "Ich fahre ein neues Auto.", "article": "" },
          { "word": "kein guter Film", "translation": "bukan film bagus", "example": "Das ist kein guter Film.", "article": "" },
          { "word": "keine schlechte Idee", "translation": "bukan ide buruk", "example": "Das ist keine schlechte Idee.", "article": "" },
          { "word": "kein altes Buch", "translation": "bukan buku lama", "example": "Das ist kein altes Buch.", "article": "" },
          { "word": "eine heiße Suppe", "translation": "sup panas", "example": "Ich trinke eine heiße Suppe.", "article": "" }
        ]
      }
    },
    {
      "id": "a2-22-grammar",
      "title": "Grammatik",
      "type": "grammar",
      "content": {
        "title": "Adjektivendungen nach unbestimmtem Artikel",
        "rules": [
          "Nominativ: -er (maskulin), -e (feminin, neutrum)",
          "Akkusativ: -en (maskulin), -e (feminin, neutrum)",
          "Dativ: -en (semua jenis kelamin)",
          "kein menggunakan pola yang sama seperti ein"
        ],
        "examples": [
          "Ein rot**er** Apfel. (Nom maskulin → -er)",
          "Eine grün**e** Farbe. (Nom feminin → -e)",
          "Ein weiẞ**es** Haus. (Nom neutrum → -es)",
          "Einen alt**en** Mann. (Akk maskulin → -en)",
          "Kein gut**er** Film. (Nom maskulin → -er)",
          "Keine schlecht**e** Idee. (Nom feminin → -e)"
        ],
        "tables": [
          {
            "title": "Adjektivendungen mit unbestimmtem Artikel",
            "headers": ["Kasus", "Maskulin", "Feminin", "Neuter"],
            "rows": [
              ["Nom", "-er", "-e", "-es"],
              ["Akk", "-en", "-e", "-es"],
              ["Dat", "-en", "-en", "-en"]
            ]
          }
        ]
      }
    },
    {
      "id": "a2-22-exercises",
      "title": "Übungen",
      "type": "exercises",
      "content": {
        "exercises": [
          {
            "type": "multiple_choice",
            "question": "Ein ___ Apfel. (rot, Nom maskulin)",
            "options": ["roter", "roten", "rotes", "rote"],
            "correct": 0,
            "explanation": "Nom maskulin → -er"
          },
          {
            "type": "fill_in",
            "question": "Ich esse einen ___ Apfel. (rot, Akk maskulin)",
            "correct": "roten",
            "explanation": "Akk maskulin → -en"
          },
          {
            "type": "multiple_choice",
            "question": "Das ist eine ___ Farbe. (grün, Nom feminin)",
            "options": ["grüne", "grünen", "grüner", "grünes"],
            "correct": 0,
            "explanation": "Nom feminin → -e"
          },
          {
            "type": "fill_in",
            "question": "Das ist ein ___ Haus. (weiß, Nom neutrum)",
            "correct": "weißes",
            "explanation": "Nom neutrum → -es"
          },
          {
            "type": "multiple_choice",
            "question": "Ich sehe einen ___ Mann. (alt, Akk maskulin)",
            "options": ["alten", "alter", "altes", "alte"],
            "correct": 0,
            "explanation": "Akk maskulin → -en"
          },
          {
            "type": "fill_in",
            "question": "Das ist kein ___ Film. (gut, Nom maskulin)",
            "correct": "guter",
            "explanation": "Nom maskulin → -er"
          },
          {
            "type": "multiple_choice",
            "question": "Das ist keine ___ Idee. (schlecht, Nom feminin)",
            "options": ["schlechte", "schlechten", "schlechter", "schlechtes"],
            "correct": 0,
            "explanation": "Nom feminin → -e"
          },
          {
            "type": "fill_in",
            "question": "Ich trinke eine ___ Suppe. (heiß, Akk feminin)",
            "correct": "heiße",
            "explanation": "Akk feminin → -e"
          }
        ]
      }
    }
  ]
};
