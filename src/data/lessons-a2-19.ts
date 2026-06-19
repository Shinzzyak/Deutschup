// A2 L19: Adjektive nach bestimmtem Artikel
export const a2Lesson19 = {
  "id": "a2-19",
  "level": "A2",
  "title": "Adjektive nach bestimmtem Artikel",
  "sections": [
    {
      "id": "a2-19-intro",
      "title": "Intro",
      "type": "intro",
      "content": {
        "title": "Adjektive nach bestimmtem Artikel",
        "subtitle": "Endings setelah der, die, das",
        "description": "Adjektif setelah artikel pasti (der, die, das) memiliki akhiran yang bervariasi berdasarkan kasus dan jenis kelamin. Pola utama: -e (Nom), -en (Akk/Dat)."
      }
    },
    {
      "id": "a2-19-vocab",
      "title": "Vokabular",
      "type": "vocab",
      "content": {
        "vocabulary": [
          { "word": "der rote Apfel", "translation": "apel merah", "example": "Der rote Apfel schmeckt gut.", "article": "der" },
          { "word": "die grüne Farbe", "translation": "warna hijau", "example": "Die grüne Farbe ist schön.", "article": "die" },
          { "word": "das weiße Haus", "translation": "rumah putih", "example": "Das weiße Haus steht am Berg.", "article": "das" },
          { "word": "der alte Mann", "translation": "pria tua", "example": "Der alte Mann liest die Zeitung.", "article": "der" },
          { "word": "die junge Frau", "translation": "wanita muda", "example": "Die junge Frau arbeitet im Büro.", "article": "die" },
          { "word": "das neue Auto", "translation": "mobil baru", "example": "Das neue Auto ist schnell.", "article": "das" },
          { "word": "die dunkle Nacht", "translation": "malam gelap", "example": "In der dunklen Nacht sehe ich Sterne.", "article": "die" },
          { "word": "der lange Weg", "translation": "jalan panjang", "example": "Der lange Weg führt zum Berg.", "article": "der" },
          { "word": "die heiße Suppe", "translation": "sup panas", "example": "Die heiße Suppe schmeckt lecker.", "article": "die" },
          { "word": "das kalte Wasser", "translation": "air dingin", "example": "Das kalte Wasser erfrischt.", "article": "das" }
        ]
      }
    },
    {
      "id": "a2-19-grammar",
      "title": "Grammatik",
      "type": "grammar",
      "content": {
        "title": "Adjektivendungen nach bestimmtem Artikel",
        "rules": [
          "Nominativ: -e (maskulin, feminin, neutrum), -en (plural)",
          "Akkusativ: -en (maskulin), -e (feminin, neutrum, plural)",
          "Dativ: -en (semua jenis kelamin)",
          "Pola sederhana: hanya maskulin Akk yang berubah dari -e ke -en"
        ],
        "examples": [
          "Der alt**e** Mann. (Nom maskulin → -e)",
          "Den alt**en** Mann. (Akk maskulin → -en)",
          "Die jung**e** Frau. (Nom/Akk feminin → -e)",
          "Das neu**e** Auto. (Nom/Akk neutrum → -e)",
          "Dem alt**en** Mann. (Dat maskulin → -en)",
          "Der alt**en** Frau. (Dat feminin → -en)"
        ],
        "tables": [
          {
            "title": "Adjektivendungen mit bestimmtem Artikel",
            "headers": ["Kasus", "Maskulin", "Feminin", "Neuter", "Plural"],
            "rows": [
              ["Nom", "-e", "-e", "-e", "-en"],
              ["Akk", "-en", "-e", "-e", "-en"],
              ["Dat", "-en", "-en", "-en", "-en"]
            ]
          }
        ]
      }
    },
    {
      "id": "a2-19-exercises",
      "title": "Übungen",
      "type": "exercises",
      "content": {
        "exercises": [
          {
            "type": "multiple_choice",
            "question": "Der ___ Mann liest. (alt, Nom)",
            "options": ["alte", "alten", "alter", "altes"],
            "correct": 0,
            "explanation": "Nom maskulin → -e"
          },
          {
            "type": "fill_in",
            "question": "Ich sehe den ___ Mann. (alt, Akk)",
            "correct": "alten",
            "explanation": "Akk maskulin → -en"
          },
          {
            "type": "multiple_choice",
            "question": "Die ___ Frau arbeitet. (jung, Nom)",
            "options": ["junge", "jungen", "junger", "junges"],
            "correct": 0,
            "explanation": "Nom feminin → -e"
          },
          {
            "type": "fill_in",
            "question": "Das ___ Auto ist schnell. (neu, Nom)",
            "correct": "neue",
            "explanation": "Nom neutrum → -e"
          },
          {
            "type": "multiple_choice",
            "question": "Dem ___ Mann gebe ich das Buch. (alt, Dat)",
            "options": ["alten", "alte", "alter", "altes"],
            "correct": 0,
            "explanation": "Dat maskulin → -en"
          },
          {
            "type": "fill_in",
            "question": "Der ___ Weg ist lang. (gut, Nom)",
            "correct": "gute",
            "explanation": "Nom maskulin → -e"
          },
          {
            "type": "multiple_choice",
            "question": "Die ___ Suppe schmeckt gut. ( heiß, Nom)",
            "options": ["heiße", "heißen", "heißer", "heißes"],
            "correct": 0,
            "explanation": "Nom feminin → -e"
          },
          {
            "type": "fill_in",
            "question": "Ich trinke das ___ Wasser. (kalt, Akk)",
            "correct": "kalte",
            "explanation": "Akk neutrum → -e"
          }
        ]
      }
    }
  ]
};
