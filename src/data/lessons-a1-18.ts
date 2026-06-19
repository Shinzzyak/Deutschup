// A1 L18: Trennbare Verben
export const a1Lesson18 = {
  "id": "a1-18",
  "level": "A1",
  "title": "Trennbare Verben (aufmachen, anrufen, dst)",
  "sections": [
    {
      "id": "a1-18-intro",
      "title": "Intro",
      "type": "intro",
      "content": {
        "title": "Trennbare Verben",
        "subtitle": "Prefix memisahkan — posisi di akhir kalimat",
        "description": "Trennbare Verben adalah kata kerja yang terdiri dari prefix (an-, auf-, aus-, ein-, etc.) + verb dasar. Prefix terpisah dari verb utama dan dipindahkan ke akhir kalimat."
      }
    },
    {
      "id": "a1-18-vocab",
      "title": "Vokabular",
      "type": "vocab",
      "content": {
        "vocabulary": [
          { "word": "aufmachen", "translation": "membuka", "example": "Mach das Fenster auf!", "article": "" },
          { "word": "zumachen", "translation": "menutup", "example": "Mach die Tür zu!", "article": "" },
          { "word": "anrufen", "translation": "menelepon", "example": "Ich rufe dich an.", "article": "" },
          { "word": "einkaufen", "translation": "berbelanja", "example": "Wir kaufen im Supermarkt ein.", "article": "" },
          { "word": "aufstehen", "translation": "bangun tidur", "example": "Ich stehe um 7 Uhr auf.", "article": "" },
          { "word": "ausgehen", "translation": "keluar rumah", "example": "Wir gehen am Abend aus.", "article": "" },
          { "word": "ankommen", "translation": "tiba/datang", "example": "Der Zug kommt um 10 Uhr an.", "article": "" },
          { "word": "abfahren", "translation": "berangkat", "example": "Der Zug fährt um 10 Uhr ab.", "article": "" },
          { "word": "fernsehen", "translation": "menonton TV", "example": "Er sieht gern fern.", "article": "" },
          { "word": "zurückkommen", "translation": "kembali", "example": "Ich komme um 5 Uhr zurück.", "article": "" }
        ]
      }
    },
    {
      "id": "a1-18-grammar",
      "title": "Grammatik",
      "type": "grammar",
      "content": {
        "title": "Trennbare Verben — Satzklammer",
        "rules": [
          "Prefix (an-, auf-, aus-, ein-, ab-, zu-, etc.) terpisah dari verb",
          "Verb utama di posisi 2, prefix di akhir kalimat",
          "Satzklammer: posisi 2 ↔ akhir kalimat",
          "Kalimat tidak langsung: prefix bergabung kembali (Ich weiß, dass er anruft)",
          "Pertanyaan: prefix di depan (Rufst du mich an?)"
        ],
        "examples": [
          "Ich rufe (V2) dich (Akk) um 5 Uhr (Objekt) an (prefix).",
          "Mach (Imperativ) das Fenster (Akk) auf (prefix)!",
          "Er steht (V2) um 7 Uhr (Zeit) auf (prefix).",
          "Rufst (V2) du (Subjekt) mich (Akk) an (prefix)?",
          "Ich weiß, dass er um 5 Uhr anruft. (kein Satzklammer)"
        ],
        "tables": [
          {
            "title": "Trennbare Verben Umum",
            "headers": ["Prefix", "Contoh", "Arti"],
            "rows": [
              ["an-", "anrufen, ankommen, anfangen", "menelepon, tiba, mulai"],
              ["auf-", "aufmachen, aufstehen, aufhören", "membuka, bangun, berhenti"],
              ["aus-", "ausgehen, ausmachen, aussehen", "keluar, matikan, terlihat"],
              ["ein-", "einkaufen, einladen, einziehen", "belanja, mengundang, pindah"],
              ["ab-", "abfahren, abgeben, abholen", "berangkat, menyerahkan, menjemput"],
              ["zu-", "zumachen, zuhören, zurückkommen", "menutup, mendengarkan, kembali"],
              ["mit-", "mitbringen, mitnehmen, mitmachen", "membawa, membawa, ikut serta"],
              ["vor-", "vorhaben, vormachen, vorstellen", "berencana, mendemonstrasikan, memperkenalkan"]
            ]
          }
        ]
      }
    },
    {
      "id": "a1-18-exercises",
      "title": "Übungen",
      "type": "exercises",
      "content": {
        "exercises": [
          {
            "type": "multiple_choice",
            "question": "Ich ___ um 7 Uhr ___. (aufstehen)",
            "options": ["stehe...auf", "aufstehe", "auf...stehe", "stehe auf"],
            "correct": 0,
            "explanation": "aufstehen → stehe (V2) ... auf (akhir)"
          },
          {
            "type": "fill_in",
            "question": "Er ___ mich ___. (anrufen)",
            "correct": "ruft...an",
            "explanation": "anrufen → ruft (V2) an (akhir)"
          },
          {
            "type": "multiple_choice",
            "question": "___ das Fenster ___! (aufmachen, Imperativ)",
            "options": ["Mach...auf", "Aufmach", "Mach auf", "Auf...mach"],
            "correct": 0,
            "explanation": "Imperativ: mach (V2) ... auf (akhir)"
          },
          {
            "type": "fill_in",
            "question": "Wir ___ im Supermarkt ___. (einkaufen)",
            "correct": "kaufen...ein",
            "explanation": "einkaufen → kaufen (V2) ein (akhir)"
          },
          {
            "type": "multiple_choice",
            "question": "___ du mich ___? (anrufen, pertanyaan)",
            "options": ["Rufst...an", "Anrufst...du", "Ruf...an", "Anrufst an"],
            "correct": 0,
            "explanation": "Pertanyaan: Rufst (V2) ... an (akhir)"
          },
          {
            "type": "fill_in",
            "question": "Der Zug ___ um 10 Uhr ___. (abfahren)",
            "correct": "fährt...ab",
            "explanation": "abfahren → fährt (V2) ab (akhir)"
          },
          {
            "type": "multiple_choice",
            "question": "Ich weiß, dass er um 5 Uhr ___. (anrufen, tidak langsung)",
            "options": ["anruft", "ruft an", "anruft an", "ruft"],
            "correct": 0,
            "explanation": "Tidak langsung: prefix bergabung → anruft"
          },
          {
            "type": "fill_in",
            "question": "Er ___ gern ___. (fernsehen)",
            "correct": "sieht...fern",
            "explanation": "fernsehen → sieht (V2) fern (akhir)"
          }
        ]
      }
    }
  ]
};
