import { Lesson, VocabWord } from './course';

export const courseData: Lesson[] = [
  {
    "id": "a1-1",
    "level": "A1",
    "title": "Perkenalan & Salam (Hallo, Guten Morgen, dst)",
    "grammarDescription": "Pada pelajaran ini, kita akan mempelajari frasa dasar untuk menyapa dan memperkenalkan diri dalam bahasa Jerman. Penting untuk memahami perbedaan antara sapaan formal dan informal, serta bagaimana merespons pertanyaan tentang kabar. Struktur kalimat dasar yang digunakan adalah Subjek + Verb + Objek/Pelengkap.",
    "canDoGoals": [
      "Memperkenalkan diri dalam bahasa Jerman (Sich vorstellen)",
      "Mengeja nama dengan Alfabet Jerman (Buchstabieren)",
      "Mengucapkan salam dan berpamitan yang sesuai waktu",
      "Menanyakan dan menjawab kabar dengan benar",
      "Membedakan kapan harus menggunakan formal (Sie) dan informal (du)"
    ],
    "indonesianMistakes": "**1. Translasi Kabar Secara Literal**\nPembelajar Indonesia sering menerjemahkan 'Saya baik-baik saja' menjadi *'Ich bin gut'*. Ini SALAH BESAR, karena 'Ich bin gut' artinya 'Saya jago' atau 'Kualitas saya baik'. Yang benar adalah **'Mir geht es gut'** (Kabar saya baik).\n\n**2. Lupa Kapitalisasi (Kata Benda)**\nDalam bahasa Jerman, SETIAP kata benda (Noun) WAJIB diawali huruf besar. Contoh: 'Guten **M**orgen' atau 'Guten **T**ag'. Bukan 'guten morgen'.\n\n**3. Kurang Peka Formal vs Informal**\nOrang Indonesia sering lupa bedanya. Menggunakan 'dir' ke dosen/bos itu tabu (harus 'Ihnen').",
    "culturalNotes": "Orang Jerman sangat menghargai privasi dan batas kesopanan. Mereka amat jarang menggunakan bahasa informal (du/dir) ke orang yang baru dikenal, kasir bank, penjaga toko, atau rekan kerja yang tidak dekat. Selalu mulai dengan *Sie* (Anda) sampai mereka menawarkan *das Du* (panggilan 'du'). Orang Jerman juga sering berjabat tangan saat pertama kali bertemu.",
    "listeningSimulation": {
      "transcript": [
        {
          "personA": "Guten Morgen, Herr Müller.",
          "personB": "Guten Morgen, Frau Klein. Wie geht es Ihnen?",
          "translation": "A: Selamat pagi, Pak Müller. | B: Selamat pagi, Ibu Klein. Bagaimana kabar Anda?"
        },
        {
          "personA": "Danke, gut. Und Ihnen?",
          "personB": "Auch gut, danke.",
          "translation": "A: Baik, terima kasih. Dan Anda? | B: Baik juga, terima kasih."
        }
      ],
      "questions": [
        {
          "question": "Apakah percakapan di atas bersifat formal atau informal?",
          "options": ["Formal", "Informal"],
          "correctAnswer": 0
        }
      ]
    },
    "sentenceBreakdowns": [
      "Ich (subjek) + heiße (verb) + Anna (objek/nama).",
      "Wie (kata tanya) + geht (verb) + es (subjek) + Ihnen (objek Dativ formal)?",
      "Mir (objek Dativ) + geht (verb) + es (subjek) + gut (kata sifat)."
    ],
    "pronunciationTips": [
      "**Minimal Pairs (Pasangan Kata)**\nOrang Indonesia sering tertukar membaca vokal 'ie' dan 'ei' karena kita terbiasa membaca lurus.\n- **Bier** (dibaca: Beer / i panjang) vs **bei** (dibaca: bai)\n- **schön** (bibir maju membentuk 'o', suarakan 'e') vs **schon** (o biasa)",
      "**Suara 'ch'**\nHuruf 'ch' memiliki dua suara utama:\n- Seperti desisan kucing 'hsss' di langit-langit mulut pada kata **ich**.\n- Seperti suara orang membuang dahak 'kh' pada kata **ach**.",
      "**Rhythm Drills (Pemenggalan Kata)**\nBahasa Jerman punya intonasi turun di akhir kalimat pernyataan.\n- *Ich heiße...* (Naik di 'Ich', turun di 'heiße')\n- *Wie geht es Ihnen?* (Naik di 'Wie', perlahan turun di 'Ihnen')"
    ],
    "vocabulary": [
      {
        "id": "v-gen-1",
        "word": "Hallo",
        "translation": "Halo",
        "exampleSentence": "Hallo, wie geht es dir?",
        "phonetic": "HAL-lo",
        "level": "A1"
      },
      {
        "id": "v-gen-2",
        "word": "Guten Morgen",
        "translation": "Selamat Pagi",
        "exampleSentence": "Guten Morgen, Herr Müller!",
        "phonetic": "GU-ten MOR-gen",
        "level": "A1"
      },
      {
        "id": "v-gen-3",
        "word": "Guten Tag",
        "translation": "Selamat Siang/Sore",
        "exampleSentence": "Guten Tag, Frau Schmidt.",
        "phonetic": "GU-ten TAK",
        "level": "A1"
      },
      {
        "id": "v-gen-4",
        "word": "Guten Abend",
        "translation": "Selamat Malam",
        "exampleSentence": "Guten Abend, alle zusammen.",
        "phonetic": "GU-ten A-bent",
        "level": "A1"
      },
      {
        "id": "v-gen-5",
        "word": "Gute Nacht",
        "translation": "Selamat Tidur",
        "exampleSentence": "Gute Nacht, schlaf gut!",
        "phonetic": "GU-te NAKHT",
        "level": "A1"
      },
      {
        "id": "v-gen-6",
        "word": "Wie geht es Ihnen?",
        "translation": "Bagaimana kabar Anda? (formal)",
        "exampleSentence": "Guten Tag, Herr Meier. Wie geht es Ihnen?",
        "phonetic": "VI geet es I-nen",
        "level": "A1"
      },
      {
        "id": "v-gen-7",
        "word": "Wie geht es dir?",
        "translation": "Bagaimana kabarmu? (informal)",
        "exampleSentence": "Hallo, Anna. Wie geht es dir?",
        "phonetic": "VI geet es deer",
        "level": "A1"
      },
      {
        "id": "v-gen-8",
        "word": "Mir geht es gut",
        "translation": "Kabar saya baik",
        "exampleSentence": "Danke, mir geht es gut.",
        "phonetic": "MEER geet es GOOT",
        "level": "A1"
      },
      {
        "id": "v-gen-9",
        "word": "Ich heiße...",
        "translation": "Nama saya...",
        "exampleSentence": "Ich heiße Max.",
        "phonetic": "IKH HAI-se",
        "level": "A1"
      },
      {
        "id": "v-gen-10",
        "word": "Mein Name ist...",
        "translation": "Nama saya adalah...",
        "exampleSentence": "Mein Name ist Lisa.",
        "phonetic": "MAIN NA-me ist",
        "level": "A1"
      },
      {
        "id": "v-gen-11",
        "word": "Freut mich",
        "translation": "Senang bertemu Anda",
        "exampleSentence": "Freut mich, Sie kennenzulernen.",
        "phonetic": "FROIT mikh",
        "level": "A1"
      },
      {
        "id": "v-gen-12",
        "word": "Auf Wiedersehen",
        "translation": "Sampai jumpa (formal)",
        "exampleSentence": "Auf Wiedersehen, Frau Weber.",
        "phonetic": "AUF VEE-der-zeen",
        "level": "A1"
      },
      {
        "id": "v-gen-13",
        "word": "Tschüss",
        "translation": "Sampai jumpa (informal)",
        "exampleSentence": "Tschüss, bis morgen!",
        "phonetic": "CHÜSS",
        "level": "A1"
      },
      {
        "id": "v-gen-14",
        "word": "Ja",
        "translation": "Ya",
        "exampleSentence": "Ja, das stimmt.",
        "phonetic": "YA",
        "level": "A1"
      },
      {
        "id": "v-gen-15",
        "word": "Nein",
        "translation": "Tidak",
        "exampleSentence": "Nein, das ist falsch.",
        "phonetic": "NAIN",
        "level": "A1"
      },
      {
        "id": "v-gen-16",
        "word": "Danke",
        "translation": "Terima kasih",
        "exampleSentence": "Danke für Ihre Hilfe.",
        "phonetic": "DANK-e",
        "level": "A1"
      },
      {
        "id": "v-gen-17",
        "word": "Bitte",
        "translation": "Tolong / Sama-sama",
        "exampleSentence": "Bitte schön.",
        "phonetic": "BIT-te",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Pilih sapaan yang tepat untuk pagi hari:",
        "options": [
          "Guten Abend",
          "Guten Morgen",
          "Gute Nacht",
          "Tschüss"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Bagaimana cara memperkenalkan diri secara informal?",
        "options": [
          "Mein Name ist...",
          "Ich heiße...",
          "Wie geht es Ihnen?",
          "Auf Wiedersehen"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa jawaban yang tepat untuk 'Wie geht es dir?' jika kabar baik?",
        "options": [
          "Nein",
          "Mir geht es schlecht",
          "Mir geht es gut",
          "Danke"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih sapaan perpisahan informal:",
        "options": [
          "Auf Wiedersehen",
          "Guten Tag",
          "Tschüss",
          "Guten Abend"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa arti 'Freut mich'?",
        "options": [
          "Selamat tinggal",
          "Terima kasih",
          "Senang bertemu Anda",
          "Halo"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Jika Anda bertemu seseorang di sore hari, apa yang Anda katakan?",
        "options": [
          "Guten Morgen",
          "Guten Tag",
          "Guten Abend",
          "Gute Nacht"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Bagaimana cara mengucapkan 'Ya' dalam bahasa Jerman?",
        "options": [
          "Nein",
          "Ja",
          "Bitte",
          "Danke"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa yang Anda katakan saat berpisah dengan teman dekat?",
        "options": [
          "Auf Wiedersehen",
          "Guten Tag",
          "Tschüss",
          "Guten Morgen"
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Hallo, ich heiße Lena.",
        "personB": "Guten Tag, Lena. Mein Name ist Max. Freut mich!",
        "translation": "A: Halo, nama saya Lena.\nB: Selamat siang, Lena. Nama saya Max. Senang bertemu Anda!"
      },
      {
        "personA": "Guten Morgen, Herr Schmidt. Wie geht es Ihnen?",
        "personB": "Guten Morgen, Frau Weber. Danke, mir geht es gut. Und Ihnen?",
        "translation": "A: Selamat pagi, Bapak Schmidt. Bagaimana kabar Anda?\nB: Selamat pagi, Ibu Weber. Terima kasih, kabar saya baik. Dan Anda?"
      },
      {
        "personA": "Tschüss, bis morgen!",
        "personB": "Tschüss, Max! Gute Nacht!",
        "translation": "A: Sampai jumpa, sampai besok!\nB: Sampai jumpa, Max! Selamat tidur!"
      }
    ]
  },
  {
    "id": "a1-2",
    "level": "A1",
    "title": "Artikel: Der, Die, Das",
    "grammarDescription": "Dalam bahasa Jerman, setiap kata benda memiliki gender gramatikal: maskulin (der), feminin (die), atau netral (das). Artikel ini sangat penting karena memengaruhi bentuk kata sifat dan kata ganti. Tidak ada aturan pasti untuk menentukan gender, jadi penting untuk menghafal kata benda beserta artikelnya. Artikel 'der', 'die', 'das' adalah artikel tentu (definite articles).",
    "canDoGoals": [
      "Mengidentifikasi gender kata benda (Maskulin, Feminin, Netral)",
      "Membedakan artikel pasti (Bestimmte Artikel: der, die, das)",
      "Membedakan artikel tidak pasti (Unbestimmte Artikel: ein, eine)",
      "Mencocokkan kata benda dengan kata ganti orang (er, sie, es)"
    ],
    "indonesianMistakes": "**Menebak Gender Secara Asal (Random Der/Die/Das)**\nDi Indonesia, benda tidak punya jenis kelamin. Kursi ya kursi. Di Jerman: Kursi itu maskulin (*der Stuhl*), tas itu feminin (*die Tasche*), buku itu netral (*das Buch*).\n\n❌ *Das ist der Tasche* (Salah artikel)\n✅ **Das ist die Tasche**\n\n**TIPS EMAS:** Jangan pernah belajar kata benda tanpa artikelnya! Otak kita sering asal tebak karena menganggap benda tidak bernyawa = *das*. Kenyataannya gender bahasa Jerman itu GRAMATIKAL, bukan logis (Buktinya: Anak perempuan = *das Mädchen* / Netral!). Wajib dihafal sebagai satu kesatuan.",
    "listeningSimulation": {
      "transcript": [
        {
          "personA": "Ist das ein Auto?",
          "personB": "Ja, das ist das Auto von Thomas.",
          "translation": "A: Apakah itu sebuah mobil? | B: Ya, itu mobilnya Thomas."
        },
        {
          "personA": "Und wer ist das?",
          "personB": "Das ist die Frau von Thomas.",
          "translation": "A: Dan siapa itu? | B: Itu istri/wanitanya Thomas."
        }
      ],
      "questions": [
        {
          "question": "Mengapa person B menggunakan kata 'die Frau'?",
          "options": ["Karena semua orang menggunakan 'die'", "Karena 'Frau' adalah kata benda feminin", "Karena itu adalah subjek pertama"],
          "correctAnswer": 1
        }
      ]
    },
    "sentenceBreakdowns": [
      "Das (artikel netral) + ist (verb) + der (artikel maskulin) + Mann (kata benda maskulin).",
      "Das (artikel netral) + ist (verb) + die (artikel feminin) + Frau (kata benda feminin).",
      "Das (artikel netral) + ist (verb) + das (artikel netral) + Kind (kata benda netral)."
    ],
    "pronunciationTips": [
      "Huruf 'r' di akhir suku kata atau kata sering diucapkan sebagai suara vokal ringan, mirip 'a' atau 'er' (misal: 'der' terdengar seperti 'dea').",
      "Huruf 's' di awal kata sebelum vokal diucapkan seperti 'z' (misal: 'sehen' seperti 'ze-hen').",
      "Huruf 'ß' (Eszett) selalu diucapkan seperti 'ss' yang tajam (misal: 'Straße')."
    ],
    "vocabulary": [
      {
        "id": "v-gen-18",
        "word": "der Mann",
        "translation": "pria",
        "article": "der",
        "exampleSentence": "Der Mann ist groß.",
        "phonetic": "der MAN",
        "level": "A1"
      },
      {
        "id": "v-gen-19",
        "word": "die Frau",
        "translation": "wanita",
        "article": "die",
        "exampleSentence": "Die Frau liest ein Buch.",
        "phonetic": "dee FRAU",
        "level": "A1"
      },
      {
        "id": "v-gen-20",
        "word": "das Kind",
        "translation": "anak",
        "article": "das",
        "exampleSentence": "Das Kind spielt.",
        "phonetic": "das KINT",
        "level": "A1"
      },
      {
        "id": "v-gen-21",
        "word": "der Tisch",
        "translation": "meja",
        "article": "der",
        "exampleSentence": "Der Tisch ist aus Holz.",
        "phonetic": "der TISH",
        "level": "A1"
      },
      {
        "id": "v-gen-22",
        "word": "der Stuhl",
        "translation": "kursi",
        "article": "der",
        "exampleSentence": "Der Stuhl ist bequem.",
        "phonetic": "der SHTOOL",
        "level": "A1"
      },
      {
        "id": "v-gen-23",
        "word": "das Buch",
        "translation": "buku",
        "article": "das",
        "exampleSentence": "Das Buch ist interessant.",
        "phonetic": "das BOOKH",
        "level": "A1"
      },
      {
        "id": "v-gen-24",
        "word": "das Haus",
        "translation": "rumah",
        "article": "das",
        "exampleSentence": "Das Haus ist groß.",
        "phonetic": "das HAUS",
        "level": "A1"
      },
      {
        "id": "v-gen-25",
        "word": "das Auto",
        "translation": "mobil",
        "article": "das",
        "exampleSentence": "Das Auto ist schnell.",
        "phonetic": "das AU-to",
        "level": "A1"
      },
      {
        "id": "v-gen-26",
        "word": "der Apfel",
        "translation": "apel",
        "article": "der",
        "exampleSentence": "Der Apfel ist rot.",
        "phonetic": "der AP-fel",
        "level": "A1"
      },
      {
        "id": "v-gen-27",
        "word": "die Banane",
        "translation": "pisang",
        "article": "die",
        "exampleSentence": "Die Banane ist gelb.",
        "phonetic": "dee ba-NA-ne",
        "level": "A1"
      },
      {
        "id": "v-gen-28",
        "word": "das Wasser",
        "translation": "air",
        "article": "das",
        "exampleSentence": "Das Wasser ist kalt.",
        "phonetic": "das VAS-ser",
        "level": "A1"
      },
      {
        "id": "v-gen-29",
        "word": "das Brot",
        "translation": "roti",
        "article": "das",
        "exampleSentence": "Das Brot ist frisch.",
        "phonetic": "das BROHT",
        "level": "A1"
      },
      {
        "id": "v-gen-30",
        "word": "die Milch",
        "translation": "susu",
        "article": "die",
        "exampleSentence": "Die Milch ist lecker.",
        "phonetic": "dee MILKH",
        "level": "A1"
      },
      {
        "id": "v-gen-31",
        "word": "der Kaffee",
        "translation": "kopi",
        "article": "der",
        "exampleSentence": "Der Kaffee ist heiß.",
        "phonetic": "der KAF-fe",
        "level": "A1"
      },
      {
        "id": "v-gen-32",
        "word": "der Tee",
        "translation": "teh",
        "article": "der",
        "exampleSentence": "Der Tee ist grün.",
        "phonetic": "der TEE",
        "level": "A1"
      },
      {
        "id": "v-gen-33",
        "word": "die Tür",
        "translation": "pintu",
        "article": "die",
        "exampleSentence": "Die Tür ist offen.",
        "phonetic": "dee TÜR",
        "level": "A1"
      },
      {
        "id": "v-gen-34",
        "word": "das Fenster",
        "translation": "jendela",
        "article": "das",
        "exampleSentence": "Das Fenster ist sauber.",
        "phonetic": "das FEN-ster",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Pilih artikel yang benar untuk 'Mann':",
        "options": [
          "die",
          "der",
          "das",
          "ein"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Pilih artikel yang benar untuk 'Buch':",
        "options": [
          "der",
          "die",
          "das",
          "eine"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih artikel yang benar untuk 'Frau':",
        "options": [
          "der",
          "die",
          "das",
          "ein"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Das ist ___ Auto.'",
        "options": [
          "der",
          "die",
          "das",
          "ein"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Lengkapi kalimat: '___ Apfel ist rot.'",
        "options": [
          "Die",
          "Das",
          "Der",
          "Ein"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa artikel untuk 'Tisch'?",
        "options": [
          "die",
          "das",
          "der",
          "ein"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa artikel untuk 'Milch'?",
        "options": [
          "der",
          "das",
          "die",
          "eine"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Lengkapi kalimat: '___ Kind spielt im Garten.'",
        "options": [
          "Der",
          "Die",
          "Das",
          "Ein"
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Was ist das?",
        "personB": "Das ist der Tisch.",
        "translation": "A: Apa itu?\nB: Itu adalah meja."
      },
      {
        "personA": "Ist das die Frau Müller?",
        "personB": "Ja, das ist die Frau Müller.",
        "translation": "A: Apakah itu Ibu Müller?\nB: Ya, itu adalah Ibu Müller."
      },
      {
        "personA": "Hast du ein Buch?",
        "personB": "Ja, ich habe das Buch.",
        "translation": "A: Apakah kamu punya buku?\nB: Ya, saya punya buku itu."
      }
    ],
    "culturalNotes": "Gender gramatikal kata benda dalam bahasa Jerman seringkali tidak ada hubungannya dengan gender biologis atau logika. Misalnya, 'das Mädchen' (gadis) adalah netral, sedangkan 'der Stuhl' (kursi) adalah maskulin. Ini adalah salah satu tantangan terbesar bagi pembelajar bahasa Jerman, dan cara terbaik adalah menghafal setiap kata benda bersama dengan artikelnya."
  },
  {
    "id": "a1-3",
    "canDoGoals": [
      "Membaca dan berhitung angka 1-100 (Zahlen)",
      "Menyatakan dan menanyakan umur dengan benar",
      "Menyebutkan nomor telepon",
      "Memeriksa dan menyebutkan harga barang dalam Euro"
    ],
    "level": "A1",
    "title": "Angka 1-100 & Umur",
    "grammarDescription": "Pelajaran ini mencakup angka dari 1 hingga 100 dan cara menanyakan serta menyatakan umur. Dalam bahasa Jerman, angka dua digit (21-99) dibentuk dengan menyebutkan satuan terlebih dahulu, diikuti 'und' (dan), lalu puluhan (misal: 'einundzwanzig' untuk 21). Untuk umur, kita menggunakan struktur 'Ich bin [angka] Jahre alt'.",
    "sentenceBreakdowns": [
      "Ich (subjek) + bin (verb 'sein') + zwanzig (angka) + Jahre alt (frasa).",
      "Wie (kata tanya) + alt (kata sifat) + bist (verb 'sein') + du (subjek)?",
      "Die (artikel feminin) + Nummer (kata benda feminin) + ist (verb 'sein') + dreiundvierzig (angka)."
    ],
    "pronunciationTips": [
      "Huruf 'z' di awal kata atau suku kata diucapkan seperti 'ts' (misal: 'zwei' seperti 'tsvai').",
      "Huruf 'ß' diucapkan seperti 'ss' (misal: 'dreißig').",
      "Vokal ganda 'eu' diucapkan seperti 'oi' dalam 'boikot' (misal: 'neun')."
    ],
    "vocabulary": [
      {
        "id": "v-gen-35",
        "word": "eins",
        "translation": "satu",
        "exampleSentence": "Ich habe eins Buch.",
        "phonetic": "AINS",
        "level": "A1"
      },
      {
        "id": "v-gen-36",
        "word": "zwei",
        "translation": "dua",
        "exampleSentence": "Wir sind zwei Personen.",
        "phonetic": "TSVAI",
        "level": "A1"
      },
      {
        "id": "v-gen-37",
        "word": "drei",
        "translation": "tiga",
        "exampleSentence": "Drei Äpfel, bitte.",
        "phonetic": "DRAI",
        "level": "A1"
      },
      {
        "id": "v-gen-38",
        "word": "vier",
        "translation": "empat",
        "exampleSentence": "Ich habe vier Stifte.",
        "phonetic": "FEER",
        "level": "A1"
      },
      {
        "id": "v-gen-39",
        "word": "fünf",
        "translation": "lima",
        "exampleSentence": "Fünf Euro, bitte.",
        "phonetic": "FÜNF",
        "level": "A1"
      },
      {
        "id": "v-gen-40",
        "word": "sechs",
        "translation": "enam",
        "exampleSentence": "Sechs Uhr ist es.",
        "phonetic": "ZEKS",
        "level": "A1"
      },
      {
        "id": "v-gen-41",
        "word": "sieben",
        "translation": "tujuh",
        "exampleSentence": "Sieben Tage hat die Woche.",
        "phonetic": "ZEE-ben",
        "level": "A1"
      },
      {
        "id": "v-gen-42",
        "word": "acht",
        "translation": "delapan",
        "exampleSentence": "Acht Stunden Schlaf.",
        "phonetic": "AKHT",
        "level": "A1"
      },
      {
        "id": "v-gen-43",
        "word": "neun",
        "translation": "sembilan",
        "exampleSentence": "Neun ist meine Glückszahl.",
        "phonetic": "NOIN",
        "level": "A1"
      },
      {
        "id": "v-gen-44",
        "word": "zehn",
        "translation": "sepuluh",
        "exampleSentence": "Zehn Finger habe ich.",
        "phonetic": "TSEEN",
        "level": "A1"
      },
      {
        "id": "v-gen-45",
        "word": "zwanzig",
        "translation": "dua puluh",
        "exampleSentence": "Ich bin zwanzig Jahre alt.",
        "phonetic": "TSVAN-tsikh",
        "level": "A1"
      },
      {
        "id": "v-gen-46",
        "word": "dreißig",
        "translation": "tiga puluh",
        "exampleSentence": "Sie ist dreißig Jahre alt.",
        "phonetic": "DRAI-sikh",
        "level": "A1"
      },
      {
        "id": "v-gen-47",
        "word": "hundert",
        "translation": "seratus",
        "exampleSentence": "Das kostet hundert Euro.",
        "phonetic": "HOON-dert",
        "level": "A1"
      },
      {
        "id": "v-gen-48",
        "word": "Jahre alt",
        "translation": "tahun",
        "exampleSentence": "Er ist fünfzehn Jahre alt.",
        "phonetic": "YAA-re ALT",
        "level": "A1"
      },
      {
        "id": "v-gen-49",
        "word": "Wie alt bist du?",
        "translation": "Berapa umurmu? (informal)",
        "exampleSentence": "Wie alt bist du, Max?",
        "phonetic": "VEE ALT bist doo",
        "level": "A1"
      },
      {
        "id": "v-gen-50",
        "word": "die Nummer",
        "translation": "nomor",
        "article": "die",
        "exampleSentence": "Meine Telefonnummer ist...",
        "phonetic": "dee NOO-mer",
        "level": "A1"
      },
      {
        "id": "v-gen-51",
        "word": "der Geburtstag",
        "translation": "ulang tahun",
        "article": "der",
        "exampleSentence": "Wann ist dein Geburtstag?",
        "phonetic": "der ge-BURTS-tak",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Berapa 'fünf und drei'?",
        "options": [
          "acht",
          "sieben",
          "neun",
          "zehn"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Bagaimana cara mengatakan 'dua puluh satu'?",
        "options": [
          "einundzwanzig",
          "zwanzigeins",
          "zweiundzehn",
          "einszwanzig"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Jika Anda berumur 25 tahun, apa yang Anda katakan?",
        "options": [
          "Ich bin fünfzwanzig Jahre alt.",
          "Ich bin fünfundzwanzig Jahre alt.",
          "Ich habe fünfundzwanzig Jahre.",
          "Ich bin fünfundzwanzig."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa arti 'hundert'?",
        "options": [
          "sepuluh",
          "seratus",
          "seribu",
          "satu"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Wie alt ___ du?'",
        "options": [
          "ist",
          "bin",
          "bist",
          "sind"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Berapa 'sechsunddreißig'?",
        "options": [
          "26",
          "36",
          "46",
          "63"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Bagaimana cara menanyakan umur seseorang secara formal?",
        "options": [
          "Wie alt bist du?",
          "Wie alt sind Sie?",
          "Wie alt ist er?",
          "Wie alt ist sie?"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa angka setelah 'neun'?",
        "options": [
          "acht",
          "zehn",
          "elf",
          "zwölf"
        ],
        "correctAnswer": 1
      }
    ],
    "dialogues": [
      {
        "personA": "Wie alt bist du?",
        "personB": "Ich bin zwanzig Jahre alt.",
        "translation": "A: Berapa umurmu?\nB: Saya berumur dua puluh tahun."
      },
      {
        "personA": "Was ist deine Telefonnummer?",
        "personB": "Meine Nummer ist neunundachtzig, vierunddreißig, einundzwanzig.",
        "translation": "A: Berapa nomor teleponmu?\nB: Nomor saya delapan puluh sembilan, tiga puluh empat, dua puluh satu."
      },
      {
        "personA": "Wie viele Bücher hast du?",
        "personB": "Ich habe elf Bücher.",
        "translation": "A: Berapa banyak buku yang kamu punya?\nB: Saya punya sebelas buku."
      }
    ],
    "culturalNotes": "Di Jerman, ketepatan waktu (Pünktlichkeit) sangat dihargai, dan angka seringkali penting untuk janji temu, alamat, dan nomor telepon. Saat menyebutkan nomor telepon, biasanya disebutkan per digit atau per dua digit, bukan sebagai satu kesatuan panjang. Angka 'einundzwanzig' (21) hingga 'neunundneunzig' (99) selalu menyebutkan satuan terlebih dahulu, lalu 'und', baru puluhan."
  },
  {
    "id": "a1-checkpoint-1",
    "canDoGoals": [
      "Mengevaluasi penguasaan salam dan perkenalan",
      "Menguji kemampuan membedakan artikel Der, Die, Das",
      "Menguji kelancaran menghitung angka 1-100 dan menyatakan umur"
    ],
    "title": "Review Konten Sebelumnya",
    "requiredScore": 0.7,
    "questions": [
      {
        "question": "Pilih sapaan yang tepat untuk sore hari:",
        "options": [
          "Guten Morgen",
          "Guten Tag",
          "Guten Abend",
          "Gute Nacht"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Lengkapi kalimat: 'Ich heiße ___.'",
        "options": [
          "du",
          "er",
          "Anna",
          "Sie"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa artikel yang benar untuk 'Haus'?",
        "options": [
          "der",
          "die",
          "das",
          "ein"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih artikel yang benar untuk 'Frau':",
        "options": [
          "der",
          "die",
          "das",
          "eine"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Bagaimana cara mengatakan 'tiga puluh dua'?",
        "options": [
          "zweiunddreißig",
          "dreißigzwei",
          "dreizwei",
          "zweiunddrei"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Jika Anda berumur 18 tahun, apa yang Anda katakan?",
        "options": [
          "Ich bin achtzehn Jahre alt.",
          "Ich bin achtzehn.",
          "Ich habe achtzehn Jahre.",
          "Ich bin acht und zehn Jahre alt."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Apa arti 'Tschüss'?",
        "options": [
          "Halo",
          "Selamat pagi",
          "Sampai jumpa (informal)",
          "Terima kasih"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Lengkapi kalimat: 'Das ist ___ Apfel.'",
        "options": [
          "die",
          "das",
          "der",
          "ein"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa jawaban yang tepat untuk 'Wie geht es Ihnen?' jika kabar baik?",
        "options": [
          "Mir geht es schlecht",
          "Mir geht es gut",
          "Nein",
          "Danke"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Berapa 'fünfzig'?",
        "options": [
          "5",
          "15",
          "50",
          "100"
        ],
        "correctAnswer": 2
      }
    ],
    "reviewLessons": [
      "a1-1",
      "a1-2",
      "a1-3"
    ]
  },
  {
    "id": "a1-4",
    "canDoGoals": [
      "Menyebutkan nama-nama hari (Montag, Dienstag...)",
      "Menyebutkan nama-nama bulan dalam bahasa Jerman",
      "Mendeskripsikan warna benda (Farben)",
      "Mampu merespons pertanyaan dengan 'Wann?' (Kapan?)"
    ],
    "level": "A1",
    "title": "Warna, Hari, Bulan",
    "grammarDescription": "Pelajaran ini memperkenalkan kosakata untuk warna, hari dalam seminggu, dan bulan dalam setahun. Warna biasanya berfungsi sebagai kata sifat dan diletakkan sebelum kata benda yang dijelaskan. Hari dan bulan adalah kata benda dan selalu diawali dengan huruf kapital. Hari dalam seminggu umumnya maskulin (der), sedangkan bulan juga maskulin (der).",
    "sentenceBreakdowns": [
      "Der (artikel maskulin) + Himmel (kata benda maskulin) + ist (verb 'sein') + blau (kata sifat).",
      "Heute (adverb waktu) + ist (verb 'sein') + Montag (kata benda hari).",
      "Im (preposisi + artikel) + Januar (kata benda bulan) + ist (verb 'sein') + es (subjek) + kalt (kata sifat)."
    ],
    "pronunciationTips": [
      "Vokal 'ä' diucapkan seperti 'e' dalam 'meja' (misal: 'Mädchen').",
      "Vokal 'ö' diucapkan seperti 'eu' dalam 'deux' (Prancis) atau 'o' yang dibulatkan (misal: 'schön').",
      "Vokal 'ü' diucapkan seperti 'u' dalam 'tu' (Prancis) atau 'u' yang dibulatkan (misal: 'fünf')."
    ],
    "vocabulary": [
      {
        "id": "v-gen-52",
        "word": "rot",
        "translation": "merah",
        "exampleSentence": "Der Apfel ist rot.",
        "phonetic": "ROHT",
        "level": "A1"
      },
      {
        "id": "v-gen-53",
        "word": "blau",
        "translation": "biru",
        "exampleSentence": "Der Himmel ist blau.",
        "phonetic": "BLAU",
        "level": "A1"
      },
      {
        "id": "v-gen-54",
        "word": "grün",
        "translation": "hijau",
        "exampleSentence": "Das Gras ist grün.",
        "phonetic": "GRÜN",
        "level": "A1"
      },
      {
        "id": "v-gen-55",
        "word": "gelb",
        "translation": "kuning",
        "exampleSentence": "Die Sonne ist gelb.",
        "phonetic": "GELP",
        "level": "A1"
      },
      {
        "id": "v-gen-56",
        "word": "schwarz",
        "translation": "hitam",
        "exampleSentence": "Die Katze ist schwarz.",
        "phonetic": "SHVARTS",
        "level": "A1"
      },
      {
        "id": "v-gen-57",
        "word": "weiß",
        "translation": "putih",
        "exampleSentence": "Der Schnee ist weiß.",
        "phonetic": "VAIS",
        "level": "A1"
      },
      {
        "id": "v-gen-58",
        "word": "der Montag",
        "translation": "Senin",
        "article": "der",
        "exampleSentence": "Am Montag habe ich Deutschkurs.",
        "phonetic": "der MON-tak",
        "level": "A1"
      },
      {
        "id": "v-gen-59",
        "word": "der Dienstag",
        "translation": "Selasa",
        "article": "der",
        "exampleSentence": "Der Dienstag ist mein freier Tag.",
        "phonetic": "der DEENS-tak",
        "level": "A1"
      },
      {
        "id": "v-gen-60",
        "word": "der Mittwoch",
        "translation": "Rabu",
        "article": "der",
        "exampleSentence": "Wir treffen uns am Mittwoch.",
        "phonetic": "der MIT-vokh",
        "level": "A1"
      },
      {
        "id": "v-gen-61",
        "word": "der Donnerstag",
        "translation": "Kamis",
        "article": "der",
        "exampleSentence": "Donnerstag ist mein Lieblingstag.",
        "phonetic": "der DON-ners-tak",
        "level": "A1"
      },
      {
        "id": "v-gen-62",
        "word": "der Freitag",
        "translation": "Jumat",
        "article": "der",
        "exampleSentence": "Am Freitag gehen wir ins Kino.",
        "phonetic": "der FRAI-tak",
        "level": "A1"
      },
      {
        "id": "v-gen-63",
        "word": "der Samstag",
        "translation": "Sabtu",
        "article": "der",
        "exampleSentence": "Samstag ist Wochenende.",
        "phonetic": "der ZAM-stak",
        "level": "A1"
      },
      {
        "id": "v-gen-64",
        "word": "der Sonntag",
        "translation": "Minggu",
        "article": "der",
        "exampleSentence": "Sonntag ist Ruhetag.",
        "phonetic": "der ZON-tak",
        "level": "A1"
      },
      {
        "id": "v-gen-65",
        "word": "der Januar",
        "translation": "Januari",
        "article": "der",
        "exampleSentence": "Im Januar ist es kalt.",
        "phonetic": "der YAN-oo-ar",
        "level": "A1"
      },
      {
        "id": "v-gen-66",
        "word": "der Februar",
        "translation": "Februari",
        "article": "der",
        "exampleSentence": "Der Februar hat 28 Tage.",
        "phonetic": "der FEB-roo-ar",
        "level": "A1"
      },
      {
        "id": "v-gen-67",
        "word": "der März",
        "translation": "Maret",
        "article": "der",
        "exampleSentence": "Im März beginnt der Frühling.",
        "phonetic": "der MERTS",
        "level": "A1"
      },
      {
        "id": "v-gen-68",
        "word": "der April",
        "translation": "April",
        "article": "der",
        "exampleSentence": "April, April, der macht was er will.",
        "phonetic": "der A-pril",
        "level": "A1"
      },
      {
        "id": "v-gen-69",
        "word": "der Mai",
        "translation": "Mei",
        "article": "der",
        "exampleSentence": "Der Mai ist ein schöner Monat.",
        "phonetic": "der MAI",
        "level": "A1"
      },
      {
        "id": "v-gen-70",
        "word": "der Juni",
        "translation": "Juni",
        "article": "der",
        "exampleSentence": "Im Juni ist es warm.",
        "phonetic": "der YOO-nee",
        "level": "A1"
      },
      {
        "id": "v-gen-71",
        "word": "der Juli",
        "translation": "Juli",
        "article": "der",
        "exampleSentence": "Der Juli ist oft sehr heiß.",
        "phonetic": "der YOO-lee",
        "level": "A1"
      },
      {
        "id": "v-gen-72",
        "word": "der August",
        "translation": "Agustus",
        "article": "der",
        "exampleSentence": "Im August fahren viele in den Urlaub.",
        "phonetic": "der AU-goost",
        "level": "A1"
      },
      {
        "id": "v-gen-73",
        "word": "der September",
        "translation": "September",
        "article": "der",
        "exampleSentence": "Der September ist der Monat der Ernte.",
        "phonetic": "der zep-TEM-ber",
        "level": "A1"
      },
      {
        "id": "v-gen-74",
        "word": "der Oktober",
        "translation": "Oktober",
        "article": "der",
        "exampleSentence": "Im Oktober ist Oktoberfest.",
        "phonetic": "der ok-TO-ber",
        "level": "A1"
      },
      {
        "id": "v-gen-75",
        "word": "der November",
        "translation": "November",
        "article": "der",
        "exampleSentence": "Der November ist oft grau.",
        "phonetic": "der no-VEM-ber",
        "level": "A1"
      },
      {
        "id": "v-gen-76",
        "word": "der Dezember",
        "translation": "Desember",
        "article": "der",
        "exampleSentence": "Im Dezember feiern wir Weihnachten.",
        "phonetic": "der de-TSEM-ber",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Warna apa yang melambangkan langit?",
        "options": [
          "rot",
          "grün",
          "blau",
          "gelb"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Hari apa setelah Dienstag?",
        "options": [
          "Montag",
          "Mittwoch",
          "Donnerstag",
          "Freitag"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Bulan apa yang datang setelah Juni?",
        "options": [
          "Mai",
          "Juli",
          "August",
          "September"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Das Auto ist ___.' (merah)",
        "options": [
          "blau",
          "grün",
          "rot",
          "schwarz"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Lengkapi kalimat: 'Am ___ habe ich frei.' (Sabtu)",
        "options": [
          "Montag",
          "Dienstag",
          "Samstag",
          "Sonntag"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Warna apa yang sering dikaitkan dengan rumput?",
        "options": [
          "weiß",
          "schwarz",
          "grün",
          "gelb"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Bulan apa yang merupakan bulan pertama dalam setahun?",
        "options": [
          "Februar",
          "März",
          "Januar",
          "Dezember"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Hari apa yang biasanya menjadi hari libur di akhir pekan?",
        "options": [
          "Montag",
          "Mittwoch",
          "Freitag",
          "Sonntag"
        ],
        "correctAnswer": 3
      }
    ],
    "dialogues": [
      {
        "personA": "Welche Farbe hat dein Auto?",
        "personB": "Mein Auto ist schwarz.",
        "translation": "A: Mobilmu warna apa?\nB: Mobil saya hitam."
      },
      {
        "personA": "Wann hast du Deutschkurs?",
        "personB": "Ich habe Deutschkurs am Dienstag und Donnerstag.",
        "translation": "A: Kapan kamu ada kursus bahasa Jerman?\nB: Saya ada kursus bahasa Jerman pada hari Selasa dan Kamis."
      },
      {
        "personA": "Wann ist dein Geburtstag?",
        "personB": "Mein Geburtstag ist im Mai.",
        "translation": "A: Kapan ulang tahunmu?\nB: Ulang tahun saya di bulan Mei."
      }
    ],
    "culturalNotes": "Di Jerman, hari Minggu (Sonntag) adalah hari istirahat. Sebagian besar toko tutup, dan banyak orang menghabiskan waktu bersama keluarga atau di alam. Bulan Oktober terkenal dengan Oktoberfest di Munich, festival bir terbesar di dunia. Nama-nama hari dan bulan selalu diawali dengan huruf kapital karena mereka adalah kata benda."
  },
  {
    "id": "a1-5",
    "canDoGoals": [
      "Membedakan Kata Ganti Orang (Personalpronomen) untuk subjek (ich, du, er, sie, es, wir, ihr, sie, Sie)",
      "Mampu menyebutkan orang ketiga (menunjuk orang lain)",
      "Mengerti kapan menggunakan 'Ihr' vs 'Sie'"
    ],
    "level": "A1",
    "title": "Kata Ganti Orang (ich, du, er, sie, wir...)",
    "grammarDescription": "Kata ganti orang (Personalpronomen) menggantikan kata benda dan sangat penting untuk membentuk kalimat. Dalam bahasa Jerman, kata ganti orang berubah bentuk tergantung pada kasusnya (nominatif, akusatif, datif, genitif). Untuk level A1, kita akan fokus pada kasus nominatif, yang digunakan sebagai subjek kalimat. Penting untuk memahami perbedaan antara 'du' (informal tunggal), 'ihr' (informal jamak), 'sie' (formal tunggal/jamak, atau 'mereka' informal jamak).",
    "sentenceBreakdowns": [
      "Ich (kata ganti orang) + spreche (verb) + Deutsch (objek).",
      "Du (kata ganti orang) + lernst (verb) + schnell (kata sifat).",
      "Wir (kata ganti orang) + wohnen (verb) + in Berlin (keterangan tempat)."
    ],
    "pronunciationTips": [
      "Kombinasi 'sp' di awal kata diucapkan seperti 'shp' (misal: 'sprechen' seperti 'shpre-khen').",
      "Kombinasi 'st' di awal kata diucapkan seperti 'sht' (misal: 'stehen' seperti 'shte-hen').",
      "Huruf 'z' diucapkan seperti 'ts' (misal: 'tanzen')."
    ],
    "vocabulary": [
      {
        "id": "v-gen-77",
        "word": "ich",
        "translation": "saya",
        "exampleSentence": "Ich bin Student.",
        "phonetic": "IKH",
        "level": "A1"
      },
      {
        "id": "v-gen-78",
        "word": "du",
        "translation": "kamu (informal, tunggal)",
        "exampleSentence": "Du sprichst gut Deutsch.",
        "phonetic": "DOO",
        "level": "A1"
      },
      {
        "id": "v-gen-79",
        "word": "er",
        "translation": "dia (laki-laki)",
        "exampleSentence": "Er kommt aus Deutschland.",
        "phonetic": "ER",
        "level": "A1"
      },
      {
        "id": "v-gen-80",
        "word": "sie",
        "translation": "dia (perempuan) / mereka",
        "exampleSentence": "Sie ist Lehrerin. Sie lernen Deutsch.",
        "phonetic": "ZEE",
        "level": "A1"
      },
      {
        "id": "v-gen-81",
        "word": "es",
        "translation": "itu (netral)",
        "exampleSentence": "Es ist ein Buch.",
        "phonetic": "ES",
        "level": "A1"
      },
      {
        "id": "v-gen-82",
        "word": "wir",
        "translation": "kami/kita",
        "exampleSentence": "Wir gehen zusammen.",
        "phonetic": "VEER",
        "level": "A1"
      },
      {
        "id": "v-gen-83",
        "word": "ihr",
        "translation": "kalian (informal, jamak)",
        "exampleSentence": "Ihr seid Freunde.",
        "phonetic": "EER",
        "level": "A1"
      },
      {
        "id": "v-gen-84",
        "word": "Sie",
        "translation": "Anda (formal, tunggal/jamak)",
        "exampleSentence": "Sprechen Sie Englisch?",
        "phonetic": "ZEE",
        "level": "A1"
      },
      {
        "id": "v-gen-85",
        "word": "sprechen",
        "translation": "berbicara",
        "exampleSentence": "Ich spreche Deutsch.",
        "phonetic": "SHPRE-khen",
        "level": "A1"
      },
      {
        "id": "v-gen-86",
        "word": "lernen",
        "translation": "belajar",
        "exampleSentence": "Wir lernen Deutsch.",
        "phonetic": "LER-nen",
        "level": "A1"
      },
      {
        "id": "v-gen-87",
        "word": "verstehen",
        "translation": "mengerti",
        "exampleSentence": "Ich verstehe Sie nicht.",
        "phonetic": "fer-SHTE-hen",
        "level": "A1"
      },
      {
        "id": "v-gen-88",
        "word": "kommen",
        "translation": "datang",
        "exampleSentence": "Woher kommen Sie?",
        "phonetic": "KOM-men",
        "level": "A1"
      },
      {
        "id": "v-gen-89",
        "word": "gehen",
        "translation": "pergi",
        "exampleSentence": "Wir gehen nach Hause.",
        "phonetic": "GE-hen",
        "level": "A1"
      },
      {
        "id": "v-gen-90",
        "word": "wohnen",
        "translation": "tinggal",
        "exampleSentence": "Ich wohne in Jakarta.",
        "phonetic": "VO-nen",
        "level": "A1"
      },
      {
        "id": "v-gen-91",
        "word": "arbeiten",
        "translation": "bekerja",
        "exampleSentence": "Er arbeitet als Arzt.",
        "phonetic": "AR-bai-ten",
        "level": "A1"
      },
      {
        "id": "v-gen-92",
        "word": "lesen",
        "translation": "membaca",
        "exampleSentence": "Sie liest ein Buch.",
        "phonetic": "LE-zen",
        "level": "A1"
      },
      {
        "id": "v-gen-93",
        "word": "schreiben",
        "translation": "menulis",
        "exampleSentence": "Ich schreibe einen Brief.",
        "phonetic": "SHRAI-ben",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: '___ bin Student.'",
        "options": [
          "Du",
          "Er",
          "Ich",
          "Sie"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih kata ganti yang tepat untuk 'mereka':",
        "options": [
          "er",
          "sie",
          "es",
          "ihr"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Jika Anda berbicara kepada dua teman secara informal, kata ganti apa yang Anda gunakan?",
        "options": [
          "du",
          "Sie",
          "ihr",
          "wir"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Lengkapi kalimat: 'Woher ___ Sie?'",
        "options": [
          "komme",
          "kommt",
          "kommen",
          "kommst"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa arti 'verstehen'?",
        "options": [
          "berbicara",
          "belajar",
          "mengerti",
          "pergi"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Kata ganti apa yang digunakan untuk 'dia (laki-laki)'?",
        "options": [
          "sie",
          "es",
          "er",
          "du"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Lengkapi kalimat: '___ wohnen in Berlin.'",
        "options": [
          "Ich",
          "Du",
          "Wir",
          "Er"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Jika Anda berbicara kepada atasan Anda, kata ganti apa yang Anda gunakan?",
        "options": [
          "du",
          "ihr",
          "Sie",
          "er"
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Woher kommst du?",
        "personB": "Ich komme aus Indonesien.",
        "translation": "A: Kamu berasal dari mana?\nB: Saya berasal dari Indonesia."
      },
      {
        "personA": "Sprechen Sie Deutsch?",
        "personB": "Ja, ich spreche ein bisschen Deutsch.",
        "translation": "A: Apakah Anda berbicara bahasa Jerman?\nB: Ya, saya berbicara sedikit bahasa Jerman."
      },
      {
        "personA": "Was macht ihr am Wochenende?",
        "personB": "Wir gehen ins Kino.",
        "translation": "A: Apa yang kalian lakukan di akhir pekan?\nB: Kami pergi ke bioskop."
      }
    ],
    "culturalNotes": "Perbedaan antara 'du' dan 'Sie' sangat penting dalam budaya berbahasa Jerman. 'Du' digunakan untuk teman, keluarga, anak-anak, dan orang yang lebih muda. 'Sie' digunakan untuk orang yang tidak dikenal, atasan, guru, atau dalam situasi formal. Menggunakan 'du' kepada seseorang yang seharusnya disapa dengan 'Sie' dapat dianggap tidak sopan. Proses beralih dari 'Sie' ke 'du' (disebut 'Duzis') biasanya diinisiasi oleh orang yang lebih tua atau berkedudukan lebih tinggi."
  },
  {
    "id": "a1-6",
    "level": "A1",
    "title": "Konjugasi sein & haben",
    "grammarDescription": "Kata kerja 'sein' (to be) dan 'haben' (to have) adalah dua kata kerja paling penting dan paling sering digunakan dalam bahasa Jerman. Keduanya adalah kata kerja tidak beraturan, yang berarti konjugasinya tidak mengikuti pola standar dan harus dihafal. 'Sein' digunakan untuk menyatakan identitas, kondisi, lokasi, dan umur. 'Haben' digunakan untuk menyatakan kepemilikan. Keduanya juga berfungsi sebagai kata kerja bantu untuk membentuk kala lampau (Perfekt), yang akan dipelajari di level selanjutnya.",
    "canDoGoals": [
      "Melakukan konjugasi kata kerja 'sein' (adalah) di waktu sekarang",
      "Melakukan konjugasi kata kerja 'haben' (memiliki) di waktu sekarang",
      "Membentuk kalimat deskripsi sederhana diri dan kepemilikan"
    ],
    "indonesianMistakes": "**1. Umur dan Lapar: Sein vs Haben**\nBahasa Indonesia agak rancu tentang verb. Bahasa Jerman sangat jelas: Anda *menjadi* (sein) umur, tapi Anda *memiliki* (haben) rasa lapar.\n\n❌ *Ich habe 20 Jahre alt.* (Saya memiliki 20 tahun - SALAH)\n✅ **Ich bin 20 Jahre alt.** (Saya berumur 20 tahun - BENAR)\n\n❌ *Ich bin Hunger.* (Artinya: Saya adalah sosok kelaparan itu sendiri - SALAH)\n✅ **Ich habe Hunger.** (Saya memiliki rasa lapar - BENAR)\nBegitu juga dengan haus: **Ich habe Durst**.",
    "listeningSimulation": {
      "transcript": [
        {
          "personA": "Wie alt bist du?",
          "personB": "Ich bin zwanzig Jahre alt. Und du?",
          "translation": "A: Berapa umurmu? | B: Saya berumur dua puluh tahun. Dan kamu?"
        },
        {
          "personA": "Ich bin zweiundzwanzig. Hast du Hunger?",
          "personB": "Ja, ich habe großen Hunger!",
          "translation": "A: Saya berumur 22. Apakah kamu lapar? | B: Ya, saya sangat lapar!"
        }
      ],
      "questions": [
        {
          "question": "Kata kerja apa yang digunakan untuk menyatakan lapar?",
          "options": ["sein", "haben"],
          "correctAnswer": 1
        }
      ]
    },
    "sentenceBreakdowns": [
      "Ich (subjek) + bin (konjugasi 'sein') + müde (kata sifat).",
      "Er (subjek) + hat (konjugasi 'haben') + ein (artikel tak tentu) + Buch (kata benda).",
      "Wir (subjek) + sind (konjugasi 'sein') + in Berlin (keterangan tempat)."
    ],
    "pronunciationTips": [
      "Vokal ganda 'ei' diucapkan seperti 'ai' dalam 'pantai' (misal: 'sein').",
      "Vokal ganda 'ie' diucapkan seperti 'i' panjang dalam 'kopi' (misal: 'sie').",
      "Huruf 'h' di tengah kata setelah vokal biasanya tidak diucapkan, hanya memanjangkan vokal sebelumnya (misal: 'haben')."
    ],
    "vocabulary": [
      {
        "id": "v-gen-94",
        "word": "sein",
        "translation": "adalah/berada",
        "exampleSentence": "Ich bin Student.",
        "phonetic": "ZAIN",
        "level": "A1"
      },
      {
        "id": "v-gen-95",
        "word": "haben",
        "translation": "memiliki",
        "exampleSentence": "Ich habe ein Auto.",
        "phonetic": "HA-ben",
        "level": "A1"
      },
      {
        "id": "v-gen-96",
        "word": "bin",
        "translation": "adalah (ich)",
        "exampleSentence": "Ich bin glücklich.",
        "phonetic": "BIN",
        "level": "A1"
      },
      {
        "id": "v-gen-97",
        "word": "bist",
        "translation": "adalah (du)",
        "exampleSentence": "Du bist nett.",
        "phonetic": "BIST",
        "level": "A1"
      },
      {
        "id": "v-gen-98",
        "word": "ist",
        "translation": "adalah (er/sie/es)",
        "exampleSentence": "Er ist Arzt.",
        "phonetic": "IST",
        "level": "A1"
      },
      {
        "id": "v-gen-99",
        "word": "sind",
        "translation": "adalah (wir/sie/Sie)",
        "exampleSentence": "Wir sind Freunde.",
        "phonetic": "ZINT",
        "level": "A1"
      },
      {
        "id": "v-gen-100",
        "word": "seid",
        "translation": "adalah (ihr)",
        "exampleSentence": "Ihr seid müde.",
        "phonetic": "ZAIT",
        "level": "A1"
      },
      {
        "id": "v-gen-101",
        "word": "habe",
        "translation": "memiliki (ich)",
        "exampleSentence": "Ich habe Hunger.",
        "phonetic": "HA-be",
        "level": "A1"
      },
      {
        "id": "v-gen-102",
        "word": "hast",
        "translation": "memiliki (du)",
        "exampleSentence": "Hast du Zeit?",
        "phonetic": "HAST",
        "level": "A1"
      },
      {
        "id": "v-gen-103",
        "word": "hat",
        "translation": "memiliki (er/sie/es)",
        "exampleSentence": "Sie hat Durst.",
        "phonetic": "HAT",
        "level": "A1"
      },
      {
        "id": "v-gen-104",
        "word": "haben",
        "translation": "memiliki (wir/sie/Sie)",
        "exampleSentence": "Wir haben ein Problem.",
        "phonetic": "HA-ben",
        "level": "A1"
      },
      {
        "id": "v-gen-105",
        "word": "müde",
        "translation": "lelah",
        "exampleSentence": "Ich bin müde.",
        "phonetic": "MÜ-de",
        "level": "A1"
      },
      {
        "id": "v-gen-106",
        "word": "der Hunger",
        "translation": "lapar",
        "article": "der",
        "exampleSentence": "Ich habe Hunger.",
        "phonetic": "der HOONG-er",
        "level": "A1"
      },
      {
        "id": "v-gen-107",
        "word": "der Durst",
        "translation": "haus",
        "article": "der",
        "exampleSentence": "Hast du Durst?",
        "phonetic": "der DURST",
        "level": "A1"
      },
      {
        "id": "v-gen-108",
        "word": "die Zeit",
        "translation": "waktu",
        "article": "die",
        "exampleSentence": "Ich habe keine Zeit.",
        "phonetic": "dee TSAIT",
        "level": "A1"
      },
      {
        "id": "v-gen-109",
        "word": "das Geld",
        "translation": "uang",
        "article": "das",
        "exampleSentence": "Hast du Geld?",
        "phonetic": "das GELT",
        "level": "A1"
      },
      {
        "id": "v-gen-110",
        "word": "der Freund",
        "translation": "teman (laki-laki)",
        "article": "der",
        "exampleSentence": "Er ist mein Freund.",
        "phonetic": "der FROINT",
        "level": "A1"
      },
      {
        "id": "v-gen-111",
        "word": "die Freundin",
        "translation": "teman (perempuan)",
        "article": "die",
        "exampleSentence": "Sie ist meine Freundin.",
        "phonetic": "dee FROIN-din",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: 'Ich ___ Student.'",
        "options": [
          "habe",
          "bin",
          "ist",
          "sind"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Er ___ ein Auto.'",
        "options": [
          "bin",
          "ist",
          "hat",
          "habe"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih konjugasi 'sein' yang benar untuk 'wir':",
        "options": [
          "bin",
          "bist",
          "ist",
          "sind"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Pilih konjugasi 'haben' yang benar untuk 'du':",
        "options": [
          "habe",
          "hast",
          "hat",
          "haben"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Ihr ___ müde.'",
        "options": [
          "bin",
          "seid",
          "sind",
          "ist"
        ],
        "correctAnswer": 1
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa konjugasi 'sein' untuk 'sie' (dia perempuan)?",
        "options": [
          "bin",
          "bist",
          "ist",
          "sind"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa konjugasi 'haben' untuk 'ich'?",
        "options": [
          "habe",
          "hast",
          "hat",
          "haben"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat: 'Sie (formal) ___ viel Geld.'",
        "options": [
          "hat",
          "haben",
          "hast",
          "habe"
        ],
        "correctAnswer": 1
      }
    ],
    "dialogues": [
      {
        "personA": "Bist du müde?",
        "personB": "Ja, ich bin sehr müde.",
        "translation": "A: Apakah kamu lelah?\nB: Ya, saya sangat lelah."
      },
      {
        "personA": "Hast du Hunger?",
        "personB": "Nein, ich habe keinen Hunger, aber ich habe Durst.",
        "translation": "A: Apakah kamu lapar?\nB: Tidak, saya tidak lapar, tapi saya haus."
      },
      {
        "personA": "Wir sind in Berlin. Wo seid ihr?",
        "personB": "Wir sind auch in Berlin!",
        "translation": "A: Kami di Berlin. Di mana kalian?\nB: Kami juga di Berlin!"
      }
    ],
    "culturalNotes": "Dalam bahasa Jerman, untuk menyatakan rasa lapar atau haus, kita menggunakan 'Ich habe Hunger' (Saya punya lapar) atau 'Ich habe Durst' (Saya punya haus), bukan 'Ich bin hungrig' atau 'Ich bin durstig' (meskipun ini juga benar, frasa dengan 'haben' lebih umum). Ini adalah perbedaan penting dari bahasa Inggris ('I am hungry')."
  },
  {
    "id": "a1-checkpoint-2",
    "canDoGoals": [
      "Mengevaluasi penguasaan kata ganti orang",
      "Menguji konjugasi kata kerja dasar (sein & haben)",
      "Mengevaluasi memori nama-nama hari, bulan, dan warna"
    ],
    "title": "Review Konten Sebelumnya",
    "requiredScore": 0.7,
    "questions": [
      {
        "question": "Warna apa yang sering dikaitkan dengan matahari?",
        "options": [
          "rot",
          "blau",
          "gelb",
          "grün"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Hari apa sebelum Freitag?",
        "options": [
          "Mittwoch",
          "Donnerstag",
          "Samstag",
          "Sonntag"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Bulan apa yang datang setelah September?",
        "options": [
          "August",
          "Oktober",
          "November",
          "Dezember"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: '___ ist Lehrerin.'",
        "options": [
          "Ich",
          "Du",
          "Er",
          "Sie"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Jika Anda berbicara kepada sekelompok orang secara informal, kata ganti apa yang Anda gunakan?",
        "options": [
          "du",
          "Sie",
          "ihr",
          "wir"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Lengkapi kalimat: 'Ich ___ einen Hund.'",
        "options": [
          "bin",
          "ist",
          "habe",
          "hat"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih konjugasi 'sein' yang benar untuk 'du':",
        "options": [
          "bin",
          "bist",
          "ist",
          "sind"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa arti 'lernen'?",
        "options": [
          "bekerja",
          "belajar",
          "mengerti",
          "pergi"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Wir ___ Freunde.'",
        "options": [
          "bin",
          "bist",
          "ist",
          "sind"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Apa konjugasi 'haben' untuk 'er'?",
        "options": [
          "habe",
          "hast",
          "hat",
          "haben"
        ],
        "correctAnswer": 2
      }
    ],
    "reviewLessons": [
      "a1-4",
      "a1-5",
      "a1-6"
    ]
  },
  {
    "id": "a1-7",
    "level": "A1",
    "title": "Kalimat Sederhana (Subjek + Verb + Objek)",
    "grammarDescription": "Dalam bahasa Jerman, struktur kalimat dasar adalah Subjek + Verb + Objek (SVO), mirip dengan bahasa Indonesia. Namun, ada aturan penting yang disebut 'Verb-Zweit-Stellung' (aturan kata kerja kedua), yang berarti kata kerja yang dikonjugasikan selalu berada di posisi kedua dalam kalimat deklaratif. Objek dalam kalimat ini akan sering berada dalam kasus Akkusativ, yang merupakan kasus untuk objek langsung. Artikel maskulin berubah dari 'der' menjadi 'den' di Akkusativ, sedangkan 'die' dan 'das' tetap.",
    "canDoGoals": [
      "Menyusun kalimat pernyataan sederhana (Aussagesätze)",
      "Menyusun kalimat pertanyaan dengan kata tanya (W-Fragen)",
      "Menyusun kalimat interogatif sederhana (Ja/Nein-Fragen)",
      "Menempatkan struktur kata kerja pada posisi kedua (Position 2)"
    ],
    "indonesianMistakes": "**Aturan Harga Mati: Verb POSISI KEDUA**\nIni adalah kesalahan paling klasik orang Indonesia! Di bahasa Indonesia, kita bisa menggeser-geser kata suka-suka (*Hari ini saya makan roti* / *Saya makan roti hari ini*).\nDi Jerman, *verb* yang dikonjugasikan adalah RAJA yang tak bisa digeser dari TAHTA KEDUA.\n\n❌ *Heute ich **trinke** Wasser* (Subjek - Kata - Verb = Verb posisi ke-3 = SALAH!)\n✅ **Heute trinke ich Wasser** (Keterangan - Verb - Subjek = Verb posisi ke-2 = BENAR!).\n✅ **Ich trinke heute Wasser** (Subjek - Verb = Verb posisi ke-2 = BENAR!).\nYang dihitung adalah 'blok makna', bukan jumlah kata. 'Heute' dihitung sebagai satu blok.",
    "listeningSimulation": {
      "transcript": [
        {
          "personA": "Was isst du heute?",
          "personB": "Heute esse ich einen Apfel. Und du?",
          "translation": "A: Apa yang kamu makan hari ini? | B: Hari ini aku makan apel. Dan kamu?"
        },
        {
          "personA": "Ich esse eine Pizza.",
          "personB": "Oh, lecker!",
          "translation": "A: Aku makan pizza. | B: Oh, enak!"
        }
      ],
      "questions": [
        {
          "question": "Mengapa kalimat person B berkata 'Heute esse ich', bukannya 'Heute ich esse'?",
          "options": ["Karena ia bertanya", "Karena aturan Verb harus ada di posisi ke-2", "Karena Apel adalah maskulin"],
          "correctAnswer": 1
        }
      ]
    },    "sentenceBreakdowns": [
      "Ich (subjek) + trinke (verb) + Wasser (objek Akkusativ).",
      "Du (subjek) + liest (verb) + ein (artikel tak tentu Akkusativ) + Buch (objek Akkusativ).",
      "Er (subjek) + isst (verb) + den (artikel Akkusativ maskulin) + Apfel (kata benda maskulin)."
    ],
    "pronunciationTips": [
      "Kombinasi 'pf' diucapkan seperti 'p' dan 'f' yang digabungkan (misal: 'Apfel').",
      "Kombinasi 'tz' diucapkan seperti 'ts' yang tajam (misal: 'Katze').",
      "Huruf 'r' di akhir kata atau suku kata sering diucapkan sebagai suara vokal ringan, mirip 'a' atau 'er' (misal: 'Wasser')."
    ],
    "vocabulary": [
      {
        "id": "v-gen-112",
        "word": "essen",
        "translation": "makan",
        "exampleSentence": "Ich esse einen Apfel.",
        "phonetic": "ES-sen",
        "level": "A1"
      },
      {
        "id": "v-gen-113",
        "word": "trinken",
        "translation": "minum",
        "exampleSentence": "Wir trinken Wasser.",
        "phonetic": "TRIN-ken",
        "level": "A1"
      },
      {
        "id": "v-gen-114",
        "word": "lesen",
        "translation": "membaca",
        "exampleSentence": "Sie liest ein Buch.",
        "phonetic": "LE-zen",
        "level": "A1"
      },
      {
        "id": "v-gen-115",
        "word": "schreiben",
        "translation": "menulis",
        "exampleSentence": "Ich schreibe einen Brief.",
        "phonetic": "SHRAI-ben",
        "level": "A1"
      },
      {
        "id": "v-gen-116",
        "word": "kaufen",
        "translation": "membeli",
        "exampleSentence": "Er kauft ein Auto.",
        "phonetic": "KAU-fen",
        "level": "A1"
      },
      {
        "id": "v-gen-117",
        "word": "sehen",
        "translation": "melihat",
        "exampleSentence": "Ich sehe den Film.",
        "phonetic": "ZE-hen",
        "level": "A1"
      },
      {
        "id": "v-gen-118",
        "word": "hören",
        "translation": "mendengar",
        "exampleSentence": "Wir hören Musik.",
        "phonetic": "HÖ-ren",
        "level": "A1"
      },
      {
        "id": "v-gen-119",
        "word": "mögen",
        "translation": "menyukai",
        "exampleSentence": "Ich mag Kaffee.",
        "phonetic": "MÖ-gen",
        "level": "A1"
      },
      {
        "id": "v-gen-120",
        "word": "machen",
        "translation": "melakukan/membuat",
        "exampleSentence": "Was machst du?",
        "phonetic": "MA-khen",
        "level": "A1"
      },
      {
        "id": "v-gen-121",
        "word": "spielen",
        "translation": "bermain",
        "exampleSentence": "Die Kinder spielen im Garten.",
        "phonetic": "SHPEE-len",
        "level": "A1"
      },
      {
        "id": "v-gen-122",
        "word": "die Musik",
        "translation": "musik",
        "article": "die",
        "exampleSentence": "Ich höre gerne Musik.",
        "phonetic": "dee moo-ZIK",
        "level": "A1"
      },
      {
        "id": "v-gen-123",
        "word": "der Film",
        "translation": "film",
        "article": "der",
        "exampleSentence": "Wir sehen einen Film.",
        "phonetic": "der FILM",
        "level": "A1"
      },
      {
        "id": "v-gen-124",
        "word": "das Essen",
        "translation": "makanan",
        "article": "das",
        "exampleSentence": "Das Essen ist lecker.",
        "phonetic": "das ES-sen",
        "level": "A1"
      },
      {
        "id": "v-gen-125",
        "word": "das Getränk",
        "translation": "minuman",
        "article": "das",
        "exampleSentence": "Was ist dein Lieblingsgetränk?",
        "phonetic": "das ge-TRENK",
        "level": "A1"
      },
      {
        "id": "v-gen-126",
        "word": "der Brief",
        "translation": "surat",
        "article": "der",
        "exampleSentence": "Ich schreibe einen Brief.",
        "phonetic": "der BRIEF",
        "level": "A1"
      },
      {
        "id": "v-gen-127",
        "word": "die Zeitung",
        "translation": "koran",
        "article": "die",
        "exampleSentence": "Er liest die Zeitung.",
        "phonetic": "dee TSAI-toong",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: 'Ich ___ einen Apfel.'",
        "options": [
          "trinke",
          "esse",
          "lese",
          "kaufe"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Pilih kalimat dengan struktur SVO yang benar:",
        "options": [
          "Buch ich lese.",
          "Lese ich ein Buch.",
          "Ich lese ein Buch.",
          "Ein Buch ich lese."
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa bentuk Akkusativ dari 'der Film'?",
        "options": [
          "der Film",
          "die Film",
          "das Film",
          "den Film"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Lengkapi kalimat: 'Wir ___ Musik.'",
        "options": [
          "sehen",
          "essen",
          "hören",
          "trinken"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa arti 'kaufen'?",
        "options": [
          "menjual",
          "membeli",
          "membuat",
          "melihat"
        ],
        "correctAnswer": 1
      }
    ],
    "miniQuiz": [
      {
        "question": "Lengkapi kalimat: 'Sie ___ einen Brief.'",
        "options": [
          "liest",
          "schreibt",
          "isst",
          "trinkt"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa objek Akkusativ dalam 'Ich trinke Wasser'?",
        "options": [
          "Ich",
          "trinke",
          "Wasser",
          "tidak ada"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih kalimat yang benar:",
        "options": [
          "Er mag das Kaffee.",
          "Er mag den Kaffee.",
          "Er mag die Kaffee.",
          "Er mag ein Kaffee."
        ],
        "correctAnswer": 1
      }
    ],
    "dialogues": [
      {
        "personA": "Was isst du gern?",
        "personB": "Ich esse gern Pizza.",
        "translation": "A: Kamu suka makan apa?\nB: Saya suka makan pizza."
      },
      {
        "personA": "Siehst du den Film?",
        "personB": "Ja, ich sehe den Film. Er ist sehr gut.",
        "translation": "A: Apakah kamu menonton film itu?\nB: Ya, saya menonton film itu. Filmnya sangat bagus."
      },
      {
        "personA": "Was machst du am Wochenende?",
        "personB": "Ich lese ein Buch und höre Musik.",
        "translation": "A: Apa yang kamu lakukan di akhir pekan?\nB: Saya membaca buku dan mendengarkan musik."
      }
    ],
    "culturalNotes": "Aturan 'Verb-Zweit-Stellung' (kata kerja di posisi kedua) adalah salah satu aturan fundamental dalam tata bahasa Jerman. Ini berarti bahwa dalam kalimat deklaratif, kata kerja yang dikonjugasikan selalu menempati posisi kedua, tidak peduli apa yang ada di posisi pertama (subjek, keterangan waktu, keterangan tempat, dll.). Ini membuat bahasa Jerman sangat terstruktur dan seringkali langsung dalam komunikasinya."
  },
  {
    "id": "a1-8",
    "canDoGoals": [
      "Memahami konsep preposisi tempat dasar (in, auf, an, unter)",
      "Bisa menjelaskan posisi suatu benda yang diam",
      "Menyusun kalimat lokasi menggunakan preposisi dan Dativ/Akkusativ (dasar)"
    ],
    "level": "A1",
    "title": "Preposisi Dasar (in, auf, an, unter)",
    "grammarDescription": "Preposisi adalah kata yang menunjukkan hubungan antara kata benda atau kata ganti dengan kata lain dalam kalimat, seringkali menunjukkan lokasi atau arah. Dalam bahasa Jerman, preposisi sangat penting karena mereka memengaruhi kasus kata benda atau kata ganti yang mengikutinya. Untuk A1, kita akan fokus pada preposisi lokasi yang diikuti oleh kasus Dativ (menjawab pertanyaan 'Wo?' - di mana?). Artikel berubah di Dativ: 'der' menjadi 'dem', 'die' menjadi 'der', 'das' menjadi 'dem'.",
    "sentenceBreakdowns": [
      "Das Buch (subjek) + ist (verb) + auf (preposisi) + dem (artikel Dativ) + Tisch (kata benda Dativ).",
      "Die Katze (subjek) + schläft (verb) + unter (preposisi) + dem (artikel Dativ) + Bett (kata benda Dativ).",
      "Ich (subjek) + wohne (verb) + in (preposisi) + der (artikel Dativ) + Stadt (kata benda Dativ)."
    ],
    "pronunciationTips": [
      "Kombinasi 'ng' diucapkan seperti 'ng' dalam 'sing' (misal: 'Wohnung').",
      "Kombinasi 'ck' diucapkan seperti 'k' yang tajam (misal: 'Glück').",
      "Huruf 'u' diucapkan seperti 'u' dalam 'bulan' (misal: 'unter')."
    ],
    "vocabulary": [
      {
        "id": "v-gen-128",
        "word": "in",
        "translation": "di dalam / di",
        "exampleSentence": "Ich bin in der Schule.",
        "phonetic": "IN",
        "level": "A1"
      },
      {
        "id": "v-gen-129",
        "word": "auf",
        "translation": "di atas (menyentuh permukaan)",
        "exampleSentence": "Das Buch ist auf dem Tisch.",
        "phonetic": "AUF",
        "level": "A1"
      },
      {
        "id": "v-gen-130",
        "word": "an",
        "translation": "di / di samping (menyentuh vertikal)",
        "exampleSentence": "Das Bild hängt an der Wand.",
        "phonetic": "AN",
        "level": "A1"
      },
      {
        "id": "v-gen-131",
        "word": "unter",
        "translation": "di bawah",
        "exampleSentence": "Die Katze ist unter dem Bett.",
        "phonetic": "UN-ter",
        "level": "A1"
      },
      {
        "id": "v-gen-132",
        "word": "über",
        "translation": "di atas (tidak menyentuh)",
        "exampleSentence": "Die Lampe hängt über dem Tisch.",
        "phonetic": "Ü-ber",
        "level": "A1"
      },
      {
        "id": "v-gen-133",
        "word": "neben",
        "translation": "di samping",
        "exampleSentence": "Der Stuhl steht neben dem Tisch.",
        "phonetic": "NE-ben",
        "level": "A1"
      },
      {
        "id": "v-gen-134",
        "word": "vor",
        "translation": "di depan",
        "exampleSentence": "Das Auto steht vor dem Haus.",
        "phonetic": "FOR",
        "level": "A1"
      },
      {
        "id": "v-gen-135",
        "word": "hinter",
        "translation": "di belakang",
        "exampleSentence": "Der Garten ist hinter dem Haus.",
        "phonetic": "HIN-ter",
        "level": "A1"
      },
      {
        "id": "v-gen-136",
        "word": "zwischen",
        "translation": "di antara",
        "exampleSentence": "Die Bank ist zwischen den Bäumen.",
        "phonetic": "TSVI-shen",
        "level": "A1"
      },
      {
        "id": "v-gen-137",
        "word": "der Tisch",
        "translation": "meja",
        "article": "der",
        "exampleSentence": "Das Buch ist auf dem Tisch.",
        "phonetic": "der TISH",
        "level": "A1"
      },
      {
        "id": "v-gen-138",
        "word": "der Stuhl",
        "translation": "kursi",
        "article": "der",
        "exampleSentence": "Der Stuhl steht neben dem Tisch.",
        "phonetic": "der SHTOOL",
        "level": "A1"
      },
      {
        "id": "v-gen-139",
        "word": "das Bett",
        "translation": "tempat tidur",
        "article": "das",
        "exampleSentence": "Die Katze ist unter dem Bett.",
        "phonetic": "das BET",
        "level": "A1"
      },
      {
        "id": "v-gen-140",
        "word": "die Wand",
        "translation": "dinding",
        "article": "die",
        "exampleSentence": "Das Bild hängt an der Wand.",
        "phonetic": "dee VANT",
        "level": "A1"
      },
      {
        "id": "v-gen-141",
        "word": "die Tür",
        "translation": "pintu",
        "article": "die",
        "exampleSentence": "Der Schlüssel ist in der Tür.",
        "phonetic": "dee TÜR",
        "level": "A1"
      },
      {
        "id": "v-gen-142",
        "word": "das Fenster",
        "translation": "jendela",
        "article": "das",
        "exampleSentence": "Das Fenster ist offen.",
        "phonetic": "das FEN-ster",
        "level": "A1"
      },
      {
        "id": "v-gen-143",
        "word": "die Schule",
        "translation": "sekolah",
        "article": "die",
        "exampleSentence": "Die Kinder sind in der Schule.",
        "phonetic": "dee SHOO-le",
        "level": "A1"
      },
      {
        "id": "v-gen-144",
        "word": "der Garten",
        "translation": "taman",
        "article": "der",
        "exampleSentence": "Wir spielen im Garten.",
        "phonetic": "der GAR-ten",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: 'Das Buch ist ___ dem Tisch.'",
        "options": [
          "in",
          "unter",
          "auf",
          "an"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih preposisi yang tepat untuk 'di bawah':",
        "options": [
          "in",
          "auf",
          "an",
          "unter"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Apa bentuk Dativ dari 'die Wand'?",
        "options": [
          "der Wand",
          "die Wand",
          "dem Wand",
          "den Wand"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat: 'Das Bild hängt ___ der Wand.'",
        "options": [
          "in",
          "auf",
          "an",
          "unter"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Lengkapi kalimat: 'Die Katze ist ___ dem Bett.'",
        "options": [
          "in",
          "auf",
          "an",
          "unter"
        ],
        "correctAnswer": 3
      }
    ],
    "miniQuiz": [
      {
        "question": "Preposisi apa yang berarti 'di dalam'?",
        "options": [
          "auf",
          "an",
          "in",
          "über"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Lengkapi kalimat: 'Der Stuhl steht ___ dem Tisch.'",
        "options": [
          "in",
          "auf",
          "neben",
          "unter"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa bentuk Dativ dari 'das Haus'?",
        "options": [
          "der Haus",
          "die Haus",
          "das Haus",
          "dem Haus"
        ],
        "correctAnswer": 3
      }
    ],
    "dialogues": [
      {
        "personA": "Wo ist mein Handy?",
        "personB": "Es ist auf dem Tisch.",
        "translation": "A: Di mana ponsel saya?\nB: Ada di atas meja."
      },
      {
        "personA": "Wo wohnst du?",
        "personB": "Ich wohne in der Stadt.",
        "translation": "A: Di mana kamu tinggal?\nB: Saya tinggal di kota."
      },
      {
        "personA": "Hängt das Bild an der Wand?",
        "personB": "Ja, es hängt an der Wand, neben dem Fenster.",
        "translation": "A: Apakah gambar itu tergantung di dinding?\nB: Ya, itu tergantung di dinding, di samping jendela."
      }
    ],
    "culturalNotes": "Penggunaan preposisi dalam bahasa Jerman sangat presisi dan seringkali membingungkan bagi pembelajar. Perbedaan antara 'auf' (di atas menyentuh) dan 'über' (di atas tidak menyentuh) adalah contohnya. Memahami kasus (Dativ atau Akkusativ) yang mengikuti preposisi adalah kunci. Untuk preposisi lokasi yang menjawab 'Wo?' (di mana?), selalu gunakan Dativ."
  },
  {
    "id": "a1-9",
    "canDoGoals": [
      "Menyebutkan anggota keluarga terdekat (Vater, Mutter, Geschwister)",
      "Menceritakan siapa anggota keluarga dan apa profesinya (Berufe)",
      "Menggunakan dasar Possessivartikel (mein, dein)"
    ],
    "level": "A1",
    "title": "Keluarga & Pekerjaan",
    "grammarDescription": "Pelajaran ini memperkenalkan kosakata untuk anggota keluarga dan berbagai jenis pekerjaan. Kita akan belajar bagaimana memperkenalkan anggota keluarga dan menanyakan serta menyatakan profesi seseorang. Kata benda untuk pekerjaan seringkali memiliki bentuk maskulin dan feminin (misal: 'der Lehrer' dan 'die Lehrerin'). Kata ganti posesif ('mein', 'dein', dll.) juga akan digunakan untuk menunjukkan kepemilikan dalam keluarga.",
    "sentenceBreakdowns": [
      "Das (artikel netral) + ist (verb 'sein') + meine (kata ganti posesif) + Familie (kata benda feminin).",
      "Er (subjek) + ist (verb 'sein') + Arzt (kata benda pekerjaan).",
      "Sie (subjek) + hat (verb 'haben') + zwei (angka) + Brüder (kata benda jamak)."
    ],
    "pronunciationTips": [
      "Vokal ganda 'ie' diucapkan seperti 'i' panjang (misal: 'Familie').",
      "Vokal ganda 'ei' diucapkan seperti 'ai' (misal: 'Eltern').",
      "Kombinasi 'sch' diucapkan seperti 'sy' dalam 'syarat' (misal: 'Schwester')."
    ],
    "vocabulary": [
      {
        "id": "v-gen-145",
        "word": "die Familie",
        "translation": "keluarga",
        "article": "die",
        "exampleSentence": "Meine Familie ist groß.",
        "phonetic": "dee fa-MEE-lee-e",
        "level": "A1"
      },
      {
        "id": "v-gen-146",
        "word": "der Vater",
        "translation": "ayah",
        "article": "der",
        "exampleSentence": "Mein Vater ist nett.",
        "phonetic": "der FA-ter",
        "level": "A1"
      },
      {
        "id": "v-gen-147",
        "word": "die Mutter",
        "translation": "ibu",
        "article": "die",
        "exampleSentence": "Meine Mutter kocht gut.",
        "phonetic": "dee MOO-ter",
        "level": "A1"
      },
      {
        "id": "v-gen-148",
        "word": "der Bruder",
        "translation": "saudara laki-laki",
        "article": "der",
        "exampleSentence": "Ich habe einen Bruder.",
        "phonetic": "der BROO-der",
        "level": "A1"
      },
      {
        "id": "v-gen-149",
        "word": "die Schwester",
        "translation": "saudara perempuan",
        "article": "die",
        "exampleSentence": "Meine Schwester ist älter.",
        "phonetic": "dee SHVES-ter",
        "level": "A1"
      },
      {
        "id": "v-gen-150",
        "word": "der Sohn",
        "translation": "anak laki-laki",
        "article": "der",
        "exampleSentence": "Sie hat einen Sohn.",
        "phonetic": "der ZON",
        "level": "A1"
      },
      {
        "id": "v-gen-151",
        "word": "die Tochter",
        "translation": "anak perempuan",
        "article": "die",
        "exampleSentence": "Er hat eine Tochter.",
        "phonetic": "dee TOKH-ter",
        "level": "A1"
      },
      {
        "id": "v-gen-152",
        "word": "die Großeltern",
        "translation": "kakek-nenek",
        "article": "die (plural)",
        "exampleSentence": "Meine Großeltern leben in Deutschland.",
        "phonetic": "dee GROS-el-tern",
        "level": "A1"
      },
      {
        "id": "v-gen-153",
        "word": "der Opa",
        "translation": "kakek (informal)",
        "article": "der",
        "exampleSentence": "Mein Opa ist sehr alt.",
        "phonetic": "der O-pa",
        "level": "A1"
      },
      {
        "id": "v-gen-154",
        "word": "die Oma",
        "translation": "nenek (informal)",
        "article": "die",
        "exampleSentence": "Meine Oma backt Kuchen.",
        "phonetic": "dee O-ma",
        "level": "A1"
      },
      {
        "id": "v-gen-155",
        "word": "der Beruf",
        "translation": "profesi/pekerjaan",
        "article": "der",
        "exampleSentence": "Was ist Ihr Beruf?",
        "phonetic": "der be-RUF",
        "level": "A1"
      },
      {
        "id": "v-gen-156",
        "word": "der Lehrer",
        "translation": "guru (laki-laki)",
        "article": "der",
        "exampleSentence": "Er ist Lehrer.",
        "phonetic": "der LE-rer",
        "level": "A1"
      },
      {
        "id": "v-gen-157",
        "word": "die Lehrerin",
        "translation": "guru (perempuan)",
        "article": "die",
        "exampleSentence": "Sie ist Lehrerin.",
        "phonetic": "dee LE-re-rin",
        "level": "A1"
      },
      {
        "id": "v-gen-158",
        "word": "der Student",
        "translation": "mahasiswa",
        "article": "der",
        "exampleSentence": "Ich bin Student.",
        "phonetic": "der shtoo-DENT",
        "level": "A1"
      },
      {
        "id": "v-gen-159",
        "word": "die Studentin",
        "translation": "mahasiswi",
        "article": "die",
        "exampleSentence": "Sie ist Studentin.",
        "phonetic": "dee shtoo-DEN-tin",
        "level": "A1"
      },
      {
        "id": "v-gen-160",
        "word": "der Arzt",
        "translation": "dokter (laki-laki)",
        "article": "der",
        "exampleSentence": "Mein Vater ist Arzt.",
        "phonetic": "der ARTST",
        "level": "A1"
      },
      {
        "id": "v-gen-161",
        "word": "die Ärztin",
        "translation": "dokter (perempuan)",
        "article": "die",
        "exampleSentence": "Meine Mutter ist Ärztin.",
        "phonetic": "dee ERTS-tin",
        "level": "A1"
      },
      {
        "id": "v-gen-162",
        "word": "was",
        "translation": "apa",
        "exampleSentence": "Was machst du?",
        "phonetic": "VAS",
        "level": "A1"
      },
      {
        "id": "v-gen-163",
        "word": "wer",
        "translation": "siapa",
        "exampleSentence": "Wer ist das?",
        "phonetic": "VER",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: 'Das ist ___ Vater.'",
        "options": [
          "mein",
          "meine",
          "meinen",
          "meiner"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Apa bentuk feminin dari 'der Lehrer'?",
        "options": [
          "die Lehrer",
          "die Lehrerin",
          "das Lehrer",
          "der Lehrerin"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Jika Anda memiliki saudara perempuan, apa yang Anda katakan?",
        "options": [
          "Ich habe einen Bruder.",
          "Ich habe eine Schwester.",
          "Ich habe ein Kind.",
          "Ich habe eine Familie."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Was ist ___ Beruf?' (formal)",
        "options": [
          "dein",
          "Ihr",
          "euer",
          "sein"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa arti 'die Großeltern'?",
        "options": [
          "orang tua",
          "anak-anak",
          "kakek-nenek",
          "saudara"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Siapa 'der Sohn'?",
        "options": [
          "anak perempuan",
          "anak laki-laki",
          "ayah",
          "ibu"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Meine ___ ist Ärztin.'",
        "options": [
          "Vater",
          "Bruder",
          "Mutter",
          "Sohn"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Bagaimana cara menanyakan 'Siapa itu?'",
        "options": [
          "Was ist das?",
          "Wer ist das?",
          "Wo ist das?",
          "Wie ist das?"
        ],
        "correctAnswer": 1
      }
    ],
    "dialogues": [
      {
        "personA": "Wer ist das?",
        "personB": "Das ist meine Schwester, Anna.",
        "translation": "A: Siapa itu?\nB: Itu adalah saudara perempuan saya, Anna."
      },
      {
        "personA": "Was ist dein Beruf?",
        "personB": "Ich bin Student.",
        "translation": "A: Apa pekerjaanmu?\nB: Saya seorang mahasiswa."
      },
      {
        "personA": "Hast du Geschwister?",
        "personB": "Ja, ich habe einen Bruder und eine Schwester.",
        "translation": "A: Apakah kamu punya saudara kandung?\nB: Ya, saya punya satu saudara laki-laki dan satu saudara perempuan."
      }
    ],
    "culturalNotes": "Di Jerman, seperti di banyak negara Barat, keluarga inti (orang tua dan anak-anak) adalah unit utama. Namun, hubungan dengan kakek-nenek juga seringkali dekat. Ketika berbicara tentang pekerjaan, penting untuk menggunakan bentuk gender yang benar (misal: 'Lehrer' untuk pria, 'Lehrerin' untuk wanita). Ini menunjukkan rasa hormat dan ketepatan dalam berbahasa."
  },
  {
    "id": "a1-checkpoint-3",
    "canDoGoals": [
      "Mengevaluasi kemampuan menyusun kalimat dengan struktur yang benar",
      "Menguji pemahaman preposisi dasar dan kata penunjuk posisi",
      "Mengevaluasi kosakata anggota keluarga dan nama pekerjaan"
    ],
    "title": "Review Konten Sebelumnya",
    "requiredScore": 0.7,
    "questions": [
      {
        "question": "Lengkapi kalimat: 'Ich ___ einen Film.'",
        "options": [
          "esse",
          "trinke",
          "sehe",
          "höre"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa bentuk Akkusativ dari 'der Apfel'?",
        "options": [
          "der Apfel",
          "die Apfel",
          "das Apfel",
          "den Apfel"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Lengkapi kalimat: 'Das Buch ist ___ dem Stuhl.'",
        "options": [
          "in",
          "auf",
          "an",
          "unter"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Pilih preposisi yang berarti 'di depan':",
        "options": [
          "in",
          "auf",
          "vor",
          "hinter"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa bentuk Dativ dari 'die Schule'?",
        "options": [
          "der Schule",
          "die Schule",
          "dem Schule",
          "den Schule"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat: 'Das ist ___ Mutter.'",
        "options": [
          "mein",
          "meine",
          "meinen",
          "meiner"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa bentuk maskulin dari 'die Ärztin'?",
        "options": [
          "der Arzt",
          "der Ärztin",
          "das Arzt",
          "die Arzt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Jika Anda memiliki anak laki-laki, apa yang Anda katakan?",
        "options": [
          "Ich habe eine Tochter.",
          "Ich habe einen Sohn.",
          "Ich habe eine Schwester.",
          "Ich habe einen Bruder."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa arti 'schreiben'?",
        "options": [
          "membaca",
          "menulis",
          "mendengar",
          "melihat"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Die Katze ist ___ dem Tisch.' (di bawah)",
        "options": [
          "in",
          "auf",
          "an",
          "unter"
        ],
        "correctAnswer": 3
      }
    ],
    "reviewLessons": [
      "a1-7",
      "a1-8",
      "a1-9"
    ]
  },
  {
    "id": "a1-10",
    "canDoGoals": [
      "Menyebutkan jenis-jenis makanan dan minuman (Essen und Trinken)",
      "Memesan makanan dan minuman di kafe atau restoran",
      "Memahami percakapan sederhana saat berbelanja di supermarket",
      "Menanyakan makanan spesifik dan menyatakan kelaparan / kehausan"
    ],
    "level": "A1",
    "title": "Makanan, Minuman & Belanja",
    "grammarDescription": "Pelajaran ini berfokus pada kosakata makanan, minuman, dan frasa yang digunakan saat berbelanja. Kita akan belajar bagaimana menanyakan harga, memesan makanan atau minuman, dan memahami nama-nama produk umum. Kasus Akkusativ akan sering digunakan saat membeli atau memesan sesuatu (objek langsung). Kata kerja modal 'möchten' (ingin) juga sangat berguna dalam konteks ini.",
    "sentenceBreakdowns": [
      "Ich (subjek) + möchte (verb modal) + einen (artikel Akkusativ) + Kaffee (kata benda Akkusativ).",
      "Was (kata tanya) + kostet (verb) + das (artikel netral)?",
      "Ich (subjek) + kaufe (verb) + Brot (objek Akkusativ)."
    ],
    "pronunciationTips": [
      "Huruf 'ß' diucapkan seperti 'ss' yang tajam (misal: 'Preis').",
      "Huruf 'ch' diucapkan seperti 'kh' dalam 'ach' (misal: 'Macht').",
      "Vokal ganda 'eu' diucapkan seperti 'oi' (misal: 'teuer')."
    ],
    "vocabulary": [
      {
        "id": "v-gen-164",
        "word": "das Essen",
        "translation": "makanan",
        "article": "das",
        "exampleSentence": "Das Essen ist sehr lecker.",
        "phonetic": "das ES-sen",
        "level": "A1"
      },
      {
        "id": "v-gen-165",
        "word": "das Getränk",
        "translation": "minuman",
        "article": "das",
        "exampleSentence": "Was möchten Sie trinken? Ein Getränk?",
        "phonetic": "das ge-TRENK",
        "level": "A1"
      },
      {
        "id": "v-gen-166",
        "word": "der Apfel",
        "translation": "apel",
        "article": "der",
        "exampleSentence": "Ich esse einen Apfel.",
        "phonetic": "der AP-fel",
        "level": "A1"
      },
      {
        "id": "v-gen-167",
        "word": "die Banane",
        "translation": "pisang",
        "article": "die",
        "exampleSentence": "Die Banane ist gelb.",
        "phonetic": "dee ba-NA-ne",
        "level": "A1"
      },
      {
        "id": "v-gen-168",
        "word": "das Brot",
        "translation": "roti",
        "article": "das",
        "exampleSentence": "Ich kaufe Brot.",
        "phonetic": "das BROHT",
        "level": "A1"
      },
      {
        "id": "v-gen-169",
        "word": "die Milch",
        "translation": "susu",
        "article": "die",
        "exampleSentence": "Ich trinke Milch.",
        "phonetic": "dee MILKH",
        "level": "A1"
      },
      {
        "id": "v-gen-170",
        "word": "der Käse",
        "translation": "keju",
        "article": "der",
        "exampleSentence": "Möchten Sie Käse?",
        "phonetic": "der KE-ze",
        "level": "A1"
      },
      {
        "id": "v-gen-171",
        "word": "das Wasser",
        "translation": "air",
        "article": "das",
        "exampleSentence": "Ein Glas Wasser, bitte.",
        "phonetic": "das VAS-ser",
        "level": "A1"
      },
      {
        "id": "v-gen-172",
        "word": "der Saft",
        "translation": "jus",
        "article": "der",
        "exampleSentence": "Ich trinke Orangensaft.",
        "phonetic": "der ZAFT",
        "level": "A1"
      },
      {
        "id": "v-gen-173",
        "word": "der Kaffee",
        "translation": "kopi",
        "article": "der",
        "exampleSentence": "Ich möchte einen Kaffee.",
        "phonetic": "der KAF-fe",
        "level": "A1"
      },
      {
        "id": "v-gen-174",
        "word": "der Tee",
        "translation": "teh",
        "article": "der",
        "exampleSentence": "Trinken Sie lieber Tee?",
        "phonetic": "der TEE",
        "level": "A1"
      },
      {
        "id": "v-gen-175",
        "word": "kaufen",
        "translation": "membeli",
        "exampleSentence": "Ich kaufe im Supermarkt ein.",
        "phonetic": "KAU-fen",
        "level": "A1"
      },
      {
        "id": "v-gen-176",
        "word": "kosten",
        "translation": "berharga/berbiaya",
        "exampleSentence": "Wie viel kostet das?",
        "phonetic": "KOS-ten",
        "level": "A1"
      },
      {
        "id": "v-gen-177",
        "word": "der Supermarkt",
        "translation": "supermarket",
        "article": "der",
        "exampleSentence": "Ich gehe zum Supermarkt.",
        "phonetic": "der ZOO-per-markt",
        "level": "A1"
      },
      {
        "id": "v-gen-178",
        "word": "der Preis",
        "translation": "harga",
        "article": "der",
        "exampleSentence": "Der Preis ist hoch.",
        "phonetic": "der PRAIS",
        "level": "A1"
      },
      {
        "id": "v-gen-179",
        "word": "wie viel",
        "translation": "berapa banyak",
        "exampleSentence": "Wie viel kostet das Brot?",
        "phonetic": "VEE FEEL",
        "level": "A1"
      },
      {
        "id": "v-gen-180",
        "word": "möchten",
        "translation": "ingin (sopan)",
        "exampleSentence": "Ich möchte einen Tee.",
        "phonetic": "MÖKH-ten",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: 'Ich ___ einen Kaffee.'",
        "options": [
          "esse",
          "trinke",
          "möchte",
          "kaufe"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa arti 'der Preis'?",
        "options": [
          "ukuran",
          "warna",
          "harga",
          "jumlah"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Bagaimana cara menanyakan harga sesuatu?",
        "options": [
          "Was ist das?",
          "Wie geht es?",
          "Wie viel kostet das?",
          "Wo ist das?"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Lengkapi kalimat: 'Ich kaufe ___ im Supermarkt.'",
        "options": [
          "ein Brot",
          "einen Brot",
          "das Brot",
          "die Brot"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih kata yang berarti 'minuman':",
        "options": [
          "das Essen",
          "der Saft",
          "das Getränk",
          "die Milch"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Jika Anda ingin memesan jus jeruk, apa yang Anda katakan?",
        "options": [
          "Ich möchte einen Kaffee.",
          "Ich möchte einen Orangensaft.",
          "Ich möchte Wasser.",
          "Ich möchte Milch."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa arti 'kaufen'?",
        "options": [
          "menjual",
          "membeli",
          "memasak",
          "makan"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Das ___ ist sehr lecker.'",
        "options": [
          "Getränk",
          "Kaffee",
          "Essen",
          "Milch"
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Guten Tag! Was möchten Sie?",
        "personB": "Ich möchte einen Kaffee und ein Stück Kuchen, bitte.",
        "translation": "A: Selamat siang! Apa yang Anda inginkan?\nB: Saya ingin kopi dan sepotong kue, tolong."
      },
      {
        "personA": "Wie viel kostet das Brot?",
        "personB": "Das Brot kostet zwei Euro fünfzig.",
        "translation": "A: Berapa harga roti ini?\nB: Roti ini berharga dua Euro lima puluh sen."
      },
      {
        "personA": "Gehen wir zum Supermarkt?",
        "personB": "Ja, ich muss Milch und Äpfel kaufen.",
        "translation": "A: Apakah kita pergi ke supermarket?\nB: Ya, saya harus membeli susu dan apel."
      }
    ],
    "culturalNotes": "Di Jerman, saat berbelanja atau memesan makanan/minuman, kesopanan sangat dihargai. Menggunakan 'bitte' (tolong) dan 'danke' (terima kasih) adalah hal yang umum. Saat menanyakan harga, frasa 'Wie viel kostet das?' (Berapa harga ini?) adalah standar. Banyak toko kelontong di Jerman mengharuskan Anda membayar untuk kantong belanja, jadi membawa tas belanja sendiri adalah kebiasaan yang baik."
  },
  {
    "id": "a1-11",
    "canDoGoals": [
      "Mampu menyebutkan jam/pukul (Die Uhrzeit) secara formal maupun informal",
      "Mampu membuat atau mengusulkan sebuah janji temu (Termin machen)",
      "Mampu menyampaikan kapan mereka sibuk atau punya waktu luang"
    ],
    "level": "A1",
    "title": "Waktu dan Jam (Die Uhrzeit)",
    "grammarDescription": "Untuk menanyakan jam, gunakan 'Wie spät ist es?' atau 'Wie viel Uhr ist es?'. Dalam bahasa Jerman, ada dua cara membaca jam: cara formal (24 jam) yang digunakan di televisi/stasiun, dan cara informal (12 jam) yang digunakan sehari-hari. Pada cara informal, kita menggunakan 'vor' (kurang) dan 'nach' (lebih). 'Viertel' berarti seperempat (15 menit) dan 'halb' berarti setengah (30 menit, menunjuk ke jam BERIKUTNYA).",
    "sentenceBreakdowns": [
      "Es ist (Sekarang jam) + zehn (sepuluh) + Uhr (pas).",
      "Es ist (Sekarang jam) + viertel (seperempat) + nach (lebih) + zwei (dua).",
      "Es ist (Sekarang jam) + halb (setengah) + drei (tiga => 2:30)."
    ],
    "pronunciationTips": [
      "Kata 'Uhr' diucapkan dengan 'u' panjang dan 'r' di akhir terdengar samar hampir seperti 'a'. (OO-a)",
      "Kata 'halb' ingat bahwa 'l' tetap terdengar jelas."
    ],
    "vocabulary": [
      {
        "id": "v-gen-181",
        "word": "die Uhr",
        "translation": "jam",
        "article": "die",
        "exampleSentence": "Es ist acht Uhr.",
        "phonetic": "OOR",
        "level": "A1"
      },
      {
        "id": "v-gen-182",
        "word": "vor",
        "translation": "kurang (waktu)",
        "exampleSentence": "Es ist zehn vor acht.",
        "phonetic": "FOR",
        "level": "A1"
      },
      {
        "id": "v-gen-183",
        "word": "nach",
        "translation": "lebih (waktu)",
        "exampleSentence": "Es ist zehn nach acht.",
        "phonetic": "NAKH",
        "level": "A1"
      },
      {
        "id": "v-gen-184",
        "word": "Viertel",
        "translation": "seperempat (15 menit)",
        "exampleSentence": "Es ist Viertel nach drei.",
        "phonetic": "FEER-tel",
        "level": "A1"
      },
      {
        "id": "v-gen-185",
        "word": "halb",
        "translation": "setengah (30 menit)",
        "exampleSentence": "Es ist halb vier.",
        "phonetic": "HALP",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Jika waktu menunjukkan 03:15, bagaimana mengucapkannya secara informal?",
        "options": [
          "viertel vor drei",
          "viertel nach drei",
          "halb drei",
          "drei Uhr fünfzehn"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa arti 'Es ist halb fünf'?",
        "options": [
          "Jam 5:30",
          "Jam 4:30",
          "Jam 05:00",
          "Jam 04:00"
        ],
        "correctAnswer": 1
      }
    ],
    "miniQuiz": [
      {
        "question": "Bagaimana menanyakan 'Jam berapa sekarang?' dalam bahasa Jerman?",
        "options": [
          "Wie spät ist es?",
          "Was ist Uhr?",
          "Wo ist Uhr?",
          "Wann ist es?"
        ],
        "correctAnswer": 0
      }
    ],
    "dialogues": [
      {
        "personA": "Entschuldigung, wie spät ist es?",
        "personB": "Es ist Viertel vor neun.",
        "translation": "A: Permisi, jam berapa sekarang?\nB: Sekarang jam sembilan kurang seperempat."
      }
    ],
    "culturalNotes": "Masyarakat Jerman sangat menghargai ketepatan waktu. Datang terlambat lebih dari 5 menit tanpa memberi kabar dianggap kurang sopan."
  },
  {
    "id": "a1-12",
    "canDoGoals": [
      "Menceritakan aktivitas masa luang dan hobi (Freizeit und Hobbys)",
      "Menggunakan kata 'gern' untuk menyatakan suatu kegiatan yang disenangi",
      "Bertanya mengenai hobi lawan bicara"
    ],
    "level": "A1",
    "title": "Hobi & Waktu Luang (Hobbys)",
    "grammarDescription": "Untuk menyatakan hobi, sering digunakan kata kata kerja ditambah dengan kata 'gern' (suka/dengan senang hati). Contohnya 'Ich lese gern' (Saya suka membaca).",
    "vocabulary": [
      {
        "id": "v-gen-186",
        "word": "das Hobby",
        "translation": "hobi",
        "article": "das",
        "exampleSentence": "Was sind deine Hobbys?",
        "phonetic": "HOB-bee",
        "level": "A1"
      },
      {
        "id": "v-gen-187",
        "word": "spielen",
        "translation": "bermain",
        "exampleSentence": "Ich spiele Fußball.",
        "phonetic": "SHPEE-len",
        "level": "A1"
      },
      {
        "id": "v-gen-188",
        "word": "gern",
        "translation": "dengan senang hati (suka)",
        "exampleSentence": "Ich koche gern.",
        "phonetic": "GERN",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Pilih ungkapan yang benar untuk 'Saya suka membaca':",
        "options": [
          "Ich lese gern",
          "Ich liebe lesen",
          "Ich lesen mögen",
          "Ich bin lesen"
        ],
        "correctAnswer": 0
      }
    ]
  },
  {
    "id": "a1-13",
    "canDoGoals": [
      "Mendeskripsikan kondisi cuaca saat ini (Das Wetter)",
      "Menyebutkan empat musim yang ada di belahan dunia Eropa (Jahreszeiten)",
      "Mendiskusikan cuaca kesukaan beserta alasannya secara sederhana"
    ],
    "level": "A1",
    "title": "Cuaca dan Musim (Das Wetter und die Jahreszeiten)",
    "grammarDescription": "Untuk menjelaskan tentang cuaca, kita menggunakan konstruksi 'Es ist...' (Itu adalah...) diikuti oleh kata sifat, atau menggunakan kata kerja yang sesuai seperti 'es regnet' (hujan), 'es schneit' (salju). Ini digunakan bersamaan dengan 'es' yang berfungsi sebagai subjek impersonal.",
    "vocabulary": [
      {
        "id": "v-gen-189",
        "word": "das Wetter",
        "translation": "cuaca",
        "article": "das",
        "exampleSentence": "Wie ist das Wetter heute?",
        "phonetic": "VET-ter",
        "level": "A1"
      },
      {
        "id": "v-gen-190",
        "word": "sonnig",
        "translation": "cerah (banyak matahari)",
        "exampleSentence": "Heute ist es sonnig.",
        "phonetic": "ZON-nikh",
        "level": "A1"
      },
      {
        "id": "v-gen-191",
        "word": "regnen",
        "translation": "hujan",
        "exampleSentence": "Es regnet.",
        "phonetic": "REG-nen",
        "level": "A1"
      },
      {
        "id": "v-gen-192",
        "word": "der Sommer",
        "translation": "musim panas",
        "article": "der",
        "exampleSentence": "Im Sommer ist es heiß.",
        "phonetic": "ZOM-mer",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Bagaimana cara mengatakan 'Hari ini hujan'?",
        "options": [
          "Heute ist regnen",
          "Heute regnet es",
          "Es ist Regen",
          "Regnen heute"
        ],
        "correctAnswer": 1
      }
    ],
    "dialogues": [
      {
        "personA": "Wie ist das Wetter heute?",
        "personB": "Es ist warm und sonnig.",
        "translation": "A: Bagaimana cuaca hari ini?\nB: Hangat dan cerah."
      }
    ]
  },
  {
    "id": "a2-1",
    "canDoGoals": [
      "Mengetahui perbedaan peran Subjek (Nominativ) dan Objek Langsung (Akkusativ)",
      "Mendeklinasikan artikel tertentu (den, die, das) di objek Akkusativ",
      "Menggunakan verba yang mewajibkan objek Akkusativ (haben, brauchen...)"
    ],
    "level": "A2",
    "title": "Kasus Nominativ vs Akkusativ",
    "grammarDescription": "Dalam bahasa Jerman, kata benda dan kata ganti berubah bentuk tergantung pada fungsinya dalam kalimat. Ini disebut 'Kasus' atau 'Kasus'. Ada empat kasus utama, dan di pelajaran ini kita akan fokus pada Nominativ dan Akkusativ.\n\n**Nominativ (Subjek):** Ini adalah kasus untuk subjek kalimat, yaitu pelaku tindakan. Kata benda dalam kasus Nominativ menjawab pertanyaan 'Wer?' (Siapa?) atau 'Was?' (Apa?). Artikel definitif (der, die, das) dan indefinitif (ein, eine, ein) tidak berubah dalam Nominativ.\n\nContoh: **Der Mann** liest ein Buch. (Pria itu membaca sebuah buku. 'Der Mann' adalah subjek)\n\n**Akkusativ (Objek Langsung):** Ini adalah kasus untuk objek langsung dari sebuah kata kerja, yaitu yang menerima tindakan. Kata benda dalam kasus Akkusativ menjawab pertanyaan 'Wen?' (Siapa? - untuk orang) atau 'Was?' (Apa? - untuk benda). Perubahan paling signifikan terjadi pada artikel maskulin: 'der' menjadi 'den' dan 'ein' menjadi 'einen'. Artikel feminin, netral, dan plural tidak berubah.\n\nPerubahan Artikel Akkusativ:\n- Maskulin: der -> den, ein -> einen\n- Feminin: die -> die, eine -> eine\n- Netral: das -> das, ein -> ein\n- Plural: die -> die, (kein artikel indefinitif)\n\nContoh: Ich sehe **den Hund**. (Saya melihat anjing itu. 'den Hund' adalah objek langsung)",
    "sentenceBreakdowns": [
      "Der Mann (subjek Nominativ) + liest (verb) + ein Buch (objek Akkusativ).",
      "Die Frau (subjek Nominativ) + kauft (verb) + den Apfel (objek Akkusativ maskulin).",
      "Das Kind (subjek Nominativ) + isst (verb) + eine Banane (objek Akkusativ feminin).",
      "Wir (subjek Nominativ) + besuchen (verb) + unsere Freunde (objek Akkusativ plural).",
      "Hast du (subjek Nominativ) + einen Stift (objek Akkusativ maskulin)?",
      "Ich (subjek Nominativ) + trinke (verb) + das Wasser (objek Akkusativ netral)."
    ],
    "pronunciationTips": "Perhatikan perbedaan pelafalan 'ch'. Ada dua jenis: 'ich-Laut' (seperti di 'ich', 'nicht', 'Mädchen') yang lembut di bagian depan mulut, dan 'ach-Laut' (seperti di 'Buch', 'machen', 'acht') yang lebih keras di bagian belakang tenggorokan. Latih keduanya untuk membedakan kata-kata.",
    "vocabulary": [
      {
        "id": "v-gen-193",
        "word": "der Mann",
        "translation": "pria",
        "exampleSentence": "Der Mann liest die Zeitung.",
        "phonetic": "der MAN",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-194",
        "word": "die Frau",
        "translation": "wanita",
        "exampleSentence": "Die Frau kocht das Essen.",
        "phonetic": "dee FRAU",
        "level": "A2",
        "article": "die"
      },
      {
        "id": "v-gen-195",
        "word": "das Kind",
        "translation": "anak",
        "exampleSentence": "Das Kind spielt im Garten.",
        "phonetic": "das KINT",
        "level": "A2",
        "article": "das"
      },
      {
        "id": "v-gen-196",
        "word": "der Hund",
        "translation": "anjing",
        "exampleSentence": "Ich sehe den Hund.",
        "phonetic": "der HOONT",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-197",
        "word": "die Katze",
        "translation": "kucing",
        "exampleSentence": "Die Katze schläft auf dem Sofa.",
        "phonetic": "dee KAT-se",
        "level": "A2",
        "article": "die"
      },
      {
        "id": "v-gen-198",
        "word": "das Buch",
        "translation": "buku",
        "exampleSentence": "Er liest ein interessantes Buch.",
        "phonetic": "das BOOKH",
        "level": "A2",
        "article": "das"
      },
      {
        "id": "v-gen-199",
        "word": "der Apfel",
        "translation": "apel",
        "exampleSentence": "Ich esse einen Apfel.",
        "phonetic": "der AP-fel",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-200",
        "word": "die Banane",
        "translation": "pisang",
        "exampleSentence": "Sie kauft eine Banane.",
        "phonetic": "dee ba-NA-ne",
        "level": "A2",
        "article": "die"
      },
      {
        "id": "v-gen-201",
        "word": "das Wasser",
        "translation": "air",
        "exampleSentence": "Trinkst du das Wasser?",
        "phonetic": "das VAS-ser",
        "level": "A2",
        "article": "das"
      },
      {
        "id": "v-gen-202",
        "word": "sehen",
        "translation": "melihat",
        "exampleSentence": "Ich sehe den Film.",
        "phonetic": "ZEE-en",
        "level": "A2"
      },
      {
        "id": "v-gen-203",
        "word": "kaufen",
        "translation": "membeli",
        "exampleSentence": "Wir kaufen ein neues Auto.",
        "phonetic": "KAU-fen",
        "level": "A2"
      },
      {
        "id": "v-gen-204",
        "word": "essen",
        "translation": "makan",
        "exampleSentence": "Was isst du gern?",
        "phonetic": "ES-sen",
        "level": "A2"
      },
      {
        "id": "v-gen-205",
        "word": "trinken",
        "translation": "minum",
        "exampleSentence": "Ich trinke Kaffee.",
        "phonetic": "TRIN-ken",
        "level": "A2"
      },
      {
        "id": "v-gen-206",
        "word": "lesen",
        "translation": "membaca",
        "exampleSentence": "Er liest ein Buch.",
        "phonetic": "LEE-zen",
        "level": "A2"
      },
      {
        "id": "v-gen-207",
        "word": "haben",
        "translation": "memiliki",
        "exampleSentence": "Ich habe einen Bruder.",
        "phonetic": "HA-ben",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Pilih artikel yang benar untuk melengkapi kalimat: 'Ich habe ____ Hund.'",
        "options": [
          "der",
          "den",
          "das",
          "die"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Pilih artikel yang benar untuk melengkapi kalimat: '____ Frau trinkt Kaffee.'",
        "options": [
          "Der",
          "Den",
          "Die",
          "Das"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih artikel yang benar untuk melengkapi kalimat: 'Er isst ____ Apfel.'",
        "options": [
          "ein",
          "einen",
          "eine",
          "eines"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Identifikasi kasus dari 'das Buch' dalam kalimat: 'Sie liest das Buch.'",
        "options": [
          "Nominativ",
          "Akkusativ",
          "Dativ",
          "Genitiv"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Kalimat mana yang menggunakan Akkusativ dengan benar?",
        "options": [
          "Der Mann sieht der Frau.",
          "Die Frau kauft ein Auto.",
          "Das Kind spielt den Ball.",
          "Ich habe ein Stift."
        ],
        "correctAnswer": 1
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa bentuk Akkusativ dari 'der Tisch'?",
        "options": [
          "der Tisch",
          "den Tisch",
          "dem Tisch",
          "des Tisches"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Wir besuchen ____ Freunde.'",
        "options": [
          "unsere",
          "unseren",
          "unserem",
          "unserer"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Dalam kalimat 'Das Mädchen hat einen Ball.', 'einen Ball' adalah kasus apa?",
        "options": [
          "Nominativ",
          "Akkusativ",
          "Dativ",
          "Genitiv"
        ],
        "correctAnswer": 1
      }
    ],
    "dialogues": [
      {
        "personA": "Guten Tag! Ich suche einen Stift.",
        "personB": "Einen Stift? Ich habe einen hier. Möchten Sie ihn?",
        "translation": "A: Selamat siang! Saya mencari sebuah pulpen.\nB: Sebuah pulpen? Saya punya satu di sini. Apakah Anda menginginkannya?"
      },
      {
        "personA": "Siehst du den Mann dort?",
        "personB": "Welchen Mann? Ich sehe nur eine Frau.",
        "translation": "A: Apakah kamu melihat pria itu di sana?\nB: Pria yang mana? Saya hanya melihat seorang wanita."
      },
      {
        "personA": "Ich möchte einen Apfel kaufen.",
        "personB": "Wir haben rote und grüne Äpfel. Welchen möchten Sie?",
        "translation": "A: Saya ingin membeli sebuah apel.\nB: Kami punya apel merah dan hijau. Yang mana yang Anda inginkan?"
      }
    ],
    "culturalNotes": "Dalam bahasa Jerman, urutan kata seringkali lebih fleksibel dibandingkan bahasa Inggris, terutama karena kasus membantu mengidentifikasi fungsi kata dalam kalimat. Namun, subjek (Nominativ) biasanya muncul di awal kalimat atau setelah kata kerja terkonjugasi dalam kalimat tanya. Memahami kasus adalah kunci untuk berbicara dan menulis bahasa Jerman dengan benar dan alami."
  },
  {
    "id": "a2-2",
    "canDoGoals": [
      "Memahami fungsi Objek Tidak Langsung (Dativ)",
      "Mendeklinasikan artikel tertentu (dem, der, dem) di posisi Dativ",
      "Mendeklinasikan artikel tidak tentu (einem, einer, einem) di posisi Dativ",
      "Mengenali kumpulan verba yang selalu diiringi objek Dativ (helfen, danken...)"
    ],
    "level": "A2",
    "title": "Kasus Dativ",
    "grammarDescription": "Setelah memahami Nominativ dan Akkusativ, sekarang kita akan mempelajari Kasus Dativ. Dativ sering disebut sebagai kasus objek tidak langsung, yang menunjukkan kepada siapa atau untuk siapa suatu tindakan dilakukan. Kata benda dalam kasus Dativ menjawab pertanyaan 'Wem?' (Kepada siapa?).\n\n**Penggunaan Dativ:**\n1.  **Sebagai Objek Tidak Langsung:** Banyak kata kerja yang membutuhkan objek tidak langsung dalam Dativ. Contoh: geben (memberi), helfen (membantu), danken (berterima kasih), gehören (milik).\n    *   Ich gebe **dem Mann** ein Buch. (Saya memberi sebuah buku kepada pria itu.)\n2.  **Setelah Preposisi Tertentu:** Beberapa preposisi selalu diikuti oleh Dativ. Contoh: mit (dengan), nach (setelah/ke), von (dari), zu (ke), bei (di/pada), aus (dari), gegenüber (di seberang), seit (sejak).\n    *   Ich fahre **mit dem Auto**. (Saya pergi dengan mobil.)\n    *   Sie kommt **aus Deutschland**. (Dia berasal dari Jerman.)\n\n**Perubahan Artikel Dativ:**\n-   Maskulin: der -> dem, ein -> einem\n-   Feminin: die -> der, eine -> einer\n-   Netral: das -> dem, ein -> einem\n-   Plural: die -> den (+ -n pada kata benda jika belum ada, contoh: Kinder -> Kindern, Freunde -> Freunden)\n\nPerhatikan bahwa untuk kata benda plural dalam Dativ, seringkali ditambahkan akhiran '-n' jika kata benda tersebut tidak berakhir dengan '-s' atau '-n' secara alami.",
    "sentenceBreakdowns": [
      "Ich (subjek Nominativ) + helfe (verb) + dem Kind (objek Dativ).",
      "Er (subjek Nominativ) + gibt (verb) + der Frau (objek Dativ) + einen Blumenstrauß (objek Akkusativ).",
      "Wir (subjek Nominativ) + fahren (verb) + mit (preposisi Dativ) + dem Bus (objek Dativ).",
      "Sie (subjek Nominativ) + kommt (verb) + aus (preposisi Dativ) + der Schweiz (objek Dativ).",
      "Das Buch (subjek Nominativ) + gehört (verb) + mir (kata ganti Dativ).",
      "Ich (subjek Nominativ) + spreche (verb) + mit (preposisi Dativ) + meinen Freunden (objek Dativ plural)."
    ],
    "pronunciationTips": "Perhatikan perbedaan antara 'ei' (dibaca seperti 'ai' dalam 'pantai') dan 'ie' (dibaca seperti 'i' panjang dalam 'biru'). Contoh: 'mein' (milikku) vs 'Miene' (ekspresi wajah), 'Zeit' (waktu) vs 'Ziel' (tujuan). Latih untuk membedakan dan melafalkannya dengan benar.",
    "vocabulary": [
      {
        "id": "v-gen-208",
        "word": "helfen",
        "translation": "membantu",
        "exampleSentence": "Ich helfe dir gern.",
        "phonetic": "HEL-fen",
        "level": "A2"
      },
      {
        "id": "v-gen-209",
        "word": "geben",
        "translation": "memberi",
        "exampleSentence": "Kannst du mir das Buch geben?",
        "phonetic": "GEE-ben",
        "level": "A2"
      },
      {
        "id": "v-gen-210",
        "word": "danken",
        "translation": "berterima kasih",
        "exampleSentence": "Ich danke Ihnen für die Hilfe.",
        "phonetic": "DAN-ken",
        "level": "A2"
      },
      {
        "id": "v-gen-211",
        "word": "gehören",
        "translation": "milik",
        "exampleSentence": "Das Auto gehört meinem Vater.",
        "phonetic": "ge-HÖ-ren",
        "level": "A2"
      },
      {
        "id": "v-gen-212",
        "word": "mit",
        "translation": "dengan",
        "exampleSentence": "Ich fahre mit dem Zug.",
        "phonetic": "MIT",
        "level": "A2"
      },
      {
        "id": "v-gen-213",
        "word": "nach",
        "translation": "setelah/ke",
        "exampleSentence": "Nach der Arbeit gehe ich nach Hause.",
        "phonetic": "NAKH",
        "level": "A2"
      },
      {
        "id": "v-gen-214",
        "word": "von",
        "translation": "dari",
        "exampleSentence": "Das Geschenk ist von meiner Schwester.",
        "phonetic": "FON",
        "level": "A2"
      },
      {
        "id": "v-gen-215",
        "word": "zu",
        "translation": "ke",
        "exampleSentence": "Ich gehe zum Arzt.",
        "phonetic": "TSOO",
        "level": "A2"
      },
      {
        "id": "v-gen-216",
        "word": "bei",
        "translation": "di/pada",
        "exampleSentence": "Ich wohne bei meinen Eltern.",
        "phonetic": "BAI",
        "level": "A2"
      },
      {
        "id": "v-gen-217",
        "word": "aus",
        "translation": "dari",
        "exampleSentence": "Er kommt aus Spanien.",
        "phonetic": "AUS",
        "level": "A2"
      },
      {
        "id": "v-gen-218",
        "word": "der Bus",
        "translation": "bus",
        "exampleSentence": "Wir fahren mit dem Bus.",
        "phonetic": "der BOOS",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-219",
        "word": "die Schweiz",
        "translation": "Swiss",
        "exampleSentence": "Sie kommt aus der Schweiz.",
        "phonetic": "dee SHVAIZ",
        "level": "A2",
        "article": "die"
      },
      {
        "id": "v-gen-220",
        "word": "der Freund",
        "translation": "teman (laki-laki)",
        "exampleSentence": "Ich spreche mit meinem Freund.",
        "phonetic": "der FROINT",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-221",
        "word": "die Eltern (plural)",
        "translation": "orang tua",
        "exampleSentence": "Ich wohne bei meinen Eltern.",
        "phonetic": "dee EL-tern",
        "level": "A2",
        "article": "die"
      },
      {
        "id": "v-gen-222",
        "word": "das Geschenk",
        "translation": "hadiah",
        "exampleSentence": "Das Geschenk ist für dich.",
        "phonetic": "das ge-SHENK",
        "level": "A2",
        "article": "das"
      }
    ],
    "exercises": [
      {
        "question": "Pilih artikel yang benar untuk melengkapi kalimat: 'Ich helfe ____ Mann.'",
        "options": [
          "der",
          "den",
          "dem",
          "das"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih artikel yang benar untuk melengkapi kalimat: 'Sie fährt mit ____ Auto.'",
        "options": [
          "der",
          "den",
          "dem",
          "das"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih artikel yang benar untuk melengkapi kalimat: 'Das gehört ____ Frau.'",
        "options": [
          "der",
          "die",
          "dem",
          "das"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Preposisi mana yang selalu diikuti oleh Dativ?",
        "options": [
          "für",
          "ohne",
          "durch",
          "mit"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Lengkapi kalimat: 'Ich danke ____ Hilfe.'",
        "options": [
          "dir",
          "dich",
          "du",
          "dein"
        ],
        "correctAnswer": 0
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa bentuk Dativ dari 'die Lehrerin'?",
        "options": [
          "die Lehrerin",
          "der Lehrerin",
          "den Lehrerin",
          "dem Lehrerin"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Wir gehen ____ Supermarkt.' (ke)",
        "options": [
          "zu der",
          "zum",
          "zu den",
          "zu das"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Dalam kalimat 'Er gibt dem Kind ein Spielzeug.', 'dem Kind' adalah kasus apa?",
        "options": [
          "Nominativ",
          "Akkusativ",
          "Dativ",
          "Genitiv"
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Kannst du mir bitte helfen?",
        "personB": "Ja, klar! Wobei brauchst du Hilfe?",
        "translation": "A: Bisakah kamu membantuku?\nB: Ya, tentu! Dalam hal apa kamu butuh bantuan?"
      },
      {
        "personA": "Wem gehört dieses Buch?",
        "personB": "Ich glaube, es gehört dem Lehrer.",
        "translation": "A: Milik siapa buku ini?\nB: Saya rasa, ini milik guru itu."
      },
      {
        "personA": "Fährst du mit dem Fahrrad zur Arbeit?",
        "personB": "Nein, ich fahre mit dem Bus. Es ist schneller.",
        "translation": "A: Apakah kamu pergi kerja dengan sepeda?\nB: Tidak, saya pergi dengan bus. Itu lebih cepat."
      }
    ],
    "culturalNotes": "Penggunaan Dativ dalam bahasa Jerman seringkali mencerminkan tingkat formalitas atau hubungan. Misalnya, 'Wie geht es Ihnen?' (Bagaimana kabar Anda? - formal) menggunakan Dativ 'Ihnen', sedangkan 'Wie geht es dir?' (Bagaimana kabarmu? - informal) menggunakan Dativ 'dir'. Memahami Dativ sangat penting untuk komunikasi yang sopan dan akurat."
  },
  {
    "id": "a2-3",
    "canDoGoals": [
      "Menggunakan Modal Verben (können, müssen, wollen, dürfen) untuk mengekspresikan kemampuan, kewajiban, dan izin",
      "Memahami struktur 'Satzklammer', memposisikan verba infinitif di akhir kalimat",
      "Konjugasi Modal Verben di semua subjek (ich, du, er/sie/es, wir, ihr, sie/Sie)"
    ],
    "level": "A2",
    "title": "Modal Verben (können, müssen, wollen, dürfen)",
    "grammarDescription": "Kata kerja modal (Modalverben) adalah kata kerja yang mengubah makna kata kerja utama dalam sebuah kalimat, menunjukkan kemampuan, keharusan, keinginan, atau izin. Dalam bahasa Jerman, kata kerja modal sangat umum dan memiliki struktur kalimat yang khas.\n\n**Struktur Kalimat:**\nDalam kalimat utama, kata kerja modal terkonjugasi berada di posisi kedua, sedangkan kata kerja utama (dalam bentuk infinitif) diletakkan di akhir kalimat.\n\nContoh: Ich **kann** Deutsch **sprechen**. (Saya bisa berbicara bahasa Jerman.)\n\n**Modal Verben Utama:**\n1.  **können (bisa/mampu):** Mengungkapkan kemampuan atau kemungkinan.\n    *   Ich kann schwimmen. (Saya bisa berenang.)\n    *   Kannst du mir helfen? (Bisakah kamu membantuku?)\n2.  **müssen (harus):** Mengungkapkan keharusan atau kewajiban.\n    *   Wir müssen arbeiten. (Kita harus bekerja.)\n    *   Ich muss zum Arzt gehen. (Saya harus pergi ke dokter.)\n3.  **wollen (ingin):** Mengungkapkan keinginan atau niat.\n    *   Sie will Deutsch lernen. (Dia ingin belajar bahasa Jerman.)\n    *   Was wollt ihr essen? (Kalian ingin makan apa?)\n4.  **dürfen (boleh/diizinkan):** Mengungkapkan izin atau larangan.\n    *   Hier darf man nicht rauchen. (Di sini tidak boleh merokok.)\n    *   Darf ich reinkommen? (Bolehkah saya masuk?)\n\n**Konjugasi (Perhatikan perubahan vokal pada ich/er/sie/es):**\n| Pronomen | können | müssen | wollen | dürfen |\n|----------|--------|--------|-------|--------|\n| ich      | kann   | muss   | will  | darf   |\n| du       | kannst | musst  | willst| darfst |\n| er/sie/es| kann   | muss   | will  | darf   |\n| wir      | können | müssen | wollen | dürfen |\n| ihr      | könnt  | müsst  | wollt | dürft  |\n| sie/Sie  | können | müssen | wollen | dürfen |\n\nPerhatikan bahwa konjugasi untuk 'ich' dan 'er/sie/es' seringkali sama dan vokal pada akar kata sering berubah.",
    "sentenceBreakdowns": [
      "Ich (subjek) + kann (modal verb terkonjugasi) + sehr gut (adverb) + kochen (kata kerja infinitif di akhir).",
      "Du (subjek) + musst (modal verb terkonjugasi) + deine Hausaufgaben (objek Akkusativ) + machen (kata kerja infinitif di akhir).",
      "Er (subjek) + will (modal verb terkonjugasi) + nach Deutschland (arah) + reisen (kata kerja infinitif di akhir).",
      "Wir (subjek) + dürfen (modal verb terkonjugasi) + hier (lokasi) + parken (kata kerja infinitif di akhir).",
      "Sie (subjek) + können (modal verb terkonjugasi) + mir (objek Dativ) + helfen (kata kerja infinitif di akhir).",
      "Was (kata tanya) + wollt (modal verb terkonjugasi) + ihr (subjek) + trinken (kata kerja infinitif di akhir)?"
    ],
    "pronunciationTips": "Umlaut (ä, ö, ü) adalah vokal yang diucapkan dengan membulatkan bibir seperti vokal lain tetapi dengan posisi lidah yang berbeda. \n- 'ä' seperti 'e' dalam 'bed' (Inggris) atau 'e' dalam 'enak' (Indonesia).\n- 'ö' seperti 'eu' dalam 'deux' (Prancis) atau 'e' dalam 'pergi' dengan bibir membulat.\n- 'ü' seperti 'u' dalam 'tu' (Prancis) atau 'i' dalam 'biru' dengan bibir membulat.\nLatih untuk membedakan dan melafalkannya dengan benar, karena ini mengubah makna kata.",
    "vocabulary": [
      {
        "id": "v-gen-223",
        "word": "können",
        "translation": "bisa/mampu",
        "exampleSentence": "Ich kann gut Deutsch sprechen.",
        "phonetic": "KÖN-nen",
        "level": "A2"
      },
      {
        "id": "v-gen-224",
        "word": "müssen",
        "translation": "harus",
        "exampleSentence": "Wir müssen jetzt gehen.",
        "phonetic": "MÜS-sen",
        "level": "A2"
      },
      {
        "id": "v-gen-225",
        "word": "wollen",
        "translation": "ingin",
        "exampleSentence": "Was willst du essen?",
        "phonetic": "VOL-len",
        "level": "A2"
      },
      {
        "id": "v-gen-226",
        "word": "dürfen",
        "translation": "boleh/diizinkan",
        "exampleSentence": "Darf ich hier parken?",
        "phonetic": "DÜR-fen",
        "level": "A2"
      },
      {
        "id": "v-gen-227",
        "word": "sprechen",
        "translation": "berbicara",
        "exampleSentence": "Er spricht drei Sprachen.",
        "phonetic": "SHPRE-khen",
        "level": "A2"
      },
      {
        "id": "v-gen-228",
        "word": "lernen",
        "translation": "belajar",
        "exampleSentence": "Sie lernt Deutsch.",
        "phonetic": "LER-nen",
        "level": "A2"
      },
      {
        "id": "v-gen-229",
        "word": "gehen",
        "translation": "pergi",
        "exampleSentence": "Ich muss jetzt gehen.",
        "phonetic": "GE-hen",
        "level": "A2"
      },
      {
        "id": "v-gen-230",
        "word": "arbeiten",
        "translation": "bekerja",
        "exampleSentence": "Wir müssen morgen arbeiten.",
        "phonetic": "AR-bai-ten",
        "level": "A2"
      },
      {
        "id": "v-gen-231",
        "word": "reisen",
        "translation": "bepergian",
        "exampleSentence": "Sie will nach Italien reisen.",
        "phonetic": "RAI-zen",
        "level": "A2"
      },
      {
        "id": "v-gen-232",
        "word": "rauchen",
        "translation": "merokok",
        "exampleSentence": "Hier darf man nicht rauchen.",
        "phonetic": "RAU-khen",
        "level": "A2"
      },
      {
        "id": "v-gen-233",
        "word": "parken",
        "translation": "parkir",
        "exampleSentence": "Wo kann ich parken?",
        "phonetic": "PAR-ken",
        "level": "A2"
      },
      {
        "id": "v-gen-234",
        "word": "kochen",
        "translation": "memasak",
        "exampleSentence": "Kannst du kochen?",
        "phonetic": "KO-khen",
        "level": "A2"
      },
      {
        "id": "v-gen-235",
        "word": "die Hausaufgaben (plural)",
        "translation": "pekerjaan rumah",
        "exampleSentence": "Ich muss meine Hausaufgaben machen.",
        "phonetic": "dee HAUS-auf-ga-ben",
        "level": "A2",
        "article": "die"
      },
      {
        "id": "v-gen-236",
        "word": "der Arzt",
        "translation": "dokter",
        "exampleSentence": "Ich muss zum Arzt gehen.",
        "phonetic": "der ARTST",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-237",
        "word": "reinkommen",
        "translation": "masuk",
        "exampleSentence": "Darf ich reinkommen?",
        "phonetic": "RAIN-kom-men",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: 'Ich ____ gut schwimmen.'",
        "options": [
          "muss",
          "will",
          "kann",
          "darf"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih bentuk yang benar: 'Du ____ deine Hausaufgaben machen.'",
        "options": [
          "musst",
          "muss",
          "müssen",
          "müsst"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat mana yang benar secara tata bahasa?",
        "options": [
          "Wir wollen essen Pizza.",
          "Sie kann gut Deutsch sprechen.",
          "Er muss gehen jetzt.",
          "Darf ich hier rauchen nicht?"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa arti dari 'dürfen'?",
        "options": [
          "harus",
          "ingin",
          "bisa",
          "boleh/diizinkan"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Lengkapi kalimat: 'Was ____ ihr trinken?'",
        "options": [
          "könnt",
          "wollt",
          "müsst",
          "dürft"
        ],
        "correctAnswer": 1
      }
    ],
    "miniQuiz": [
      {
        "question": "Konjugasi 'wollen' untuk 'er' adalah:",
        "options": [
          "will",
          "wollt",
          "wollen",
          "willst"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat 'Hier ____ man nicht laut sein.' (tidak boleh) menggunakan modal verb apa?",
        "options": [
          "kann",
          "muss",
          "will",
          "darf"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Di mana posisi kata kerja utama (infinitif) dalam kalimat dengan modal verb?",
        "options": [
          "Posisi kedua",
          "Di akhir kalimat",
          "Setelah subjek",
          "Sebelum modal verb"
        ],
        "correctAnswer": 1
      }
    ],
    "dialogues": [
      {
        "personA": "Kannst du mir bitte helfen, die Koffer zu tragen?",
        "personB": "Ja, klar! Ich kann dir helfen.",
        "translation": "A: Bisakah kamu membantuku membawa koper-koper ini?\nB: Ya, tentu! Saya bisa membantumu."
      },
      {
        "personA": "Wir müssen morgen früh aufstehen.",
        "personB": "Ich weiß, ich will aber noch ein bisschen schlafen.",
        "translation": "A: Kita harus bangun pagi besok.\nB: Saya tahu, tapi saya masih ingin tidur sebentar."
      },
      {
        "personA": "Darf ich das Fenster öffnen?",
        "personB": "Ja, natürlich. Es ist sehr warm hier.",
        "translation": "A: Bolehkah saya membuka jendela?\nB: Ya, tentu saja. Di sini sangat panas."
      }
    ],
    "culturalNotes": "Dalam budaya berbahasa Jerman, penggunaan kata kerja modal seringkali mencerminkan tingkat kesopanan dan formalitas. Misalnya, 'Könnten Sie mir helfen?' (Bisakah Anda membantu saya? - lebih sopan) daripada 'Kannst du mir helfen?'. Memahami nuansa ini penting untuk komunikasi yang efektif dan sesuai konteks."
  },
  {
    "checkpoint": {
      "id": "a2-checkpoint-1",
      "title": "Review Konten Sebelumnya",
      "requiredScore": 0.7,
      "questions": [
        {
          "question": "Pilih artikel Akkusativ yang benar: 'Ich habe ____ Katze.'",
          "options": [
            "der",
            "den",
            "die",
            "das"
          ],
          "correctAnswer": 2
        },
        {
          "question": "Preposisi 'mit' selalu diikuti oleh kasus apa?",
          "options": [
            "Nominativ",
            "Akkusativ",
            "Dativ",
            "Genitiv"
          ],
          "correctAnswer": 2
        },
        {
          "question": "Lengkapi kalimat dengan modal verb yang tepat: 'Er ____ nicht schwimmen.' (tidak bisa)",
          "options": [
            "muss",
            "will",
            "kann",
            "darf"
          ],
          "correctAnswer": 2
        },
        {
          "question": "Apa bentuk Dativ dari 'das Kind'?",
          "options": [
            "das Kind",
            "dem Kind",
            "den Kind",
            "der Kind"
          ],
          "correctAnswer": 1
        },
        {
          "question": "Identifikasi kasus dari 'den Apfel' dalam kalimat: 'Sie isst den Apfel.'",
          "options": [
            "Nominativ",
            "Akkusativ",
            "Dativ",
            "Genitiv"
          ],
          "correctAnswer": 1
        },
        {
          "question": "Kalimat mana yang menggunakan Dativ dengan benar?",
          "options": [
            "Ich gebe der Mann ein Buch.",
            "Er hilft dem Kind.",
            "Wir fahren mit das Auto.",
            "Das gehört die Frau."
          ],
          "correctAnswer": 1
        },
        {
          "question": "Konjugasi 'müssen' untuk 'wir' adalah:",
          "options": [
            "muss",
            "musst",
            "müssen",
            "müsst"
          ],
          "correctAnswer": 2
        },
        {
          "question": "Lengkapi kalimat: 'Ich danke ____ Hilfe.'",
          "options": [
            "dir",
            "dich",
            "du",
            "dein"
          ],
          "correctAnswer": 0
        },
        {
          "question": "Dalam kalimat 'Ich will Deutsch lernen.', 'lernen' adalah:",
          "options": [
            "Kata kerja terkonjugasi",
            "Kata kerja modal",
            "Infinitif",
            "Partizip II"
          ],
          "correctAnswer": 2
        },
        {
          "question": "Pilih artikel Nominativ yang benar: '____ Buch ist interessant.'",
          "options": [
            "Der",
            "Den",
            "Die",
            "Das"
          ],
          "correctAnswer": 3
        }
      ],
      "reviewLessons": [
        "a2-1",
        "a2-2",
        "a2-3"
      ]
    },
    "id": "a2-4",
    "canDoGoals": [
      "Bercerita kejadian masa lalu (spoken past/Perfekt)",
      "Memilih antara Hilfsverben 'haben' dan 'sein' sebagai verba pendukung",
      "Membentuk Partizip II dari verba beraturan dan tidak beraturan"
    ],
    "level": "A2",
    "title": "Waktu Lampau: Perfekt",
    "grammarDescription": "Perfekt adalah bentuk waktu lampau yang paling umum digunakan dalam percakapan sehari-hari di bahasa Jerman. Ini dibentuk dengan menggunakan kata kerja bantu (Hilfsverb) 'haben' atau 'sein' yang terkonjugasi, diikuti oleh Partizip II (past participle) dari kata kerja utama di akhir kalimat.\n\n**Struktur Umum:**\nSubjek + haben/sein (terkonjugasi) + ... + Partizip II\n\n**Kapan Menggunakan 'haben' atau 'sein'?**\n1.  **Menggunakan 'haben':** Sebagian besar kata kerja menggunakan 'haben' sebagai kata kerja bantu. Ini termasuk:\n    *   Kata kerja transitif (yang membutuhkan objek Akkusativ): Ich habe den Film gesehen. (Saya telah menonton film itu.)\n    *   Kata kerja refleksif: Ich habe mich gewaschen. (Saya telah mencuci diri.)\n    *   Kata kerja modal (dalam Perfekt): Ich habe arbeiten müssen. (Saya harus bekerja.)\n    *   Kata kerja yang tidak menunjukkan perubahan lokasi atau kondisi: Ich habe geschlafen. (Saya telah tidur.)\n\n2.  **Menggunakan 'sein':** Digunakan untuk:\n    *   Kata kerja yang menunjukkan pergerakan dari satu tempat ke tempat lain: gehen (pergi), fahren (mengemudi), fliegen (terbang), kommen (datang).\n        *   Ich bin nach Berlin gefahren. (Saya telah pergi ke Berlin.)\n    *   Kata kerja yang menunjukkan perubahan kondisi: werden (menjadi), einschlafen (tertidur), sterben (meninggal).\n        *   Er ist eingeschlafen. (Dia telah tertidur.)\n    *   Kata kerja 'sein' itu sendiri: Ich bin gewesen. (Saya telah ada/pernah.)\n\n**Pembentukan Partizip II:**\n*   **Kata kerja reguler (lemah):** ge- + akar kata + -t\n    *   machen -> gemacht, spielen -> gespielt\n*   **Kata kerja ireguler (kuat):** ge- + perubahan akar kata + -en\n    *   sehen -> gesehen, trinken -> getrunken, gehen -> gegangen\n*   **Kata kerja dengan awalan tidak terpisah (untrennbare Verben):** Tidak ada 'ge-'\n    *   besuchen -> besucht, verstehen -> verstanden\n*   **Kata kerja berakhiran -ieren:** Tidak ada 'ge-', hanya -t\n    *   studieren -> studiert, fotografieren -> fotografiert",
    "sentenceBreakdowns": [
      "Ich (subjek) + habe (haben terkonjugasi) + gestern (adverb waktu) + einen Film (objek Akkusativ) + gesehen (Partizip II dari sehen).",
      "Sie (subjek) + ist (sein terkonjugasi) + nach Hause (arah) + gegangen (Partizip II dari gehen).",
      "Wir (subjek) + haben (haben terkonjugasi) + viel (adverb) + gelacht (Partizip II dari lachen).",
      "Er (subjek) + ist (sein terkonjugasi) + schnell (adverb) + eingeschlafen (Partizip II dari einschlafen).",
      "Du (subjek) + hast (haben terkonjugasi) + das Buch (objek Akkusativ) + gelesen (Partizip II dari lesen).",
      "Sie (subjek) + sind (sein terkonjugasi) + in den Urlaub (arah) + gefahren (Partizip II dari fahren)."
    ],
    "pronunciationTips": "Perhatikan pelafalan huruf 'r' dalam bahasa Jerman. Ada dua variasi utama: 'r' yang diucapkan di bagian belakang tenggorokan (seperti 'r' Prancis atau 'gh' Arab) dan 'r' yang diucapkan di ujung lidah (seperti 'r' Spanyol). Di akhir suku kata atau kata, 'r' seringkali menjadi vokal 'a' yang samar (misalnya 'Lehrer' terdengar seperti 'LE-ra'). Latih untuk mendengar dan menirunya.",
    "vocabulary": [
      {
        "id": "v-gen-238",
        "word": "gesehen",
        "translation": "telah melihat (Partizip II dari sehen)",
        "exampleSentence": "Ich habe den Film gesehen.",
        "phonetic": "ge-ZEE-en",
        "level": "A2"
      },
      {
        "id": "v-gen-239",
        "word": "gegangen",
        "translation": "telah pergi (Partizip II dari gehen)",
        "exampleSentence": "Sie ist nach Hause gegangen.",
        "phonetic": "ge-GANG-en",
        "level": "A2"
      },
      {
        "id": "v-gen-240",
        "word": "gelacht",
        "translation": "telah tertawa (Partizip II dari lachen)",
        "exampleSentence": "Wir haben viel gelacht.",
        "phonetic": "ge-LAKHT",
        "level": "A2"
      },
      {
        "id": "v-gen-241",
        "word": "eingeschlafen",
        "translation": "telah tertidur (Partizip II dari einschlafen)",
        "exampleSentence": "Er ist schnell eingeschlafen.",
        "phonetic": "AIN-ge-shla-fen",
        "level": "A2"
      },
      {
        "id": "v-gen-242",
        "word": "gelesen",
        "translation": "telah membaca (Partizip II dari lesen)",
        "exampleSentence": "Hast du das Buch gelesen?",
        "phonetic": "ge-LEE-zen",
        "level": "A2"
      },
      {
        "id": "v-gen-243",
        "word": "gefahren",
        "translation": "telah mengemudi/pergi (Partizip II dari fahren)",
        "exampleSentence": "Sie sind in den Urlaub gefahren.",
        "phonetic": "ge-FAH-ren",
        "level": "A2"
      },
      {
        "id": "v-gen-244",
        "word": "gekocht",
        "translation": "telah memasak (Partizip II dari kochen)",
        "exampleSentence": "Ich habe gestern gekocht.",
        "phonetic": "ge-KOKHT",
        "level": "A2"
      },
      {
        "id": "v-gen-245",
        "word": "gekauft",
        "translation": "telah membeli (Partizip II dari kaufen)",
        "exampleSentence": "Wir haben ein neues Auto gekauft.",
        "phonetic": "ge-KAUFT",
        "level": "A2"
      },
      {
        "id": "v-gen-246",
        "word": "getrunken",
        "translation": "telah minum (Partizip II dari trinken)",
        "exampleSentence": "Hast du genug Wasser getrunken?",
        "phonetic": "ge-TRUN-ken",
        "level": "A2"
      },
      {
        "id": "v-gen-247",
        "word": "geschrieben",
        "translation": "telah menulis (Partizip II dari schreiben)",
        "exampleSentence": "Ich habe einen Brief geschrieben.",
        "phonetic": "ge-SHREE-ben",
        "level": "A2"
      },
      {
        "id": "v-gen-248",
        "word": "gewesen",
        "translation": "telah ada/pernah (Partizip II dari sein)",
        "exampleSentence": "Ich bin in Berlin gewesen.",
        "phonetic": "ge-VEE-zen",
        "level": "A2"
      },
      {
        "id": "v-gen-249",
        "word": "der Film",
        "translation": "film",
        "exampleSentence": "Ich habe einen interessanten Film gesehen.",
        "phonetic": "der FILM",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-250",
        "word": "die Hausaufgaben (plural)",
        "translation": "pekerjaan rumah",
        "exampleSentence": "Ich habe meine Hausaufgaben gemacht.",
        "phonetic": "dee HAUS-auf-ga-ben",
        "level": "A2",
        "article": "die"
      },
      {
        "id": "v-gen-251",
        "word": "der Urlaub",
        "translation": "liburan",
        "exampleSentence": "Wir sind in den Urlaub gefahren.",
        "phonetic": "der OOR-laub",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-252",
        "word": "gestern",
        "translation": "kemarin",
        "exampleSentence": "Gestern habe ich meine Freunde getroffen.",
        "phonetic": "GES-tern",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: 'Ich ____ gestern Pizza ____.'",
        "options": [
          "habe, gegessen",
          "bin, gegessen",
          "habe, gegessen haben",
          "bin, gegessen sein"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih kata kerja bantu yang benar: 'Sie ____ nach Berlin gefahren.'",
        "options": [
          "hat",
          "ist",
          "wird",
          "war"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa Partizip II dari 'schreiben'?",
        "options": [
          "geschrieben",
          "geschreibt",
          "schrieben",
          "schreibt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat mana yang benar dalam Perfekt?",
        "options": [
          "Wir haben ein Buch gelesen.",
          "Er ist den Film gesehen.",
          "Ich bin meine Hausaufgaben gemacht.",
          "Du hast nach Hause gegangen."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kapan kita menggunakan 'sein' sebagai kata kerja bantu dalam Perfekt?",
        "options": [
          "Untuk kata kerja transitif",
          "Untuk kata kerja yang menunjukkan pergerakan atau perubahan kondisi",
          "Untuk kata kerja modal",
          "Untuk kata kerja refleksif"
        ],
        "correctAnswer": 1
      }
    ],
    "miniQuiz": [
      {
        "question": "Lengkapi kalimat: 'Ich ____ in Deutschland ____.' (pernah berada)",
        "options": [
          "habe, gewesen",
          "bin, gewesen",
          "habe, war",
          "bin, war"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa Partizip II dari 'kaufen'?",
        "options": [
          "gekauft",
          "gekauften",
          "kaufen",
          "kauft"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat 'Er hat viel gearbeitet.' berarti:",
        "options": [
          "Dia banyak bekerja (sekarang).",
          "Dia akan banyak bekerja.",
          "Dia telah banyak bekerja.",
          "Dia harus banyak bekerja."
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Was hast du am Wochenende gemacht?",
        "personB": "Ich habe meine Freunde getroffen und wir sind ins Kino gegangen.",
        "translation": "A: Apa yang kamu lakukan akhir pekan lalu?\nB: Saya bertemu teman-teman saya dan kami pergi ke bioskop."
      },
      {
        "personA": "Bist du schon einmal in Berlin gewesen?",
        "personB": "Ja, ich bin letztes Jahr dort gewesen. Es war sehr schön!",
        "translation": "A: Apakah kamu pernah ke Berlin?\nB: Ya, saya pernah ke sana tahun lalu. Itu sangat indah!"
      },
      {
        "personA": "Hast du deine Hausaufgaben schon gemacht?",
        "personB": "Ja, ich habe sie schon gemacht. Jetzt kann ich entspannen.",
        "translation": "A: Apakah kamu sudah mengerjakan pekerjaan rumahmu?\nB: Ya, saya sudah mengerjakannya. Sekarang saya bisa bersantai."
      }
    ],
    "culturalNotes": "Di Jerman, Perfekt adalah bentuk waktu lampau yang dominan dalam percakapan sehari-hari. Meskipun ada bentuk waktu lampau lain (Präteritum), Perfekt lebih sering digunakan untuk menceritakan kejadian di masa lalu. Ini berbeda dengan bahasa Inggris yang sering menggunakan Simple Past untuk kejadian yang sudah selesai."
  },
  {
    "id": "a2-5",
    "canDoGoals": [
      "Bercerita kejadian lampau (written past/Präteritum) untuk sein & haben",
      "Menggunakan Präteritum untuk Modal Verben (konnte, musste...)",
      "Mengetahui perbedaan penggunaan Perfekt dan Präteritum"
    ],
    "level": "A2",
    "title": "Waktu Lampau: Präteritum (sein/haben/modals)",
    "grammarDescription": "Präteritum (juga dikenal sebagai Imperfekt) adalah bentuk waktu lampau lain dalam bahasa Jerman. Meskipun Perfekt lebih sering digunakan dalam percakapan sehari-hari, Präteritum sangat penting untuk:\n1.  **Narasi tertulis:** Digunakan dalam buku, cerita, berita, dan laporan.\n2.  **Kata kerja tertentu dalam percakapan:** Terutama untuk kata kerja 'sein' (to be), 'haben' (to have), dan kata kerja modal (können, müssen, wollen, dürfen, sollen, mögen).\n\n**Konjugasi Präteritum untuk 'sein', 'haben', dan Modal Verben:**\nIni adalah bentuk yang paling penting untuk dihafal karena sering muncul dalam percakapan.\n\n**sein (to be):**\n| Pronomen | Präteritum |\n|----------|------------|\n| ich      | war        |\n| du       | warst      |\n| er/sie/es| war        |\n| wir      | waren      |\n| ihr      | wart       |\n| sie/Sie  | waren      |\n\nContoh: Ich **war** gestern müde. (Saya kemarin lelah.)\n\n**haben (to have):**\n| Pronomen | Präteritum |\n|----------|------------|\n| ich      | hatte      |\n| du       | hattest    |\n| er/sie/es| hatte      |\n| wir      | hatten     |\n| ihr      | hattet     |\n| sie/Sie  | hatten     |\n\nContoh: Er **hatte** viel Arbeit. (Dia punya banyak pekerjaan.)\n\n**Modal Verben (können, müssen, wollen, dürfen):**\nModal verben dalam Präteritum juga sering digunakan. Perhatikan bahwa umlaut (ä, ö, ü) seringkali hilang dalam bentuk Präteritum.\n\n| Pronomen | können (konnte) | müssen (musste) | wollen (wollte) | dürfen (durfte) |\n|----------|-----------------|-----------------|-----------------|-----------------|\n| ich      | konnte          | musste          | wollte          | durfte          |\n| du       | konntest        | musstest        | wolltest        | durftest        |\n| er/sie/es| konnte          | musste          | wollte          | durfte          |\n| wir      | konnten        | mussten         | wollten         | durften         |\n| ihr      | konntet         | musstet         | wolltet         | durftet         |\n| sie/Sie  | konnten        | mussten         | wollten         | durften         |\n\nContoh: Ich **konnte** nicht kommen. (Saya tidak bisa datang.)\nContoh: Sie **wollte** nach Hause gehen. (Dia ingin pulang ke rumah.)\n\nUntuk kata kerja reguler dan ireguler lainnya, Präteritum biasanya hanya digunakan dalam tulisan. Pembentukannya berbeda-beda dan perlu dihafal untuk kata kerja ireguler.",
    "sentenceBreakdowns": [
      "Ich (subjek) + war (sein Präteritum) + gestern (adverb waktu) + im Kino (lokasi).",
      "Er (subjek) + hatte (haben Präteritum) + keine Zeit (objek Akkusativ).",
      "Wir (subjek) + konnten (können Präteritum) + nicht (negasi) + kommen (infinitif).",
      "Sie (subjek) + wollte (wollen Präteritum) + ein neues Kleid (objek Akkusativ) + kaufen (infinitif).",
      "Du (subjek) + durftest (dürfen Präteritum) + das nicht (objek Akkusativ) + machen (infinitif).",
      "Die Kinder (subjek) + mussten (müssen Präteritum) + früh (adverb) + ins Bett (arah) + gehen (infinitif)."
    ],
    "pronunciationTips": "Perhatikan pelafalan huruf 's'. Di awal kata atau suku kata, 's' sering diucapkan seperti 'z' dalam 'zebra' (voiced), contoh: 'sehen', 'Sonne'. Di akhir kata atau sebelum konsonan, 's' diucapkan seperti 's' dalam 'susu' (unvoiced), contoh: 'Haus', 'ist'. Kombinasi 'sp' dan 'st' di awal kata diucapkan 'shp' dan 'sht', contoh: 'sprechen', 'Straße'.",
    "vocabulary": [
      {
        "id": "v-gen-253",
        "word": "war",
        "translation": "dulu (Präteritum dari sein)",
        "exampleSentence": "Ich war gestern im Park.",
        "phonetic": "VAR",
        "level": "A2"
      },
      {
        "id": "v-gen-254",
        "word": "hatte",
        "translation": "dulu punya (Präteritum dari haben)",
        "exampleSentence": "Er hatte viel Glück.",
        "phonetic": "HAT-te",
        "level": "A2"
      },
      {
        "id": "v-gen-255",
        "word": "konnte",
        "translation": "dulu bisa (Präteritum dari können)",
        "exampleSentence": "Ich konnte nicht schlafen.",
        "phonetic": "KON-te",
        "level": "A2"
      },
      {
        "id": "v-gen-256",
        "word": "musste",
        "translation": "dulu harus (Präteritum dari müssen)",
        "exampleSentence": "Sie musste arbeiten.",
        "phonetic": "MUS-te",
        "level": "A2"
      },
      {
        "id": "v-gen-257",
        "word": "wollte",
        "translation": "dulu ingin (Präteritum dari wollen)",
        "exampleSentence": "Er wollte ein Eis.",
        "phonetic": "VOL-te",
        "level": "A2"
      },
      {
        "id": "v-gen-258",
        "word": "durfte",
        "translation": "dulu boleh (Präteritum dari dürfen)",
        "exampleSentence": "Wir durften nicht spielen.",
        "phonetic": "DUR-fte",
        "level": "A2"
      },
      {
        "id": "v-gen-259",
        "word": "gestern",
        "translation": "kemarin",
        "exampleSentence": "Gestern war ich krank.",
        "phonetic": "GES-tern",
        "level": "A2"
      },
      {
        "id": "v-gen-260",
        "word": "müde",
        "translation": "lelah",
        "exampleSentence": "Ich war sehr müde.",
        "phonetic": "MÜ-de",
        "level": "A2"
      },
      {
        "id": "v-gen-261",
        "word": "keine Zeit",
        "translation": "tidak ada waktu",
        "exampleSentence": "Ich hatte leider keine Zeit.",
        "phonetic": "KAI-ne TSAIT",
        "level": "A2"
      },
      {
        "id": "v-gen-262",
        "word": "das Kleid",
        "translation": "gaun",
        "exampleSentence": "Sie wollte ein neues Kleid kaufen.",
        "phonetic": "das KLAID",
        "level": "A2",
        "article": "das"
      },
      {
        "id": "v-gen-263",
        "word": "früh",
        "translation": "pagi",
        "exampleSentence": "Wir mussten früh aufstehen.",
        "phonetic": "FRÜ",
        "level": "A2"
      },
      {
        "id": "v-gen-264",
        "word": "das Bett",
        "translation": "tempat tidur",
        "exampleSentence": "Die Kinder mussten ins Bett gehen.",
        "phonetic": "das BET",
        "level": "A2",
        "article": "das"
      },
      {
        "id": "v-gen-265",
        "word": "der Park",
        "translation": "taman",
        "exampleSentence": "Ich war gestern im Park.",
        "phonetic": "der PARK",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-266",
        "word": "das Glück",
        "translation": "keberuntungan",
        "exampleSentence": "Er hatte viel Glück.",
        "phonetic": "das GLÜK",
        "level": "A2",
        "article": "das"
      },
      {
        "id": "v-gen-267",
        "word": "schlafen",
        "translation": "tidur",
        "exampleSentence": "Ich konnte nicht schlafen.",
        "phonetic": "SHLA-fen",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Pilih bentuk Präteritum yang benar untuk 'sein' (ich):",
        "options": [
          "bin",
          "war",
          "habe",
          "wäre"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Wir ____ viel Spaß.' (dulu punya)",
        "options": [
          "haben",
          "hatten",
          "waren",
          "sind"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa bentuk Präteritum dari 'können' (er/sie/es)?",
        "options": [
          "kann",
          "konnte",
          "könnte",
          "können"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Kalimat mana yang menggunakan Präteritum dengan benar?",
        "options": [
          "Ich habe gestern müde.",
          "Sie war gestern im Kino.",
          "Er hat keine Zeit gehabt.",
          "Wir sind nicht kommen können."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Kapan Präteritum paling sering digunakan dalam percakapan?",
        "options": [
          "Untuk semua kata kerja",
          "Hanya untuk kata kerja reguler",
          "Terutama untuk 'sein', 'haben', dan modal verben",
          "Hanya untuk menceritakan masa depan"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Lengkapi kalimat: 'Du ____ nicht kommen.' (dulu tidak boleh)",
        "options": [
          "darfst",
          "durftest",
          "dürftest",
          "darf"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Bentuk Präteritum dari 'wollen' untuk 'ich' adalah:",
        "options": [
          "will",
          "wollte",
          "wolltest",
          "wollen"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Kalimat 'Ich hatte einen Hund.' berarti:",
        "options": [
          "Saya punya anjing (sekarang).",
          "Saya akan punya anjing.",
          "Saya dulu punya anjing.",
          "Saya harus punya anjing."
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Wie war dein Urlaub?",
        "personB": "Es war toll! Ich war in Italien und hatte viel Spaß.",
        "translation": "A: Bagaimana liburanmu?\nB: Itu luar biasa! Saya di Italia dan bersenang-senang."
      },
      {
        "personA": "Warum konntest du gestern nicht kommen?",
        "personB": "Ich musste leider arbeiten. Ich hatte keine Zeit.",
        "translation": "A: Mengapa kamu tidak bisa datang kemarin?\nB: Saya harus bekerja. Saya tidak punya waktu."
      },
      {
        "personA": "Was wollte er dir sagen?",
        "personB": "Er wollte mir erzählen, dass er umzieht.",
        "translation": "A: Apa yang ingin dia katakan padamu?\nB: Dia ingin memberitahuku bahwa dia akan pindah."
      }
    ],
    "culturalNotes": "Meskipun Perfekt mendominasi percakapan, penggunaan Präteritum untuk 'sein', 'haben', dan modal verben dalam percakapan sehari-hari adalah tanda kemahiran. Ini membuat ucapan terdengar lebih alami dan ringkas, terutama ketika menceritakan sesuatu yang sudah berlalu atau menyatakan kondisi di masa lalu."
  },
  {
    "id": "a2-6",
    "canDoGoals": [
      "Mengenali 9 Wechselpräpositionen (in, an, auf, über, unter, vor, hinter, neben, zwischen)",
      "Menggunakan kasus Dativ untuk menunjukkan lokasi statis (Wo?)",
      "Menggunakan kasus Akkusativ untuk menunjukkan perpindahan terarah (Wohin?)"
    ],
    "level": "A2",
    "title": "Wechselpräpositionen (in/an/auf + Dat vs Akk)",
    "grammarDescription": "Wechselpräpositionen (preposisi dua arah) adalah preposisi yang bisa diikuti oleh kasus Dativ atau Akkusativ, tergantung pada konteksnya. Ada sembilan preposisi dua arah: in (di/ke dalam), an (di/ke samping), auf (di/ke atas), hinter (di/ke belakang), neben (di/ke samping), über (di/ke atas/melintasi), unter (di/ke bawah), vor (di/ke depan), zwischen (di/ke antara).\n\n**Aturan Umum:**\n1.  **Dativ (Lokasi/Keberadaan):** Digunakan ketika ada pertanyaan 'Wo?' (Di mana?). Ini menunjukkan posisi statis atau tidak ada pergerakan menuju suatu tempat.\n    *   Contoh: Ich bin **im** Haus. (Saya di dalam rumah.)\n    *   'im' adalah singkatan dari 'in dem' (in + Dativ maskulin/netral)\n\n2.  **Akkusativ (Arah/Pergerakan):** Digunakan ketika ada pertanyaan 'Wohin?' (Ke mana?). Ini menunjukkan pergerakan menuju suatu tempat atau perubahan lokasi.\n    *   Contoh: Ich gehe **ins** Haus. (Saya pergi ke dalam rumah.)\n    *   'ins' adalah singkatan dari 'in das' (in + Akkusativ netral)\n\n**Singkatan Umum:**\n*   **in + dem = im** (Dativ maskulin/netral)\n*   **in + das = ins** (Akkusativ netral)\n*   **an + dem = am** (Dativ maskulin/netral)\n*   **an + das = ans** (Akkusativ netral)\n*   **auf + das = aufs** (Akkusativ netral)\n\n**Contoh dengan Preposisi Lain:**\n*   **an:**\n    *   Wo? (Dativ): Das Bild hängt **an der** Wand. (Gambar itu tergantung di dinding.)\n    *   Wohin? (Akkusativ): Ich hänge das Bild **an die** Wand. (Saya menggantung gambar itu ke dinding.)\n*   **auf:**\n    *   Wo? (Dativ): Die Katze sitzt **auf dem** Stuhl. (Kucing itu duduk di atas kursi.)\n    *   Wohin? (Akkusativ): Die Katze springt **auf den** Stuhl. (Kucing itu melompat ke atas kursi.)\n\nKunci untuk memahami Wechselpräpositionen adalah membedakan antara 'lokasi' (Dativ) dan 'arah' (Akkusativ).",
    "sentenceBreakdowns": [
      "Ich (subjek) + bin (verb sein) + im (in + dem Dativ) + Garten (lokasi).",
      "Wir (subjek) + gehen (verb gehen) + in den (in + den Akkusativ) + Park (arah).",
      "Das Buch (subjek) + liegt (verb liegen) + auf dem (auf + dem Dativ) + Tisch (lokasi).",
      "Er (subjek) + legt (verb legen) + das Handy (objek Akkusativ) + auf den (auf + den Akkusativ) + Tisch (arah).",
      "Die Lampe (subjek) + hängt (verb hängen) + über dem (über + dem Dativ) + Bett (lokasi).",
      "Ich (subjek) + stelle (verb stellen) + die Vase (objek Akkusativ) + auf den (auf + den Akkusativ) + Schrank (arah)."
    ],
    "pronunciationTips": "Perhatikan perbedaan pelafalan 'v' dan 'w'.\n- 'v' dalam bahasa Jerman sering diucapkan seperti 'f' dalam 'foto' (misalnya 'Vater', 'viel'). Namun, dalam kata serapan, bisa juga seperti 'v' dalam 'video' (misalnya 'Vase').\n- 'w' dalam bahasa Jerman selalu diucapkan seperti 'v' dalam 'video' (misalnya 'Wasser', 'was', 'wo').\nLatih untuk membedakan keduanya, terutama 'v' yang bisa bervariasi.",
    "vocabulary": [
      {
        "id": "v-gen-268",
        "word": "in",
        "translation": "di/ke dalam",
        "exampleSentence": "Ich bin im Haus. Ich gehe ins Haus.",
        "phonetic": "IN",
        "level": "A2"
      },
      {
        "id": "v-gen-269",
        "word": "an",
        "translation": "di/ke samping",
        "exampleSentence": "Das Bild hängt an der Wand. Ich hänge das Bild an die Wand.",
        "phonetic": "AN",
        "level": "A2"
      },
      {
        "id": "v-gen-270",
        "word": "auf",
        "translation": "di/ke atas",
        "exampleSentence": "Die Katze sitzt auf dem Stuhl. Sie springt auf den Stuhl.",
        "phonetic": "AUF",
        "level": "A2"
      },
      {
        "id": "v-gen-271",
        "word": "hinter",
        "translation": "di/ke belakang",
        "exampleSentence": "Der Ball ist hinter dem Baum. Ich werfe den Ball hinter den Baum.",
        "phonetic": "HIN-ter",
        "level": "A2"
      },
      {
        "id": "v-gen-272",
        "word": "neben",
        "translation": "di/ke samping",
        "exampleSentence": "Das Auto steht neben dem Haus. Ich parke das Auto neben das Haus.",
        "phonetic": "NE-ben",
        "level": "A2"
      },
      {
        "id": "v-gen-273",
        "word": "über",
        "translation": "di/ke atas/melintasi",
        "exampleSentence": "Die Lampe hängt über dem Tisch. Ich hänge die Lampe über den Tisch.",
        "phonetic": "Ü-ber",
        "level": "A2"
      },
      {
        "id": "v-gen-274",
        "word": "unter",
        "translation": "di/ke bawah",
        "exampleSentence": "Der Hund liegt unter dem Tisch. Er kriecht unter den Tisch.",
        "phonetic": "UN-ter",
        "level": "A2"
      },
      {
        "id": "v-gen-275",
        "word": "vor",
        "translation": "di/ke depan",
        "exampleSentence": "Das Fahrrad steht vor der Tür. Ich stelle das Fahrrad vor die Tür.",
        "phonetic": "FOR",
        "level": "A2"
      },
      {
        "id": "v-gen-276",
        "word": "zwischen",
        "translation": "di/ke antara",
        "exampleSentence": "Der Stuhl steht zwischen den Tischen. Ich stelle den Stuhl zwischen die Tische.",
        "phonetic": "TSVI-shen",
        "level": "A2"
      },
      {
        "id": "v-gen-277",
        "word": "der Garten",
        "translation": "taman",
        "exampleSentence": "Ich bin im Garten.",
        "phonetic": "der GAR-ten",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-278",
        "word": "der Park",
        "translation": "taman",
        "exampleSentence": "Wir gehen in den Park.",
        "phonetic": "der PARK",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-279",
        "word": "der Tisch",
        "translation": "meja",
        "exampleSentence": "Das Buch liegt auf dem Tisch.",
        "phonetic": "der TISH",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-280",
        "word": "die Wand",
        "translation": "dinding",
        "exampleSentence": "Das Bild hängt an der Wand.",
        "phonetic": "dee VANT",
        "level": "A2",
        "article": "die"
      },
      {
        "id": "v-gen-281",
        "word": "der Stuhl",
        "translation": "kursi",
        "exampleSentence": "Die Katze sitzt auf dem Stuhl.",
        "phonetic": "der SHTOOL",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-282",
        "word": "liegen",
        "translation": "terletak/berbaring (statis)",
        "exampleSentence": "Das Handy liegt auf dem Tisch.",
        "phonetic": "LEE-gen",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: 'Ich stelle die Vase ____ den Tisch.' (ke atas)",
        "options": [
          "auf dem",
          "auf den",
          "an dem",
          "an den"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Pilih preposisi dan kasus yang benar: 'Das Buch liegt ____ Schrank.' (di dalam)",
        "options": [
          "in dem",
          "in den",
          "an dem",
          "an den"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat mana yang menunjukkan pergerakan (Akkusativ)?",
        "options": [
          "Die Katze schläft unter dem Bett.",
          "Ich gehe in die Küche.",
          "Das Auto steht vor dem Haus.",
          "Der Stuhl ist zwischen den Tischen."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa singkatan dari 'an das'?",
        "options": [
          "am",
          "ans",
          "im",
          "ins"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Das Bild hängt ____ Wand.' (di dinding)",
        "options": [
          "an die",
          "an der",
          "auf die",
          "auf der"
        ],
        "correctAnswer": 1
      }
    ],
    "miniQuiz": [
      {
        "question": "Lengkapi kalimat: 'Wir sitzen ____ Café.' (di)",
        "options": [
          "in dem",
          "in das",
          "an dem",
          "an das"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat 'Ich lege das Buch auf den Tisch.' menggunakan kasus apa setelah 'auf'?",
        "options": [
          "Nominativ",
          "Akkusativ",
          "Dativ",
          "Genitiv"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Preposisi mana yang bukan Wechselpräposition?",
        "options": [
          "mit",
          "in",
          "auf",
          "vor"
        ],
        "correctAnswer": 0
      }
    ],
    "dialogues": [
      {
        "personA": "Wo ist mein Handy?",
        "personB": "Es liegt auf dem Tisch, neben der Lampe.",
        "translation": "A: Di mana ponselku?\nB: Itu ada di atas meja, di samping lampu."
      },
      {
        "personA": "Wohin soll ich die Blumen stellen?",
        "personB": "Stell sie bitte auf den Tisch, in die Mitte.",
        "translation": "A: Ke mana saya harus meletakkan bunga-bunga ini?\nB: Tolong letakkan di atas meja, di tengah."
      },
      {
        "personA": "Wir fahren in die Berge am Wochenende.",
        "personB": "Oh, schön! Ich war letztes Jahr auch in den Bergen.",
        "translation": "A: Kami akan pergi ke pegunungan akhir pekan ini.\nB: Oh, bagus! Saya juga di pegunungan tahun lalu."
      }
    ],
    "culturalNotes": "Presisi dalam penggunaan preposisi dan kasus adalah ciri khas bahasa Jerman. Kesalahan dalam memilih Dativ atau Akkusativ dengan Wechselpräpositionen dapat mengubah makna kalimat secara signifikan. Ini mencerminkan cara berpikir yang terstruktur dan detail dalam budaya berbahasa Jerman."
  },
  {
    "checkpoint": {
      "id": "a2-checkpoint-2",
      "title": "Review Konten Sebelumnya",
      "requiredScore": 0.7,
      "questions": [
        {
          "question": "Lengkapi kalimat Perfekt: 'Ich ____ gestern einen Film ____.'",
          "options": [
            "bin, gesehen",
            "habe, gesehen",
            "bin, sehen",
            "habe, sehen"
          ],
          "correctAnswer": 1
        },
        {
          "question": "Pilih bentuk Präteritum yang benar untuk 'haben' (er/sie/es):",
          "options": [
            "hat",
            "hatte",
            "habt",
            "hätte"
          ],
          "correctAnswer": 1
        },
        {
          "question": "Kalimat mana yang menggunakan Akkusativ dengan Wechselpräposition?",
          "options": [
            "Das Buch liegt auf dem Tisch.",
            "Ich gehe in den Park.",
            "Die Katze sitzt unter dem Stuhl.",
            "Das Bild hängt an der Wand."
          ],
          "correctAnswer": 1
        },
        {
          "question": "Apa Partizip II dari 'gehen'?",
          "options": [
            "gegangen",
            "gegeht",
            "gehen",
            "ging"
          ],
          "correctAnswer": 0
        },
        {
          "question": "Lengkapi kalimat: 'Sie ____ nicht kommen.' (dulu tidak bisa)",
          "options": [
            "kann",
            "konnte",
            "könnte",
            "können"
          ],
          "correctAnswer": 1
        },
        {
          "question": "Preposisi 'in' diikuti Dativ jika menjawab pertanyaan apa?",
          "options": [
            "Wohin?",
            "Wann?",
            "Wo?",
            "Wie?"
          ],
          "correctAnswer": 2
        },
        {
          "question": "Kalimat 'Wir sind nach Hause gefahren.' menggunakan kata kerja bantu apa?",
          "options": [
            "haben",
            "sein",
            "werden",
            "dürfen"
          ],
          "correctAnswer": 1
        },
        {
          "question": "Apa singkatan dari 'in dem'?",
          "options": [
            "ins",
            "im",
            "am",
            "ans"
          ],
          "correctAnswer": 1
        },
        {
          "question": "Dalam kalimat 'Ich wollte ein Eis.', 'wollte' adalah bentuk waktu apa?",
          "options": [
            "Präsens",
            "Perfekt",
            "Präteritum",
            "Futur I"
          ],
          "correctAnswer": 2
        },
        {
          "question": "Kata kerja mana yang menggunakan 'sein' sebagai kata kerja bantu dalam Perfekt?",
          "options": [
            "essen",
            "kaufen",
            "schlafen",
            "fliegen"
          ],
          "correctAnswer": 3
        }
      ],
      "reviewLessons": [
        "a2-4",
        "a2-5",
        "a2-6"
      ]
    },
    "id": "a2-7",
    "canDoGoals": [
      "Membandingkan sifat benda menggunakan Komparativ (... + -er als)",
      "Menggambarkan tingkatan tertinggi dengan Superlativ (am ... + -sten)",
      "Memahami bentuk irregular dari Adjektiv (gut, viel, gern)"
    ],
    "level": "A2",
    "title": "Komparativ & Superlativ",
    "grammarDescription": "Komparativ dan Superlativ digunakan untuk membandingkan kualitas atau karakteristik benda, orang, atau tindakan. Ini adalah bentuk perbandingan dari kata sifat (Adjektive) dan kata keterangan (Adverbien).\n\n**1. Komparativ (Perbandingan Lebih):**\nDigunakan untuk membandingkan dua hal dan menunjukkan bahwa satu lebih dari yang lain. Dibentuk dengan menambahkan akhiran '-er' pada kata sifat/keterangan.\n\n*   **Struktur:** Adjektiv/Adverb + -er + als (daripada)\n*   Contoh: schnell -> schneller (lebih cepat)\n    *   Mein Auto ist **schneller als** deins. (Mobil saya lebih cepat daripada milikmu.)\n*   Beberapa kata sifat dengan vokal 'a', 'o', 'u' mendapatkan umlaut (ä, ö, ü) di Komparativ.\n    *   alt -> älter (lebih tua), jung -> jünger (lebih muda), groß -> größer (lebih besar)\n\n**2. Superlativ (Perbandingan Paling):**\nDigunakan untuk membandingkan tiga atau lebih hal dan menunjukkan bahwa satu adalah yang paling dari semuanya. Ada dua bentuk Superlativ:\n\na.  **Bentuk Predikatif (dengan 'am'):** Digunakan ketika kata sifat/keterangan berfungsi sebagai predikat (setelah kata kerja).\n    *   **Struktur:** am + Adjektiv/Adverb + -sten\n    *   Contoh: schnell -> am schnellsten (paling cepat)\n        *   Mein Auto fährt **am schnellsten**. (Mobil saya melaju paling cepat.)\n    *   Jika kata sifat berakhir dengan -d, -t, -s, -ß, -x, -z, ditambahkan -esten.\n        *   breit -> am breitesten (paling lebar)\n\nb.  **Bentuk Atributif (dengan artikel):** Digunakan ketika kata sifat/keterangan berfungsi sebagai atribut (sebelum kata benda).\n    *   **Struktur:** der/die/das + Adjektiv/Adverb + -ste + kata benda\n    *   Contoh: schnell -> der schnellste (yang paling cepat)\n        *   Das ist **das schnellste Auto**, das ich kenne. (Itu adalah mobil tercepat yang saya tahu.)\n\n**Bentuk Ireguler:**\nBeberapa kata sifat memiliki bentuk Komparativ dan Superlativ yang ireguler dan harus dihafal:\n*   gut -> besser -> am besten (baik -> lebih baik -> terbaik)\n*   gern -> lieber -> am liebsten (suka -> lebih suka -> paling suka)\n*   viel -> mehr -> am meisten (banyak -> lebih banyak -> paling banyak)\n*   hoch -> höher -> am höchsten (tinggi -> lebih tinggi -> tertinggi)\n*   nah -> näher -> am nächsten (dekat -> lebih dekat -> terdekat)",
    "sentenceBreakdowns": [
      "Mein Bruder (subjek) + ist (verb sein) + älter (Komparativ dari alt) + als (daripada) + ich (objek perbandingan).",
      "Dieses Buch (subjek) + ist (verb sein) + interessanter (Komparativ dari interessant) + als (daripada) + jenes (objek perbandingan).",
      "Sie (subjek) + spricht (verb sprechen) + am schnellsten (Superlativ predikatif dari schnell) + in der Gruppe (lokasi).",
      "Das ist (verb sein) + der größte (Superlativ atributif dari groß) + Baum (kata benda) + im Wald (lokasi).",
      "Ich (subjek) + esse (verb essen) + am liebsten (Superlativ ireguler dari gern) + Pizza (objek Akkusativ).",
      "Er (subjek) + fährt (verb fahren) + schneller (Komparativ dari schnell) + als (daripada) + sein Freund (objek perbandingan)."
    ],
    "pronunciationTips": "Perhatikan pelafalan huruf 'z'. Dalam bahasa Jerman, 'z' selalu diucapkan seperti 'ts' dalam 'tsunami' atau 'cats' (Inggris). Contoh: 'Zeit' (waktu), 'zahlen' (membayar), 'Herz' (hati). Latih untuk mengucapkan 'ts' dengan cepat dan jelas.",
    "vocabulary": [
      {
        "id": "v-gen-283",
        "word": "schnell",
        "translation": "cepat",
        "exampleSentence": "Mein Auto ist schnell. Es fährt am schnellsten.",
        "phonetic": "SHNEL",
        "level": "A2"
      },
      {
        "id": "v-gen-284",
        "word": "alt",
        "translation": "tua",
        "exampleSentence": "Er ist älter als ich.",
        "phonetic": "ALT",
        "level": "A2"
      },
      {
        "id": "v-gen-285",
        "word": "jung",
        "translation": "muda",
        "exampleSentence": "Sie ist jünger als ihr Bruder.",
        "phonetic": "YUNG",
        "level": "A2"
      },
      {
        "id": "v-gen-286",
        "word": "groß",
        "translation": "besar/tinggi",
        "exampleSentence": "Das ist der größte Baum.",
        "phonetic": "GROS",
        "level": "A2"
      },
      {
        "id": "v-gen-287",
        "word": "gut",
        "translation": "baik",
        "exampleSentence": "Er ist besser als ich.",
        "phonetic": "GOOT",
        "level": "A2"
      },
      {
        "id": "v-gen-288",
        "word": "gern",
        "translation": "suka",
        "exampleSentence": "Ich esse gern Pizza. Am liebsten esse ich Pizza.",
        "phonetic": "GERN",
        "level": "A2"
      },
      {
        "id": "v-gen-289",
        "word": "viel",
        "translation": "banyak",
        "exampleSentence": "Er hat mehr Geld als ich.",
        "phonetic": "FEEL",
        "level": "A2"
      },
      {
        "id": "v-gen-290",
        "word": "hoch",
        "translation": "tinggi",
        "exampleSentence": "Der Berg ist höher als der Hügel.",
        "phonetic": "HOKH",
        "level": "A2"
      },
      {
        "id": "v-gen-291",
        "word": "nah",
        "translation": "dekat",
        "exampleSentence": "Der Supermarkt ist näher als das Kino.",
        "phonetic": "NAH",
        "level": "A2"
      },
      {
        "id": "v-gen-292",
        "word": "interessant",
        "translation": "menarik",
        "exampleSentence": "Dieses Buch ist interessanter.",
        "phonetic": "in-te-re-SANT",
        "level": "A2"
      },
      {
        "id": "v-gen-293",
        "word": "schön",
        "translation": "indah/cantik",
        "exampleSentence": "Das ist die schönste Blume.",
        "phonetic": "SHÖN",
        "level": "A2"
      },
      {
        "id": "v-gen-294",
        "word": "klein",
        "translation": "kecil",
        "exampleSentence": "Mein Zimmer ist kleiner als deins.",
        "phonetic": "KLAIN",
        "level": "A2"
      },
      {
        "id": "v-gen-295",
        "word": "der Baum",
        "translation": "pohon",
        "exampleSentence": "Das ist der größte Baum im Wald.",
        "phonetic": "der BAUM",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-296",
        "word": "das Auto",
        "translation": "mobil",
        "exampleSentence": "Mein Auto ist schneller als deins.",
        "phonetic": "das AU-to",
        "level": "A2",
        "article": "das"
      },
      {
        "id": "v-gen-297",
        "word": "der Freund",
        "translation": "teman (laki-laki)",
        "exampleSentence": "Er ist mein bester Freund.",
        "phonetic": "der FROINT",
        "level": "A2",
        "article": "der"
      }
    ],
    "exercises": [
      {
        "question": "Pilih bentuk Komparativ yang benar dari 'klein':",
        "options": [
          "kleiner",
          "kleinsten",
          "kleinste",
          "klein"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat: 'Sie ist ____ als ihr Bruder.' (lebih muda)",
        "options": [
          "junger",
          "jünger",
          "am jüngsten",
          "jüngste"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa bentuk Superlativ predikatif dari 'gut'?",
        "options": [
          "besser",
          "am besten",
          "beste",
          "gut"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Kalimat mana yang menggunakan Superlativ atributif dengan benar?",
        "options": [
          "Das ist am schnellsten Auto.",
          "Er ist der beste Student.",
          "Sie singt am schönsten.",
          "Das ist ein größter Haus."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Ich trinke ____ Kaffee.' (paling suka)",
        "options": [
          "gern",
          "lieber",
          "am liebsten",
          "liebste"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Bentuk Komparativ dari 'hoch' adalah:",
        "options": [
          "höcher",
          "höher",
          "am höchsten",
          "hochst"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Kalimat 'Mein Zimmer ist kleiner als deins.' berarti:",
        "options": [
          "Kamarku kecil seperti milikmu.",
          "Kamarku lebih kecil dari milikmu.",
          "Kamarku paling kecil.",
          "Kamarku tidak sekecil milikmu."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Kapan kita menggunakan 'am + Adjektiv + -sten'?",
        "options": [
          "Untuk Komparativ",
          "Untuk Superlativ predikatif",
          "Untuk Superlativ atributif",
          "Untuk kata sifat biasa"
        ],
        "correctAnswer": 1
      }
    ],
    "dialogues": [
      {
        "personA": "Welches Auto ist schneller, deins oder meins?",
        "personB": "Deins ist definitiv schneller, aber meins ist bequemer.",
        "translation": "A: Mobil mana yang lebih cepat, milikmu atau milikku?\nB: Milikmu jelas lebih cepat, tapi milikku lebih nyaman."
      },
      {
        "personA": "Was isst du am liebsten?",
        "personB": "Ich esse am liebsten italienisches Essen, besonders Pizza.",
        "translation": "A: Apa yang paling kamu suka makan?\nB: Saya paling suka makan makanan Italia, terutama pizza."
      },
      {
        "personA": "Wer ist der älteste in deiner Familie?",
        "personB": "Mein Großvater ist der älteste. Er ist schon 90 Jahre alt.",
        "translation": "A: Siapa yang tertua di keluargamu?\nB: Kakek saya yang tertua. Dia sudah berumur 90 tahun."
      }
    ],
    "culturalNotes": "Orang Jerman cenderung menghargai presisi dan perbandingan yang jelas. Oleh karena itu, penggunaan Komparativ dan Superlativ yang benar sangat penting untuk menyampaikan informasi secara akurat. Ini juga sering muncul dalam deskripsi produk, ulasan, dan percakapan sehari-hari tentang preferensi."
  },
  {
    "id": "a2-8",
    "canDoGoals": [
      "Mengenali prefix yang memisahkan verba (auf-, an-, ein-, aus-, dst) yaitu Trennbare Verben",
      "Memposisikan prefix di posisi paling akhir dalam sebuah kalimat utama",
      "Menceritakan aktivitas sehari-hari menggunakan trennbare verben (aufstehen, anziehen...)"
    ],
    "level": "A2",
    "title": "Trennbare Verben (aufmachen, anrufen, dst)",
    "grammarDescription": "Trennbare Verben (kata kerja terpisah) adalah kata kerja dalam bahasa Jerman yang terdiri dari sebuah awalan (Präfix) dan sebuah kata kerja dasar. Awalan ini dapat terpisah dari kata kerja dasar dalam kalimat tertentu, terutama dalam kalimat utama (Hauptsatz).\n\n**Struktur dalam Kalimat Utama (Präsens):**\nDalam kalimat utama, awalan terpisah dari kata kerja dan diletakkan di akhir kalimat, sedangkan kata kerja dasar terkonjugasi berada di posisi kedua.\n\n*   Contoh: **aufmachen** (membuka)\n    *   Ich **mache** das Fenster **auf**. (Saya membuka jendela itu.)\n*   Contoh: **anrufen** (menelepon)\n    *   Rufst du mich **an**? (Apakah kamu meneleponku?)\n\n**Struktur dalam Kalimat Subordinat (Nebensatz) atau Infinitif dengan 'zu':**\nDalam kalimat subordinat atau ketika kata kerja digunakan dalam bentuk infinitif dengan 'zu', awalan tetap menyatu dengan kata kerja dasar.\n\n*   Contoh: Ich weiß, dass er das Fenster **aufmacht**. (Saya tahu bahwa dia membuka jendela itu.)\n*   Contoh: Es ist wichtig, das Fenster **aufzumachen**. (Penting untuk membuka jendela itu.)\n    *   Perhatikan 'zu' diletakkan di antara awalan dan kata kerja dasar.\n\n**Beberapa Awalan Trennbar yang Umum:**\n*   ab- (abfahren - berangkat)\n*   an- (anrufen - menelepon)\n*   auf- (aufstehen - bangun)\n*   aus- (ausgehen - keluar)\n*   ein- (einkaufen - berbelanja)\n*   mit- (mitkommen - ikut datang)\n*   nach- (nachdenken - merenungkan)\n*   vor- (vorstellen - memperkenalkan)\n*   zu- (zumachen - menutup)\n\n**Perbedaan dengan Untrennbare Verben (Kata Kerja Tidak Terpisah):**\nAda juga kata kerja dengan awalan yang tidak pernah terpisah. Awalan ini tidak memiliki tekanan dan kata kerja tidak mendapatkan 'ge-' di Partizip II. Contoh awalan tidak terpisah: be-, ge-, emp-, ent-, er-, miss-, ver-, zer-.\n\n*   Contoh: **besuchen** (mengunjungi)\n    *   Ich **besuche** meine Oma. (Saya mengunjungi nenek saya.) (Tidak terpisah)\n    *   Partizip II: besucht (tanpa 'ge-')",
    "sentenceBreakdowns": [
      "Ich (subjek) + rufe (kata kerja terkonjugasi) + dich (objek Akkusativ) + später (adverb waktu) + an (awalan terpisah di akhir).",
      "Er (subjek) + macht (kata kerja terkonjugasi) + die Tür (objek Akkusativ) + auf (awalan terpisah di akhir).",
      "Wir (subjek) + stehen (kata kerja terkonjugasi) + jeden Morgen (adverb waktu) + früh (adverb) + auf (awalan terpisah di akhir).",
      "Sie (subjek) + kauft (kata kerja terkonjugasi) + im Supermarkt (lokasi) + ein (awalan terpisah di akhir).",
      "Kommst (kata kerja terkonjugasi) + du (subjek) + mit (awalan terpisah di akhir)?",
      "Es ist wichtig, die Fenster (objek Akkusativ) + aufzumachen (infinitif dengan zu, awalan menyatu)."
    ],
    "pronunciationTips": "Perhatikan tekanan pada Trennbare Verben. Awalan (Präfix) dari kata kerja terpisah selalu mendapat tekanan. Contoh: **AN**rufen, **AUF**machen, **EIN**kaufen. Ini membantu membedakannya dari kata kerja yang memiliki awalan yang sama tetapi tidak terpisah (misalnya 'umfahren' dengan tekanan pada 'um' berarti 'menabrak', sedangkan 'umfahren' dengan tekanan pada 'fahren' berarti 'mengemudi berkeliling').",
    "vocabulary": [
      {
        "id": "v-gen-298",
        "word": "aufmachen",
        "translation": "membuka",
        "exampleSentence": "Ich mache das Fenster auf.",
        "phonetic": "AUF-ma-khen",
        "level": "A2"
      },
      {
        "id": "v-gen-299",
        "word": "anrufen",
        "translation": "menelepon",
        "exampleSentence": "Rufst du mich an?",
        "phonetic": "AN-roo-fen",
        "level": "A2"
      },
      {
        "id": "v-gen-300",
        "word": "aufstehen",
        "translation": "bangun",
        "exampleSentence": "Ich stehe früh auf.",
        "phonetic": "AUF-shtee-en",
        "level": "A2"
      },
      {
        "id": "v-gen-301",
        "word": "einkaufen",
        "translation": "berbelanja",
        "exampleSentence": "Wir kaufen im Supermarkt ein.",
        "phonetic": "AIN-kau-fen",
        "level": "A2"
      },
      {
        "id": "v-gen-302",
        "word": "mitkommen",
        "translation": "ikut datang",
        "exampleSentence": "Kommst du mit?",
        "phonetic": "MIT-kom-men",
        "level": "A2"
      },
      {
        "id": "v-gen-303",
        "word": "zumachen",
        "translation": "menutup",
        "exampleSentence": "Machst du bitte die Tür zu?",
        "phonetic": "TSOO-ma-khen",
        "level": "A2"
      },
      {
        "id": "v-gen-304",
        "word": "abfahren",
        "translation": "berangkat",
        "exampleSentence": "Der Zug fährt um 10 Uhr ab.",
        "phonetic": "AP-fah-ren",
        "level": "A2"
      },
      {
        "id": "v-gen-305",
        "word": "ausgehen",
        "translation": "keluar (untuk bersenang-senang)",
        "exampleSentence": "Wir gehen heute Abend aus.",
        "phonetic": "AUS-gee-en",
        "level": "A2"
      },
      {
        "id": "v-gen-306",
        "word": "vorstellen",
        "translation": "memperkenalkan",
        "exampleSentence": "Ich stelle mich vor.",
        "phonetic": "FOR-shtel-len",
        "level": "A2"
      },
      {
        "id": "v-gen-307",
        "word": "fernsehen",
        "translation": "menonton TV",
        "exampleSentence": "Ich sehe abends fern.",
        "phonetic": "FERN-zee-en",
        "level": "A2"
      },
      {
        "id": "v-gen-308",
        "word": "einladen",
        "translation": "mengundang",
        "exampleSentence": "Ich lade dich zum Essen ein.",
        "phonetic": "AIN-la-den",
        "level": "A2"
      },
      {
        "id": "v-gen-309",
        "word": "mitbringen",
        "translation": "membawa serta",
        "exampleSentence": "Bringst du etwas mit?",
        "phonetic": "MIT-bring-en",
        "level": "A2"
      },
      {
        "id": "v-gen-310",
        "word": "das Fenster",
        "translation": "jendela",
        "exampleSentence": "Machst du bitte das Fenster auf?",
        "phonetic": "das FEN-ster",
        "level": "A2",
        "article": "das"
      },
      {
        "id": "v-gen-311",
        "word": "die Tür",
        "translation": "pintu",
        "exampleSentence": "Mach die Tür zu!",
        "phonetic": "dee TÜR",
        "level": "A2",
        "article": "die"
      },
      {
        "id": "v-gen-312",
        "word": "der Supermarkt",
        "translation": "supermarket",
        "exampleSentence": "Wir kaufen im Supermarkt ein.",
        "phonetic": "der ZOO-per-markt",
        "level": "A2",
        "article": "der"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: 'Ich ____ dich morgen ____.' (menelepon)",
        "options": [
          "rufe, an",
          "rufe an, dich",
          "anrufe, dich",
          "dich, anrufe"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih kalimat yang benar dengan 'aufstehen':",
        "options": [
          "Ich stehe auf früh.",
          "Ich stehe früh auf.",
          "Ich aufstehe früh.",
          "Ich früh aufstehe."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa yang terjadi pada awalan 'trennbare Verben' dalam kalimat utama?",
        "options": [
          "Tetap menyatu dengan kata kerja",
          "Diletakkan di awal kalimat",
          "Diletakkan di akhir kalimat",
          "Dihilangkan"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Lengkapi kalimat: 'Es ist wichtig, die Tür ____.' (untuk menutup)",
        "options": [
          "zumachen",
          "zu machen",
          "zuzumachen",
          "zumachen zu"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kata kerja mana yang merupakan 'trennbare Verb'?",
        "options": [
          "besuchen",
          "verstehen",
          "einkaufen",
          "erzählen"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Dalam kalimat 'Ich sehe abends fern.', 'fern' adalah:",
        "options": [
          "Kata kerja utama",
          "Awalan terpisah",
          "Objek",
          "Adverb"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Kalimat 'Kommst du mit?' berarti:",
        "options": [
          "Apakah kamu datang?",
          "Apakah kamu ikut?",
          "Apakah kamu datang dengan?",
          "Apakah kamu datang bersama?"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Di mana 'zu' diletakkan dalam infinitif dengan 'trennbare Verben'?",
        "options": [
          "Sebelum awalan",
          "Setelah kata kerja dasar",
          "Di antara awalan dan kata kerja dasar",
          "Di akhir kalimat"
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Machst du bitte das Fenster auf? Es ist heiß hier.",
        "personB": "Ja, klar. Ich mache es sofort auf.",
        "translation": "A: Bisakah kamu membuka jendela? Panas di sini.\nB: Ya, tentu. Saya akan segera membukanya."
      },
      {
        "personA": "Rufst du mich heute Abend an?",
        "personB": "Ja, ich rufe dich gegen 19 Uhr an.",
        "translation": "A: Apakah kamu meneleponku malam ini?\nB: Ya, saya akan meneleponmu sekitar jam 7 malam."
      },
      {
        "personA": "Wann stehst du normalerweise auf?",
        "personB": "Ich stehe meistens um 7 Uhr auf, aber am Wochenende schlafe ich länger.",
        "translation": "A: Jam berapa biasanya kamu bangun?\nB: Saya biasanya bangun jam 7, tapi akhir pekan saya tidur lebih lama."
      }
    ],
    "culturalNotes": "Trennbare Verben adalah salah satu aspek yang paling khas dan kadang menantang dalam tata bahasa Jerman. Penggunaannya yang tepat menunjukkan pemahaman yang baik tentang struktur kalimat Jerman. Dalam percakapan, tekanan pada awalan juga penting untuk kejelasan dan makna."
  },
  {
    "id": "a2-9",
    "canDoGoals": [
      "Melanjutkan kemampuan menggunakan W-Fragen yang lebih spesifik",
      "Membentuk kalimat pertanyaan yang relevan dengan kasus (Wer vs Wen vs Wem)",
      "Menggunakan W-Fragen untuk lokasi dan arah (Wo vs Wohin vs Woher)"
    ],
    "level": "A2",
    "title": "Kalimat Tanya W-Fragen",
    "grammarDescription": "W-Fragen (pertanyaan W) adalah jenis kalimat tanya dalam bahasa Jerman yang dimulai dengan kata tanya yang diawali huruf 'W'. Kata tanya ini digunakan untuk meminta informasi spesifik. Struktur kalimat untuk W-Fragen adalah: Kata Tanya + Kata Kerja Terkonjugasi + Subjek + ...\n\n**Kata Tanya W-Fragen yang Umum:**\n1.  **Wer? (Siapa? - Nominativ):** Bertanya tentang subjek (orang).\n    *   **Wer** kommt heute? (Siapa yang datang hari ini?)\n2.  **Wen? (Siapa? - Akkusativ):** Bertanya tentang objek langsung (orang).\n    *   **Wen** siehst du? (Siapa yang kamu lihat?)\n3.  **Wem? (Kepada siapa? - Dativ):** Bertanya tentang objek tidak langsung (orang).\n    *   **Wem** hilfst du? (Kepada siapa kamu membantu?)\n4.  **Was? (Apa? - Nominativ/Akkusativ):** Bertanya tentang subjek atau objek (benda/hal).\n    *   **Was** ist das? (Apa itu? - Nominativ)\n    *   **Was** machst du? (Apa yang kamu lakukan? - Akkusativ)\n5.  **Wo? (Di mana?):** Bertanya tentang lokasi statis (Dativ).\n    *   **Wo** wohnst du? (Di mana kamu tinggal?)\n6.  **Wohin? (Ke mana?):** Bertanya tentang arah/tujuan (Akkusativ).\n    *   **Wohin** gehst du? (Ke mana kamu pergi?)\n7.  **Woher? (Dari mana?):** Bertanya tentang asal.\n    *   **Woher** kommst du? (Dari mana kamu berasal?)\n8.  **Wann? (Kapan?):** Bertanya tentang waktu.\n    *   **Wann** beginnt der Film? (Kapan filmnya dimulai?)\n9.  **Warum? (Mengapa?):** Bertanya tentang alasan.\n    *   **Warum** lernst du Deutsch? (Mengapa kamu belajar bahasa Jerman?)\n10. **Wie? (Bagaimana?):** Bertanya tentang cara atau kondisi.\n    *   **Wie** geht es dir? (Bagaimana kabarmu?)\n    *   **Wie** alt bist du? (Berapa umurmu?)\n11. **Welche/r/s? (Yang mana?):** Bertanya tentang pilihan dari sekelompok benda. Diikuti oleh kata benda dan beradaptasi dengan kasus dan gender.\n    *   **Welches** Buch möchtest du? (Buku yang mana yang kamu inginkan?)\n\nPerhatikan bahwa kata kerja terkonjugasi selalu berada di posisi kedua dalam W-Fragen.",
    "sentenceBreakdowns": [
      "Wer (kata tanya Nominativ) + kommt (kata kerja terkonjugasi) + heute (adverb waktu)?",
      "Was (kata tanya Akkusativ) + machst (kata kerja terkonjugasi) + du (subjek) + am Wochenende (adverb waktu)?",
      "Wo (kata tanya lokasi) + wohnst (kata kerja terkonjugasi) + du (subjek)?",
      "Wohin (kata tanya arah) + fahrt (kata kerja terkonjugasi) + ihr (subjek) + in den Urlaub (tujuan)?",
      "Wann (kata tanya waktu) + hast (kata kerja terkonjugasi) + du (subjek) + Zeit (objek Akkusativ)?",
      "Warum (kata tanya alasan) + lernst (kata kerja terkonjugasi) + du (subjek) + Deutsch (objek Akkusativ)?"
    ],
    "pronunciationTips": "Perhatikan intonasi dalam kalimat tanya. Untuk W-Fragen, intonasi biasanya menurun di akhir kalimat, menunjukkan bahwa Anda mengharapkan jawaban informatif. Latih untuk mengucapkan pertanyaan dengan intonasi yang tepat agar terdengar alami.",
    "vocabulary": [
      {
        "id": "v-gen-313",
        "word": "wer",
        "translation": "siapa (Nominativ)",
        "exampleSentence": "Wer kommt heute?",
        "phonetic": "VER",
        "level": "A2"
      },
      {
        "id": "v-gen-314",
        "word": "wen",
        "translation": "siapa (Akkusativ)",
        "exampleSentence": "Wen siehst du?",
        "phonetic": "VEN",
        "level": "A2"
      },
      {
        "id": "v-gen-315",
        "word": "wem",
        "translation": "kepada siapa (Dativ)",
        "exampleSentence": "Wem hilfst du?",
        "phonetic": "VEM",
        "level": "A2"
      },
      {
        "id": "v-gen-316",
        "word": "was",
        "translation": "apa",
        "exampleSentence": "Was machst du?",
        "phonetic": "VAS",
        "level": "A2"
      },
      {
        "id": "v-gen-317",
        "word": "wo",
        "translation": "di mana",
        "exampleSentence": "Wo wohnst du?",
        "phonetic": "VO",
        "level": "A2"
      },
      {
        "id": "v-gen-318",
        "word": "wohin",
        "translation": "ke mana",
        "exampleSentence": "Wohin gehst du?",
        "phonetic": "VO-hin",
        "level": "A2"
      },
      {
        "id": "v-gen-319",
        "word": "woher",
        "translation": "dari mana",
        "exampleSentence": "Woher kommst du?",
        "phonetic": "VO-her",
        "level": "A2"
      },
      {
        "id": "v-gen-320",
        "word": "wann",
        "translation": "kapan",
        "exampleSentence": "Wann beginnt der Film?",
        "phonetic": "VAN",
        "level": "A2"
      },
      {
        "id": "v-gen-321",
        "word": "warum",
        "translation": "mengapa",
        "exampleSentence": "Warum lernst du Deutsch?",
        "phonetic": "VA-rum",
        "level": "A2"
      },
      {
        "id": "v-gen-322",
        "word": "wie",
        "translation": "bagaimana",
        "exampleSentence": "Wie geht es dir?",
        "phonetic": "VEE",
        "level": "A2"
      },
      {
        "id": "v-gen-323",
        "word": "welche/r/s",
        "translation": "yang mana",
        "exampleSentence": "Welches Buch möchtest du?",
        "phonetic": "VEL-khe/r/s",
        "level": "A2"
      },
      {
        "id": "v-gen-324",
        "word": "kommen",
        "translation": "datang",
        "exampleSentence": "Wer kommt heute?",
        "phonetic": "KOM-men",
        "level": "A2"
      },
      {
        "id": "v-gen-325",
        "word": "wohnen",
        "translation": "tinggal",
        "exampleSentence": "Wo wohnst du?",
        "phonetic": "VO-nen",
        "level": "A2"
      },
      {
        "id": "v-gen-326",
        "word": "lernen",
        "translation": "belajar",
        "exampleSentence": "Warum lernst du Deutsch?",
        "phonetic": "LER-nen",
        "level": "A2"
      },
      {
        "id": "v-gen-327",
        "word": "der Film",
        "translation": "film",
        "exampleSentence": "Wann beginnt der Film?",
        "phonetic": "der FILM",
        "level": "A2",
        "article": "der"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: '____ kommst du?' (Dari mana)",
        "options": [
          "Wo",
          "Wohin",
          "Woher",
          "Wann"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih kata tanya yang benar: '____ machst du am Wochenende?' (Apa)",
        "options": [
          "Wer",
          "Was",
          "Wem",
          "Wen"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Kalimat mana yang benar secara tata bahasa?",
        "options": [
          "Du wohnst wo?",
          "Wo du wohnst?",
          "Wo wohnst du?",
          "Wohnst wo du?"
        ],
        "correctAnswer": 2
      },
      {
        "question": "____ hilfst du? (Kepada siapa)",
        "options": [
          "Wer",
          "Wen",
          "Wem",
          "Was"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Lengkapi kalimat: '____ geht es dir?' (Bagaimana)",
        "options": [
          "Was",
          "Wer",
          "Wie",
          "Wann"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Kata tanya 'Wer?' digunakan untuk bertanya tentang:",
        "options": [
          "Objek Akkusativ",
          "Objek Dativ",
          "Subjek Nominativ",
          "Waktu"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Kalimat 'Wohin fahrt ihr?' berarti:",
        "options": [
          "Di mana kalian mengemudi?",
          "Kapan kalian mengemudi?",
          "Ke mana kalian mengemudi?",
          "Mengapa kalian mengemudi?"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Di mana posisi kata kerja terkonjugasi dalam W-Fragen?",
        "options": [
          "Di awal kalimat",
          "Di posisi kedua",
          "Di akhir kalimat",
          "Setelah subjek"
        ],
        "correctAnswer": 1
      }
    ],
    "dialogues": [
      {
        "personA": "Woher kommst du?",
        "personB": "Ich komme aus Indonesien.",
        "translation": "A: Dari mana kamu berasal?\nB: Saya berasal dari Indonesia."
      },
      {
        "personA": "Was machst du heute Abend?",
        "personB": "Ich gehe ins Kino. Willst du mitkommen?",
        "translation": "A: Apa yang kamu lakukan malam ini?\nB: Saya pergi ke bioskop. Apakah kamu mau ikut?"
      },
      {
        "personA": "Wann hast du Geburtstag?",
        "personB": "Ich habe im Mai Geburtstag. Und du?",
        "translation": "A: Kapan ulang tahunmu?\nB: Ulang tahun saya di bulan Mei. Bagaimana denganmu?"
      }
    ],
    "culturalNotes": "W-Fragen adalah dasar dari setiap percakapan dan interaksi di Jerman. Orang Jerman cenderung langsung pada intinya saat bertanya, sehingga W-Fragen sangat umum. Menguasai W-Fragen dengan intonasi yang tepat akan membuat Anda terdengar lebih percaya diri dan alami."
  },
  {
    "checkpoint": {
      "id": "a2-checkpoint-3",
      "title": "Review Konten Sebelumnya",
      "requiredScore": 0.7,
      "questions": [
        {
          "question": "Pilih bentuk Komparativ yang benar dari 'gut':",
          "options": [
            "gut",
            "besser",
            "am besten",
            "beste"
          ],
          "correctAnswer": 1
        },
        {
          "question": "Lengkapi kalimat dengan 'trennbare Verb': 'Ich ____ das Fenster ____.' (membuka)",
          "options": [
            "mache, auf",
            "aufmache, das Fenster",
            "mache auf, das Fenster",
            "aufmache, es"
          ],
          "correctAnswer": 0
        },
        {
          "question": "Kata tanya 'Wem?' digunakan untuk bertanya tentang:",
          "options": [
            "Subjek Nominativ",
            "Objek Akkusativ",
            "Objek Dativ",
            "Waktu"
          ],
          "correctAnswer": 2
        },
        {
          "question": "Kalimat mana yang menggunakan Superlativ predikatif dengan benar?",
          "options": [
            "Das ist der schnellste Auto.",
            "Sie singt am schönsten.",
            "Er ist besser Student.",
            "Ich esse am liebste Pizza."
          ],
          "correctAnswer": 1
        },
        {
          "question": "Apa yang terjadi pada awalan 'trennbare Verben' dalam kalimat subordinat?",
          "options": [
            "Terpisah dan di akhir kalimat",
            "Tetap menyatu dengan kata kerja",
            "Diletakkan di awal kalimat",
            "Dihilangkan"
          ],
          "correctAnswer": 1
        },
        {
          "question": "Lengkapi kalimat: '____ ist dein Lieblingsfilm?' (Apa)",
          "options": [
            "Wer",
            "Was",
            "Wo",
            "Wie"
          ],
          "correctAnswer": 1
        },
        {
          "question": "Bentuk Superlativ atributif dari 'groß' adalah:",
          "options": [
            "größer",
            "am größten",
            "der größte",
            "größte"
          ],
          "correctAnswer": 2
        },
        {
          "question": "Kalimat 'Rufst du mich an?' berarti:",
          "options": [
            "Apakah kamu meneleponku?",
            "Apakah kamu memanggilku?",
            "Apakah kamu menelepon saya?",
            "Apakah kamu menelepon saya nanti?"
          ],
          "correctAnswer": 0
        },
        {
          "question": "Di mana posisi kata kerja terkonjugasi dalam W-Fragen?",
          "options": [
            "Di awal kalimat",
            "Di posisi kedua",
            "Di akhir kalimat",
            "Setelah subjek"
          ],
          "correctAnswer": 1
        },
        {
          "question": "Lengkapi kalimat: 'Ich stehe ____ auf.' (pagi)",
          "options": [
            "früh",
            "spät",
            "oft",
            "nie"
          ],
          "correctAnswer": 0
        }
      ],
      "reviewLessons": [
        "a2-7",
        "a2-8",
        "a2-9"
      ]
    },
    "id": "a2-10",
    "level": "A2",
    "title": "Negasi: nicht vs kein",
    "grammarDescription": "Dalam bahasa Jerman, ada dua cara utama untuk menyatakan negasi (penolakan atau penyangkalan): menggunakan 'nicht' atau 'kein'. Pilihan antara keduanya tergantung pada jenis kata yang ingin dinegasikan.\n\n**1. Nicht (Tidak):**\nDigunakan untuk menegasika:\n*   **Kata kerja:** Diletakkan di akhir kalimat atau sebelum Partizip II/infinitif.\n    *   Ich spreche **nicht** Deutsch. (Saya tidak berbicara bahasa Jerman.)\n    *   Ich kann **nicht** kommen. (Saya tidak bisa datang.)\n*   **Kata sifat (Adjektive) dan Kata keterangan (Adverbien):** Diletakkan sebelum kata sifat/keterangan yang dinegasikan.\n    *   Das ist **nicht** gut. (Itu tidak baik.)\n    *   Er fährt **nicht** schnell. (Dia tidak mengemudi dengan cepat.)\n*   **Kata benda dengan artikel definitif (der, die, das):** Diletakkan sebelum artikel definitif atau kata benda.\n    *   Ich habe **nicht** den Schlüssel. (Saya tidak punya kunci itu.)\n*   **Nama diri (Proper Nouns):** Diletakkan sebelum nama diri.\n    *   Das ist **nicht** Peter. (Itu bukan Peter.)\n*   **Preposisi:** Diletakkan sebelum preposisi.\n    *   Ich komme **nicht** aus Deutschland. (Saya tidak berasal dari Jerman.)\n\n**2. Kein (Tidak ada/Bukan sebuah):**\nDigunakan untuk menegasika:\n*   **Kata benda tanpa artikel (Nomen ohne Artikel):** 'Kein' berfungsi seperti artikel indefinitif 'ein/eine' tetapi dalam bentuk negatif. Ini harus disesuaikan dengan kasus dan gender kata benda.\n    *   Ich habe **keine** Zeit. (Saya tidak punya waktu.)\n    *   Er hat **keinen** Hund. (Dia tidak punya anjing.)\n*   **Kata benda dengan artikel indefinitif (ein, eine, ein):** 'Kein' menggantikan artikel indefinitif.\n    *   Das ist **kein** Problem. (Itu bukan masalah.)\n\n**Konjugasi 'kein' (seperti 'ein'):**\n| Kasus      | Maskulin | Feminin | Netral | Plural |\n|------------|----------|---------|--------|--------|\n| Nominativ  | kein     | keine   | kein   | keine  |\n| Akkusativ  | keinen   | keine   | kein   | keine  |\n| Dativ      | keinem   | keiner  | keinem | keinen |\n\n**Ringkasan:**\n*   Gunakan **nicht** untuk menegasika kata kerja, kata sifat, kata keterangan, nama diri, preposisi, dan kata benda dengan artikel definitif.\n*   Gunakan **kein** untuk menegasika kata benda tanpa artikel atau dengan artikel indefinitif.",
    "canDoGoals": [
      "Cara memosisikan negasi 'nicht' secara benar dalam kalimat",
      "Cara menggunakan negasi 'kein/keine' khusus untuk membantah/meniadakan kata benda yang tak memiliki instrumen tertentu",
      "Mengenali perbedaan penekanan kalimat menggunakan 'nicht'"
    ],
    "indonesianMistakes": "**Mimpi Buruk 'Kein' vs 'Nicht' untuk Orang Indonesia**\nDi Indonesia, segalanya dinegasikan dengan kata 'tidak' atau 'bukan'. Di Jerman, strukturnya lebih tegas.\n\n❌ *Ich habe nicht Auto* (Saya tidak punya mobil).\n✅ **Ich habe kein Auto.** (Karena mobil adalah kata benda tanpa penunjuk spesifik, harus pakai 'kein').\n\nPokoknya ingat ini: Kalau Anda mau bilang 'Saya ngga punya [Benda]', selalu pakai **kein/keine/keinen**.\n'Nicht' dipakai untuk Verb (kata kerja) dan Adjektiv (kata sifat).\n❌ *Das ist kein schön.* (Ini bukan cantik)\n✅ **Das ist nicht schön.**",
    "listeningSimulation": {
      "transcript": [
        {
          "personA": "Hast du ein Auto?",
          "personB": "Nein, ich habe kein Auto. Ich fahre mit dem Bus.",
          "translation": "A: Apa kamu punya mobil? | B: Tidak, aku tidak punya mobil. Aku pergi naik bus."
        },
        {
          "personA": "Oh, fährst du nicht gern Auto?",
          "personB": "Doch, aber ein Auto ist zu teuer.",
          "translation": "A: Oh, kamu tidak suka menyetir? | B: Sila, tapi mobil terlalu mahal."
        }
      ],
      "questions": [
        {
          "question": "Mengapa person B menggunakan 'kein Auto'?",
          "options": ["Karena Auto adalah kata sifat", "Karena Auto adalah kata benda indefinit", "Karena dia tidak bisa menyetir"],
          "correctAnswer": 1
        }
      ]
    },
    "sentenceBreakdowns": [
      "Ich (subjek) + spreche (kata kerja) + nicht (negasi kata kerja) + Deutsch (objek Akkusativ).",
      "Das (subjek) + ist (kata kerja sein) + nicht (negasi kata sifat) + gut (kata sifat).",
      "Er (subjek) + hat (kata kerja haben) + keinen (negasi kata benda maskulin Akkusativ) + Hund (kata benda).",
      "Wir (subjek) + haben (kata kerja haben) + keine (negasi kata benda feminin Akkusativ) + Zeit (kata benda).",
      "Sie (subjek) + kommt (kata kerja) + nicht (negasi preposisi) + aus (preposisi) + Frankreich (nama diri).",
      "Ich (subjek) + kann (modal verb) + nicht (negasi infinitif) + schlafen (infinitif)."
    ],
    "pronunciationTips": "Perhatikan pelafalan 'ch' dan 'ng'.\n- 'ch' sudah dibahas (ich-Laut dan ach-Laut). Pastikan Anda melafalkannya dengan benar, karena 'nicht' menggunakan ich-Laut.\n- 'ng' dalam bahasa Jerman diucapkan seperti 'ng' dalam 'sing' (Inggris) atau 'mengapa' (Indonesia), bukan 'n' + 'g' terpisah. Contoh: 'singen' (menyanyi), 'lang' (panjang).",
    "vocabulary": [
      {
        "id": "v-gen-328",
        "word": "nicht",
        "translation": "tidak",
        "exampleSentence": "Ich spreche nicht Französisch.",
        "phonetic": "NIKHT",
        "level": "A2"
      },
      {
        "id": "v-gen-329",
        "word": "kein",
        "translation": "tidak ada/bukan sebuah",
        "exampleSentence": "Ich habe kein Auto.",
        "phonetic": "KAIN",
        "level": "A2"
      },
      {
        "id": "v-gen-330",
        "word": "gut",
        "translation": "baik",
        "exampleSentence": "Das ist nicht gut.",
        "phonetic": "GOOT",
        "level": "A2"
      },
      {
        "id": "v-gen-331",
        "word": "schnell",
        "translation": "cepat",
        "exampleSentence": "Er fährt nicht schnell.",
        "phonetic": "SHNEL",
        "level": "A2"
      },
      {
        "id": "v-gen-332",
        "word": "der Schlüssel",
        "translation": "kunci",
        "exampleSentence": "Ich habe den Schlüssel nicht.",
        "phonetic": "der SHLÜS-sel",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-333",
        "word": "der Hund",
        "translation": "anjing",
        "exampleSentence": "Er hat keinen Hund.",
        "phonetic": "der HOONT",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-334",
        "word": "die Zeit",
        "translation": "waktu",
        "exampleSentence": "Wir haben keine Zeit.",
        "phonetic": "dee TSAIT",
        "level": "A2",
        "article": "die"
      },
      {
        "id": "v-gen-335",
        "word": "das Problem",
        "translation": "masalah",
        "exampleSentence": "Das ist kein Problem.",
        "phonetic": "das PRO-blem",
        "level": "A2",
        "article": "das"
      },
      {
        "id": "v-gen-336",
        "word": "sprechen",
        "translation": "berbicara",
        "exampleSentence": "Ich spreche nicht Spanisch.",
        "phonetic": "SHPRE-khen",
        "level": "A2"
      },
      {
        "id": "v-gen-337",
        "word": "kommen",
        "translation": "datang",
        "exampleSentence": "Ich kann nicht kommen.",
        "phonetic": "KOM-men",
        "level": "A2"
      },
      {
        "id": "v-gen-338",
        "word": "schlafen",
        "translation": "tidur",
        "exampleSentence": "Ich kann nicht schlafen.",
        "phonetic": "SHLA-fen",
        "level": "A2"
      },
      {
        "id": "v-gen-339",
        "word": "Französisch",
        "translation": "bahasa Prancis",
        "exampleSentence": "Ich spreche nicht Französisch.",
        "phonetic": "fran-TSÖ-zish",
        "level": "A2"
      },
      {
        "id": "v-gen-340",
        "word": "Spanisch",
        "translation": "bahasa Spanyol",
        "exampleSentence": "Sprichst du Spanisch?",
        "phonetic": "SHPA-nish",
        "level": "A2"
      },
      {
        "id": "v-gen-341",
        "word": "der Kaffee",
        "translation": "kopi",
        "exampleSentence": "Ich trinke keinen Kaffee.",
        "phonetic": "der KA-fee",
        "level": "A2",
        "article": "der"
      },
      {
        "id": "v-gen-342",
        "word": "die Milch",
        "translation": "susu",
        "exampleSentence": "Ich habe keine Milch mehr.",
        "phonetic": "dee MILKH",
        "level": "A2",
        "article": "die"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: 'Ich habe ____ Auto.'",
        "options": [
          "nicht",
          "kein",
          "keine",
          "keinen"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Pilih negasi yang benar: 'Das ist ____ gut.'",
        "options": [
          "kein",
          "nicht",
          "keine",
          "keinem"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Kalimat mana yang benar secara tata bahasa?",
        "options": [
          "Ich habe nicht Zeit.",
          "Er spricht kein Deutsch.",
          "Sie ist nicht eine Lehrerin.",
          "Wir haben keinen Probleme."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Ich trinke ____ Kaffee.'",
        "options": [
          "nicht",
          "kein",
          "keine",
          "keinen"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Kapan kita menggunakan 'nicht'?",
        "options": [
          "Untuk menegasika kata benda tanpa artikel",
          "Untuk menegasika kata benda dengan artikel indefinitif",
          "Untuk menegasika kata kerja, kata sifat, atau nama diri",
          "Hanya untuk menegasika kata benda plural"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Kalimat 'Ich kann nicht kommen.' berarti:",
        "options": [
          "Saya tidak punya waktu untuk datang.",
          "Saya tidak bisa datang.",
          "Saya tidak ingin datang.",
          "Saya tidak boleh datang."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Das ist ____ mein Buch.'",
        "options": [
          "kein",
          "nicht",
          "keine",
          "keinem"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa bentuk negasi yang benar untuk 'eine Idee' (Akkusativ)?",
        "options": [
          "kein Idee",
          "keine Idee",
          "nicht Idee",
          "keinen Idee"
        ],
        "correctAnswer": 1
      }
    ],
    "dialogues": [
      {
        "personA": "Hast du Zeit für einen Kaffee?",
        "personB": "Leider nicht. Ich habe heute keine Zeit.",
        "translation": "A: Apakah kamu punya waktu untuk minum kopi?\nB: Sayangnya tidak. Saya tidak punya waktu hari ini."
      },
      {
        "personA": "Ist das dein Auto?",
        "personB": "Nein, das ist nicht mein Auto. Ich habe kein Auto.",
        "translation": "A: Apakah itu mobilmu?\nB: Tidak, itu bukan mobilku. Saya tidak punya mobil."
      },
      {
        "personA": "Sprichst du Französisch?",
        "personB": "Nein, ich spreche nicht Französisch, aber ich lerne Deutsch.",
        "translation": "A: Apakah kamu berbicara bahasa Prancis?\nB: Tidak, saya tidak berbicara bahasa Prancis, tapi saya belajar bahasa Jerman."
      }
    ],
    "culturalNotes": "Orang Jerman cenderung sangat langsung dalam menyatakan negasi. Menggunakan 'nicht' atau 'kein' dengan benar adalah bagian penting dari komunikasi yang jelas dan lugas. Ini juga mencerminkan budaya yang menghargai ketepatan dalam bahasa."
  },
  {
    "id": "a2-11",
    "canDoGoals": [
      "Mengetahui daftar verba tindakan terhadap diri sendiri (Reflexivverben)",
      "Penggunaan Reflexivpronomen (mich, dich, sich) untuk Accusative atau Dativ",
      "Bercerita rutinitas membersihkan diri (sich waschen, sich duschen, sich bedanken)"
    ],
    "level": "A2",
    "title": "Verba Refleksif (Reflexivverben)",
    "grammarDescription": "Verba refleksif adalah kata kerja di mana subjek dan objek adalah orang (atau benda) yang sama. Kata kerja ini digunakan dengan kata ganti refleksif (Reflexivpronomen) seperti mich, dich, sich, uns, euch. Contohnya 'sich waschen' (mencuci diri sendiri), 'sich freuen' (bersorak/gembira).\n\nPosisi Reflexivpronomen biasanya ada tepat setelah kata kerja yang dikonjugasikan.",
    "vocabulary": [
      {
        "id": "v-a211-1",
        "word": "sich freuen",
        "translation": "merasa gembira",
        "exampleSentence": "Ich freue mich über das Geschenk.",
        "phonetic": "zikh FROY-en",
        "level": "A2"
      },
      {
        "id": "v-a211-2",
        "word": "sich waschen",
        "translation": "mencuci diri sendiri",
        "exampleSentence": "Du wäschst dich.",
        "phonetic": "zikh VASH-en",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Kata ganti refleksif untuk 'er/sie/es' dan 'sie/Sie' (mereka/Anda) adalah:",
        "options": [
          "mich",
          "uns",
          "sich",
          "dich"
        ],
        "correctAnswer": 2
      }
    ]
  },
  {
    "id": "a2-12",
    "canDoGoals": [
      "Menghafal preposisi yang terkunci untuk suatu verba (Verben mit festen Präpositionen)",
      "Mampu merespons singkat menggunakan Pronominaladverbien (dafür, daran, womit, worauf)",
      "Membicarakan sebuah minat/memori terhadap suatu subjek tertentu yang relevan dengan preposition"
    ],
    "level": "A2",
    "title": "Verba dengan Preposisi Tetap & Pronominaladverbien",
    "grammarDescription": "Beberapa kata kerja selalu dipasangkan dengan preposisi tertentu, dan preposisi tersebut menentukan kasus apa yang harus dipakai (Akkusativ atau Dativ). Contoh: 'warten auf' (+ Akkusativ) = menunggu, 'träumen von' (+ Dativ) = bermimpi tentang.\n\nJika objeknya adalah BENDA (bukan orang), kita menggunakan Pronominaladverbien seperti 'darauf', 'davon', 'damit'. Misalnya: 'Ich warte auf den Bus' (Saya menunggu bus) -> 'Ich warte darauf' (Saya menunggunya).",
    "vocabulary": [
      {
        "id": "v-a212-1",
        "word": "warten auf",
        "translation": "menunggu sesuatu/seseorang",
        "exampleSentence": "Ich warte auf dich.",
        "phonetic": "VAR-ten owf",
        "level": "A2"
      },
      {
        "id": "v-a212-2",
        "word": "träumen von",
        "translation": "bermimpi tentang",
        "exampleSentence": "Er träumt von einem Haus.",
        "phonetic": "TROY-men fon",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Apa bentuk Pronominaladverb untuk benda pada frasa 'warten auf'?",
        "options": [
          "daran",
          "darüber",
          "dafür",
          "darauf"
        ],
        "correctAnswer": 3
      }
    ]
  },
  {
    "id": "a2-13",
    "canDoGoals": [
      "Mengetahui dasar-dasar klausa anak (Nebensätze)",
      "Menceritakan alasan / sebab akibat menggunakan konjungsi 'weil'",
      "Menceritakan waktu terjadinya suatu hal dengan konjungsi 'wenn'",
      "Membangun pengandaian dengan 'dass'"
    ],
    "level": "A2",
    "title": "Nebensätze (dass, weil, wenn)",
    "grammarDescription": "Dalam kalimat subordinat (Nebensatz), kata kerja yang dikonjugasikan selalu berpindah ke akhir kalimat. Tiga konjungsi subordinatif yang penting di tingkat A2 adalah: 'dass' (bahwa), 'weil' (karena), dan 'wenn' (jika/ketika).\n\nContoh:\nIch weiß, dass du kommst. (Saya tahu bahwa kamu datang).\nIch bleibe zu Hause, weil es regnet. (Saya tinggal di rumah karena hujan).\nWenn ich Zeit habe, komme ich. (Jika saya punya waktu, saya datang.)",
    "vocabulary": [
      {
        "id": "v-a213-1",
        "word": "dass",
        "translation": "bahwa",
        "exampleSentence": "Ich hoffe, dass er kommt.",
        "phonetic": "das",
        "level": "A2"
      },
      {
        "id": "v-a213-2",
        "word": "weil",
        "translation": "karena",
        "exampleSentence": "Ich lerne Deutsch, weil ich in Berlin studieren will.",
        "phonetic": "vayl",
        "level": "A2"
      },
      {
        "id": "v-a213-3",
        "word": "wenn",
        "translation": "jika / kalau",
        "exampleSentence": "Wenn das Wetter schön ist, gehen wir spazieren.",
        "phonetic": "ven",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Di mana letak kata kerja terkonjugasi dalam Nebensatz (kalimat subordinat)?",
        "options": [
          "Posisi pertama",
          "Posisi kedua",
          "Posisi terakhir",
          "Sebelum subjek"
        ],
        "correctAnswer": 2
      }
    ]
  },
  {
    "id": "b1-1",
    "canDoGoals": [
      "Menerapkan kasus Genitiv untuk menyatakan kepemilikan formal",
      "Deklinasi artikel (des, der) lengkap dengan sufiks kata benda maskulin dan netral (-s, -es)",
      "Menggunakan preposisi yang memerlukan Genitiv (wegen, trotz, während, innerhalb)"
    ],
    "level": "B1",
    "title": "Kasus Genitiv",
    "grammarDescription": "Kasus Genitiv dalam bahasa Jerman digunakan untuk menunjukkan kepemilikan atau hubungan. Ini sering disebut sebagai 'kasus kepemilikan'. Kata benda yang berada dalam Genitiv akan mengalami perubahan bentuk artikel dan terkadang juga akhiran pada kata bendanya. Untuk kata benda maskulin dan netral, biasanya ditambahkan akhiran '-s' atau '-es'. Untuk kata benda feminin dan jamak, bentuknya tidak berubah, tetapi artikelnya yang berubah. Genitiv juga digunakan setelah beberapa preposisi tertentu (misalnya: wegen, während, trotz, anstatt).",
    "sentenceBreakdowns": [
      "Das Auto (subjek, Nominativ) + des Mannes (objek Genitiv, maskulin singular)",
      "Die Farbe (subjek, Nominativ) + der Blumen (objek Genitiv, feminin plural)",
      "Der Preis (subjek, Nominativ) + des Buches (objek Genitiv, netral singular)",
      "Wegen (preposisi Genitiv) + des schlechten Wetters (objek Genitiv) + bleiben wir zu Hause."
    ],
    "pronunciationTips": "Perhatikan pelafalan akhiran '-s' atau '-es' pada kata benda Genitiv maskulin dan netral. Akhiran 'er' pada artikel 'der' atau 'einer' seringkali terdengar seperti 'a' yang samar atau 'ə'.",
    "vocabulary": [
      {
        "id": "b1-1-vocab-1",
        "word": "der Besitzer",
        "article": "der",
        "translation": "pemilik",
        "exampleSentence": "Der Besitzer des Hauses ist sehr freundlich.",
        "phonetic": "dehr be-ZIT-ser",
        "level": "B1"
      },
      {
        "id": "b1-1-vocab-2",
        "word": "die Qualität",
        "article": "die",
        "translation": "kualitas",
        "exampleSentence": "Die Qualität des Produkts ist ausgezeichnet.",
        "phonetic": "dee kwa-li-TÄT",
        "level": "B1"
      },
      {
        "id": "b1-1-vocab-3",
        "word": "das Ergebnis",
        "article": "das",
        "translation": "hasil",
        "exampleSentence": "Das Ergebnis der Prüfung war überraschend.",
        "phonetic": "das er-GEB-nis",
        "level": "B1"
      },
      {
        "id": "b1-1-vocab-4",
        "word": "der Wert",
        "article": "der",
        "translation": "nilai",
        "exampleSentence": "Der Wert des alten Gemäldes ist sehr hoch.",
        "phonetic": "dehr vehrt",
        "level": "B1"
      },
      {
        "id": "b1-1-vocab-5",
        "word": "die Meinung",
        "article": "die",
        "translation": "pendapat",
        "exampleSentence": "Die Meinung der Experten ist wichtig.",
        "phonetic": "dee MAI-nung",
        "level": "B1"
      },
      {
        "id": "b1-1-vocab-6",
        "word": "wegen",
        "translation": "karena, sebab",
        "exampleSentence": "Wegen des Regens bleiben wir drinnen.",
        "phonetic": "VEH-gen",
        "level": "B1"
      },
      {
        "id": "b1-1-vocab-7",
        "word": "während",
        "translation": "selama",
        "exampleSentence": "Während des Urlaubs haben wir viel entspannt.",
        "phonetic": "VÄH-rend",
        "level": "B1"
      },
      {
        "id": "b1-1-vocab-8",
        "word": "trotz",
        "translation": "meskipun",
        "exampleSentence": "Trotz des schlechten Wetters gingen wir spazieren.",
        "phonetic": "trots",
        "level": "B1"
      },
      {
        "id": "b1-1-vocab-9",
        "word": "anstatt",
        "translation": "alih-alih",
        "exampleSentence": "Anstatt des Kaffees trinke ich Tee.",
        "phonetic": "an-SHTAT",
        "level": "B1"
      },
      {
        "id": "b1-1-vocab-10",
        "word": "innerhalb",
        "translation": "di dalam",
        "exampleSentence": "Innerhalb der Stadt gibt es viele Parks.",
        "phonetic": "IN-ner-halb",
        "level": "B1"
      },
      {
        "id": "b1-1-vocab-11",
        "word": "außerhalb",
        "translation": "di luar",
        "exampleSentence": "Außerhalb des Dorfes ist es sehr ruhig.",
        "phonetic": "OW-ser-halb",
        "level": "B1"
      },
      {
        "id": "b1-1-vocab-12",
        "word": "die Entwicklung",
        "article": "die",
        "translation": "perkembangan",
        "exampleSentence": "Die Entwicklung der Technologie ist rasant.",
        "phonetic": "dee ent-VIK-lung",
        "level": "B1"
      },
      {
        "id": "b1-1-vocab-13",
        "word": "der Einfluss",
        "article": "der",
        "translation": "pengaruh",
        "exampleSentence": "Der Einfluss der Medien ist groß.",
        "phonetic": "dehr AIN-floos",
        "level": "B1"
      },
      {
        "id": "b1-1-vocab-14",
        "word": "die Ursache",
        "article": "die",
        "translation": "penyebab",
        "exampleSentence": "Die Ursache des Problems ist unklar.",
        "phonetic": "dee OOR-za-khe",
        "level": "B1"
      },
      {
        "id": "b1-1-vocab-15",
        "word": "die Lösung",
        "article": "die",
        "translation": "solusi",
        "exampleSentence": "Die Lösung des Rätsels war einfach.",
        "phonetic": "dee LÖ-sung",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "Pilih bentuk Genitiv yang benar: 'Das ist das Auto _____ (der Mann).'",
        "options": [
          "des Mannes",
          "dem Mann",
          "den Mann",
          "der Mann"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat: 'Die Farbe _____ (die Blumen) ist wunderschön.'",
        "options": [
          "der Blumen",
          "den Blumen",
          "die Blumen",
          "des Blumen"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Preposisi mana yang selalu diikuti oleh Genitiv?",
        "options": [
          "wegen",
          "mit",
          "nach",
          "zu"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih bentuk Genitiv yang benar: 'Der Geschmack _____ (das Essen) war hervorragend.'",
        "options": [
          "des Essens",
          "dem Essen",
          "das Essen",
          "der Essen"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat: 'Trotz _____ (der Regen) gingen wir spazieren.'",
        "options": [
          "des Regens",
          "dem Regen",
          "der Regen",
          "den Regen"
        ],
        "correctAnswer": 0
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa fungsi utama kasus Genitiv?",
        "options": [
          "Menunjukkan kepemilikan",
          "Menunjukkan objek langsung",
          "Menunjukkan objek tidak langsung",
          "Menunjukkan subjek"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Bagaimana bentuk Genitiv dari 'die Frau'?",
        "options": [
          "der Frau",
          "die Frau",
          "den Frau",
          "des Frau"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat mana yang menggunakan Genitiv dengan benar?",
        "options": [
          "Das Buch des Schülers ist neu.",
          "Das Buch dem Schüler ist neu.",
          "Das Buch den Schüler ist neu.",
          "Das Buch die Schüler ist neu."
        ],
        "correctAnswer": 0
      }
    ],
    "dialogues": [
      {
        "personA": "Entschuldigen Sie, ist das der Schlüssel des Hotels?",
        "personB": "Ja, das ist der Schlüssel des Zimmers 205.",
        "translation": "A: Maaf, apakah ini kunci hotel? B: Ya, ini kunci kamar 205."
      },
      {
        "personA": "Wegen des starken Windes können wir heute nicht segeln.",
        "personB": "Schade, ich hatte mich schon auf das Segeln gefreut.",
        "translation": "A: Karena angin kencang, kita tidak bisa berlayar hari ini. B: Sayang sekali, saya sudah menantikan berlayar."
      },
      {
        "personA": "Die Qualität der deutschen Autos ist bekanntlich sehr gut.",
        "personB": "Das stimmt. Ich bin auch ein Fan deutscher Ingenieurskunst.",
        "translation": "A: Kualitas mobil Jerman terkenal sangat baik. B: Itu benar. Saya juga penggemar teknik Jerman."
      }
    ],
    "culturalNotes": "Di Jerman, penggunaan Genitiv dalam percakapan sehari-hari sering digantikan oleh konstruksi 'von + Dativ' (misalnya 'das Auto von dem Mann' daripada 'das Auto des Mannes'), terutama di beberapa dialek atau situasi informal. Namun, Genitiv tetap sangat penting dalam bahasa tulis, bahasa formal, dan beberapa ekspresi tetap."
  },
  {
    "id": "b1-2",
    "canDoGoals": [
      "Mengidentifikasi dan membangun anak kalimat relatif (Relativsätze)",
      "Penggunaan kata ganti relatif sesuai dengan kasusnya (der, die, das, den, dem...)",
      "Membedakan kasus di dalam anak kalimat agar kata ganti relatif tidak keliru"
    ],
    "level": "B1",
    "title": "Relativsätze (Kalimat Relatif)",
    "grammarDescription": "Relativsätze (kalimat relatif) digunakan untuk memberikan informasi tambahan tentang kata benda atau kata ganti di kalimat utama. Kalimat relatif selalu dimulai dengan kata ganti relatif (Relativpronomen) yang merujuk kembali ke kata benda di kalimat utama (disebut 'antecedent'). Kata ganti relatif harus sesuai dalam gender dan jumlah dengan antecedent-nya, tetapi kasusnya ditentukan oleh fungsinya dalam kalimat relatif itu sendiri. Kata kerja di kalimat relatif selalu berada di akhir kalimat.",
    "sentenceBreakdowns": [
      "Der Mann (antecedent), + der (Relativpronomen, Nominativ maskulin) + hier steht (predikat), + ist mein Bruder.",
      "Die Frau (antecedent), + die (Relativpronomen, Nominativ feminin) + ich gestern getroffen habe (predikat), + ist sehr nett.",
      "Das Buch (antecedent), + das (Relativpronomen, Nominativ netral) + auf dem Tisch liegt (predikat), + gehört mir.",
      "Die Kinder (antecedent), + denen (Relativpronomen, Dativ plural) + ich die Süßigkeiten gegeben habe (predikat), + sind glücklich."
    ],
    "pronunciationTips": "Perhatikan intonasi pada kalimat relatif. Biasanya ada jeda singkat sebelum kata ganti relatif. Pelafalan 'r' di akhir kata ganti relatif seperti 'der', 'die', 'das' seringkali lebih lembut atau bahkan tidak terdengar jelas di beberapa dialek.",
    "vocabulary": [
      {
        "id": "b1-2-vocab-1",
        "word": "der Freund",
        "article": "der",
        "translation": "teman (laki-laki)",
        "exampleSentence": "Das ist der Freund, der mir geholfen hat.",
        "phonetic": "dehr froint",
        "level": "B1"
      },
      {
        "id": "b1-2-vocab-2",
        "word": "die Kollegin",
        "article": "die",
        "translation": "rekan kerja (perempuan)",
        "exampleSentence": "Die Kollegin, die neben mir sitzt, ist sehr fleißig.",
        "phonetic": "dee ko-LE-gin",
        "level": "B1"
      },
      {
        "id": "b1-2-vocab-3",
        "word": "das Problem",
        "article": "das",
        "translation": "masalah",
        "exampleSentence": "Das Problem, das wir besprechen müssen, ist komplex.",
        "phonetic": "das pro-BLEM",
        "level": "B1"
      },
      {
        "id": "b1-2-vocab-4",
        "word": "die Stadt",
        "article": "die",
        "translation": "kota",
        "exampleSentence": "Die Stadt, in der ich lebe, ist wunderschön.",
        "phonetic": "dee shtat",
        "level": "B1"
      },
      {
        "id": "b1-2-vocab-5",
        "word": "das Haus",
        "article": "das",
        "translation": "rumah",
        "exampleSentence": "Das Haus, das wir gekauft haben, ist sehr groß.",
        "phonetic": "das hows",
        "level": "B1"
      },
      {
        "id": "b1-2-vocab-6",
        "word": "der Lehrer",
        "article": "der",
        "translation": "guru (laki-laki)",
        "exampleSentence": "Der Lehrer, dessen Unterricht ich mag, ist sehr engagiert.",
        "phonetic": "dehr LE-rer",
        "level": "B1"
      },
      {
        "id": "b1-2-vocab-7",
        "word": "die Sprache",
        "article": "die",
        "translation": "bahasa",
        "exampleSentence": "Die Sprache, die ich lerne, ist Deutsch.",
        "phonetic": "dee SHPRA-khe",
        "level": "B1"
      },
      {
        "id": "b1-2-vocab-8",
        "word": "das Thema",
        "article": "das",
        "translation": "topik",
        "exampleSentence": "Das Thema, über das wir sprechen, ist interessant.",
        "phonetic": "das TE-ma",
        "level": "B1"
      },
      {
        "id": "b1-2-vocab-9",
        "word": "die Leute",
        "translation": "orang-orang",
        "exampleSentence": "Die Leute, mit denen ich arbeite, sind sehr nett.",
        "phonetic": "dee LOY-te",
        "level": "B1"
      },
      {
        "id": "b1-2-vocab-10",
        "word": "der Film",
        "article": "der",
        "translation": "film",
        "exampleSentence": "Der Film, den wir gestern gesehen haben, war spannend.",
        "phonetic": "dehr film",
        "level": "B1"
      },
      {
        "id": "b1-2-vocab-11",
        "word": "die Geschichte",
        "article": "die",
        "translation": "cerita, sejarah",
        "exampleSentence": "Die Geschichte, die er erzählt hat, war unglaublich.",
        "phonetic": "dee ge-SHIKH-te",
        "level": "B1"
      },
      {
        "id": "b1-2-vocab-12",
        "word": "das Ereignis",
        "article": "das",
        "translation": "peristiwa",
        "exampleSentence": "Das Ereignis, das wir gefeiert haben, war unvergesslich.",
        "phonetic": "das er-AIG-nis",
        "level": "B1"
      },
      {
        "id": "b1-2-vocab-13",
        "word": "die Aufgabe",
        "article": "die",
        "translation": "tugas",
        "exampleSentence": "Die Aufgabe, die ich erledigen muss, ist schwierig.",
        "phonetic": "dee OUF-ga-be",
        "level": "B1"
      },
      {
        "id": "b1-2-vocab-14",
        "word": "der Ort",
        "article": "der",
        "translation": "tempat",
        "exampleSentence": "Der Ort, an dem wir uns treffen, ist zentral.",
        "phonetic": "dehr ort",
        "level": "B1"
      },
      {
        "id": "b1-2-vocab-15",
        "word": "die Person",
        "article": "die",
        "translation": "orang",
        "exampleSentence": "Die Person, mit der ich gesprochen habe, war sehr hilfsbereit.",
        "phonetic": "dee per-ZON",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: 'Das ist der Mann, _____ ich gestern gesehen habe.'",
        "options": [
          "den",
          "der",
          "dem",
          "dessen"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat: 'Die Frau, _____ Auto kaputt ist, ist meine Nachbarin.'",
        "options": [
          "deren",
          "die",
          "der",
          "dessen"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih kata ganti relatif yang benar: 'Das ist das Buch, _____ auf dem Tisch liegt.'",
        "options": [
          "das",
          "der",
          "die",
          "dem"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat: 'Die Kinder, _____ ich die Geschenke gegeben habe, sind glücklich.'",
        "options": [
          "denen",
          "die",
          "der",
          "den"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih kata ganti relatif yang benar: 'Ich kenne einen Arzt, _____ sehr gut ist.'",
        "options": [
          "der",
          "den",
          "dem",
          "dessen"
        ],
        "correctAnswer": 0
      }
    ],
    "miniQuiz": [
      {
        "question": "Di mana posisi kata kerja dalam kalimat relatif?",
        "options": [
          "Di akhir kalimat",
          "Di awal kalimat",
          "Setelah kata ganti relatif",
          "Sebelum kata ganti relatif"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kata ganti relatif 'die' digunakan untuk gender apa?",
        "options": [
          "Feminin singular dan plural",
          "Maskulin singular",
          "Netral singular",
          "Semua gender"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Bagaimana menentukan kasus kata ganti relatif?",
        "options": [
          "Oleh fungsinya dalam kalimat relatif",
          "Oleh gender antecedent",
          "Oleh jumlah antecedent",
          "Selalu Nominativ"
        ],
        "correctAnswer": 0
      }
    ],
    "dialogues": [
      {
        "personA": "Kennst du den Mann, der dort drüben steht?",
        "personB": "Ja, das ist Herr Müller, der neue Lehrer, der aus Berlin kommt.",
        "translation": "A: Apakah kamu kenal pria yang berdiri di sana? B: Ya, itu Tuan Müller, guru baru yang berasal dari Berlin."
      },
      {
        "personA": "Ich suche das Buch, das ich gestern hier gelassen habe.",
        "personB": "Meinst du das Buch, das einen roten Einband hat?",
        "translation": "A: Saya mencari buku yang saya tinggalkan di sini kemarin. B: Maksudmu buku yang sampulnya merah?"
      },
      {
        "personA": "Die Stadt, in der wir unseren Urlaub verbracht haben, war wunderschön.",
        "personB": "Ah, ich erinnere mich an die Fotos, die du mir gezeigt hast.",
        "translation": "A: Kota tempat kami menghabiskan liburan sangat indah. B: Ah, saya ingat foto-foto yang kamu tunjukkan padaku."
      }
    ],
    "culturalNotes": "Penggunaan kalimat relatif yang tepat menunjukkan kemahiran berbahasa Jerman. Dalam bahasa Jerman, kalimat relatif seringkali lebih panjang dan kompleks dibandingkan dalam bahasa Indonesia, karena kata kerja selalu di akhir. Ini membutuhkan sedikit latihan untuk terbiasa, baik dalam memahami maupun membentuknya."
  },
  {
    "id": "b1-3",
    "canDoGoals": [
      "Menggambarkan pengandaian atau kondisi khayal yang tak realistis saat ini (Konjunktiv II)",
      "Membentuk Konjunktiv II dengan (würde + Infinitiv) khusus untuk sebagian besar verba",
      "Mampu meminta tolong dengan intensi kesopanan paling tinggi secara tertulis dan lisan (könnte/dürfte ich...)"
    ],
    "level": "B1",
    "title": "Konjunktiv II (würde, könnte, müsste)",
    "grammarDescription": "Konjunktiv II digunakan untuk menyatakan keinginan, kemungkinan, saran, atau situasi hipotetis yang tidak nyata atau tidak mungkin terjadi di masa sekarang atau masa depan. Bentuk yang paling umum adalah dengan 'würde' + Infinitiv (misalnya 'Ich würde gehen' - saya akan pergi). Untuk kata kerja modal (können, müssen, sollen, dürfen, mögen) dan beberapa kata kerja kuat (sein, haben, wissen), sering digunakan bentuk Konjunktiv II khusus mereka (misalnya 'Ich könnte' - saya bisa, 'Ich hätte' - saya punya).",
    "sentenceBreakdowns": [
      "Ich (subjek) + würde (Konjunktiv II von werden) + gerne (adverb) + reisen (Infinitiv).",
      "Wenn ich Zeit hätte (Konjunktiv II von haben), + würde ich dich besuchen (Konjunktiv II von werden).",
      "Er (subjek) + könnte (Konjunktiv II von können) + uns helfen (Infinitiv).",
      "Du (subjek) + solltest (Konjunktiv II von sollen) + mehr lernen (Infinitiv)."
    ],
    "pronunciationTips": "Perhatikan pelafalan umlaut (ä, ö, ü) pada bentuk Konjunktiv II, seperti pada 'könnte' (KÖN-te), 'müsste' (MÜS-te), 'hätte' (HET-te). Huruf 'r' di 'würde' seringkali terdengar lembut atau seperti 'a' samar.",
    "vocabulary": [
      {
        "id": "b1-3-vocab-1",
        "word": "würde",
        "translation": "akan (bentuk Konjunktiv II dari 'werden')",
        "exampleSentence": "Ich würde gerne ein neues Auto kaufen.",
        "phonetic": "VÜR-de",
        "level": "B1"
      },
      {
        "id": "b1-3-vocab-2",
        "word": "könnte",
        "translation": "bisa, mungkin (bentuk Konjunktiv II dari 'können')",
        "exampleSentence": "Ich könnte dir helfen, wenn ich Zeit hätte.",
        "phonetic": "KÖN-te",
        "level": "B1"
      },
      {
        "id": "b1-3-vocab-3",
        "word": "müsste",
        "translation": "harus (bentuk Konjunktiv II dari 'müssen')",
        "exampleSentence": "Ich müsste jetzt gehen, aber ich will nicht.",
        "phonetic": "MÜS-te",
        "level": "B1"
      },
      {
        "id": "b1-3-vocab-4",
        "word": "sollte",
        "translation": "seharusnya (bentuk Konjunktiv II dari 'sollen')",
        "exampleSentence": "Du solltest mehr Wasser trinken.",
        "phonetic": "ZOL-te",
        "level": "B1"
      },
      {
        "id": "b1-3-vocab-5",
        "word": "hätte",
        "translation": "punya (bentuk Konjunktiv II dari 'haben')",
        "exampleSentence": "Wenn ich mehr Geld hätte, würde ich reisen.",
        "phonetic": "HET-te",
        "level": "B1"
      },
      {
        "id": "b1-3-vocab-6",
        "word": "wäre",
        "translation": "adalah (bentuk Konjunktiv II dari 'sein')",
        "exampleSentence": "Es wäre schön, wenn du kommen könntest.",
        "phonetic": "VÄ-re",
        "level": "B1"
      },
      {
        "id": "b1-3-vocab-7",
        "word": "dürfte",
        "translation": "boleh (bentuk Konjunktiv II dari 'dürfen')",
        "exampleSentence": "Dürfte ich Sie um einen Gefallen bitten?",
        "phonetic": "DÜR-f-te",
        "level": "B1"
      },
      {
        "id": "b1-3-vocab-8",
        "word": "möchte",
        "translation": "ingin (bentuk Konjunktiv II dari 'mögen')",
        "exampleSentence": "Ich möchte jetzt nach Hause gehen.",
        "phonetic": "MÖKH-te",
        "level": "B1"
      },
      {
        "id": "b1-3-vocab-9",
        "word": "der Wunsch",
        "article": "der",
        "translation": "keinginan",
        "exampleSentence": "Mein größter Wunsch wäre eine Weltreise.",
        "phonetic": "dehr vunsh",
        "level": "B1"
      },
      {
        "id": "b1-3-vocab-10",
        "word": "die Möglichkeit",
        "article": "die",
        "translation": "kemungkinan",
        "exampleSentence": "Es gäbe die Möglichkeit, das Problem zu lösen.",
        "phonetic": "dee MÖG-likh-kait",
        "level": "B1"
      },
      {
        "id": "b1-3-vocab-11",
        "word": "der Rat",
        "article": "der",
        "translation": "nasihat",
        "exampleSentence": "Ich würde dir den Rat geben, fleißig zu lernen.",
        "phonetic": "dehr rat",
        "level": "B1"
      },
      {
        "id": "b1-3-vocab-12",
        "word": "hypothetisch",
        "translation": "hipotetis",
        "exampleSentence": "Das ist eine hypothetische Situation.",
        "phonetic": "hy-po-TE-tish",
        "level": "B1"
      },
      {
        "id": "b1-3-vocab-13",
        "word": "unrealistisch",
        "translation": "tidak realistis",
        "exampleSentence": "Deine Erwartungen wären unrealistisch.",
        "phonetic": "un-re-a-LIS-tish",
        "level": "B1"
      },
      {
        "id": "b1-3-vocab-14",
        "word": "höflich",
        "translation": "sopan",
        "exampleSentence": "Es wäre höflich, sich zu bedanken.",
        "phonetic": "HÖF-likh",
        "level": "B1"
      },
      {
        "id": "b1-3-vocab-15",
        "word": "vorschlagen",
        "translation": "menyarankan",
        "exampleSentence": "Ich würde vorschlagen, dass wir uns treffen.",
        "phonetic": "FOR-shla-gen",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: 'Wenn ich reich _____, würde ich ein Haus kaufen.'",
        "options": [
          "wäre",
          "bin",
          "habe",
          "werde"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih bentuk Konjunktiv II yang benar: 'Ich _____ dir gerne helfen.'",
        "options": [
          "würde",
          "werde",
          "bin",
          "habe"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat: 'Du _____ mehr Sport machen.'",
        "options": [
          "solltest",
          "sollst",
          "musst",
          "kannst"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih bentuk Konjunktiv II yang benar: 'Es _____ schön, wenn du mitkommen _____.'",
        "options": [
          "wäre, könntest",
          "ist, kannst",
          "wird, wirst",
          "hat, hast"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat mana yang menggunakan Konjunktiv II untuk permintaan sopan?",
        "options": [
          "Könnten Sie mir bitte helfen?",
          "Sie können mir bitte helfen.",
          "Sie helfen mir bitte.",
          "Sie werden mir bitte helfen."
        ],
        "correctAnswer": 0
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa fungsi utama Konjunktiv II?",
        "options": [
          "Menyatakan hal hipotetis atau tidak nyata",
          "Menyatakan fakta",
          "Menyatakan perintah",
          "Menyatakan masa lalu"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Bentuk Konjunktiv II dari 'haben' adalah...",
        "options": [
          "hätte",
          "hatte",
          "habe",
          "habte"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat 'Ich würde gerne Kaffee trinken' berarti...",
        "options": [
          "Saya ingin minum kopi (sekarang/hipotetis)",
          "Saya minum kopi",
          "Saya akan minum kopi (pasti)",
          "Saya harus minum kopi"
        ],
        "correctAnswer": 0
      }
    ],
    "dialogues": [
      {
        "personA": "Wenn ich mehr Zeit hätte, würde ich einen Sprachkurs besuchen.",
        "personB": "Das wäre eine gute Idee! Du könntest dein Deutsch verbessern.",
        "translation": "A: Jika saya punya lebih banyak waktu, saya akan mengikuti kursus bahasa. B: Itu ide yang bagus! Kamu bisa meningkatkan bahasa Jermamu."
      },
      {
        "personA": "Dürfte ich Sie um einen kleinen Gefallen bitten?",
        "personB": "Ja, natürlich. Was könnte ich für Sie tun?",
        "translation": "A: Bolehkah saya meminta bantuan kecil? B: Ya, tentu saja. Apa yang bisa saya lakukan untuk Anda?"
      },
      {
        "personA": "Ich müsste jetzt eigentlich nach Hause, aber der Film ist so spannend.",
        "personB": "Bleib doch noch ein bisschen! Es wäre schade, den Schluss zu verpassen.",
        "translation": "A: Sebenarnya saya harus pulang sekarang, tapi filmnya sangat seru. B: Tetaplah sebentar lagi! Sayang sekali kalau melewatkan akhirnya."
      }
    ],
    "culturalNotes": "Konjunktiv II sangat penting untuk komunikasi yang sopan dan untuk menyatakan ketidakpastian atau kemungkinan dalam bahasa Jerman. Menguasai bentuk ini akan membuat percakapan Anda terdengar lebih alami dan terpelajar. Permintaan sopan sering menggunakan 'könnte', 'dürfte', atau 'würde'."
  },
  {
    "id": "b1-checkpoint-1",
    "canDoGoals": [
      "Mengevaluasi penguasaan aturan kasus Genitiv (Kepemilikan Lanjut)",
      "Mengevaluasi penggunaan kata ganti Relatif dalam menyambung anak kalimat",
      "Mengevaluasi kesopanan level tinggi (Konjunktiv II)"
    ],
    "title": "Review Konten Sebelumnya",
    "requiredScore": 0.7,
    "questions": [
      {
        "question": "Pilih bentuk Genitiv yang benar: 'Die Geschichte _____ (die Stadt) ist sehr alt.'",
        "options": [
          "der Stadt",
          "die Stadt",
          "den Stadt",
          "des Stadt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat relatif: 'Das ist der Mann, _____ ich gestern getroffen habe.'",
        "options": [
          "den",
          "der",
          "dem",
          "dessen"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih bentuk Konjunktiv II yang benar: 'Wenn ich mehr Geld _____, würde ich ein neues Auto kaufen.'",
        "options": [
          "hätte",
          "habe",
          "hatte",
          "bin"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Preposisi mana yang diikuti oleh Genitiv?",
        "options": [
          "während",
          "mit",
          "nach",
          "aus"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat relatif: 'Die Frau, _____ Kinder im Garten spielen, ist meine Nachbarin.'",
        "options": [
          "deren",
          "die",
          "der",
          "denen"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Apa arti dari 'Ich könnte dir helfen'?",
        "options": [
          "Saya bisa membantumu (hipotetis)",
          "Saya harus membantumu",
          "Saya akan membantumu",
          "Saya ingin membantumu"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Bagaimana bentuk Genitiv dari 'das Kind'?",
        "options": [
          "des Kindes",
          "dem Kind",
          "das Kind",
          "der Kind"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Dalam kalimat relatif, di mana posisi kata kerja?",
        "options": [
          "Di akhir kalimat",
          "Di awal kalimat",
          "Setelah kata ganti relatif",
          "Sebelum kata ganti relatif"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih bentuk Konjunktiv II yang benar: 'Es _____ schön, wenn du mitkommen _____.'",
        "options": [
          "wäre, könntest",
          "ist, kannst",
          "wird, wirst",
          "hat, hast"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat: 'Trotz _____ (das schlechte Wetter) gingen wir spazieren.'",
        "options": [
          "des schlechten Wetters",
          "dem schlechten Wetter",
          "der schlechten Wetter",
          "das schlechte Wetter"
        ],
        "correctAnswer": 0
      }
    ],
    "reviewLessons": [
      "b1-1",
      "b1-2",
      "b1-3"
    ]
  },
  {
    "id": "b1-4",
    "canDoGoals": [
      "Memfokuskan subjek pada sebuah tindakan daripada pelakunya dengan konstruksi Passiv",
      "Latihan men-transformasikan kalimat aktif menjadi kalimat Passiv",
      "Membangun konjugasi kalimat pasif baik di tensa Präsens (werden + Partizip II) maupun Präteritum (wurden...)"
    ],
    "level": "B1",
    "title": "Passiv Präsens & Präteritum",
    "grammarDescription": "Passiv (kalimat pasif) digunakan ketika fokusnya adalah pada tindakan atau apa yang terjadi, bukan pada siapa yang melakukan tindakan tersebut. Dalam bahasa Jerman, kalimat pasif dibentuk dengan kata kerja bantu 'werden' dan Partizip II (past participle) dari kata kerja utama. Untuk Passiv Präsens, kita menggunakan 'werden' dalam bentuk Präsens. Untuk Passiv Präteritum, kita menggunakan 'werden' dalam bentuk Präteritum ('wurde'). Pelaku tindakan (jika disebutkan) diperkenalkan dengan preposisi 'von' (untuk orang) atau 'durch' (untuk penyebab/sarana) + Dativ.",
    "sentenceBreakdowns": [
      "Das Buch (subjek) + wird (werden, Präsens) + gelesen (Partizip II).",
      "Das Auto (subjek) + wurde (werden, Präteritum) + repariert (Partizip II) + von dem Mechaniker (pelaku).",
      "Die Tür (subjek) + wird (werden, Präsens) + geöffnet (Partizip II).",
      "Viele Häuser (subjek) + wurden (werden, Präteritum) + durch das Erdbeben (penyebab) + zerstört (Partizip II)."
    ],
    "pronunciationTips": "Perhatikan pelafalan 'w' pada 'werden' dan 'wurde' yang seperti 'v' dalam bahasa Inggris. Akhiran '-en' pada Partizip II seringkali terdengar seperti 'n' yang samar.",
    "vocabulary": [
      {
        "id": "b1-4-vocab-1",
        "word": "werden",
        "translation": "menjadi (digunakan sebagai kata bantu pasif)",
        "exampleSentence": "Das Essen wird gekocht.",
        "phonetic": "VER-den",
        "level": "B1"
      },
      {
        "id": "b1-4-vocab-2",
        "word": "wurde",
        "translation": "menjadi (bentuk Präteritum dari 'werden')",
        "exampleSentence": "Das Haus wurde gebaut.",
        "phonetic": "VUR-de",
        "level": "B1"
      },
      {
        "id": "b1-4-vocab-3",
        "word": "gekocht",
        "translation": "dimasak (Partizip II dari 'kochen')",
        "exampleSentence": "Das Abendessen wird gerade gekocht.",
        "phonetic": "ge-KOKHT",
        "level": "B1"
      },
      {
        "id": "b1-4-vocab-4",
        "word": "gebaut",
        "translation": "dibangun (Partizip II dari 'bauen')",
        "exampleSentence": "Die Brücke wurde letztes Jahr gebaut.",
        "phonetic": "ge-BOWT",
        "level": "B1"
      },
      {
        "id": "b1-4-vocab-5",
        "word": "repariert",
        "translation": "diperbaiki (Partizip II dari 'reparieren')",
        "exampleSentence": "Mein Fahrrad wird repariert.",
        "phonetic": "re-pa-REERT",
        "level": "B1"
      },
      {
        "id": "b1-4-vocab-6",
        "word": "geschrieben",
        "translation": "ditulis (Partizip II dari 'schreiben')",
        "exampleSentence": "Der Brief wurde von meiner Schwester geschrieben.",
        "phonetic": "ge-SHREE-ben",
        "level": "B1"
      },
      {
        "id": "b1-4-vocab-7",
        "word": "geöffnet",
        "translation": "dibuka (Partizip II dari 'öffnen')",
        "exampleSentence": "Das Geschäft wird um 9 Uhr geöffnet.",
        "phonetic": "ge-ÖF-net",
        "level": "B1"
      },
      {
        "id": "b1-4-vocab-8",
        "word": "geschlossen",
        "translation": "ditutup (Partizip II dari 'schließen')",
        "exampleSentence": "Die Tür wurde geschlossen.",
        "phonetic": "ge-SHLOS-sen",
        "level": "B1"
      },
      {
        "id": "b1-4-vocab-9",
        "word": "verkauft",
        "translation": "dijual (Partizip II dari 'verkaufen')",
        "exampleSentence": "Das Auto wird verkauft.",
        "phonetic": "fer-KAUFT",
        "level": "B1"
      },
      {
        "id": "b1-4-vocab-10",
        "word": "gefunden",
        "translation": "ditemukan (Partizip II dari 'finden')",
        "exampleSentence": "Der Schlüssel wurde gefunden.",
        "phonetic": "ge-FUN-den",
        "level": "B1"
      },
      {
        "id": "b1-4-vocab-11",
        "word": "von",
        "translation": "oleh (digunakan untuk pelaku pasif)",
        "exampleSentence": "Das Bild wurde von einem Künstler gemalt.",
        "phonetic": "fon",
        "level": "B1"
      },
      {
        "id": "b1-4-vocab-12",
        "word": "durch",
        "translation": "melalui, oleh (digunakan untuk penyebab/sarana pasif)",
        "exampleSentence": "Das Fenster wurde durch den Ball zerbrochen.",
        "phonetic": "durkh",
        "level": "B1"
      },
      {
        "id": "b1-4-vocab-13",
        "word": "die Nachricht",
        "article": "die",
        "translation": "berita",
        "exampleSentence": "Die Nachricht wurde schnell verbreitet.",
        "phonetic": "dee NAHKH-rikht",
        "level": "B1"
      },
      {
        "id": "b1-4-vocab-14",
        "word": "das Gesetz",
        "article": "das",
        "translation": "hukum",
        "exampleSentence": "Ein neues Gesetz wird verabschiedet.",
        "phonetic": "das ge-ZETS",
        "level": "B1"
      },
      {
        "id": "b1-4-vocab-15",
        "word": "die Entscheidung",
        "article": "die",
        "translation": "keputusan",
        "exampleSentence": "Die Entscheidung wurde getroffen.",
        "phonetic": "dee ent-SHAI-dung",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "Ubah kalimat aktif ini menjadi pasif Präsens: 'Der Bäcker backt das Brot.'",
        "options": [
          "Das Brot wird gebacken.",
          "Das Brot wurde gebacken.",
          "Das Brot ist gebacken.",
          "Das Brot backt."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ubah kalimat aktif ini menjadi pasif Präteritum: 'Die Kinder haben die Tür geöffnet.'",
        "options": [
          "Die Tür wurde von den Kindern geöffnet.",
          "Die Tür wird von den Kindern geöffnet.",
          "Die Tür ist von den Kindern geöffnet worden.",
          "Die Tür hat von den Kindern geöffnet."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat pasif: 'Das Auto _____ (reparieren) in der Werkstatt.' (Präsens)",
        "options": [
          "wird repariert",
          "wurde repariert",
          "ist repariert",
          "hat repariert"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat pasif: 'Das Buch _____ (schreiben) von einem berühmten Autor.' (Präteritum)",
        "options": [
          "wurde geschrieben",
          "wird geschrieben",
          "ist geschrieben",
          "hat geschrieben"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kapan kita menggunakan 'von' dalam kalimat pasif?",
        "options": [
          "Untuk pelaku orang",
          "Untuk penyebab atau sarana",
          "Untuk objek langsung",
          "Untuk objek tidak langsung"
        ],
        "correctAnswer": 0
      }
    ],
    "miniQuiz": [
      {
        "question": "Bagaimana bentuk dasar Passiv Präsens?",
        "options": [
          "werden + Partizip II",
          "haben + Partizip II",
          "sein + Partizip II",
          "werden + Infinitiv"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Apa bentuk Präteritum dari 'werden'?",
        "options": [
          "wurde",
          "wird",
          "war",
          "hatte"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat 'Das Essen wird gekocht' berarti...",
        "options": [
          "Makanannya sedang dimasak",
          "Makanannya dimasak",
          "Makanannya akan dimasak",
          "Makanannya telah dimasak"
        ],
        "correctAnswer": 0
      }
    ],
    "dialogues": [
      {
        "personA": "Wann wird das neue Museum eröffnet?",
        "personB": "Es wird nächste Woche eröffnet. Die Vorbereitungen wurden schon abgeschlossen.",
        "translation": "A: Kapan museum baru akan dibuka? B: Akan dibuka minggu depan. Persiapannya sudah selesai."
      },
      {
        "personA": "Das Auto wurde gestern repariert, oder?",
        "personB": "Ja, es wurde von einem sehr guten Mechaniker repariert.",
        "translation": "A: Mobilnya diperbaiki kemarin, kan? B: Ya, diperbaiki oleh mekanik yang sangat bagus."
      },
      {
        "personA": "Viele Bäume wurden durch den Sturm entwurzelt.",
        "personB": "Das ist traurig. Hoffentlich werden sie bald ersetzt.",
        "translation": "A: Banyak pohon tumbang karena badai. B: Itu menyedihkan. Semoga segera diganti."
      }
    ],
    "culturalNotes": "Dalam bahasa Jerman, kalimat pasif sering digunakan dalam berita, laporan ilmiah, atau deskripsi proses, di mana pelaku tindakan kurang penting atau tidak diketahui. Ini memberikan kesan objektivitas dan formalitas. Memahami pasif sangat penting untuk membaca teks-teks formal."
  },
  {
    "id": "b1-5",
    "canDoGoals": [
      "Mengerti penggunaan Konjungsi ganda (Zweiteilige Konjunktionen)",
      "Mengekspresikan pilihan alternatif (entweder... oder), atau tambahan yang menguatkan (nicht nur... sondern auch)",
      "Mengekspresikan perlawan argumen / pengecualian ganda (zwar... aber, weder... noch)"
    ],
    "level": "B1",
    "title": "Zweiteilige Konjunktionen",
    "grammarDescription": "Zweiteilige Konjunktionen (konjungsi dua bagian) adalah pasangan kata yang digunakan untuk menghubungkan dua bagian kalimat atau dua elemen yang setara. Mereka membantu dalam menyusun kalimat yang lebih kompleks dan bervariasi. Contoh umum termasuk 'entweder...oder' (baik...atau), 'weder...noch' (tidak...maupun), 'sowohl...als auch' (baik...maupun), 'nicht nur...sondern auch' (tidak hanya...tetapi juga), dan 'je...desto' (semakin...semakin).",
    "sentenceBreakdowns": [
      "Er spricht (verb) + sowohl (konjungsi 1) + Deutsch (objek) + als auch (konjungsi 2) + Englisch (objek).",
      "Ich möchte (verb) + entweder (konjungsi 1) + Kaffee (objek) + oder (konjungsi 2) + Tee (objek) trinken.",
      "Sie mag (verb) + weder (konjungsi 1) + Fisch (objek) + noch (konjungsi 2) + Fleisch (objek).",
      "Je (konjungsi 1) + mehr du lernst (klausa), + desto (konjungsi 2) + besser wirst du (klausa)."
    ],
    "pronunciationTips": "Perhatikan penekanan pada kedua bagian konjungsi. Misalnya, pada 'entweder...oder', kedua kata 'entweder' dan 'oder' biasanya diberi penekanan. Untuk 'je...desto', intonasi kalimat akan naik pada klausa 'je' dan turun pada klausa 'desto'.",
    "vocabulary": [
      {
        "id": "b1-5-vocab-1",
        "word": "entweder...oder",
        "translation": "baik...atau",
        "exampleSentence": "Entweder wir gehen ins Kino oder wir bleiben zu Hause.",
        "phonetic": "ENT-vee-der...O-der",
        "level": "B1"
      },
      {
        "id": "b1-5-vocab-2",
        "word": "weder...noch",
        "translation": "tidak...maupun",
        "exampleSentence": "Er spricht weder Deutsch noch Englisch.",
        "phonetic": "VE-der...nok",
        "level": "B1"
      },
      {
        "id": "b1-5-vocab-3",
        "word": "sowohl...als auch",
        "translation": "baik...maupun",
        "exampleSentence": "Sie mag sowohl Kaffee als auch Tee.",
        "phonetic": "zo-VOL...als OUKH",
        "level": "B1"
      },
      {
        "id": "b1-5-vocab-4",
        "word": "nicht nur...sondern auch",
        "translation": "tidak hanya...tetapi juga",
        "exampleSentence": "Er ist nicht nur intelligent, sondern auch sehr freundlich.",
        "phonetic": "nikht noor...ZON-dern oukh",
        "level": "B1"
      },
      {
        "id": "b1-5-vocab-5",
        "word": "je...desto/umso",
        "translation": "semakin...semakin",
        "exampleSentence": "Je mehr du übst, desto besser wirst du.",
        "phonetic": "ye...DES-to/UM-zo",
        "level": "B1"
      },
      {
        "id": "b1-5-vocab-6",
        "word": "einerseits...andererseits",
        "translation": "di satu sisi...di sisi lain",
        "exampleSentence": "Einerseits ist es teuer, andererseits ist es sehr praktisch.",
        "phonetic": "AIN-er-zaits...AN-de-rer-zaits",
        "level": "B1"
      },
      {
        "id": "b1-5-vocab-7",
        "word": "bald...bald",
        "translation": "kadang...kadang",
        "exampleSentence": "Bald regnet es, bald scheint die Sonne.",
        "phonetic": "balt...balt",
        "level": "B1"
      },
      {
        "id": "b1-5-vocab-8",
        "word": "teils...teils",
        "translation": "sebagian...sebagian",
        "exampleSentence": "Das Ergebnis war teils gut, teils schlecht.",
        "phonetic": "tails...tails",
        "level": "B1"
      },
      {
        "id": "b1-5-vocab-9",
        "word": "ob...oder",
        "translation": "apakah...atau",
        "exampleSentence": "Ich weiß nicht, ob er kommt oder nicht.",
        "phonetic": "op...O-der",
        "level": "B1"
      },
      {
        "id": "b1-5-vocab-10",
        "word": "verbinden",
        "translation": "menghubungkan",
        "exampleSentence": "Diese Konjunktionen verbinden Satzteile.",
        "phonetic": "fer-BIN-den",
        "level": "B1"
      },
      {
        "id": "b1-5-vocab-11",
        "word": "die Wahl",
        "article": "die",
        "translation": "pilihan",
        "exampleSentence": "Wir haben die Wahl zwischen zwei Optionen.",
        "phonetic": "dee val",
        "level": "B1"
      },
      {
        "id": "b1-5-vocab-12",
        "word": "die Alternative",
        "article": "die",
        "translation": "alternatif",
        "exampleSentence": "Es gibt keine Alternative zu dieser Lösung.",
        "phonetic": "dee al-ter-na-TEE-ve",
        "level": "B1"
      },
      {
        "id": "b1-5-vocab-13",
        "word": "der Gegensatz",
        "article": "der",
        "translation": "kebalikan",
        "exampleSentence": "Im Gegensatz dazu ist die andere Option besser.",
        "phonetic": "dehr GE-gen-zats",
        "level": "B1"
      },
      {
        "id": "b1-5-vocab-14",
        "word": "die Steigerung",
        "article": "die",
        "translation": "peningkatan",
        "exampleSentence": "Je mehr, desto besser ist eine Steigerung.",
        "phonetic": "dee SHTAI-ge-rung",
        "level": "B1"
      },
      {
        "id": "b1-5-vocab-15",
        "word": "die Einschränkung",
        "article": "die",
        "translation": "pembatasan",
        "exampleSentence": "Nicht nur, sondern auch zeigt keine Einschränkung.",
        "phonetic": "dee AIN-shren-kung",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: 'Ich möchte _____ Kaffee _____ Tee trinken.'",
        "options": [
          "entweder...oder",
          "weder...noch",
          "sowohl...als auch",
          "nicht nur...sondern auch"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih konjungsi yang tepat: 'Er ist _____ intelligent _____ fleißig.'",
        "options": [
          "nicht nur...sondern auch",
          "entweder...oder",
          "weder...noch",
          "je...desto"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat: 'Sie mag _____ Fisch _____ Fleisch.'",
        "options": [
          "weder...noch",
          "entweder...oder",
          "sowohl...als auch",
          "nicht nur...sondern auch"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih konjungsi yang tepat: '_____ mehr du lernst, _____ besser wirst du.'",
        "options": [
          "Je...desto",
          "Entweder...oder",
          "Weder...noch",
          "Sowohl...als auch"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat mana yang menggunakan 'sowohl...als auch' dengan benar?",
        "options": [
          "Er spricht sowohl Deutsch als auch Englisch.",
          "Er spricht sowohl Deutsch oder Englisch.",
          "Er spricht weder Deutsch als auch Englisch.",
          "Er spricht nicht nur Deutsch oder Englisch."
        ],
        "correctAnswer": 0
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa arti dari 'weder...noch'?",
        "options": [
          "Tidak...maupun",
          "Baik...atau",
          "Baik...maupun",
          "Tidak hanya...tetapi juga"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Konjungsi mana yang menunjukkan pilihan?",
        "options": [
          "entweder...oder",
          "weder...noch",
          "sowohl...als auch",
          "nicht nur...sondern auch"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Dalam 'je...desto', kata kerja di kedua klausa berada di posisi mana?",
        "options": [
          "Di akhir klausa",
          "Di awal klausa",
          "Setelah 'je' dan 'desto'",
          "Di posisi kedua"
        ],
        "correctAnswer": 0
      }
    ],
    "dialogues": [
      {
        "personA": "Was möchtest du zum Abendessen? Entweder Pizza oder Pasta?",
        "personB": "Ich nehme entweder Pizza oder Pasta, beides ist gut.",
        "translation": "A: Kamu mau makan malam apa? Pizza atau pasta? B: Saya ambil pizza atau pasta, keduanya enak."
      },
      {
        "personA": "Er ist nicht nur ein guter Sportler, sondern auch ein hervorragender Student.",
        "personB": "Das stimmt, er ist wirklich vielseitig begabt.",
        "translation": "A: Dia tidak hanya atlet yang baik, tetapi juga siswa yang luar biasa. B: Itu benar, dia benar-benar berbakat dalam banyak hal."
      },
      {
        "personA": "Je mehr ich lerne, desto mehr verstehe ich.",
        "personB": "Das ist eine gute Einstellung! Weiter so.",
        "translation": "A: Semakin banyak saya belajar, semakin banyak saya mengerti. B: Itu sikap yang bagus! Teruslah begitu."
      }
    ],
    "culturalNotes": "Zweiteilige Konjunktionen sering digunakan dalam bahasa Jerman untuk membuat argumen yang lebih kuat, membandingkan, atau memberikan pilihan yang jelas. Mereka menunjukkan kemampuan berbahasa yang lebih maju dan sering muncul dalam teks-teks formal maupun percakapan sehari-hari yang lebih terstruktur."
  },
  {
    "id": "b1-6",
    "canDoGoals": [
      "Membedakan tutur langsung dan tidak langsung (Indirekte Rede level dasar)",
      "Menyalin ucapan sumber langsung tanpa tanda kutip dengan kata ganti dan preposisi waktu yang sesuai",
      "Mengalihkan persepsi (Er sagte, dass...)"
    ],
    "level": "B1",
    "title": "Indirekte Rede",
    "grammarDescription": "Indirekte Rede (kalimat tidak langsung) digunakan untuk melaporkan apa yang dikatakan atau dipikirkan seseorang tanpa mengutipnya secara langsung. Dalam bahasa Jerman, ini sering dibentuk dengan Konjunktiv I. Jika bentuk Konjunktiv I sama dengan Indikativ (terutama pada 'ich' dan 'wir'), maka Konjunktiv II digunakan untuk menghindari ambiguitas. Kata kerja di kalimat tidak langsung selalu berada di akhir. Perubahan waktu dan kata ganti juga perlu diperhatikan.",
    "sentenceBreakdowns": [
      "Er sagt (Hauptsatz), + dass (konjungsi) + er (subjek) + müde sei (Konjunktiv I).",
      "Sie fragte (Hauptsatz), + ob (konjungsi) + ich (subjek) + ihr helfen könne (Konjunktiv II).",
      "Der Lehrer erklärte (Hauptsatz), + dass (konjungsi) + die Prüfung (subjek) + schwierig sei (Konjunktiv I).",
      "Sie meinte (Hauptsatz), + sie (subjek) + habe (Konjunktiv I von haben) + keine Zeit (objek)."
    ],
    "pronunciationTips": "Dalam Indirekte Rede, intonasi cenderung datar atau menurun di akhir kalimat, berbeda dengan pertanyaan langsung. Perhatikan perbedaan pelafalan antara bentuk Indikativ dan Konjunktiv I/II, terutama pada umlaut.",
    "vocabulary": [
      {
        "id": "b1-6-vocab-1",
        "word": "sagen",
        "translation": "mengatakan",
        "exampleSentence": "Er sagt, er sei müde.",
        "phonetic": "ZA-gen",
        "level": "B1"
      },
      {
        "id": "b1-6-vocab-2",
        "word": "fragen",
        "translation": "bertanya",
        "exampleSentence": "Sie fragte, ob ich ihr helfen könne.",
        "phonetic": "FRA-gen",
        "level": "B1"
      },
      {
        "id": "b1-6-vocab-3",
        "word": "meinen",
        "translation": "berpendapat, bermaksud",
        "exampleSentence": "Sie meinte, sie habe keine Zeit.",
        "phonetic": "MAI-nen",
        "level": "B1"
      },
      {
        "id": "b1-6-vocab-4",
        "word": "erklären",
        "translation": "menjelaskan",
        "exampleSentence": "Er erklärte, dass das Problem komplex sei.",
        "phonetic": "er-KLÄ-ren",
        "level": "B1"
      },
      {
        "id": "b1-6-vocab-5",
        "word": "berichten",
        "translation": "melaporkan",
        "exampleSentence": "Der Journalist berichtete, dass die Lage sich entspanne.",
        "phonetic": "be-RIKHT-en",
        "level": "B1"
      },
      {
        "id": "b1-6-vocab-6",
        "word": "behaupten",
        "translation": "mengklaim",
        "exampleSentence": "Er behauptete, er habe die Wahrheit gesagt.",
        "phonetic": "be-HAUP-ten",
        "level": "B1"
      },
      {
        "id": "b1-6-vocab-7",
        "word": "wissen",
        "translation": "mengetahui",
        "exampleSentence": "Ich wusste nicht, dass er schon gegangen sei.",
        "phonetic": "VIS-sen",
        "level": "B1"
      },
      {
        "id": "b1-6-vocab-8",
        "word": "glauben",
        "translation": "percaya",
        "exampleSentence": "Ich glaube, er sei im Urlaub.",
        "phonetic": "GLAU-ben",
        "level": "B1"
      },
      {
        "id": "b1-6-vocab-9",
        "word": "hoffen",
        "translation": "berharap",
        "exampleSentence": "Sie hoffte, dass alles gut werde.",
        "phonetic": "HOF-fen",
        "level": "B1"
      },
      {
        "id": "b1-6-vocab-10",
        "word": "die Aussage",
        "article": "die",
        "translation": "pernyataan",
        "exampleSentence": "Seine Aussage war sehr klar.",
        "phonetic": "dee OUS-za-ge",
        "level": "B1"
      },
      {
        "id": "b1-6-vocab-11",
        "word": "die Frage",
        "article": "die",
        "translation": "pertanyaan",
        "exampleSentence": "Die Frage, die er stellte, war wichtig.",
        "phonetic": "dee FRA-ge",
        "level": "B1"
      },
      {
        "id": "b1-6-vocab-12",
        "word": "die Information",
        "article": "die",
        "translation": "informasi",
        "exampleSentence": "Die Information, die er gab, war nützlich.",
        "phonetic": "dee in-for-ma-TSYON",
        "level": "B1"
      },
      {
        "id": "b1-6-vocab-13",
        "word": "die Meinung",
        "article": "die",
        "translation": "pendapat",
        "exampleSentence": "Ihre Meinung sei sehr wichtig.",
        "phonetic": "dee MAI-nung",
        "level": "B1"
      },
      {
        "id": "b1-6-vocab-14",
        "word": "die Vermutung",
        "article": "die",
        "translation": "dugaan",
        "exampleSentence": "Es war nur eine Vermutung, dass er krank sei.",
        "phonetic": "dee fer-MOO-tung",
        "level": "B1"
      },
      {
        "id": "b1-6-vocab-15",
        "word": "die Behauptung",
        "article": "die",
        "translation": "klaim",
        "exampleSentence": "Seine Behauptung wurde widerlegt.",
        "phonetic": "dee be-HAUP-tung",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "Ubah kalimat langsung menjadi tidak langsung: 'Er sagt: 'Ich bin müde.''",
        "options": [
          "Er sagt, er sei müde.",
          "Er sagt, er ist müde.",
          "Er sagt, er war müde.",
          "Er sagt, er würde müde sein."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ubah kalimat langsung menjadi tidak langsung: 'Sie fragt: 'Kannst du mir helfen?''",
        "options": [
          "Sie fragt, ob ich ihr helfen könne.",
          "Sie fragt, ob ich ihr helfen kann.",
          "Sie fragt, ob ich ihr helfen würde.",
          "Sie fragt, ob ich ihr helfen soll."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat: 'Der Lehrer erklärte, dass die Prüfung _____ (schwierig sein).'",
        "options": [
          "schwierig sei",
          "schwierig ist",
          "schwierig war",
          "schwierig wäre"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kapan Konjunktiv II digunakan dalam Indirekte Rede?",
        "options": [
          "Ketika Konjunktiv I sama dengan Indikativ",
          "Selalu",
          "Tidak pernah",
          "Hanya untuk pertanyaan"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ubah kalimat langsung menjadi tidak langsung: 'Sie meinte: 'Ich habe keine Zeit.''",
        "options": [
          "Sie meinte, sie habe keine Zeit.",
          "Sie meinte, sie hat keine Zeit.",
          "Sie meinte, sie hätte keine Zeit.",
          "Sie meinte, sie würde keine Zeit haben."
        ],
        "correctAnswer": 0
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa fungsi utama Indirekte Rede?",
        "options": [
          "Melaporkan perkataan orang lain secara tidak langsung",
          "Mengutip perkataan orang lain secara langsung",
          "Menyatakan perintah",
          "Menyatakan keinginan"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Bentuk Konjunktiv I dari 'sein' untuk 'er/sie/es' adalah...",
        "options": [
          "sei",
          "ist",
          "wäre",
          "war"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Dalam Indirekte Rede, kata kerja utama selalu berada di...",
        "options": [
          "Akhir kalimat",
          "Awal kalimat",
          "Posisi kedua",
          "Setelah subjek"
        ],
        "correctAnswer": 0
      }
    ],
    "dialogues": [
      {
        "personA": "Was hat er gesagt?",
        "personB": "Er sagte, er sei müde und wolle nach Hause gehen.",
        "translation": "A: Apa yang dia katakan? B: Dia bilang dia lelah dan ingin pulang."
      },
      {
        "personA": "Hat sie gefragt, ob wir mitkommen?",
        "personB": "Ja, sie fragte, ob wir Zeit hätten und mitkommen könnten.",
        "translation": "A: Apakah dia bertanya apakah kita ikut? B: Ya, dia bertanya apakah kita punya waktu dan bisa ikut."
      },
      {
        "personA": "Der Sprecher berichtete, dass die Wirtschaft sich erhole.",
        "personB": "Das ist eine gute Nachricht! Ich hoffe, es stimme.",
        "translation": "A: Pembicara melaporkan bahwa ekonomi sedang pulih. B: Itu berita bagus! Saya harap itu benar."
      }
    ],
    "culturalNotes": "Indirekte Rede, terutama dengan Konjunktiv I, sering digunakan dalam berita, laporan, dan diskusi formal di Jerman untuk menjaga objektivitas dan jarak dari pernyataan asli. Menguasainya menunjukkan tingkat kemahiran yang tinggi dalam bahasa Jerman."
  },
  {
    "id": "b1-checkpoint-2",
    "canDoGoals": [
      "Berlatih mengubah pola aktif, pasif dan pasif bertensa lampau",
      "Mengevaluasi kefasihan menyambung argumen dengan konjungsi ganda",
      "Mengevaluasi pelaporan dari kutipan sumber"
    ],
    "title": "Review Konten Sebelumnya",
    "requiredScore": 0.7,
    "questions": [
      {
        "question": "Ubah kalimat aktif menjadi pasif Präsens: 'Man baut ein neues Haus.'",
        "options": [
          "Ein neues Haus wird gebaut.",
          "Ein neues Haus wurde gebaut.",
          "Ein neues Haus ist gebaut.",
          "Ein neues Haus baut."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat dengan konjungsi yang tepat: 'Sie mag _____ Schokolade _____ Eis.'",
        "options": [
          "weder...noch",
          "entweder...oder",
          "sowohl...als auch",
          "nicht nur...sondern auch"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ubah kalimat langsung menjadi tidak langsung: 'Er sagte: 'Ich habe Hunger.''",
        "options": [
          "Er sagte, er habe Hunger.",
          "Er sagte, er hat Hunger.",
          "Er sagte, er hätte Hunger.",
          "Er sagte, er würde Hunger haben."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Bagaimana bentuk Passiv Präteritum dari 'schreiben'?",
        "options": [
          "wurde geschrieben",
          "wird geschrieben",
          "ist geschrieben",
          "hat geschrieben"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih konjungsi yang tepat: '_____ du fleißiger bist, _____ besser werden deine Noten.'",
        "options": [
          "Je...desto",
          "Entweder...oder",
          "Weder...noch",
          "Sowohl...als auch"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kapan 'durch' digunakan dalam kalimat pasif?",
        "options": [
          "Untuk penyebab atau sarana",
          "Untuk pelaku orang",
          "Untuk objek langsung",
          "Untuk objek tidak langsung"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ubah kalimat langsung menjadi tidak langsung: 'Sie fragte: 'Wann kommst du?''",
        "options": [
          "Sie fragte, wann ich käme.",
          "Sie fragte, wann ich komme.",
          "Sie fragte, wann ich kommen würde.",
          "Sie fragte, wann ich kam."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Apa arti dari 'nicht nur...sondern auch'?",
        "options": [
          "Tidak hanya...tetapi juga",
          "Baik...atau",
          "Tidak...maupun",
          "Semakin...semakin"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat mana yang menggunakan Passiv Präsens dengan benar?",
        "options": [
          "Das Essen wird gekocht.",
          "Das Essen kocht.",
          "Das Essen hat gekocht.",
          "Das Essen ist gekocht."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih konjungsi yang tepat: 'Einerseits ist es teuer, _____ ist es sehr praktisch.'",
        "options": [
          "andererseits",
          "oder",
          "noch",
          "als auch"
        ],
        "correctAnswer": 0
      }
    ],
    "reviewLessons": [
      "b1-4",
      "b1-5",
      "b1-6"
    ]
  },
  {
    "id": "b1-7",
    "canDoGoals": [
      "Penguasaan Infinitivkonstruktionen (zu + Infinitiv)",
      "Membangun struktur (um... zu, ohne... zu, anstatt... zu)",
      "Mengekspresikan tujuan dari suatu pekerjaan tanpa modal verb"
    ],
    "level": "B1",
    "title": "Infinitivkonstruktionen (zu + Infinitiv)",
    "grammarDescription": "Infinitivkonstruktionen dengan 'zu + Infinitiv' digunakan untuk menyatakan tujuan, niat, atau sebagai pelengkap setelah kata kerja, kata sifat, atau kata benda tertentu. Struktur ini sering muncul setelah kata kerja seperti 'versuchen' (mencoba), 'vergessen' (lupa), 'beginnen' (memulai), atau setelah kata sifat seperti 'schön' (indah), 'wichtig' (penting), 'schwierig' (sulit). Ada juga konstruksi khusus seperti 'um...zu' (untuk tujuan), 'ohne...zu' (tanpa), dan 'anstatt...zu' (alih-alih).",
    "sentenceBreakdowns": [
      "Es ist (kata kerja) + wichtig (kata sifat), + Deutsch (objek) + zu lernen (Infinitivkonstruktion).",
      "Ich (subjek) + versuche (kata kerja), + dich (objek) + zu verstehen (Infinitivkonstruktion).",
      "Er (subjek) + geht (kata kerja) + ins Kino (tempat), + um (konjungsi tujuan) + einen Film (objek) + zu sehen (Infinitivkonstruktion).",
      "Sie (subjek) + ging (kata kerja) + weg (arah), + ohne (preposisi) + sich (objek) + zu verabschieden (Infinitivkonstruktion)."
    ],
    "pronunciationTips": "Pada 'zu + Infinitiv', 'zu' biasanya tidak diberi penekanan kuat. Fokus pada pelafalan Infinitivnya. Dalam konstruksi 'um...zu', 'um' juga tidak diberi penekanan, dan intonasi akan naik sedikit pada Infinitiv.",
    "vocabulary": [
      {
        "id": "b1-7-vocab-1",
        "word": "versuchen",
        "translation": "mencoba",
        "exampleSentence": "Ich versuche, Deutsch zu lernen.",
        "phonetic": "fer-ZOO-khen",
        "level": "B1"
      },
      {
        "id": "b1-7-vocab-2",
        "word": "vergessen",
        "translation": "lupa",
        "exampleSentence": "Ich habe vergessen, die Tür zu schließen.",
        "phonetic": "fer-GES-sen",
        "level": "B1"
      },
      {
        "id": "b1-7-vocab-3",
        "word": "beginnen",
        "translation": "memulai",
        "exampleSentence": "Wir beginnen, das Projekt zu planen.",
        "phonetic": "be-GIN-nen",
        "level": "B1"
      },
      {
        "id": "b1-7-vocab-4",
        "word": "wichtig",
        "translation": "penting",
        "exampleSentence": "Es ist wichtig, pünktlich zu sein.",
        "phonetic": "VIKH-tikh",
        "level": "B1"
      },
      {
        "id": "b1-7-vocab-5",
        "word": "schwierig",
        "translation": "sulit",
        "exampleSentence": "Es ist schwierig, diese Aufgabe zu lösen.",
        "phonetic": "SHVEE-rikh",
        "level": "B1"
      },
      {
        "id": "b1-7-vocab-6",
        "word": "um...zu",
        "translation": "untuk (tujuan)",
        "exampleSentence": "Ich lerne Deutsch, um in Deutschland zu studieren.",
        "phonetic": "um...tsoo",
        "level": "B1"
      },
      {
        "id": "b1-7-vocab-7",
        "word": "ohne...zu",
        "translation": "tanpa",
        "exampleSentence": "Er ging, ohne sich zu verabschieden.",
        "phonetic": "O-ne...tsoo",
        "level": "B1"
      },
      {
        "id": "b1-7-vocab-8",
        "word": "anstatt...zu",
        "translation": "alih-alih",
        "exampleSentence": "Anstatt zu arbeiten, spielte er Computerspiele.",
        "phonetic": "an-SHTAT...tsoo",
        "level": "B1"
      },
      {
        "id": "b1-7-vocab-9",
        "word": "die Absicht",
        "article": "die",
        "translation": "niat",
        "exampleSentence": "Meine Absicht ist es, zu reisen.",
        "phonetic": "dee AP-zikht",
        "level": "B1"
      },
      {
        "id": "b1-7-vocab-10",
        "word": "der Zweck",
        "article": "der",
        "translation": "tujuan",
        "exampleSentence": "Der Zweck der Reise ist es, neue Kulturen kennenzulernen.",
        "phonetic": "dehr tsvɛk",
        "level": "B1"
      },
      {
        "id": "b1-7-vocab-11",
        "word": "die Möglichkeit",
        "article": "die",
        "translation": "kemungkinan",
        "exampleSentence": "Es gibt die Möglichkeit, das Problem zu lösen.",
        "phonetic": "dee MÖG-likh-kait",
        "level": "B1"
      },
      {
        "id": "b1-7-vocab-12",
        "word": "die Gelegenheit",
        "article": "die",
        "translation": "kesempatan",
        "exampleSentence": "Ich hatte die Gelegenheit, ihn zu treffen.",
        "phonetic": "dee ge-LE-gen-hait",
        "level": "B1"
      },
      {
        "id": "b1-7-vocab-13",
        "word": "die Entscheidung",
        "article": "die",
        "translation": "keputusan",
        "exampleSentence": "Es war eine schwierige Entscheidung, zu gehen.",
        "phonetic": "dee ent-SHAI-dung",
        "level": "B1"
      },
      {
        "id": "b1-7-vocab-14",
        "word": "die Freude",
        "article": "die",
        "translation": "kegembiraan",
        "exampleSentence": "Ich habe die Freude, dich zu sehen.",
        "phonetic": "dee FROY-de",
        "level": "B1"
      },
      {
        "id": "b1-7-vocab-15",
        "word": "die Angst",
        "article": "die",
        "translation": "ketakutan",
        "exampleSentence": "Ich habe Angst, Fehler zu machen.",
        "phonetic": "dee angst",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat: 'Es ist wichtig, _____ (lernen) Deutsch.'",
        "options": [
          "Deutsch zu lernen",
          "Deutsch lernen",
          "Deutsch gelernt",
          "Deutsch zu gelernt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih konstruksi yang tepat: 'Ich gehe ins Café, _____ (trinken) Kaffee.'",
        "options": [
          "um Kaffee zu trinken",
          "Kaffee zu trinken",
          "Kaffee trinken",
          "für Kaffee trinken"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat: 'Er ging weg, _____ (sich verabschieden).'",
        "options": [
          "ohne sich zu verabschieden",
          "ohne sich verabschieden",
          "ohne zu verabschieden sich",
          "ohne verabschieden sich"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat mana yang menggunakan 'anstatt...zu' dengan benar?",
        "options": [
          "Anstatt zu lernen, spielte er.",
          "Anstatt lernen, spielte er.",
          "Anstatt er lernt, spielte er.",
          "Anstatt zu spielen, lernte er."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kata kerja mana yang sering diikuti oleh 'zu + Infinitiv'?",
        "options": [
          "versuchen",
          "gehen",
          "essen",
          "schlafen"
        ],
        "correctAnswer": 0
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa fungsi 'um...zu'?",
        "options": [
          "Menyatakan tujuan",
          "Menyatakan sebab",
          "Menyatakan waktu",
          "Menyatakan kondisi"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Di mana posisi 'zu' dalam 'zu + Infinitiv'?",
        "options": [
          "Tepat sebelum Infinitiv",
          "Setelah Infinitiv",
          "Di awal kalimat",
          "Di akhir kalimat"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat 'Es ist schön, dich zu sehen' berarti...",
        "options": [
          "Senang melihatmu",
          "Saya melihatmu dengan indah",
          "Itu indah, kamu melihat",
          "Melihatmu adalah indah"
        ],
        "correctAnswer": 0
      }
    ],
    "dialogues": [
      {
        "personA": "Ich versuche, jeden Tag Deutsch zu sprechen.",
        "personB": "Das ist eine gute Strategie, um deine Sprachkenntnisse zu verbessern.",
        "translation": "A: Saya mencoba berbicara bahasa Jerman setiap hari. B: Itu strategi yang bagus untuk meningkatkan kemampuan bahasamu."
      },
      {
        "personA": "Es ist wichtig, pünktlich zum Termin zu kommen.",
        "personB": "Ja, ich habe mir vorgenommen, nicht zu spät zu sein.",
        "translation": "A: Penting untuk datang tepat waktu ke janji. B: Ya, saya bertekad untuk tidak terlambat."
      },
      {
        "personA": "Er ging, ohne ein Wort zu sagen.",
        "personB": "Das ist aber unhöflich! Er hätte sich verabschieden sollen.",
        "translation": "A: Dia pergi tanpa mengucapkan sepatah kata pun. B: Itu tidak sopan! Dia seharusnya pamit."
      }
    ],
    "culturalNotes": "Infinitivkonstruktionen adalah bagian penting dari tata bahasa Jerman yang memungkinkan kalimat menjadi lebih ringkas dan elegan. Mereka sering digunakan dalam bahasa tulis dan percakapan formal. Menguasai penggunaannya akan membantu Anda mengekspresikan ide-ide yang lebih kompleks dengan jelas."
  },
  {
    "id": "b1-8",
    "canDoGoals": [
      "Membungkus dan mendeklinasikan kata sifat/adjektiva dari awal di struktur apa pun",
      "Latihan menggunakan schwache Deklination (setelah artikel definitif)",
      "Latihan menggunakan gemischte dan starke Deklination untuk benda (tidak memiliki artikel spesifik)"
    ],
    "level": "B1",
    "title": "Adjektivdeklination lengkap",
    "grammarDescription": "Deklinasi adjektiva (perubahan akhiran kata sifat) dalam bahasa Jerman adalah salah satu topik yang paling menantang. Akhiran adjektiva bergantung pada tiga faktor: kasus (Nominativ, Akkusativ, Dativ, Genitiv), gender (maskulin, feminin, netral), dan jumlah (singular, plural), serta jenis artikel yang mendahuluinya (artikel tertentu, artikel tidak tertentu, atau tanpa artikel). Ada tiga jenis deklinasi: kuat (tanpa artikel), lemah (setelah artikel tertentu), dan campuran (setelah artikel tidak tertentu atau kata ganti posesif).",
    "sentenceBreakdowns": [
      "Der (artikel tertentu) + alte (adjektiva, deklinasi lemah) + Mann (kata benda) + ist müde.",
      "Ein (artikel tidak tertentu) + schönes (adjektiva, deklinasi campuran) + Haus (kata benda) + steht dort.",
      "Gutes (adjektiva, deklinasi kuat) + Wetter (kata benda) + macht mich glücklich.",
      "Ich sehe (kata kerja) + den (artikel tertentu) + roten (adjektiva, deklinasi lemah) + Apfel (kata benda, Akkusativ)."
    ],
    "pronunciationTips": "Perhatikan akhiran adjektiva yang seringkali pendek dan tidak diberi penekanan kuat. Fokus pada pelafalan vokal dan konsonan di akhir kata, seperti '-e', '-en', '-em', '-er', '-es'.",
    "vocabulary": [
      {
        "id": "b1-8-vocab-1",
        "word": "alt",
        "translation": "tua",
        "exampleSentence": "Der alte Mann liest ein Buch.",
        "phonetic": "alt",
        "level": "B1"
      },
      {
        "id": "b1-8-vocab-2",
        "word": "neu",
        "translation": "baru",
        "exampleSentence": "Ich habe ein neues Auto gekauft.",
        "phonetic": "noy",
        "level": "B1"
      },
      {
        "id": "b1-8-vocab-3",
        "word": "schön",
        "translation": "indah",
        "exampleSentence": "Das ist ein schönes Bild.",
        "phonetic": "shön",
        "level": "B1"
      },
      {
        "id": "b1-8-vocab-4",
        "word": "gut",
        "translation": "baik",
        "exampleSentence": "Gutes Essen ist wichtig.",
        "phonetic": "goot",
        "level": "B1"
      },
      {
        "id": "b1-8-vocab-5",
        "word": "klein",
        "translation": "kecil",
        "exampleSentence": "Das kleine Kind spielt im Garten.",
        "phonetic": "klain",
        "level": "B1"
      },
      {
        "id": "b1-8-vocab-6",
        "word": "groß",
        "translation": "besar",
        "exampleSentence": "Wir wohnen in einem großen Haus.",
        "phonetic": "gros",
        "level": "B1"
      },
      {
        "id": "b1-8-vocab-7",
        "word": "rot",
        "translation": "merah",
        "exampleSentence": "Ich mag den roten Apfel.",
        "phonetic": "rot",
        "level": "B1"
      },
      {
        "id": "b1-8-vocab-8",
        "word": "grün",
        "translation": "hijau",
        "exampleSentence": "Die grüne Wiese ist schön.",
        "phonetic": "grün",
        "level": "B1"
      },
      {
        "id": "b1-8-vocab-9",
        "word": "interessant",
        "translation": "menarik",
        "exampleSentence": "Ich lese ein interessantes Buch.",
        "phonetic": "in-te-re-SANT",
        "level": "B1"
      },
      {
        "id": "b1-8-vocab-10",
        "word": "langweilig",
        "translation": "membosankan",
        "exampleSentence": "Das ist ein langweiliger Film.",
        "phonetic": "LANG-vai-likh",
        "level": "B1"
      },
      {
        "id": "b1-8-vocab-11",
        "word": "schwierig",
        "translation": "sulit",
        "exampleSentence": "Das ist eine schwierige Aufgabe.",
        "phonetic": "SHVEE-rikh",
        "level": "B1"
      },
      {
        "id": "b1-8-vocab-12",
        "word": "einfach",
        "translation": "mudah",
        "exampleSentence": "Das ist eine einfache Lösung.",
        "phonetic": "AIN-fakh",
        "level": "B1"
      },
      {
        "id": "b1-8-vocab-13",
        "word": "freundlich",
        "translation": "ramah",
        "exampleSentence": "Die freundlichen Leute helfen gerne.",
        "phonetic": "FROYNT-likh",
        "level": "B1"
      },
      {
        "id": "b1-8-vocab-14",
        "word": "nett",
        "translation": "baik hati",
        "exampleSentence": "Sie ist eine nette Person.",
        "phonetic": "net",
        "level": "B1"
      },
      {
        "id": "b1-8-vocab-15",
        "word": "lecker",
        "translation": "enak",
        "exampleSentence": "Das ist ein leckeres Essen.",
        "phonetic": "LE-ker",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat (deklinasi lemah): 'Der _____ (neu) Wagen ist sehr schnell.'",
        "options": [
          "neue",
          "neuen",
          "neues",
          "neuer"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat (deklinasi campuran): 'Ich habe ein _____ (schön) Kleid gekauft.'",
        "options": [
          "schönes",
          "schöne",
          "schönen",
          "schöner"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat (deklinasi kuat): '_____ (gut) Wetter ist selten.'",
        "options": [
          "Gutes",
          "Gute",
          "Guten",
          "Guter"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih akhiran yang benar: 'Mit dem _____ (alt) Mann spreche ich gerne.' (Dativ maskulin)",
        "options": [
          "alten",
          "alte",
          "alter",
          "altes"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih akhiran yang benar: 'Ich sehe die _____ (rot) Blumen.' (Akkusativ feminin plural)",
        "options": [
          "roten",
          "rote",
          "rotes",
          "roter"
        ],
        "correctAnswer": 0
      }
    ],
    "miniQuiz": [
      {
        "question": "Berapa banyak faktor yang mempengaruhi deklinasi adjektiva?",
        "options": [
          "Tiga (kasus, gender/jumlah, jenis artikel)",
          "Dua (kasus, gender)",
          "Empat (kasus, gender, jumlah, artikel)",
          "Satu (kasus)"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Deklinasi lemah digunakan setelah artikel jenis apa?",
        "options": [
          "Artikel tertentu (der, die, das)",
          "Artikel tidak tertentu (ein, eine)",
          "Tanpa artikel",
          "Kata ganti posesif"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Apa akhiran adjektiva untuk Nominativ maskulin singular tanpa artikel (deklinasi kuat)?",
        "options": [
          "-er",
          "-e",
          "-es",
          "-en"
        ],
        "correctAnswer": 0
      }
    ],
    "dialogues": [
      {
        "personA": "Ich habe einen neuen Job gefunden!",
        "personB": "Das ist ja eine tolle Nachricht! Herzlichen Glückwunsch zum neuen Job!",
        "translation": "A: Saya menemukan pekerjaan baru! B: Itu berita bagus! Selamat atas pekerjaan barunya!"
      },
      {
        "personA": "Hast du den roten Pullover gesehen?",
        "personB": "Meinst du den schönen roten Pullover, der im Schrank hängt?",
        "translation": "A: Apakah kamu melihat sweter merah itu? B: Maksudmu sweter merah yang indah yang tergantung di lemari?"
      },
      {
        "personA": "Mit gutem Kaffee beginnt der Tag viel besser.",
        "personB": "Absolut! Ein starker, heißer Kaffee ist genau das Richtige.",
        "translation": "A: Dengan kopi yang enak, hari dimulai jauh lebih baik. B: Tentu saja! Kopi yang kuat dan panas adalah yang terbaik."
      }
    ],
    "culturalNotes": "Deklinasi adjektiva adalah salah satu ciri khas tata bahasa Jerman yang sering dianggap sulit. Namun, dengan latihan yang konsisten, Anda akan terbiasa dengan polanya. Orang Jerman sangat menghargai penggunaan tata bahasa yang benar, terutama dalam konteks formal."
  },
  {
    "id": "b1-9",
    "canDoGoals": [
      "Menjelaskan prediksi atau intensi di masa depan dengan (Futur I: werden + Infinitiv)",
      "Memprediksi bahwa sesuatu AKAN SUDAH SELESAI di masa depan (Futur II: werden + Partizip II + haben/sein)",
      "Menyadari frekuensi dan tingkat natural penutur bahasa Jerman dengan bentuk kalimat ini"
    ],
    "level": "B1",
    "title": "Futur I & Futur II",
    "grammarDescription": "Futur I digunakan untuk menyatakan tindakan atau peristiwa yang akan terjadi di masa depan, atau untuk membuat prediksi dan asumsi tentang masa depan. Dibentuk dengan kata kerja bantu 'werden' + Infinitiv dari kata kerja utama. Futur II digunakan untuk menyatakan tindakan yang akan selesai pada titik waktu tertentu di masa depan, atau untuk membuat asumsi tentang sesuatu yang sudah terjadi di masa lalu (dengan tingkat kepastian yang tinggi). Dibentuk dengan 'werden' + Partizip II dari kata kerja utama + 'haben' atau 'sein'.",
    "sentenceBreakdowns": [
      "Ich (subjek) + werde (werden, Präsens) + morgen (waktu) + kommen (Infinitiv). (Futur I)",
      "Er (subjek) + wird (werden, Präsens) + das Buch (objek) + gelesen haben (Partizip II + haben) + bis morgen (waktu). (Futur II)",
      "Sie (subjek) + werden (werden, Präsens) + nächste Woche (waktu) + heiraten (Infinitiv). (Futur I)",
      "Du (subjek) + wirst (werden, Präsens) + schon (adverb) + angekommen sein (Partizip II + sein) + wenn ich anrufe (klausa waktu). (Futur II)"
    ],
    "pronunciationTips": "Perhatikan pelafalan 'w' pada 'werden' yang seperti 'v' dalam bahasa Inggris. Pada Futur II, 'haben' atau 'sein' di akhir kalimat biasanya tidak diberi penekanan kuat.",
    "vocabulary": [
      {
        "id": "b1-9-vocab-1",
        "word": "werden",
        "translation": "akan (kata bantu untuk Futur)",
        "exampleSentence": "Ich werde morgen anrufen.",
        "phonetic": "VER-den",
        "level": "B1"
      },
      {
        "id": "b1-9-vocab-2",
        "word": "morgen",
        "translation": "besok",
        "exampleSentence": "Morgen werde ich arbeiten.",
        "phonetic": "MOR-gen",
        "level": "B1"
      },
      {
        "id": "b1-9-vocab-3",
        "word": "nächste Woche",
        "translation": "minggu depan",
        "exampleSentence": "Nächste Woche werden wir verreisen.",
        "phonetic": "NÄKH-ste VO-khe",
        "level": "B1"
      },
      {
        "id": "b1-9-vocab-4",
        "word": "bald",
        "translation": "segera",
        "exampleSentence": "Er wird bald kommen.",
        "phonetic": "balt",
        "level": "B1"
      },
      {
        "id": "b1-9-vocab-5",
        "word": "in Zukunft",
        "translation": "di masa depan",
        "exampleSentence": "In Zukunft wird sich vieles ändern.",
        "phonetic": "in TSOO-kunft",
        "level": "B1"
      },
      {
        "id": "b1-9-vocab-6",
        "word": "bis",
        "translation": "sampai",
        "exampleSentence": "Bis morgen wird er die Aufgabe erledigt haben.",
        "phonetic": "bis",
        "level": "B1"
      },
      {
        "id": "b1-9-vocab-7",
        "word": "vermutlich",
        "translation": "mungkin, barangkali",
        "exampleSentence": "Er wird vermutlich schon gegangen sein.",
        "phonetic": "fer-MOOT-likh",
        "level": "B1"
      },
      {
        "id": "b1-9-vocab-8",
        "word": "wahrscheinlich",
        "translation": "kemungkinan besar",
        "exampleSentence": "Sie wird wahrscheinlich nicht kommen.",
        "phonetic": "var-SHAIN-likh",
        "level": "B1"
      },
      {
        "id": "b1-9-vocab-9",
        "word": "bestimmt",
        "translation": "pasti",
        "exampleSentence": "Das wird bestimmt klappen.",
        "phonetic": "be-SHTIMT",
        "level": "B1"
      },
      {
        "id": "b1-9-vocab-10",
        "word": "die Planung",
        "article": "die",
        "translation": "perencanaan",
        "exampleSentence": "Die Planung für die Reise wird bald abgeschlossen sein.",
        "phonetic": "dee PLA-nung",
        "level": "B1"
      },
      {
        "id": "b1-9-vocab-11",
        "word": "die Vorhersage",
        "article": "die",
        "translation": "ramalan",
        "exampleSentence": "Die Wettervorhersage wird sich ändern.",
        "phonetic": "dee FOR-her-za-ge",
        "level": "B1"
      },
      {
        "id": "b1-9-vocab-12",
        "word": "die Annahme",
        "article": "die",
        "translation": "asumsi",
        "exampleSentence": "Meine Annahme wird sich als richtig erweisen.",
        "phonetic": "dee AN-na-me",
        "level": "B1"
      },
      {
        "id": "b1-9-vocab-13",
        "word": "das Ereignis",
        "article": "das",
        "translation": "peristiwa",
        "exampleSentence": "Das Ereignis wird in der Zukunft stattfinden.",
        "phonetic": "das er-AIG-nis",
        "level": "B1"
      },
      {
        "id": "b1-9-vocab-14",
        "word": "der Zeitpunkt",
        "article": "der",
        "translation": "titik waktu",
        "exampleSentence": "Bis zu diesem Zeitpunkt wird alles erledigt sein.",
        "phonetic": "dehr TSAIT-punkt",
        "level": "B1"
      },
      {
        "id": "b1-9-vocab-15",
        "word": "die Prognose",
        "article": "die",
        "translation": "prognosis",
        "exampleSentence": "Die Prognose für die Wirtschaft ist positiv.",
        "phonetic": "dee pro-GNO-ze",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "Lengkapi kalimat dengan Futur I: 'Ich _____ (besuchen) meine Familie nächste Woche.'",
        "options": [
          "werde besuchen",
          "habe besucht",
          "bin besucht",
          "besuche"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih bentuk Futur II yang benar: 'Bis morgen _____ er die Arbeit _____ (erledigen).'",
        "options": [
          "wird...erledigt haben",
          "wird...erledigen",
          "hat...erledigt",
          "ist...erledigt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat mana yang menyatakan prediksi di masa depan (Futur I)?",
        "options": [
          "Es wird morgen regnen.",
          "Es regnet morgen.",
          "Es hat morgen geregnet.",
          "Es regnete morgen."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat dengan Futur II: 'Wenn du ankommst, _____ ich schon _____ (schlafen).'",
        "options": [
          "werde...geschlafen haben",
          "werde...schlafen",
          "habe...geschlafen",
          "bin...geschlafen"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Apa fungsi utama Futur II?",
        "options": [
          "Menyatakan tindakan yang akan selesai di masa depan",
          "Menyatakan tindakan yang sedang berlangsung di masa depan",
          "Menyatakan tindakan yang sudah selesai di masa lalu",
          "Menyatakan keinginan"
        ],
        "correctAnswer": 0
      }
    ],
    "miniQuiz": [
      {
        "question": "Bagaimana bentuk dasar Futur I?",
        "options": [
          "werden + Infinitiv",
          "haben + Partizip II",
          "sein + Partizip II",
          "werden + Partizip II + haben/sein"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kapan Futur II digunakan untuk asumsi?",
        "options": [
          "Tentang peristiwa yang sudah terjadi di masa lalu",
          "Tentang peristiwa yang akan terjadi di masa depan",
          "Tentang peristiwa yang sedang terjadi sekarang",
          "Tidak pernah"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat 'Er wird morgen kommen' adalah contoh dari...",
        "options": [
          "Futur I",
          "Futur II",
          "Präsens",
          "Präteritum"
        ],
        "correctAnswer": 0
      }
    ],
    "dialogues": [
      {
        "personA": "Was wirst du nächstes Jahr machen?",
        "personB": "Ich werde wahrscheinlich ein Auslandssemester machen. Bis dahin werde ich mein Studium abgeschlossen haben.",
        "translation": "A: Apa yang akan kamu lakukan tahun depan? B: Saya mungkin akan mengambil semester di luar negeri. Sampai saat itu, saya akan sudah menyelesaikan studi saya."
      },
      {
        "personA": "Glaubst du, er wird pünktlich sein?",
        "personB": "Ich denke schon. Er wird bestimmt schon losgefahren sein.",
        "translation": "A: Apakah kamu pikir dia akan tepat waktu? B: Saya rasa begitu. Dia pasti sudah berangkat."
      },
      {
        "personA": "Die Wettervorhersage sagt, es wird morgen regnen.",
        "personB": "Oh, schade. Dann werden wir unseren Ausflug wohl verschieben müssen.",
        "translation": "A: Ramalan cuaca mengatakan besok akan hujan. B: Oh, sayang sekali. Kalau begitu kita harus menunda perjalanan kita."
      }
    ],
    "culturalNotes": "Meskipun Futur I dan Futur II ada dalam tata bahasa Jerman, dalam percakapan sehari-hari, Futur I sering digantikan oleh Präsens dengan keterangan waktu yang jelas (misalnya 'Ich komme morgen' daripada 'Ich werde morgen kommen'). Futur II lebih jarang digunakan dan seringkali digantikan oleh modal verb + Perfekt untuk asumsi masa lalu. Namun, penting untuk memahami keduanya untuk membaca dan menulis teks formal."
  },
  {
    "id": "b1-checkpoint-3",
    "canDoGoals": [
      "Evaluasi final untuk Infinitive dengan 'Zu'",
      "Evaluasi final kompleksitas adjektiva bersufiks",
      "Latihan membuat intensi tertulis dengan metode prediktif"
    ],
    "title": "Review Konten Sebelumnya",
    "requiredScore": 0.7,
    "questions": [
      {
        "question": "Lengkapi kalimat dengan 'zu + Infinitiv': 'Es ist wichtig, _____ (sprechen) Deutsch.'",
        "options": [
          "Deutsch zu sprechen",
          "Deutsch sprechen",
          "Deutsch gesprochen",
          "Deutsch zu gesprochen"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih akhiran adjektiva yang benar (deklinasi lemah): 'Ich mag den _____ (blau) Himmel.'",
        "options": [
          "blauen",
          "blaue",
          "blaues",
          "blauer"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat dengan Futur I: 'Wir _____ (reisen) nächsten Sommer.'",
        "options": [
          "werden reisen",
          "haben gereist",
          "sind gereist",
          "reisen"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Apa fungsi 'ohne...zu'?",
        "options": [
          "Menyatakan tanpa melakukan sesuatu",
          "Menyatakan tujuan",
          "Menyatakan sebab",
          "Menyatakan kondisi"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih akhiran adjektiva yang benar (deklinasi campuran): 'Sie hat ein _____ (neu) Handy.'",
        "options": [
          "neues",
          "neue",
          "neuen",
          "neuer"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat dengan Futur II: 'Bis nächste Woche _____ er das Projekt _____ (beenden).'",
        "options": [
          "wird...beendet haben",
          "wird...beenden",
          "hat...beendet",
          "ist...beendet"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat mana yang menggunakan 'um...zu' dengan benar?",
        "options": [
          "Ich lerne, um besser zu werden.",
          "Ich lerne, um besser werden.",
          "Ich lerne, besser zu werden.",
          "Ich lerne, um zu werden besser."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih akhiran adjektiva yang benar (deklinasi kuat): '_____ (frisch) Brot schmeckt gut.'",
        "options": [
          "Frisches",
          "Frische",
          "Frischen",
          "Frischer"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Apa perbedaan utama antara Futur I dan Futur II?",
        "options": [
          "Futur I untuk masa depan, Futur II untuk masa depan yang sudah selesai",
          "Futur I untuk masa lalu, Futur II untuk masa depan",
          "Futur I untuk fakta, Futur II untuk kemungkinan",
          "Tidak ada perbedaan"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kalimat 'Er wird wohl schon angekommen sein' adalah contoh dari...",
        "options": [
          "Futur II (asumsi masa lalu)",
          "Futur I (prediksi masa depan)",
          "Präsens",
          "Präteritum"
        ],
        "correctAnswer": 0
      }
    ],
    "reviewLessons": [
      "b1-7",
      "b1-8",
      "b1-9"
    ]
  },
  {
    "id": "b1-10",
    "canDoGoals": [
      "Membangun ketahanan kata melalui menebak arti kata baru secara konseptual (Wortbildung)",
      "Merakit atau mengungkap arti dari Komposita (gabungan Noun+Noun)",
      "Identifikasi makna dari Präfixe dan Suffixe khusus"
    ],
    "level": "B1",
    "title": "Wortbildung (Komposita, Präfixe)",
    "grammarDescription": "Wortbildung (pembentukan kata) adalah proses penting dalam bahasa Jerman. Ini memungkinkan pembentukan kata-kata baru dari kata-kata yang sudah ada. Dua metode utama adalah Komposita (kata majemuk) dan penggunaan Präfixe (prefiks). Komposita adalah penggabungan dua atau lebih kata untuk membentuk kata baru, di mana kata terakhir menentukan gender dan makna utama (misalnya 'Haus' + 'Tür' = 'Haustür'). Präfixe adalah imbuhan yang ditambahkan di awal kata kerja untuk mengubah maknanya, dan bisa berupa Präfixe trennbar (dapat dipisah) atau untrennbar (tidak dapat dipisah).",
    "sentenceBreakdowns": [
      "Das (artikel) + Schlafzimmer (Kompositum: Schlaf + Zimmer) + ist groß.",
      "Ich (subjek) + mache (kata kerja) + das Fenster (objek) + auf (Präfix trennbar).",
      "Er (subjek) + versteht (kata kerja dengan Präfix untrennbar) + die Frage (objek) + nicht.",
      "Die (artikel) + Autobahn (Kompositum: Auto + Bahn) + ist voll."
    ],
    "pronunciationTips": "Pada Komposita, penekanan utama biasanya jatuh pada kata pertama (misalnya 'HAUS-tür'). Untuk kata kerja dengan Präfixe trennbar, prefiks diberi penekanan kuat (misalnya 'AUF-machen'). Untuk Präfixe untrennbar, penekanan jatuh pada akar kata (misalnya 'ver-SHTE-hen').",
    "vocabulary": [
      {
        "id": "b1-10-vocab-1",
        "word": "das Schlafzimmer",
        "article": "das",
        "translation": "kamar tidur (Schlaf + Zimmer)",
        "exampleSentence": "Mein Schlafzimmer ist sehr gemütlich.",
        "phonetic": "das SHLAF-tsim-mer",
        "level": "B1"
      },
      {
        "id": "b1-10-vocab-2",
        "word": "die Haustür",
        "article": "die",
        "translation": "pintu rumah (Haus + Tür)",
        "exampleSentence": "Die Haustür ist offen.",
        "phonetic": "dee HOWS-tür",
        "level": "B1"
      },
      {
        "id": "b1-10-vocab-3",
        "word": "der Bahnhof",
        "article": "der",
        "translation": "stasiun kereta (Bahn + Hof)",
        "exampleSentence": "Wir treffen uns am Bahnhof.",
        "phonetic": "dehr BAN-hof",
        "level": "B1"
      },
      {
        "id": "b1-10-vocab-4",
        "word": "das Lehrbuch",
        "article": "das",
        "translation": "buku pelajaran (Lehr + Buch)",
        "exampleSentence": "Das Lehrbuch ist sehr hilfreich.",
        "phonetic": "das LER-bookh",
        "level": "B1"
      },
      {
        "id": "b1-10-vocab-5",
        "word": "aufmachen",
        "translation": "membuka (Präfix trennbar: auf- + machen)",
        "exampleSentence": "Bitte mach das Fenster auf!",
        "phonetic": "OUF-makh-en",
        "level": "B1"
      },
      {
        "id": "b1-10-vocab-6",
        "word": "anrufen",
        "translation": "menelepon (Präfix trennbar: an- + rufen)",
        "exampleSentence": "Ich rufe dich später an.",
        "phonetic": "AN-roo-fen",
        "level": "B1"
      },
      {
        "id": "b1-10-vocab-7",
        "word": "verstehen",
        "translation": "memahami (Präfix untrennbar: ver- + stehen)",
        "exampleSentence": "Ich verstehe die Frage nicht.",
        "phonetic": "fer-SHTE-hen",
        "level": "B1"
      },
      {
        "id": "b1-10-vocab-8",
        "word": "bekommen",
        "translation": "menerima (Präfix untrennbar: be- + kommen)",
        "exampleSentence": "Ich bekomme einen Brief.",
        "phonetic": "be-KOM-men",
        "level": "B1"
      },
      {
        "id": "b1-10-vocab-9",
        "word": "erzählen",
        "translation": "menceritakan (Präfix untrennbar: er- + zählen)",
        "exampleSentence": "Er erzählt eine interessante Geschichte.",
        "phonetic": "er-TSÄ-len",
        "level": "B1"
      },
      {
        "id": "b1-10-vocab-10",
        "word": "die Bildung",
        "article": "die",
        "translation": "pembentukan, pendidikan",
        "exampleSentence": "Wortbildung ist ein wichtiger Teil der deutschen Sprache.",
        "phonetic": "dee BIL-dung",
        "level": "B1"
      },
      {
        "id": "b1-10-vocab-11",
        "word": "das Präfix",
        "article": "das",
        "translation": "prefiks",
        "exampleSentence": "Das Präfix 'un-' macht ein Wort negativ.",
        "phonetic": "das PRÄ-fiks",
        "level": "B1"
      },
      {
        "id": "b1-10-vocab-12",
        "word": "das Suffix",
        "article": "das",
        "translation": "sufiks",
        "exampleSentence": "Das Suffix '-ung' bildet Nomen aus Verben.",
        "phonetic": "das ZU-fiks",
        "level": "B1"
      },
      {
        "id": "b1-10-vocab-13",
        "word": "trennbar",
        "translation": "dapat dipisah",
        "exampleSentence": "Das Verb 'aufmachen' ist trennbar.",
        "phonetic": "TREN-bar",
        "level": "B1"
      },
      {
        "id": "b1-10-vocab-14",
        "word": "untrennbar",
        "translation": "tidak dapat dipisah",
        "exampleSentence": "Das Verb 'verstehen' ist untrennbar.",
        "phonetic": "UN-tren-bar",
        "level": "B1"
      },
      {
        "id": "b1-10-vocab-15",
        "word": "zusammensetzen",
        "translation": "menggabungkan",
        "exampleSentence": "Man kann Wörter zusammensetzen, um neue zu bilden.",
        "phonetic": "TSU-zam-men-zet-sen",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "Gabungkan 'Tisch' dan 'Lampe' menjadi Kompositum:",
        "options": [
          "die Tischlampe",
          "der Tischlampe",
          "das Tischlampe",
          "Tischlampe"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih kalimat yang benar dengan Präfix trennbar 'aufmachen':",
        "options": [
          "Ich mache das Fenster auf.",
          "Ich aufmache das Fenster.",
          "Ich mache auf das Fenster.",
          "Ich das Fenster aufmache."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kata kerja mana yang memiliki Präfix untrennbar?",
        "options": [
          "verstehen",
          "einkaufen",
          "mitkommen",
          "abfahren"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Gabungkan 'Auto' dan 'Bahn' menjadi Kompositum:",
        "options": [
          "die Autobahn",
          "der Autobahn",
          "das Autobahn",
          "Autobahn"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih kalimat yang benar dengan Präfix untrennbar 'bekommen':",
        "options": [
          "Ich bekomme einen Brief.",
          "Ich komme einen Brief be.",
          "Ich be einen Brief komme.",
          "Ich einen Brief bekomme."
        ],
        "correctAnswer": 0
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa yang menentukan gender pada Komposita?",
        "options": [
          "Kata terakhir",
          "Kata pertama",
          "Kata tengah",
          "Tidak ada yang menentukan"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Di mana posisi Präfix trennbar dalam kalimat utama (Präsens)?",
        "options": [
          "Di akhir kalimat",
          "Di awal kalimat",
          "Setelah subjek",
          "Sebelum kata kerja utama"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Contoh Präfix untrennbar adalah...",
        "options": [
          "ver-",
          "auf-",
          "ein-",
          "ab-"
        ],
        "correctAnswer": 0
      }
    ],
    "dialogues": [
      {
        "personA": "Ich muss noch das Fenster aufmachen, es ist so warm hier.",
        "personB": "Ja, bitte! Und könntest du auch die Haustür schließen, wenn du gehst?",
        "translation": "A: Saya harus membuka jendela, di sini sangat panas. B: Ya, tolong! Dan bisakah kamu juga menutup pintu rumah saat kamu pergi?"
      },
      {
        "personA": "Ich verstehe diese Aufgabe nicht ganz.",
        "personB": "Kein Problem, ich kann es dir noch einmal erklären.",
        "translation": "A: Saya tidak sepenuhnya memahami tugas ini. B: Tidak masalah, saya bisa menjelaskannya lagi padamu."
      },
      {
        "personA": "Der Bahnhof ist ziemlich weit von hier.",
        "personB": "Ja, wir sollten ein Taxi nehmen, um pünktlich anzukommen.",
        "translation": "A: Stasiun kereta cukup jauh dari sini. B: Ya, kita harus naik taksi agar tiba tepat waktu."
      }
    ],
    "culturalNotes": "Wortbildung adalah salah satu aspek yang membuat bahasa Jerman begitu ekspresif dan efisien. Kemampuan untuk membentuk kata majemuk yang panjang memungkinkan deskripsi yang sangat spesifik. Memahami Präfixe sangat penting karena mereka dapat mengubah makna kata kerja secara drastis dan sering digunakan dalam percakapan sehari-hari."
  },
  {
    "id": "b1-11",
    "canDoGoals": [
      "Menerangkan sesuatu di masa lalu (Plusquamperfekt = Past Perfect Tense)",
      "Menggunakan 'hatten' atau 'waren' sebelum peristiwa masa lampau lainnya (mengiringi 'nachdem')",
      "Penggunaan kronologis lampau lebih runtut"
    ],
    "level": "B1",
    "title": "Plusquamperfekt (Waktu Lampau Selesai)",
    "grammarDescription": "Plusquamperfekt (Past Perfect) digunakan untuk menceritakan suatu kejadian di masa lalu yang terjadi *sebelum* kejadian masa lalu yang lain. Konstruksinya hampir sama dengan Perfekt, tetapi kata kerja bantunya ('haben' atau 'sein') dikonjugasikan dalam bentuk Präteritum ('hatte' atau 'war').\n\nContoh: \n(1) Ich hatte das Buch gelesen. (Saya TELAH membaca buku itu [di masa lampau].)\n(2) Als ich ankam, war er schon gegangen. (Ketika saya tiba [Präteritum], dia sudah pergi [Plusquamperfekt]).",
    "vocabulary": [
      {
        "id": "v-b111-1",
        "word": "hatte",
        "translation": "telah (dari haben)",
        "exampleSentence": "Ich hatte gegessen.",
        "phonetic": "HAT-te",
        "level": "B1"
      },
      {
        "id": "v-b111-2",
        "word": "war",
        "translation": "telah (dari sein)",
        "exampleSentence": "Er war schon gegangen.",
        "phonetic": "var",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "Kata kerja bantu mana yang dipakai untuk Plusquamperfekt dari kata 'gehen'?",
        "options": [
          "hatte",
          "war",
          "wurde",
          "ist"
        ],
        "correctAnswer": 1
      }
    ]
  },
  {
    "id": "b1-12",
    "canDoGoals": [
      "Penguasaan N-Deklination (Melihat maskulina yang selalu menerima sufiks 'n/en')",
      "Membedakan jamak reguler versus struktur n-Deklination pada Akkusativ, Dativ, dan Genitiv",
      "Dapat mengenali kata benda internasional berakhiran '-ent, -ist' dan penggunaanya"
    ],
    "level": "B1",
    "title": "n-Deklination",
    "grammarDescription": "n-Deklination adalah aturan khusus untuk beberapa kata benda Maskulin di mana kata benda tersebut mendapat tambahan akhiran '-n' atau '-en' di SEMUA kasus KECUALI Nominativ Singular. Kelompok yang termasuk n-Deklination biasanya adalah kata benda maskulin yang berakhiran -e (der Junge -> den Jungen), profesi berakhiran -ent atau -ist (der Student -> den Studenten), dan beberapa perkecualian (der Herr -> den Herrn, der Bär -> den Bären).",
    "vocabulary": [
      {
        "id": "v-b112-1",
        "word": "der Herr",
        "translation": "Bapak / Tuan",
        "article": "der",
        "exampleSentence": "Ich frage den Herrn.",
        "phonetic": "der HER",
        "level": "B1"
      },
      {
        "id": "v-b112-2",
        "word": "der Student",
        "translation": "Mahasiswa",
        "article": "der",
        "exampleSentence": "Das ist das Buch des Studenten.",
        "phonetic": "der shtu-DENT",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "Apa bentuk Akkusativ dari 'der Student'?",
        "options": [
          "den Student",
          "den Studenten",
          "den Studentes",
          "den Students"
        ],
        "correctAnswer": 1
      }
    ]
  },
  {
    "id": "b2-1",
    "canDoGoals": [
      "Mampu mengubah klausa relatif panjang menjadi atribut padat bergaya akademik",
      "Menulis dan menggunakan Partizip I untuk menandakan hal yang sedang terjadi aktif sebagai adjektif",
      "Menulis dan menggunakan Partizip II untuk menunjukkan pasif/rampung sebagai adjektif"
    ],
    "level": "B2",
    "title": "Partizipalkonstruktionen",
    "grammarDescription": "Partizipialkonstruktionen adalah cara yang ringkas dan elegan untuk menyampaikan informasi tambahan dalam sebuah kalimat, seringkali menggantikan anak kalimat (Nebensatz) atau klausa relatif. Ada dua jenis utama: Partizip I (Partizip Präsens) dan Partizip II (Partizip Perfekt).\n\n**Partizip I (Partizip Präsens)**\nDibentuk dari infinitif + -d (misalnya: 'lachend' - tertawa, 'singend' - bernyanyi). Ini menggambarkan tindakan yang sedang berlangsung secara bersamaan dengan tindakan utama kalimat, atau tindakan yang aktif. Fungsinya mirip dengan klausa relatif aktif atau klausa adverbial temporal/kausal.\nContoh: 'Der lachende Mann' (Pria yang tertawa) - menggantikan 'Der Mann, der lacht'.\n\n**Partizip II (Partizip Perfekt)**\nDibentuk seperti Partizip II untuk waktu Perfekt (misalnya: 'gesehen' - terlihat, 'geschrieben' - ditulis). Ini menggambarkan tindakan yang telah selesai sebelum tindakan utama, atau tindakan yang pasif. Fungsinya mirip dengan klausa relatif pasif atau klausa adverbial temporal/kausal.\nContoh: 'Das gelesene Buch' (Buku yang sudah dibaca) - menggantikan 'Das Buch, das gelesen wurde'.\n\nKedua partizip ini dapat digunakan sebagai atribut (seperti adjektiva), adverbial (menggambarkan cara, waktu, alasan), atau predikatif. Deklinasi partizip sebagai atribut mengikuti aturan deklinasi adjektiva.",
    "registerNotes": "**Level B2: Membaca Nuansa Sosial Bahasa Jerman (Register Notes)**\nDi Level B2, bahasa bukan lagi soal 'benar gramatikal' – namun kapan dan di mana digunakan. Bahasa Jerman punya banyak wording yang *technically benar tapi socially aneh* jika dipakai salah tempat.\n\n*   **[Akademik/Formal Written]** *Partizipialkonstruktionen*: Konstruksi seperti *\"das zu lösende Problem\"* atau *\"der laut sprechende Mann\"* sangat elegan di teks surat kabar (FAZ) Universitas, atau laporan kerja. Namun **terdengar kaku dan pretensius (sombong)** jika diucapkan spontan di kantin dengan teman.\n*   **[Colloquial/Spoken]** Di percakapan sehari-hari, ganti *Partizip* berat ini dengan klausa relatif biasa: *\"Der Mann, der laut spricht\"*.\n*   **[Formal Spoken]** Dalam presentasi kerja atau ke klien, menggunakan *Partizipialkonstruktionen* ringan akan memancarkan kompetensi bahasa tingkat tinggi.",
    "sentenceBreakdowns": [
      "Der (artikel) + lachende (Partizip I sebagai adjektiva) + Mann (subjek) + betrat (verb) + den Raum (objek Akkusativ).",
      "Die (artikel) + von ihr (preposisi + pronomina) + geschriebene (Partizip II sebagai adjektiva) + E-Mail (subjek) + war (verb) + sehr (adverb) + informativ (adjektiva).",
      "Schnell (adverb) + laufend (Partizip I sebagai adverbial), + erreichte (verb) + er (subjek) + den Bus (objek Akkusativ).",
      "Von der (preposisi + artikel) + Sonne (objek Dativ) + geblendet (Partizip II sebagai adverbial), + konnte (verb) + sie (subjek) + nichts (pronomina) + sehen (infinitif).",
      "Das (artikel) + in der (preposisi + artikel) + Zeitung (objek Dativ) + veröffentlichte (Partizip II sebagai adjektiva) + Interview (subjek) + sorgte (verb) + für (preposisi) + Aufsehen (objek Akkusativ)."
    ],
    "pronunciationTips": "Perhatikan pelafalan akhiran '-end' pada Partizip I, yang seringkali terdengar seperti 'ent'. Contoh: 'lachend' [LACH-ent]. Untuk Partizip II, pastikan untuk mengucapkan awalan 'ge-' dengan jelas dan tekanan pada suku kata pertama kata dasar. Contoh: 'geschrieben' [ge-SHREE-ben].",
    "vocabulary": [
      {
        "id": "v-gen-343",
        "word": "lachend",
        "translation": "tertawa (Partizip I)",
        "exampleSentence": "Das lachende Kind spielte im Garten.",
        "phonetic": "LACH-ent",
        "level": "B2"
      },
      {
        "id": "v-gen-344",
        "word": "schreibend",
        "translation": "menulis (Partizip I)",
        "exampleSentence": "Schreibend verbrachte er den ganzen Abend.",
        "phonetic": "SHRY-bent",
        "level": "B2"
      },
      {
        "id": "v-gen-345",
        "word": "gesehen",
        "translation": "terlihat (Partizip II)",
        "exampleSentence": "Der gesehene Film war sehr spannend.",
        "phonetic": "ge-ZAY-en",
        "level": "B2"
      },
      {
        "id": "v-gen-346",
        "word": "geschrieben",
        "translation": "tertulis (Partizip II)",
        "exampleSentence": "Die geschriebene Nachricht war kurz und prägnant.",
        "phonetic": "ge-SHREE-ben",
        "level": "B2"
      },
      {
        "id": "v-gen-347",
        "word": "sprechend",
        "translation": "berbicara (Partizip I)",
        "exampleSentence": "Sprechend über seine Erfahrungen, wurde er emotional.",
        "phonetic": "SHPRECH-ent",
        "level": "B2"
      },
      {
        "id": "v-gen-348",
        "word": "gehört",
        "translation": "terdengar (Partizip II)",
        "exampleSentence": "Das gehörte Lied war sehr eingängig.",
        "phonetic": "ge-HÖRT",
        "level": "B2"
      },
      {
        "id": "v-gen-349",
        "word": "lesend",
        "translation": "membaca (Partizip I)",
        "exampleSentence": "Lesend saß sie am Fenster.",
        "phonetic": "LAY-zent",
        "level": "B2"
      },
      {
        "id": "v-gen-350",
        "word": "gelesen",
        "translation": "terbaca (Partizip II)",
        "exampleSentence": "Die gelesene Geschichte war sehr berührend.",
        "phonetic": "ge-LAY-zen",
        "level": "B2"
      },
      {
        "id": "v-gen-351",
        "word": "singend",
        "translation": "bernyanyi (Partizip I)",
        "exampleSentence": "Singend ging er durch den Wald.",
        "phonetic": "ZING-ent",
        "level": "B2"
      },
      {
        "id": "v-gen-352",
        "word": "gesungen",
        "translation": "dinyanyikan (Partizip II)",
        "exampleSentence": "Das gesungene Lied war wunderschön.",
        "phonetic": "ge-ZUNG-en",
        "level": "B2"
      },
      {
        "id": "v-gen-353",
        "word": "rennend",
        "translation": "berlari (Partizip I)",
        "exampleSentence": "Rennend erreichte er den Zug noch pünktlich.",
        "phonetic": "REN-ent",
        "level": "B2"
      },
      {
        "id": "v-gen-354",
        "word": "geöffnet",
        "translation": "terbuka (Partizip II)",
        "exampleSentence": "Die geöffnete Tür führte in den Garten.",
        "phonetic": "ge-ÖF-net",
        "level": "B2"
      },
      {
        "id": "v-gen-355",
        "word": "schlafend",
        "translation": "tidur (Partizip I)",
        "exampleSentence": "Das schlafende Baby sah so friedlich aus.",
        "phonetic": "SHLAH-fent",
        "level": "B2"
      },
      {
        "id": "v-gen-356",
        "word": "verloren",
        "translation": "hilang (Partizip II)",
        "exampleSentence": "Der verlorene Schlüssel wurde nie gefunden.",
        "phonetic": "fer-LOR-en",
        "level": "B2"
      },
      {
        "id": "v-gen-357",
        "word": "wartend",
        "translation": "menunggu (Partizip I)",
        "exampleSentence": "Wartend stand sie am Bahnhof.",
        "phonetic": "VAR-tent",
        "level": "B2"
      },
      {
        "id": "v-gen-358",
        "word": "der Bericht",
        "translation": "laporan",
        "article": "der",
        "exampleSentence": "Der veröffentlichte Bericht enthielt wichtige Informationen.",
        "phonetic": "der be-RICHT",
        "level": "B2"
      },
      {
        "id": "v-gen-359",
        "word": "die Entscheidung",
        "translation": "keputusan",
        "article": "die",
        "exampleSentence": "Die getroffene Entscheidung war mutig.",
        "phonetic": "dee ent-SHY-dung",
        "level": "B2"
      }
    ],
    "exercises": [
      {
        "question": "Pilih Partizip I yang tepat untuk melengkapi kalimat: 'Das ______ Kind spielte im Sandkasten.'",
        "options": [
          "spielend",
          "gespielt",
          "spielen",
          "spielte"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih Partizip II yang tepat untuk melengkapi kalimat: 'Die ______ Tür führte in den Garten.'",
        "options": [
          "öffnend",
          "geöffnet",
          "öffnen",
          "öffnete"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Ubah kalimat berikut menjadi Partizipialkonstruktion: 'Der Mann, der lacht, ist mein Bruder.'",
        "options": [
          "Der lachende Mann ist mein Bruder.",
          "Der gelachte Mann ist mein Bruder.",
          "Der Mann lachend ist mein Bruder.",
          "Der Mann, lachend, ist mein Bruder."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ubah kalimat berikut menjadi Partizipialkonstruktion: 'Das Buch, das gelesen wurde, war sehr interessant.'",
        "options": [
          "Das lesende Buch war sehr interessant.",
          "Das gelesen Buch war sehr interessant.",
          "Das gelesene Buch war sehr interessant.",
          "Das Buch gelesen war sehr interessant."
        ],
        "correctAnswer": 2
      },
      {
        "question": "Manakah kalimat yang menggunakan Partizipialkonstruktion dengan benar?",
        "options": [
          "Die singende Vögel weckten mich auf.",
          "Die gesungene Vögel weckten mich auf.",
          "Die Vögel singend weckten mich auf.",
          "Die Vögel gesungen weckten mich auf."
        ],
        "correctAnswer": 0
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa fungsi utama Partizipialkonstruktionen?",
        "options": [
          "Menyampaikan informasi tambahan secara ringkas",
          "Menggantikan kata kerja utama",
          "Menyatakan waktu lampau",
          "Membentuk kalimat tanya"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Partizip I (Partizip Präsens) menggambarkan tindakan yang...",
        "options": [
          "Sedang berlangsung atau aktif",
          "Sudah selesai atau pasif",
          "Akan datang",
          "Tidak relevan dengan tindakan utama"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Partizip II (Partizip Perfekt) menggambarkan tindakan yang...",
        "options": [
          "Sedang berlangsung atau aktif",
          "Sudah selesai atau pasif",
          "Akan datang",
          "Tidak relevan dengan tindakan utama"
        ],
        "correctAnswer": 1
      }
    ],
    "dialogues": [
      {
        "personA": "Hast du den Artikel gelesen, den sie gestern veröffentlicht haben?",
        "personB": "Ja, der gestern veröffentlichte Artikel war sehr aufschlussreich.",
        "translation": "A: Apakah kamu sudah membaca artikel yang mereka terbitkan kemarin?\nB: Ya, artikel yang diterbitkan kemarin sangat mencerahkan."
      },
      {
        "personA": "Warum ist er so schnell weggerannt?",
        "personB": "Rennend, um den Bus noch zu erwischen, hat er seine Tasche vergessen.",
        "translation": "A: Kenapa dia lari begitu cepat?\nB: Berlari untuk mengejar bus, dia lupa tasnya."
      },
      {
        "personA": "Wie findest du die neue Kollegin?",
        "personB": "Die stets lächelnde Kollegin macht einen sehr freundlichen Eindruck.",
        "translation": "A: Bagaimana menurutmu rekan kerja baru itu?\nB: Rekan kerja yang selalu tersenyum itu memberikan kesan yang sangat ramah."
      }
    ],
    "culturalNotes": "Penggunaan Partizipialkonstruktionen yang tepat menunjukkan kemahiran berbahasa Jerman tingkat tinggi. Dalam bahasa Jerman, seringkali ada preferensi untuk struktur kalimat yang lebih ringkas dan padat informasi, terutama dalam tulisan formal atau ilmiah. Menguasai Partizipialkonstruktionen membantu mencapai gaya penulisan yang lebih efisien dan elegan."
  },
  {
    "id": "b2-2",
    "canDoGoals": [
      "Memahami konstruksi kalimat nominal / kalimat partizipial di posisi terentang / pre-nominal",
      "Menjabarkan struktur Partisipial (Erweiterte Relativsätze) dari kiri ke kanan sebelum masuk ranah membaca artikel resmi",
      "Menguraikan susunan sintaksis formal"
    ],
    "level": "B2",
    "title": "Erweiterte Relativsätze",
    "grammarDescription": "Erweiterte Relativsätze (klausa relatif yang diperluas) adalah bentuk klausa relatif yang lebih kompleks dan sering digunakan dalam bahasa Jerman tingkat lanjut, terutama dalam tulisan formal. Mereka memungkinkan kita untuk memberikan informasi tambahan tentang sebuah kata benda atau pronomina secara lebih ringkas dibandingkan klausa relatif tradisional.\n\n**Struktur Dasar:**\nSebuah erweiterter Relativsatz biasanya terdiri dari:\n`Artikel (der/die/das) + Partizip I atau Partizip II + Kata Benda`\n\nContoh: `der spielende Junge` (anak laki-laki yang sedang bermain) - menggantikan `der Junge, der spielt`.\n`das gelesene Buch` (buku yang sudah dibaca) - menggantikan `das Buch, das gelesen wurde`.\n\n**Perluasan dengan Adverbial atau Objek:**\nKlausa relatif ini dapat diperluas dengan menambahkan adverbial (keterangan waktu, tempat, cara) atau objek (Dativ, Akkusativ) di antara artikel dan partizip.\n\nContoh:\n- `der gestern spielende Junge` (anak laki-laki yang bermain kemarin)\n- `die von ihm geschriebene E-Mail` (email yang ditulis olehnya)\n- `das in der Ecke stehende Fahrrad` (sepeda yang berdiri di sudut)\n\n**Deklinasi:**\nPartizip dalam erweiterter Relativsatz berfungsi sebagai adjektiva dan dideklinasikan sesuai dengan kasus, gender, dan jumlah kata benda yang dijelaskannya. Artikel di depannya juga dideklinasikan sesuai kasus.",
    "sentenceBreakdowns": [
      "Der (artikel) + gestern (adverbial waktu) + angekommene (Partizip II) + Gast (subjek) + wurde (verb) + herzlich (adverb) + begrüßt (Partizip II).",
      "Die (artikel) + von der (preposisi + artikel) + Firma (objek Dativ) + angebotenen (Partizip II) + Produkte (subjek) + sind (verb) + sehr (adverb) + beliebt (adjektiva).",
      "Das (artikel) + auf dem (preposisi + artikel) + Tisch (objek Dativ) + liegende (Partizip I) + Buch (subjek) + gehört (verb) + mir (objek Dativ).",
      "Die (artikel) + schnell (adverb) + wachsende (Partizip I) + Wirtschaft (subjek) + schafft (verb) + neue (adjektiva) + Arbeitsplätze (objek Akkusativ).",
      "Der (artikel) + von vielen (preposisi + pronomina) + gelobte (Partizip II) + Film (subjek) + hat (verb) + einen (artikel) + Preis (objek Akkusativ) + gewonnen (Partizip II)."
    ],
    "pronunciationTips": "Dalam 'erweiterte Relativsätze', perhatikan intonasi yang menurun pada partizip yang berfungsi sebagai adjektiva, dan kemudian naik lagi pada kata benda yang dijelaskan. Contoh: 'der gestern angekommene Gast' [der GES-tern an-ge-KOM-me-ne GAST]. Latih pengucapan partizip dengan akhiran yang benar sesuai deklinasi.",
    "vocabulary": [
      {
        "id": "v-gen-360",
        "word": "angekommen",
        "translation": "tiba (Partizip II)",
        "exampleSentence": "Der gestern angekommene Gast ist schon wieder abgereist.",
        "phonetic": "AN-ge-kom-men",
        "level": "B2"
      },
      {
        "id": "v-gen-361",
        "word": "angeboten",
        "translation": "ditawarkan (Partizip II)",
        "exampleSentence": "Die angebotenen Produkte sind von hoher Qualität.",
        "phonetic": "AN-ge-bo-ten",
        "level": "B2"
      },
      {
        "id": "v-gen-362",
        "word": "liegend",
        "translation": "terletak (Partizip I)",
        "exampleSentence": "Das auf dem Tisch liegende Buch gehört mir.",
        "phonetic": "LEE-gent",
        "level": "B2"
      },
      {
        "id": "v-gen-363",
        "word": "wachsend",
        "translation": "tumbuh (Partizip I)",
        "exampleSentence": "Die schnell wachsende Wirtschaft schafft neue Arbeitsplätze.",
        "phonetic": "VACH-sent",
        "level": "B2"
      },
      {
        "id": "v-gen-364",
        "word": "gelobt",
        "translation": "dipuji (Partizip II)",
        "exampleSentence": "Der von vielen gelobte Film hat einen Preis gewonnen.",
        "phonetic": "ge-LOHPT",
        "level": "B2"
      },
      {
        "id": "v-gen-365",
        "word": "diskutiert",
        "translation": "didiskusikan (Partizip II)",
        "exampleSentence": "Das viel diskutierte Thema wurde endlich entschieden.",
        "phonetic": "dis-ku-TEERT",
        "level": "B2"
      },
      {
        "id": "v-gen-366",
        "word": "erwartet",
        "translation": "diharapkan (Partizip II)",
        "exampleSentence": "Die erwartete Antwort kam leider nicht.",
        "phonetic": "er-VAR-tet",
        "level": "B2"
      },
      {
        "id": "v-gen-367",
        "word": "verstanden",
        "translation": "dimengerti (Partizip II)",
        "exampleSentence": "Die von ihm verstandene Aufgabe war komplex.",
        "phonetic": "fer-SHTAN-den",
        "level": "B2"
      },
      {
        "id": "v-gen-368",
        "word": "bevorstehend",
        "translation": "mendatang (Partizip I)",
        "exampleSentence": "Die bevorstehende Prüfung bereitet mir Sorgen.",
        "phonetic": "be-FOR-shtay-ent",
        "level": "B2"
      },
      {
        "id": "v-gen-369",
        "word": "entstanden",
        "translation": "terbentuk (Partizip II)",
        "exampleSentence": "Die neu entstandene Situation erfordert schnelle Maßnahmen.",
        "phonetic": "ent-SHTAN-den",
        "level": "B2"
      },
      {
        "id": "v-gen-370",
        "word": "die Wirtschaft",
        "translation": "ekonomi",
        "article": "die",
        "exampleSentence": "Die schnell wachsende Wirtschaft ist ein gutes Zeichen.",
        "phonetic": "dee VIR-shaft",
        "level": "B2"
      },
      {
        "id": "v-gen-371",
        "word": "der Arbeitsplatz",
        "translation": "tempat kerja",
        "article": "der",
        "exampleSentence": "Neue Arbeitsplätze werden durch die wachsende Wirtschaft geschaffen.",
        "phonetic": "der AR-byts-plats",
        "level": "B2"
      },
      {
        "id": "v-gen-372",
        "word": "die Qualität",
        "translation": "kualitas",
        "article": "die",
        "exampleSentence": "Die angebotenen Produkte haben eine hohe Qualität.",
        "phonetic": "dee kva-li-TÄT",
        "level": "B2"
      },
      {
        "id": "v-gen-373",
        "word": "die Maßnahme",
        "translation": "tindakan",
        "article": "die",
        "exampleSentence": "Die ergriffenen Maßnahmen waren notwendig.",
        "phonetic": "dee MAAS-nah-me",
        "level": "B2"
      },
      {
        "id": "v-gen-374",
        "word": "die Prüfung",
        "translation": "ujian",
        "article": "die",
        "exampleSentence": "Die bevorstehende Prüfung ist sehr wichtig.",
        "phonetic": "dee PRÜ-fung",
        "level": "B2"
      },
      {
        "id": "v-gen-375",
        "word": "die Situation",
        "translation": "situasi",
        "article": "die",
        "exampleSentence": "Die neu entstandene Situation ist komplex.",
        "phonetic": "dee zi-tu-a-TSYON",
        "level": "B2"
      }
    ],
    "exercises": [
      {
        "question": "Pilih bentuk yang benar untuk 'der Junge, der spielt' sebagai erweiterter Relativsatz.",
        "options": [
          "der spielende Junge",
          "der gespielt Junge",
          "der Junge spielend",
          "der Junge gespielt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih bentuk yang benar untuk 'die E-Mail, die von ihm geschrieben wurde' sebagai erweiterter Relativsatz.",
        "options": [
          "die von ihm schreibende E-Mail",
          "die von ihm geschriebene E-Mail",
          "die E-Mail von ihm schreibend",
          "die E-Mail von ihm geschrieben"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Das ______ (lesen) Buch war sehr spannend.'",
        "options": [
          "lesende",
          "gelesene",
          "gelesen",
          "lesend"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi kalimat: 'Die ______ (singen) Vögel weckten mich auf.'",
        "options": [
          "singende",
          "gesungene",
          "singend",
          "gesungen"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Manakah kalimat yang menggunakan erweiterter Relativsatz dengan benar?",
        "options": [
          "Der gestern angekommen Gast war müde.",
          "Der gestern angekommene Gast war müde.",
          "Der Gast gestern angekommen war müde.",
          "Der Gast angekommen gestern war müde."
        ],
        "correctAnswer": 1
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa fungsi utama 'erweiterte Relativsätze'?",
        "options": [
          "Menyatakan sebab-akibat",
          "Memberikan informasi tambahan secara ringkas",
          "Membentuk kalimat pasif",
          "Menyatakan keinginan"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Bagaimana Partizip dalam 'erweiterte Relativsätze' dideklinasikan?",
        "options": [
          "Tidak dideklinasikan",
          "Seperti kata kerja",
          "Seperti adjektiva",
          "Seperti kata benda"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa yang bisa ditambahkan untuk memperluas 'erweiterte Relativsätze'?",
        "options": [
          "Hanya adverbial",
          "Hanya objek",
          "Adverbial atau objek",
          "Tidak ada yang bisa ditambahkan"
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Hast du den Bericht gelesen, der letzte Woche veröffentlicht wurde?",
        "personB": "Ja, der letzte Woche veröffentlichte Bericht war sehr detailliert.",
        "translation": "A: Apakah kamu sudah membaca laporan yang diterbitkan minggu lalu?\nB: Ya, laporan yang diterbitkan minggu lalu sangat rinci."
      },
      {
        "personA": "Wo ist das Fahrrad, das in der Ecke stand?",
        "personB": "Das in der Ecke stehende Fahrrad wurde gestohlen.",
        "translation": "A: Di mana sepeda yang berdiri di sudut?\nB: Sepeda yang berdiri di sudut itu dicuri."
      },
      {
        "personA": "Wie war die Präsentation?",
        "personB": "Die von der Studentin gehaltene Präsentation war sehr beeindruckend.",
        "translation": "A: Bagaimana presentasinya?\nB: Presentasi yang disampaikan oleh mahasiswi itu sangat mengesankan."
      }
    ],
    "culturalNotes": "Dalam konteks akademik dan jurnalistik Jerman, 'erweiterte Relativsätze' sangat umum digunakan untuk mencapai gaya penulisan yang padat informasi dan objektif. Kemampuan untuk memahami dan menggunakannya menunjukkan pemahaman mendalam tentang struktur kalimat Jerman dan kemampuan untuk mengekspresikan ide-ide kompleks secara efisien."
  },
  {
    "id": "b2-3",
    "canDoGoals": [
      "Menghidupkan argumen oral/lisan dengan Modalpartikeln",
      "Dapat merepresentasikan rasa marah / meremehkan / keyakinan diri dengan kata seperti 'halt', 'eben', 'doch', atau 'mal'",
      "Meningkatkan aksen natural lisan bagaikan native speaker"
    ],
    "level": "B2",
    "title": "Modalpartikeln (doch, mal, ja, eben)",
    "grammarDescription": "Modalpartikeln (partikel modal) adalah kata-kata kecil yang tidak memiliki makna leksikal sendiri tetapi memberikan nuansa emosional, sikap, atau penekanan pada sebuah kalimat. Mereka sangat umum dalam percakapan sehari-hari bahasa Jerman dan penting untuk dipahami agar komunikasi terdengar alami. Posisi mereka biasanya setelah kata kerja terkonjugasi atau setelah subjek.\n\n**1. Doch**\n- **Kontradiksi/Koreksi:** Menekankan bahwa sesuatu itu benar, meskipun ada keraguan atau pernyataan yang berlawanan. (Contoh: 'Es regnet doch!' - Padahal hujan!)\n- **Permintaan Ramah/Saran:** Melembutkan permintaan atau saran. (Contoh: 'Komm doch mal vorbei!' - Mampirlah sebentar!)\n- **Keterkejutan/Ketidakpercayaan:** Menyatakan kejutan atau ketidakpercayaan. (Contoh: 'Du bist doch verrückt!' - Kamu gila, kan?)\n\n**2. Mal**\n- **Permintaan Singkat/Tidak Penting:** Melembutkan permintaan, membuatnya terdengar lebih santai atau tidak mendesak. (Contoh: 'Warte mal!' - Tunggu sebentar!)\n- **Ajakan/Saran:** Mengajak seseorang melakukan sesuatu. (Contoh: 'Probier mal!' - Cobalah!)\n- **Penekanan pada Durasi Singkat:** Menunjukkan bahwa tindakan akan berlangsung sebentar. (Contoh: 'Ich schaue mal.' - Saya lihat sebentar.)\n\n**3. Ja**\n- **Penegasan/Pernyataan yang Jelas:** Menekankan bahwa sesuatu itu sudah diketahui atau jelas. (Contoh: 'Das weißt du ja!' - Kamu kan tahu itu!)\n- **Keterkejutan/Kekaguman:** Menyatakan kejutan atau kekaguman. (Contoh: 'Das ist ja toll!' - Itu kan hebat!)\n- **Peringatan/Ancaman:** Memberikan peringatan. (Contoh: 'Pass ja auf!' - Hati-hati ya!)\n\n**4. Eben / Halt**\n- **Penerimaan/Konfirmasi:** Menunjukkan penerimaan terhadap suatu fakta atau situasi yang tidak dapat diubah, seringkali dengan sedikit nada pasrah atau 'begitulah adanya'. (Contoh: 'Es ist eben so.' - Ya memang begitu adanya.)\n- **Penjelasan Sederhana:** Memberikan penjelasan yang dianggap sudah jelas atau tidak perlu diperdebatkan. (Contoh: 'Er ist eben müde.' - Dia kan memang lelah.)",
    "sentenceBreakdowns": [
      "Das (subjek) + ist (verb) + doch (Modalpartikel) + klar (adjektiva)!",
      "Komm (verb) + doch (Modalpartikel) + mal (Modalpartikel) + her (adverb)!",
      "Das (subjek) + ist (verb) + ja (Modalpartikel) + unglaublich (adjektiva)!",
      "Es (subjek) + ist (verb) + eben (Modalpartikel) + so (adverb).",
      "Warte (verb) + mal (Modalpartikel) + kurz (adverb)!"
    ],
    "pronunciationTips": "Modalpartikeln seringkali tidak ditekankan dalam kalimat, tetapi intonasi keseluruhan kalimat dapat berubah secara signifikan tergantung pada partikel yang digunakan. Misalnya, 'doch' yang menyatakan kontradiksi sering diucapkan dengan penekanan dan intonasi naik, sementara 'eben' yang menyatakan penerimaan sering diucapkan dengan intonasi datar atau sedikit menurun.",
    "vocabulary": [
      {
        "id": "v-gen-376",
        "word": "doch",
        "translation": "padahal, kan (Modalpartikel)",
        "exampleSentence": "Du weißt doch, dass ich Recht habe.",
        "phonetic": "DOCH",
        "level": "B2"
      },
      {
        "id": "v-gen-377",
        "word": "mal",
        "translation": "sebentar, coba (Modalpartikel)",
        "exampleSentence": "Gib mir mal das Salz.",
        "phonetic": "MAL",
        "level": "B2"
      },
      {
        "id": "v-gen-378",
        "word": "ja",
        "translation": "kan, memang (Modalpartikel)",
        "exampleSentence": "Das ist ja eine Überraschung!",
        "phonetic": "YAH",
        "level": "B2"
      },
      {
        "id": "v-gen-379",
        "word": "eben",
        "translation": "memang begitu, ya sudah (Modalpartikel)",
        "exampleSentence": "Es ist eben so, da kann man nichts machen.",
        "phonetic": "AY-ben",
        "level": "B2"
      },
      {
        "id": "v-gen-380",
        "word": "halt",
        "translation": "memang begitu, ya sudah (Modalpartikel, sinonim 'eben')",
        "exampleSentence": "Er ist halt so.",
        "phonetic": "HALT",
        "level": "B2"
      },
      {
        "id": "v-gen-381",
        "word": "schon",
        "translation": "sudah, memang (Modalpartikel)",
        "exampleSentence": "Das wird schon klappen.",
        "phonetic": "SHON",
        "level": "B2"
      },
      {
        "id": "v-gen-382",
        "word": "wohl",
        "translation": "mungkin, sepertinya (Modalpartikel)",
        "exampleSentence": "Er wird wohl zu Hause sein.",
        "phonetic": "VOL",
        "level": "B2"
      },
      {
        "id": "v-gen-383",
        "word": "eigentlich",
        "translation": "sebenarnya (Modalpartikel)",
        "exampleSentence": "Was wolltest du eigentlich sagen?",
        "phonetic": "EYE-gent-lich",
        "level": "B2"
      },
      {
        "id": "v-gen-384",
        "word": "einfach",
        "translation": "saja, mudah (Modalpartikel)",
        "exampleSentence": "Komm einfach mit!",
        "phonetic": "EYEN-fach",
        "level": "B2"
      },
      {
        "id": "v-gen-385",
        "word": "ruhig",
        "translation": "saja, tenang (Modalpartikel)",
        "exampleSentence": "Du kannst ruhig fragen.",
        "phonetic": "ROO-ich",
        "level": "B2"
      },
      {
        "id": "v-gen-386",
        "word": "bloß",
        "translation": "hanya, saja (Modalpartikel)",
        "exampleSentence": "Sag bloß nichts Falsches!",
        "phonetic": "BLOHS",
        "level": "B2"
      },
      {
        "id": "v-gen-387",
        "word": "denn",
        "translation": "gerangan (Modalpartikel)",
        "exampleSentence": "Was machst du denn hier?",
        "phonetic": "DEN",
        "level": "B2"
      },
      {
        "id": "v-gen-388",
        "word": "die Überraschung",
        "translation": "kejutan",
        "article": "die",
        "exampleSentence": "Das ist ja eine tolle Überraschung!",
        "phonetic": "dee Ü-ber-ra-SHUNG",
        "level": "B2"
      },
      {
        "id": "v-gen-389",
        "word": "die Geduld",
        "translation": "kesabaran",
        "article": "die",
        "exampleSentence": "Hab doch mal etwas Geduld!",
        "phonetic": "dee ge-DULT",
        "level": "B2"
      },
      {
        "id": "v-gen-390",
        "word": "die Wahrheit",
        "translation": "kebenaran",
        "article": "die",
        "exampleSentence": "Du sagst doch die Wahrheit, oder?",
        "phonetic": "dee VAR-hayt",
        "level": "B2"
      }
    ],
    "exercises": [
      {
        "question": "Pilih Modalpartikel yang tepat: 'Du bist ______ verrückt!' (menyatakan keterkejutan)",
        "options": [
          "doch",
          "mal",
          "eben",
          "ja"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih Modalpartikel yang tepat: 'Warte ______ kurz!' (melembutkan permintaan)",
        "options": [
          "doch",
          "mal",
          "ja",
          "eben"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Pilih Modalpartikel yang tepat: 'Das ist ______ eine tolle Idee!' (menyatakan kekaguman)",
        "options": [
          "doch",
          "mal",
          "ja",
          "eben"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih Modalpartikel yang tepat: 'Es ist ______ so, da kann man nichts ändern.' (menyatakan penerimaan)",
        "options": [
          "doch",
          "mal",
          "ja",
          "eben"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Manakah kalimat yang menggunakan 'doch' untuk melembutkan permintaan?",
        "options": [
          "Das ist doch klar!",
          "Komm doch mal vorbei!",
          "Du bist doch verrückt!",
          "Es regnet doch!"
        ],
        "correctAnswer": 1
      }
    ],
    "miniQuiz": [
      {
        "question": "Modalpartikel 'doch' dapat digunakan untuk menyatakan...",
        "options": [
          "Hanya kejutan",
          "Hanya permintaan",
          "Kontradiksi, permintaan ramah, atau keterkejutan",
          "Hanya penerimaan"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Modalpartikel 'mal' sering digunakan untuk...",
        "options": [
          "Menekankan fakta yang sudah diketahui",
          "Melembutkan permintaan atau ajakan",
          "Menyatakan ketidakpercayaan",
          "Menunjukkan kepasrahan"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Modalpartikel 'eben' atau 'halt' menunjukkan...",
        "options": [
          "Keterkejutan yang menyenangkan",
          "Permintaan yang mendesak",
          "Penerimaan terhadap suatu fakta yang tidak dapat diubah",
          "Keraguan"
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Ich dachte, du kommst nicht.",
        "personB": "Ich bin doch gekommen! Ich bin nur etwas spät.",
        "translation": "A: Kukira kamu tidak datang.\nB: Aku kan datang! Aku hanya sedikit terlambat."
      },
      {
        "personA": "Kannst du mir helfen?",
        "personB": "Warte mal kurz, ich bin gleich fertig.",
        "translation": "A: Bisakah kamu membantuku?\nB: Tunggu sebentar ya, aku sebentar lagi selesai."
      },
      {
        "personA": "Das ist ja unglaublich! Ich habe den Job bekommen!",
        "personB": "Herzlichen Glückwunsch! Das ist ja toll!",
        "translation": "A: Ini sungguh luar biasa! Aku dapat pekerjaan itu!\nB: Selamat! Itu kan hebat!"
      }
    ],
    "culturalNotes": "Penggunaan Modalpartikeln adalah ciri khas komunikasi lisan Jerman. Mereka menambahkan 'rasa' dan 'warna' pada percakapan, dan seringkali sulit untuk diterjemahkan secara langsung. Memahami nuansa mereka sangat penting untuk tidak hanya berbicara bahasa Jerman dengan lancar, tetapi juga untuk memahami maksud sebenarnya dari penutur asli. Kesalahan dalam penggunaan bisa membuat kalimat terdengar kaku, tidak sopan, atau bahkan salah paham."
  },
  {
    "id": "b2-checkpoint-1",
    "canDoGoals": [
      "Tes mengkonversikan klausa relasional pasif/aktif ke format tertulis panjang akademik Partizip",
      "Tes penggunaan partikel nada bicara di konteks diskusi dan berdebat"
    ],
    "title": "Review Konten Sebelumnya",
    "requiredScore": 0.7,
    "questions": [
      {
        "question": "Pilih Partizip I yang tepat untuk melengkapi kalimat: 'Das ______ (lachen) Baby schlief friedlich.'",
        "options": [
          "lachende",
          "gelachte",
          "lachend",
          "gelacht"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih Partizip II yang tepat untuk melengkapi kalimat: 'Die ______ (schreiben) E-Mail war sehr lang.'",
        "options": [
          "schreibende",
          "geschriebene",
          "schreibend",
          "geschrieben"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Ubah kalimat 'Der Mann, der singt, ist mein Nachbar.' menjadi Partizipialkonstruktion.",
        "options": [
          "Der singende Mann ist mein Nachbar.",
          "Der gesungene Mann ist mein Nachbar.",
          "Der Mann singend ist mein Nachbar.",
          "Der Mann gesungen ist mein Nachbar."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih bentuk yang benar untuk 'das Buch, das auf dem Tisch liegt' sebagai erweiterter Relativsatz.",
        "options": [
          "das auf dem Tisch liegende Buch",
          "das auf dem Tisch gelegen Buch",
          "das Buch auf dem Tisch liegend",
          "das Buch auf dem Tisch gelegen"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Lengkapi kalimat: 'Die von der Regierung ______ (treffen) Maßnahmen sind umstritten.'",
        "options": [
          "treffenden",
          "getroffenen",
          "treffend",
          "getroffen"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Pilih Modalpartikel yang tepat: 'Du bist ______ spät dran!' (menyatakan kejutan atau ketidakpercayaan)",
        "options": [
          "doch",
          "mal",
          "eben",
          "ja"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Pilih Modalpartikel yang tepat: 'Gib mir ______ den Stift!' (melembutkan permintaan)",
        "options": [
          "doch",
          "mal",
          "ja",
          "eben"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Pilih Modalpartikel yang tepat: 'Das ist ______ eine Frechheit!' (menyatakan kemarahan/keterkejutan)",
        "options": [
          "doch",
          "mal",
          "ja",
          "eben"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih Modalpartikel yang tepat: 'Es ist ______ so, man muss es akzeptieren.' (menyatakan penerimaan)",
        "options": [
          "doch",
          "mal",
          "ja",
          "eben"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Manakah kalimat yang menggunakan 'erweiterter Relativsatz' dengan benar?",
        "options": [
          "Die von ihm geschriebene Brief war sehr persönlich.",
          "Die von ihm geschriebener Brief war sehr persönlich.",
          "Der von ihm geschriebene Brief war sehr persönlich.",
          "Der von ihm geschriebener Brief war sehr persönlich."
        ],
        "correctAnswer": 2
      }
    ],
    "reviewLessons": [
      "b2-1",
      "b2-2",
      "b2-3"
    ]
  },
  {
    "id": "b2-4",
    "canDoGoals": [
      "Menguasai karakteristik Wissenschaftlicher Schreibstil (gaya tulisan ilmiah dan objektif)",
      "Mengecoh perspektif pelaku dan menggantinya dengan gaya passiversatz / impersonal (man, es, sich lassen)",
      "Langkah pertama persiapan menulis argumen saintifik/logis di ujian B2 atau tes DaF"
    ],
    "level": "B2",
    "title": "Wissenschaftlicher Schreibstil",
    "grammarDescription": "Gaya penulisan ilmiah (wissenschaftlicher Schreibstil) dalam bahasa Jerman memiliki karakteristik khusus yang membedakannya dari bahasa sehari-hari. Tujuannya adalah untuk menyampaikan informasi secara objektif, presisi, dan logis. Ini sangat penting dalam konteks akademik, laporan, atau publikasi ilmiah.\n\n**Ciri-ciri Utama:**\n1.  **Objektivitas dan Impersonalitas:** Penulis sering menghindari penggunaan 'ich' atau 'wir'. Sebagai gantinya, digunakan konstruksi impersonal atau pasif.\n    *   Contoh: 'Es wird angenommen, dass...' (Diperkirakan bahwa...) daripada 'Ich nehme an, dass...'\n2.  **Nominalisierung (Nominalization):** Penggunaan kata benda (Nomen) alih-alih kata kerja (Verben) atau adjektiva (Adjektive) untuk mengekspresikan tindakan atau proses. Ini membuat kalimat lebih padat dan formal.\n    *   Contoh: 'Die Analyse der Daten' (Analisis data) daripada 'Man analysiert die Daten'.\n3.  **Passiv (Passive Voice):** Sering digunakan untuk menekankan tindakan atau hasil, bukan pelaku tindakan.\n    *   Contoh: 'Die Ergebnisse wurden präsentiert.' (Hasil-hasil dipresentasikan.)\n4.  **Komplexe Satzstrukturen:** Penggunaan kalimat majemuk dengan banyak anak kalimat (Nebensätze) dan konjungsi yang tepat untuk menunjukkan hubungan logis antar ide.\n    *   Contoh: 'Obwohl die Studie umfangreich war, konnten nicht alle Fragen beantwortet werden.'\n5.  **Fachvokabular (Technical Vocabulary):** Penggunaan istilah-istilah khusus dari bidang ilmu tertentu.\n6.  **Präzision und Klarheit:** Menghindari ambiguitas dan memastikan setiap pernyataan didukung oleh bukti atau argumen yang jelas.\n\n**Contoh Transformasi:**\n*   **Informal:** 'Man hat die Daten analysiert.'\n*   **Formal/Wissenschaftlich:** 'Die Analyse der Daten wurde durchgeführt.' (Nominalisierung + Passiv)",
    "sentenceBreakdowns": [
      "Die (artikel) + Durchführung (nominalisasi) + der (artikel) + Studie (kata benda) + erfolgte (verb) + unter (preposisi) + strengen (adjektiva) + Bedingungen (kata benda).",
      "Es (pronomina impersonal) + wird (verb bantu) + angenommen (Partizip II), + dass (konjungsi) + die (artikel) + Ergebnisse (kata benda) + valide (adjektiva) + sind (verb).",
      "Aufgrund (preposisi) + der (artikel) + vorliegenden (Partizip I) + Daten (kata benda) + lässt (verb) + sich (pronomina refleksif) + schlussfolgern (infinitif), + dass (konjungsi) + ...",
      "Die (artikel) + Relevanz (nominalisasi) + dieser (pronomina demonstratif) + Forschung (kata benda) + kann (Modalverb) + nicht (negasi) + unterschätzt (Partizip II) + werden (verb bantu).",
      "Im (preposisi + artikel) + Hinblick (kata benda) + auf (preposisi) + die (artikel) + gewonnenen (Partizip II) + Erkenntnisse (kata benda) + ist (verb) + festzuhalten (infinitif), + dass (konjungsi) + ..."
    ],
    "pronunciationTips": "Saat membaca teks ilmiah, perhatikan intonasi yang lebih datar dan kecepatan yang lebih lambat untuk memastikan kejelasan. Kata-kata panjang yang terbentuk dari nominalisasi atau gabungan kata harus diucapkan dengan jelas, misalnya 'Forschungsergebnisse' [FOR-shungs-er-geb-nis-se].",
    "vocabulary": [
      {
        "id": "v-gen-391",
        "word": "die Analyse",
        "translation": "analisis",
        "article": "die",
        "exampleSentence": "Die Analyse der Daten ergab interessante Ergebnisse.",
        "phonetic": "dee a-na-LY-ze",
        "level": "B2"
      },
      {
        "id": "v-gen-392",
        "word": "die Durchführung",
        "translation": "pelaksanaan",
        "article": "die",
        "exampleSentence": "Die Durchführung des Experiments war erfolgreich.",
        "phonetic": "dee DURCH-fü-rung",
        "level": "B2"
      },
      {
        "id": "v-gen-393",
        "word": "die Erkenntnis",
        "translation": "penemuan, wawasan",
        "article": "die",
        "exampleSentence": "Neue Erkenntnisse wurden in der Studie gewonnen.",
        "phonetic": "dee er-KENT-nis",
        "level": "B2"
      },
      {
        "id": "v-gen-394",
        "word": "die Hypothese",
        "translation": "hipotesis",
        "article": "die",
        "exampleSentence": "Die Hypothese wurde durch die Daten bestätigt.",
        "phonetic": "dee hy-po-TAY-ze",
        "level": "B2"
      },
      {
        "id": "v-gen-395",
        "word": "die Relevanz",
        "translation": "relevansi",
        "article": "die",
        "exampleSentence": "Die Relevanz dieser Forschung ist unbestreitbar.",
        "phonetic": "dee re-le-VANTS",
        "level": "B2"
      },
      {
        "id": "v-gen-396",
        "word": "die Schlussfolgerung",
        "translation": "kesimpulan",
        "article": "die",
        "exampleSentence": "Die Schlussfolgerung basiert auf den vorliegenden Fakten.",
        "phonetic": "dee SHLUSS-fol-ge-rung",
        "level": "B2"
      },
      {
        "id": "v-gen-397",
        "word": "die Untersuchung",
        "translation": "penelitian, penyelidikan",
        "article": "die",
        "exampleSentence": "Die Untersuchung ergab unerwartete Ergebnisse.",
        "phonetic": "dee UN-ter-zu-chung",
        "level": "B2"
      },
      {
        "id": "v-gen-398",
        "word": "validieren",
        "translation": "memvalidasi",
        "exampleSentence": "Die Ergebnisse müssen noch validiert werden.",
        "phonetic": "va-li-DEE-ren",
        "level": "B2"
      },
      {
        "id": "v-gen-399",
        "word": "belegen",
        "translation": "membuktikan, mendokumentasikan",
        "exampleSentence": "Die Theorie konnte durch Experimente belegt werden.",
        "phonetic": "be-LAY-gen",
        "level": "B2"
      },
      {
        "id": "v-gen-400",
        "word": "erörtern",
        "translation": "membahas, mendiskusikan",
        "exampleSentence": "Im folgenden Kapitel wird die Problematik erörtert.",
        "phonetic": "er-ÖR-tern",
        "level": "B2"
      },
      {
        "id": "v-gen-401",
        "word": "darstellen",
        "translation": "menyajikan, menggambarkan",
        "exampleSentence": "Die Grafik stellt die Entwicklung der Zahlen dar.",
        "phonetic": "DAR-stel-len",
        "level": "B2"
      },
      {
        "id": "v-gen-402",
        "word": "hervorheben",
        "translation": "menyoroti, menekankan",
        "exampleSentence": "Es ist wichtig, die Hauptpunkte hervorzuheben.",
        "phonetic": "HER-for-hay-ben",
        "level": "B2"
      },
      {
        "id": "v-gen-403",
        "word": "die Fragestellung",
        "translation": "rumusan masalah",
        "article": "die",
        "exampleSentence": "Die Fragestellung der Arbeit ist klar definiert.",
        "phonetic": "dee FRA-ge-stel-lung",
        "level": "B2"
      },
      {
        "id": "v-gen-404",
        "word": "die Methodik",
        "translation": "metodologi",
        "article": "die",
        "exampleSentence": "Die Methodik der Studie wurde ausführlich beschrieben.",
        "phonetic": "dee me-TO-dik",
        "level": "B2"
      },
      {
        "id": "v-gen-405",
        "word": "die Datenbasis",
        "translation": "basis data",
        "article": "die",
        "exampleSentence": "Die Datenbasis für die Analyse war umfangreich.",
        "phonetic": "dee DA-ten-ba-zis",
        "level": "B2"
      },
      {
        "id": "v-gen-406",
        "word": "die Kausalität",
        "translation": "kausalitas",
        "article": "die",
        "exampleSentence": "Die Kausalität zwischen den Variablen wurde untersucht.",
        "phonetic": "dee kau-za-li-TÄT",
        "level": "B2"
      }
    ],
    "exercises": [
      {
        "question": "Manakah kalimat yang menunjukkan gaya penulisan ilmiah yang objektif?",
        "options": [
          "Ich denke, die Ergebnisse sind wichtig.",
          "Wir glauben, dass die Studie relevant ist.",
          "Es wird angenommen, dass die Ergebnisse von großer Bedeutung sind.",
          "Meiner Meinung nach ist die Forschung interessant."
        ],
        "correctAnswer": 2
      },
      {
        "question": "Ubah kalimat 'Man hat die Daten analysiert' menjadi bentuk nominalisasi.",
        "options": [
          "Die Datenanalyse wurde gemacht.",
          "Die Analyse der Daten wurde durchgeführt.",
          "Die Daten wurden analysiert.",
          "Man analysierte die Daten."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Pilih kalimat yang menggunakan Passiv untuk gaya ilmiah.",
        "options": [
          "Der Forscher präsentierte die Ergebnisse.",
          "Die Ergebnisse wurden vom Forscher präsentiert.",
          "Man präsentierte die Ergebnisse.",
          "Die Ergebnisse präsentierten sich."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa tujuan utama dari 'wissenschaftlicher Schreibstil'?",
        "options": [
          "Menghibur pembaca",
          "Menyampaikan opini pribadi",
          "Menyampaikan informasi secara objektif dan presisi",
          "Meyakinkan pembaca dengan emosi"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Manakah yang merupakan ciri khas 'wissenschaftlicher Schreibstil'?",
        "options": [
          "Penggunaan banyak kata seru",
          "Penggunaan bahasa sehari-hari",
          "Penggunaan kalimat kompleks dan nominalisasi",
          "Penggunaan pronomina 'ich' secara berlebihan"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa yang dimaksud dengan Nominalisierung dalam konteks penulisan ilmiah?",
        "options": [
          "Menggunakan kata kerja sebagai kata benda",
          "Menggunakan kata benda sebagai kata kerja",
          "Menggunakan adjektiva sebagai kata benda",
          "Menggunakan kata benda alih-alih kata kerja atau adjektiva"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Mengapa Passiv sering digunakan dalam penulisan ilmiah?",
        "options": [
          "Untuk membuat kalimat lebih pendek",
          "Untuk menekankan pelaku tindakan",
          "Untuk menekankan tindakan atau hasil, bukan pelaku",
          "Untuk membuat teks lebih menarik"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Ciri 'Objektivität' dalam penulisan ilmiah berarti...",
        "options": [
          "Penulis harus mengungkapkan perasaannya",
          "Penulis harus menghindari opini pribadi dan fokus pada fakta",
          "Penulis harus menggunakan banyak metafora",
          "Penulis harus membuat teks mudah dipahami oleh semua orang"
        ],
        "correctAnswer": 1
      }
    ],
    "dialogues": [
      {
        "personA": "Ich muss meinen Forschungsbericht fertigstellen. Ich finde den wissenschaftlichen Schreibstil so schwierig.",
        "personB": "Ja, besonders die Nominalisierung und die Passivkonstruktionen erfordern Übung. Aber es macht den Text präziser.",
        "translation": "A: Saya harus menyelesaikan laporan penelitian saya. Saya merasa gaya penulisan ilmiah sangat sulit.\nB: Ya, terutama nominalisasi dan konstruksi pasif membutuhkan latihan. Tapi itu membuat teks lebih presisi."
      },
      {
        "personA": "Soll ich 'Ich habe die Daten analysiert' schreiben?",
        "personB": "Besser wäre 'Die Analyse der Daten wurde durchgeführt', das klingt objektiver und wissenschaftlicher.",
        "translation": "A: Haruskah saya menulis 'Saya telah menganalisis data'?\nB: Lebih baik 'Analisis data telah dilakukan', itu terdengar lebih objektif dan ilmiah."
      },
      {
        "personA": "Wie vermeide ich persönliche Meinungen in meinem Text?",
        "personB": "Verwende Formulierungen wie 'Es wird angenommen, dass...' oder 'Es lässt sich schlussfolgern, dass...', anstatt 'Ich denke...' oder 'Meiner Meinung nach...'.",
        "translation": "A: Bagaimana cara saya menghindari opini pribadi dalam teks saya?\nB: Gunakan formulasi seperti 'Diperkirakan bahwa...' atau 'Dapat disimpulkan bahwa...', daripada 'Saya pikir...' atau 'Menurut pendapat saya...'."
      }
    ],
    "culturalNotes": "Di Jerman, penulisan ilmiah sangat dihargai dan diajarkan secara ketat di universitas. Kemampuan untuk menulis secara ilmiah adalah keterampilan dasar bagi mahasiswa dan peneliti. Presisi, objektivitas, dan struktur logis adalah nilai-nilai inti dalam budaya akademik Jerman. Plagiarisme dianggap pelanggaran serius."
  },
  {
    "id": "b2-5",
    "canDoGoals": [
      "Konjugasi lanjutan Konjunktiv I, sering dibaca di struktur koran dan surat kabar aktual",
      "Cara melaporkan berita dengan netral/apriori menjaga klaim kutipan secara objektif",
      "Ubah reportase dengan benar jika Konjunktiv I serupa dengan Präsens dengan lari ke Konjunktiv II"
    ],
    "level": "B2",
    "title": "Konjunktiv I (Indirekte Rede formal)",
    "grammarDescription": "Konjunktiv I (Subjunctive I) digunakan terutama untuk melaporkan ucapan atau pikiran orang lain secara tidak langsung (indirekte Rede), terutama dalam konteks formal seperti berita, laporan, atau artikel ilmiah. Tujuannya adalah untuk menjaga jarak dari pernyataan yang dilaporkan, menunjukkan bahwa itu adalah pernyataan orang lain dan bukan fakta yang dijamin oleh penulis.\n\n**Pembentukan Konjunktiv I:**\nKonjunktiv I dibentuk dari akar infinitif kata kerja. Untuk sebagian besar kata kerja, bentuk Konjunktiv I sama dengan bentuk Indikativ Präsens, kecuali untuk orang ketiga tunggal (er/sie/es) dan beberapa kata kerja kuat.\n\n*   **Regelmäßige Verben (Kata Kerja Beraturan):**\n    *   `ich mache` -> `ich mache`\n    *   `du machst` -> `du machest`\n    *   `er/sie/es macht` -> `er/sie/es mache` (Perbedaan utama!)\n    *   `wir machen` -> `wir machen`\n    *   `ihr macht` -> `ihr machet`\n    *   `sie/Sie machen` -> `sie/Sie machen`\n\n*   **Unregelmäßige Verben (Kata Kerja Tidak Beraturan):**\n    *   `sein`: `ich sei, du seiest, er/sie/es sei, wir seien, ihr seiet, sie/Sie seien`\n    *   `haben`: `ich habe, du habest, er/sie/es habe, wir haben, ihr habet, sie/Sie haben`\n    *   `werden`: `ich werde, du werdest, er/sie/es werde, wir werden, ihr werdet, sie/Sie werden`\n\n**Kapan Menggunakan Konjunktiv I?**\n1.  **Indirekte Rede (Laporan Tidak Langsung):** Ketika melaporkan apa yang dikatakan, dipikirkan, atau diyakini orang lain.\n    *   Contoh: `Er sagt, er sei müde.` (Dia bilang dia lelah.)\n    *   Contoh: `Die Regierung erklärte, die Maßnahmen seien notwendig.` (Pemerintah menyatakan bahwa langkah-langkah itu diperlukan.)\n\n**Penggantian dengan Konjunktiv II:**\nJika bentuk Konjunktiv I identik dengan bentuk Indikativ Präsens (terutama untuk 'wir' dan 'sie/Sie', dan seringkali 'ich'), maka Konjunktiv II digunakan sebagai pengganti untuk menghindari ambiguitas. Ini sering terjadi pada kata kerja beraturan.\n\n*   Contoh: `Sie sagen, sie kommen.` (Indikativ) -> `Sie sagen, sie kämen.` (Konjunktiv II sebagai pengganti Konjunktiv I yang identik) atau `Sie sagen, sie würden kommen.` (Konjunktiv II dengan 'würden').\n\n**Penting:** Konjunktiv I tidak menyatakan keraguan terhadap kebenaran pernyataan, melainkan hanya menunjukkan bahwa itu adalah laporan dari pihak ketiga.",
    "sentenceBreakdowns": [
      "Der (artikel) + Sprecher (subjek) + betonte (verb), + dass (konjungsi) + die (artikel) + Lage (subjek) + sich (pronomina refleksif) + verbessere (Konjunktiv I).",
      "Sie (subjek) + behauptete (verb), + sie (subjek) + habe (Konjunktiv I) + die (artikel) + Aufgabe (objek Akkusativ) + bereits (adverb) + erledigt (Partizip II).",
      "Es (pronomina impersonal) + wurde (verb bantu) + mitgeteilt (Partizip II), + dass (konjungsi) + die (artikel) + Verhandlungen (subjek) + fortgesetzt (Partizip II) + würden (Konjunktiv II sebagai pengganti Konjunktiv I yang identik).",
      "Der (artikel) + Arzt (subjek) + riet (verb), + man (pronomina impersonal) + solle (Konjunktiv I dari 'sollen') + mehr (adverb) + Wasser (objek Akkusativ) + trinken (infinitif).",
      "Die (artikel) + Zeitung (subjek) + berichtete (verb), + der (artikel) + Präsident (subjek) + sei (Konjunktiv I dari 'sein') + zu (preposisi) +verschiedenen (adjektiva) + Treffen (kata benda) + gereist (Partizip II)."
    ],
    "pronunciationTips": "Bentuk Konjunktiv I seringkali terdengar sangat mirip dengan Indikativ. Perhatikan konteks kalimat dan intonasi yang lebih netral saat melaporkan. Untuk bentuk 'er/sie/es' yang berakhiran '-e' (misalnya 'mache', 'komme'), pastikan untuk mengucapkan '-e' dengan jelas, tidak seperti akhiran '-e' yang sering dihilangkan dalam bahasa lisan.",
    "vocabulary": [
      {
        "id": "v-gen-407",
        "word": "sei",
        "translation": "adalah (Konjunktiv I dari 'sein')",
        "exampleSentence": "Er sagte, er sei müde.",
        "phonetic": "ZAY",
        "level": "B2"
      },
      {
        "id": "v-gen-408",
        "word": "habe",
        "translation": "memiliki (Konjunktiv I dari 'haben')",
        "exampleSentence": "Sie meinte, sie habe keine Zeit.",
        "phonetic": "HA-be",
        "level": "B2"
      },
      {
        "id": "v-gen-409",
        "word": "werde",
        "translation": "akan (Konjunktiv I dari 'werden')",
        "exampleSentence": "Er versprach, er werde pünktlich sein.",
        "phonetic": "VER-de",
        "level": "B2"
      },
      {
        "id": "v-gen-410",
        "word": "komme",
        "translation": "datang (Konjunktiv I dari 'kommen')",
        "exampleSentence": "Sie sagte, sie komme morgen.",
        "phonetic": "KOM-me",
        "level": "B2"
      },
      {
        "id": "v-gen-411",
        "word": "gehe",
        "translation": "pergi (Konjunktiv I dari 'gehen')",
        "exampleSentence": "Er erklärte, er gehe jetzt nach Hause.",
        "phonetic": "GAY-e",
        "level": "B2"
      },
      {
        "id": "v-gen-412",
        "word": "mache",
        "translation": "melakukan (Konjunktiv I dari 'machen')",
        "exampleSentence": "Sie betonte, sie mache ihre Arbeit sorgfältig.",
        "phonetic": "MA-che",
        "level": "B2"
      },
      {
        "id": "v-gen-413",
        "word": "solle",
        "translation": "seharusnya (Konjunktiv I dari 'sollen')",
        "exampleSentence": "Der Arzt riet, man solle sich ausruhen.",
        "phonetic": "ZOL-le",
        "level": "B2"
      },
      {
        "id": "v-gen-414",
        "word": "wolle",
        "translation": "ingin (Konjunktiv I dari 'wollen')",
        "exampleSentence": "Er sagte, er wolle das Projekt beenden.",
        "phonetic": "VOL-le",
        "level": "B2"
      },
      {
        "id": "v-gen-415",
        "word": "könne",
        "translation": "bisa (Konjunktiv I dari 'können')",
        "exampleSentence": "Sie meinte, sie könne ihm helfen.",
        "phonetic": "KÖN-ne",
        "level": "B2"
      },
      {
        "id": "v-gen-416",
        "word": "müsse",
        "translation": "harus (Konjunktiv I dari 'müssen')",
        "exampleSentence": "Er erklärte, er müsse jetzt gehen.",
        "phonetic": "MÜS-se",
        "level": "B2"
      },
      {
        "id": "v-gen-417",
        "word": "dürfe",
        "translation": "boleh (Konjunktiv I dari 'dürfen')",
        "exampleSentence": "Sie fragte, ob sie dürfe.",
        "phonetic": "DÜR-fe",
        "level": "B2"
      },
      {
        "id": "v-gen-418",
        "word": "die Meldung",
        "translation": "berita, laporan",
        "article": "die",
        "exampleSentence": "Die Meldung besagt, dass die Preise steigen.",
        "phonetic": "dee MEL-dung",
        "level": "B2"
      },
      {
        "id": "v-gen-419",
        "word": "die Erklärung",
        "translation": "pernyataan, penjelasan",
        "article": "die",
        "exampleSentence": "Die Erklärung des Ministers wurde veröffentlicht.",
        "phonetic": "dee er-KLÄ-rung",
        "level": "B2"
      },
      {
        "id": "v-gen-420",
        "word": "die Behauptung",
        "translation": "klaim, pernyataan",
        "article": "die",
        "exampleSentence": "Seine Behauptung, er sei unschuldig, wurde nicht geglaubt.",
        "phonetic": "dee be-HAUP-tung",
        "level": "B2"
      },
      {
        "id": "v-gen-421",
        "word": "berichten",
        "translation": "melaporkan",
        "exampleSentence": "Die Medien berichten, dass die Situation sich verbessere.",
        "phonetic": "be-RICH-ten",
        "level": "B2"
      }
    ],
    "exercises": [
      {
        "question": "Ubah kalimat langsung menjadi tidak langsung dengan Konjunktiv I: 'Er sagt: 'Ich bin müde.''",
        "options": [
          "Er sagt, er sei müde.",
          "Er sagt, er wäre müde.",
          "Er sagt, er ist müde.",
          "Er sagt, er wird müde."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ubah kalimat langsung menjadi tidak langsung dengan Konjunktiv I: 'Sie behauptet: 'Ich habe keine Zeit.''",
        "options": [
          "Sie behauptet, sie hätte keine Zeit.",
          "Sie behauptet, sie hat keine Zeit.",
          "Sie behauptet, sie habe keine Zeit.",
          "Sie behauptet, sie würde keine Zeit haben."
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih bentuk Konjunktiv I yang benar untuk 'er kommt'.",
        "options": [
          "er komme",
          "er käme",
          "er kommt",
          "er würde kommen"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kapan Konjunktiv II digunakan sebagai pengganti Konjunktiv I dalam Indirekte Rede?",
        "options": [
          "Ketika Konjunktiv I dan Indikativ Präsens berbeda",
          "Ketika Konjunktiv I dan Indikativ Präsens identik",
          "Hanya untuk kata kerja 'sein'",
          "Tidak pernah"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Manakah kalimat yang menggunakan Konjunktiv I dengan benar?",
        "options": [
          "Der Lehrer sagte, die Schüler lernen fleißig.",
          "Der Lehrer sagte, die Schüler lernten fleißig.",
          "Der Lehrer sagte, die Schüler lernen fleißig.",
          "Der Lehrer sagte, die Schüler lernen fleißig."
        ],
        "correctAnswer": 1
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa fungsi utama Konjunktiv I?",
        "options": [
          "Menyatakan keinginan",
          "Melaporkan ucapan atau pikiran orang lain secara tidak langsung",
          "Menyatakan kondisi yang tidak mungkin",
          "Menyatakan perintah"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Dalam konteks apa Konjunktiv I sering digunakan?",
        "options": [
          "Percakapan sehari-hari yang santai",
          "Berita, laporan, dan artikel ilmiah",
          "Puisi dan lagu",
          "Instruksi manual"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Jika bentuk Konjunktiv I identik dengan Indikativ Präsens, apa yang biasanya digunakan sebagai pengganti?",
        "options": [
          "Indikativ Präteritum",
          "Konjunktiv II",
          "Infinitif",
          "Imperativ"
        ],
        "correctAnswer": 1
      }
    ],
    "dialogues": [
      {
        "personA": "Hast du die Nachrichten gehört?",
        "personB": "Ja, es wurde berichtet, der Präsident sei zu einem Gipfel gereist.",
        "translation": "A: Apakah kamu mendengar berita?\nB: Ya, dilaporkan bahwa presiden telah pergi ke sebuah KTT."
      },
      {
        "personA": "Was hat der Professor gesagt?",
        "personB": "Er sagte, die Prüfung finde nächste Woche statt.",
        "translation": "A: Apa yang dikatakan profesor?\nB: Dia bilang ujian akan diadakan minggu depan."
      },
      {
        "personA": "Warum ist Anna nicht hier?",
        "personB": "Sie meinte, sie habe noch viel zu tun und komme später.",
        "translation": "A: Kenapa Anna tidak di sini?\nB: Dia bilang dia masih banyak pekerjaan dan akan datang nanti."
      }
    ],
    "culturalNotes": "Penggunaan Konjunktiv I dalam 'indirekte Rede' adalah tanda kemahiran berbahasa Jerman yang tinggi, terutama dalam konteks formal. Ini menunjukkan kemampuan untuk membedakan antara fakta yang dijamin dan informasi yang dilaporkan. Dalam jurnalisme Jerman, penggunaan Konjunktiv I sangat penting untuk menjaga objektivitas dan menghindari kesan bahwa reporter mengklaim kebenaran dari pernyataan yang dilaporkan."
  },
  {
    "id": "b2-6",
    "canDoGoals": [
      "Mengurai labirin anak kalimat dalam jerman, alias 'Schachtelsätze' (Struktur Kalimat Boks)",
      "Menavigasi artikel yang menggabungkan banyak Nebensätze dengan konjungsi berlapis-lapis",
      "Meningkatkan reading comprehension pada struktur bahasa Jerman kelas literasi korporat"
    ],
    "level": "B2",
    "title": "Komplexe Satzstrukturen",
    "grammarDescription": "Komplexe Satzstrukturen (struktur kalimat kompleks) adalah inti dari kemampuan berbahasa tingkat B2 dan lebih tinggi. Ini melibatkan penggabungan beberapa klausa (Hauptsätze dan Nebensätze) untuk mengekspresikan ide-ide yang rumit, hubungan logis, dan nuansa makna. Menguasai ini memungkinkan Anda untuk berbicara dan menulis dengan lebih presisi dan koheren.\n\n**Jenis Klausa yang Sering Digunakan:**\n1.  **Nebensätze (Anak Kalimat):** Klausa yang tidak bisa berdiri sendiri dan biasanya diawali oleh konjungsi subordinatif atau pronomina relatif. Kata kerja terkonjugasi berada di akhir anak kalimat.\n    *   **Temporalsätze (Waktu):** `als, wenn, während, seit, bevor, nachdem, sobald, bis`\n        *   Contoh: `Nachdem er gegessen hatte, ging er spazieren.`\n    *   **Kausalsätze (Sebab):** `weil, da, zumal`\n        *   Contoh: `Er blieb zu Hause, weil er krank war.`\n    *   **Konzessivsätze (Konsesi/Meskipun):** `obwohl, obgleich, wenngleich`\n        *   Contoh: `Obwohl es regnete, gingen wir spazieren.`\n    *   **Konditionalsätze (Syarat):** `wenn, falls, sofern`\n        *   Contoh: `Wenn du Zeit hast, besuchen wir das Museum.`\n    *   **Finalsätze (Tujuan):** `damit, um...zu`\n        *   Contoh: `Ich lerne Deutsch, damit ich in Deutschland studieren kann.`\n    *   **Konsekutivsätze (Akibat):** `sodass, so...dass`\n        *   Contoh: `Er war so müde, dass er sofort einschlief.`\n    *   **Modalsätze (Cara):** `indem, ohne dass, anstatt dass`\n        *   Contoh: `Man lernt, indem man übt.`\n\n2.  **Konjunktionen Koordinatif (Kata Sambung Koordinatif):** Menghubungkan klausa utama atau bagian kalimat yang setara. Kata kerja tetap pada posisi kedua.\n    *   `und, aber, oder, denn, sondern`\n\n3.  **Konjunktionaladverbien (Adverbial Konjungtif):** Menghubungkan dua kalimat utama atau klausa utama, menunjukkan hubungan logis. Kata kerja tetap pada posisi kedua setelah adverbial.\n    *   `deshalb, darum, deswegen, trotzdem, außerdem, folglich, demnach, einerseits...andererseits`\n        *   Contoh: `Es regnete stark; trotzdem gingen wir hinaus.`\n\n**Penting:** Perhatikan posisi kata kerja di setiap jenis klausa. Dalam Nebensatz, kata kerja terkonjugasi selalu di akhir. Dalam Hauptsatz, kata kerja terkonjugasi selalu di posisi kedua.",
    "sentenceBreakdowns": [
      "Obwohl (konjungsi subordinatif) + das (artikel) + Wetter (subjek) + schlecht (adjektiva) + war (verb), + haben (verb bantu) + wir (subjek) + uns (pronomina refleksif) + entschieden (Partizip II), + einen (artikel) + Ausflug (objek Akkusativ) + zu (preposisi) + machen (infinitif).",
      "Nachdem (konjungsi subordinatif) + die (artikel) + Besprechung (subjek) + beendet (Partizip II) + war (verb), + gingen (verb) + alle (pronomina) + Teilnehmer (subjek) + nach (preposisi) + Hause (kata benda).",
      "Er (subjek) + lernt (verb) + Deutsch (objek Akkusativ) + intensiv (adverb), + damit (konjungsi subordinatif) + er (subjek) + in (preposisi) + Deutschland (kata benda) + studieren (infinitif) + kann (Modalverb).",
      "Die (artikel) + Ergebnisse (subjek) + waren (verb) + so (adverb) + überraschend (adjektiva), + dass (konjungsi subordinatif) + eine (artikel) + weitere (adjektiva) + Untersuchung (kata benda) + notwendig (adjektiva) + ist (verb).",
      "Einerseits (konjunktionaladverb) + ist (verb) + die (artikel) + Technologie (subjek) + sehr (adverb) + nützlich (adjektiva); + andererseits (konjunktionaladverb) + birgt (verb) + sie (subjek) + auch (adverb) + Risiken (objek Akkusativ)."
    ],
    "pronunciationTips": "Dalam kalimat kompleks, intonasi seringkali naik di akhir anak kalimat dan kemudian turun di akhir kalimat utama. Latih jeda yang tepat di antara klausa untuk membantu pemahaman. Contoh: 'Obwohl es regnete, (jeda) gingen wir spazieren.'",
    "vocabulary": [
      {
        "id": "v-gen-422",
        "word": "obwohl",
        "translation": "meskipun",
        "exampleSentence": "Obwohl es regnete, gingen wir spazieren.",
        "phonetic": "OP-vol",
        "level": "B2"
      },
      {
        "id": "v-gen-423",
        "word": "nachdem",
        "translation": "setelah",
        "exampleSentence": "Nachdem er gegessen hatte, ging er ins Bett.",
        "phonetic": "NACH-dem",
        "level": "B2"
      },
      {
        "id": "v-gen-424",
        "word": "damit",
        "translation": "agar, supaya",
        "exampleSentence": "Ich lerne Deutsch, damit ich in Deutschland studieren kann.",
        "phonetic": "DA-mit",
        "level": "B2"
      },
      {
        "id": "v-gen-425",
        "word": "sodass",
        "translation": "sehingga",
        "exampleSentence": "Er war so müde, sodass er sofort einschlief.",
        "phonetic": "zo-DASS",
        "level": "B2"
      },
      {
        "id": "v-gen-426",
        "word": "indem",
        "translation": "dengan cara",
        "exampleSentence": "Man lernt, indem man übt.",
        "phonetic": "in-DEM",
        "level": "B2"
      },
      {
        "id": "v-gen-427",
        "word": "deshalb",
        "translation": "oleh karena itu",
        "exampleSentence": "Es regnete stark, deshalb blieben wir zu Hause.",
        "phonetic": "DES-halp",
        "level": "B2"
      },
      {
        "id": "v-gen-428",
        "word": "trotzdem",
        "translation": "meskipun demikian",
        "exampleSentence": "Er war krank, trotzdem ging er zur Arbeit.",
        "phonetic": "TROTST-dem",
        "level": "B2"
      },
      {
        "id": "v-gen-429",
        "word": "außerdem",
        "translation": "selain itu",
        "exampleSentence": "Ich mag Kaffee, außerdem trinke ich gerne Tee.",
        "phonetic": "AUS-ser-dem",
        "level": "B2"
      },
      {
        "id": "v-gen-430",
        "word": "einerseits...andererseits",
        "translation": "di satu sisi...di sisi lain",
        "exampleSentence": "Einerseits ist es teuer, andererseits ist es sehr gut.",
        "phonetic": "EYE-ner-zyts...AN-de-rer-zyts",
        "level": "B2"
      },
      {
        "id": "v-gen-431",
        "word": "während",
        "translation": "selama, sementara",
        "exampleSentence": "Während sie kochte, las er ein Buch.",
        "phonetic": "VAY-rent",
        "level": "B2"
      },
      {
        "id": "v-gen-432",
        "word": "bevor",
        "translation": "sebelum",
        "exampleSentence": "Bevor er ging, verabschiedete er sich.",
        "phonetic": "be-FOR",
        "level": "B2"
      },
      {
        "id": "v-gen-433",
        "word": "falls",
        "translation": "jika, seandainya",
        "exampleSentence": "Falls du Fragen hast, ruf mich an.",
        "phonetic": "FALS",
        "level": "B2"
      },
      {
        "id": "v-gen-434",
        "word": "die Besprechung",
        "translation": "rapat, pertemuan",
        "article": "die",
        "exampleSentence": "Nachdem die Besprechung beendet war, gingen alle nach Hause.",
        "phonetic": "dee be-SHPRE-chung",
        "level": "B2"
      },
      {
        "id": "v-gen-435",
        "word": "der Ausflug",
        "translation": "piknik, tamasya",
        "article": "der",
        "exampleSentence": "Wir haben uns entschieden, einen Ausflug zu machen.",
        "phonetic": "der AUS-floog",
        "level": "B2"
      },
      {
        "id": "v-gen-436",
        "word": "das Risiko",
        "translation": "risiko",
        "article": "das",
        "exampleSentence": "Die Technologie birgt auch Risiken.",
        "phonetic": "das REE-zi-ko",
        "level": "B2"
      }
    ],
    "exercises": [
      {
        "question": "Pilih konjungsi yang tepat: '______ es regnete, gingen wir spazieren.' (konsesi)",
        "options": [
          "Weil",
          "Obwohl",
          "Damit",
          "Nachdem"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Pilih konjungsi yang tepat: 'Er lernt Deutsch, ______ er in Deutschland studieren kann.' (tujuan)",
        "options": [
          "Weil",
          "Obwohl",
          "Damit",
          "Sodass"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih konjungsi yang tepat: '______ er gegessen hatte, ging er ins Bett.' (waktu)",
        "options": [
          "Bevor",
          "Während",
          "Nachdem",
          "Als"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Manakah kalimat yang menggunakan Konjunktionaladverb dengan benar?",
        "options": [
          "Es regnete stark, deshalb wir blieben zu Hause.",
          "Es regnete stark, deshalb blieben wir zu Hause.",
          "Es regnete stark, wir blieben deshalb zu Hause.",
          "Es regnete stark, wir blieben zu Hause deshalb."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Dalam sebuah Nebensatz, di mana posisi kata kerja terkonjugasi?",
        "options": [
          "Posisi kedua",
          "Posisi pertama",
          "Di akhir kalimat",
          "Setelah subjek"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa perbedaan utama antara Konjunktion subordinatif dan Konjunktion koordinatif?",
        "options": [
          "Konjunktion subordinatif menghubungkan klausa utama, koordinatif menghubungkan anak kalimat.",
          "Konjunktion subordinatif menempatkan kata kerja di akhir, koordinatif menempatkan kata kerja di posisi kedua.",
          "Konjunktion subordinatif hanya untuk waktu, koordinatif untuk sebab.",
          "Tidak ada perbedaan."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Konjunktionaladverbien seperti 'deshalb' atau 'trotzdem' biasanya menempatkan kata kerja di posisi...",
        "options": [
          "Pertama",
          "Kedua",
          "Akhir",
          "Setelah subjek"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Kalimat 'Ich lerne Deutsch, um in Deutschland studieren zu können.' adalah contoh dari...",
        "options": [
          "Kausalsatz",
          "Konditionalsatz",
          "Finalsatz",
          "Temporalsatz"
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Ich verstehe nicht, warum er so reagiert hat.",
        "personB": "Nun, nachdem er die schlechte Nachricht erhalten hatte, war er sehr enttäuscht, sodass seine Reaktion verständlich ist.",
        "translation": "A: Saya tidak mengerti mengapa dia bereaksi seperti itu.\nB: Yah, setelah dia menerima kabar buruk, dia sangat kecewa, sehingga reaksinya bisa dimengerti."
      },
      {
        "personA": "Sollen wir heute Abend ins Kino gehen?",
        "personB": "Obwohl ich müde bin, würde ich gerne mitkommen, falls es ein guter Film ist.",
        "translation": "A: Haruskah kita pergi ke bioskop malam ini?\nB: Meskipun saya lelah, saya ingin ikut, jika itu film yang bagus."
      },
      {
        "personA": "Wie hast du so schnell Deutsch gelernt?",
        "personB": "Ich habe jeden Tag geübt, indem ich viel gelesen und gesprochen habe, damit ich meine Sprachkenntnisse verbessern konnte.",
        "translation": "A: Bagaimana kamu belajar bahasa Jerman begitu cepat?\nB: Saya berlatih setiap hari dengan banyak membaca dan berbicara, agar saya bisa meningkatkan kemampuan bahasa saya."
      }
    ],
    "culturalNotes": "Kemampuan untuk membangun kalimat kompleks adalah indikator penting dari kefasihan berbahasa Jerman. Dalam diskusi formal, debat, atau presentasi, penggunaan struktur kalimat yang bervariasi dan tepat sangat dihargai. Ini mencerminkan kemampuan berpikir logis dan mengekspresikan ide-ide yang bernuansa. Latihan aktif dalam menggabungkan klausa adalah kunci untuk menguasai aspek ini."
  },
  {
    "id": "b2-checkpoint-2",
    "canDoGoals": [
      "Replik jurnalistik untuk konjunktiv I / reportase murni tak bias",
      "Latihan menelaah artikel bacaan / komprehensi kalimat tak menentu (Schachtelsätze)"
    ],
    "title": "Review Konten Sebelumnya",
    "requiredScore": 0.7,
    "questions": [
      {
        "question": "Manakah kalimat yang menunjukkan gaya penulisan ilmiah yang objektif?",
        "options": [
          "Ich finde die Studie sehr interessant.",
          "Es wird angenommen, dass die Studie wichtige Erkenntnisse liefert.",
          "Meiner Meinung nach ist die Forschung bahnbrechend.",
          "Wir sind überzeugt, dass die Ergebnisse stimmen."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Ubah kalimat 'Man hat die Ergebnisse präsentiert' menjadi bentuk nominalisasi dan pasif.",
        "options": [
          "Die Präsentation der Ergebnisse wurde durchgeführt.",
          "Die Ergebnisse wurden präsentiert.",
          "Man präsentierte die Ergebnisse.",
          "Die Ergebnisse präsentierten sich."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Apa fungsi utama Konjunktiv I dalam 'indirekte Rede'?",
        "options": [
          "Menyatakan keraguan",
          "Menyatakan perintah",
          "Melaporkan pernyataan pihak ketiga tanpa menjamin kebenarannya",
          "Menyatakan keinginan"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Ubah kalimat langsung menjadi tidak langsung dengan Konjunktiv I: 'Sie sagt: 'Ich gehe jetzt nach Hause.''",
        "options": [
          "Sie sagt, sie ginge jetzt nach Hause.",
          "Sie sagt, sie geht jetzt nach Hause.",
          "Sie sagt, sie gehe jetzt nach Hause.",
          "Sie sagt, sie würde jetzt nach Hause gehen."
        ],
        "correctAnswer": 2
      },
      {
        "question": "Jika bentuk Konjunktiv I dari 'wir kommen' adalah 'wir kommen', apa yang digunakan sebagai pengganti dalam 'indirekte Rede'?",
        "options": [
          "wir kämen",
          "wir kommen",
          "wir würden kommen",
          "A atau C"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Pilih konjungsi yang tepat: '______ er krank war, blieb er zu Hause.' (sebab)",
        "options": [
          "Obwohl",
          "Damit",
          "Weil",
          "Nachdem"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih konjungsi yang tepat: 'Ich spare Geld, ______ ich mir ein neues Auto kaufen kann.' (tujuan)",
        "options": [
          "sodass",
          "damit",
          "indem",
          "während"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Manakah kalimat yang menggunakan Konjunktionaladverb dengan benar?",
        "options": [
          "Es war kalt; trotzdem wir gingen spazieren.",
          "Es war kalt; wir gingen trotzdem spazieren.",
          "Es war kalt; trotzdem gingen wir spazieren.",
          "Es war kalt; wir trotzdem gingen spazieren."
        ],
        "correctAnswer": 2
      },
      {
        "question": "Dalam kalimat 'Die Durchführung des Projekts war erfolgreich.', 'Durchführung' adalah contoh dari...",
        "options": [
          "Kata kerja",
          "Adjektiva",
          "Nominalisasi",
          "Partizip"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa yang dimaksud dengan 'Komplexe Satzstrukturen'?",
        "options": [
          "Kalimat yang sangat panjang",
          "Kalimat dengan banyak tanda baca",
          "Penggabungan beberapa klausa untuk mengekspresikan ide rumit",
          "Kalimat yang sulit dipahami"
        ],
        "correctAnswer": 2
      }
    ],
    "reviewLessons": [
      "b2-4",
      "b2-5",
      "b2-6"
    ]
  },
  {
    "id": "b2-7",
    "canDoGoals": [
      "Pengenalan dan latihan Idiome dan Redewendungen populer dalam kehidupan kantor atau kultural Eropa di Jerman",
      "Ubah pengucapan harfiah menjadi kiasan bermakna setara native speaker",
      "Terhindar dari kebingungan terjemahan harfiah"
    ],
    "level": "B2",
    "title": "Idiome & Redewendungen",
    "grammarDescription": "Idiome (Idioms) dan Redewendungen (Frasa idiomatik) adalah ekspresi yang maknanya tidak dapat dipahami hanya dari arti harfiah kata-kata individualnya. Mereka adalah bagian integral dari bahasa sehari-hari dan seringkali mencerminkan budaya serta cara berpikir penutur asli. Menguasai idiome akan membuat bahasa Jerman Anda terdengar lebih alami dan fasih.\n\n**Karakteristik Idiome:**\n1.  **Makna Non-Literal:** Arti keseluruhan frasa berbeda dari arti harfiah setiap kata.\n    *   Contoh: 'jemandem die Daumen drücken' (menekan jempol seseorang) sebenarnya berarti 'mendoakan keberuntungan'.\n2.  **Tetap dan Tidak Berubah:** Struktur idiome biasanya tetap dan tidak dapat diubah-ubah (misalnya, tidak bisa mengganti kata atau urutan kata).\n3.  **Konteks Penting:** Pemahaman idiome sangat bergantung pada konteks penggunaannya.\n\n**Beberapa Kategori Idiome Umum:**\n*   **Tentang Perasaan:** 'die Nase voll haben' (muak), 'auf Wolke sieben schweben' (melayang di awan ketujuh - sangat bahagia).\n*   **Tentang Situasi:** 'ins kalte Wasser springen' (melompat ke air dingin - memulai sesuatu tanpa persiapan), 'den Faden verlieren' (kehilangan benang - lupa apa yang ingin dikatakan).\n*   **Tentang Orang:** 'zwei linke Hände haben' (memiliki dua tangan kiri - canggung), 'ein offenes Ohr haben' (memiliki telinga terbuka - bersedia mendengarkan).\n\n**Tips Belajar Idiome:**\n*   Jangan mencoba menerjemahkan kata per kata. Pelajari idiome sebagai satu kesatuan makna.\n*   Perhatikan konteks penggunaannya. Cari contoh kalimat.\n*   Gunakan kartu flash atau aplikasi khusus idiome.\n*   Dengarkan penutur asli dan perhatikan bagaimana mereka menggunakan idiome.",
    "sentenceBreakdowns": [
      "Ich (subjek) + habe (verb) + die (artikel) + Nase (kata benda) + voll (adjektiva) + von (preposisi) + dieser (pronomina demonstratif) + Situation (kata benda). (Idiom: die Nase voll haben)",
      "Wir (subjek) + müssen (Modalverb) + jetzt (adverb) + ins (preposisi + artikel) + kalte (adjektiva) + Wasser (kata benda) + springen (infinitif). (Idiom: ins kalte Wasser springen)",
      "Er (subjek) + drückt (verb) + mir (objek Dativ) + die (artikel) + Daumen (kata benda) + für (preposisi) + die (artikel) + Prüfung (kata benda). (Idiom: jemandem die Daumen drücken)",
      "Sie (subjek) + hat (verb) + immer (adverb) + ein (artikel) + offenes (adjektiva) + Ohr (kata benda) + für (preposisi) + ihre (pronomina posesif) + Freunde (kata benda). (Idiom: ein offenes Ohr haben)",
      "Ich (subjek) + habe (verb) + den (artikel) + Faden (kata benda) + verloren (Partizip II). (Idiom: den Faden verlieren)"
    ],
    "pronunciationTips": "Idiome sering diucapkan dengan aliran yang natural dan penekanan pada kata-kata kunci dalam frasa. Latih pengucapan seluruh frasa, bukan kata per kata, untuk mendapatkan intonasi yang benar. Contoh: 'die Nase voll haben' [dee NA-ze fol HA-ben], bukan [dee NA-ze FOL ha-ben].",
    "vocabulary": [
      {
        "id": "v-gen-437",
        "word": "jemandem die Daumen drücken",
        "translation": "mendoakan keberuntungan",
        "exampleSentence": "Ich drücke dir die Daumen für deine Prüfung!",
        "phonetic": "YE-man-dem dee DAU-men DRÜK-ken",
        "level": "B2"
      },
      {
        "id": "v-gen-438",
        "word": "die Nase voll haben",
        "translation": "muak, bosan",
        "exampleSentence": "Ich habe die Nase voll von dieser ewigen Diskussion.",
        "phonetic": "dee NA-ze fol HA-ben",
        "level": "B2"
      },
      {
        "id": "v-gen-439",
        "word": "ins kalte Wasser springen",
        "translation": "memulai sesuatu tanpa persiapan",
        "exampleSentence": "Er musste ins kalte Wasser springen, als er den Job bekam.",
        "phonetic": "ins KAL-te VAS-ser SHPRING-en",
        "level": "B2"
      },
      {
        "id": "v-gen-440",
        "word": "den Faden verlieren",
        "translation": "kehilangan jejak pembicaraan",
        "exampleSentence": "Entschuldigung, ich habe den Faden verloren.",
        "phonetic": "den FA-den fer-LEE-ren",
        "level": "B2"
      },
      {
        "id": "v-gen-441",
        "word": "ein offenes Ohr haben",
        "translation": "bersedia mendengarkan",
        "exampleSentence": "Du kannst immer zu mir kommen, ich habe ein offenes Ohr für dich.",
        "phonetic": "eyn OF-fe-nes OR HA-ben",
        "level": "B2"
      },
      {
        "id": "v-gen-442",
        "word": "zwei linke Hände haben",
        "translation": "canggung, tidak terampil",
        "exampleSentence": "Ich habe zwei linke Hände, wenn es ums Reparieren geht.",
        "phonetic": "tsvye LING-ke HEN-de HA-ben",
        "level": "B2"
      },
      {
        "id": "v-gen-443",
        "word": "auf Wolke sieben schweben",
        "translation": "sangat bahagia, jatuh cinta",
        "exampleSentence": "Seit sie verliebt ist, schwebt sie auf Wolke sieben.",
        "phonetic": "auf VOL-ke ZEE-ben SHVAY-ben",
        "level": "B2"
      },
      {
        "id": "v-gen-444",
        "word": "etwas auf die lange Bank schieben",
        "translation": "menunda sesuatu",
        "exampleSentence": "Er schiebt die Arbeit immer auf die lange Bank.",
        "phonetic": "ET-vas auf dee LANG-e BANK SHEE-ben",
        "level": "B2"
      },
      {
        "id": "v-gen-445",
        "word": "den Nagel auf den Kopf treffen",
        "translation": "tepat sasaran, mengatakan hal yang benar",
        "exampleSentence": "Mit dieser Aussage hast du den Nagel auf den Kopf getroffen.",
        "phonetic": "den NA-gel auf den KOPF TREF-fen",
        "level": "B2"
      },
      {
        "id": "v-gen-446",
        "word": "Butter bei die Fische!",
        "translation": "Langsung ke intinya! (informal)",
        "exampleSentence": "Komm, Butter bei die Fische! Was ist passiert?",
        "phonetic": "BUT-ter by dee FI-she",
        "level": "B2"
      },
      {
        "id": "v-gen-447",
        "word": "ein Stein vom Herzen fallen",
        "translation": "lega sekali (batu jatuh dari hati)",
        "exampleSentence": "Als ich die Nachricht hörte, fiel mir ein Stein vom Herzen.",
        "phonetic": "eyn SHTAYN fom HER-tsen FAL-len",
        "level": "B2"
      },
      {
        "id": "v-gen-448",
        "word": "jemandem einen Bären aufbinden",
        "translation": "membual, berbohong",
        "exampleSentence": "Glaub ihm nicht, er will dir nur einen Bären aufbinden.",
        "phonetic": "YE-man-dem EY-nen BÄ-ren auf-BIN-den",
        "level": "B2"
      },
      {
        "id": "v-gen-449",
        "word": "die Prüfung",
        "translation": "ujian",
        "article": "die",
        "exampleSentence": "Ich drücke dir die Daumen für die Prüfung.",
        "phonetic": "dee PRÜ-fung",
        "level": "B2"
      },
      {
        "id": "v-gen-450",
        "word": "die Diskussion",
        "translation": "diskusi",
        "article": "die",
        "exampleSentence": "Ich habe die Nase voll von dieser Diskussion.",
        "phonetic": "dee dis-ku-TSYON",
        "level": "B2"
      },
      {
        "id": "v-gen-451",
        "word": "der Job",
        "translation": "pekerjaan",
        "article": "der",
        "exampleSentence": "Er musste ins kalte Wasser springen, als er den Job bekam.",
        "phonetic": "der JOP",
        "level": "B2"
      },
      {
        "id": "v-gen-452",
        "word": "die Aussage",
        "translation": "pernyataan",
        "article": "die",
        "exampleSentence": "Mit dieser Aussage hast du den Nagel auf den Kopf getroffen.",
        "phonetic": "dee AUS-za-ge",
        "level": "B2"
      }
    ],
    "exercises": [
      {
        "question": "Apa arti dari 'jemandem die Daumen drücken'?",
        "options": [
          "Menekan jempol seseorang",
          "Mendoakan keberuntungan",
          "Memegang tangan seseorang",
          "Menyentuh jempol"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Jika seseorang 'die Nase voll hat', artinya dia...",
        "options": [
          "Sedang pilek",
          "Sangat bahagia",
          "Muak atau bosan",
          "Mencium bau yang tidak enak"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa arti dari 'ins kalte Wasser springen'?",
        "options": [
          "Berani berenang di air dingin",
          "Memulai sesuatu tanpa persiapan",
          "Melompat ke kolam renang",
          "Mandi air dingin"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi idiom: 'Ich habe den ______ verloren.'",
        "options": [
          "Ball",
          "Faden",
          "Schlüssel",
          "Weg"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Jika seseorang 'ein offenes Ohr hat', artinya dia...",
        "options": [
          "Telinganya terbuka",
          "Tidak bisa mendengar dengan baik",
          "Bersedia mendengarkan dan membantu",
          "Suka bergosip"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa karakteristik utama dari idiome?",
        "options": [
          "Maknanya selalu harfiah",
          "Strukturnya selalu berubah",
          "Maknanya tidak dapat dipahami dari arti harfiah kata-kata individualnya",
          "Hanya digunakan dalam tulisan formal"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Mengapa penting untuk belajar idiome?",
        "options": [
          "Agar bisa berbicara lebih cepat",
          "Agar bahasa Jerman terdengar lebih alami dan fasih",
          "Agar bisa menulis lebih banyak",
          "Agar bisa menghindari tata bahasa"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Idiom 'zwei linke Hände haben' berarti...",
        "options": [
          "Memiliki dua tangan kiri",
          "Sangat terampil",
          "Canggung atau tidak terampil",
          "Suka membantu"
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Ich bin so nervös wegen der Präsentation morgen.",
        "personB": "Mach dir keine Sorgen! Ich drücke dir die Daumen!",
        "translation": "A: Saya sangat gugup karena presentasi besok.\nB: Jangan khawatir! Saya doakan kamu beruntung!"
      },
      {
        "personA": "Ich habe das Gefühl, ich komme bei diesem Projekt nicht weiter.",
        "personB": "Ich habe die Nase voll davon. Lass uns eine Pause machen.",
        "translation": "A: Saya merasa tidak maju dengan proyek ini.\nB: Saya sudah muak. Mari kita istirahat."
      },
      {
        "personA": "Ich muss eine neue Aufgabe übernehmen, aber ich habe keine Erfahrung damit.",
        "personB": "Manchmal muss man einfach ins kalte Wasser springen. Du schaffst das schon!",
        "translation": "A: Saya harus mengambil tugas baru, tapi saya tidak punya pengalaman dengannya.\nB: Terkadang kamu hanya perlu memulai sesuatu tanpa persiapan. Kamu pasti bisa!"
      }
    ],
    "culturalNotes": "Idiome adalah jendela ke dalam jiwa sebuah bahasa dan budayanya. Banyak idiome Jerman memiliki akar sejarah atau berasal dari kehidupan sehari-hari di masa lalu. Misalnya, 'jemandem die Daumen drücken' berasal dari kebiasaan kuno untuk menekan jempol sebagai tanda dukungan. Memahami dan menggunakan idiome tidak hanya meningkatkan kemampuan bahasa Anda, tetapi juga memberikan wawasan tentang cara berpikir dan humor orang Jerman."
  },
  {
    "id": "b2-8",
    "canDoGoals": [
      "Latihan terminologi karier (Fachvokabular) dari kedokteran, ekonomi, bisnis / hukum",
      "Berlatih membuat resume terminologi fungsional spesifik sesuai target studi",
      "Cara menginvestigasi leksikon khusus secara mandiri"
    ],
    "level": "B2",
    "title": "Fachvokabular (Medizin, Hukum, Bisnis)",
    "grammarDescription": "Menguasai Fachvokabular (kosakata khusus) dari berbagai bidang adalah keterampilan penting di tingkat B2, terutama jika Anda berencana untuk belajar atau bekerja di negara berbahasa Jerman. Kosakata ini memungkinkan komunikasi yang presisi dan profesional dalam konteks spesifik. Meskipun tata bahasa dasar tetap sama, penggunaan istilah-istilah ini sangat berbeda dari bahasa sehari-hari.\n\n**1. Medizin (Kedokteran)**\n*   Fokus pada istilah-istilah umum yang berkaitan dengan tubuh manusia, penyakit, diagnosis, dan perawatan. Banyak istilah medis berasal dari bahasa Latin atau Yunani.\n*   Contoh: `die Diagnose` (diagnosis), `die Therapie` (terapi), `der Patient` (pasien), `die Operation` (operasi).\n\n**2. Jura / Recht (Hukum)**\n*   Fokus pada istilah-istilah yang berkaitan dengan sistem hukum, kejahatan, pengadilan, dan hak-hak. Bahasa hukum seringkali sangat formal dan presisi.\n*   Contoh: `das Gesetz` (undang-undang), `der Anwalt` (pengacara), `das Gericht` (pengadilan), `die Verhandlung` (persidangan).\n\n**3. Wirtschaft / Business (Bisnis)**\n*   Fokus pada istilah-istilah yang berkaitan dengan ekonomi, perusahaan, keuangan, dan perdagangan. Bahasa bisnis seringkali lugas dan berorientasi pada hasil.\n*   Contoh: `das Unternehmen` (perusahaan), `der Gewinn` (keuntungan), `der Umsatz` (omset), `die Aktie` (saham).\n\n**Tips Belajar Fachvokabular:**\n*   Kelompokkan kata-kata berdasarkan bidangnya.\n*   Pelajari kata benda dengan artikelnya (`der, die, das`).\n*   Cari contoh kalimat yang relevan dengan konteks bidang tersebut.\n*   Gunakan kamus khusus bidang (Fachwörterbuch) jika memungkinkan.\n*   Baca teks-teks (artikel berita, laporan) dari bidang yang diminati.",
    "sentenceBreakdowns": [
      "Der (artikel) + Arzt (kata benda) + stellte (verb) + eine (artikel) + genaue (adjektiva) + Diagnose (kata benda) + bei (preposisi) + dem (artikel) + Patienten (kata benda). (Medizin)",
      "Das (artikel) + Gericht (kata benda) + verurteilte (verb) + den (artikel) + Angeklagten (kata benda) + wegen (preposisi) + Diebstahls (kata benda). (Jura)",
      "Das (artikel) + Unternehmen (kata benda) + erzielte (verb) + im (preposisi + artikel) + letzten (adjektiva) + Quartal (kata benda) + einen (artikel) + hohen (adjektiva) + Gewinn (kata benda). (Wirtschaft)",
      "Die (artikel) + Therapie (kata benda) + wurde (verb bantu) + erfolgreich (adverb) + abgeschlossen (Partizip II). (Medizin)",
      "Der (artikel) + Anwalt (kata benda) + vertrat (verb) + seinen (pronomina posesif) + Mandanten (kata benda) + vor (preposisi) + Gericht (kata benda). (Jura)"
    ],
    "pronunciationTips": "Banyak istilah teknis, terutama di bidang kedokteran dan hukum, berasal dari bahasa Latin atau Yunani. Perhatikan pelafalan yang seringkali mengikuti aturan bahasa asalnya atau memiliki penekanan yang berbeda dari kata-kata Jerman biasa. Contoh: 'Diagnose' [dee-ag-NO-ze], 'Therapie' [te-ra-PEE].",
    "vocabulary": [
      {
        "id": "v-gen-453",
        "word": "die Diagnose",
        "translation": "diagnosis",
        "article": "die",
        "exampleSentence": "Der Arzt stellte eine genaue Diagnose.",
        "phonetic": "dee di-ag-NO-ze",
        "level": "B2"
      },
      {
        "id": "v-gen-454",
        "word": "die Therapie",
        "translation": "terapi",
        "article": "die",
        "exampleSentence": "Die Therapie wurde erfolgreich abgeschlossen.",
        "phonetic": "dee te-ra-PEE",
        "level": "B2"
      },
      {
        "id": "v-gen-455",
        "word": "der Patient",
        "translation": "pasien",
        "article": "der",
        "exampleSentence": "Der Patient erholt sich gut von der Operation.",
        "phonetic": "der pa-TSYENT",
        "level": "B2"
      },
      {
        "id": "v-gen-456",
        "word": "die Operation",
        "translation": "operasi",
        "article": "die",
        "exampleSentence": "Die Operation verlief ohne Komplikationen.",
        "phonetic": "dee o-pe-ra-TSYON",
        "level": "B2"
      },
      {
        "id": "v-gen-457",
        "word": "das Medikament",
        "translation": "obat",
        "article": "das",
        "exampleSentence": "Das Medikament muss regelmäßig eingenommen werden.",
        "phonetic": "das me-di-ka-MENT",
        "level": "B2"
      },
      {
        "id": "v-gen-458",
        "word": "das Gesetz",
        "translation": "undang-undang",
        "article": "das",
        "exampleSentence": "Das neue Gesetz tritt nächste Woche in Kraft.",
        "phonetic": "das ge-ZETS",
        "level": "B2"
      },
      {
        "id": "v-gen-459",
        "word": "der Anwalt",
        "translation": "pengacara",
        "article": "der",
        "exampleSentence": "Der Anwalt vertrat seinen Mandanten vor Gericht.",
        "phonetic": "der AN-valt",
        "level": "B2"
      },
      {
        "id": "v-gen-460",
        "word": "das Gericht",
        "translation": "pengadilan",
        "article": "das",
        "exampleSentence": "Das Gericht fällte ein Urteil.",
        "phonetic": "das ge-RICHT",
        "level": "B2"
      },
      {
        "id": "v-gen-461",
        "word": "die Verhandlung",
        "translation": "persidangan",
        "article": "die",
        "exampleSentence": "Die Verhandlung dauerte mehrere Stunden.",
        "phonetic": "dee fer-HAND-lung",
        "level": "B2"
      },
      {
        "id": "v-gen-462",
        "word": "das Urteil",
        "translation": "putusan, vonis",
        "article": "das",
        "exampleSentence": "Das Urteil wurde heute verkündet.",
        "phonetic": "das UR-tayl",
        "level": "B2"
      },
      {
        "id": "v-gen-463",
        "word": "das Unternehmen",
        "translation": "perusahaan",
        "article": "das",
        "exampleSentence": "Das Unternehmen expandiert in neue Märkte.",
        "phonetic": "das UN-ter-nay-men",
        "level": "B2"
      },
      {
        "id": "v-gen-464",
        "word": "der Gewinn",
        "translation": "keuntungan",
        "article": "der",
        "exampleSentence": "Der Gewinn des Unternehmens ist gestiegen.",
        "phonetic": "der ge-VIN",
        "level": "B2"
      },
      {
        "id": "v-gen-465",
        "word": "der Umsatz",
        "translation": "omset",
        "article": "der",
        "exampleSentence": "Der Umsatz hat sich im letzten Jahr verdoppelt.",
        "phonetic": "der UM-zats",
        "level": "B2"
      },
      {
        "id": "v-gen-466",
        "word": "die Aktie",
        "translation": "saham",
        "article": "die",
        "exampleSentence": "Die Aktienkurse sind heute gefallen.",
        "phonetic": "dee AK-tsye",
        "level": "B2"
      },
      {
        "id": "v-gen-467",
        "word": "die Bilanz",
        "translation": "neraca keuangan",
        "article": "die",
        "exampleSentence": "Die Bilanz des Unternehmens sieht gut aus.",
        "phonetic": "dee bi-LANTS",
        "level": "B2"
      },
      {
        "id": "v-gen-468",
        "word": "der Vertrag",
        "translation": "kontrak",
        "article": "der",
        "exampleSentence": "Der Vertrag wurde von beiden Parteien unterzeichnet.",
        "phonetic": "der fer-TRAG",
        "level": "B2"
      }
    ],
    "exercises": [
      {
        "question": "Pilih istilah yang tepat untuk bidang Medizin: 'Proses identifikasi penyakit.'",
        "options": [
          "Die Therapie",
          "Die Diagnose",
          "Die Operation",
          "Das Medikament"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Pilih istilah yang tepat untuk bidang Jura: 'Orang yang membela klien di pengadilan.'",
        "options": [
          "Der Richter",
          "Der Angeklagte",
          "Der Anwalt",
          "Der Zeuge"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Pilih istilah yang tepat untuk bidang Wirtschaft: 'Jumlah uang yang dihasilkan dari penjualan barang/jasa.'",
        "options": [
          "Der Gewinn",
          "Der Verlust",
          "Der Umsatz",
          "Die Aktie"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Dalam kalimat 'Die Operation verlief ohne Komplikationen.', kata 'Komplikationen' termasuk Fachvokabular bidang...",
        "options": [
          "Jura",
          "Wirtschaft",
          "Medizin",
          "Technik"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa arti dari 'das Urteil' dalam konteks hukum?",
        "options": [
          "Kesepakatan",
          "Putusan/Vonis",
          "Tuntutan",
          "Pembelaan"
        ],
        "correctAnswer": 1
      }
    ],
    "miniQuiz": [
      {
        "question": "Mengapa penting untuk mempelajari Fachvokabular?",
        "options": [
          "Agar bisa berbicara lebih cepat",
          "Untuk komunikasi yang presisi dan profesional dalam konteks spesifik",
          "Agar bisa menulis lebih banyak",
          "Untuk menghindari tata bahasa"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Istilah 'der Gewinn' termasuk dalam bidang...",
        "options": [
          "Medizin",
          "Jura",
          "Wirtschaft",
          "Politik"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Istilah 'das Gesetz' berarti...",
        "options": [
          "Kontrak",
          "Pengadilan",
          "Undang-undang",
          "Hukuman"
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Ich habe gehört, dein Vater hatte eine Operation.",
        "personB": "Ja, aber die Operation verlief gut, und er erholt sich jetzt von der Therapie.",
        "translation": "A: Saya dengar ayahmu menjalani operasi.\nB: Ya, tapi operasinya berjalan lancar, dan dia sekarang pulih dari terapi."
      },
      {
        "personA": "Wie steht es um den Fall deines Mandanten?",
        "personB": "Der Anwalt hat das Gesetz genau studiert und wir erwarten ein positives Urteil vom Gericht.",
        "translation": "A: Bagaimana kabar kasus klienmu?\nB: Pengacara telah mempelajari undang-undang dengan cermat dan kami mengharapkan putusan positif dari pengadilan."
      },
      {
        "personA": "Unser Unternehmen muss den Umsatz steigern.",
        "personB": "Ja, wir müssen neue Strategien entwickeln, um den Gewinn zu erhöhen und die Aktienkurse zu stabilisieren.",
        "translation": "A: Perusahaan kita harus meningkatkan omset.\nB: Ya, kita harus mengembangkan strategi baru untuk meningkatkan keuntungan dan menstabilkan harga saham."
      }
    ],
    "culturalNotes": "Di Jerman, presisi bahasa sangat dihargai, terutama dalam bidang profesional. Penggunaan Fachvokabular yang tepat tidak hanya menunjukkan kompetensi, tetapi juga rasa hormat terhadap bidang tersebut. Dalam pendidikan dan dunia kerja, diharapkan Anda dapat berkomunikasi secara akurat menggunakan istilah-istilah ini. Kesalahan dalam terminologi bisa memiliki konsekuensi serius, terutama di bidang hukum atau medis."
  },
  {
    "id": "b2-9",
    "canDoGoals": [
      "Membangun taktik Textanalyse dan Argumentation level debat formal",
      "Menghargai, menyangkal, merangkum, dan bernegosiasi secara rasional dari perspektif (Dafür/Dagegen)",
      "Memulai opini tajam tanpa mengkompromikan keformalan bahasa verbal"
    ],
    "level": "B2",
    "title": "Textanalyse & Argumentation",
    "grammarDescription": "Textanalyse (analisis teks) dan Argumentation (argumentasi) adalah keterampilan krusial di tingkat B2, terutama dalam konteks akademik dan profesional. Ini melibatkan kemampuan untuk memahami teks secara mendalam, mengidentifikasi struktur, tujuan, dan argumen penulis, serta kemampuan untuk membangun argumen Anda sendiri secara logis dan persuasif.\n\n**1. Textanalyse (Analisis Teks):**\n*   **Tujuan:** Memahami isi, struktur, gaya, dan maksud penulis dari sebuah teks.\n*   **Langkah-langkah:**\n    *   **Erster Überblick (Gambaran Umum):** Baca cepat untuk mendapatkan ide utama. Identifikasi jenis teks (artikel berita, esai, komentar, dll.) dan topik.\n    *   **Hauptaussage/These (Pernyataan Utama/Tesis):** Temukan argumen sentral atau pesan utama yang ingin disampaikan penulis.\n    *   **Argumentationsstruktur (Struktur Argumentasi):** Bagaimana penulis membangun argumennya? Apakah ada pendahuluan, poin-poin pendukung, contoh, kontra-argumen, dan kesimpulan?\n    *   **Sprachliche Mittel (Sarana Linguistik):** Perhatikan pilihan kata, gaya bahasa (formal/informal), penggunaan retorika, modalpartikeln, atau struktur kalimat kompleks.\n    *   **Intention des Autors (Niat Penulis):** Apa yang ingin dicapai penulis dengan teks ini? Menginformasikan, meyakinkan, mengkritik, menghibur?\n\n**2. Argumentation (Argumentasi):**\n*   **Tujuan:** Menyajikan pandangan Anda sendiri secara logis dan meyakinkan, didukung oleh bukti dan alasan.\n*   **Struktur Argumen yang Baik:**\n    *   **These (Tesis):** Pernyataan utama yang ingin Anda buktikan atau pertahankan.\n    *   **Argumente (Argumen):** Poin-poin pendukung yang menjelaskan mengapa tesis Anda benar.\n    *   **Beispiele/Belege (Contoh/Bukti):** Data, fakta, statistik, kutipan, atau ilustrasi yang mendukung argumen Anda.\n    *   **Gegenargumente (Kontra-argumen):** Mengantisipasi dan menyanggah argumen yang berlawanan untuk memperkuat posisi Anda.\n    *   **Schlussfolgerung (Kesimpulan):** Merangkum argumen dan menegaskan kembali tesis Anda.\n\n**Frasa Penting untuk Argumentasi:**\n*   `Meiner Meinung nach...` (Menurut pendapat saya...)\n*   `Ich bin der Ansicht, dass...` (Saya berpendapat bahwa...)\n*   `Ein wichtiges Argument dafür ist...` (Argumen penting untuk ini adalah...)\n*   `Dafür spricht, dass...` (Yang mendukung ini adalah...)\n*   `Dagegen spricht, dass...` (Yang menentang ini adalah...)\n*   `Man könnte einwenden, dass...` (Orang bisa berargumen bahwa...)\n*   `Zusammenfassend lässt sich sagen...` (Sebagai kesimpulan dapat dikatakan...)",
    "sentenceBreakdowns": [
      "Die (artikel) + Hauptaussage (kata benda) + des (artikel) + Textes (kata benda) + ist (verb), + dass (konjungsi) + der (artikel) + Klimawandel (kata benda) + eine (artikel) + globale (adjektiva) + Herausforderung (kata benda) + darstellt (verb). (Textanalyse)",
      "Meiner (pronomina posesif) + Meinung (kata benda) + nach (preposisi) + sollte (Modalverb) + die (artikel) + Regierung (kata benda) + mehr (adverb) + in (preposisi) + erneuerbare (adjektiva) + Energien (kata benda) + investieren (infinitif). (Argumentation)",
      "Ein (artikel) + wichtiges (adjektiva) + Argument (kata benda) + dafür (adverb) + ist (verb), + dass (konjungsi) + dies (pronomina demonstratif) + langfristig (adverb) + die (artikel) + Umwelt (kata benda) + schützt (verb). (Argumentation)",
      "Man (pronomina impersonal) + könnte (Modalverb) + einwenden (infinitif), + dass (konjungsi) + die (artikel) + Kosten (kata benda) + hoch (adjektiva) + seien (Konjunktiv I), + jedoch (konjungsi) + überwiegen (verb) + die (artikel) + Vorteile (kata benda). (Argumentation)",
      "Zusammenfassend (Partizip I sebagai adverbial) + lässt (verb) + sich (pronomina refleksif) + sagen (infinitif), + dass (konjungsi) + eine (artikel) + nachhaltige (adjektiva) + Entwicklung (kata benda) + unerlässlich (adjektiva) + ist (verb). (Argumentation)"
    ],
    "pronunciationTips": "Saat berargumentasi, gunakan intonasi yang bervariasi untuk menekankan poin-poin penting dan menunjukkan keyakinan. Jeda yang tepat setelah frasa pengantar argumen (misalnya 'Meiner Meinung nach...') dapat membantu struktur argumen Anda terdengar lebih jelas. Latih pengucapan frasa-frasa penghubung argumen dengan lancar.",
    "vocabulary": [
      {
        "id": "v-gen-469",
        "word": "die Hauptaussage",
        "translation": "pernyataan utama",
        "article": "die",
        "exampleSentence": "Die Hauptaussage des Textes ist klar.",
        "phonetic": "dee HAUPT-aus-za-ge",
        "level": "B2"
      },
      {
        "id": "v-gen-470",
        "word": "die These",
        "translation": "tesis",
        "article": "die",
        "exampleSentence": "Die These des Autors wird im ersten Absatz vorgestellt.",
        "phonetic": "dee TAY-ze",
        "level": "B2"
      },
      {
        "id": "v-gen-471",
        "word": "das Argument",
        "translation": "argumen",
        "article": "das",
        "exampleSentence": "Ein wichtiges Argument dafür ist die Kostenersparnis.",
        "phonetic": "das ar-gu-MENT",
        "level": "B2"
      },
      {
        "id": "v-gen-472",
        "word": "das Gegenargument",
        "translation": "kontra-argumen",
        "article": "das",
        "exampleSentence": "Man muss auch die Gegenargumente berücksichtigen.",
        "phonetic": "das GAY-gen-ar-gu-ment",
        "level": "B2"
      },
      {
        "id": "v-gen-473",
        "word": "die Schlussfolgerung",
        "translation": "kesimpulan",
        "article": "die",
        "exampleSentence": "Die Schlussfolgerung der Studie ist eindeutig.",
        "phonetic": "dee SHLUSS-fol-ge-rung",
        "level": "B2"
      },
      {
        "id": "v-gen-474",
        "word": "analysieren",
        "translation": "menganalisis",
        "exampleSentence": "Wir müssen den Text genau analysieren.",
        "phonetic": "a-na-ly-SEE-ren",
        "level": "B2"
      },
      {
        "id": "v-gen-475",
        "word": "begründen",
        "translation": "memberi alasan, membenarkan",
        "exampleSentence": "Sie konnte ihre Meinung gut begründen.",
        "phonetic": "be-GRÜN-den",
        "level": "B2"
      },
      {
        "id": "v-gen-476",
        "word": "belegen",
        "translation": "membuktikan, mendokumentasikan",
        "exampleSentence": "Die Behauptung muss mit Fakten belegt werden.",
        "phonetic": "be-LAY-gen",
        "level": "B2"
      },
      {
        "id": "v-gen-477",
        "word": "widerlegen",
        "translation": "membantah, menyanggah",
        "exampleSentence": "Es ist schwer, dieses Argument zu widerlegen.",
        "phonetic": "vee-der-LAY-gen",
        "level": "B2"
      },
      {
        "id": "v-gen-478",
        "word": "überzeugen",
        "translation": "meyakinkan",
        "exampleSentence": "Er konnte das Publikum von seiner Idee überzeugen.",
        "phonetic": "ü-ber-TSOY-gen",
        "level": "B2"
      },
      {
        "id": "v-gen-479",
        "word": "die Intention",
        "translation": "niat, maksud",
        "article": "die",
        "exampleSentence": "Die Intention des Autors ist klar erkennbar.",
        "phonetic": "dee in-ten-TSYON",
        "level": "B2"
      },
      {
        "id": "v-gen-480",
        "word": "die Perspektive",
        "translation": "perspektif",
        "article": "die",
        "exampleSentence": "Man sollte verschiedene Perspektiven berücksichtigen.",
        "phonetic": "dee per-spek-TEE-ve",
        "level": "B2"
      },
      {
        "id": "v-gen-481",
        "word": "die Quelle",
        "translation": "sumber",
        "article": "die",
        "exampleSentence": "Die Informationen stammen aus zuverlässigen Quellen.",
        "phonetic": "dee KVEL-le",
        "level": "B2"
      },
      {
        "id": "v-gen-482",
        "word": "die Gliederung",
        "translation": "struktur, kerangka",
        "article": "die",
        "exampleSentence": "Die Gliederung des Textes ist logisch aufgebaut.",
        "phonetic": "dee GLEE-de-rung",
        "level": "B2"
      },
      {
        "id": "v-gen-483",
        "word": "die Rhetorik",
        "translation": "retorika",
        "article": "die",
        "exampleSentence": "Die Rhetorik des Redners war sehr überzeugend.",
        "phonetic": "dee re-TO-rik",
        "level": "B2"
      }
    ],
    "exercises": [
      {
        "question": "Apa langkah pertama dalam Textanalyse?",
        "options": [
          "Menulis kesimpulan",
          "Membaca cepat untuk gambaran umum",
          "Mencari kata-kata sulit",
          "Menghafal seluruh teks"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Manakah frasa yang tepat untuk memperkenalkan argumen Anda sendiri?",
        "options": [
          "Der Autor sagt...",
          "Es wird angenommen, dass...",
          "Meiner Meinung nach...",
          "Die Studie zeigt..."
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa fungsi dari 'Gegenargumente' dalam sebuah argumentasi?",
        "options": [
          "Melemahkan argumen Anda sendiri",
          "Menguatkan argumen yang berlawanan",
          "Mengantisipasi dan menyanggah argumen yang berlawanan",
          "Membuat teks lebih panjang"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Jika Anda ingin 'membuktikan' sebuah pernyataan, kata kerja apa yang paling tepat?",
        "options": [
          "widerlegen",
          "überzeugen",
          "begründen",
          "belegen"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Apa yang dimaksud dengan 'Intention des Autors'?",
        "options": [
          "Gaya penulisan penulis",
          "Latar belakang penulis",
          "Maksud atau tujuan penulis dengan teks tersebut",
          "Jumlah kata dalam teks"
        ],
        "correctAnswer": 2
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa tujuan utama dari 'Argumentation'?",
        "options": [
          "Menyampaikan informasi secara netral",
          "Menyajikan pandangan secara logis dan meyakinkan",
          "Menceritakan sebuah kisah",
          "Menghibur pembaca"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Dalam struktur argumen yang baik, apa yang harus mendukung 'Argumente'?",
        "options": [
          "Opini pribadi",
          "Perasaan",
          "Contoh atau bukti",
          "Kata-kata sulit"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Frasa 'Zusammenfassend lässt sich sagen...' digunakan untuk...",
        "options": [
          "Memperkenalkan argumen baru",
          "Menyanggah kontra-argumen",
          "Merangkum dan menyimpulkan",
          "Memberikan contoh"
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Ich muss eine Textanalyse für mein Seminar schreiben. Wo soll ich anfangen?",
        "personB": "Beginne mit der Hauptaussage und der Intention des Autors. Dann analysiere die Argumentationsstruktur und die sprachlichen Mittel.",
        "translation": "A: Saya harus menulis analisis teks untuk seminar saya. Dari mana saya harus mulai?\nB: Mulailah dengan pernyataan utama dan niat penulis. Kemudian analisis struktur argumentasi dan sarana linguistiknya."
      },
      {
        "personA": "Ich finde es schwer, meine Argumente überzeugend darzustellen.",
        "personB": "Wichtig ist, dass du deine These klar formulierst und sie mit Beispielen und Belegen untermauerst. Vergiss auch nicht, mögliche Gegenargumente zu widerlegen.",
        "translation": "A: Saya merasa sulit untuk menyajikan argumen saya secara meyakinkan.\nB: Yang penting adalah kamu merumuskan tesismu dengan jelas dan mendukungnya dengan contoh dan bukti. Jangan lupa juga untuk membantah kemungkinan kontra-argumen."
      },
      {
        "personA": "Was ist der Unterschied zwischen einer These und einem Argument?",
        "personB": "Die These ist deine Hauptbehauptung, die du beweisen willst. Ein Argument ist ein unterstützender Punkt, der deine These begründet.",
        "translation": "A: Apa perbedaan antara tesis dan argumen?\nB: Tesis adalah klaim utamamu yang ingin kamu buktikan. Argumen adalah poin pendukung yang membenarkan tesismu."
      }
    ],
    "culturalNotes": "Dalam sistem pendidikan Jerman, kemampuan untuk menganalisis teks secara kritis dan membangun argumen yang logis adalah keterampilan fundamental. Ini diajarkan dan diharapkan di semua tingkatan, dari sekolah menengah hingga universitas. Debat dan diskusi yang terstruktur, didukung oleh bukti, adalah bagian penting dari budaya intelektual Jerman. Kemampuan ini juga sangat dihargai di lingkungan profesional."
  },
  {
    "id": "b2-checkpoint-3",
    "canDoGoals": [
      "Evaluasi debat asinkron dan ekspresi kiasan idiomatik",
      "Asesmen Vokabular teknikal dari industri khusus"
    ],
    "title": "Review Konten Sebelumnya",
    "requiredScore": 0.7,
    "questions": [
      {
        "question": "Apa arti dari idiom 'die Nase voll haben'?",
        "options": [
          "Sangat bahagia",
          "Muak atau bosan",
          "Sedang pilek",
          "Mencium bau yang tidak enak"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Lengkapi idiom: 'Ich drücke dir die ______ für deine Prüfung!'",
        "options": [
          "Hände",
          "Augen",
          "Daumen",
          "Füße"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Jika seseorang 'ins kalte Wasser springen' artinya dia...",
        "options": [
          "Berani berenang di air dingin",
          "Memulai sesuatu tanpa persiapan",
          "Melompat ke kolam renang",
          "Mandi air dingin"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Istilah 'der Patient' termasuk dalam Fachvokabular bidang...",
        "options": [
          "Jura",
          "Wirtschaft",
          "Medizin",
          "Technik"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa arti dari 'das Gesetz'?",
        "options": [
          "Kontrak",
          "Pengadilan",
          "Undang-undang",
          "Hukuman"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Istilah 'der Umsatz' termasuk dalam Fachvokabular bidang...",
        "options": [
          "Medizin",
          "Jura",
          "Wirtschaft",
          "Politik"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa yang dimaksud dengan 'Hauptaussage' dalam Textanalyse?",
        "options": [
          "Kalimat pertama teks",
          "Pernyataan utama atau pesan sentral penulis",
          "Judul teks",
          "Ringkasan teks"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Manakah frasa yang tepat untuk memperkenalkan kontra-argumen?",
        "options": [
          "Ich bin der Ansicht, dass...",
          "Ein wichtiges Argument dafür ist...",
          "Man könnte einwenden, dass...",
          "Zusammenfassend lässt sich sagen..."
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa tujuan dari 'Argumentation'?",
        "options": [
          "Menceritakan kisah",
          "Menyampaikan informasi secara netral",
          "Menyajikan pandangan secara logis dan meyakinkan",
          "Menghibur pembaca"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Jika Anda ingin 'membantah' sebuah argumen, kata kerja apa yang paling tepat?",
        "options": [
          "begründen",
          "belegen",
          "widerlegen",
          "überzeugen"
        ],
        "correctAnswer": 2
      }
    ],
    "reviewLessons": [
      "b2-7",
      "b2-8",
      "b2-9"
    ]
  },
  {
    "id": "b2-10",
    "canDoGoals": [
      "Meringkas taktik menaklukkan Modul Ujian Goethe-Zertifikat B2",
      "Membedah apa yang dianalisa pemeriksa pada sesi (Lesen, Hören, Schreiben, Sprechen)",
      "Tip menghemat waktu saat berhadapan dengan soal menjebak"
    ],
    "level": "B2",
    "title": "Persiapan Ujian Goethe B2",
    "grammarDescription": "Ujian Goethe-Zertifikat B2 menguji kemampuan Anda dalam menggunakan bahasa Jerman secara mandiri dan lancar dalam berbagai situasi. Ujian ini terdiri dari empat modul: Lesen (Membaca), Hören (Mendengar), Schreiben (Menulis), dan Sprechen (Berbicara). Persiapan yang efektif melibatkan pemahaman format ujian, strategi untuk setiap bagian, dan latihan intensif.\n\n**1. Lesen (Membaca):**\n*   **Format:** 4 bagian dengan berbagai jenis teks (artikel koran, komentar, iklan, laporan). Tugas meliputi pemahaman detail, ide utama, dan menemukan informasi spesifik.\n*   **Strategi:** Latih 'Skimming' (membaca cepat untuk ide utama) dan 'Scanning' (mencari informasi spesifik). Perhatikan kata kunci dan struktur teks. Jangan panik jika ada kata yang tidak dikenal; coba pahami konteksnya.\n\n**2. Hören (Mendengar):**\n*   **Format:** 4 bagian dengan berbagai jenis audio (percakapan, wawancara, diskusi, pengumuman). Tugas meliputi pemahaman ide utama, detail, dan inferensi.\n*   **Strategi:** Dengarkan secara aktif. Perhatikan intonasi dan penekanan. Catat poin-poin penting. Latih mendengarkan berbagai aksen dan kecepatan bicara. Baca pertanyaan sebelum mendengarkan.\n\n**3. Schreiben (Menulis):**\n*   **Format:** 2 tugas. Bagian 1: Menulis komentar atau opini tentang suatu topik. Bagian 2: Menulis pesan formal (misalnya, email keluhan, permohonan).\n*   **Strategi:** Strukturkan tulisan Anda dengan jelas (pendahuluan, argumen dengan contoh, kesimpulan). Gunakan kosakata B2 dan struktur kalimat kompleks. Perhatikan tata bahasa, ejaan, dan tanda baca. Latih manajemen waktu.\n\n**4. Sprechen (Berbicara):**\n*   **Format:** 2 bagian. Bagian 1: Presentasi singkat tentang topik tertentu. Bagian 2: Diskusi dengan partner ujian tentang topik yang sama atau terkait.\n*   **Strategi:** Latih berbicara secara lancar dan koheren. Gunakan frasa untuk memulai, mengembangkan, dan menyimpulkan argumen. Berinteraksi dengan partner. Perhatikan pelafalan dan intonasi. Jangan takut membuat kesalahan; yang penting adalah komunikasi.\n\n**Tips Umum:**\n*   Gunakan materi persiapan resmi Goethe-Institut.\n*   Lakukan ujian simulasi (Modellsatz) secara teratur.\n*   Identifikasi kelemahan Anda dan fokus pada area tersebut.\n*   Tingkatkan kosakata secara aktif, terutama Fachvokabular dan idiome.\n*   Biasakan diri dengan tekanan waktu.",
    "sentenceBreakdowns": [
      "Für (preposisi) + die (artikel) + Prüfung (kata benda) + ist (verb) + es (pronomina impersonal) + wichtig (adjektiva), + dass (konjungsi) + man (pronomina impersonal) + die (artikel) + Aufgabenstellungen (kata benda) + genau (adverb) + versteht (verb).",
      "Im (preposisi + artikel) + Leseteil (kata benda) + sollte (Modalverb) + man (pronomina impersonal) + Strategien (kata benda) + wie (konjungsi) + Skimming (kata benda) + und (konjungsi) + Scanning (kata benda) + anwenden (infinitif).",
      "Beim (preposisi + artikel) + Hören (nominalisasi) + ist (verb) + es (pronomina impersonal) + entscheidend (adjektiva), + sich (pronomina refleksif) + auf (preposisi) + die (artikel) + Hauptinformationen (kata benda) + zu (preposisi) + konzentrieren (infinitif).",
      "Der (artikel) + Schreibteil (kata benda) + erfordert (verb) + eine (artikel) + klare (adjektiva) + Struktur (kata benda) + und (konjungsi) + den (artikel) + Einsatz (kata benda) + von (preposisi) + B2-Vokabular (kata benda).",
      "Im (preposisi + artikel) + Sprechteil (kata benda) + ist (verb) + es (pronomina impersonal) + wichtig (adjektiva), + flüssig (adjektiva) + zu (preposisi) + sprechen (infinitif) + und (konjungsi) + aktiv (adjektiva) + mit (preposisi) + dem (artikel) + Partner (kata benda) + zu (preposisi) + interagieren (infinitif)."
    ],
    "pronunciationTips": "Untuk bagian Sprechen, fokus pada kejelasan artikulasi, intonasi yang alami, dan kecepatan bicara yang moderat. Latih pengucapan kata-kata panjang dan kompleks. Pastikan untuk mengucapkan akhiran kata dengan jelas, terutama pada kata kerja dan adjektiva yang dideklinasikan.",
    "vocabulary": [
      {
        "id": "v-gen-484",
        "word": "die Prüfung",
        "translation": "ujian",
        "article": "die",
        "exampleSentence": "Die Goethe B2 Prüfung ist eine Herausforderung.",
        "phonetic": "dee PRÜ-fung",
        "level": "B2"
      },
      {
        "id": "v-gen-485",
        "word": "der Modul",
        "translation": "modul",
        "article": "der",
        "exampleSentence": "Die Prüfung besteht aus vier Modulen.",
        "phonetic": "der MO-dul",
        "level": "B2"
      },
      {
        "id": "v-gen-486",
        "word": "die Aufgabenstellung",
        "translation": "instruksi tugas",
        "article": "die",
        "exampleSentence": "Man muss die Aufgabenstellung genau lesen.",
        "phonetic": "dee AUF-ga-ben-stel-lung",
        "level": "B2"
      },
      {
        "id": "v-gen-487",
        "word": "die Strategie",
        "translation": "strategi",
        "article": "die",
        "exampleSentence": "Für jeden Teil der Prüfung gibt es eine Strategie.",
        "phonetic": "dee shra-te-GEE",
        "level": "B2"
      },
      {
        "id": "v-gen-488",
        "word": "skimming",
        "translation": "membaca cepat (untuk ide utama)",
        "exampleSentence": "Beim Skimming erfasst man die Hauptaussagen.",
        "phonetic": "SKIM-ming",
        "level": "B2"
      },
      {
        "id": "v-gen-489",
        "word": "scanning",
        "translation": "membaca cepat (untuk informasi spesifik)",
        "exampleSentence": "Beim Scanning sucht man gezielt nach Informationen.",
        "phonetic": "SKAN-ning",
        "level": "B2"
      },
      {
        "id": "v-gen-490",
        "word": "die Hauptinformation",
        "translation": "informasi utama",
        "article": "die",
        "exampleSentence": "Konzentrieren Sie sich auf die Hauptinformationen.",
        "phonetic": "dee HAUPT-in-for-ma-tsyON",
        "level": "B2"
      },
      {
        "id": "v-gen-491",
        "word": "die Gliederung",
        "translation": "struktur, kerangka",
        "article": "die",
        "exampleSentence": "Eine klare Gliederung ist wichtig für den Schreibteil.",
        "phonetic": "dee GLEE-de-rung",
        "level": "B2"
      },
      {
        "id": "v-gen-492",
        "word": "flüssig",
        "translation": "lancar",
        "exampleSentence": "Man sollte flüssig und verständlich sprechen.",
        "phonetic": "FLÜS-sich",
        "level": "B2"
      },
      {
        "id": "v-gen-493",
        "word": "interagieren",
        "translation": "berinteraksi",
        "exampleSentence": "Im Sprechteil muss man mit dem Partner interagieren.",
        "phonetic": "in-te-ra-GEE-ren",
        "level": "B2"
      },
      {
        "id": "v-gen-494",
        "word": "die Zeitmanagement",
        "translation": "manajemen waktu",
        "article": "das",
        "exampleSentence": "Gutes Zeitmanagement ist entscheidend für die Prüfung.",
        "phonetic": "das TSYT-ma-natsch-ment",
        "level": "B2"
      },
      {
        "id": "v-gen-495",
        "word": "der Wortschatz",
        "translation": "kosakata",
        "article": "der",
        "exampleSentence": "Erweitern Sie Ihren Wortschatz kontinuierlich.",
        "phonetic": "der VORT-shats",
        "level": "B2"
      },
      {
        "id": "v-gen-496",
        "word": "die Grammatik",
        "translation": "tata bahasa",
        "article": "die",
        "exampleSentence": "Achten Sie auf korrekte Grammatik und Rechtschreibung.",
        "phonetic": "dee gra-MA-tik",
        "level": "B2"
      },
      {
        "id": "v-gen-497",
        "word": "die Aussprache",
        "translation": "pelafalan",
        "article": "die",
        "exampleSentence": "Eine klare Aussprache ist im Sprechteil wichtig.",
        "phonetic": "dee AUS-shpra-che",
        "level": "B2"
      },
      {
        "id": "v-gen-498",
        "word": "der Prüfungssimulation",
        "translation": "simulasi ujian",
        "article": "die",
        "exampleSentence": "Regelmäßige Prüfungssimulationen helfen bei der Vorbereitung.",
        "phonetic": "dee PRÜ-fungs-zi-mu-la-tsyON",
        "level": "B2"
      }
    ],
    "exercises": [
      {
        "question": "Berapa modul yang ada dalam ujian Goethe-Zertifikat B2?",
        "options": [
          "Tiga",
          "Empat",
          "Lima",
          "Dua"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa tujuan dari 'Skimming' dalam bagian Lesen?",
        "options": [
          "Mencari informasi spesifik",
          "Memahami ide utama teks",
          "Menghafal seluruh teks",
          "Menganalisis tata bahasa"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Dalam bagian Schreiben, tugas apa yang biasanya diberikan di bagian 1?",
        "options": [
          "Menulis cerita pendek",
          "Menulis komentar atau opini",
          "Menulis surat pribadi",
          "Menulis puisi"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Apa yang penting saat berinteraksi dengan partner di bagian Sprechen?",
        "options": [
          "Berbicara lebih keras dari partner",
          "Tidak mendengarkan partner",
          "Berinteraksi secara aktif dan kooperatif",
          "Hanya berbicara tentang diri sendiri"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Mengapa manajemen waktu penting dalam ujian?",
        "options": [
          "Agar ujian selesai lebih cepat",
          "Agar bisa menyelesaikan semua tugas dalam waktu yang ditentukan",
          "Agar tidak perlu belajar banyak",
          "Agar bisa istirahat lebih lama"
        ],
        "correctAnswer": 1
      }
    ],
    "miniQuiz": [
      {
        "question": "Apa yang diuji dalam modul 'Hören'?",
        "options": [
          "Kemampuan menulis",
          "Kemampuan membaca",
          "Kemampuan mendengarkan dan memahami",
          "Kemampuan berbicara"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa yang harus diperhatikan dalam bagian 'Schreiben' selain tata bahasa dan ejaan?",
        "options": [
          "Kecepatan menulis",
          "Panjang kalimat",
          "Struktur tulisan dan penggunaan kosakata B2",
          "Warna tinta"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Apa yang dimaksud dengan 'flüssig sprechen' dalam konteks ujian?",
        "options": [
          "Berbicara dengan sangat cepat",
          "Berbicara tanpa jeda",
          "Berbicara secara lancar dan koheren",
          "Berbicara dengan suara pelan"
        ],
        "correctAnswer": 2
      }
    ],
    "dialogues": [
      {
        "personA": "Ich mache mir Sorgen wegen des Schreibteils der B2-Prüfung.",
        "personB": "Keine Sorge! Übe, deine Argumente klar zu strukturieren und verwende passendes B2-Vokabular. Das Zeitmanagement ist auch entscheidend.",
        "translation": "A: Saya khawatir tentang bagian menulis ujian B2.\nB: Jangan khawatir! Latih untuk menyusun argumenmu dengan jelas dan gunakan kosakata B2 yang sesuai. Manajemen waktu juga sangat penting."
      },
      {
        "personA": "Wie kann ich mich am besten auf den Leseteil vorbereiten?",
        "personB": "Lies viele verschiedene Texte, wie Zeitungsartikel und Kommentare. Übe Skimming und Scanning, um die Hauptinformationen und spezifische Details schnell zu finden.",
        "translation": "A: Bagaimana cara terbaik saya mempersiapkan diri untuk bagian membaca?\nB: Bacalah banyak teks yang berbeda, seperti artikel koran dan komentar. Latih Skimming dan Scanning untuk menemukan informasi utama dan detail spesifik dengan cepat."
      },
      {
        "personA": "Ich bin nervös, wenn ich im Sprechteil mit einem Partner diskutieren muss.",
        "personB": "Das ist normal. Versuche, aktiv zuzuhören und auf die Beiträge deines Partners einzugehen. Es geht darum, flüssig zu interagieren, nicht perfekt zu sein.",
        "translation": "A: Saya gugup ketika harus berdiskusi dengan partner di bagian berbicara.\nB: Itu normal. Cobalah untuk mendengarkan secara aktif dan menanggapi kontribusi partner Anda. Ini tentang berinteraksi dengan lancar, bukan menjadi sempurna."
      }
    ],
    "culturalNotes": "Goethe-Zertifikat B2 adalah sertifikasi yang diakui secara internasional dan seringkali menjadi syarat untuk studi di universitas Jerman atau untuk pekerjaan tertentu. Persiapan yang serius dan terstruktur menunjukkan dedikasi Anda terhadap bahasa dan budaya Jerman. Ujian ini tidak hanya menguji pengetahuan tata bahasa dan kosakata, tetapi juga kemampuan Anda untuk berkomunikasi secara efektif dalam situasi kehidupan nyata."
  },
  {
    "id": "b2-11",
    "canDoGoals": [
      "Menguasai Nomen-Verb-Verbindungen tingkat lanjut (Kombinasi Paten Noun-Verba)",
      "Mengganti verba sederhana dengan frase tinggi. Contoh: mengganti 'fragen' menjadi 'eine Frage stellen'",
      "Ekspektasi birokrasi dan korespondensi bisnis formal Jerman di ranah akademik."
    ],
    "level": "B2",
    "title": "Nomen-Verb-Verbindungen",
    "grammarDescription": "Nomen-Verb-Verbindungen (juga disebut Funktionsverbgefüge) adalah kombinasi kata benda dan kata kerja yang memiliki makna tunggal, seringkali sama dengan satu kata kerja. Struktur ini sangat khas dalam bahasa Jerman formal (tulisan akademis, institusi, kantor). Contohnya: 'eine Entscheidung treffen' (mengambil keputusan) = entscheiden; 'in Erfüllung gehen' (terwujud) = sich erfüllen.\n\nMemahami kombinasi ini penting karena sering muncul di teks ujian B2 dan C1.",
    "vocabulary": [
      {
        "id": "v-b211-1",
        "word": "eine Entscheidung treffen",
        "translation": "membuat keputusan",
        "exampleSentence": "Wir müssen bald eine Entscheidung treffen.",
        "phonetic": "ai-ne ent-SHAI-dung TRE-fen",
        "level": "B2"
      },
      {
        "id": "v-b211-2",
        "word": "Abschied nehmen von",
        "translation": "berpamitan dari",
        "exampleSentence": "Er nahm Abschied von seinen Freunden.",
        "phonetic": "AB-sheet NE-men fon",
        "level": "B2"
      }
    ],
    "exercises": [
      {
        "question": "Kata kerja apa yang memiliki arti sama dengan 'eine Entscheidung treffen'?",
        "options": [
          "treffen",
          "entscheiden",
          "scheiden",
          "urteilen"
        ],
        "correctAnswer": 1
      }
    ]
  },
  {
    "id": "b2-12",
    "canDoGoals": [
      "Meningkatkan struktur Passiv dengan padanan moderen Passiversatzformen",
      "Penggunaan refleksi 'sich lassen + Infinitiv', adjektif tambahan (-bar, -lich), dan frasa pengibaratan 'sein + zu + infinitive'",
      "Fleksibilitas dan kealamian cara mengekspresikan kalimat fasih"
    ],
    "level": "B2",
    "title": "Passiversatzformen",
    "grammarDescription": "Dalam bahasa Jerman, alih-alih selalu memakai Passiv yang kaku, ada cara elegan untuk mengungkapkannya, disebut Passiversatzformen (Bentuk Pengganti Pasif). Bentuk-bentuk utama:\n1. 'Sich lassen' + Infinitiv: Das Problem lässt sich lösen. (Masalah itu bisa diselesaikan.)\n2. 'Sein' + 'zu' + Infinitiv: Die Aufgabe ist zu erledigen. (Tugas harus diselesaikan.)\n3. Adjektiva berakhiran '-bar', '-lich': Die Schrift ist lesbar. (Tulisan itu bisa dibaca.)\n\nBentuk-bentuk ini sering muncul di artikel dan bahasa profesional tingkat B2/C1.",
    "vocabulary": [
      {
        "id": "v-b212-1",
        "word": "sich lassen + Infinitiv",
        "translation": "dapat dilakukan (pasif)",
        "exampleSentence": "Das Auto lässt sich reparieren.",
        "phonetic": "zikh LASS-en",
        "level": "B2"
      },
      {
        "id": "v-b212-2",
        "word": "lesbar",
        "translation": "dapat dibaca",
        "exampleSentence": "Die Schrift ist nicht lesbar.",
        "phonetic": "LEES-bar",
        "level": "B2"
      }
    ],
    "exercises": [
      {
        "question": "Bentuk Passiversatz manakah yang bermakna sama dengan 'Das kann repariert werden'?",
        "options": [
          "Das lässt sich reparieren.",
          "Das ist repariert.",
          "Das wird reparieren.",
          "Das hat repariert."
        ],
        "correctAnswer": 0
      }
    ]
  },
  {
    "id": "a1-14",
    "level": "A1",
    "title": "Kasus Nominativ vs Akkusativ",
    "grammarDescription": "• Nominatif = subjek (siapa yang melakukan aksi)\n• Akkusatif = objek langsung (apa yang dikenai aksi)\n• Artikel berubah di Akkusatif:\n•   der → den, die → die, das → das, die (pl) → die\n• Hanya maskulin yang berubah: der → den\n• Verba yang membutuhkan Akkusativ: haben, brauchen, lesen, sehen, kaufen, trinken, essen, spielen\n\nContoh:\n- Der Mann (Nominativ) liest das Buch (Akkusativ).\n- Die Frau (Nom) trinkt den Kaffee (Akk).\n- Das Kind (Nom) spielt mit dem Hund (Dat) — tidak Akkusatif karena 'mit'.\n- Ich (Nom) sehe die Katze (Akk).\n- Er (Nom) kauft ein Auto (Akk).",
    "vocabulary": [
      {
        "id": "der-mann",
        "word": "der Mann",
        "article": "der",
        "translation": "pria",
        "exampleSentence": "Der Mann liest ein Buch.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-frau",
        "word": "die Frau",
        "article": "die",
        "translation": "wanita",
        "exampleSentence": "Die Frau trinkt Kaffee.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-kind",
        "word": "das Kind",
        "article": "das",
        "translation": "anak",
        "exampleSentence": "Das Kind spielt im Garten.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-buch",
        "word": "das Buch",
        "article": "das",
        "translation": "buku",
        "exampleSentence": "Ich lese ein Buch.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "der-kaffee",
        "word": "der Kaffee",
        "article": "der",
        "translation": "kopi",
        "exampleSentence": "Er trinkt den Kaffee.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-zeitung",
        "word": "die Zeitung",
        "article": "die",
        "translation": "koran",
        "exampleSentence": "Sie liest die Zeitung.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-auto",
        "word": "das Auto",
        "article": "das",
        "translation": "mobil",
        "exampleSentence": "Er fährt ein Auto.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "der-hund",
        "word": "der Hund",
        "article": "der",
        "translation": "anjing",
        "exampleSentence": "Ich sehe den Hund.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-katze",
        "word": "die Katze",
        "article": "die",
        "translation": "kucing",
        "exampleSentence": "Sie streichelt die Katze.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-wasser",
        "word": "das Wasser",
        "article": "das",
        "translation": "air",
        "exampleSentence": "Er trinkt das Wasser.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "___ Mann liest ein Buch. (Subjek)",
        "options": [
          "Der",
          "Den",
          "Dem",
          "Das"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich sehe ___ Hund. (Objek langsung)",
        "options": [
          "der",
          "den",
          "dem",
          "das"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Die Frau trinkt ___ Kaffee. (Akkusativ)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das Kind spielt ___ Ball. (Akkusativ)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Welcher Satz ist richtig?",
        "options": [
          "Der Mann kauft der Zeitung.",
          "Der Mann kauft die Zeitung.",
          "Der Mann kauft dem Zeitung.",
          "Der Mann kauft den Zeitung."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Er liest ___ Buch. (Akkusativ)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ Kinder spielen im Garten. (Subjek)",
        "options": [
          "Der",
          "Den",
          "Die",
          "Das"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Ich kaufe ___ Auto. (Akkusativ)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Der Mann (Nominativ) liest das Buch (Akkusativ).",
      "Die Frau (Nom) trinkt den Kaffee (Akk).",
      "Das Kind (Nom) spielt mit dem Hund (Dat) — tidak Akkusatif karena 'mit'."
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-15",
    "level": "A1",
    "title": "Kasus Dativ",
    "grammarDescription": "• Dativ = objek tidak langsung (kepada siapa, untuk siapa)\n• Artikel berubah:\n•   der → dem, die → der, das → dem, die (pl) → den\n• Artikel tidak tentu: ein → einem, eine → einer, ein → einem\n• Verba yang membutuhkan Dativ: helfen, danken, gefallen, gehören, sagen, geben, schicken\n• Präposisi selalu Dativ: mit, aus, zu, bei, nach, von, seit\n\nContoh:\n- Ich gebe dem Mann das Buch. (Akk: das Buch, Dat: dem Mann)\n- Sie hilft der Frau. (Dat: der Frau)\n- Das Buch gehört dem Kind. (Dat: dem Kind)\n- Er schickt der Lehrerin eine E-Mail. (Dat: der Lehrerin)\n- Ich komme aus Deutschland. (aus + Dat)",
    "vocabulary": [
      {
        "id": "helfen-+-dat",
        "word": "helfen + Dat",
        "article": "dem",
        "translation": "membantu",
        "exampleSentence": "Ich helfe dem Mann.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "danken-+-dat",
        "word": "danken + Dat",
        "article": "der",
        "translation": "berterima kasih",
        "exampleSentence": "Ich danke der Frau.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gefallen-+-dat",
        "word": "gefallen + Dat",
        "article": "dem",
        "translation": "menyenangi",
        "exampleSentence": "Das Buch gefällt dem Kind.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gehören-+-dat",
        "word": "gehören + Dat",
        "article": "dem",
        "translation": "milik",
        "exampleSentence": "Das Auto gehört dem Mann.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "der-arzt",
        "word": "der Arzt",
        "article": "der",
        "translation": "dokter",
        "exampleSentence": "Ich gehe zum Arzt.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-ärztin",
        "word": "die Ärztin",
        "article": "die",
        "translation": "dokter wanita",
        "exampleSentence": "Die Ärztin hilft mir.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-krankenhaus",
        "word": "das Krankenhaus",
        "article": "das",
        "translation": "rumah sakit",
        "exampleSentence": "Er ist im Krankenhaus.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-adresse",
        "word": "die Adresse",
        "article": "die",
        "translation": "alamat",
        "exampleSentence": "Was ist Ihre Adresse?",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-rezept",
        "word": "das Rezept",
        "article": "das",
        "translation": "resep",
        "exampleSentence": "Der Arzt gibt mir ein Rezept.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-medizin",
        "word": "die Medizin",
        "article": "die",
        "translation": "obat",
        "exampleSentence": "Die Medizin hilft mir.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich helfe ___ Mann. (Dativ)",
        "options": [
          "der",
          "den",
          "dem",
          "das"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Sie dankt ___ Frau. (Dativ)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das Buch gehört ___ Kind. (Dativ)",
        "options": [
          "der",
          "den",
          "dem",
          "die"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Er schickt ___ Lehrerin eine E-Mail. (Dativ)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich komme aus ___ (Frankreich).",
        "options": [
          "der",
          "den",
          "dem",
          "die"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Das Auto gehört ___ Mann. (Dativ)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Welcher Satz ist richtig?",
        "options": [
          "Ich gebe den Mann das Buch.",
          "Ich gebe dem Mann das Buch.",
          "Ich gebe der Mann das Buch.",
          "Ich gebe das Mann das Buch."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Er ist im (in dem) ___. (Krankenhaus = neutrum, Dativ)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich gebe dem Mann das Buch. (Akk: das Buch, Dat: dem Mann)",
      "Sie hilft der Frau. (Dat: der Frau)",
      "Das Buch gehört dem Kind. (Dat: dem Kind)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-16",
    "level": "A1",
    "title": "Modalverben (können, müssen, wollen, dürfen)",
    "grammarDescription": "• Modalverben selalu di posisi 2 (verb utama di akhir = Satzklammer)\n• Konjugasi irregular: ich habe Sonderform (kecuali sollen)\n• können: ich kann, du kannst, er kann, wir können, ihr könnt, sie können\n• müssen: ich muss, du musst, er muss, wir müssen, ihr müsst, sie müssen\n• wollen: ich will, du willst, er will, wir wollen, ihr wollt, sie wollen\n• dürfen: ich darf, du darfst, er darf, wir dürfen, ihr dürft, sie dürfen\n• sollen: ich soll, du sollst, er soll, wir sollen, ihr sollt, sie sollen\n\nContoh:\n- Ich kann (modal) Deutsch sprechen (verb utama di akhir).\n- Du musst (modal) die Hausaufgabe machen (di akhir).\n- Er will (modal) Arzt werden (di akhir).\n- Sie darf (modal) nicht rauchen (di akhir).\n- Wir sollen (modal) pünktlich kommen (di akhir).",
    "vocabulary": [
      {
        "id": "können",
        "word": "können",
        "article": "",
        "translation": "bisa/mampu",
        "exampleSentence": "Ich kann Deutsch sprechen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "müssen",
        "word": "müssen",
        "article": "",
        "translation": "harus",
        "exampleSentence": "Du musst lernen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "wollen",
        "word": "wollen",
        "article": "",
        "translation": "ingin",
        "exampleSentence": "Er will Arzt werden.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "dürfen",
        "word": "dürfen",
        "article": "",
        "translation": "boleh/diizinkan",
        "exampleSentence": "Sie darf nicht rauchen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sollen",
        "word": "sollen",
        "article": "",
        "translation": "seharusnya",
        "exampleSentence": "Ihr sollt pünktlich sein.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-prüfung",
        "word": "die Prüfung",
        "article": "die",
        "translation": "ujian",
        "exampleSentence": "Ich muss eine Prüfung machen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-hausaufgabe",
        "word": "die Hausaufgabe",
        "article": "die",
        "translation": "pekerjaan rumah",
        "exampleSentence": "Du musst die Hausaufgabe machen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-studium",
        "word": "das Studium",
        "article": "das",
        "translation": "kuliah",
        "exampleSentence": "Er will studieren.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-arbeit",
        "word": "die Arbeit",
        "article": "die",
        "translation": "pekerjaan",
        "exampleSentence": "Ich muss arbeiten.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "der-schlaf",
        "word": "der Schlaf",
        "article": "der",
        "translation": "tidur",
        "exampleSentence": "Ich muss schlafen.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich ___ Deutsch sprechen. (bisa)",
        "options": [
          "kann",
          "kannst",
          "können",
          "könnt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Du ___ die Hausaufgabe machen. (harus)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er ___ Arzt werden. (ingin)",
        "options": [
          "will",
          "willst",
          "wollen",
          "wollt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Sie ___ nicht rauchen. (tidak boleh)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Welcher Satz ist richtig?",
        "options": [
          "Ich muss arbeiten ich.",
          "Ich muss ich arbeiten.",
          "Ich muss arbeiten.",
          "Ich ich muss arbeiten."
        ],
        "correctAnswer": 2
      },
      {
        "question": "Wir ___ pünktlich kommen. (seharusnya)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ihr ___ die Prüfung machen. (harus)",
        "options": [
          "müsst",
          "musst",
          "müssen",
          "muss"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Sie (formal) ___ bitte sitzen. (boleh/silakan)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich kann (modal) Deutsch sprechen (verb utama di akhir).",
      "Du musst (modal) die Hausaufgabe machen (di akhir).",
      "Er will (modal) Arzt werden (di akhir)."
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-17",
    "level": "A1",
    "title": "Waktu Lampau: Perfekt",
    "grammarDescription": "• Perfekt = haben/sein + Partizip II\n• Sein digunakan untuk: verba perjalanan (gehen, fahren, fliegen, kommen), verba perubahan (sterben, aufwachen, einschlafen), dan sein/bleiben\n• Haben digunakan untuk: semua verba lainnya\n• Partizip II beraturan: ge- + stem + -t (gemacht, gelernt)\n• Partizip II tidak beraturan: ge- + stem berubah + -en (gegessen, getrunken, geschrieben)\n• Partizip II selalu di posisi akhir kalimat\n\nContoh:\n- Ich habe Pizza gegessen. (haben — makan biasa)\n- Er ist nach Berlin gefahren. (sein — perjalanan)\n- Wir haben Deutsch gelernt. (haben — belajar)\n- Ich bin nach Hause gegangen. (sein — pergi)\n- Sie hat einen Brief geschrieben. (haben — menulis)",
    "vocabulary": [
      {
        "id": "gegessen-(essen)",
        "word": "gegessen (essen)",
        "article": "",
        "translation": "makan",
        "exampleSentence": "Ich habe Pizza gegessen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "getrunken-(trinken)",
        "word": "getrunken (trinken)",
        "article": "",
        "translation": "minum",
        "exampleSentence": "Er hat Kaffee getrunken.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gelernt-(lernen)",
        "word": "gelernt (lernen)",
        "article": "",
        "translation": "belajar",
        "exampleSentence": "Wir haben Deutsch gelernt.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "geschrieben-(schreiben)",
        "word": "geschrieben (schreiben)",
        "article": "",
        "translation": "menulis",
        "exampleSentence": "Sie hat einen Brief geschrieben.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gelesen-(lesen)",
        "word": "gelesen (lesen)",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Ich habe ein Buch gelesen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gefahren-(fahren)",
        "word": "gefahren (fahren)",
        "article": "",
        "translation": "berkendara/pergi",
        "exampleSentence": "Er ist nach Berlin gefahren.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gegangen-(gehen)",
        "word": "gegangen (gehen)",
        "article": "",
        "translation": "pergi/jalan",
        "exampleSentence": "Ich bin ins Kino gegangen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gewesen-(sein)",
        "word": "gewesen (sein)",
        "article": "",
        "translation": "adalah/pernah",
        "exampleSentence": "Wir sind in Berlin gewesen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "geschlafen-(schlafen)",
        "word": "geschlafen (schlafen)",
        "article": "",
        "translation": "tidur",
        "exampleSentence": "Ich habe gut geschlafen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gemacht-(machen)",
        "word": "gemacht (machen)",
        "article": "",
        "translation": "melakukan",
        "exampleSentence": "Sie hat ihre Hausaufgaben gemacht.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich ___ Pizza gegessen. (haben)",
        "options": [
          "habe",
          "hat",
          "haben",
          "hast"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ___ nach Berlin gefahren. (sein)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Wir ___ Deutsch gelernt.",
        "options": [
          "haben",
          "hat",
          "habe",
          "hast"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich ___ Pizza gegessen. (Partizip II von essen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Sie ___ einen Brief geschrieben. (Partizip II)",
        "options": [
          "geschrieben",
          "geschrieben",
          "geschrieben",
          "geschrieben"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Wir ___ in Berlin gewohnt. (haben/sein?)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich ___ ins Kino gegangen. (haben/sein?)",
        "options": [
          "bin",
          "habe",
          "ist",
          "hat"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ___ Fußball gespielt. (Partizip II von spielen)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich habe Pizza gegessen. (haben — makan biasa)",
      "Er ist nach Berlin gefahren. (sein — perjalanan)",
      "Wir haben Deutsch gelernt. (haben — belajar)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-18",
    "level": "A1",
    "title": "Trennbare Verben (aufmachen, anrufen, dst)",
    "grammarDescription": "• Prefix (an-, auf-, aus-, ein-, ab-, zu-, etc.) terpisah dari verb\n• Verb utama di posisi 2, prefix di akhir kalimat\n• Satzklammer: posisi 2 ↔ akhir kalimat\n• Kalimat tidak langsung: prefix bergabung kembali (Ich weiß, dass er anruft)\n• Pertanyaan: prefix di depan (Rufst du mich an?)\n\nContoh:\n- Ich rufe (V2) dich (Akk) um 5 Uhr (Objekt) an (prefix).\n- Mach (Imperativ) das Fenster (Akk) auf (prefix)!\n- Er steht (V2) um 7 Uhr (Zeit) auf (prefix).\n- Rufst (V2) du (Subjekt) mich (Akk) an (prefix)?\n- Ich weiß, dass er um 5 Uhr anruft. (kein Satzklammer)",
    "vocabulary": [
      {
        "id": "aufmachen",
        "word": "aufmachen",
        "article": "",
        "translation": "membuka",
        "exampleSentence": "Mach das Fenster auf!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "zumachen",
        "word": "zumachen",
        "article": "",
        "translation": "menutup",
        "exampleSentence": "Mach die Tür zu!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "anrufen",
        "word": "anrufen",
        "article": "",
        "translation": "menelepon",
        "exampleSentence": "Ich rufe dich an.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "einkaufen",
        "word": "einkaufen",
        "article": "",
        "translation": "berbelanja",
        "exampleSentence": "Wir kaufen im Supermarkt ein.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "aufstehen",
        "word": "aufstehen",
        "article": "",
        "translation": "bangun tidur",
        "exampleSentence": "Ich stehe um 7 Uhr auf.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "ausgehen",
        "word": "ausgehen",
        "article": "",
        "translation": "keluar rumah",
        "exampleSentence": "Wir gehen am Abend aus.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "ankommen",
        "word": "ankommen",
        "article": "",
        "translation": "tiba/datang",
        "exampleSentence": "Der Zug kommt um 10 Uhr an.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "abfahren",
        "word": "abfahren",
        "article": "",
        "translation": "berangkat",
        "exampleSentence": "Der Zug fährt um 10 Uhr ab.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "fernsehen",
        "word": "fernsehen",
        "article": "",
        "translation": "menonton TV",
        "exampleSentence": "Er sieht gern fern.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "zurückkommen",
        "word": "zurückkommen",
        "article": "",
        "translation": "kembali",
        "exampleSentence": "Ich komme um 5 Uhr zurück.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich ___ um 7 Uhr ___. (aufstehen)",
        "options": [
          "stehe...auf",
          "aufstehe",
          "auf...stehe",
          "stehe auf"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ___ mich ___. (anrufen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ das Fenster ___! (aufmachen, Imperativ)",
        "options": [
          "Mach...auf",
          "Aufmach",
          "Mach auf",
          "Auf...mach"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Wir ___ im Supermarkt ___. (einkaufen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ du mich ___? (anrufen, pertanyaan)",
        "options": [
          "Rufst...an",
          "Anrufst...du",
          "Ruf...an",
          "Anrufst an"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Der Zug ___ um 10 Uhr ___. (abfahren)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich weiß, dass er um 5 Uhr ___. (anrufen, tidak langsung)",
        "options": [
          "anruft",
          "ruft an",
          "anruft an",
          "ruft"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ___ gern ___. (fernsehen)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich rufe (V2) dich (Akk) um 5 Uhr (Objekt) an (prefix).",
      "Mach (Imperativ) das Fenster (Akk) auf (prefix)!",
      "Er steht (V2) um 7 Uhr (Zeit) auf (prefix)."
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-19",
    "level": "A1",
    "title": "Verba Refleksif (Reflexivverben)",
    "grammarDescription": "• Reflexivpronomen Akkusativ: mich, dich, sich, uns, euch, sich\n• Reflexivpronomen Dativ: mir, dir, sich, uns, euch, sich\n• Posisi: setelah verb utama atau di belakang infinitif\n• Verba dengan Dativ: sich (etwas) vorstellen, sich (Dativ) fühlen, sich (Dativ) freuen\n• Verba dengan Akkusativ: sich waschen, sich duschen, sich setzen\n\nContoh:\n- Ich wasche mich. (Akk: mich — cuci diri sendiri)\n- Er duscht sich. (Akk: sich)\n- Ich fühle mich gut. (Akk: mich)\n- Ich freue mich auf dich. (Akk: mich)\n- Setzen Sie sich! (Akk: sich — Imperativ)\n- Ich erinnere mich an dich. (Akk: mich)\n- Er ärgert sich über den Lärm. (Akk: sich)",
    "vocabulary": [
      {
        "id": "sich-waschen",
        "word": "sich waschen",
        "article": "",
        "translation": "mencuci diri",
        "exampleSentence": "Ich wasche mir die Hände.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-duschen",
        "word": "sich duschen",
        "article": "",
        "translation": "mandi",
        "exampleSentence": "Er duscht sich jeden Morgen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-fühlen",
        "word": "sich fühlen",
        "article": "",
        "translation": "merasa",
        "exampleSentence": "Ich fühle mich gut.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-freuen",
        "word": "sich freuen",
        "article": "",
        "translation": "senang",
        "exampleSentence": "Ich freue mich auf dich.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-ärgern",
        "word": "sich ärgern",
        "article": "",
        "translation": "kesal",
        "exampleSentence": "Er ärgert sich über den Lärm.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-setzen",
        "word": "sich setzen",
        "article": "",
        "translation": "duduk",
        "exampleSentence": "Bitte setzen Sie sich.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-erinnern",
        "word": "sich erinnern",
        "article": "",
        "translation": "mengingat",
        "exampleSentence": "Ich erinnere mich an dich.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-vorstellen",
        "word": "sich vorstellen",
        "article": "",
        "translation": "memperkenalkan diri",
        "exampleSentence": "Darf ich mich vorstellen?",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-beeilen",
        "word": "sich beeilen",
        "article": "",
        "translation": "buru-buru",
        "exampleSentence": "Beeil dich!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-ausruhen",
        "word": "sich ausruhen",
        "article": "",
        "translation": "istirahat",
        "exampleSentence": "Ich ruhe mich aus.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich wasche ___. (reflexiv)",
        "options": [
          "mich",
          "mir",
          "sich",
          "uns"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er duscht ___. (reflexiv)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich fühle ___. (reflexiv)",
        "options": [
          "mich",
          "mir",
          "sich",
          "uns"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Wir freuen ___. (reflexiv)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Setzen Sie ___. (Imperativ, reflexiv)",
        "options": [
          "sich",
          "mich",
          "uns",
          "euch"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich erinnere ___. (reflexiv)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Beeil ___. (Imperativ du, reflexiv)",
        "options": [
          "dich",
          "dir",
          "sich",
          "euch"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Sie (formal) setzen ___. (reflexiv)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich wasche mich. (Akk: mich — cuci diri sendiri)",
      "Er duscht sich. (Akk: sich)",
      "Ich fühle mich gut. (Akk: mich)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-20",
    "level": "A1",
    "title": "Nebensätze (dass, weil, wenn)",
    "grammarDescription": "• Klausa anak dipisahkan dengan koma dari klausa utama\n• Konjunksi (weil/dass/wenn) di awal klausa anak\n• Verb utama dipindahkan ke AKHIR klausa anak\n• weil = karena (alasan/sebab akibat)\n• dass = bahwa (objek kalimat, setelah verba seperti glauben, wissen, denken)\n• wenn = jika/ketika (kondisi/waktu)\n\nContoh:\n- Ich bleibe zu Hause, weil ich krank bin. (bin di akhir)\n- Ich glaube, dass er nett ist. (ist di akhir)\n- Wenn es regnet, bleibe ich zu Hause. (bleibe di akhir klausa utama)\n- Er sagt, dass er müde ist. (ist di akhir)\n- Ich komme, wenn du mich brauchst. (brauchst di akhir)",
    "vocabulary": [
      {
        "id": "weil",
        "word": "weil",
        "article": "",
        "translation": "karena",
        "exampleSentence": "Ich bleibe zu Hause, weil ich krank bin.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "dass",
        "word": "dass",
        "article": "",
        "translation": "bahwa",
        "exampleSentence": "Ich glaube, dass er nett ist.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "wenn",
        "word": "wenn",
        "article": "",
        "translation": "jika/ketika",
        "exampleSentence": "Wenn es regnet, bleibe ich zu Hause.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "obwohl",
        "word": "obwohl",
        "article": "",
        "translation": "meskipun",
        "exampleSentence": "Obwohl es kalt ist, gehe ich spazieren.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "der-wetter",
        "word": "der Wetter",
        "article": "das",
        "translation": "cuaca",
        "exampleSentence": "Das Wetter ist heute schön.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-erkältung",
        "word": "die Erkältung",
        "article": "die",
        "translation": "pilek",
        "exampleSentence": "Ich habe eine Erkältung.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-fieber",
        "word": "das Fieber",
        "article": "das",
        "translation": "demam",
        "exampleSentence": "Er hat hohes Fieber.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-medizin",
        "word": "die Medizin",
        "article": "die",
        "translation": "obat",
        "exampleSentence": "Nehmen Sie die Medizin.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-bett",
        "word": "das Bett",
        "article": "das",
        "translation": "tempat tidur",
        "exampleSentence": "Ich bleibe im Bett.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-suppe",
        "word": "die Suppe",
        "article": "die",
        "translation": "sup",
        "exampleSentence": "Ich esse Suppe, weil ich krank bin.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich bleibe zu Hause, weil ich krank ___.",
        "options": [
          "bin",
          "ist",
          "sind",
          "bist"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich glaube, dass er nett ___.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ es regnet, bleibe ich zu Hause.",
        "options": [
          "Weil",
          "Dass",
          "Wenn",
          "Obwohl"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Er sagt, dass er müde ___.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich komme, ___ du mich brauchst.",
        "options": [
          "weil",
          "dass",
          "wenn",
          "obwohl"
        ],
        "correctAnswer": 2
      },
      {
        "question": "___ es kalt ist, gehe ich spazieren.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er bleibt zu Hause, ___ er krank ist.",
        "options": [
          "wenn",
          "dass",
          "weil",
          "obwohl"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Ich weiß, dass du Recht ___.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich bleibe zu Hause, weil ich krank bin. (bin di akhir)",
      "Ich glaube, dass er nett ist. (ist di akhir)",
      "Wenn es regnet, bleibe ich zu Hause. (bleibe di akhir klausa utama)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-21",
    "level": "A1",
    "title": "Komparativ & Superlativ",
    "grammarDescription": "• Komparatif: adjektiv + -er + als (lebih...dari)\n• Superlativ: am + adjektiv + -sten (paling...)\n• Adjektif pendek: tambah huruf akhir (gut→besser→am besten)\n• Adjektif panjang: tambah -er / am -sten (schnell→schneller→am schnellsten)\n• Irregular: gut→besser→am besten, viel→mehr→am meisten, gern→lieber→am liebsten\n\nContoh:\n- Berlin ist größer als München. (Komparativ)\n- München ist am größten in Bayern. (Superlativ)\n- Er ist besser als ich. (Komparativ irregular: gut→besser)\n- Sie ist die Beste in der Klasse. (Superlativ irregular: gut→beste)\n- Ich fahre gern, aber ich fahre lieber Fahrrad. (Komparativ irregular: gern→lieber)",
    "vocabulary": [
      {
        "id": "groß",
        "word": "groß",
        "article": "",
        "translation": "besar/tinggi",
        "exampleSentence": "Berlin ist größer als München.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "klein",
        "word": "klein",
        "article": "",
        "translation": "kecil",
        "exampleSentence": "Das Kind ist kleiner als sein Bruder.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "schnell",
        "word": "schnell",
        "article": "",
        "translation": "cepat",
        "exampleSentence": "Der Zug ist schneller als das Auto.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "langsam",
        "word": "langsam",
        "article": "",
        "translation": "lambat",
        "exampleSentence": "Die Schnecke ist langsamer als der Hund.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gut",
        "word": "gut",
        "article": "",
        "translation": "bagus",
        "exampleSentence": "Er ist besser als ich.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "schlecht",
        "word": "schlecht",
        "article": "",
        "translation": "buruk",
        "exampleSentence": "Das Wetter ist schlechter als gestern.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "teuer",
        "word": "teuer",
        "article": "",
        "translation": "mahal",
        "exampleSentence": "Das Auto ist teurer als das Fahrrad.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "billig",
        "word": "billig",
        "article": "",
        "translation": "murah",
        "exampleSentence": "Das Buch ist billiger als der Film.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "warm",
        "word": "warm",
        "article": "",
        "translation": "hangat",
        "exampleSentence": "Der Sommer ist wärmer als der Winter.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "kalt",
        "word": "kalt",
        "article": "",
        "translation": "dingin",
        "exampleSentence": "Der Winter ist kälter als der Sommer.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Berlin ist ___ als München. (groß)",
        "options": [
          "größer",
          "großter",
          "am größten",
          "groß"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ist ___ als ich. (gut)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das ist ___ Buch. (gut, Superlativ)",
        "options": [
          "das beste",
          "das besser",
          "am besten",
          "besser"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Der Zug ist ___ als das Auto. (schnell)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich fahre ___ Fahrrad als mit dem Bus. (gern)",
        "options": [
          "lieber",
          "am liebsten",
          "gerner",
          "lieber als"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Der Sommer ist ___ als der Winter. (warm)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das ist ___ Hotel in der Stadt. (teuer, Superlativ)",
        "options": [
          "das teuerste",
          "am teuersten",
          "teurer",
          "das teurere"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Berlin ist ___ als München. (alt)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Berlin ist größer als München. (Komparativ)",
      "München ist am größten in Bayern. (Superlativ)",
      "Er ist besser als ich. (Komparativ irregular: gut→besser)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-22",
    "level": "A1",
    "title": "Imperativ (Perintah)",
    "grammarDescription": "• du: hilangkan -st dari konjugasi (du kommst → komm!)\n• ihr: gunakan bentuk konjugasi normal (ihr kommt → kommt!)\n• Sie: gunakan bentuk infinitif dengan Sie (Sie kommen → kommen Sie!)\n• Perubahan vokal: du→du gehst → geh (tidak ada perubahan)\n• Irregular: du fährst → fahr!, du liest → lies!, du sprichst → sprich!\n\nContoh:\n- Komm her! (du — hilangkan -st)\n- Kommt her! (ihr — bentuk normal)\n- Kommen Sie her! (Sie — infinitif + Sie)\n- Lies das Buch! (du irregular: du liest → lies)\n- Fahr langsam! (du irregular: du fährst → fahr)",
    "vocabulary": [
      {
        "id": "komm!",
        "word": "komm!",
        "article": "",
        "translation": "datang!",
        "exampleSentence": "Komm her!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "geh!",
        "word": "geh!",
        "article": "",
        "translation": "pergi!",
        "exampleSentence": "Geh nach Hause!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lies!",
        "word": "lies!",
        "article": "",
        "translation": "baca!",
        "exampleSentence": "Lies das Buch!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "schreib!",
        "word": "schreib!",
        "article": "",
        "translation": "tulis!",
        "exampleSentence": "Schreib einen Brief!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "hör-zu!",
        "word": "hör zu!",
        "article": "",
        "translation": "dengarkan!",
        "exampleSentence": "Hör mir zu!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "setz-dich!",
        "word": "setz dich!",
        "article": "",
        "translation": "duduk!",
        "exampleSentence": "Setz dich bitte!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "kommst-du!",
        "word": "kommst du!",
        "article": "",
        "translation": "datanglah!",
        "exampleSentence": "Kommst du mit?",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "essen-sie!",
        "word": "essen Sie!",
        "article": "",
        "translation": "makanlah! (formal)",
        "exampleSentence": "Essen Sie bitte!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "ruft-an!",
        "word": "ruft an!",
        "article": "",
        "translation": "teleponlah!",
        "exampleSentence": "Ruf mich an!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "beeil-dich!",
        "word": "beeil dich!",
        "article": "",
        "translation": "cepatlah!",
        "exampleSentence": "Beeil dich, wir haben es eilig!",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "___ her! (du, kommen)",
        "options": [
          "Komm",
          "Kommst",
          "Kommen",
          "Kommt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "___ das Buch! (du, lesen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ Sie her! (formal, kommen)",
        "options": [
          "Kommen",
          "Komm",
          "Kommt",
          "Kommst"
        ],
        "correctAnswer": 0
      },
      {
        "question": "___ her! (ihr, kommen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ mich an! (du, anrufen)",
        "options": [
          "Ruf",
          "Rufst",
          "Rufen",
          "Ruft"
        ],
        "correctAnswer": 0
      },
      {
        "question": "___ langsam! (du, fahren)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ bitte! (Sie, essen)",
        "options": [
          "Essen",
          "Iss",
          "Esst",
          "Isst"
        ],
        "correctAnswer": 0
      },
      {
        "question": "___ dich! (du, beeilen)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Komm her! (du — hilangkan -st)",
      "Kommt her! (ihr — bentuk normal)",
      "Kommen Sie her! (Sie — infinitif + Sie)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-23",
    "level": "A1",
    "title": "Sollen & Dürfen (Kewajiban & Izin)",
    "grammarDescription": "• sollen = seharusnya (kewajiban/saran dari orang lain)\n• dürfen = boleh (izin dari otoritas) / tidak boleh (larangan)\n• sollen: du sollst, er soll, wir sollen\n• dürfen: du darfst, er darf, wir dürfen\n• Negasi: du sollst nicht... (kamu tidak seharusnya), du darfst nicht... (kamu tidak boleh)\n\nContoh:\n- Du sollst mehr lernen. (kewajiban/saran)\n- Du sollst nicht so viel fernsehen. (saran negatif)\n- Darf ich fragen? (izin untuk bertanya)\n- Du darfst hier nicht rauchen. (larangan)\n- Wir sollen pünktlich kommen. (kewajiban dari guru)\n- Sie dürfen hier nicht parken. (larangan resmi)",
    "vocabulary": [
      {
        "id": "sollen",
        "word": "sollen",
        "article": "",
        "translation": "seharusnya",
        "exampleSentence": "Du sollst mehr lernen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "dürfen",
        "word": "dürfen",
        "article": "",
        "translation": "boleh",
        "exampleSentence": "Darf ich fragen?",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-regel",
        "word": "die Regel",
        "article": "die",
        "translation": "aturan",
        "exampleSentence": "Du sollst die Regeln befolgen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-verbot",
        "word": "das Verbot",
        "article": "das",
        "translation": "larangan",
        "exampleSentence": "Rauchen ist hier ein Verbot.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-erlaubnis",
        "word": "das Erlaubnis",
        "article": "die",
        "translation": "izin",
        "exampleSentence": "Du hast die Erlaubnis, hier zu sein.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-schule",
        "word": "die Schule",
        "article": "die",
        "translation": "sekolah",
        "exampleSentence": "Du sollst zur Schule gehen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-hausaufgabe",
        "word": "die Hausaufgabe",
        "article": "die",
        "translation": "pekerjaan rumah",
        "exampleSentence": "Du sollst die Hausaufgabe machen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-essen",
        "word": "das Essen",
        "article": "das",
        "translation": "makanan",
        "exampleSentence": "Du sollst das Essen nicht verschwenden.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "der-arzt",
        "word": "der Arzt",
        "article": "der",
        "translation": "dokter",
        "exampleSentence": "Du sollst zum Arzt gehen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-medizin",
        "word": "die Medizin",
        "article": "die",
        "translation": "obat",
        "exampleSentence": "Du sollst die Medizin nehmen.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Du ___ mehr lernen. (sollen)",
        "options": [
          "sollst",
          "soll",
          "sollen",
          "sollt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "___ ich fragen? (dürfen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Du ___ hier nicht rauchen. (dürfen)",
        "options": [
          "darfst",
          "darf",
          "dürfen",
          "dürft"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Wir ___ pünktlich kommen. (sollen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Sie ___ hier nicht parken. (dürfen)",
        "options": [
          "dürfen",
          "darf",
          "darfst",
          "dürft"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ___ die Hausaufgabe machen. (sollen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Du ___ nicht so viel fernsehen. (sollen)",
        "options": [
          "sollst",
          "soll",
          "sollen",
          "sollt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ihr ___ die Regeln befolgen. (sollen)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Du sollst mehr lernen. (kewajiban/saran)",
      "Du sollst nicht so viel fernsehen. (saran negatif)",
      "Darf ich fragen? (izin untuk bertanya)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-24",
    "level": "A1",
    "title": "Konjunktion denn (Alasan)",
    "grammarDescription": "• denn = karena (alasan, posisi V2 TETAP)\n• weil = karena (alasan, posisi verb di AKHIR)\n• denn tidak mengubah struktur kalimat\n• weil mengubah posisi verb ke akhir (Nebensatz)\n• denn lebih formal/tertulis, weil lebih umum dalam percakapan\n\nContoh:\n- Ich bleibe zu Hause, denn ich bin krank. (bin di posisi 2)\n- Ich bleibe zu Hause, weil ich krank bin. (bin di akhir)\n- Er kommt nicht, denn er hat keine Zeit. (hat di posisi 2)\n- Er kommt nicht, weil er keine Zeit hat. (hat di akhir)",
    "vocabulary": [
      {
        "id": "denn",
        "word": "denn",
        "article": "",
        "translation": "karena",
        "exampleSentence": "Ich bleibe zu Hause, denn ich bin krank.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "krank",
        "word": "krank",
        "article": "",
        "translation": "sakit",
        "exampleSentence": "Er ist krank.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "müde",
        "word": "müde",
        "article": "",
        "translation": "lelah",
        "exampleSentence": "Ich bin sehr müde.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "hungrig",
        "word": "hungrig",
        "article": "",
        "translation": "lapar",
        "exampleSentence": "Das Kind ist hungrig.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "durstig",
        "word": "durstig",
        "article": "",
        "translation": "haus",
        "exampleSentence": "Ich bin durstig.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-wetter",
        "word": "das Wetter",
        "article": "das",
        "translation": "cuaca",
        "exampleSentence": "Das Wetter ist schlecht.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-arbeit",
        "word": "die Arbeit",
        "article": "die",
        "translation": "pekerjaan",
        "exampleSentence": "Die Arbeit ist schwer.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-prüfung",
        "word": "die Prüfung",
        "article": "die",
        "translation": "ujian",
        "exampleSentence": "Die Prüfung ist morgen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-straße",
        "word": "die Straße",
        "article": "die",
        "translation": "jalan",
        "exampleSentence": "Die Straße ist voll.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "der-verkehr",
        "word": "der Verkehr",
        "article": "der",
        "translation": "lalu lintas",
        "exampleSentence": "Der Verkehr ist schlimm.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich bleibe zu Hause, ___ ich krank bin.",
        "options": [
          "denn",
          "weil",
          "dass",
          "wenn"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er kommt nicht, ___ er keine Zeit hat.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich bin müde, ___ ich nicht gut geschlafen habe.",
        "options": [
          "denn",
          "weil",
          "dass",
          "wenn"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Sie bleibt zu Hause, ___ das Wetter schlecht ist.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich komme nicht, ___ ich keine Zeit habe.",
        "options": [
          "denn",
          "weil",
          "dass",
          "wenn"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Er bleibt zu Hause, ___ er krank ist.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Welcher Satz ist richtig mit 'denn'?",
        "options": [
          "Ich bin krank, denn ich habe Fieber.",
          "Ich bin krank, denn ich Fieber habe.",
          "Ich bin krank, denn ich Fieber hat.",
          "Ich bin krank, denn ich habe Fieber habe."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Wir gehen nicht ins Kino, ___ wir kein Geld haben.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich bleibe zu Hause, denn ich bin krank. (bin di posisi 2)",
      "Ich bleibe zu Hause, weil ich krank bin. (bin di akhir)",
      "Er kommt nicht, denn er hat keine Zeit. (hat di posisi 2)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-25",
    "level": "A1",
    "title": "Indirekte Fragesätze",
    "grammarDescription": "• ob = apakah (untuk pertanyaan ya/tidak)\n• W-Fragewörter: wo, wann, wie, warum, was, wer, wie viel\n• Posisi verb di AKHIR klausa anak (seperti weil/dass)\n• Tidak ada inversi (verb tidak di posisi 2)\n• Kalimat utama + koma + ob/W-Fragewort + ... + verb di akhir\n\nContoh:\n- Ich weiß nicht, ob er kommt. (ob + verb di akhir)\n- Kannst du mir sagen, wann der Zug fährt? (wann + verb di akhir)\n- Er fragt, wie man das macht. (wie + verb di akhir)\n- Ich verstehe nicht, warum er das tut. (warum + verb di akhir)\n- Sag mir, was du denkst. (was + verb di akhir)",
    "vocabulary": [
      {
        "id": "ob",
        "word": "ob",
        "article": "",
        "translation": "apakah",
        "exampleSentence": "Ich weiß nicht, ob er kommt.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "wo",
        "word": "wo",
        "article": "",
        "translation": "dimana",
        "exampleSentence": "Ich frage mich, wo er wohnt.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "wann",
        "word": "wann",
        "article": "",
        "translation": "kapan",
        "exampleSentence": "Kannst du mir sagen, wann der Zug fährt?",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "wie",
        "word": "wie",
        "article": "",
        "translation": "bagaimana",
        "exampleSentence": "Er fragt, wie man das macht.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "warum",
        "word": "warum",
        "article": "",
        "translation": "mengapa",
        "exampleSentence": "Ich verstehe nicht, warum er das tut.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "was",
        "word": "was",
        "article": "",
        "translation": "apa",
        "exampleSentence": "Sag mir, was du denkst.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "wer",
        "word": "wer",
        "article": "",
        "translation": "siapa",
        "exampleSentence": "Ich weiß nicht, wer das ist.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "wie-viel",
        "word": "wie viel",
        "article": "",
        "translation": "berapa",
        "exampleSentence": "Kannst du sagen, wie viel das kostet?",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-adresse",
        "word": "die Adresse",
        "article": "die",
        "translation": "alamat",
        "exampleSentence": "Können Sie mir sagen, wo die Adresse ist?",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-uhrzeit",
        "word": "die Uhrzeit",
        "article": "die",
        "translation": "jam",
        "exampleSentence": "Ich frage, wann die Uhrzeit ist.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich weiß nicht, ___ er kommt. (ya/tidak)",
        "options": [
          "ob",
          "wie",
          "wo",
          "was"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kannst du mir sagen, ___ der Zug fährt?",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er fragt, ___ man das macht.",
        "options": [
          "ob",
          "wie",
          "wo",
          "was"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Ich verstehe nicht, ___ er das tut.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Sag mir, ___ du denkst.",
        "options": [
          "ob",
          "wie",
          "wo",
          "was"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Ich weiß nicht, ___ das ist.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Können Sie mir sagen, ___ die Adresse ist?",
        "options": [
          "ob",
          "wie",
          "wo",
          "was"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Ich frage, ___ das kostet.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich weiß nicht, ob er kommt. (ob + verb di akhir)",
      "Kannst du mir sagen, wann der Zug fährt? (wann + verb di akhir)",
      "Er fragt, wie man das macht. (wie + verb di akhir)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-26",
    "level": "A1",
    "title": "Man + Partizip I",
    "grammarDescription": "• Partizip I = infinitif + -end\n• gehen → gehend, lesen → lesend, schreiben → schreibend\n• Posisi: di akhir kalimat setelah 'man' + verb utama\n• 'Man' selalu orang tunggal (verb selalu bentuk er/sie/es)\n• Digunakan untuk aktivitas umum yang dilakukan orang-orang\n\nContoh:\n- Man sieht Leute lesend im Park. (orang-orang membaca)\n- Man hört Kinder spielend im Garten. (anak-anak bermain)\n- Man findet viele Leute arbeitend im Büro. (orang-orang bekerja)\n- Man sieht Leute gehend auf der Straße. (orang-orang berjalan)",
    "vocabulary": [
      {
        "id": "man",
        "word": "man",
        "article": "",
        "translation": "orang/seseorang",
        "exampleSentence": "Man liest hier viel.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gehend",
        "word": "gehend",
        "article": "",
        "translation": "berjalan",
        "exampleSentence": "Man sieht viele Menschen gehend.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lesend",
        "word": "lesend",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Man findet viele Menschen lesend.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "schreibend",
        "word": "schreibend",
        "article": "",
        "translation": "menulis",
        "exampleSentence": "Man hört viele Leute schreibend.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lesend",
        "word": "lesend",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Man sieht Leute lesend im Park.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lesend",
        "word": "lesend",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Man findet Leute lesend im Café.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lesend",
        "word": "lesend",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Man sieht Leute lesend in der U-Bahn.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lesend",
        "word": "lesend",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Man hört Leute lesend im Stadtpark.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lesend",
        "word": "lesend",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Man findet Leute lesend in der Bibliothek.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lesend",
        "word": "lesend",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Man sieht Leute lesend im Wartezimmer.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Man sieht Leute ___ im Park.",
        "options": [
          "lesend",
          "lesen",
          "gelesen",
          "lesend"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Man hört Kinder ___ im Garten.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Man findet viele Leute ___ im Büro.",
        "options": [
          "arbeitend",
          "arbeiten",
          "gearbeitet",
          "arbeitend"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Man sieht Leute ___ auf der Straße.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Man findet Leute ___ im Café.",
        "options": [
          "schreibend",
          "schreiben",
          "geschrieben",
          "schreibend"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Man hört Leute ___ im Restaurant.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Man sieht Leute ___ in der U-Bahn.",
        "options": [
          "lesend",
          "lesen",
          "gelesen",
          "lesend"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Man findet Leute ___ in der Bibliothek.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Man sieht Leute lesend im Park. (orang-orang membaca)",
      "Man hört Kinder spielend im Garten. (anak-anak bermain)",
      "Man findet viele Leute arbeitend im Büro. (orang-orang bekerja)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-14",
    "level": "A2",
    "title": "Temporale Präpositionen (seit, für, ab, bis)",
    "grammarDescription": "• seit + Dativ: masa yang masih berlangsung (sejak)\n• für + Akkusativ: durasi waktu (selama)\n• ab + Dativ: titik awal waktu (mulai dari)\n• bis + Akkusativ: titik akhir waktu (sampai)\n• nachdem + Subjekt + Verb di AKHIR: setelah\n\nContoh:\n- Ich lebe seit 2020 in Berlin. (seit + Dativ)\n- Er arbeitet für 8 Stunden. (für + Akk)\n- Ab morgen bin ich im Urlaub. (ab + Dativ)\n- Ich arbeite bis 18 Uhr. (bis + Akk)\n- Nachdem ich gegessen habe, gehe ich spazieren. (verb di akhir)",
    "vocabulary": [
      {
        "id": "seit",
        "word": "seit",
        "article": "",
        "translation": "sejak",
        "exampleSentence": "Ich lebe seit 5 Jahren in Berlin.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "für",
        "word": "für",
        "article": "",
        "translation": "selama",
        "exampleSentence": "Er arbeitet für 3 Stunden.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "ab",
        "word": "ab",
        "article": "",
        "translation": "mulai dari",
        "exampleSentence": "Ab morgen bin ich im Urlaub.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "bis",
        "word": "bis",
        "article": "",
        "translation": "sampai",
        "exampleSentence": "Ich arbeite bis 18 Uhr.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "nachdem",
        "word": "nachdem",
        "article": "",
        "translation": "setelah",
        "exampleSentence": "Nachdem ich gegessen habe, gehe ich spazieren.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-urlaub",
        "word": "der Urlaub",
        "article": "der",
        "translation": "liburan",
        "exampleSentence": "Im Urlaub fahre ich ans Meer.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-arbeit",
        "word": "die Arbeit",
        "article": "die",
        "translation": "pekerjaan",
        "exampleSentence": "Nach der Arbeit gehe ich nach Hause.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-wochenende",
        "word": "das Wochenende",
        "article": "das",
        "translation": "akhir pekan",
        "exampleSentence": "Am Wochenende mache ich nichts.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-morgen",
        "word": "der Morgen",
        "article": "der",
        "translation": "pagi",
        "exampleSentence": "Am Morgen trinke ich Kaffee.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-abend",
        "word": "der Abend",
        "article": "der",
        "translation": "sore/malam",
        "exampleSentence": "Am Abend sehe ich fern.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Ich lebe ___ 5 Jahren in Berlin.",
        "options": [
          "seit",
          "für",
          "ab",
          "bis"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er arbeitet ___ 8 Stunden.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ morgen bin ich im Urlaub.",
        "options": [
          "Seit",
          "Für",
          "Ab",
          "Bis"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Ich arbeite ___ 18 Uhr.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ ich gegessen habe, gehe ich spazieren.",
        "options": [
          "Seit",
          "Für",
          "Ab",
          "Nachdem"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Ich wohne ___ 2 Jahren hier.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Der Film dauert ___ 2 Stunden.",
        "options": [
          "seit",
          "für",
          "ab",
          "bis"
        ],
        "correctAnswer": 1
      },
      {
        "question": "___ dem Essen gehe wir spazieren.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich lebe seit 2020 in Berlin. (seit + Dativ)",
      "Er arbeitet für 8 Stunden. (für + Akk)",
      "Ab morgen bin ich im Urlaub. (ab + Dativ)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-15",
    "level": "A2",
    "title": "Lokale Präpositionen (von, aus, zu, nach)",
    "grammarDescription": "• von + Dativ: dari permukaan (dari meja, dari atap)\n• aus + Dativ: dari dalam (dari kota, dari negara)\n• zu + Dativ: ke tempat (ke dokter, ke sekolah)\n• nach + Dativ: ke kota/negara (nach Berlin, nach Deutschland)\n• in + Akk: ke dalam (in die Schule, in die Stadt)\n• in + Dat: di dalam (in der Schule, in der Stadt)\n\nContoh:\n- Ich komme von der Arbeit. (von + Dativ)\n- Ich komme aus Deutschland. (aus + Dativ)\n- Ich gehe zum Arzt. (zu + dem → zum)\n- Ich fahre nach Berlin. (nach + Dativ)\n- Ich gehe in die Schule. (in + Akk — ke dalam)\n- Ich bin in der Schule. (in + Dat — di dalam)",
    "vocabulary": [
      {
        "id": "von",
        "word": "von",
        "article": "",
        "translation": "dari",
        "exampleSentence": "Ich komme von der Arbeit.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "aus",
        "word": "aus",
        "article": "",
        "translation": "dari dalam",
        "exampleSentence": "Ich komme aus Deutschland.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "zu",
        "word": "zu",
        "article": "",
        "translation": "ke",
        "exampleSentence": "Ich gehe zum Arzt.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "nach",
        "word": "nach",
        "article": "",
        "translation": "ke (kota/negara)",
        "exampleSentence": "Ich fahre nach Berlin.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "in",
        "word": "in",
        "article": "",
        "translation": "ke dalam / di dalam",
        "exampleSentence": "Ich gehe in die Schule.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-schule",
        "word": "die Schule",
        "article": "die",
        "translation": "sekolah",
        "exampleSentence": "Ich gehe zur Schule.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-haus",
        "word": "das Haus",
        "article": "das",
        "translation": "rumah",
        "exampleSentence": "Ich komme aus dem Haus.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-büro",
        "word": "das Büro",
        "article": "das",
        "translation": "kantor",
        "exampleSentence": "Ich gehe ins Büro.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-stadt",
        "word": "die Stadt",
        "article": "die",
        "translation": "kota",
        "exampleSentence": "Ich fahre in die Stadt.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-land",
        "word": "das Land",
        "article": "das",
        "translation": "negeri",
        "exampleSentence": "Ich komme aus einem anderen Land.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Ich komme ___ der Arbeit.",
        "options": [
          "von",
          "aus",
          "zu",
          "nach"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich komme ___ Deutschland.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich gehe ___ Arzt.",
        "options": [
          "von",
          "aus",
          "zu",
          "nach"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Ich fahre ___ Berlin.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich gehe ___ die Schule.",
        "options": [
          "von",
          "aus",
          "zu",
          "in"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Ich bin ___ der Schule.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich komme ___ einem anderen Land.",
        "options": [
          "von",
          "aus",
          "zu",
          "nach"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Ich gehe ___ das Büro.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich komme von der Arbeit. (von + Dativ)",
      "Ich komme aus Deutschland. (aus + Dativ)",
      "Ich gehe zum Arzt. (zu + dem → zum)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-16",
    "level": "A2",
    "title": "Positionsverben (sitzen, liegen, stehen, gehen, fahren)",
    "grammarDescription": "• Positionsverben (sitzen, liegen, stehen) → Dativ (posisi statis)\n• Verba gerak (gehen, fahren, fliegen) → Akkusativ (pergerakan)\n• Wechselpräpositionen: in, an, auf, über, unter, vor, hinter, neben, zwischen\n• Pertanyaan: Wo? (Dativ) — Woher? (Dativ) — Wohin? (Akkusativ)\n\nContoh:\n- Das Buch liegt auf dem Tisch. (Dativ — posisi statis)\n- Ich lege das Buch auf den Tisch. (Akk — pergerakan)\n- Er steht an der Wand. (Dativ — posisi statis)\n- Er geht an die Wand. (Akk — pergerakan)\n- Ich sitze auf dem Sofa. (Dativ — posisi statis)",
    "vocabulary": [
      {
        "id": "sitzen",
        "word": "sitzen",
        "article": "",
        "translation": "duduk",
        "exampleSentence": "Ich sitze auf dem Stuhl.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "liegen",
        "word": "liegen",
        "article": "",
        "translation": "berbaring/terletak",
        "exampleSentence": "Das Buch liegt auf dem Tisch.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "stehen",
        "word": "stehen",
        "article": "",
        "translation": "berdiri",
        "exampleSentence": "Er steht an der Bushaltestelle.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "gehen",
        "word": "gehen",
        "article": "",
        "translation": "berjalan/pergi",
        "exampleSentence": "Ich gehe in die Schule.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "fahren",
        "word": "fahren",
        "article": "",
        "translation": "berkendara/pergi",
        "exampleSentence": "Er fährt mit dem Auto.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "fliegen",
        "word": "fliegen",
        "article": "",
        "translation": "terbang",
        "exampleSentence": "Wir fliegen nach Mallorca.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-stuhl",
        "word": "der Stuhl",
        "article": "der",
        "translation": "kursi",
        "exampleSentence": "Der Stuhl steht im Zimmer.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-tisch",
        "word": "der Tisch",
        "article": "der",
        "translation": "meja",
        "exampleSentence": "Das Buch liegt auf dem Tisch.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-sofa",
        "word": "das Sofa",
        "article": "das",
        "translation": "sofa",
        "exampleSentence": "Ich sitze auf dem Sofa.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-bushaltestelle",
        "word": "die Bushaltestelle",
        "article": "die",
        "translation": "halte bus",
        "exampleSentence": "Er steht an der Bushaltestelle.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Das Buch liegt ___ dem Tisch. (posisi)",
        "options": [
          "auf dem",
          "auf den",
          "auf der",
          "auf das"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich lege das Buch ___ den Tisch. (gerak)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er steht ___ der Wand. (posisi)",
        "options": [
          "an der",
          "an den",
          "an dem",
          "an die"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er geht ___ die Wand. (gerak)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich sitze ___ dem Sofa. (posisi)",
        "options": [
          "auf dem",
          "auf den",
          "auf der",
          "auf das"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er fährt ___ dem Auto. (gerak)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das Bild hängt ___ der Wand. (posisi)",
        "options": [
          "an der",
          "an den",
          "an dem",
          "an die"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Wir gehen ___ das Kino. (gerak)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Das Buch liegt auf dem Tisch. (Dativ — posisi statis)",
      "Ich lege das Buch auf den Tisch. (Akk — pergerakan)",
      "Er steht an der Wand. (Dativ — posisi statis)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-17",
    "level": "A2",
    "title": "Adjektivendungen (bestimmt/unbestimmt)",
    "grammarDescription": "• Artikel pasti (der, die, das): -e untuk semua kasus kecuali Akk maskulin → -en\n• Artikel tidak pasti (ein, eine): -er (Nom mask), -e (Nom fem/neut), -en (Akk/Dat)\n• Tanpa artikel: -er (Nom mask), -e (Nom fem/neut), -es (Nom/Akk neut), -en (Dat/Akk)\n• Dativ selalu -en untuk semua jenis kelamin\n\nContoh:\n- Der gute Film. (Artikel pasti, Nominativ maskulin → -e)\n- Den guten Film. (Artikel pasti, Akk maskulin → -en)\n- Ein guter Film. (Artikel tidak pasti, Nom maskulin → -er)\n- Ein guter Film. (Artikel tidak pasti, Nom maskulin → -er)\n- Guter Film. (Tanpa artikel, Nom maskulin → -er)\n- Guten Film. (Tanpa artikel, Akk maskulin → -en)",
    "vocabulary": [
      {
        "id": "gut",
        "word": "gut",
        "article": "",
        "translation": "bagus",
        "exampleSentence": "Das ist ein guter Film.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "schlecht",
        "word": "schlecht",
        "article": "",
        "translation": "buruk",
        "exampleSentence": "Das ist ein schlechter Film.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "groß",
        "word": "groß",
        "article": "",
        "translation": "besar",
        "exampleSentence": "Das ist ein großes Haus.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "klein",
        "word": "klein",
        "article": "",
        "translation": "kecil",
        "exampleSentence": "Das ist ein kleines Kind.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "neu",
        "word": "neu",
        "article": "",
        "translation": "baru",
        "exampleSentence": "Das ist ein neues Auto.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "alt",
        "word": "alt",
        "article": "",
        "translation": "lama/tua",
        "exampleSentence": "Das ist ein altes Buch.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "schön",
        "word": "schön",
        "article": "",
        "translation": "indah",
        "exampleSentence": "Das ist ein schönes Bild.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "interessant",
        "word": "interessant",
        "article": "",
        "translation": "menarik",
        "exampleSentence": "Das ist ein interessantes Buch.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-film",
        "word": "das Film",
        "article": "der",
        "translation": "film",
        "exampleSentence": "Der Film ist gut.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-buch",
        "word": "das Buch",
        "article": "das",
        "translation": "buku",
        "exampleSentence": "Das Buch ist interessant.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Der ___ Film ist gut. (gut, Nom maskulin, artikel pasti)",
        "options": [
          "gute",
          "guter",
          "guten",
          "gutes"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich sehe einen ___ Film. (gut, Akk maskulin, artikel tidak pasti)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das ist ein ___ Buch. (interessant, Nom neutrum, artikel tidak pasti)",
        "options": [
          "interessantes",
          "interessanter",
          "interessanten",
          "interessante"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Der ___ Film ist lang. (lang, Nom maskulin, artikel pasti)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ Film ist gut. (gut, Nom maskulin, tanpa artikel)",
        "options": [
          "Guter",
          "Gute",
          "Guten",
          "Gutes"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich sehe ___ Film. (gut, Akk maskulin, tanpa artikel)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das ist ___ Buch. (interessant, Nom neutrum, tanpa artikel)",
        "options": [
          "ein interessantes",
          "ein interessanter",
          "ein interessanten",
          "ein interessante"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Der ___ Film ist lang. (alt, Nom maskulin, artikel pasti)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Der gute Film. (Artikel pasti, Nominativ maskulin → -e)",
      "Den guten Film. (Artikel pasti, Akk maskulin → -en)",
      "Ein guter Film. (Artikel tidak pasti, Nom maskulin → -er)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-18",
    "level": "A2",
    "title": "Adjektive nach Komparativ & Superlativ",
    "grammarDescription": "• Komparatif: adjektiv + -er + als (lebih...dari)\n• Superlatif: am + adjektiv + -sten (paling...)\n• Adjektif dengan e ganda: groß → größer (ganda jadi satu)\n• Adjektif dengan a/ä: alt → älter (a→ä), nackt → nackter\n• Irregular: gut→besser, viel→mehr, gern→lieber, hoch→höher, nah→näher\n\nContoh:\n- Der Zug ist schneller als das Auto. (Komparativ)\n- Das Auto ist am schnellsten. (Superlativ)\n- Er hat mehr Geld als ich. (Komparativ irregular: viel→mehr)\n- Sie fährt am liebsten Fahrrad. (Superlativ irregular: gern→liebsten)\n- Der Berg ist höher als der Hügel. (Komparativ irregular: hoch→höher)\n- Mein Haus ist näher als deins. (Komparativ irregular: nah→näher)",
    "vocabulary": [
      {
        "id": "schnell",
        "word": "schnell",
        "article": "",
        "translation": "cepat",
        "exampleSentence": "Der Zug ist schneller als das Auto.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "langsam",
        "word": "langsam",
        "article": "",
        "translation": "lambat",
        "exampleSentence": "Die Schnecke ist langsamer als der Hund.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "gut",
        "word": "gut",
        "article": "",
        "translation": "bagus",
        "exampleSentence": "Er ist besser als ich.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "schlecht",
        "word": "schlecht",
        "article": "",
        "translation": "buruk",
        "exampleSentence": "Das Wetter ist schlechter als gestern.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "viel",
        "word": "viel",
        "article": "",
        "translation": "banyak",
        "exampleSentence": "Er hat mehr Geld als ich.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "gern",
        "word": "gern",
        "article": "",
        "translation": "senang",
        "exampleSentence": "Ich fahre lieber Fahrrad als Auto.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "hoch",
        "word": "hoch",
        "article": "",
        "translation": "tinggi",
        "exampleSentence": "Der Berg ist höher als der Hügel.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "nah",
        "word": "nah",
        "article": "",
        "translation": "dekat",
        "exampleSentence": "Mein Haus ist näher als deins.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-geld",
        "word": "das Geld",
        "article": "das",
        "translation": "uang",
        "exampleSentence": "Er hat mehr Geld als ich.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-auto",
        "word": "das Auto",
        "article": "das",
        "translation": "mobil",
        "exampleSentence": "Das Auto ist teurer als das Fahrrad.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Der Zug ist ___ als das Auto. (schnell)",
        "options": [
          "schneller",
          "am schnellsten",
          "schnellster",
          "schnell"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er hat ___ Geld als ich. (viel)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Sie fährt ___ Fahrrad als mit dem Bus. (gern)",
        "options": [
          "lieber",
          "am liebsten",
          "gerner",
          "lieber als"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Der Berg ist ___ als der Hügel. (hoch)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das Auto ist ___ als das Fahrrad. (teuer)",
        "options": [
          "teurer",
          "am teuersten",
          "teuerster",
          "teuer"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Mein Haus ist ___ als deins. (nah)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das ist ___ Hotel in der Stadt. (teuer, Superlativ)",
        "options": [
          "das teuerste",
          "am teuersten",
          "teurer",
          "das teurere"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ist ___ als sein Bruder. (alt)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Der Zug ist schneller als das Auto. (Komparativ)",
      "Das Auto ist am schnellsten. (Superlativ)",
      "Er hat mehr Geld als ich. (Komparativ irregular: viel→mehr)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "b1-13",
    "level": "B1",
    "title": "Konnektoren (obwohl, trotzdem, deshalb, indem)",
    "grammarDescription": "• obwohl: verb di AKHIR (seperti weil) — obwohl es regnet, gehe ich\n• trotzdem: verb di posisi 2 — es regnet, trotzdem gehe ich\n• trotz + Dativ: preposisi — trotz des Regens\n• deshalb/deswegen/daher: verb di posisi 2 — es regnet, deshalb bleibe ich\n• indem: verb di AKHIR — indem man liest\n• dadurch: verb di posisi 2 — dadurch verbessert man sich\n\nContoh:\n- Obwohl es regnet (verb akhir), gehe ich spazieren.\n- Es regnet, trotzdem gehe ich spazieren. (trotzdem + V2)\n- Trotz des Regens (Dativ) gehe ich spazieren.\n- Es regnet, deshalb bleibe ich zu Hause. (deshalb + V2)\n- Man lernt Deutsch, indem man liest. (indem + verb akhir)\n- Man lernt Deutsch. Dadurch verbessert man sich. (dadurch + V2)",
    "vocabulary": [
      {
        "id": "obwohl",
        "word": "obwohl",
        "article": "",
        "translation": "meskipun",
        "exampleSentence": "Obwohl es regnet, gehe ich spazieren.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "trotzdem",
        "word": "trotzdem",
        "article": "",
        "translation": "meskipun begitu",
        "exampleSentence": "Es regnet, trotzdem gehe ich spazieren.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "trotz",
        "word": "trotz",
        "article": "",
        "translation": "meskipun (+ Dativ)",
        "exampleSentence": "Trotz des Regens gehe ich spazieren.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "deshalb",
        "word": "deshalb",
        "article": "",
        "translation": "karena itu",
        "exampleSentence": "Es regnet, deshalb bleibe ich zu Hause.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "deswegen",
        "word": "deswegen",
        "article": "",
        "translation": "karena itu",
        "exampleSentence": "Es regnet, deswegen bleibe ich zu Hause.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "daher",
        "word": "daher",
        "article": "",
        "translation": "karena itu",
        "exampleSentence": "Es regnet, daher bleibe ich zu Hause.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "indem",
        "word": "indem",
        "article": "",
        "translation": "dengan cara",
        "exampleSentence": "Man lernt Deutsch, indem man liest.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "dadurch",
        "word": "dadurch",
        "article": "",
        "translation": "dengan cara itu",
        "exampleSentence": "Man lernt Deutsch. Dadurch verbessert man sich.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "die-wirkung",
        "word": "die Wirkung",
        "article": "die",
        "translation": "dampak",
        "exampleSentence": "Die Wirkung des Medikaments ist gut.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "die-konsequenz",
        "word": "die Konsequenz",
        "article": "die",
        "translation": "konsekuensi",
        "exampleSentence": "Die Konsequenz ist wichtig.",
        "phonetic": "",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "___ es regnet, gehe ich spazieren.",
        "options": [
          "Obwohl",
          "Trotzdem",
          "Deshalb",
          "Indem"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Es regnet, ___ gehe ich spazieren.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Es regnet, ___ bleibe ich zu Hause.",
        "options": [
          "obwohl",
          "trotzdem",
          "deshalb",
          "indem"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Man lernt Deutsch, ___ man liest.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ des Regens gehe ich spazieren.",
        "options": [
          "Obwohl",
          "Trotzdem",
          "Trotz",
          "Deshalb"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Man lernt Deutsch. ___ verbessert man sich.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ es kalt ist, gehe ich ins Schwimmbad.",
        "options": [
          "Obwohl",
          "Trotzdem",
          "Deshalb",
          "Indem"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Es ist kalt, ___ bleibe ich zu Hause.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Obwohl es regnet (verb akhir), gehe ich spazieren.",
      "Es regnet, trotzdem gehe ich spazieren. (trotzdem + V2)",
      "Trotz des Regens (Dativ) gehe ich spazieren."
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "b1-14",
    "level": "B1",
    "title": "Indirekte Rede (Konjunktiv I & II)",
    "grammarDescription": "• Konjunktiv I: laporan langsung (sagen, erzählen, berichten)\n• Konjunktiv II: keraguan atau laporan tidak langsung\n• Konjunktiv I bentuk: sei, habe, komme, wisse (hampir sama dengan Präsens)\n• Jika Konjunktiv I sama dengan Präsens, gunakan Konjunktiv II\n• Konjunktiv II: wäre, hätte, käme, wüsste (dari Präteritum)\n\nContoh:\n- Er sagt: 'Ich bin krank.' → Er sagt, er sei krank. (Konj I)\n- Sie sagt: 'Ich komme morgen.' → Sie sagt, sie komme morgen. (Konj I)\n- Er sagt: 'Ich habe Zeit.' → Er sagt, er habe Zeit. (Konj I)\n- Sie sagt: 'Ich weiß es.' → Sie sagt, sie wisse es. (Konj I)\n- Er sagt: 'Ich würde gern kommen.' → Er sagt, er würde gern kommen. (Konj II)",
    "vocabulary": [
      {
        "id": "sagen",
        "word": "sagen",
        "article": "",
        "translation": "mengatakan",
        "exampleSentence": "Er sagt, er sei krank.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "meinen",
        "word": "meinen",
        "article": "",
        "translation": "berpendapat",
        "exampleSentence": "Sie meint, das Wetter sei schön.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "glauben",
        "word": "glauben",
        "article": "",
        "translation": "mempercayai",
        "exampleSentence": "Er glaubt, sie sei nett.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "erzählen",
        "word": "erzählen",
        "article": "",
        "translation": "menceritakan",
        "exampleSentence": "Sie erzählt, sie habe einen Hund.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "berichten",
        "word": "berichten",
        "article": "",
        "translation": "melaporkan",
        "exampleSentence": "Er berichtet, das Meeting sei wichtig.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "fragen",
        "word": "fragen",
        "article": "",
        "translation": "bertanya",
        "exampleSentence": "Er fragt, ob sie komme.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "antworten",
        "word": "antworten",
        "article": "",
        "translation": "menjawab",
        "exampleSentence": "Sie antwortet, sie komme morgen.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "behaupten",
        "word": "behaupten",
        "article": "",
        "translation": "mengklaim",
        "exampleSentence": "Er behauptet, er sei der Beste.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "die-behauptung",
        "word": "die Behauptung",
        "article": "die",
        "translation": "klaim",
        "exampleSentence": "Seine Behauptung ist falsch.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "die-quelle",
        "word": "die Quelle",
        "article": "die",
        "translation": "sumber",
        "exampleSentence": "Die Quelle ist vertrauenswürdig.",
        "phonetic": "",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "Er sagt, er ___ krank. (Konjunktiv I)",
        "options": [
          "sei",
          "ist",
          "war",
          "wäre"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Sie sagt, sie ___ morgen. (Konjunktiv I von kommen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er sagt, er ___ Zeit. (Konjunktiv I von haben)",
        "options": [
          "habe",
          "hat",
          "hatte",
          "hätte"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Sie sagt, sie ___ es. (Konjunktiv I von wissen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er sagt, er ___ gern kommen. (Konjunktiv II)",
        "options": [
          "würde",
          "wird",
          "will",
          "wollte"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Sie sagt, sie ___ das nicht. (Konjunktiv I von glauben)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er sagt, er ___ das nicht. (Konjunktiv II von können)",
        "options": [
          "könnte",
          "kann",
          "konnte",
          "kann"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er sagt: 'Ich habe Zeit.' → Er sagt, er ___ Zeit.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Er sagt: 'Ich bin krank.' → Er sagt, er sei krank. (Konj I)",
      "Sie sagt: 'Ich komme morgen.' → Sie sagt, sie komme morgen. (Konj I)",
      "Er sagt: 'Ich habe Zeit.' → Er sagt, er habe Zeit. (Konj I)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  }
,
  {
    "id": "a1-14",
    "level": "A1",
    "title": "Kasus Nominativ vs Akkusativ",
    "grammarDescription": "• Nominatif = subjek (siapa yang melakukan aksi)\n• Akkusatif = objek langsung (apa yang dikenai aksi)\n• Artikel berubah di Akkusatif:\n•   der → den, die → die, das → das, die (pl) → die\n• Hanya maskulin yang berubah: der → den\n• Verba yang membutuhkan Akkusativ: haben, brauchen, lesen, sehen, kaufen, trinken, essen, spielen\n\nContoh:\n- Der Mann (Nominativ) liest das Buch (Akkusativ).\n- Die Frau (Nom) trinkt den Kaffee (Akk).\n- Das Kind (Nom) spielt mit dem Hund (Dat) — tidak Akkusatif karena 'mit'.\n- Ich (Nom) sehe die Katze (Akk).\n- Er (Nom) kauft ein Auto (Akk).",
    "vocabulary": [
      {
        "id": "der-mann",
        "word": "der Mann",
        "article": "der",
        "translation": "pria",
        "exampleSentence": "Der Mann liest ein Buch.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-frau",
        "word": "die Frau",
        "article": "die",
        "translation": "wanita",
        "exampleSentence": "Die Frau trinkt Kaffee.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-kind",
        "word": "das Kind",
        "article": "das",
        "translation": "anak",
        "exampleSentence": "Das Kind spielt im Garten.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-buch",
        "word": "das Buch",
        "article": "das",
        "translation": "buku",
        "exampleSentence": "Ich lese ein Buch.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "der-kaffee",
        "word": "der Kaffee",
        "article": "der",
        "translation": "kopi",
        "exampleSentence": "Er trinkt den Kaffee.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-zeitung",
        "word": "die Zeitung",
        "article": "die",
        "translation": "koran",
        "exampleSentence": "Sie liest die Zeitung.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-auto",
        "word": "das Auto",
        "article": "das",
        "translation": "mobil",
        "exampleSentence": "Er fährt ein Auto.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "der-hund",
        "word": "der Hund",
        "article": "der",
        "translation": "anjing",
        "exampleSentence": "Ich sehe den Hund.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-katze",
        "word": "die Katze",
        "article": "die",
        "translation": "kucing",
        "exampleSentence": "Sie streichelt die Katze.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-wasser",
        "word": "das Wasser",
        "article": "das",
        "translation": "air",
        "exampleSentence": "Er trinkt das Wasser.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "___ Mann liest ein Buch. (Subjek)",
        "options": [
          "Der",
          "Den",
          "Dem",
          "Das"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich sehe ___ Hund. (Objek langsung)",
        "options": [
          "der",
          "den",
          "dem",
          "das"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Die Frau trinkt ___ Kaffee. (Akkusativ)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das Kind spielt ___ Ball. (Akkusativ)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Welcher Satz ist richtig?",
        "options": [
          "Der Mann kauft der Zeitung.",
          "Der Mann kauft die Zeitung.",
          "Der Mann kauft dem Zeitung.",
          "Der Mann kauft den Zeitung."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Er liest ___ Buch. (Akkusativ)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ Kinder spielen im Garten. (Subjek)",
        "options": [
          "Der",
          "Den",
          "Die",
          "Das"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Ich kaufe ___ Auto. (Akkusativ)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Der Mann (Nominativ) liest das Buch (Akkusativ).",
      "Die Frau (Nom) trinkt den Kaffee (Akk).",
      "Das Kind (Nom) spielt mit dem Hund (Dat) — tidak Akkusatif karena 'mit'."
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-15",
    "level": "A1",
    "title": "Kasus Dativ",
    "grammarDescription": "• Dativ = objek tidak langsung (kepada siapa, untuk siapa)\n• Artikel berubah:\n•   der → dem, die → der, das → dem, die (pl) → den\n• Artikel tidak tentu: ein → einem, eine → einer, ein → einem\n• Verba yang membutuhkan Dativ: helfen, danken, gefallen, gehören, sagen, geben, schicken\n• Präposisi selalu Dativ: mit, aus, zu, bei, nach, von, seit\n\nContoh:\n- Ich gebe dem Mann das Buch. (Akk: das Buch, Dat: dem Mann)\n- Sie hilft der Frau. (Dat: der Frau)\n- Das Buch gehört dem Kind. (Dat: dem Kind)\n- Er schickt der Lehrerin eine E-Mail. (Dat: der Lehrerin)\n- Ich komme aus Deutschland. (aus + Dat)",
    "vocabulary": [
      {
        "id": "helfen-+-dat",
        "word": "helfen + Dat",
        "article": "dem",
        "translation": "membantu",
        "exampleSentence": "Ich helfe dem Mann.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "danken-+-dat",
        "word": "danken + Dat",
        "article": "der",
        "translation": "berterima kasih",
        "exampleSentence": "Ich danke der Frau.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gefallen-+-dat",
        "word": "gefallen + Dat",
        "article": "dem",
        "translation": "menyenangi",
        "exampleSentence": "Das Buch gefällt dem Kind.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gehören-+-dat",
        "word": "gehören + Dat",
        "article": "dem",
        "translation": "milik",
        "exampleSentence": "Das Auto gehört dem Mann.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "der-arzt",
        "word": "der Arzt",
        "article": "der",
        "translation": "dokter",
        "exampleSentence": "Ich gehe zum Arzt.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-ärztin",
        "word": "die Ärztin",
        "article": "die",
        "translation": "dokter wanita",
        "exampleSentence": "Die Ärztin hilft mir.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-krankenhaus",
        "word": "das Krankenhaus",
        "article": "das",
        "translation": "rumah sakit",
        "exampleSentence": "Er ist im Krankenhaus.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-adresse",
        "word": "die Adresse",
        "article": "die",
        "translation": "alamat",
        "exampleSentence": "Was ist Ihre Adresse?",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-rezept",
        "word": "das Rezept",
        "article": "das",
        "translation": "resep",
        "exampleSentence": "Der Arzt gibt mir ein Rezept.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-medizin",
        "word": "die Medizin",
        "article": "die",
        "translation": "obat",
        "exampleSentence": "Die Medizin hilft mir.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich helfe ___ Mann. (Dativ)",
        "options": [
          "der",
          "den",
          "dem",
          "das"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Sie dankt ___ Frau. (Dativ)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das Buch gehört ___ Kind. (Dativ)",
        "options": [
          "der",
          "den",
          "dem",
          "die"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Er schickt ___ Lehrerin eine E-Mail. (Dativ)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich komme aus ___ (Frankreich).",
        "options": [
          "der",
          "den",
          "dem",
          "die"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Das Auto gehört ___ Mann. (Dativ)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Welcher Satz ist richtig?",
        "options": [
          "Ich gebe den Mann das Buch.",
          "Ich gebe dem Mann das Buch.",
          "Ich gebe der Mann das Buch.",
          "Ich gebe das Mann das Buch."
        ],
        "correctAnswer": 1
      },
      {
        "question": "Er ist im (in dem) ___. (Krankenhaus = neutrum, Dativ)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich gebe dem Mann das Buch. (Akk: das Buch, Dat: dem Mann)",
      "Sie hilft der Frau. (Dat: der Frau)",
      "Das Buch gehört dem Kind. (Dat: dem Kind)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-16",
    "level": "A1",
    "title": "Modalverben (können, müssen, wollen, dürfen)",
    "grammarDescription": "• Modalverben selalu di posisi 2 (verb utama di akhir = Satzklammer)\n• Konjugasi irregular: ich habe Sonderform (kecuali sollen)\n• können: ich kann, du kannst, er kann, wir können, ihr könnt, sie können\n• müssen: ich muss, du musst, er muss, wir müssen, ihr müsst, sie müssen\n• wollen: ich will, du willst, er will, wir wollen, ihr wollt, sie wollen\n• dürfen: ich darf, du darfst, er darf, wir dürfen, ihr dürft, sie dürfen\n• sollen: ich soll, du sollst, er soll, wir sollen, ihr sollt, sie sollen\n\nContoh:\n- Ich kann (modal) Deutsch sprechen (verb utama di akhir).\n- Du musst (modal) die Hausaufgabe machen (di akhir).\n- Er will (modal) Arzt werden (di akhir).\n- Sie darf (modal) nicht rauchen (di akhir).\n- Wir sollen (modal) pünktlich kommen (di akhir).",
    "vocabulary": [
      {
        "id": "können",
        "word": "können",
        "article": "",
        "translation": "bisa/mampu",
        "exampleSentence": "Ich kann Deutsch sprechen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "müssen",
        "word": "müssen",
        "article": "",
        "translation": "harus",
        "exampleSentence": "Du musst lernen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "wollen",
        "word": "wollen",
        "article": "",
        "translation": "ingin",
        "exampleSentence": "Er will Arzt werden.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "dürfen",
        "word": "dürfen",
        "article": "",
        "translation": "boleh/diizinkan",
        "exampleSentence": "Sie darf nicht rauchen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sollen",
        "word": "sollen",
        "article": "",
        "translation": "seharusnya",
        "exampleSentence": "Ihr sollt pünktlich sein.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-prüfung",
        "word": "die Prüfung",
        "article": "die",
        "translation": "ujian",
        "exampleSentence": "Ich muss eine Prüfung machen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-hausaufgabe",
        "word": "die Hausaufgabe",
        "article": "die",
        "translation": "pekerjaan rumah",
        "exampleSentence": "Du musst die Hausaufgabe machen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-studium",
        "word": "das Studium",
        "article": "das",
        "translation": "kuliah",
        "exampleSentence": "Er will studieren.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-arbeit",
        "word": "die Arbeit",
        "article": "die",
        "translation": "pekerjaan",
        "exampleSentence": "Ich muss arbeiten.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "der-schlaf",
        "word": "der Schlaf",
        "article": "der",
        "translation": "tidur",
        "exampleSentence": "Ich muss schlafen.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich ___ Deutsch sprechen. (bisa)",
        "options": [
          "kann",
          "kannst",
          "können",
          "könnt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Du ___ die Hausaufgabe machen. (harus)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er ___ Arzt werden. (ingin)",
        "options": [
          "will",
          "willst",
          "wollen",
          "wollt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Sie ___ nicht rauchen. (tidak boleh)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Welcher Satz ist richtig?",
        "options": [
          "Ich muss arbeiten ich.",
          "Ich muss ich arbeiten.",
          "Ich muss arbeiten.",
          "Ich ich muss arbeiten."
        ],
        "correctAnswer": 2
      },
      {
        "question": "Wir ___ pünktlich kommen. (seharusnya)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ihr ___ die Prüfung machen. (harus)",
        "options": [
          "müsst",
          "musst",
          "müssen",
          "muss"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Sie (formal) ___ bitte sitzen. (boleh/silakan)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich kann (modal) Deutsch sprechen (verb utama di akhir).",
      "Du musst (modal) die Hausaufgabe machen (di akhir).",
      "Er will (modal) Arzt werden (di akhir)."
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-17",
    "level": "A1",
    "title": "Waktu Lampau: Perfekt",
    "grammarDescription": "• Perfekt = haben/sein + Partizip II\n• Sein digunakan untuk: verba perjalanan (gehen, fahren, fliegen, kommen), verba perubahan (sterben, aufwachen, einschlafen), dan sein/bleiben\n• Haben digunakan untuk: semua verba lainnya\n• Partizip II beraturan: ge- + stem + -t (gemacht, gelernt)\n• Partizip II tidak beraturan: ge- + stem berubah + -en (gegessen, getrunken, geschrieben)\n• Partizip II selalu di posisi akhir kalimat\n\nContoh:\n- Ich habe Pizza gegessen. (haben — makan biasa)\n- Er ist nach Berlin gefahren. (sein — perjalanan)\n- Wir haben Deutsch gelernt. (haben — belajar)\n- Ich bin nach Hause gegangen. (sein — pergi)\n- Sie hat einen Brief geschrieben. (haben — menulis)",
    "vocabulary": [
      {
        "id": "gegessen-(essen)",
        "word": "gegessen (essen)",
        "article": "",
        "translation": "makan",
        "exampleSentence": "Ich habe Pizza gegessen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "getrunken-(trinken)",
        "word": "getrunken (trinken)",
        "article": "",
        "translation": "minum",
        "exampleSentence": "Er hat Kaffee getrunken.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gelernt-(lernen)",
        "word": "gelernt (lernen)",
        "article": "",
        "translation": "belajar",
        "exampleSentence": "Wir haben Deutsch gelernt.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "geschrieben-(schreiben)",
        "word": "geschrieben (schreiben)",
        "article": "",
        "translation": "menulis",
        "exampleSentence": "Sie hat einen Brief geschrieben.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gelesen-(lesen)",
        "word": "gelesen (lesen)",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Ich habe ein Buch gelesen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gefahren-(fahren)",
        "word": "gefahren (fahren)",
        "article": "",
        "translation": "berkendara/pergi",
        "exampleSentence": "Er ist nach Berlin gefahren.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gegangen-(gehen)",
        "word": "gegangen (gehen)",
        "article": "",
        "translation": "pergi/jalan",
        "exampleSentence": "Ich bin ins Kino gegangen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gewesen-(sein)",
        "word": "gewesen (sein)",
        "article": "",
        "translation": "adalah/pernah",
        "exampleSentence": "Wir sind in Berlin gewesen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "geschlafen-(schlafen)",
        "word": "geschlafen (schlafen)",
        "article": "",
        "translation": "tidur",
        "exampleSentence": "Ich habe gut geschlafen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gemacht-(machen)",
        "word": "gemacht (machen)",
        "article": "",
        "translation": "melakukan",
        "exampleSentence": "Sie hat ihre Hausaufgaben gemacht.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich ___ Pizza gegessen. (haben)",
        "options": [
          "habe",
          "hat",
          "haben",
          "hast"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ___ nach Berlin gefahren. (sein)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Wir ___ Deutsch gelernt.",
        "options": [
          "haben",
          "hat",
          "habe",
          "hast"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich ___ Pizza gegessen. (Partizip II von essen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Sie ___ einen Brief geschrieben. (Partizip II)",
        "options": [
          "geschrieben",
          "geschrieben",
          "geschrieben",
          "geschrieben"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Wir ___ in Berlin gewohnt. (haben/sein?)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich ___ ins Kino gegangen. (haben/sein?)",
        "options": [
          "bin",
          "habe",
          "ist",
          "hat"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ___ Fußball gespielt. (Partizip II von spielen)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich habe Pizza gegessen. (haben — makan biasa)",
      "Er ist nach Berlin gefahren. (sein — perjalanan)",
      "Wir haben Deutsch gelernt. (haben — belajar)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-18",
    "level": "A1",
    "title": "Trennbare Verben (aufmachen, anrufen, dst)",
    "grammarDescription": "• Prefix (an-, auf-, aus-, ein-, ab-, zu-, etc.) terpisah dari verb\n• Verb utama di posisi 2, prefix di akhir kalimat\n• Satzklammer: posisi 2 ↔ akhir kalimat\n• Kalimat tidak langsung: prefix bergabung kembali (Ich weiß, dass er anruft)\n• Pertanyaan: prefix di depan (Rufst du mich an?)\n\nContoh:\n- Ich rufe (V2) dich (Akk) um 5 Uhr (Objekt) an (prefix).\n- Mach (Imperativ) das Fenster (Akk) auf (prefix)!\n- Er steht (V2) um 7 Uhr (Zeit) auf (prefix).\n- Rufst (V2) du (Subjekt) mich (Akk) an (prefix)?\n- Ich weiß, dass er um 5 Uhr anruft. (kein Satzklammer)",
    "vocabulary": [
      {
        "id": "aufmachen",
        "word": "aufmachen",
        "article": "",
        "translation": "membuka",
        "exampleSentence": "Mach das Fenster auf!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "zumachen",
        "word": "zumachen",
        "article": "",
        "translation": "menutup",
        "exampleSentence": "Mach die Tür zu!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "anrufen",
        "word": "anrufen",
        "article": "",
        "translation": "menelepon",
        "exampleSentence": "Ich rufe dich an.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "einkaufen",
        "word": "einkaufen",
        "article": "",
        "translation": "berbelanja",
        "exampleSentence": "Wir kaufen im Supermarkt ein.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "aufstehen",
        "word": "aufstehen",
        "article": "",
        "translation": "bangun tidur",
        "exampleSentence": "Ich stehe um 7 Uhr auf.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "ausgehen",
        "word": "ausgehen",
        "article": "",
        "translation": "keluar rumah",
        "exampleSentence": "Wir gehen am Abend aus.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "ankommen",
        "word": "ankommen",
        "article": "",
        "translation": "tiba/datang",
        "exampleSentence": "Der Zug kommt um 10 Uhr an.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "abfahren",
        "word": "abfahren",
        "article": "",
        "translation": "berangkat",
        "exampleSentence": "Der Zug fährt um 10 Uhr ab.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "fernsehen",
        "word": "fernsehen",
        "article": "",
        "translation": "menonton TV",
        "exampleSentence": "Er sieht gern fern.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "zurückkommen",
        "word": "zurückkommen",
        "article": "",
        "translation": "kembali",
        "exampleSentence": "Ich komme um 5 Uhr zurück.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich ___ um 7 Uhr ___. (aufstehen)",
        "options": [
          "stehe...auf",
          "aufstehe",
          "auf...stehe",
          "stehe auf"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ___ mich ___. (anrufen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ das Fenster ___! (aufmachen, Imperativ)",
        "options": [
          "Mach...auf",
          "Aufmach",
          "Mach auf",
          "Auf...mach"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Wir ___ im Supermarkt ___. (einkaufen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ du mich ___? (anrufen, pertanyaan)",
        "options": [
          "Rufst...an",
          "Anrufst...du",
          "Ruf...an",
          "Anrufst an"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Der Zug ___ um 10 Uhr ___. (abfahren)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich weiß, dass er um 5 Uhr ___. (anrufen, tidak langsung)",
        "options": [
          "anruft",
          "ruft an",
          "anruft an",
          "ruft"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ___ gern ___. (fernsehen)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich rufe (V2) dich (Akk) um 5 Uhr (Objekt) an (prefix).",
      "Mach (Imperativ) das Fenster (Akk) auf (prefix)!",
      "Er steht (V2) um 7 Uhr (Zeit) auf (prefix)."
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-19",
    "level": "A1",
    "title": "Verba Refleksif (Reflexivverben)",
    "grammarDescription": "• Reflexivpronomen Akkusativ: mich, dich, sich, uns, euch, sich\n• Reflexivpronomen Dativ: mir, dir, sich, uns, euch, sich\n• Posisi: setelah verb utama atau di belakang infinitif\n• Verba dengan Dativ: sich (etwas) vorstellen, sich (Dativ) fühlen, sich (Dativ) freuen\n• Verba dengan Akkusativ: sich waschen, sich duschen, sich setzen\n\nContoh:\n- Ich wasche mich. (Akk: mich — cuci diri sendiri)\n- Er duscht sich. (Akk: sich)\n- Ich fühle mich gut. (Akk: mich)\n- Ich freue mich auf dich. (Akk: mich)\n- Setzen Sie sich! (Akk: sich — Imperativ)\n- Ich erinnere mich an dich. (Akk: mich)\n- Er ärgert sich über den Lärm. (Akk: sich)",
    "vocabulary": [
      {
        "id": "sich-waschen",
        "word": "sich waschen",
        "article": "",
        "translation": "mencuci diri",
        "exampleSentence": "Ich wasche mir die Hände.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-duschen",
        "word": "sich duschen",
        "article": "",
        "translation": "mandi",
        "exampleSentence": "Er duscht sich jeden Morgen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-fühlen",
        "word": "sich fühlen",
        "article": "",
        "translation": "merasa",
        "exampleSentence": "Ich fühle mich gut.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-freuen",
        "word": "sich freuen",
        "article": "",
        "translation": "senang",
        "exampleSentence": "Ich freue mich auf dich.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-ärgern",
        "word": "sich ärgern",
        "article": "",
        "translation": "kesal",
        "exampleSentence": "Er ärgert sich über den Lärm.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-setzen",
        "word": "sich setzen",
        "article": "",
        "translation": "duduk",
        "exampleSentence": "Bitte setzen Sie sich.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-erinnern",
        "word": "sich erinnern",
        "article": "",
        "translation": "mengingat",
        "exampleSentence": "Ich erinnere mich an dich.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-vorstellen",
        "word": "sich vorstellen",
        "article": "",
        "translation": "memperkenalkan diri",
        "exampleSentence": "Darf ich mich vorstellen?",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-beeilen",
        "word": "sich beeilen",
        "article": "",
        "translation": "buru-buru",
        "exampleSentence": "Beeil dich!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "sich-ausruhen",
        "word": "sich ausruhen",
        "article": "",
        "translation": "istirahat",
        "exampleSentence": "Ich ruhe mich aus.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich wasche ___. (reflexiv)",
        "options": [
          "mich",
          "mir",
          "sich",
          "uns"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er duscht ___. (reflexiv)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich fühle ___. (reflexiv)",
        "options": [
          "mich",
          "mir",
          "sich",
          "uns"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Wir freuen ___. (reflexiv)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Setzen Sie ___. (Imperativ, reflexiv)",
        "options": [
          "sich",
          "mich",
          "uns",
          "euch"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich erinnere ___. (reflexiv)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Beeil ___. (Imperativ du, reflexiv)",
        "options": [
          "dich",
          "dir",
          "sich",
          "euch"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Sie (formal) setzen ___. (reflexiv)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich wasche mich. (Akk: mich — cuci diri sendiri)",
      "Er duscht sich. (Akk: sich)",
      "Ich fühle mich gut. (Akk: mich)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-20",
    "level": "A1",
    "title": "Nebensätze (dass, weil, wenn)",
    "grammarDescription": "• Klausa anak dipisahkan dengan koma dari klausa utama\n• Konjunksi (weil/dass/wenn) di awal klausa anak\n• Verb utama dipindahkan ke AKHIR klausa anak\n• weil = karena (alasan/sebab akibat)\n• dass = bahwa (objek kalimat, setelah verba seperti glauben, wissen, denken)\n• wenn = jika/ketika (kondisi/waktu)\n\nContoh:\n- Ich bleibe zu Hause, weil ich krank bin. (bin di akhir)\n- Ich glaube, dass er nett ist. (ist di akhir)\n- Wenn es regnet, bleibe ich zu Hause. (bleibe di akhir klausa utama)\n- Er sagt, dass er müde ist. (ist di akhir)\n- Ich komme, wenn du mich brauchst. (brauchst di akhir)",
    "vocabulary": [
      {
        "id": "weil",
        "word": "weil",
        "article": "",
        "translation": "karena",
        "exampleSentence": "Ich bleibe zu Hause, weil ich krank bin.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "dass",
        "word": "dass",
        "article": "",
        "translation": "bahwa",
        "exampleSentence": "Ich glaube, dass er nett ist.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "wenn",
        "word": "wenn",
        "article": "",
        "translation": "jika/ketika",
        "exampleSentence": "Wenn es regnet, bleibe ich zu Hause.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "obwohl",
        "word": "obwohl",
        "article": "",
        "translation": "meskipun",
        "exampleSentence": "Obwohl es kalt ist, gehe ich spazieren.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "der-wetter",
        "word": "der Wetter",
        "article": "das",
        "translation": "cuaca",
        "exampleSentence": "Das Wetter ist heute schön.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-erkältung",
        "word": "die Erkältung",
        "article": "die",
        "translation": "pilek",
        "exampleSentence": "Ich habe eine Erkältung.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-fieber",
        "word": "das Fieber",
        "article": "das",
        "translation": "demam",
        "exampleSentence": "Er hat hohes Fieber.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-medizin",
        "word": "die Medizin",
        "article": "die",
        "translation": "obat",
        "exampleSentence": "Nehmen Sie die Medizin.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-bett",
        "word": "das Bett",
        "article": "das",
        "translation": "tempat tidur",
        "exampleSentence": "Ich bleibe im Bett.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-suppe",
        "word": "die Suppe",
        "article": "die",
        "translation": "sup",
        "exampleSentence": "Ich esse Suppe, weil ich krank bin.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich bleibe zu Hause, weil ich krank ___.",
        "options": [
          "bin",
          "ist",
          "sind",
          "bist"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich glaube, dass er nett ___.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ es regnet, bleibe ich zu Hause.",
        "options": [
          "Weil",
          "Dass",
          "Wenn",
          "Obwohl"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Er sagt, dass er müde ___.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich komme, ___ du mich brauchst.",
        "options": [
          "weil",
          "dass",
          "wenn",
          "obwohl"
        ],
        "correctAnswer": 2
      },
      {
        "question": "___ es kalt ist, gehe ich spazieren.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er bleibt zu Hause, ___ er krank ist.",
        "options": [
          "wenn",
          "dass",
          "weil",
          "obwohl"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Ich weiß, dass du Recht ___.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich bleibe zu Hause, weil ich krank bin. (bin di akhir)",
      "Ich glaube, dass er nett ist. (ist di akhir)",
      "Wenn es regnet, bleibe ich zu Hause. (bleibe di akhir klausa utama)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-21",
    "level": "A1",
    "title": "Komparativ & Superlativ",
    "grammarDescription": "• Komparatif: adjektiv + -er + als (lebih...dari)\n• Superlativ: am + adjektiv + -sten (paling...)\n• Adjektif pendek: tambah huruf akhir (gut→besser→am besten)\n• Adjektif panjang: tambah -er / am -sten (schnell→schneller→am schnellsten)\n• Irregular: gut→besser→am besten, viel→mehr→am meisten, gern→lieber→am liebsten\n\nContoh:\n- Berlin ist größer als München. (Komparativ)\n- München ist am größten in Bayern. (Superlativ)\n- Er ist besser als ich. (Komparativ irregular: gut→besser)\n- Sie ist die Beste in der Klasse. (Superlativ irregular: gut→beste)\n- Ich fahre gern, aber ich fahre lieber Fahrrad. (Komparativ irregular: gern→lieber)",
    "vocabulary": [
      {
        "id": "groß",
        "word": "groß",
        "article": "",
        "translation": "besar/tinggi",
        "exampleSentence": "Berlin ist größer als München.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "klein",
        "word": "klein",
        "article": "",
        "translation": "kecil",
        "exampleSentence": "Das Kind ist kleiner als sein Bruder.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "schnell",
        "word": "schnell",
        "article": "",
        "translation": "cepat",
        "exampleSentence": "Der Zug ist schneller als das Auto.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "langsam",
        "word": "langsam",
        "article": "",
        "translation": "lambat",
        "exampleSentence": "Die Schnecke ist langsamer als der Hund.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gut",
        "word": "gut",
        "article": "",
        "translation": "bagus",
        "exampleSentence": "Er ist besser als ich.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "schlecht",
        "word": "schlecht",
        "article": "",
        "translation": "buruk",
        "exampleSentence": "Das Wetter ist schlechter als gestern.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "teuer",
        "word": "teuer",
        "article": "",
        "translation": "mahal",
        "exampleSentence": "Das Auto ist teurer als das Fahrrad.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "billig",
        "word": "billig",
        "article": "",
        "translation": "murah",
        "exampleSentence": "Das Buch ist billiger als der Film.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "warm",
        "word": "warm",
        "article": "",
        "translation": "hangat",
        "exampleSentence": "Der Sommer ist wärmer als der Winter.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "kalt",
        "word": "kalt",
        "article": "",
        "translation": "dingin",
        "exampleSentence": "Der Winter ist kälter als der Sommer.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Berlin ist ___ als München. (groß)",
        "options": [
          "größer",
          "großter",
          "am größten",
          "groß"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ist ___ als ich. (gut)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das ist ___ Buch. (gut, Superlativ)",
        "options": [
          "das beste",
          "das besser",
          "am besten",
          "besser"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Der Zug ist ___ als das Auto. (schnell)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich fahre ___ Fahrrad als mit dem Bus. (gern)",
        "options": [
          "lieber",
          "am liebsten",
          "gerner",
          "lieber als"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Der Sommer ist ___ als der Winter. (warm)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das ist ___ Hotel in der Stadt. (teuer, Superlativ)",
        "options": [
          "das teuerste",
          "am teuersten",
          "teurer",
          "das teurere"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Berlin ist ___ als München. (alt)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Berlin ist größer als München. (Komparativ)",
      "München ist am größten in Bayern. (Superlativ)",
      "Er ist besser als ich. (Komparativ irregular: gut→besser)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-22",
    "level": "A1",
    "title": "Imperativ (Perintah)",
    "grammarDescription": "• du: hilangkan -st dari konjugasi (du kommst → komm!)\n• ihr: gunakan bentuk konjugasi normal (ihr kommt → kommt!)\n• Sie: gunakan bentuk infinitif dengan Sie (Sie kommen → kommen Sie!)\n• Perubahan vokal: du→du gehst → geh (tidak ada perubahan)\n• Irregular: du fährst → fahr!, du liest → lies!, du sprichst → sprich!\n\nContoh:\n- Komm her! (du — hilangkan -st)\n- Kommt her! (ihr — bentuk normal)\n- Kommen Sie her! (Sie — infinitif + Sie)\n- Lies das Buch! (du irregular: du liest → lies)\n- Fahr langsam! (du irregular: du fährst → fahr)",
    "vocabulary": [
      {
        "id": "komm!",
        "word": "komm!",
        "article": "",
        "translation": "datang!",
        "exampleSentence": "Komm her!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "geh!",
        "word": "geh!",
        "article": "",
        "translation": "pergi!",
        "exampleSentence": "Geh nach Hause!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lies!",
        "word": "lies!",
        "article": "",
        "translation": "baca!",
        "exampleSentence": "Lies das Buch!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "schreib!",
        "word": "schreib!",
        "article": "",
        "translation": "tulis!",
        "exampleSentence": "Schreib einen Brief!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "hör-zu!",
        "word": "hör zu!",
        "article": "",
        "translation": "dengarkan!",
        "exampleSentence": "Hör mir zu!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "setz-dich!",
        "word": "setz dich!",
        "article": "",
        "translation": "duduk!",
        "exampleSentence": "Setz dich bitte!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "kommst-du!",
        "word": "kommst du!",
        "article": "",
        "translation": "datanglah!",
        "exampleSentence": "Kommst du mit?",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "essen-sie!",
        "word": "essen Sie!",
        "article": "",
        "translation": "makanlah! (formal)",
        "exampleSentence": "Essen Sie bitte!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "ruft-an!",
        "word": "ruft an!",
        "article": "",
        "translation": "teleponlah!",
        "exampleSentence": "Ruf mich an!",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "beeil-dich!",
        "word": "beeil dich!",
        "article": "",
        "translation": "cepatlah!",
        "exampleSentence": "Beeil dich, wir haben es eilig!",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "___ her! (du, kommen)",
        "options": [
          "Komm",
          "Kommst",
          "Kommen",
          "Kommt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "___ das Buch! (du, lesen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ Sie her! (formal, kommen)",
        "options": [
          "Kommen",
          "Komm",
          "Kommt",
          "Kommst"
        ],
        "correctAnswer": 0
      },
      {
        "question": "___ her! (ihr, kommen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ mich an! (du, anrufen)",
        "options": [
          "Ruf",
          "Rufst",
          "Rufen",
          "Ruft"
        ],
        "correctAnswer": 0
      },
      {
        "question": "___ langsam! (du, fahren)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ bitte! (Sie, essen)",
        "options": [
          "Essen",
          "Iss",
          "Esst",
          "Isst"
        ],
        "correctAnswer": 0
      },
      {
        "question": "___ dich! (du, beeilen)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Komm her! (du — hilangkan -st)",
      "Kommt her! (ihr — bentuk normal)",
      "Kommen Sie her! (Sie — infinitif + Sie)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-23",
    "level": "A1",
    "title": "Sollen & Dürfen (Kewajiban & Izin)",
    "grammarDescription": "• sollen = seharusnya (kewajiban/saran dari orang lain)\n• dürfen = boleh (izin dari otoritas) / tidak boleh (larangan)\n• sollen: du sollst, er soll, wir sollen\n• dürfen: du darfst, er darf, wir dürfen\n• Negasi: du sollst nicht... (kamu tidak seharusnya), du darfst nicht... (kamu tidak boleh)\n\nContoh:\n- Du sollst mehr lernen. (kewajiban/saran)\n- Du sollst nicht so viel fernsehen. (saran negatif)\n- Darf ich fragen? (izin untuk bertanya)\n- Du darfst hier nicht rauchen. (larangan)\n- Wir sollen pünktlich kommen. (kewajiban dari guru)\n- Sie dürfen hier nicht parken. (larangan resmi)",
    "vocabulary": [
      {
        "id": "sollen",
        "word": "sollen",
        "article": "",
        "translation": "seharusnya",
        "exampleSentence": "Du sollst mehr lernen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "dürfen",
        "word": "dürfen",
        "article": "",
        "translation": "boleh",
        "exampleSentence": "Darf ich fragen?",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-regel",
        "word": "die Regel",
        "article": "die",
        "translation": "aturan",
        "exampleSentence": "Du sollst die Regeln befolgen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-verbot",
        "word": "das Verbot",
        "article": "das",
        "translation": "larangan",
        "exampleSentence": "Rauchen ist hier ein Verbot.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-erlaubnis",
        "word": "das Erlaubnis",
        "article": "die",
        "translation": "izin",
        "exampleSentence": "Du hast die Erlaubnis, hier zu sein.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-schule",
        "word": "die Schule",
        "article": "die",
        "translation": "sekolah",
        "exampleSentence": "Du sollst zur Schule gehen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-hausaufgabe",
        "word": "die Hausaufgabe",
        "article": "die",
        "translation": "pekerjaan rumah",
        "exampleSentence": "Du sollst die Hausaufgabe machen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-essen",
        "word": "das Essen",
        "article": "das",
        "translation": "makanan",
        "exampleSentence": "Du sollst das Essen nicht verschwenden.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "der-arzt",
        "word": "der Arzt",
        "article": "der",
        "translation": "dokter",
        "exampleSentence": "Du sollst zum Arzt gehen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-medizin",
        "word": "die Medizin",
        "article": "die",
        "translation": "obat",
        "exampleSentence": "Du sollst die Medizin nehmen.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Du ___ mehr lernen. (sollen)",
        "options": [
          "sollst",
          "soll",
          "sollen",
          "sollt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "___ ich fragen? (dürfen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Du ___ hier nicht rauchen. (dürfen)",
        "options": [
          "darfst",
          "darf",
          "dürfen",
          "dürft"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Wir ___ pünktlich kommen. (sollen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Sie ___ hier nicht parken. (dürfen)",
        "options": [
          "dürfen",
          "darf",
          "darfst",
          "dürft"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ___ die Hausaufgabe machen. (sollen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Du ___ nicht so viel fernsehen. (sollen)",
        "options": [
          "sollst",
          "soll",
          "sollen",
          "sollt"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ihr ___ die Regeln befolgen. (sollen)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Du sollst mehr lernen. (kewajiban/saran)",
      "Du sollst nicht so viel fernsehen. (saran negatif)",
      "Darf ich fragen? (izin untuk bertanya)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-24",
    "level": "A1",
    "title": "Konjunktion denn (Alasan)",
    "grammarDescription": "• denn = karena (alasan, posisi V2 TETAP)\n• weil = karena (alasan, posisi verb di AKHIR)\n• denn tidak mengubah struktur kalimat\n• weil mengubah posisi verb ke akhir (Nebensatz)\n• denn lebih formal/tertulis, weil lebih umum dalam percakapan\n\nContoh:\n- Ich bleibe zu Hause, denn ich bin krank. (bin di posisi 2)\n- Ich bleibe zu Hause, weil ich krank bin. (bin di akhir)\n- Er kommt nicht, denn er hat keine Zeit. (hat di posisi 2)\n- Er kommt nicht, weil er keine Zeit hat. (hat di akhir)",
    "vocabulary": [
      {
        "id": "denn",
        "word": "denn",
        "article": "",
        "translation": "karena",
        "exampleSentence": "Ich bleibe zu Hause, denn ich bin krank.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "krank",
        "word": "krank",
        "article": "",
        "translation": "sakit",
        "exampleSentence": "Er ist krank.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "müde",
        "word": "müde",
        "article": "",
        "translation": "lelah",
        "exampleSentence": "Ich bin sehr müde.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "hungrig",
        "word": "hungrig",
        "article": "",
        "translation": "lapar",
        "exampleSentence": "Das Kind ist hungrig.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "durstig",
        "word": "durstig",
        "article": "",
        "translation": "haus",
        "exampleSentence": "Ich bin durstig.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "das-wetter",
        "word": "das Wetter",
        "article": "das",
        "translation": "cuaca",
        "exampleSentence": "Das Wetter ist schlecht.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-arbeit",
        "word": "die Arbeit",
        "article": "die",
        "translation": "pekerjaan",
        "exampleSentence": "Die Arbeit ist schwer.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-prüfung",
        "word": "die Prüfung",
        "article": "die",
        "translation": "ujian",
        "exampleSentence": "Die Prüfung ist morgen.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-straße",
        "word": "die Straße",
        "article": "die",
        "translation": "jalan",
        "exampleSentence": "Die Straße ist voll.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "der-verkehr",
        "word": "der Verkehr",
        "article": "der",
        "translation": "lalu lintas",
        "exampleSentence": "Der Verkehr ist schlimm.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich bleibe zu Hause, ___ ich krank bin.",
        "options": [
          "denn",
          "weil",
          "dass",
          "wenn"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er kommt nicht, ___ er keine Zeit hat.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich bin müde, ___ ich nicht gut geschlafen habe.",
        "options": [
          "denn",
          "weil",
          "dass",
          "wenn"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Sie bleibt zu Hause, ___ das Wetter schlecht ist.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich komme nicht, ___ ich keine Zeit habe.",
        "options": [
          "denn",
          "weil",
          "dass",
          "wenn"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Er bleibt zu Hause, ___ er krank ist.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Welcher Satz ist richtig mit 'denn'?",
        "options": [
          "Ich bin krank, denn ich habe Fieber.",
          "Ich bin krank, denn ich Fieber habe.",
          "Ich bin krank, denn ich Fieber hat.",
          "Ich bin krank, denn ich habe Fieber habe."
        ],
        "correctAnswer": 0
      },
      {
        "question": "Wir gehen nicht ins Kino, ___ wir kein Geld haben.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich bleibe zu Hause, denn ich bin krank. (bin di posisi 2)",
      "Ich bleibe zu Hause, weil ich krank bin. (bin di akhir)",
      "Er kommt nicht, denn er hat keine Zeit. (hat di posisi 2)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-25",
    "level": "A1",
    "title": "Indirekte Fragesätze",
    "grammarDescription": "• ob = apakah (untuk pertanyaan ya/tidak)\n• W-Fragewörter: wo, wann, wie, warum, was, wer, wie viel\n• Posisi verb di AKHIR klausa anak (seperti weil/dass)\n• Tidak ada inversi (verb tidak di posisi 2)\n• Kalimat utama + koma + ob/W-Fragewort + ... + verb di akhir\n\nContoh:\n- Ich weiß nicht, ob er kommt. (ob + verb di akhir)\n- Kannst du mir sagen, wann der Zug fährt? (wann + verb di akhir)\n- Er fragt, wie man das macht. (wie + verb di akhir)\n- Ich verstehe nicht, warum er das tut. (warum + verb di akhir)\n- Sag mir, was du denkst. (was + verb di akhir)",
    "vocabulary": [
      {
        "id": "ob",
        "word": "ob",
        "article": "",
        "translation": "apakah",
        "exampleSentence": "Ich weiß nicht, ob er kommt.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "wo",
        "word": "wo",
        "article": "",
        "translation": "dimana",
        "exampleSentence": "Ich frage mich, wo er wohnt.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "wann",
        "word": "wann",
        "article": "",
        "translation": "kapan",
        "exampleSentence": "Kannst du mir sagen, wann der Zug fährt?",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "wie",
        "word": "wie",
        "article": "",
        "translation": "bagaimana",
        "exampleSentence": "Er fragt, wie man das macht.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "warum",
        "word": "warum",
        "article": "",
        "translation": "mengapa",
        "exampleSentence": "Ich verstehe nicht, warum er das tut.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "was",
        "word": "was",
        "article": "",
        "translation": "apa",
        "exampleSentence": "Sag mir, was du denkst.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "wer",
        "word": "wer",
        "article": "",
        "translation": "siapa",
        "exampleSentence": "Ich weiß nicht, wer das ist.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "wie-viel",
        "word": "wie viel",
        "article": "",
        "translation": "berapa",
        "exampleSentence": "Kannst du sagen, wie viel das kostet?",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-adresse",
        "word": "die Adresse",
        "article": "die",
        "translation": "alamat",
        "exampleSentence": "Können Sie mir sagen, wo die Adresse ist?",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "die-uhrzeit",
        "word": "die Uhrzeit",
        "article": "die",
        "translation": "jam",
        "exampleSentence": "Ich frage, wann die Uhrzeit ist.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Ich weiß nicht, ___ er kommt. (ya/tidak)",
        "options": [
          "ob",
          "wie",
          "wo",
          "was"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Kannst du mir sagen, ___ der Zug fährt?",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er fragt, ___ man das macht.",
        "options": [
          "ob",
          "wie",
          "wo",
          "was"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Ich verstehe nicht, ___ er das tut.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Sag mir, ___ du denkst.",
        "options": [
          "ob",
          "wie",
          "wo",
          "was"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Ich weiß nicht, ___ das ist.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Können Sie mir sagen, ___ die Adresse ist?",
        "options": [
          "ob",
          "wie",
          "wo",
          "was"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Ich frage, ___ das kostet.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich weiß nicht, ob er kommt. (ob + verb di akhir)",
      "Kannst du mir sagen, wann der Zug fährt? (wann + verb di akhir)",
      "Er fragt, wie man das macht. (wie + verb di akhir)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a1-26",
    "level": "A1",
    "title": "Man + Partizip I",
    "grammarDescription": "• Partizip I = infinitif + -end\n• gehen → gehend, lesen → lesend, schreiben → schreibend\n• Posisi: di akhir kalimat setelah 'man' + verb utama\n• 'Man' selalu orang tunggal (verb selalu bentuk er/sie/es)\n• Digunakan untuk aktivitas umum yang dilakukan orang-orang\n\nContoh:\n- Man sieht Leute lesend im Park. (orang-orang membaca)\n- Man hört Kinder spielend im Garten. (anak-anak bermain)\n- Man findet viele Leute arbeitend im Büro. (orang-orang bekerja)\n- Man sieht Leute gehend auf der Straße. (orang-orang berjalan)",
    "vocabulary": [
      {
        "id": "man",
        "word": "man",
        "article": "",
        "translation": "orang/seseorang",
        "exampleSentence": "Man liest hier viel.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "gehend",
        "word": "gehend",
        "article": "",
        "translation": "berjalan",
        "exampleSentence": "Man sieht viele Menschen gehend.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lesend",
        "word": "lesend",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Man findet viele Menschen lesend.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "schreibend",
        "word": "schreibend",
        "article": "",
        "translation": "menulis",
        "exampleSentence": "Man hört viele Leute schreibend.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lesend",
        "word": "lesend",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Man sieht Leute lesend im Park.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lesend",
        "word": "lesend",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Man findet Leute lesend im Café.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lesend",
        "word": "lesend",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Man sieht Leute lesend in der U-Bahn.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lesend",
        "word": "lesend",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Man hört Leute lesend im Stadtpark.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lesend",
        "word": "lesend",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Man findet Leute lesend in der Bibliothek.",
        "phonetic": "",
        "level": "A1"
      },
      {
        "id": "lesend",
        "word": "lesend",
        "article": "",
        "translation": "membaca",
        "exampleSentence": "Man sieht Leute lesend im Wartezimmer.",
        "phonetic": "",
        "level": "A1"
      }
    ],
    "exercises": [
      {
        "question": "Man sieht Leute ___ im Park.",
        "options": [
          "lesend",
          "lesen",
          "gelesen",
          "lesend"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Man hört Kinder ___ im Garten.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Man findet viele Leute ___ im Büro.",
        "options": [
          "arbeitend",
          "arbeiten",
          "gearbeitet",
          "arbeitend"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Man sieht Leute ___ auf der Straße.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Man findet Leute ___ im Café.",
        "options": [
          "schreibend",
          "schreiben",
          "geschrieben",
          "schreibend"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Man hört Leute ___ im Restaurant.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Man sieht Leute ___ in der U-Bahn.",
        "options": [
          "lesend",
          "lesen",
          "gelesen",
          "lesend"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Man findet Leute ___ in der Bibliothek.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Man sieht Leute lesend im Park. (orang-orang membaca)",
      "Man hört Kinder spielend im Garten. (anak-anak bermain)",
      "Man findet viele Leute arbeitend im Büro. (orang-orang bekerja)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-14",
    "level": "A2",
    "title": "Temporale Präpositionen (seit, für, ab, bis)",
    "grammarDescription": "• seit + Dativ: masa yang masih berlangsung (sejak)\n• für + Akkusativ: durasi waktu (selama)\n• ab + Dativ: titik awal waktu (mulai dari)\n• bis + Akkusativ: titik akhir waktu (sampai)\n• nachdem + Subjekt + Verb di AKHIR: setelah\n\nContoh:\n- Ich lebe seit 2020 in Berlin. (seit + Dativ)\n- Er arbeitet für 8 Stunden. (für + Akk)\n- Ab morgen bin ich im Urlaub. (ab + Dativ)\n- Ich arbeite bis 18 Uhr. (bis + Akk)\n- Nachdem ich gegessen habe, gehe ich spazieren. (verb di akhir)",
    "vocabulary": [
      {
        "id": "seit",
        "word": "seit",
        "article": "",
        "translation": "sejak",
        "exampleSentence": "Ich lebe seit 5 Jahren in Berlin.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "für",
        "word": "für",
        "article": "",
        "translation": "selama",
        "exampleSentence": "Er arbeitet für 3 Stunden.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "ab",
        "word": "ab",
        "article": "",
        "translation": "mulai dari",
        "exampleSentence": "Ab morgen bin ich im Urlaub.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "bis",
        "word": "bis",
        "article": "",
        "translation": "sampai",
        "exampleSentence": "Ich arbeite bis 18 Uhr.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "nachdem",
        "word": "nachdem",
        "article": "",
        "translation": "setelah",
        "exampleSentence": "Nachdem ich gegessen habe, gehe ich spazieren.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-urlaub",
        "word": "der Urlaub",
        "article": "der",
        "translation": "liburan",
        "exampleSentence": "Im Urlaub fahre ich ans Meer.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-arbeit",
        "word": "die Arbeit",
        "article": "die",
        "translation": "pekerjaan",
        "exampleSentence": "Nach der Arbeit gehe ich nach Hause.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-wochenende",
        "word": "das Wochenende",
        "article": "das",
        "translation": "akhir pekan",
        "exampleSentence": "Am Wochenende mache ich nichts.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-morgen",
        "word": "der Morgen",
        "article": "der",
        "translation": "pagi",
        "exampleSentence": "Am Morgen trinke ich Kaffee.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-abend",
        "word": "der Abend",
        "article": "der",
        "translation": "sore/malam",
        "exampleSentence": "Am Abend sehe ich fern.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Ich lebe ___ 5 Jahren in Berlin.",
        "options": [
          "seit",
          "für",
          "ab",
          "bis"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er arbeitet ___ 8 Stunden.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ morgen bin ich im Urlaub.",
        "options": [
          "Seit",
          "Für",
          "Ab",
          "Bis"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Ich arbeite ___ 18 Uhr.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ ich gegessen habe, gehe ich spazieren.",
        "options": [
          "Seit",
          "Für",
          "Ab",
          "Nachdem"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Ich wohne ___ 2 Jahren hier.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Der Film dauert ___ 2 Stunden.",
        "options": [
          "seit",
          "für",
          "ab",
          "bis"
        ],
        "correctAnswer": 1
      },
      {
        "question": "___ dem Essen gehe wir spazieren.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich lebe seit 2020 in Berlin. (seit + Dativ)",
      "Er arbeitet für 8 Stunden. (für + Akk)",
      "Ab morgen bin ich im Urlaub. (ab + Dativ)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-15",
    "level": "A2",
    "title": "Lokale Präpositionen (von, aus, zu, nach)",
    "grammarDescription": "• von + Dativ: dari permukaan (dari meja, dari atap)\n• aus + Dativ: dari dalam (dari kota, dari negara)\n• zu + Dativ: ke tempat (ke dokter, ke sekolah)\n• nach + Dativ: ke kota/negara (nach Berlin, nach Deutschland)\n• in + Akk: ke dalam (in die Schule, in die Stadt)\n• in + Dat: di dalam (in der Schule, in der Stadt)\n\nContoh:\n- Ich komme von der Arbeit. (von + Dativ)\n- Ich komme aus Deutschland. (aus + Dativ)\n- Ich gehe zum Arzt. (zu + dem → zum)\n- Ich fahre nach Berlin. (nach + Dativ)\n- Ich gehe in die Schule. (in + Akk — ke dalam)\n- Ich bin in der Schule. (in + Dat — di dalam)",
    "vocabulary": [
      {
        "id": "von",
        "word": "von",
        "article": "",
        "translation": "dari",
        "exampleSentence": "Ich komme von der Arbeit.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "aus",
        "word": "aus",
        "article": "",
        "translation": "dari dalam",
        "exampleSentence": "Ich komme aus Deutschland.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "zu",
        "word": "zu",
        "article": "",
        "translation": "ke",
        "exampleSentence": "Ich gehe zum Arzt.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "nach",
        "word": "nach",
        "article": "",
        "translation": "ke (kota/negara)",
        "exampleSentence": "Ich fahre nach Berlin.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "in",
        "word": "in",
        "article": "",
        "translation": "ke dalam / di dalam",
        "exampleSentence": "Ich gehe in die Schule.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-schule",
        "word": "die Schule",
        "article": "die",
        "translation": "sekolah",
        "exampleSentence": "Ich gehe zur Schule.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-haus",
        "word": "das Haus",
        "article": "das",
        "translation": "rumah",
        "exampleSentence": "Ich komme aus dem Haus.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-büro",
        "word": "das Büro",
        "article": "das",
        "translation": "kantor",
        "exampleSentence": "Ich gehe ins Büro.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-stadt",
        "word": "die Stadt",
        "article": "die",
        "translation": "kota",
        "exampleSentence": "Ich fahre in die Stadt.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-land",
        "word": "das Land",
        "article": "das",
        "translation": "negeri",
        "exampleSentence": "Ich komme aus einem anderen Land.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Ich komme ___ der Arbeit.",
        "options": [
          "von",
          "aus",
          "zu",
          "nach"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich komme ___ Deutschland.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich gehe ___ Arzt.",
        "options": [
          "von",
          "aus",
          "zu",
          "nach"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Ich fahre ___ Berlin.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich gehe ___ die Schule.",
        "options": [
          "von",
          "aus",
          "zu",
          "in"
        ],
        "correctAnswer": 3
      },
      {
        "question": "Ich bin ___ der Schule.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich komme ___ einem anderen Land.",
        "options": [
          "von",
          "aus",
          "zu",
          "nach"
        ],
        "correctAnswer": 1
      },
      {
        "question": "Ich gehe ___ das Büro.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich komme von der Arbeit. (von + Dativ)",
      "Ich komme aus Deutschland. (aus + Dativ)",
      "Ich gehe zum Arzt. (zu + dem → zum)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-16",
    "level": "A2",
    "title": "Positionsverben (sitzen, liegen, stehen, gehen, fahren)",
    "grammarDescription": "• Positionsverben (sitzen, liegen, stehen) → Dativ (posisi statis)\n• Verba gerak (gehen, fahren, fliegen) → Akkusativ (pergerakan)\n• Wechselpräpositionen: in, an, auf, über, unter, vor, hinter, neben, zwischen\n• Pertanyaan: Wo? (Dativ) — Woher? (Dativ) — Wohin? (Akkusativ)\n\nContoh:\n- Das Buch liegt auf dem Tisch. (Dativ — posisi statis)\n- Ich lege das Buch auf den Tisch. (Akk — pergerakan)\n- Er steht an der Wand. (Dativ — posisi statis)\n- Er geht an die Wand. (Akk — pergerakan)\n- Ich sitze auf dem Sofa. (Dativ — posisi statis)",
    "vocabulary": [
      {
        "id": "sitzen",
        "word": "sitzen",
        "article": "",
        "translation": "duduk",
        "exampleSentence": "Ich sitze auf dem Stuhl.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "liegen",
        "word": "liegen",
        "article": "",
        "translation": "berbaring/terletak",
        "exampleSentence": "Das Buch liegt auf dem Tisch.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "stehen",
        "word": "stehen",
        "article": "",
        "translation": "berdiri",
        "exampleSentence": "Er steht an der Bushaltestelle.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "gehen",
        "word": "gehen",
        "article": "",
        "translation": "berjalan/pergi",
        "exampleSentence": "Ich gehe in die Schule.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "fahren",
        "word": "fahren",
        "article": "",
        "translation": "berkendara/pergi",
        "exampleSentence": "Er fährt mit dem Auto.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "fliegen",
        "word": "fliegen",
        "article": "",
        "translation": "terbang",
        "exampleSentence": "Wir fliegen nach Mallorca.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-stuhl",
        "word": "der Stuhl",
        "article": "der",
        "translation": "kursi",
        "exampleSentence": "Der Stuhl steht im Zimmer.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-tisch",
        "word": "der Tisch",
        "article": "der",
        "translation": "meja",
        "exampleSentence": "Das Buch liegt auf dem Tisch.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-sofa",
        "word": "das Sofa",
        "article": "das",
        "translation": "sofa",
        "exampleSentence": "Ich sitze auf dem Sofa.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-bushaltestelle",
        "word": "die Bushaltestelle",
        "article": "die",
        "translation": "halte bus",
        "exampleSentence": "Er steht an der Bushaltestelle.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Das Buch liegt ___ dem Tisch. (posisi)",
        "options": [
          "auf dem",
          "auf den",
          "auf der",
          "auf das"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich lege das Buch ___ den Tisch. (gerak)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er steht ___ der Wand. (posisi)",
        "options": [
          "an der",
          "an den",
          "an dem",
          "an die"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er geht ___ die Wand. (gerak)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich sitze ___ dem Sofa. (posisi)",
        "options": [
          "auf dem",
          "auf den",
          "auf der",
          "auf das"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er fährt ___ dem Auto. (gerak)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das Bild hängt ___ der Wand. (posisi)",
        "options": [
          "an der",
          "an den",
          "an dem",
          "an die"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Wir gehen ___ das Kino. (gerak)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Das Buch liegt auf dem Tisch. (Dativ — posisi statis)",
      "Ich lege das Buch auf den Tisch. (Akk — pergerakan)",
      "Er steht an der Wand. (Dativ — posisi statis)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-17",
    "level": "A2",
    "title": "Adjektivendungen (bestimmt/unbestimmt)",
    "grammarDescription": "• Artikel pasti (der, die, das): -e untuk semua kasus kecuali Akk maskulin → -en\n• Artikel tidak pasti (ein, eine): -er (Nom mask), -e (Nom fem/neut), -en (Akk/Dat)\n• Tanpa artikel: -er (Nom mask), -e (Nom fem/neut), -es (Nom/Akk neut), -en (Dat/Akk)\n• Dativ selalu -en untuk semua jenis kelamin\n\nContoh:\n- Der gute Film. (Artikel pasti, Nominativ maskulin → -e)\n- Den guten Film. (Artikel pasti, Akk maskulin → -en)\n- Ein guter Film. (Artikel tidak pasti, Nom maskulin → -er)\n- Ein guter Film. (Artikel tidak pasti, Nom maskulin → -er)\n- Guter Film. (Tanpa artikel, Nom maskulin → -er)\n- Guten Film. (Tanpa artikel, Akk maskulin → -en)",
    "vocabulary": [
      {
        "id": "gut",
        "word": "gut",
        "article": "",
        "translation": "bagus",
        "exampleSentence": "Das ist ein guter Film.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "schlecht",
        "word": "schlecht",
        "article": "",
        "translation": "buruk",
        "exampleSentence": "Das ist ein schlechter Film.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "groß",
        "word": "groß",
        "article": "",
        "translation": "besar",
        "exampleSentence": "Das ist ein großes Haus.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "klein",
        "word": "klein",
        "article": "",
        "translation": "kecil",
        "exampleSentence": "Das ist ein kleines Kind.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "neu",
        "word": "neu",
        "article": "",
        "translation": "baru",
        "exampleSentence": "Das ist ein neues Auto.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "alt",
        "word": "alt",
        "article": "",
        "translation": "lama/tua",
        "exampleSentence": "Das ist ein altes Buch.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "schön",
        "word": "schön",
        "article": "",
        "translation": "indah",
        "exampleSentence": "Das ist ein schönes Bild.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "interessant",
        "word": "interessant",
        "article": "",
        "translation": "menarik",
        "exampleSentence": "Das ist ein interessantes Buch.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-film",
        "word": "das Film",
        "article": "der",
        "translation": "film",
        "exampleSentence": "Der Film ist gut.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-buch",
        "word": "das Buch",
        "article": "das",
        "translation": "buku",
        "exampleSentence": "Das Buch ist interessant.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Der ___ Film ist gut. (gut, Nom maskulin, artikel pasti)",
        "options": [
          "gute",
          "guter",
          "guten",
          "gutes"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich sehe einen ___ Film. (gut, Akk maskulin, artikel tidak pasti)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das ist ein ___ Buch. (interessant, Nom neutrum, artikel tidak pasti)",
        "options": [
          "interessantes",
          "interessanter",
          "interessanten",
          "interessante"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Der ___ Film ist lang. (lang, Nom maskulin, artikel pasti)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ Film ist gut. (gut, Nom maskulin, tanpa artikel)",
        "options": [
          "Guter",
          "Gute",
          "Guten",
          "Gutes"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich sehe ___ Film. (gut, Akk maskulin, tanpa artikel)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das ist ___ Buch. (interessant, Nom neutrum, tanpa artikel)",
        "options": [
          "ein interessantes",
          "ein interessanter",
          "ein interessanten",
          "ein interessante"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Der ___ Film ist lang. (alt, Nom maskulin, artikel pasti)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Der gute Film. (Artikel pasti, Nominativ maskulin → -e)",
      "Den guten Film. (Artikel pasti, Akk maskulin → -en)",
      "Ein guter Film. (Artikel tidak pasti, Nom maskulin → -er)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-18",
    "level": "A2",
    "title": "Adjektive nach Komparativ & Superlativ",
    "grammarDescription": "• Komparatif: adjektiv + -er + als (lebih...dari)\n• Superlatif: am + adjektiv + -sten (paling...)\n• Adjektif dengan e ganda: groß → größer (ganda jadi satu)\n• Adjektif dengan a/ä: alt → älter (a→ä), nackt → nackter\n• Irregular: gut→besser, viel→mehr, gern→lieber, hoch→höher, nah→näher\n\nContoh:\n- Der Zug ist schneller als das Auto. (Komparativ)\n- Das Auto ist am schnellsten. (Superlativ)\n- Er hat mehr Geld als ich. (Komparativ irregular: viel→mehr)\n- Sie fährt am liebsten Fahrrad. (Superlativ irregular: gern→liebsten)\n- Der Berg ist höher als der Hügel. (Komparativ irregular: hoch→höher)\n- Mein Haus ist näher als deins. (Komparativ irregular: nah→näher)",
    "vocabulary": [
      {
        "id": "schnell",
        "word": "schnell",
        "article": "",
        "translation": "cepat",
        "exampleSentence": "Der Zug ist schneller als das Auto.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "langsam",
        "word": "langsam",
        "article": "",
        "translation": "lambat",
        "exampleSentence": "Die Schnecke ist langsamer als der Hund.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "gut",
        "word": "gut",
        "article": "",
        "translation": "bagus",
        "exampleSentence": "Er ist besser als ich.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "schlecht",
        "word": "schlecht",
        "article": "",
        "translation": "buruk",
        "exampleSentence": "Das Wetter ist schlechter als gestern.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "viel",
        "word": "viel",
        "article": "",
        "translation": "banyak",
        "exampleSentence": "Er hat mehr Geld als ich.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "gern",
        "word": "gern",
        "article": "",
        "translation": "senang",
        "exampleSentence": "Ich fahre lieber Fahrrad als Auto.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "hoch",
        "word": "hoch",
        "article": "",
        "translation": "tinggi",
        "exampleSentence": "Der Berg ist höher als der Hügel.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "nah",
        "word": "nah",
        "article": "",
        "translation": "dekat",
        "exampleSentence": "Mein Haus ist näher als deins.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-geld",
        "word": "das Geld",
        "article": "das",
        "translation": "uang",
        "exampleSentence": "Er hat mehr Geld als ich.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-auto",
        "word": "das Auto",
        "article": "das",
        "translation": "mobil",
        "exampleSentence": "Das Auto ist teurer als das Fahrrad.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Der Zug ist ___ als das Auto. (schnell)",
        "options": [
          "schneller",
          "am schnellsten",
          "schnellster",
          "schnell"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er hat ___ Geld als ich. (viel)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Sie fährt ___ Fahrrad als mit dem Bus. (gern)",
        "options": [
          "lieber",
          "am liebsten",
          "gerner",
          "lieber als"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Der Berg ist ___ als der Hügel. (hoch)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das Auto ist ___ als das Fahrrad. (teuer)",
        "options": [
          "teurer",
          "am teuersten",
          "teuerster",
          "teuer"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Mein Haus ist ___ als deins. (nah)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das ist ___ Hotel in der Stadt. (teuer, Superlativ)",
        "options": [
          "das teuerste",
          "am teuersten",
          "teurer",
          "das teurere"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ist ___ als sein Bruder. (alt)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Der Zug ist schneller als das Auto. (Komparativ)",
      "Das Auto ist am schnellsten. (Superlativ)",
      "Er hat mehr Geld als ich. (Komparativ irregular: viel→mehr)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "b1-13",
    "level": "B1",
    "title": "Konnektoren (obwohl, trotzdem, deshalb, indem)",
    "grammarDescription": "• obwohl: verb di AKHIR (seperti weil) — obwohl es regnet, gehe ich\n• trotzdem: verb di posisi 2 — es regnet, trotzdem gehe ich\n• trotz + Dativ: preposisi — trotz des Regens\n• deshalb/deswegen/daher: verb di posisi 2 — es regnet, deshalb bleibe ich\n• indem: verb di AKHIR — indem man liest\n• dadurch: verb di posisi 2 — dadurch verbessert man sich\n\nContoh:\n- Obwohl es regnet (verb akhir), gehe ich spazieren.\n- Es regnet, trotzdem gehe ich spazieren. (trotzdem + V2)\n- Trotz des Regens (Dativ) gehe ich spazieren.\n- Es regnet, deshalb bleibe ich zu Hause. (deshalb + V2)\n- Man lernt Deutsch, indem man liest. (indem + verb akhir)\n- Man lernt Deutsch. Dadurch verbessert man sich. (dadurch + V2)",
    "vocabulary": [
      {
        "id": "obwohl",
        "word": "obwohl",
        "article": "",
        "translation": "meskipun",
        "exampleSentence": "Obwohl es regnet, gehe ich spazieren.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "trotzdem",
        "word": "trotzdem",
        "article": "",
        "translation": "meskipun begitu",
        "exampleSentence": "Es regnet, trotzdem gehe ich spazieren.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "trotz",
        "word": "trotz",
        "article": "",
        "translation": "meskipun (+ Dativ)",
        "exampleSentence": "Trotz des Regens gehe ich spazieren.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "deshalb",
        "word": "deshalb",
        "article": "",
        "translation": "karena itu",
        "exampleSentence": "Es regnet, deshalb bleibe ich zu Hause.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "deswegen",
        "word": "deswegen",
        "article": "",
        "translation": "karena itu",
        "exampleSentence": "Es regnet, deswegen bleibe ich zu Hause.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "daher",
        "word": "daher",
        "article": "",
        "translation": "karena itu",
        "exampleSentence": "Es regnet, daher bleibe ich zu Hause.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "indem",
        "word": "indem",
        "article": "",
        "translation": "dengan cara",
        "exampleSentence": "Man lernt Deutsch, indem man liest.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "dadurch",
        "word": "dadurch",
        "article": "",
        "translation": "dengan cara itu",
        "exampleSentence": "Man lernt Deutsch. Dadurch verbessert man sich.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "die-wirkung",
        "word": "die Wirkung",
        "article": "die",
        "translation": "dampak",
        "exampleSentence": "Die Wirkung des Medikaments ist gut.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "die-konsequenz",
        "word": "die Konsequenz",
        "article": "die",
        "translation": "konsekuensi",
        "exampleSentence": "Die Konsequenz ist wichtig.",
        "phonetic": "",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "___ es regnet, gehe ich spazieren.",
        "options": [
          "Obwohl",
          "Trotzdem",
          "Deshalb",
          "Indem"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Es regnet, ___ gehe ich spazieren.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Es regnet, ___ bleibe ich zu Hause.",
        "options": [
          "obwohl",
          "trotzdem",
          "deshalb",
          "indem"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Man lernt Deutsch, ___ man liest.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ des Regens gehe ich spazieren.",
        "options": [
          "Obwohl",
          "Trotzdem",
          "Trotz",
          "Deshalb"
        ],
        "correctAnswer": 2
      },
      {
        "question": "Man lernt Deutsch. ___ verbessert man sich.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ es kalt ist, gehe ich ins Schwimmbad.",
        "options": [
          "Obwohl",
          "Trotzdem",
          "Deshalb",
          "Indem"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Es ist kalt, ___ bleibe ich zu Hause.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Obwohl es regnet (verb akhir), gehe ich spazieren.",
      "Es regnet, trotzdem gehe ich spazieren. (trotzdem + V2)",
      "Trotz des Regens (Dativ) gehe ich spazieren."
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "b1-14",
    "level": "B1",
    "title": "Indirekte Rede (Konjunktiv I & II)",
    "grammarDescription": "• Konjunktiv I: laporan langsung (sagen, erzählen, berichten)\n• Konjunktiv II: keraguan atau laporan tidak langsung\n• Konjunktiv I bentuk: sei, habe, komme, wisse (hampir sama dengan Präsens)\n• Jika Konjunktiv I sama dengan Präsens, gunakan Konjunktiv II\n• Konjunktiv II: wäre, hätte, käme, wüsste (dari Präteritum)\n\nContoh:\n- Er sagt: 'Ich bin krank.' → Er sagt, er sei krank. (Konj I)\n- Sie sagt: 'Ich komme morgen.' → Sie sagt, sie komme morgen. (Konj I)\n- Er sagt: 'Ich habe Zeit.' → Er sagt, er habe Zeit. (Konj I)\n- Sie sagt: 'Ich weiß es.' → Sie sagt, sie wisse es. (Konj I)\n- Er sagt: 'Ich würde gern kommen.' → Er sagt, er würde gern kommen. (Konj II)",
    "vocabulary": [
      {
        "id": "sagen",
        "word": "sagen",
        "article": "",
        "translation": "mengatakan",
        "exampleSentence": "Er sagt, er sei krank.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "meinen",
        "word": "meinen",
        "article": "",
        "translation": "berpendapat",
        "exampleSentence": "Sie meint, das Wetter sei schön.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "glauben",
        "word": "glauben",
        "article": "",
        "translation": "mempercayai",
        "exampleSentence": "Er glaubt, sie sei nett.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "erzählen",
        "word": "erzählen",
        "article": "",
        "translation": "menceritakan",
        "exampleSentence": "Sie erzählt, sie habe einen Hund.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "berichten",
        "word": "berichten",
        "article": "",
        "translation": "melaporkan",
        "exampleSentence": "Er berichtet, das Meeting sei wichtig.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "fragen",
        "word": "fragen",
        "article": "",
        "translation": "bertanya",
        "exampleSentence": "Er fragt, ob sie komme.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "antworten",
        "word": "antworten",
        "article": "",
        "translation": "menjawab",
        "exampleSentence": "Sie antwortet, sie komme morgen.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "behaupten",
        "word": "behaupten",
        "article": "",
        "translation": "mengklaim",
        "exampleSentence": "Er behauptet, er sei der Beste.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "die-behauptung",
        "word": "die Behauptung",
        "article": "die",
        "translation": "klaim",
        "exampleSentence": "Seine Behauptung ist falsch.",
        "phonetic": "",
        "level": "B1"
      },
      {
        "id": "die-quelle",
        "word": "die Quelle",
        "article": "die",
        "translation": "sumber",
        "exampleSentence": "Die Quelle ist vertrauenswürdig.",
        "phonetic": "",
        "level": "B1"
      }
    ],
    "exercises": [
      {
        "question": "Er sagt, er ___ krank. (Konjunktiv I)",
        "options": [
          "sei",
          "ist",
          "war",
          "wäre"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Sie sagt, sie ___ morgen. (Konjunktiv I von kommen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er sagt, er ___ Zeit. (Konjunktiv I von haben)",
        "options": [
          "habe",
          "hat",
          "hatte",
          "hätte"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Sie sagt, sie ___ es. (Konjunktiv I von wissen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er sagt, er ___ gern kommen. (Konjunktiv II)",
        "options": [
          "würde",
          "wird",
          "will",
          "wollte"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Sie sagt, sie ___ das nicht. (Konjunktiv I von glauben)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er sagt, er ___ das nicht. (Konjunktiv II von können)",
        "options": [
          "könnte",
          "kann",
          "konnte",
          "kann"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er sagt: 'Ich habe Zeit.' → Er sagt, er ___ Zeit.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Er sagt: 'Ich bin krank.' → Er sagt, er sei krank. (Konj I)",
      "Sie sagt: 'Ich komme morgen.' → Sie sagt, sie komme morgen. (Konj I)",
      "Er sagt: 'Ich habe Zeit.' → Er sagt, er habe Zeit. (Konj I)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-19",
    "level": "A2",
    "title": "Adjektive nach bestimmtem Artikel",
    "grammarDescription": "• Nominativ: -e (maskulin, feminin, neutrum), -en (plural)\n• Akkusativ: -en (maskulin), -e (feminin, neutrum, plural)\n• Dativ: -en (semua jenis kelamin)\n• Pola sederhana: hanya maskulin Akk yang berubah dari -e ke -en\n\nContoh:\n- Der alt**e** Mann. (Nom maskulin → -e)\n- Den alt**en** Mann. (Akk maskulin → -en)\n- Die jung**e** Frau. (Nom/Akk feminin → -e)\n- Das neu**e** Auto. (Nom/Akk neutrum → -e)\n- Dem alt**en** Mann. (Dat maskulin → -en)\n- Der alt**en** Frau. (Dat feminin → -en)",
    "vocabulary": [
      {
        "id": "der-rote-apfel",
        "word": "der rote Apfel",
        "article": "der",
        "translation": "apel merah",
        "exampleSentence": "Der rote Apfel schmeckt gut.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-grüne-farbe",
        "word": "die grüne Farbe",
        "article": "die",
        "translation": "warna hijau",
        "exampleSentence": "Die grüne Farbe ist schön.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-weiße-haus",
        "word": "das weiße Haus",
        "article": "das",
        "translation": "rumah putih",
        "exampleSentence": "Das weiße Haus steht am Berg.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-alte-mann",
        "word": "der alte Mann",
        "article": "der",
        "translation": "pria tua",
        "exampleSentence": "Der alte Mann liest die Zeitung.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-junge-frau",
        "word": "die junge Frau",
        "article": "die",
        "translation": "wanita muda",
        "exampleSentence": "Die junge Frau arbeitet im Büro.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-neue-auto",
        "word": "das neue Auto",
        "article": "das",
        "translation": "mobil baru",
        "exampleSentence": "Das neue Auto ist schnell.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-dunkle-nacht",
        "word": "die dunkle Nacht",
        "article": "die",
        "translation": "malam gelap",
        "exampleSentence": "In der dunklen Nacht sehe ich Sterne.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-lange-weg",
        "word": "der lange Weg",
        "article": "der",
        "translation": "jalan panjang",
        "exampleSentence": "Der lange Weg führt zum Berg.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-heiße-suppe",
        "word": "die heiße Suppe",
        "article": "die",
        "translation": "sup panas",
        "exampleSentence": "Die heiße Suppe schmeckt lecker.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-kalte-wasser",
        "word": "das kalte Wasser",
        "article": "das",
        "translation": "air dingin",
        "exampleSentence": "Das kalte Wasser erfrischt.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Der ___ Mann liest. (alt, Nom)",
        "options": [
          "alte",
          "alten",
          "alter",
          "altes"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich sehe den ___ Mann. (alt, Akk)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Die ___ Frau arbeitet. (jung, Nom)",
        "options": [
          "junge",
          "jungen",
          "junger",
          "junges"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Das ___ Auto ist schnell. (neu, Nom)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Dem ___ Mann gebe ich das Buch. (alt, Dat)",
        "options": [
          "alten",
          "alte",
          "alter",
          "altes"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Der ___ Weg ist lang. (gut, Nom)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Die ___ Suppe schmeckt gut. ( heiß, Nom)",
        "options": [
          "heiße",
          "heißen",
          "heißer",
          "heißes"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich trinke das ___ Wasser. (kalt, Akk)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Der alt**e** Mann. (Nom maskulin → -e)",
      "Den alt**en** Mann. (Akk maskulin → -en)",
      "Die jung**e** Frau. (Nom/Akk feminin → -e)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-20",
    "level": "A2",
    "title": "werden (Futur & Kondisional)",
    "grammarDescription": "• Futur I: werden + Infinitif (akhir kalimat)\n• werden konjugasi: ich werde, du wirst, er/sie wird, wir werden, ihr werdet, sie werden\n• Passiv mit werden: werden + Partizip II\n• Perubahan状态: werden + Adjektiv (menjadi...)\n\nContoh:\n- Ich **werde** morgen **kommen**. (Futur I)\n- Er **wird** Arzt **werden**. (Futur I)\n- Das Buch **wird** gelesen **werden**. (Passiv Futur)\n- Die Blätter **werden** rot. (Perubahan状态)\n- Es **wird** regnen. (Futur I — cuaca)",
    "vocabulary": [
      {
        "id": "werden",
        "word": "werden",
        "article": "",
        "translation": "menjadi/akan",
        "exampleSentence": "Er wird Arzt.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-wetter",
        "word": "das Wetter",
        "article": "das",
        "translation": "cuaca",
        "exampleSentence": "Das Wetter wird besser.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-zukunft",
        "word": "die Zukunft",
        "article": "die",
        "translation": "masa depan",
        "exampleSentence": "In der Zukunft wird alles anders.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-regen",
        "word": "der Regen",
        "article": "der",
        "translation": "hujan",
        "exampleSentence": "Es wird regnen.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-farbe",
        "word": "die Farbe",
        "article": "die",
        "translation": "warna",
        "exampleSentence": "Die Blätter werden rot.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-licht",
        "word": "das Licht",
        "article": "das",
        "translation": "cahaya",
        "exampleSentence": "Das Licht wird dunkel.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-kaffee",
        "word": "der Kaffee",
        "article": "der",
        "translation": "kopi",
        "exampleSentence": "Der Kaffee wird kalt.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-temperatur",
        "word": "die Temperatur",
        "article": "die",
        "translation": "suhu",
        "exampleSentence": "Die Temperatur wird höher.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-arbeit",
        "word": "die Arbeit",
        "article": "die",
        "translation": "pekerjaan",
        "exampleSentence": "Die Arbeit wird schwerer.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-leben",
        "word": "das Leben",
        "article": "das",
        "translation": "kehidupan",
        "exampleSentence": "Das Leben wird besser.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Ich ___ morgen kommen.",
        "options": [
          "werde",
          "wirst",
          "wird",
          "werden"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ___ Arzt werden.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Die Blätter ___ rot.",
        "options": [
          "werden",
          "wird",
          "wirst",
          "werde"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Es ___ regnen.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Du ___ morgen früh aufstehen.",
        "options": [
          "wirst",
          "werde",
          "wird",
          "werden"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Das Wetter ___ besser.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Wir ___ nächstes Jahr reisen.",
        "options": [
          "werden",
          "wird",
          "wirst",
          "werde"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Der Kaffee ___ kalt.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich **werde** morgen **kommen**. (Futur I)",
      "Er **wird** Arzt **werden**. (Futur I)",
      "Das Buch **wird** gelesen **werden**. (Passiv Futur)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-21",
    "level": "A2",
    "title": "Verben mit Präposition",
    "grammarDescription": "• Verba dengan +Akk: warten auf, sich freuen über, sich interessieren für\n• Verba dengan +Dat: fragen nach, sich bedanken für, halten von\n• Verba dengan +Akk/Dat: denken an (Akk), abhängen von (Dat)\n• Preposisi tidak bisa diganti — harus dihafal\n\nContoh:\n- Ich warte auf **den** Bus. (Akk — maskulin)\n- Ich freue mich über **das** Geschenk. (Akk — neutrum)\n- Ich interessiere mich für **die** Musik. (Akk — feminin)\n- Er fragt nach **dem** Weg. (Dat — maskulin)\n- Ich bedanke mich für **die** Hilfe. (Akk — feminin)\n- Was hältst du von **dem** Film? (Dat — maskulin)",
    "vocabulary": [
      {
        "id": "warten-auf",
        "word": "warten auf",
        "article": "",
        "translation": "menunggu",
        "exampleSentence": "Ich warte auf den Bus.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "sich-freuen-über",
        "word": "sich freuen über",
        "article": "",
        "translation": "senang tentang",
        "exampleSentence": "Ich freue mich über das Geschenk.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "sich-interessieren-für",
        "word": "sich interessieren für",
        "article": "",
        "translation": "tertarik dengan",
        "exampleSentence": "Ich interessiere mich für Musik.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "denken-an",
        "word": "denken an",
        "article": "",
        "translation": "memikirkan",
        "exampleSentence": "Ich denke an dich.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "sich-ärgern-über",
        "word": "sich ärgern über",
        "article": "",
        "translation": "marah tentang",
        "exampleSentence": "Ich ärgere mich über den Verkehr.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "sich-erinnern-an",
        "word": "sich erinnern an",
        "article": "",
        "translation": "mengingat",
        "exampleSentence": "Ich erinnere mich an dich.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "fragen-nach",
        "word": "fragen nach",
        "article": "",
        "translation": "bertanya tentang",
        "exampleSentence": "Er fragt nach dem Weg.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "sich-bedanken-für",
        "word": "sich bedanken für",
        "article": "",
        "translation": "berterima kasih untuk",
        "exampleSentence": "Ich bedanke mich für die Hilfe.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "halten-von",
        "word": "halten von",
        "article": "",
        "translation": "berpendapat tentang",
        "exampleSentence": "Was hältst du von dem Film?",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "abhängen-von",
        "word": "abhängen von",
        "article": "",
        "translation": "tergantung pada",
        "exampleSentence": "Das hängt von dir ab.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Ich warte ___ den Bus.",
        "options": [
          "auf",
          "an",
          "für",
          "von"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich freue mich ___ das Geschenk.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich interessiere mich ___ Musik.",
        "options": [
          "für",
          "auf",
          "an",
          "von"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er fragt ___ dem Weg.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich denke ___ dich.",
        "options": [
          "an",
          "auf",
          "für",
          "von"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Was hältst du ___ dem Film?",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich ärgere mich ___ den Verkehr.",
        "options": [
          "über",
          "auf",
          "für",
          "von"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Das hängt ___ dir ab.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich warte auf **den** Bus. (Akk — maskulin)",
      "Ich freue mich über **das** Geschenk. (Akk — neutrum)",
      "Ich interessiere mich für **die** Musik. (Akk — feminin)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-22",
    "level": "A2",
    "title": "Adjektive nach unbestimmtem Artikel",
    "grammarDescription": "• Nominativ: -er (maskulin), -e (feminin, neutrum)\n• Akkusativ: -en (maskulin), -e (feminin, neutrum)\n• Dativ: -en (semua jenis kelamin)\n• kein menggunakan pola yang sama seperti ein\n\nContoh:\n- Ein rot**er** Apfel. (Nom maskulin → -er)\n- Eine grün**e** Farbe. (Nom feminin → -e)\n- Ein weiẞ**es** Haus. (Nom neutrum → -es)\n- Einen alt**en** Mann. (Akk maskulin → -en)\n- Kein gut**er** Film. (Nom maskulin → -er)\n- Keine schlecht**e** Idee. (Nom feminin → -e)",
    "vocabulary": [
      {
        "id": "ein-roter-apfel",
        "word": "ein roter Apfel",
        "article": "",
        "translation": "apel merah",
        "exampleSentence": "Ich esse einen roten Apfel.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "eine-grüne-farbe",
        "word": "eine grüne Farbe",
        "article": "",
        "translation": "warna hijau",
        "exampleSentence": "Das ist eine grüne Farbe.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "ein-weißes-haus",
        "word": "ein weißes Haus",
        "article": "",
        "translation": "rumah putih",
        "exampleSentence": "Das ist ein weißes Haus.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "ein-alter-mann",
        "word": "ein alter Mann",
        "article": "",
        "translation": "pria tua",
        "exampleSentence": "Ich sehe einen alten Mann.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "eine-junge-frau",
        "word": "eine junge Frau",
        "article": "",
        "translation": "wanita muda",
        "exampleSentence": "Das ist eine junge Frau.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "ein-neues-auto",
        "word": "ein neues Auto",
        "article": "",
        "translation": "mobil baru",
        "exampleSentence": "Ich fahre ein neues Auto.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "kein-guter-film",
        "word": "kein guter Film",
        "article": "",
        "translation": "bukan film bagus",
        "exampleSentence": "Das ist kein guter Film.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "keine-schlechte-idee",
        "word": "keine schlechte Idee",
        "article": "",
        "translation": "bukan ide buruk",
        "exampleSentence": "Das ist keine schlechte Idee.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "kein-altes-buch",
        "word": "kein altes Buch",
        "article": "",
        "translation": "bukan buku lama",
        "exampleSentence": "Das ist kein altes Buch.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "eine-heiße-suppe",
        "word": "eine heiße Suppe",
        "article": "",
        "translation": "sup panas",
        "exampleSentence": "Ich trinke eine heiße Suppe.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Ein ___ Apfel. (rot, Nom maskulin)",
        "options": [
          "roter",
          "roten",
          "rotes",
          "rote"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich esse einen ___ Apfel. (rot, Akk maskulin)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das ist eine ___ Farbe. (grün, Nom feminin)",
        "options": [
          "grüne",
          "grünen",
          "grüner",
          "grünes"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Das ist ein ___ Haus. (weiß, Nom neutrum)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Ich sehe einen ___ Mann. (alt, Akk maskulin)",
        "options": [
          "alten",
          "alter",
          "altes",
          "alte"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Das ist kein ___ Film. (gut, Nom maskulin)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Das ist keine ___ Idee. (schlecht, Nom feminin)",
        "options": [
          "schlechte",
          "schlechten",
          "schlechter",
          "schlechtes"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich trinke eine ___ Suppe. (heiß, Akk feminin)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ein rot**er** Apfel. (Nom maskulin → -er)",
      "Eine grün**e** Farbe. (Nom feminin → -e)",
      "Ein weiẞ**es** Haus. (Nom neutrum → -es)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-23",
    "level": "A2",
    "title": "Präpositionen ohne + Akk / mit + Dat",
    "grammarDescription": "• ohne + Akkusativ = tanpa (tidak membawa)\n• mit + Dativ = dengan (membawa/menggunakan)\n• mit selalu Dativ: mit dem Mann, mit der Frau, mit dem Kind\n• ohne selalu Akk: ohne den Mann, ohne die Frau, ohne das Kind\n\nContoh:\n- Ich gehe ohne **den** Regenschirm. (Akk maskulin)\n- Ich fahre mit **dem** Zug. (Dat maskulin)\n- Er geht ohne **die** Frau. (Akk feminin)\n- Sie fährt mit **der** Bahn. (Dat feminin)\n- Wir essen ohne **das** Salz. (Akk neutrum)\n- Sie trinken mit **dem** Zucker. (Dat neutrum)",
    "vocabulary": [
      {
        "id": "ohne",
        "word": "ohne",
        "article": "",
        "translation": "tanpa",
        "exampleSentence": "Ich gehe ohne Regenschirm.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "mit",
        "word": "mit",
        "article": "",
        "translation": "dengan",
        "exampleSentence": "Ich fahre mit dem Zug.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-regenschirm",
        "word": "der Regenschirm",
        "article": "der",
        "translation": "payung",
        "exampleSentence": "Ich habe meinen Regenschirm vergessen.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-zug",
        "word": "der Zug",
        "article": "der",
        "translation": "kereta",
        "exampleSentence": "Der Zug kommt pünktlich.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-fahrrad",
        "word": "das Fahrrad",
        "article": "das",
        "translation": "sepeda",
        "exampleSentence": "Ich fahre mit dem Fahrrad.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-freunde",
        "word": "die Freunde",
        "article": "die",
        "translation": "teman-teman",
        "exampleSentence": "Ich gehe mit meinen Freunden.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-auto",
        "word": "das Auto",
        "article": "das",
        "translation": "mobil",
        "exampleSentence": "Er fährt ohne Auto.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-kinder",
        "word": "die Kinder",
        "article": "die",
        "translation": "anak-anak",
        "exampleSentence": "Sie geht mit den Kindern.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-hund",
        "word": "der Hund",
        "article": "der",
        "translation": "anjing",
        "exampleSentence": "Er spaziert mit dem Hund.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-musik",
        "word": "die Musik",
        "article": "die",
        "translation": "musik",
        "exampleSentence": "Ich höre ohne Musik.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Ich gehe ___ Regenschirm.",
        "options": [
          "ohne",
          "mit",
          "für",
          "von"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich fahre ___ dem Zug.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er geht ___ die Frau.",
        "options": [
          "ohne",
          "mit",
          "für",
          "von"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Sie fährt ___ der Bahn.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Wir essen ___ das Salz.",
        "options": [
          "ohne",
          "mit",
          "für",
          "von"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Sie trinken ___ dem Zucker.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Er fährt ___ Auto.",
        "options": [
          "ohne",
          "mit",
          "für",
          "von"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich gehe ___ meinen Freunden.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Ich gehe ohne **den** Regenschirm. (Akk maskulin)",
      "Ich fahre mit **dem** Zug. (Dat maskulin)",
      "Er geht ohne **die** Frau. (Akk feminin)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-24",
    "level": "A2",
    "title": "Konjunktiv II: sollte",
    "grammarDescription": "• sollen → sollte (Konjunktiv II dari sollen)\n• sollte = sebaiknya (saran/rekomendasi)\n• Posisi verb di posisi 2 dalam kalimat pernyataan\n• Dalam Nebensatz: ... , weil du es tun solltest.\n\nContoh:\n- Du **solltest** mehr lernen. (saran)\n- Er **sollte** zum Arzt gehen. (rekomendasi)\n- Wir **sollten** früh aufstehen. (saran)\n- Ihr **solltet** vorsichtig sein. (peringatan)\n- Sie **sollten** die Chance nutzen. (nasihat)",
    "vocabulary": [
      {
        "id": "sollte",
        "word": "sollte",
        "article": "",
        "translation": "sebaiknya",
        "exampleSentence": "Du solltest mehr lernen.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-arzt",
        "word": "der Arzt",
        "article": "der",
        "translation": "dokter",
        "exampleSentence": "Du solltest zum Arzt gehen.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-gesundheit",
        "word": "die Gesundheit",
        "article": "die",
        "translation": "kesehatan",
        "exampleSentence": "Du solltest auf deine Gesundheit achten.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-buch",
        "word": "das Buch",
        "article": "das",
        "translation": "buku",
        "exampleSentence": "Du solltest das Buch lesen.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-prüfung",
        "word": "die Prüfung",
        "article": "die",
        "translation": "ujian",
        "exampleSentence": "Du solltest für die Prüfung lernen.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-fehler",
        "word": "der Fehler",
        "article": "der",
        "translation": "kesalahan",
        "exampleSentence": "Du solltest den Fehler korrigieren.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-hilfe",
        "word": "die Hilfe",
        "article": "die",
        "translation": "bantuan",
        "exampleSentence": "Du solltest Hilfe suchen.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-chance",
        "word": "die Chance",
        "article": "die",
        "translation": "peluang",
        "exampleSentence": "Du solltest die Chance nutzen.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-zukunft",
        "word": "die Zukunft",
        "article": "die",
        "translation": "masa depan",
        "exampleSentence": "Du solltest an die Zukunft denken.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-ziel",
        "word": "das Ziel",
        "article": "das",
        "translation": "tujuan",
        "exampleSentence": "Du solltest dein Ziel erreichen.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "Du ___ mehr lernen. (sollen)",
        "options": [
          "solltest",
          "sollst",
          "soll",
          "sollten"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Er ___ zum Arzt gehen. (sollen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Wir ___ früh aufstehen. (sollen)",
        "options": [
          "sollten",
          "sollen",
          "sollst",
          "soll"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ihr ___ vorsichtig sein. (sollen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Sie ___ die Chance nutzen. (sollen)",
        "options": [
          "sollten",
          "sollen",
          "sollst",
          "soll"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Ich ___ mehr Sport treiben. (sollen)",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "Du ___ auf deine Gesundheit achten. (sollen)",
        "options": [
          "solltest",
          "sollst",
          "soll",
          "sollten"
        ],
        "correctAnswer": 0
      },
      {
        "question": "Wir ___ das Buch lesen. (sollen)",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Du **solltest** mehr lernen. (saran)",
      "Er **sollte** zum Arzt gehen. (rekomendasi)",
      "Wir **sollten** früh aufstehen. (saran)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  },
  {
    "id": "a2-25",
    "level": "A2",
    "title": "Nebensatz mit als und wenn",
    "grammarDescription": "• wenn = ketika (waktu sekarang/masa depan atau kondisi)\n• als = saat (waktu lampau — satu kali atau berulang)\n• wenn bisa untuk kondisi (jika), als hanya untuk waktu\n• Keduanya: verb di AKHIR dalam Nebensatz\n\nContoh:\n- Wenn es regnet, bleibe ich zu Hause. (waktu sekarang)\n- Wenn ich reich wäre, würde ich reisen. (kondisi)\n- Als ich klein war, spielte ich viel. (waktu lampau)\n- Als wir im Urlaub waren, war das Wetter schön. (waktu lampau)\n- Das erste Mal, als ich in Berlin war, war 2020. (waktu lampau)",
    "vocabulary": [
      {
        "id": "wenn",
        "word": "wenn",
        "article": "",
        "translation": "ketika/jika",
        "exampleSentence": "Wenn es regnet, bleibe ich zu Hause.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "als",
        "word": "als",
        "article": "",
        "translation": "saat (waktu lampau)",
        "exampleSentence": "Als ich klein war, spielte ich viel.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-mal",
        "word": "das Mal",
        "article": "das",
        "translation": "kali",
        "exampleSentence": "Das erste Mal war in Berlin.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-kindheit",
        "word": "die Kindheit",
        "article": "die",
        "translation": "masa kecil",
        "exampleSentence": "In meiner Kindheit spielte ich viel.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "der-urlaub",
        "word": "der Urlaub",
        "article": "der",
        "translation": "liburan",
        "exampleSentence": "Als wir im Urlaub waren, war das Wetter schön.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-schule",
        "word": "die Schule",
        "article": "die",
        "translation": "sekolah",
        "exampleSentence": "Als ich in der Schule war, hatte ich viele Freunde.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-wetter",
        "word": "das Wetter",
        "article": "das",
        "translation": "cuaca",
        "exampleSentence": "Wenn das Wetter gut ist, gehe ich spazieren.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-ferien",
        "word": "die Ferien",
        "article": "die",
        "translation": "liburan sekolah",
        "exampleSentence": "In den Ferien fahren wir ans Meer.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "das-studium",
        "word": "das Studium",
        "article": "das",
        "translation": "kuliah",
        "exampleSentence": "Als ich studierte, wohnte ich in Berlin.",
        "phonetic": "",
        "level": "A2"
      },
      {
        "id": "die-prüfung",
        "word": "die Prüfung",
        "article": "die",
        "translation": "ujian",
        "exampleSentence": "Wenn ich die Prüfung bestehe, feiere ich.",
        "phonetic": "",
        "level": "A2"
      }
    ],
    "exercises": [
      {
        "question": "___ es regnet, bleibe ich zu Hause.",
        "options": [
          "Wenn",
          "Als",
          "Weil",
          "Dass"
        ],
        "correctAnswer": 0
      },
      {
        "question": "___ ich klein war, spielte ich viel.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ wir im Urlaub waren, war das Wetter schön.",
        "options": [
          "Als",
          "Wenn",
          "Weil",
          "Dass"
        ],
        "correctAnswer": 0
      },
      {
        "question": "___ das Wetter gut ist, gehe ich spazieren.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ ich in der Schule war, hatte ich viele Freunde.",
        "options": [
          "Als",
          "Wenn",
          "Weil",
          "Dass"
        ],
        "correctAnswer": 0
      },
      {
        "question": "___ ich die Prüfung bestehe, feiere ich.",
        "options": [],
        "correctAnswer": 0
      },
      {
        "question": "___ ich studierte, wohnte ich in Berlin.",
        "options": [
          "Als",
          "Wenn",
          "Weil",
          "Dass"
        ],
        "correctAnswer": 0
      },
      {
        "question": "___ ich reich wäre, würde ich reisen.",
        "options": [],
        "correctAnswer": 0
      }
    ],
    "canDoGoals": [],
    "culturalNotes": "",
    "indonesianMistakes": "",
    "sentenceBreakdowns": [
      "Wenn es regnet, bleibe ich zu Hause. (waktu sekarang)",
      "Wenn ich reich wäre, würde ich reisen. (kondisi)",
      "Als ich klein war, spielte ich viel. (waktu lampau)"
    ],
    "pronunciationTips": [],
    "listeningSimulation": null
  }

];
export const allVocab: VocabWord[] = courseData.flatMap(lesson => lesson.vocabulary || []);
