// A1 L21: Komparativ & Superlativ
export const a1Lesson21 = {
  "id": "a1-21",
  "level": "A1",
  "title": "Komparativ & Superlativ",
  "sections": [
    {
      "id": "a1-21-intro",
      "title": "Intro",
      "type": "intro",
      "content": {
        "title": "Komparativ & Superlativ",
        "subtitle": "Membandingkan dan tingkatan tertinggi",
        "description": "Komparatif digunakan untuk membandingkan dua hal (lebih...dari). Superlatif digunakan untuk tingkatan tertinggi (paling...). Terbentuk dengan akhiran -er (komparatif) dan am -sten (superlatif)."
      }
    },
    {
      "id": "a1-21-vocab",
      "title": "Vokabular",
      "type": "vocab",
      "content": {
        "vocabulary": [
          { "word": "groß", "translation": "besar/tinggi", "example": "Berlin ist größer als München.", "article": "" },
          { "word": "klein", "translation": "kecil", "example": "Das Kind ist kleiner als sein Bruder.", "article": "" },
          { "word": "schnell", "translation": "cepat", "example": "Der Zug ist schneller als das Auto.", "article": "" },
          { "word": "langsam", "translation": "lambat", "example": "Die Schnecke ist langsamer als der Hund.", "article": "" },
          { "word": "gut", "translation": "bagus", "example": "Er ist besser als ich.", "article": "" },
          { "word": "schlecht", "translation": "buruk", "example": "Das Wetter ist schlechter als gestern.", "article": "" },
          { "word": "teuer", "translation": "mahal", "example": "Das Auto ist teurer als das Fahrrad.", "article": "" },
          { "word": "billig", "translation": "murah", "example": "Das Buch ist billiger als der Film.", "article": "" },
          { "word": "warm", "translation": "hangat", "example": "Der Sommer ist wärmer als der Winter.", "article": "" },
          { "word": "kalt", "translation": "dingin", "example": "Der Winter ist kälter als der Sommer.", "article": "" }
        ]
      }
    },
    {
      "id": "a1-21-grammar",
      "title": "Grammatik",
      "type": "grammar",
      "content": {
        "title": "Komparativ & Superlativ — Pembentukan",
        "rules": [
          "Komparatif: adjektiv + -er + als (lebih...dari)",
          "Superlativ: am + adjektiv + -sten (paling...)",
          "Adjektif pendek: tambah huruf akhir (gut→besser→am besten)",
          "Adjektif panjang: tambah -er / am -sten (schnell→schneller→am schnellsten)",
          "Irregular: gut→besser→am besten, viel→mehr→am meisten, gern→lieber→am liebsten"
        ],
        "examples": [
          "Berlin ist größer als München. (Komparativ)",
          "München ist am größten in Bayern. (Superlativ)",
          "Er ist besser als ich. (Komparativ irregular: gut→besser)",
          "Sie ist die Beste in der Klasse. (Superlativ irregular: gut→beste)",
          "Ich fahre gern, aber ich fahre lieber Fahrrad. (Komparativ irregular: gern→lieber)"
        ],
        "tables": [
          {
            "title": "Irregular Komparativ & Superlativ",
            "headers": ["Adjektiv", "Komparativ", "Superlativ"],
            "rows": [
              ["gut", "besser", "am besten"],
              ["viel", "mehr", "am meisten"],
              ["gern", "lieber", "am liebsten"],
              ["bald", "eher", "am ehesten"],
              ["hoch", "höcher", "am höchsten"],
              ["nah", "näher", "am nächsten"]
            ]
          },
          {
            "title": "Regular Pattern",
            "headers": ["Adjektiv", "Komparativ", "Superlativ"],
            "rows": [
              ["groß", "größer", "am größten"],
              ["klein", "kleiner", "am kleinsten"],
              ["schnell", "schneller", "am schnellsten"],
              ["langsam", "langsamer", "am langsamsten"],
              ["teuer", "teurer", "am teuersten"],
              ["warm", "wärmer", "am wärmsten"]
            ]
          }
        ]
      }
    },
    {
      "id": "a1-21-exercises",
      "title": "Übungen",
      "type": "exercises",
      "content": {
        "exercises": [
          {
            "type": "multiple_choice",
            "question": "Berlin ist ___ als München. (groß)",
            "options": ["größer", "großter", "am größten", "groß"],
            "correct": 0,
            "explanation": "Komparatif: größer + als"
          },
          {
            "type": "fill_in",
            "question": "Er ist ___ als ich. (gut)",
            "correct": "besser",
            "explanation": "Irregular: gut → besser"
          },
          {
            "type": "multiple_choice",
            "question": "Das ist ___ Buch. (gut, Superlativ)",
            "options": ["das beste", "das besser", "am besten", "besser"],
            "correct": 0,
            "explanation": "Superlativ irregular: gut → beste (tanpa 'am' karena setelah 'das')"
          },
          {
            "type": "fill_in",
            "question": "Der Zug ist ___ als das Auto. (schnell)",
            "correct": "schneller",
            "explanation": "Komparatif: schnell → schneller"
          },
          {
            "type": "multiple_choice",
            "question": "Ich fahre ___ Fahrrad als mit dem Bus. (gern)",
            "options": ["lieber", "am liebsten", "gerner", "lieber als"],
            "correct": 0,
            "explanation": "Irregular: gern → lieber"
          },
          {
            "type": "fill_in",
            "question": "Der Sommer ist ___ als der Winter. (warm)",
            "correct": "wärmer",
            "explanation": "Komparatif: warm → wärmer (a→ä)"
          },
          {
            "type": "multiple_choice",
            "question": "Das ist ___ Hotel in der Stadt. (teuer, Superlativ)",
            "options": ["das teuerste", "am teuersten", "teurer", "das teurere"],
            "correct": 0,
            "explanation": "Superlativ: das teuerste"
          },
          {
            "type": "fill_in",
            "question": "Berlin ist ___ als München. (alt)",
            "correct": "älter",
            "explanation": "Komparatif: alt → älter (a→ä)"
          }
        ]
      }
    }
  ]
};
