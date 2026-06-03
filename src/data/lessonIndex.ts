import type { Level } from './course';

export interface LessonIndex {
  id: string;
  level?: Level;
  title?: string;
  canDoGoals?: string[];
}

export const courseIndex: LessonIndex[] = [
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
      "Membedakan Kata Ganti Orang (Personalpronomen) untuk subjek (ich, du, er, sie, es, wir, ihr, sie, Sie)",
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
      "Menyusun kalimat interogatif sederhana (Ja/Nein-Fragen)",
      "Menempatkan struktur kata kerja pada posisi kedua (Position 2)"
    ]
  },
  {
    "id": "a1-8",
    "level": "A1",
    "title": "Preposisi Dasar (in, auf, an, unter)",
    "canDoGoals": [
      "Memahami konsep preposisi tempat dasar (in, auf, an, unter)",
      "Bisa menjelaskan posisi suatu benda yang diam",
      "Menyusun kalimat lokasi menggunakan preposisi dan Dativ/Akkusativ (dasar)"
    ]
  },
  {
    "id": "a1-9",
    "level": "A1",
    "title": "Keluarga & Pekerjaan",
    "canDoGoals": [
      "Menyebutkan anggota keluarga terdekat (Vater, Mutter, Geschwister)",
      "Menceritakan siapa anggota keluarga dan apa profesinya (Berufe)",
      "Menggunakan dasar Possessivartikel (mein, dein)"
    ]
  },
  {
    "id": "a1-checkpoint-3",
    "title": "Review Konten Sebelumnya",
    "canDoGoals": [
      "Mengevaluasi kemampuan menyusun kalimat dengan struktur yang benar",
      "Menguji pemahaman preposisi dasar dan kata penunjuk posisi",
      "Mengevaluasi kosakata anggota keluarga dan nama pekerjaan"
    ]
  },
  {
    "id": "a1-10",
    "level": "A1",
    "title": "Makanan, Minuman & Belanja",
    "canDoGoals": [
      "Menyebutkan jenis-jenis makanan dan minuman (Essen und Trinken)",
      "Memesan makanan dan minuman di kafe atau restoran",
      "Memahami percakapan sederhana saat berbelanja di supermarket",
      "Menanyakan makanan spesifik dan menyatakan kelaparan / kehausan"
    ]
  },
  {
    "id": "a1-11",
    "level": "A1",
    "title": "Waktu dan Jam (Die Uhrzeit)",
    "canDoGoals": [
      "Mampu menyebutkan jam/pukul (Die Uhrzeit) secara formal maupun informal",
      "Mampu membuat atau mengusulkan sebuah janji temu (Termin machen)",
      "Mampu menyampaikan kapan mereka sibuk atau punya waktu luang"
    ]
  },
  {
    "id": "a1-12",
    "level": "A1",
    "title": "Hobi & Waktu Luang (Hobbys)",
    "canDoGoals": [
      "Menceritakan aktivitas masa luang dan hobi (Freizeit und Hobbys)",
      "Menggunakan kata 'gern' untuk menyatakan suatu kegiatan yang disenangi",
      "Bertanya mengenai hobi lawan bicara"
    ]
  },
  {
    "id": "a1-13",
    "level": "A1",
    "title": "Cuaca dan Musim (Das Wetter und die Jahreszeiten)",
    "canDoGoals": [
      "Mendeskripsikan kondisi cuaca saat ini (Das Wetter)",
      "Menyebutkan empat musim yang ada di belahan dunia Eropa (Jahreszeiten)",
      "Mendiskusikan cuaca kesukaan beserta alasannya secara sederhana"
    ]
  },
  {
    "id": "a2-1",
    "level": "A2",
    "title": "Kasus Nominativ vs Akkusativ",
    "canDoGoals": [
      "Mengetahui perbedaan peran Subjek (Nominativ) dan Objek Langsung (Akkusativ)",
      "Mendeklinasikan artikel tertentu (den, die, das) di objek Akkusativ",
      "Menggunakan verba yang mewajibkan objek Akkusativ (haben, brauchen...)"
    ]
  },
  {
    "id": "a2-2",
    "level": "A2",
    "title": "Kasus Dativ",
    "canDoGoals": [
      "Memahami fungsi Objek Tidak Langsung (Dativ)",
      "Mendeklinasikan artikel tertentu (dem, der, dem) di posisi Dativ",
      "Mendeklinasikan artikel tidak tentu (einem, einer, einem) di posisi Dativ",
      "Mengenali kumpulan verba yang selalu diiringi objek Dativ (helfen, danken...)"
    ]
  },
  {
    "id": "a2-3",
    "level": "A2",
    "title": "Modal Verben (können, müssen, wollen, dürfen)",
    "canDoGoals": [
      "Menggunakan Modal Verben (können, müssen, wollen, dürfen) untuk mengekspresikan kemampuan, kewajiban, dan izin",
      "Memahami struktur 'Satzklammer', memposisikan verba infinitif di akhir kalimat",
      "Konjugasi Modal Verben di semua subjek (ich, du, er/sie/es, wir, ihr, sie/Sie)"
    ]
  },
  {
    "id": "a2-4",
    "level": "A2",
    "title": "Waktu Lampau: Perfekt",
    "canDoGoals": [
      "Bercerita kejadian masa lalu (spoken past/Perfekt)",
      "Memilih antara Hilfsverben 'haben' dan 'sein' sebagai verba pendukung",
      "Membentuk Partizip II dari verba beraturan dan tidak beraturan"
    ]
  },
  {
    "id": "a2-5",
    "level": "A2",
    "title": "Waktu Lampau: Präteritum (sein/haben/modals)",
    "canDoGoals": [
      "Bercerita kejadian lampau (written past/Präteritum) untuk sein & haben",
      "Menggunakan Präteritum untuk Modal Verben (konnte, musste...)",
      "Mengetahui perbedaan penggunaan Perfekt dan Präteritum"
    ]
  },
  {
    "id": "a2-6",
    "level": "A2",
    "title": "Wechselpräpositionen (in/an/auf + Dat vs Akk)",
    "canDoGoals": [
      "Mengenali 9 Wechselpräpositionen (in, an, auf, über, unter, vor, hinter, neben, zwischen)",
      "Menggunakan kasus Dativ untuk menunjukkan lokasi statis (Wo?)",
      "Menggunakan kasus Akkusativ untuk menunjukkan perpindahan terarah (Wohin?)"
    ]
  },
  {
    "id": "a2-7",
    "level": "A2",
    "title": "Komparativ & Superlativ",
    "canDoGoals": [
      "Membandingkan sifat benda menggunakan Komparativ (... + -er als)",
      "Menggambarkan tingkatan tertinggi dengan Superlativ (am ... + -sten)",
      "Memahami bentuk irregular dari Adjektiv (gut, viel, gern)"
    ]
  },
  {
    "id": "a2-8",
    "level": "A2",
    "title": "Trennbare Verben (aufmachen, anrufen, dst)",
    "canDoGoals": [
      "Mengenali prefix yang memisahkan verba (auf-, an-, ein-, aus-, dst) yaitu Trennbare Verben",
      "Memposisikan prefix di posisi paling akhir dalam sebuah kalimat utama",
      "Menceritakan aktivitas sehari-hari menggunakan trennbare verben (aufstehen, anziehen...)"
    ]
  },
  {
    "id": "a2-9",
    "level": "A2",
    "title": "Kalimat Tanya W-Fragen",
    "canDoGoals": [
      "Melanjutkan kemampuan menggunakan W-Fragen yang lebih spesifik",
      "Membentuk kalimat pertanyaan yang relevan dengan kasus (Wer vs Wen vs Wem)",
      "Menggunakan W-Fragen untuk lokasi dan arah (Wo vs Wohin vs Woher)"
    ]
  },
  {
    "id": "a2-10",
    "level": "A2",
    "title": "Negasi: nicht vs kein",
    "canDoGoals": [
      "Cara memosisikan negasi 'nicht' secara benar dalam kalimat",
      "Cara menggunakan negasi 'kein/keine' khusus untuk membantah/meniadakan kata benda yang tak memiliki instrumen tertentu",
      "Mengenali perbedaan penekanan kalimat menggunakan 'nicht'"
    ]
  },
  {
    "id": "a2-11",
    "level": "A2",
    "title": "Verba Refleksif (Reflexivverben)",
    "canDoGoals": [
      "Mengetahui daftar verba tindakan terhadap diri sendiri (Reflexivverben)",
      "Penggunaan Reflexivpronomen (mich, dich, sich) untuk Accusative atau Dativ",
      "Bercerita rutinitas membersihkan diri (sich waschen, sich duschen, sich bedanken)"
    ]
  },
  {
    "id": "a2-12",
    "level": "A2",
    "title": "Verba dengan Preposisi Tetap & Pronominaladverbien",
    "canDoGoals": [
      "Menghafal preposisi yang terkunci untuk suatu verba (Verben mit festen Präpositionen)",
      "Mampu merespons singkat menggunakan Pronominaladverbien (dafür, daran, womit, worauf)",
      "Membicarakan sebuah minat/memori terhadap suatu subjek tertentu yang relevan dengan preposition"
    ]
  },
  {
    "id": "a2-13",
    "level": "A2",
    "title": "Nebensätze (dass, weil, wenn)",
    "canDoGoals": [
      "Mengetahui dasar-dasar klausa anak (Nebensätze)",
      "Menceritakan alasan / sebab akibat menggunakan konjungsi 'weil'",
      "Menceritakan waktu terjadinya suatu hal dengan konjungsi 'wenn'",
      "Membangun pengandaian dengan 'dass'"
    ]
  },
  {
    "id": "b1-1",
    "level": "B1",
    "title": "Kasus Genitiv",
    "canDoGoals": [
      "Menerapkan kasus Genitiv untuk menyatakan kepemilikan formal",
      "Deklinasi artikel (des, der) lengkap dengan sufiks kata benda maskulin dan netral (-s, -es)",
      "Menggunakan preposisi yang memerlukan Genitiv (wegen, trotz, während, innerhalb)"
    ]
  },
  {
    "id": "b1-2",
    "level": "B1",
    "title": "Relativsätze (Kalimat Relatif)",
    "canDoGoals": [
      "Mengidentifikasi dan membangun anak kalimat relatif (Relativsätze)",
      "Penggunaan kata ganti relatif sesuai dengan kasusnya (der, die, das, den, dem...)",
      "Membedakan kasus di dalam anak kalimat agar kata ganti relatif tidak keliru"
    ]
  },
  {
    "id": "b1-3",
    "level": "B1",
    "title": "Konjunktiv II (würde, könnte, müsste)",
    "canDoGoals": [
      "Menggambarkan pengandaian atau kondisi khayal yang tak realistis saat ini (Konjunktiv II)",
      "Membentuk Konjunktiv II dengan (würde + Infinitiv) khusus untuk sebagian besar verba",
      "Mampu meminta tolong dengan intensi kesopanan paling tinggi secara tertulis dan lisan (könnte/dürfte ich...)"
    ]
  },
  {
    "id": "b1-checkpoint-1",
    "title": "Review Konten Sebelumnya",
    "canDoGoals": [
      "Mengevaluasi penguasaan aturan kasus Genitiv (Kepemilikan Lanjut)",
      "Mengevaluasi penggunaan kata ganti Relatif dalam menyambung anak kalimat",
      "Mengevaluasi kesopanan level tinggi (Konjunktiv II)"
    ]
  },
  {
    "id": "b1-4",
    "level": "B1",
    "title": "Passiv Präsens & Präteritum",
    "canDoGoals": [
      "Memfokuskan subjek pada sebuah tindakan daripada pelakunya dengan konstruksi Passiv",
      "Latihan men-transformasikan kalimat aktif menjadi kalimat Passiv",
      "Membangun konjugasi kalimat pasif baik di tensa Präsens (werden + Partizip II) maupun Präteritum (wurden...)"
    ]
  },
  {
    "id": "b1-5",
    "level": "B1",
    "title": "Zweiteilige Konjunktionen",
    "canDoGoals": [
      "Mengerti penggunaan Konjungsi ganda (Zweiteilige Konjunktionen)",
      "Mengekspresikan pilihan alternatif (entweder... oder), atau tambahan yang menguatkan (nicht nur... sondern auch)",
      "Mengekspresikan perlawan argumen / pengecualian ganda (zwar... aber, weder... noch)"
    ]
  },
  {
    "id": "b1-6",
    "level": "B1",
    "title": "Indirekte Rede",
    "canDoGoals": [
      "Membedakan tutur langsung dan tidak langsung (Indirekte Rede level dasar)",
      "Menyalin ucapan sumber langsung tanpa tanda kutip dengan kata ganti dan preposisi waktu yang sesuai",
      "Mengalihkan persepsi (Er sagte, dass...)"
    ]
  },
  {
    "id": "b1-checkpoint-2",
    "title": "Review Konten Sebelumnya",
    "canDoGoals": [
      "Berlatih mengubah pola aktif, pasif dan pasif bertensa lampau",
      "Mengevaluasi kefasihan menyambung argumen dengan konjungsi ganda",
      "Mengevaluasi pelaporan dari kutipan sumber"
    ]
  },
  {
    "id": "b1-7",
    "level": "B1",
    "title": "Infinitivkonstruktionen (zu + Infinitiv)",
    "canDoGoals": [
      "Penguasaan Infinitivkonstruktionen (zu + Infinitiv)",
      "Membangun struktur (um... zu, ohne... zu, anstatt... zu)",
      "Mengekspresikan tujuan dari suatu pekerjaan tanpa modal verb"
    ]
  },
  {
    "id": "b1-8",
    "level": "B1",
    "title": "Adjektivdeklination lengkap",
    "canDoGoals": [
      "Membungkus dan mendeklinasikan kata sifat/adjektiva dari awal di struktur apa pun",
      "Latihan menggunakan schwache Deklination (setelah artikel definitif)",
      "Latihan menggunakan gemischte dan starke Deklination untuk benda (tidak memiliki artikel spesifik)"
    ]
  },
  {
    "id": "b1-9",
    "level": "B1",
    "title": "Futur I & Futur II",
    "canDoGoals": [
      "Menjelaskan prediksi atau intensi di masa depan dengan (Futur I: werden + Infinitiv)",
      "Memprediksi bahwa sesuatu AKAN SUDAH SELESAI di masa depan (Futur II: werden + Partizip II + haben/sein)",
      "Menyadari frekuensi dan tingkat natural penutur bahasa Jerman dengan bentuk kalimat ini"
    ]
  },
  {
    "id": "b1-checkpoint-3",
    "title": "Review Konten Sebelumnya",
    "canDoGoals": [
      "Evaluasi final untuk Infinitive dengan 'Zu'",
      "Evaluasi final kompleksitas adjektiva bersufiks",
      "Latihan membuat intensi tertulis dengan metode prediktif"
    ]
  },
  {
    "id": "b1-10",
    "level": "B1",
    "title": "Wortbildung (Komposita, Präfixe)",
    "canDoGoals": [
      "Membangun ketahanan kata melalui menebak arti kata baru secara konseptual (Wortbildung)",
      "Merakit atau mengungkap arti dari Komposita (gabungan Noun+Noun)",
      "Identifikasi makna dari Präfixe dan Suffixe khusus"
    ]
  },
  {
    "id": "b1-11",
    "level": "B1",
    "title": "Plusquamperfekt (Waktu Lampau Selesai)",
    "canDoGoals": [
      "Menerangkan sesuatu di masa lalu (Plusquamperfekt = Past Perfect Tense)",
      "Menggunakan 'hatten' atau 'waren' sebelum peristiwa masa lampau lainnya (mengiringi 'nachdem')",
      "Penggunaan kronologis lampau lebih runtut"
    ]
  },
  {
    "id": "b1-12",
    "level": "B1",
    "title": "n-Deklination",
    "canDoGoals": [
      "Penguasaan N-Deklination (Melihat maskulina yang selalu menerima sufiks 'n/en')",
      "Membedakan jamak reguler versus struktur n-Deklination pada Akkusativ, Dativ, dan Genitiv",
      "Dapat mengenali kata benda internasional berakhiran '-ent, -ist' dan penggunaanya"
    ]
  },
  {
    "id": "b2-1",
    "level": "B2",
    "title": "Partizipalkonstruktionen",
    "canDoGoals": [
      "Mampu mengubah klausa relatif panjang menjadi atribut padat bergaya akademik",
      "Menulis dan menggunakan Partizip I untuk menandakan hal yang sedang terjadi aktif sebagai adjektif",
      "Menulis dan menggunakan Partizip II untuk menunjukkan pasif/rampung sebagai adjektif"
    ]
  },
  {
    "id": "b2-2",
    "level": "B2",
    "title": "Erweiterte Relativsätze",
    "canDoGoals": [
      "Memahami konstruksi kalimat nominal / kalimat partizipial di posisi terentang / pre-nominal",
      "Menjabarkan struktur Partisipial (Erweiterte Relativsätze) dari kiri ke kanan sebelum masuk ranah membaca artikel resmi",
      "Menguraikan susunan sintaksis formal"
    ]
  },
  {
    "id": "b2-3",
    "level": "B2",
    "title": "Modalpartikeln (doch, mal, ja, eben)",
    "canDoGoals": [
      "Menghidupkan argumen oral/lisan dengan Modalpartikeln",
      "Dapat merepresentasikan rasa marah / meremehkan / keyakinan diri dengan kata seperti 'halt', 'eben', 'doch', atau 'mal'",
      "Meningkatkan aksen natural lisan bagaikan native speaker"
    ]
  },
  {
    "id": "b2-checkpoint-1",
    "title": "Review Konten Sebelumnya",
    "canDoGoals": [
      "Tes mengkonversikan klausa relasional pasif/aktif ke format tertulis panjang akademik Partizip",
      "Tes penggunaan partikel nada bicara di konteks diskusi dan berdebat"
    ]
  },
  {
    "id": "b2-4",
    "level": "B2",
    "title": "Wissenschaftlicher Schreibstil",
    "canDoGoals": [
      "Menguasai karakteristik Wissenschaftlicher Schreibstil (gaya tulisan ilmiah dan objektif)",
      "Mengecoh perspektif pelaku dan menggantinya dengan gaya passiversatz / impersonal (man, es, sich lassen)",
      "Langkah pertama persiapan menulis argumen saintifik/logis di ujian B2 atau tes DaF"
    ]
  },
  {
    "id": "b2-5",
    "level": "B2",
    "title": "Konjunktiv I (Indirekte Rede formal)",
    "canDoGoals": [
      "Konjugasi lanjutan Konjunktiv I, sering dibaca di struktur koran dan surat kabar aktual",
      "Cara melaporkan berita dengan netral/apriori menjaga klaim kutipan secara objektif",
      "Ubah reportase dengan benar jika Konjunktiv I serupa dengan Präsens dengan lari ke Konjunktiv II"
    ]
  },
  {
    "id": "b2-6",
    "level": "B2",
    "title": "Komplexe Satzstrukturen",
    "canDoGoals": [
      "Mengurai labirin anak kalimat dalam jerman, alias 'Schachtelsätze' (Struktur Kalimat Boks)",
      "Menavigasi artikel yang menggabungkan banyak Nebensätze dengan konjungsi berlapis-lapis",
      "Meningkatkan reading comprehension pada struktur bahasa Jerman kelas literasi korporat"
    ]
  },
  {
    "id": "b2-checkpoint-2",
    "title": "Review Konten Sebelumnya",
    "canDoGoals": [
      "Replik jurnalistik untuk konjunktiv I / reportase murni tak bias",
      "Latihan menelaah artikel bacaan / komprehensi kalimat tak menentu (Schachtelsätze)"
    ]
  },
  {
    "id": "b2-7",
    "level": "B2",
    "title": "Idiome & Redewendungen",
    "canDoGoals": [
      "Pengenalan dan latihan Idiome dan Redewendungen populer dalam kehidupan kantor atau kultural Eropa di Jerman",
      "Ubah pengucapan harfiah menjadi kiasan bermakna setara native speaker",
      "Terhindar dari kebingungan terjemahan harfiah"
    ]
  },
  {
    "id": "b2-8",
    "level": "B2",
    "title": "Fachvokabular (Medizin, Hukum, Bisnis)",
    "canDoGoals": [
      "Latihan terminologi karier (Fachvokabular) dari kedokteran, ekonomi, bisnis / hukum",
      "Berlatih membuat resume terminologi fungsional spesifik sesuai target studi",
      "Cara menginvestigasi leksikon khusus secara mandiri"
    ]
  },
  {
    "id": "b2-9",
    "level": "B2",
    "title": "Textanalyse & Argumentation",
    "canDoGoals": [
      "Membangun taktik Textanalyse dan Argumentation level debat formal",
      "Menghargai, menyangkal, merangkum, dan bernegosiasi secara rasional dari perspektif (Dafür/Dagegen)",
      "Memulai opini tajam tanpa mengkompromikan keformalan bahasa verbal"
    ]
  },
  {
    "id": "b2-checkpoint-3",
    "title": "Review Konten Sebelumnya",
    "canDoGoals": [
      "Evaluasi debat asinkron dan ekspresi kiasan idiomatik",
      "Asesmen Vokabular teknikal dari industri khusus"
    ]
  },
  {
    "id": "b2-10",
    "level": "B2",
    "title": "Persiapan Ujian Goethe B2",
    "canDoGoals": [
      "Meringkas taktik menaklukkan Modul Ujian Goethe-Zertifikat B2",
      "Membedah apa yang dianalisa pemeriksa pada sesi (Lesen, Hören, Schreiben, Sprechen)",
      "Tip menghemat waktu saat berhadapan dengan soal menjebak"
    ]
  },
  {
    "id": "b2-11",
    "level": "B2",
    "title": "Nomen-Verb-Verbindungen",
    "canDoGoals": [
      "Menguasai Nomen-Verb-Verbindungen tingkat lanjut (Kombinasi Paten Noun-Verba)",
      "Mengganti verba sederhana dengan frase tinggi. Contoh: mengganti 'fragen' menjadi 'eine Frage stellen'",
      "Ekspektasi birokrasi dan korespondensi bisnis formal Jerman di ranah akademik."
    ]
  },
  {
    "id": "b2-12",
    "level": "B2",
    "title": "Passiversatzformen",
    "canDoGoals": [
      "Meningkatkan struktur Passiv dengan padanan moderen Passiversatzformen",
      "Penggunaan refleksi 'sich lassen + Infinitiv', adjektif tambahan (-bar, -lich), dan frasa pengibaratan 'sein + zu + infinitive'",
      "Fleksibilitas dan kealamian cara mengekspresikan kalimat fasih"
    ]
  }
];
