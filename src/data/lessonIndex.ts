import type { Level } from './course';

export interface LessonIndex {
  id: string;
  level?: Level;
  title?: string;
  canDoGoals?: string[];
}

export const courseIndex: LessonIndex[] = [
  // ═══════════════════════════════════════════
  // A1 — 26 Lessons (sesuai Netzwerk Neu A1)
  // ═══════════════════════════════════════════
  {
    "id": "a1-1",
    "level": "A1",
    "title": "Perkenalan & Salam (Hallo, Guten Morgen, dst)",
    "canDoGoals": [
      "Memperkenalkan diri dalam bahasa Jerman (Sich vorstellen)",
      "Mengeja nama dengan Alfabet Jerman (Buchstabieren)",
      "Mengucapkan salam dan berpamitan yang sesuai waktu",
      "Menanyakan dan menjawab kabar dengan benar",
      "Membedakan kapan harus menggunakan formal (Sie) dan informal (du)"
    ]
  },
  {
    "id": "a1-2",
    "level": "A1",
    "title": "Artikel: Der, Die, Das",
    "canDoGoals": [
      "Mengidentifikasi gender kata benda (Maskulin, Feminin, Netral)",
      "Membedakan artikel pasti (Bestimmte Artikel: der, die, das)",
      "Membedakan artikel tidak pasti (Unbestimmte Artikel: ein, eine)",
      "Mencocokkan kata benda dengan kata ganti orang (er, sie, es)"
    ]
  },
  {
    "id": "a1-3",
    "level": "A1",
    "title": "Angka 1-100 & Umur",
    "canDoGoals": [
      "Membaca dan berhitung angka 1-100 (Zahlen)",
      "Menyatakan dan menanyakan umur dengan benar",
      "Menyebutkan nomor telepon",
      "Memeriksa dan menyebutkan harga barang dalam Euro"
    ]
  },
  {
    "id": "a1-checkpoint-1",
    "title": "Review Konten Sebelumnya",
    "canDoGoals": [
      "Mengevaluasi penguasaan salam dan perkenalan",
      "Menguji kemampuan membedakan artikel Der, Die, Das",
      "Menguji kelancaran menghitung angka 1-100 dan menyatakan umur"
    ]
  },
  {
    "id": "a1-4",
    "level": "A1",
    "title": "Warna, Hari, Bulan",
    "canDoGoals": [
      "Menyebutkan nama-nama hari (Montag, Dienstag...)",
      "Menyebutkan nama-nama bulan dalam bahasa Jerman",
      "Mendeskripsikan warna benda (Farben)",
      "Mampu merespons pertanyaan dengan 'Wann?' (Kapan?)"
    ]
  },
  {
    "id": "a1-5",
    "level": "A1",
    "title": "Kata Ganti Orang (ich, du, er, sie, wir...)",
    "canDoGoals": [
      "Membedakan Kata Ganti Orang (Personalpronomen) untuk subjek",
      "Mampu menyebutkan orang ketiga (menunjuk orang lain)",
      "Mengerti kapan menggunakan 'Ihr' vs 'Sie'"
    ]
  },
  {
    "id": "a1-6",
    "level": "A1",
    "title": "Konjugasi sein & haben",
    "canDoGoals": [
      "Melakukan konjugasi kata kerja 'sein' (adalah) di waktu sekarang",
      "Melakukan konjugasi kata kerja 'haben' (memiliki) di waktu sekarang",
      "Membentuk kalimat deskripsi sederhana diri dan kepemilikan"
    ]
  },
  {
    "id": "a1-checkpoint-2",
    "title": "Review Konten Sebelumnya",
    "canDoGoals": [
      "Mengevaluasi penguasaan kata ganti orang",
      "Menguji konjugasi kata kerja dasar (sein & haben)",
      "Mengevaluasi memori nama-nama hari, bulan, dan warna"
    ]
  },
  {
    "id": "a1-7",
    "level": "A1",
    "title": "Kalimat Sederhana (Subjek + Verb + Objek)",
    "canDoGoals": [
      "Menyusun kalimat pernyataan sederhana (Aussagesätze)",
      "Menyusun kalimat pertanyaan dengan kata tanya (W-Fragen)",
      "Memahami posisi verb di posisi kedua (V2-Stellung)"
    ]
  },
  {
    "id": "a1-8",
    "level": "A1",
    "title": "Preposisi Dasar (in, auf, an, unter)",
    "canDoGoals": [
      "Menggunakan preposisi tempat (Wo?) dengan kasus yang tepat",
      "Memahami perbedaan in, auf, an, unter, neben, zwischen",
      "Membentuk kalimat lokasi sederhana"
    ]
  },
  {
    "id": "a1-9",
    "level": "A1",
    "title": "Keluarga & Pekerjaan",
    "canDoGoals": [
      "Menyebutkan anggota keluarga (die Familie)",
      "Menyebutkan profesi/pekerjaan (der Beruf)",
      "Mendeskripsikan keluarga dan pekerjaan sendiri"
    ]
  },
  {
    "id": "a1-checkpoint-3",
    "title": "Review Konten Sebelumnya",
    "canDoGoals": [
      "Menguji kemampuan menyusun kalimat sederhana",
      "Menguji penguasaan preposisi dasar",
      "Menguji kosakata keluarga dan pekerjaan"
    ]
  },
  {
    "id": "a1-10",
    "level": "A1",
    "title": "Makanan, Minuman & Belanja",
    "canDoGoals": [
      "Menyebutkan nama makanan dan minuman (Essen und Trinken)",
      "Menyebutkan harga dan menawar (Der Preis)",
      "Membeli barang di toko (Einkaufen)"
    ]
  },
  {
    "id": "a1-11",
    "level": "A1",
    "title": "Waktu dan Jam (Die Uhrzeit)",
    "canDoGoals": [
      "Membaca dan menyebutkan jam (Die Uhrzeit)",
      "Menyatakan waktu dalam format 24 jam",
      "Menggunakan frasa waktu (am Morgen, am Nachmittag)"
    ]
  },
  {
    "id": "a1-12",
    "level": "A1",
    "title": "Hobi & Waktu Luang (Hobbys)",
    "canDoGoals": [
      "Menyebutkan hobi dan aktivitas favorit",
      "Menggunakan verba favorit (gern, lieber, am liebsten)",
      "Membicarakan kegiatan di waktu luang"
    ]
  },
  {
    "id": "a1-13",
    "level": "A1",
    "title": "Cuaca dan Musim (Das Wetter und die Jahreszeiten)",
    "canDoGoals": [
      "Mendeskripsikan kondisi cuaca saat ini (Das Wetter)",
      "Menyebutkan empat musim (Jahreszeiten)",
      "Mendiskusikan cuaca kesukaan beserta alasannya"
    ]
  },
  // ─── A1 L14-L21: Dipindahkan dari A2 (sesuai Netzwerk Neu timing) ───
  {
    "id": "a1-14",
    "level": "A1",
    "title": "Kasus Nominativ vs Akkusativ",
    "canDoGoals": [
      "Mengetahui perbedaan peran Subjek (Nominativ) dan Objek Langsung (Akkusativ)",
      "Mendeklinasikan artikel tertentu (den, die, das) di objek Akkusativ",
      "Menggunakan verba yang mewajibkan objek Akkusativ (haben, brauchen...)"
    ]
  },
  {
    "id": "a1-15",
    "level": "A1",
    "title": "Kasus Dativ",
    "canDoGoals": [
      "Memahami fungsi Objek Tidak Langsung (Dativ)",
      "Mendeklinasikan artikel tertentu (dem, der, dem) di posisi Dativ",
      "Mendeklinasikan artikel tidak tentu (einem, einer, einem) di posisi Dativ",
      "Mengenali verba yang selalu diiringi objek Dativ (helfen, danken...)"
    ]
  },
  {
    "id": "a1-16",
    "level": "A1",
    "title": "Modal Verben (können, müssen, wollen, dürfen)",
    "canDoGoals": [
      "Menggunakan Modal Verben untuk mengekspresikan kemampuan, kewajiban, dan izin",
      "Memahami struktur 'Satzklammer' — verba infinitif di akhir kalimat",
      "Konjugasi Modal Verben di semua subjek (ich, du, er/sie/es, wir, ihr, sie/Sie)"
    ]
  },
  {
    "id": "a1-17",
    "level": "A1",
    "title": "Waktu Lampau: Perfekt",
    "canDoGoals": [
      "Bercerita kejadian masa lalu (spoken past / Perfekt)",
      "Memilih antara Hilfsverben 'haben' dan 'sein' sebagai verba pendukung",
      "Membentuk Partizip II dari verba beraturan dan tidak beraturan"
    ]
  },
  {
    "id": "a1-18",
    "level": "A1",
    "title": "Trennbare Verben (aufmachen, anrufen, dst)",
    "canDoGoals": [
      "Mengenali prefix yang memisahkan verba (auf-, an-, ein-, aus-...)",
      "Memposisikan prefix di posisi paling akhir dalam kalimat utama",
      "Menceritakan aktivitas sehari-hari menggunakan trennbare verben"
    ]
  },
  {
    "id": "a1-19",
    "level": "A1",
    "title": "Verba Refleksif (Reflexivverben)",
    "canDoGoals": [
      "Mengetahui daftar verba tindakan terhadap diri sendiri",
      "Penggunaan Reflexivpronomen (mich, dich, sich) untuk Akkusativ atau Dativ",
      "Bercerita rutinitas membersihkan diri (sich waschen, sich duschen...)"
    ]
  },
  {
    "id": "a1-20",
    "level": "A1",
    "title": "Nebensätze (dass, weil, wenn)",
    "canDoGoals": [
      "Mengetahui dasar-dasar klausa anak (Nebensätze)",
      "Menceritakan alasan / sebab akibat menggunakan 'weil'",
      "Menceritakan waktu terjadinya suatu hal dengan 'wenn'",
      "Membangun pengandaian dengan 'dass'"
    ]
  },
  {
    "id": "a1-21",
    "level": "A1",
    "title": "Komparativ & Superlativ",
    "canDoGoals": [
      "Membandingkan sifat benda menggunakan Komparativ (... + -er als)",
      "Menggambarkan tingkatan tertinggi dengan Superlativ (am ... + -sten)",
      "Memahami bentuk irregular (gut → besser → am besten)"
    ]
  },
  // ─── A1 L22-L26: Topik BARU (belum ada di DeutschUp) ───
  {
    "id": "a1-22",
    "level": "A1",
    "title": "Imperativ (Perintah)",
    "canDoGoals": [
      "Membentuk imperativ untuk du, ihr, Sie",
      "Menggunakan imperativ dalam situasi sehari-hari",
      "Memahami perbedaan imperativ formal dan informal"
    ]
  },
  {
    "id": "a1-23",
    "level": "A1",
    "title": "Sollen & Dürfen (Kewajiban & Izin)",
    "canDoGoals": [
      "Membedakan sollen (seharusnya) dan dürfen (diizinkan)",
      "Menggunakan sollen dan dürften dalam konteks nyata",
      "Memahami nuansa kewajiban vs izin dalam budaya Jerman"
    ]
  },
  {
    "id": "a1-24",
    "level": "A1",
    "title": "Konjunktion denn (Alasan)",
    "canDoGoals": [
      "Membedakan 'denn' (karena) dan 'weil' (karena)",
      "Menggunakan 'denn' untuk memberikan alasan informal",
      "Memahami posisi verb dalam kalimat dengan 'denn' (V2)"
    ]
  },
  {
    "id": "a1-25",
    "level": "A1",
    "title": "Indirekte Fragesätze (Pertanyaan Tidak Langsung)",
    "canDoGoals": [
      "Membentuk pertanyaan tidak langsung dengan ob/oder",
      "Menggunakan W-Fragen dalam bentuk tidak langsung",
      "Memahami posisi verb di akhir klausa tidak langsung"
    ]
  },
  {
    "id": "a1-26",
    "level": "A1",
    "title": "Man + Partizip I (Kalimat Umum)",
    "canDoGoals": [
      "Menggunakan 'man' sebagai subjek umum (orang/bisa)",
      "Membentuk Partizip I dari verb (gehend, lesend, schreibend...)",
      "Mendeskripsikan aktivitas umum menggunakan man + Partizip I"
    ]
  },
  {
    "id": "a1-checkpoint-4",
    "title": "Review A1 Lengkap",
    "canDoGoals": [
      "Menguji semua topik grammar A1 dari L1-L26",
      "Simulasi Goethe A1 Hören + Lesen",
      "Simulasi Goethe A1 Schreiben + Sprechen"
    ]
  },
  // ═══════════════════════════════════════════
  // A2 — 18 Lessons (sesuai Netzwerk Neu A2)
  // ═══════════════════════════════════════════
  {
    "id": "a2-1",
    "level": "A2",
    "title": "Wechselpräpositionen (in/an/auf + Dat vs Akk)",
    "canDoGoals": [
      "Mengenali 9 Wechselpräpositionen (in, an, auf, über, unter, vor, hinter, neben, zwischen)",
      "Menggunakan kasus Dativ untuk lokasi statis (Wo?)",
      "Menggunakan kasus Akkusativ untuk perpindahan terarah (Wohin?)"
    ]
  },
  {
    "id": "a2-2",
    "level": "A2",
    "title": "Kalimat Tanya W-Fragen (Lanjutan)",
    "canDoGoals": [
      "Membentuk kalimat pertanyaan spesifik dengan kasus (Wer vs Wen vs Wem)",
      "Menggunakan W-Fragen untuk lokasi dan arah (Wo vs Wohin vs Woher)",
      "Membedakan W-Fragen A1 dan A2"
    ]
  },
  {
    "id": "a2-3",
    "level": "A2",
    "title": "Negasi: nicht vs kein",
    "canDoGoals": [
      "Cara memosisikan negasi 'nicht' secara benar dalam kalimat",
      "Cara menggunakan 'kein/keine' untuk membantah kata benda tanpa artikel",
      "Mengenali perbedaan penekanan kalimat menggunakan 'nicht'"
    ]
  },
  {
    "id": "a2-checkpoint-1",
    "title": "Review A2 Awal",
    "canDoGoals": [
      "Menguji Wechselpräpositionen (Dat vs Akk)",
      "Menguji W-Fragen lanjutan",
      "Menguji penggunaan nicht vs kein"
    ]
  },
  {
    "id": "a2-4",
    "level": "A2",
    "title": "Waktu Lampau: Präteritum (sein/haben/modals)",
    "canDoGoals": [
      "Bercerita kejadian lampau (written past / Präteritum) untuk sein & haben",
      "Menggunakan Präteritum untuk Modal Verben (konnte, musste...)",
      "Mengetahui perbedaan penggunaan Perfekt dan Präteritum"
    ]
  },
  {
    "id": "a2-5",
    "level": "A2",
    "title": "Verba dengan Preposisi Tetap & Pronominaladverbien",
    "canDoGoals": [
      "Menghafal preposisi yang terkunci untuk suatu verba",
      "Mampu merespons singkat menggunakan Pronominaladverbien (dafür, daran, womit...)",
      "Membicarakan minat/memori terhadap subjek tertentu yang relevan dengan preposisi"
    ]
  },
  {
    "id": "a2-6",
    "level": "A2",
    "title": "Passiv Präsens",
    "canDoGoals": [
      "Membentuk kalimat pasif dengan werden + Partizip II",
      "Membedakan aktif dan pasif dalam konteks nyata",
      "Menggunakan Agent (von + Dativ) dalam kalimat pasif"
    ]
  },
  {
    "id": "a2-7",
    "level": "A2",
    "title": "Konjunktiv II — würde + Infinitiv",
    "canDoGoals": [
      "Membentuk Konjunktiv II dengan würde + infinitif",
      "Mengungkapkan permintaan sopan dan kemungkinan",
      "Memahami perbedaan Konjunktiv II dan Indikativ"
    ]
  },
  {
    "id": "a2-checkpoint-2",
    "title": "Review A2 Tengah",
    "canDoGoals": [
      "Menguji Präteritum sein/haben/modals",
      "Menguji verba dengan preposisi tetap",
      "Menguji Passiv dan Konjunktiv II"
    ]
  },
  {
    "id": "a2-8",
    "level": "A2",
    "title": "Konjunktiv II — sollte, müsste, könnte",
    "canDoGoals": [
      "Menggunakan sollte (seharusnya), müsste (seharusnya bisa), könnte (mungkin bisa)",
      "Membedakan nuances antara Konjunktiv II different modal verbs",
      "Menggunakan Konjunktiv II untuk saran dan kritik"
    ]
  },
  {
    "id": "a2-9",
    "level": "A2",
    "title": "Relativsätze (Klausa Relatif)",
    "canDoGoals": [
      "Membentuk kalimat relatif dengan der/die/das/welcher",
      "Membedakan Relativpronomen untuk Nominativ dan Akkusativ",
      "Menggunakan Relativsätze untuk mendeskripsikan orang dan benda"
    ]
  },
  {
    "id": "a2-10",
    "level": "A2",
    "title": "Indefinitpronomen (jemand, niemand, etwas...)",
    "canDoGoals": [
      "Menggunakan indefinitpronomen (jemand, niemand, etwas, nichts, alles)",
      "Memahami deklinasi indefinitpronomen dalam Akkusativ dan Dativ",
      "Menggunakan Indefinitpronomen -Self (selber/sich) untuk penekanan"
    ]
  },
  {
    "id": "a2-11",
    "level": "A2",
    "title": "Interrogativartikel (welcher, was für ein)",
    "canDoGoals": [
      "Menggunakan welcher/welche/welches untuk menanyakan pilihan spesifik",
      "Menggunakan 'was für ein/eine/ein' untuk menanyakan jenis",
      "Memahami perbedaan was vs welcher dalam pertanyaan"
    ]
  },
  {
    "id": "a2-checkpoint-3",
    "title": "Review A2 Lanjut",
    "canDoGoals": [
      "Menguji Konjunktiv II (sollte/müsste/könnte)",
      "Menguji Relativsätze",
      "Menguji Indefinitpronomen dan Interrogativartikel"
    ]
  },
  {
    "id": "a2-12",
    "level": "A2",
    "title": "Wunschsätze (Ich wünsche mir...)",
    "canDoGoals": [
      "Membentuk kalimat keinginan dengan Konjunktiv II oder würde",
      "Menggunakan 'ich wünsche mir', 'ich hätte gern', 'ich würde gerne'",
      "Memahami perbedaan Wunschsätze dan Aussagesätze"
    ]
  },
  {
    "id": "a2-13",
    "level": "A2",
    "title": "Futur I (werden + Infinitiv)",
    "canDoGoals": [
      "Membentuk futur I dengan werden + infinitif",
      "Menggunakan futur I untuk rencana dan prediksi",
      "Memahami kapan present tense bisa menggantikan futur I"
    ]
  },
  {
    "id": "a2-14",
    "level": "A2",
    "title": "Temporale Präpositionen (seit, für, ab, bis...)",
    "canDoGoals": [
      "Membedakan temporale präposisi untuk durasi dan titik waktu",
      "Menggunakan seit (sejak), für (selama), ab (mulai), bis (sampai)",
      "Memahami kapan harus menggunakan Präsens vs Perfekt dengan temporale präposisi"
    ]
  },
  {
    "id": "a2-15",
    "level": "A2",
    "title": "Lokale Präpositionen (von, aus, zu, nach...)",
    "canDoGoals": [
      "Membedakan lokal präposisi untuk asal dan tujuan",
      "Menggunakan von (dari), aus (dari), zu (ke), nach (ke)",
      "Memahami kasus yang dibutuhkan setiap präposisi"
    ]
  },
  {
    "id": "a2-16",
    "level": "A2",
    "title": "Positionsverben (sitzen, liegen, stehen, gehen, fahren...)",
    "canDoGoals": [
      "Membedakan verba posisi (sitzen, liegen, stehen) dan verba gerak (gehen, fahren, fliegen)",
      "Menggunakan posisi verba dalam konteks lokasi dan perpindahan",
      "Memahami Wechselpräpositionen dengan positionsverben"
    ]
  },
  {
    "id": "a2-17",
    "level": "A2",
    "title": "Adjektivendungen (bestimmt/unbestimmt)",
    "canDoGoals": [
      "Menggunakan adjektivendungen setelah artikel pasti (-er, -e, -es)",
      "Menggunakan adjektivendungen setelah artikel tidak pasti (-er, -e, -es)",
      "Memahami adjektivendungen tanpa artikel (Nominativ, Akkusativ, Dativ)"
    ]
  },
  {
    "id": "a2-18",
    "level": "A2",
    "title": "Adjektive nach Komparativ & Superlativ",
    "canDoGoals": [
      "Menggunakan adjektiv dengan Komparativ (+ -er als)",
      "Menggunakan adjektiv dengan Superlativ (am + -sten)",
      "Memahami adjektiv irregular (gut, viel, gern, bald...)"
    ]
  },
  {
    "id": "a2-checkpoint-4",
    "title": "Review A2 Lengkap",
    "canDoGoals": [
      "Menguji semua topik grammar A2 dari L1-L18",
      "Simulasi Goethe A2 Hören + Lesen",
      "Simulasi Goethe A2 Schreiben + Sprechen"
    ]
  },
  // ═══════════════════════════════════════════
  // B1 — 14 Lessons (sesuai Netzwerk Neu B1 + Wortbildung)
  // ═══════════════════════════════════════════
  {
    "id": "b1-1",
    "level": "B1",
    "title": "Kasus Genitiv",
    "canDoGoals": [
      "Menerapkan kasus Genitiv untuk menyatakan kepemilikan formal",
      "Deklinasi artikel (des, der) dengan sufiks kata benda (-s, -es)",
      "Menggunakan preposisi yang memerlukan Genitiv (wegen, trotz, während...)"
    ]
  },
  {
    "id": "b1-2",
    "level": "B1",
    "title": "Plusquamperfekt (Waktu Lampau Lanjutan)",
    "canDoGoals": [
      "Membentuk Plusquamperfekt (had + Partizip II)",
      "Membedakan Perfekt dan Plusquamperfekt dalam konteks",
      "Menggunakan Plusquamperfekt untuk kejadian sebelum kejadian lampau lain"
    ]
  },
  {
    "id": "b1-3",
    "level": "B1",
    "title": "Passiv (Lanjutan) — Vorgangspassiv & Zustandspassiv",
    "canDoGoals": [
      "Membedakan Vorgangspassiv (werden) dan Zustandspassiv (sein)",
      "Menggunakan Passiv dengan berbagai temporal (Präteritum, Perfekt)",
      "Membentuk Passiv dengan Modal Verben"
    ]
  },
  {
    "id": "b1-checkpoint-1",
    "title": "Review B1 Awal",
    "canDoGoals": [
      "Menguji Genitiv dan deklinasi",
      "Menguji Plusquamperfekt",
      "Menguji Passiv (Vorgang & Zustand)"
    ]
  },
  {
    "id": "b1-4",
    "level": "B1",
    "title": "Konjunktiv II (Lanjutan) — Indirekte Rede",
    "canDoGoals": [
      "Menggunakan Konjunktiv II untuk indirekte Rede (quotative subjunctive)",
      "Membedakan Konjunktiv I dan II dalam indirekte Rede",
      "Mengubah kalimat langsung menjadi tidak langsung"
    ]
  },
  {
    "id": "b1-5",
    "level": "B1",
    "title": "Relativsätze (Lanjutan) — Kompleks",
    "canDoGoals": [
      "Menggunakan Relativsätze dengan Preposisi + Pronomen",
      "Menggunakan was untuk hal-hal umum dalam Relativsätze",
      "Menggabungkan beberapa Relativsätze dalam satu kalimat"
    ]
  },
  {
    "id": "b1-6",
    "level": "B1",
    "title": "Futur II (werden + Partizip II + haben/sein)",
    "canDoGoals": [
      "Membentuk Futur II untuk kejadian yang akan selesai di masa depan",
      "Membedakan Futur I dan Futur II dalam penggunaan",
      "Menggunakan Futur II untuk asumsi dan spekulasi"
    ]
  },
  {
    "id": "b1-checkpoint-2",
    "title": "Review B1 Tengah",
    "canDoGoals": [
      "Menguji Konjunktiv II lanjutan",
      "Menguji Relativsätze kompleks",
      "Menguji Futur II"
    ]
  },
  // ─── B1 L7-L10: Wortbildung (Pembentukan Kata) ───
  {
    "id": "b1-7",
    "level": "B1",
    "title": "Wortbildung: Nomen mit -ung",
    "canDoGoals": [
      "Membentuk kata benda dari verba dengan sufiks -ung (die Wohnung, die Bildung)",
      "Memahami deklinasi kata benda -ung (die, -en)",
      "Menggunakan kata benda -ung dalam konteks kalimat"
    ]
  },
  {
    "id": "b1-8",
    "level": "B1",
    "title": "Wortbildung: Nomen mit -heit, -keit, -schaft",
    "canDoGoals": [
      "Membentuk kata benda abstrak dengan -heit (die Gesundheit), -keit (die Möglichkeit), -schaft (die Freundschaft)",
      "Memahami gender dan deklinasi untuk setiap sufiks",
      "Membedakan penggunaan -heit, -keit, -schaft dalam konteks"
    ]
  },
  {
    "id": "b1-9",
    "level": "B1",
    "title": "Wortbildung: Adjektive mit -ig, -lich, -isch",
    "canDoGoals": [
      "Membentuk adjektiv dari kata dasar dengan sufiks -ig (wichtig), -lich (wöchentlich), -isch (fertisch)",
      "Memahami nuansa perbedaan antara -ig, -lich, -isch",
      "Menggunakan adjektiv hasil word formation dalam kalimat"
    ]
  },
  {
    "id": "b1-10",
    "level": "B1",
    "title": "Wortbildung: Verben mit Vorsilben (be-, ver-, zer-, ent-, er-)",
    "canDoGoals": [
      "Memahami fungsi prefiks verba: be- (transitif), ver- (perubahan), zer- (perusakan), ent- (penghapusan), er- (pencapaian)",
      "Membedakan verba dengan dan tanpa prefiks (kaufen → bekaufen, verkaufen, zerstören...)",
      "Menggunakan verba berprefiks dalam konteks kalimat"
    ]
  },
  {
    "id": "b1-checkpoint-3",
    "title": "Review B1 Wortbildung",
    "canDoGoals": [
      "Menguji pembentukan Nomen mit -ung, -heit, -keit, -schaft",
      "Menguji Adjektive mit -ig, -lich, -isch",
      "Menguji Verben mit Vorsilben"
    ]
  },
  {
    "id": "b1-11",
    "level": "B1",
    "title": "Wortbildung: Adjektive mit -bar, -los, -sam",
    "canDoGoals": [
      "Membentuk adjektiv dengan -bar (möglich → möglich), -los (Hoffnung → hoffnungslos), -sam (Arbeit → arbeitsam)",
      "Memahami makna setiap sufiks (-bar: bisa dilakukan, -los: tanpa, -sam: cenderung)",
      "Menggunakan adjektiv -bar/-los/-sam dalam konteks"
    ]
  },
  {
    "id": "b1-12",
    "level": "B1",
    "title": "Adverbien (Kata Keterangan)",
    "canDoGoals": [
      "Membedakan Adverbien Temporal, Lokal, Modal, dan Kausal",
      "Menggunakan Adverbien untuk menghubungkan ide dalam teks",
      "Memahami posisi Adverbien dalam kalimat"
    ]
  },
  {
    "id": "b1-13",
    "level": "B1",
    "title": "Her-/hin- Verben (herauf, hinunter...)",
    "canDoGoals": [
      "Memahami perbedaan her- (ke arah pembicara) dan hin- (menjauh dari pembicara)",
      "Menggunakan her-/hin- dalam konteks lokasi dan arah",
      "Membentuk kata kerja her-/hin- (herkommen, hingehen, heraufsteigen...)"
    ]
  },
  {
    "id": "b1-14",
    "level": "B1",
    "title": "Konnektoren & Indirekte Rede (obwohl, trotzdem, deshalb, indem)",
    "canDoGoals": [
      "Menggunakan Konnektoren adversativ (obwohl, trotzdem, trotz)",
      "Menggunakan Konnektoren kausal (deshalb, deswegen, daher)",
      "Menggunakan Konnektoren modal (indem, dadurch)",
      "Memahami posisi verb setiap jenis Konnektor"
    ]
  },
  {
    "id": "b1-checkpoint-4",
    "title": "Review B1 Lengkap",
    "canDoGoals": [
      "Menguji semua topik grammar B1 dari L1-L14",
      "Simulasi Goethe B1 Hören + Lesen",
      "Simulasi Goethe B1 Schreiben + Sprechen"
    ]
  },
  // ═══════════════════════════════════════════
  // B2 — 12 Lessons (sesuai Netzwerk Neu B2 — unchanged)
  // ═══════════════════════════════════════════
  {
    "id": "b2-1",
    "level": "B2",
    "title": "Konjunktiv I (Indirekte Rede)",
    "canDoGoals": [
      "Menggunakan Konjunktiv I untuk melaporkan ucapan orang lain",
      "Membedakan Konjunktiv I dan II dalam konteks berbeda",
      "Mengubah kalimat langsung menjadi indirekte Rede dengan benar"
    ]
  },
  {
    "id": "b2-2",
    "level": "B2",
    "title": "Passiv — Vorgangspassiv & Zustandspassiv (Kompleks)",
    "canDoGoals": [
      "Membedakan Vorgangspassiv (werden) dan Zustandspassiv (sein)",
      "Menggunakan Passiv dengan berbagai temporal (Präteritum, Perfekt, Plusquamperfekt)",
      "Membentuk Passiv dengan Modal Verben"
    ]
  },
  {
    "id": "b2-3",
    "level": "B2",
    "title": "Nebensätze — Relativsätze, Konzessivsätze, Finalsätze",
    "canDoGoals": [
      "Menggunakan Relativsätze dengan Preposisi + Pronomen",
      "Menggunakan Konzessivsätze (obwohl, obgleich, obzwar)",
      "Menggunakan Finalsätze (damit, um...zu)"
    ]
  },
  {
    "id": "b2-checkpoint-1",
    "title": "Review B2 Awal",
    "canDoGoals": [
      "Menguji Konjunktiv I dan indirekte Rede",
      "Menguji Passiv kompleks",
      "Menguji Nebensätze (Relativ, Konzessiv, Final)"
    ]
  },
  {
    "id": "b2-4",
    "level": "B2",
    "title": "Partizipialkonstruktion (Partizip I & II sebagai Adjektiv)",
    "canDoGoals": [
      "Menggunakan Partizip I dan II sebagai modifier kata benda",
      "Membedakan Partizip I (aktif) dan Partizip II (pasif)",
      "Menggantikan Nebensätze dengan Partizipialkonstruktion"
    ]
  },
  {
    "id": "b2-5",
    "level": "B2",
    "title": "Erweitertes Partizip (erweitertes Partizipialattribut)",
    "canDoGoals": [
      "Menggunakan Partizip II dengan preposisi dan objek",
      "Menggabungkan beberapa Partizip dalam satu konstruksi",
      "Memahami kapan harus menghindari Partizipialkonstruktion"
    ]
  },
  {
    "id": "b2-6",
    "level": "B2",
    "title": "Wortbildung — Komposita (Zusammengesetzte Wörter)",
    "canDoGoals": [
      "Membentuk kata majemuk dari dua kata benda",
      "Menentukan gender kata majemuk (ikut kata terakhir)",
      "Membaca dan memahami kata majemuk panjang"
    ]
  },
  {
    "id": "b2-checkpoint-2",
    "title": "Review B2 Tengah",
    "canDoGoals": [
      "Menguji Partizipialkonstruktion",
      "Menguji Erweitertes Partizip",
      "Menguji Komposita"
    ]
  },
  {
    "id": "b2-7",
    "level": "B2",
    "title": "Nebensätze — Kausalsätze, Konsekutivsätze, Temporalsätze",
    "canDoGoals": [
      "Menggunakan Kausalsätze (weil, da, denn)",
      "Menggunakan Konsekutivsätze (sodass, so...dass)",
      "Menggunakan Temporalsätze (als, wenn, während, seitdem, nachdem, bevor, bis)"
    ]
  },
  {
    "id": "b2-8",
    "level": "B2",
    "title": "Modale Partikeln (doch, mal, halt, eben, ja, schon, denn, nur)",
    "canDoGoals": [
      "Memahami fungsi modale Partikeln untuk nuansa dan penekanan",
      "Membedakan Partikeln dalam pertanyaan dan pernyataan",
      "Menggunakan Partikeln secara natural dalam percakapan"
    ]
  },
  {
    "id": "b2-9",
    "level": "B2",
    "title": "Konjunktionen — aber, sondern, sondern auch, außerdem, überdies",
    "canDoGoals": [
      "Membedakan aber, sondern, sondern auch dalam kalimat",
      "Menggunakan additive Konjunktionen (außerdem, überdies, zudem)",
      "Menghubungkan ide-ide kompleks dengan Konjunktionen"
    ]
  },
  {
    "id": "b2-checkpoint-3",
    "title": "Review B2 Lanjut",
    "canDoGoals": [
      "Menguji Nebensätze kompleks",
      "Menguji Modale Partikeln",
      "Menguji Konjunktionen lanjutan"
    ]
  },
  {
    "id": "b2-10",
    "level": "B2",
    "title": "Subjunktiv (Konjunktiv III) & Irrealis",
    "canDoGoals": [
      "Menggunakan Konjunktiv II untuk kondisi irrealis (Wenn ich reich wäre...)",
      "Membedakan realis dan irrealis dalam kalimat",
      "Membentuk kalimat hyphotetical dengan Konjunktiv II"
    ]
  },
  {
    "id": "b2-11",
    "level": "B2",
    "title": "Nominalisierung (Verben → Nomen)",
    "canDoGoals": [
      "Mengubah verba menjadi kata benda (die Entwicklung, die Entscheidung)",
      "Menggunakan Nominalisierung dalam bahasa tulis formal",
      "Memahami deklinasi kata benda hasil Nominalisierung"
    ]
  },
  {
    "id": "b2-12",
    "level": "B2",
    "title": "Verbmuster — Reflexiv, Reziprok, Passiv, unpersönlich",
    "canDoGoals": [
      "Menggunakan Verben Reflexiv (sich) dalam konteks kompleks",
      "Menggunakan Verben Reziprok (sich) untuk aksi timbal balik",
      "Menggunakan Passiv unpersönlich (es wird getanzt)",
      "Memahami Verben unpersönlich (es gibt, es scheint, es geht)"
    ]
  },
  {
    "id": "b2-checkpoint-4",
    "title": "Review B2 Lengkap",
    "canDoGoals": [
      "Menguji semua topik grammar B2 dari L1-L12",
      "Simulasi Goethe B2 Hören + Lesen",
      "Simulasi Goethe B2 Schreiben + Sprechen"
    ]
  }
];
