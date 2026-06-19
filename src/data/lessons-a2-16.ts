// A2 L16: Positionsverben (sitzen, liegen, stehen, gehen, fahren)
export const a2Lesson16 = {
  "id": "a2-16",
  "level": "A2",
  "title": "Positionsverben (sitzen, liegen, stehen, gehen, fahren)",
  "sections": [
    {
      "id": "a2-16-intro",
      "title": "Intro",
      "type": "intro",
      "content": {
        "title": "Positionsverben",
        "subtitle": "Verba posisi vs verba gerak",
        "description": "Positionsverben (sitzen, liegen, stehen) menunjukkan posisi statis. Verba gerak (gehen, fahren, fliegen) menunjukkan pergerakan. Keduanya digunakan dengan Wechselpräpositionen."
      }
    },
    {
      "id": "a2-16-vocab",
      "title": "Vokabular",
      "type": "vocab",
      "content": {
        "vocabulary": [
          { "word": "sitzen", "translation": "duduk", "example": "Ich sitze auf dem Stuhl.", "article": "" },
          { "word": "liegen", "translation": "berbaring/terletak", "example": "Das Buch liegt auf dem Tisch.", "article": "" },
          { "word": "stehen", "translation": "berdiri", "example": "Er steht an der Bushaltestelle.", "article": "" },
          { "word": "gehen", "translation": "berjalan/pergi", "example": "Ich gehe in die Schule.", "article": "" },
          { "word": "fahren", "translation": "berkendara/pergi", "example": "Er fährt mit dem Auto.", "article": "" },
          { "word": "fliegen", "translation": "terbang", "example": "Wir fliegen nach Mallorca.", "article": "" },
          { "word": "der Stuhl", "translation": "kursi", "example": "Der Stuhl steht im Zimmer.", "article": "der" },
          { "word": "der Tisch", "translation": "meja", "example": "Das Buch liegt auf dem Tisch.", "article": "der" },
          { "word": "das Sofa", "translation": "sofa", "example": "Ich sitze auf dem Sofa.", "article": "das" },
          { "word": "die Bushaltestelle", "translation": "halte bus", "example": "Er steht an der Bushaltestelle.", "article": "die" }
        ]
      }
    },
    {
      "id": "a2-16-grammar",
      "title": "Grammatik",
      "type": "grammar",
      "content": {
        "title": "Positionsverben & Wechselpräpositionen",
        "rules": [
          "Positionsverben (sitzen, liegen, stehen) → Dativ (posisi statis)",
          "Verba gerak (gehen, fahren, fliegen) → Akkusativ (pergerakan)",
          "Wechselpräpositionen: in, an, auf, über, unter, vor, hinter, neben, zwischen",
          "Pertanyaan: Wo? (Dativ) — Woher? (Dativ) — Wohin? (Akkusativ)"
        ],
        "examples": [
          "Das Buch liegt auf dem Tisch. (Dativ — posisi statis)",
          "Ich lege das Buch auf den Tisch. (Akk — pergerakan)",
          "Er steht an der Wand. (Dativ — posisi statis)",
          "Er geht an die Wand. (Akk — pergerakan)",
          "Ich sitze auf dem Sofa. (Dativ — posisi statis)"
        ],
        "tables": [
          {
            "title": "Wechselpräpositionen",
            "headers": ["Präposition", "Dativ (posisi)", "Akk (gerak)"],
            "rows": [
              ["in", "in dem (im)", "in den"],
              ["an", "an dem (am)", "an den"],
              ["auf", "auf dem", "auf den"],
              ["über", "über dem", "über den"],
              ["unter", "unter dem", "unter den"],
              ["vor", "vor dem", "vor den"],
              ["hinter", "hinter dem", "hinter den"],
              ["neben", "neben dem", "neben den"],
              ["zwischen", "zwischen dem", "zwischen den"]
            ]
          }
        ]
      }
    },
    {
      "id": "a2-16-exercises",
      "title": "Übungen",
      "type": "exercises",
      "content": {
        "exercises": [
          {
            "type": "multiple_choice",
            "question": "Das Buch liegt ___ dem Tisch. (posisi)",
            "options": ["auf dem", "auf den", "auf der", "auf das"],
            "correct": 0,
            "explanation": "auf + Dativ (posisi statis)"
          },
          {
            "type": "fill_in",
            "question": "Ich lege das Buch ___ den Tisch. (gerak)",
            "correct": "auf",
            "explanation": "auf + Akk (pergerakan)"
          },
          {
            "type": "multiple_choice",
            "question": "Er steht ___ der Wand. (posisi)",
            "options": ["an der", "an den", "an dem", "an die"],
            "correct": 0,
            "explanation": "an + Dativ (posisi statis)"
          },
          {
            "type": "fill_in",
            "question": "Er geht ___ die Wand. (gerak)",
            "correct": "an",
            "explanation": "an + Akk (pergerakan)"
          },
          {
            "type": "multiple_choice",
            "question": "Ich sitze ___ dem Sofa. (posisi)",
            "options": ["auf dem", "auf den", "auf der", "auf das"],
            "correct": 0,
            "explanation": "auf + Dativ (posisi statis)"
          },
          {
            "type": "fill_in",
            "question": "Er fährt ___ dem Auto. (gerak)",
            "correct": "mit",
            "explanation": "mit + Dativ (alat transportasi)"
          },
          {
            "type": "multiple_choice",
            "question": "Das Bild hängt ___ der Wand. (posisi)",
            "options": ["an der", "an den", "an dem", "an die"],
            "correct": 0,
            "explanation": "an + Dativ (posisi statis)"
          },
          {
            "type": "fill_in",
            "question": "Wir gehen ___ das Kino. (gerak)",
            "correct": "in",
            "explanation": "in + Akk (pergerakan ke dalam)"
          }
        ]
      }
    }
  ]
};
