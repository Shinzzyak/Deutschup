// A1 L25: Indirekte Fragesätze
export const a1Lesson25 = {
  "id": "a1-25",
  "level": "A1",
  "title": "Indirekte Fragesätze",
  "sections": [
    {
      "id": "a1-25-intro",
      "title": "Intro",
      "type": "intro",
      "content": {
        "title": "Indirekte Fragesätze",
        "subtitle": "Pertanyaan tidak langsung — ob/oder dan W-Fragen",
        "description": "Indirekte Fragesätze digunakan untuk melaporkan pertanyaan tanpa mengutip langsung. Menggunakan 'ob' untuk ya/tidak, dan W-Fragewörter (wo, wann, wie, warum, dll.) untuk pertanyaan informasi."
      }
    },
    {
      "id": "a1-25-vocab",
      "title": "Vokabular",
      "type": "vocab",
      "content": {
        "vocabulary": [
          { "word": "ob", "translation": "apakah", "example": "Ich weiß nicht, ob er kommt.", "article": "" },
          { "word": "wo", "translation": "dimana", "example": "Ich frage mich, wo er wohnt.", "article": "" },
          { "word": "wann", "translation": "kapan", "example": "Kannst du mir sagen, wann der Zug fährt?", "article": "" },
          { "word": "wie", "translation": "bagaimana", "example": "Er fragt, wie man das macht.", "article": "" },
          { "word": "warum", "translation": "mengapa", "example": "Ich verstehe nicht, warum er das tut.", "article": "" },
          { "word": "was", "translation": "apa", "example": "Sag mir, was du denkst.", "article": "" },
          { "word": "wer", "translation": "siapa", "example": "Ich weiß nicht, wer das ist.", "article": "" },
          { "word": "wie viel", "translation": "berapa", "example": "Kannst du sagen, wie viel das kostet?", "article": "" },
          { "word": "die Adresse", "translation": "alamat", "example": "Können Sie mir sagen, wo die Adresse ist?", "article": "die" },
          { "word": "die Uhrzeit", "translation": "jam", "example": "Ich frage, wann die Uhrzeit ist.", "article": "die" }
        ]
      }
    },
    {
      "id": "a1-25-grammar",
      "title": "Grammatik",
      "type": "grammar",
      "content": {
        "title": "Indirekte Fragesätze — ob, W-Fragen",
        "rules": [
          "ob = apakah (untuk pertanyaan ya/tidak)",
          "W-Fragewörter: wo, wann, wie, warum, was, wer, wie viel",
          "Posisi verb di AKHIR klausa anak (seperti weil/dass)",
          "Tidak ada inversi (verb tidak di posisi 2)",
          "Kalimat utama + koma + ob/W-Fragewort + ... + verb di akhir"
        ],
        "examples": [
          "Ich weiß nicht, ob er kommt. (ob + verb di akhir)",
          "Kannst du mir sagen, wann der Zug fährt? (wann + verb di akhir)",
          "Er fragt, wie man das macht. (wie + verb di akhir)",
          "Ich verstehe nicht, warum er das tut. (warum + verb di akhir)",
          "Sag mir, was du denkst. (was + verb di akhir)"
        ],
        "tables": [
          {
            "title": "Indirekte Fragesätze",
            "headers": ["Kalimat Langsung", "Kalimat Tidak Langsung"],
            "rows": [
              ["Wo wohnst du?", "Ich frage, wo du wohnst."],
              ["Kommst du morgen?", "Ich weiß nicht, ob du morgen kommst."],
              ["Wann fährt der Zug?", "Kannst du sagen, wann der Zug fährt?"],
              ["Wie macht man das?", "Er fragt, wie man das macht."],
              ["Wer ist das?", "Ich weiß nicht, wer das ist."]
            ]
          }
        ]
      }
    },
    {
      "id": "a1-25-exercises",
      "title": "Übungen",
      "type": "exercises",
      "content": {
        "exercises": [
          {
            "type": "multiple_choice",
            "question": "Ich weiß nicht, ___ er kommt. (ya/tidak)",
            "options": ["ob", "wie", "wo", "was"],
            "correct": 0,
            "explanation": "ob = apakah (pertanyaan ya/tidak)"
          },
          {
            "type": "fill_in",
            "question": "Kannst du mir sagen, ___ der Zug fährt?",
            "correct": "wann",
            "explanation": "wann = kapan"
          },
          {
            "type": "multiple_choice",
            "question": "Er fragt, ___ man das macht.",
            "options": ["ob", "wie", "wo", "was"],
            "correct": 1,
            "explanation": "wie = bagaimana"
          },
          {
            "type": "fill_in",
            "question": "Ich verstehe nicht, ___ er das tut.",
            "correct": "warum",
            "explanation": "warum = mengapa"
          },
          {
            "type": "multiple_choice",
            "question": "Sag mir, ___ du denkst.",
            "options": ["ob", "wie", "wo", "was"],
            "correct": 3,
            "explanation": "was = apa"
          },
          {
            "type": "fill_in",
            "question": "Ich weiß nicht, ___ das ist.",
            "correct": "wer",
            "explanation": "wer = siapa"
          },
          {
            "type": "multiple_choice",
            "question": "Können Sie mir sagen, ___ die Adresse ist?",
            "options": ["ob", "wie", "wo", "was"],
            "correct": 2,
            "explanation": "wo = dimana"
          },
          {
            "type": "fill_in",
            "question": "Ich frage, ___ das kostet.",
            "correct": "wie viel",
            "explanation": "wie viel = berapa"
          }
        ]
      }
    }
  ]
};
