// A1 L20: Nebensätze (dass, weil, wenn)
export const a1Lesson20 = {
  "id": "a1-20",
  "level": "A1",
  "title": "Nebensätze (dass, weil, wenn)",
  "sections": [
    {
      "id": "a1-20-intro",
      "title": "Intro",
      "type": "intro",
      "content": {
        "title": "Nebensätze",
        "subtitle": "Klausa anak dengan dass, weil, wenn",
        "description": "Nebensätze (klausa anak) dipisahkan dengan koma dari klausa utama. Konjunksi (dass, weil, wenn) berada di awal klausa anak, dan verb dipindahkan ke akhir."
      }
    },
    {
      "id": "a1-20-vocab",
      "title": "Vokabular",
      "type": "vocab",
      "content": {
        "vocabulary": [
          { "word": "weil", "translation": "karena", "example": "Ich bleibe zu Hause, weil ich krank bin.", "article": "" },
          { "word": "dass", "translation": "bahwa", "example": "Ich glaube, dass er nett ist.", "article": "" },
          { "word": "wenn", "translation": "jika/ketika", "example": "Wenn es regnet, bleibe ich zu Hause.", "article": "" },
          { "word": "obwohl", "translation": "meskipun", "example": "Obwohl es kalt ist, gehe ich spazieren.", "article": "" },
          { "word": "der Wetter", "translation": "cuaca", "example": "Das Wetter ist heute schön.", "article": "das" },
          { "word": "die Erkältung", "translation": "pilek", "example": "Ich habe eine Erkältung.", "article": "die" },
          { "word": "das Fieber", "translation": "demam", "example": "Er hat hohes Fieber.", "article": "das" },
          { "word": "die Medizin", "translation": "obat", "example": "Nehmen Sie die Medizin.", "article": "die" },
          { "word": "das Bett", "translation": "tempat tidur", "example": "Ich bleibe im Bett.", "article": "das" },
          { "word": "die Suppe", "translation": "sup", "example": "Ich esse Suppe, weil ich krank bin.", "article": "die" }
        ]
      }
    },
    {
      "id": "a1-20-grammar",
      "title": "Grammatik",
      "type": "grammar",
      "content": {
        "title": "Nebensätze — weil, dass, wenn",
        "rules": [
          "Klausa anak dipisahkan dengan koma dari klausa utama",
          "Konjunksi (weil/dass/wenn) di awal klausa anak",
          "Verb utama dipindahkan ke AKHIR klausa anak",
          "weil = karena (alasan/sebab akibat)",
          "dass = bahwa (objek kalimat, setelah verba seperti glauben, wissen, denken)",
          "wenn = jika/ketika (kondisi/waktu)"
        ],
        "examples": [
          "Ich bleibe zu Hause, weil ich krank bin. (bin di akhir)",
          "Ich glaube, dass er nett ist. (ist di akhir)",
          "Wenn es regnet, bleibe ich zu Hause. (bleibe di akhir klausa utama)",
          "Er sagt, dass er müde ist. (ist di akhir)",
          "Ich komme, wenn du mich brauchst. (brauchst di akhir)"
        ],
        "tables": [
          {
            "title": "Posisi Verb di Nebensatz",
            "headers": ["Klausa Utama", "Klausa Anak"],
            "rows": [
              ["Ich bleibe zu Hause", "weil ich krank bin."],
              ["Ich glaube", "dass er nett ist."],
              ["Wenn es regnet", "bleibe ich zu Hause."],
              ["Er sagt", "dass er müde ist."],
              ["Ich komme", "wenn du mich brauchst."]
            ]
          }
        ]
      }
    },
    {
      "id": "a1-20-exercises",
      "title": "Übungen",
      "type": "exercises",
      "content": {
        "exercises": [
          {
            "type": "multiple_choice",
            "question": "Ich bleibe zu Hause, weil ich krank ___.",
            "options": ["bin", "ist", "sind", "bist"],
            "correct": 0,
            "explanation": "Subjek ich → bin, verb di akhir klausa anak"
          },
          {
            "type": "fill_in",
            "question": "Ich glaube, dass er nett ___.",
            "correct": "ist",
            "explanation": "Subjek er → ist, verb di akhir klausa anak"
          },
          {
            "type": "multiple_choice",
            "question": "___ es regnet, bleibe ich zu Hause.",
            "options": ["Weil", "Dass", "Wenn", "Obwohl"],
            "correct": 2,
            "explanation": "wenn = jika/ketika (kondisi)"
          },
          {
            "type": "fill_in",
            "question": "Er sagt, dass er müde ___.",
            "correct": "ist",
            "explanation": "Subjek er → ist, verb di akhir klausa anak"
          },
          {
            "type": "multiple_choice",
            "question": "Ich komme, ___ du mich brauchst.",
            "options": ["weil", "dass", "wenn", "obwohl"],
            "correct": 2,
            "explanation": "wenn = jika (kondisi)"
          },
          {
            "type": "fill_in",
            "question": "___ es kalt ist, gehe ich spazieren.",
            "correct": "Wenn",
            "explanation": "wenn = jika/ketika"
          },
          {
            "type": "multiple_choice",
            "question": "Er bleibt zu Hause, ___ er krank ist.",
            "options": ["wenn", "dass", "weil", "obwohl"],
            "correct": 2,
            "explanation": "weil = karena (alasan)"
          },
          {
            "type": "fill_in",
            "question": "Ich weiß, dass du Recht ___.",
            "correct": "hast",
            "explanation": "Subjek du → hast, verb di akhir klausa anak"
          }
        ]
      }
    }
  ]
};
