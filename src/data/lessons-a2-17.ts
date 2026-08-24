// A2 L17: Adjektivendungen (bestimmt/unbestimmt)
export const a2Lesson17 = {
  "id": "a2-17",
  "level": "A2",
  "title": "Adjektivendungen (bestimmt/unbestimmt)",
  "sections": [
    {
      "id": "a2-17-intro",
      "title": "Intro",
      "type": "intro",
      "content": {
        "title": "Adjektivendungen",
        "subtitle": "Endings setelah artikel pasti/tidak pasti/tanpa artikel",
        "description": "Adjektif dalam bahasa Jerman memiliki akhiran yang berbeda tergantung jenis kelamin, kasus, dan apakah diikuti artikel pasti (der, die, das), tidak pasti (ein, eine), atau tanpa artikel."
      }
    },
    {
      "id": "a2-17-vocab",
      "title": "Vokabular",
      "type": "vocab",
      "content": {
        "vocabulary": [
          { "word": "gut", "translation": "bagus", "example": "Das ist ein guter Film.", "article": "" },
          { "word": "schlecht", "translation": "buruk", "example": "Das ist ein schlechter Film.", "article": "" },
          { "word": "groß", "translation": "besar", "example": "Das ist ein großes Haus.", "article": "" },
          { "word": "klein", "translation": "kecil", "example": "Das ist ein kleines Kind.", "article": "" },
          { "word": "neu", "translation": "baru", "example": "Das ist ein neues Auto.", "article": "" },
          { "word": "alt", "translation": "lama/tua", "example": "Das ist ein altes Buch.", "article": "" },
          { "word": "schön", "translation": "indah", "example": "Das ist ein schönes Bild.", "article": "" },
          { "word": "interessant", "translation": "menarik", "example": "Das ist ein interessantes Buch.", "article": "" },
          { "word": "das Film", "translation": "film", "example": "Der Film ist gut.", "article": "der" },
          { "word": "das Buch", "translation": "buku", "example": "Das Buch ist interessant.", "article": "das" }
        ]
      }
    },
    {
      "id": "a2-17-grammar",
      "title": "Grammatik",
      "type": "grammar",
      "content": {
        "title": "Adjektivendungen — bestimmt/unbestimmt",
        "rules": [
          "Artikel pasti (der, die, das): -e untuk semua kasus kecuali Akk maskulin → -en",
          "Artikel tidak pasti (ein, eine): -er (Nom mask), -e (Nom fem/neut), -en (Akk/Dat)",
          "Tanpa artikel: -er (Nom mask), -e (Nom fem/neut), -es (Nom/Akk neut), -en (Dat/Akk)",
          "Dativ selalu -en untuk semua jenis kelamin"
        ],
        "examples": [
          "Der gute Film. (Artikel pasti, Nominativ maskulin → -e)",
          "Den guten Film. (Artikel pasti, Akk maskulin → -en)",
          "Ein guter Film. (Artikel tidak pasti, Nom maskulin → -er)",
          "Ein guter Film. (Artikel tidak pasti, Nom maskulin → -er)",
          "Guter Film. (Tanpa artikel, Nom maskulin → -er)",
          "Guten Film. (Tanpa artikel, Akk maskulin → -en)"
        ],
        "tables": [
          {
            "title": "Adjektivendungen dengan Artikel Pasti",
            "headers": ["Kasus", "Maskulin", "Feminin", "Neuter", "Plural"],
            "rows": [
              ["Nom", "-e", "-e", "-e", "-en"],
              ["Akk", "-en", "-e", "-e", "-en"],
              ["Dat", "-en", "-en", "-en", "-en"]
            ]
          },
          {
            "title": "Adjektivendungen dengan Artikel Tidak Pasti",
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
      "id": "a2-17-exercises",
      "title": "Übungen",
      "type": "exercises",
      "content": {
        "exercises": [
          {
            "type": "multiple_choice",
            "question": "Der ___ Film ist gut. (gut, Nom maskulin, artikel pasti)",
            "options": ["gute", "guter", "guten", "gutes"],
            "correct": 0,
            "explanation": "Artikel pasti + Nominativ maskulin → -e"
          },
          {
            "type": "fill_in",
            "question": "Ich sehe einen ___ Film. (gut, Akk maskulin, artikel tidak pasti)",
            "correct": "guten",
            "explanation": "Artikel tidak pasti + Akk maskulin → -en"
          },
          {
            "type": "multiple_choice",
            "question": "Das ist ein ___ Buch. (interessant, Nom neutrum, artikel tidak pasti)",
            "options": ["interessantes", "interessanter", "interessanten", "interessante"],
            "correct": 0,
            "explanation": "Artikel tidak pasti + Nom neutrum → -es"
          },
          {
            "type": "fill_in",
            "question": "Der ___ Film ist lang. (lang, Nom maskulin, artikel pasti)",
            "correct": "lange",
            "explanation": "Artikel pasti + Nominativ maskulin → -e"
          },
          {
            "type": "multiple_choice",
            "question": "___ Film ist gut. (gut, Nom maskulin, tanpa artikel)",
            "options": ["Guter", "Gute", "Guten", "Gutes"],
            "correct": 0,
            "explanation": "Tanpa artikel + Nom maskulin → -er"
          },
          {
            "type": "fill_in",
            "question": "Ich sehe ___ Film. (gut, Akk maskulin, tanpa artikel)",
            "correct": "guten",
            "explanation": "Tanpa artikel + Akk maskulin → -en"
          },
          {
            "type": "multiple_choice",
            "question": "Das ist ___ Buch. (interessant, Nom neutrum, tanpa artikel)",
            "options": ["ein interessantes", "ein interessanter", "ein interessanten", "ein interessante"],
            "correct": 0,
            "explanation": "Artikel tidak pasti + Nom neutrum → -es"
          },
          {
            "type": "fill_in",
            "question": "Der ___ Film ist lang. (alt, Nom maskulin, artikel pasti)",
            "correct": "alte",
            "explanation": "Artikel pasti + Nominativ maskulin → -e"
          }
        ]
      }
    }
  ]
};
