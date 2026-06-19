// A1 L16: Modalverben (können, müssen, wollen, dürfen)
export const a1Lesson16 = {
  "id": "a1-16",
  "level": "A1",
  "title": "Modalverben (können, müssen, wollen, dürfen)",
  "sections": [
    {
      "id": "a1-16-intro",
      "title": "Intro",
      "type": "intro",
      "content": {
        "title": "Modalverben",
        "subtitle": "Kemampuan, kewajiban, keinginan, dan izin",
        "description": "Modalverben adalah kata kerja bantu yang menambahkan makna kemampuan (können), kewajiban (müssen), keinginan (wollen), atau izin (dürfen). Verb utama dipindahkan ke akhir kalimat (Satzklammer)."
      }
    },
    {
      "id": "a1-16-vocab",
      "title": "Vokabular",
      "type": "vocab",
      "content": {
        "vocabulary": [
          { "word": "können", "translation": "bisa/mampu", "example": "Ich kann Deutsch sprechen.", "article": "" },
          { "word": "müssen", "translation": "harus", "example": "Du musst lernen.", "article": "" },
          { "word": "wollen", "translation": "ingin", "example": "Er will Arzt werden.", "article": "" },
          { "word": "dürfen", "translation": "boleh/diizinkan", "example": "Sie darf nicht rauchen.", "article": "" },
          { "word": "sollen", "translation": "seharusnya", "example": "Ihr sollt pünktlich sein.", "article": "" },
          { "word": "die Prüfung", "translation": "ujian", "example": "Ich muss eine Prüfung machen.", "article": "die" },
          { "word": "die Hausaufgabe", "translation": "pekerjaan rumah", "example": "Du musst die Hausaufgabe machen.", "article": "die" },
          { "word": "das Studium", "translation": "kuliah", "example": "Er will studieren.", "article": "das" },
          { "word": "die Arbeit", "translation": "pekerjaan", "example": "Ich muss arbeiten.", "article": "die" },
          { "word": "der Schlaf", "translation": "tidur", "example": "Ich muss schlafen.", "article": "der" }
        ]
      }
    },
    {
      "id": "a1-16-grammar",
      "title": "Grammatik",
      "type": "grammar",
      "content": {
        "title": "Modalverben — Konjugasi & Satzklammer",
        "rules": [
          "Modalverben selalu di posisi 2 (verb utama di akhir = Satzklammer)",
          "Konjugasi irregular: ich habe Sonderform (kecuali sollen)",
          "können: ich kann, du kannst, er kann, wir können, ihr könnt, sie können",
          "müssen: ich muss, du musst, er muss, wir müssen, ihr müsst, sie müssen",
          "wollen: ich will, du willst, er will, wir wollen, ihr wollt, sie wollen",
          "dürfen: ich darf, du darfst, er darf, wir dürfen, ihr dürft, sie dürfen",
          "sollen: ich soll, du sollst, er soll, wir sollen, ihr sollt, sie sollen"
        ],
        "examples": [
          "Ich kann (modal) Deutsch sprechen (verb utama di akhir).",
          "Du musst (modal) die Hausaufgabe machen (di akhir).",
          "Er will (modal) Arzt werden (di akhir).",
          "Sie darf (modal) nicht rauchen (di akhir).",
          "Wir sollen (modal) pünktlich kommen (di akhir)."
        ],
        "tables": [
          {
            "title": "Konjugasi Modalverben",
            "headers": ["Subjek", "können", "müssen", "wollen", "dürfen", "sollen"],
            "rows": [
              ["ich", "kann", "muss", "will", "darf", "soll"],
              ["du", "kannst", "musst", "willst", "darfst", "sollst"],
              ["er/sie/es", "kann", "muss", "will", "darf", "soll"],
              ["wir", "können", "müssen", "wollen", "dürfen", "sollen"],
              ["ihr", "könnt", "müsst", "wollt", "dürft", "sollt"],
              ["sie/Sie", "können", "müssen", "wollen", "dürfen", "sollen"]
            ]
          }
        ]
      }
    },
    {
      "id": "a1-16-exercises",
      "title": "Übungen",
      "type": "exercises",
      "content": {
        "exercises": [
          {
            "type": "multiple_choice",
            "question": "Ich ___ Deutsch sprechen. (bisa)",
            "options": ["kann", "kannst", "können", "könnt"],
            "correct": 0,
            "explanation": "Subjek ich → kann"
          },
          {
            "type": "fill_in",
            "question": "Du ___ die Hausaufgabe machen. (harus)",
            "correct": "musst",
            "explanation": "Subjek du → musst"
          },
          {
            "type": "multiple_choice",
            "question": "Er ___ Arzt werden. (ingin)",
            "options": ["will", "willst", "wollen", "wollt"],
            "correct": 0,
            "explanation": "Subjek er → will"
          },
          {
            "type": "fill_in",
            "question": "Sie ___ nicht rauchen. (tidak boleh)",
            "correct": "darf",
            "explanation": "Subjek sie (dia) → darf"
          },
          {
            "type": "multiple_choice",
            "question": "Welcher Satz ist richtig?",
            "options": [
              "Ich muss arbeiten ich.",
              "Ich muss ich arbeiten.",
              "Ich muss arbeiten.",
              "Ich ich muss arbeiten."
            ],
            "correct": 2,
            "explanation": "Verb utama (arbeiten) di akhir kalimat"
          },
          {
            "type": "fill_in",
            "question": "Wir ___ pünktlich kommen. (seharusnya)",
            "correct": "sollen",
            "explanation": "Subjek wir → sollen"
          },
          {
            "type": "multiple_choice",
            "question": "Ihr ___ die Prüfung machen. (harus)",
            "options": ["müsst", "musst", "müssen", "muss"],
            "correct": 0,
            "explanation": "Subjek ihr → müsst"
          },
          {
            "type": "fill_in",
            "question": "Sie (formal) ___ bitte sitzen. (boleh/silakan)",
            "correct": "dürfen",
            "explanation": "Subjek Sie (formal) → dürfen"
          }
        ]
      }
    }
  ]
};
