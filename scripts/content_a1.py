# Content: 3 new A1 chapter lessons (Netzwerk Neu A1 ch 8, 9, 11)
# vocab tuple: (word, article, translation, example, phonetic)
KAPITEL = {'a1-k5': {'level': 'A1', 'title': 'Zusatzthemen aus dem Buch', 'sort': 5}}
LESSONS = {
 'a1-16': {
  'sort': 16, 'kapitel': 'a1-k5', 'title': 'Gesundheit & Beim Arzt',
  'goals': ['Mampu menyebutkan keluhan kesehatan (Ich habe Fieber/Kopfschmerzen)', 'Mampu membuat janji dengan dokter (Termin beim Arzt)', 'Mampu memahami instruksi di apotek (Rezept, Tablette)'],
  'grammar': 'Keluhan kesehatan pakai "Ich habe + Akkusativ": Ich habe Fieber, Ich habe Kopfschmerzen. Bagian tubuh hampir selalu dengan artikel: der Kopf, der Bauch, der Hals. Imperatif dokter: Nehmen Sie die Tabletten! Bleiben Sie im Bett!',
  'cultural': 'Di Jerman kamu TIDAK bisa langsung ke dokter spesialis: harus lewat Hausarzt (dokter keluarga) dulu untuk surat rujukan. Untuk sakit ringan, apotek (Apotheke) adalah tempat pertama — apoteker boleh kasih obat ringan tanpa resep. Klinik ruang gawat (Notaufnahme) hanya untuk keadaan darurat.',
  'mistakes': """**1. 'Ich bin krank' vs 'Ich habe krank'**
Kata sifat pakai sein (Ich bin krank = aku sakit), nama penyakit pakai haben (Ich habe Grippe = aku flu). Campur keduanya = salah besar.
**2. Artikel bagian tubuh dilupakan**
Bukan 'Kopf tut weh' tapi 'Der Kopf tut weh' atau lebih natural: 'Ich habe Kopfschmerzen'. Bahasa Indonesia tidak punya artikel, jadi ini sering lupa.
**3. 'Ich gehe zum Dokter'**
Istilah sehari-hari adalah der Arzt (bukan der Dokter — itu gelar akademis). 'Ich gehe zum Arzt' atau 'zum Hausarzt'.""",
  'dialogues': [
   {'personA': 'Guten Tag, ich habe seit zwei Tagen Fieber und Halsschmerzen.', 'personB': 'Machen Sie bitte den Mund auf. … Ja, das ist eine Erkältung. Nehmen Sie diese Tabletten, dreimal am Tag.', 'translation': 'A: Selamat siang, saya demam dua hari dan radang tenggorokan.\\nB: Buka mulut Anda. … Ya, ini flu biasa. Minum obat ini, tiga kali sehari.'},
   {'personA': 'Entschuldigung, ich brauche etwas gegen Kopfschmerzen. Brauche ich ein Rezept?', 'personB': 'Nein, diese Tabletten gibt es ohne Rezept. Trinken Sie viel Wasser und bleiben Sie zu Hause.', 'translation': 'A: Permisi, saya butuh obat sakit kepala. Perlu resep?\\nB: Tidak, obat ini tanpa resep. Banyak minum air dan tinggal di rumah saja.'},
  ],
  'vocab': [
   ('das Fieber', 'das', 'demam', 'Ich habe 39 Grad Fieber.', 'FI-e-ber'),
   ('der Husten', 'der', 'batuk', 'Der Husten ist schlimm in der Nacht.', 'HUS-ten'),
   ('die Schmerzen', 'die', 'rasa sakit (Pl.)', 'Ich habe Schmerzen im Bauch.', 'SCHMER-tsen'),
   ('der Termin', 'der', 'janji temu', 'Ich habe morgen einen Termin beim Arzt.', 'ter-MIN'),
   ('die Tablette', 'die', 'tablet', 'Nimm zwei Tabletten mit Wasser.', 'ta-BLET-te'),
   ('gesund', '', 'sehat', 'Iss Obst, dann bleibst du gesund.', 'ge-ZUNT'),
   ('krank', '', 'sakit', 'Mein Sohn ist krank und bleibt im Bett.', 'KRANK'),
   ('die Apotheke', 'die', 'apotek', 'Die Apotheke macht um 18 Uhr zu.', 'a-po-TE-ke'),
   ('das Rezept', 'das', 'resep dokter', 'Der Arzt schreibt mir ein Rezept.', 're-TSEPT'),
   ('die Erkältung', 'die', 'flu/sakit pilek', 'Bei kaltem Wetter bekommt man leicht eine Erkältung.', 'er-KELT-ung'),
  ],
 },
 'a1-17': {
  'sort': 17, 'kapitel': 'a1-k5', 'title': 'Meine Wohnung',
  'goals': ['Mampu mendeskripsikan rumah/kamar (Zimmer, Küche, Bad)', 'Mampu menyebutkan posisi benda dengan preposisi (auf, unter, neben)', 'Mampu membaca iklan sewa sederhana (Miete, Zimmer)'],
  'grammar': 'Kata benda tempat: die Wohnung (apartemen), das Zimmer (kamar). Posisi pakai Wechselpräpositionen: Wo ist die Lampe? — Sie ist auf dem Tisch (Dativ untuk posisi diam). Wo wohnst du? — In einer kleinen Wohnung.',
  'cultural': 'Sewa di kota besar Jerman mahal dan sulit: satu iklan apartemen bisa dapat 100 peminat, jadi ada Bewerbung untuk apartemen! Dalam iklan: 3-Zimmer-Wohnung artinya 3 kamar (dapur tidak dihitung), Kaltmiete = sewa tanpa listrik/air, Warmmiete = sudah termasuk. WG (Wohngemeinschaft) — satu apartemen dibagi beberapa orang — sangat populer untuk mahasiswa.',
  'mistakes': """**1. 'Ich wohne in einem Apartment' vs 'Wohnung'**
das Apartment = studio kecil; die Wohnung = apartemen biasa. Banyak pembelajar Indonesia memakai 'Apartment' karena mirip bahasa Indonesia, padahal artinya lebih sempit.
**2. 'Ich wohne auf Jakarta'**
Kota pakai in: Ich wohne in Jakarta. auf hanya untuk pulau (auf Bali, auf Java) dan alamat lantai (im dritten Stock = di lantai tiga).
**3. Miete = 'menyewa' atau 'sewa'?**
die Miete = uang sewa (noun). Kata kerja menyewa = mieten. 'Ich miete eine Wohnung' (saya menyewa apartemen), 'Die Miete ist 700 Euro' (sewanya 700 euro).""",
  'dialogues': [
   {'personA': 'Wie groß ist deine Wohnung?', 'personB': 'Sie hat drei Zimmer: ein Schlafzimmer, ein Wohnzimmer und eine Küche. Die Miete kostet 650 Euro warm.', 'translation': 'A: Seberapa besar apartemenmu?\\nB: Ada tiga kamar: kamar tidur, ruang tamu, dan dapur. Sewa 650 euro sudah termasuk tagihan.'},
   {'personA': 'Wo ist der Kühlschrank — in der Küche?', 'personB': 'Nein, er steht im Flur, weil die Küche zu klein ist. Der Tisch ist aber in der Küche.', 'translation': 'A: Di mana kulkasnya — di dapur?\\nB: Bukan, dia di lorong, karena dapurnya terlalu kecil. Tapi mejanya di dapur.'},
  ],
  'vocab': [
   ('die Wohnung', 'die', 'apartemen/rumah', 'Meine Wohnung ist im dritten Stock.', 'WO-nung'),
   ('das Zimmer', 'das', 'kamar', 'Das Zimmer hat ein großes Fenster.', 'TSI-mer'),
   ('die Küche', 'die', 'dapur', 'Wir essen immer in der Küche.', 'KÜ-che'),
   ('das Bad', 'das', 'kamar mandi', 'Das Bad ist klein, aber modern.', 'BAT'),
   ('die Miete', 'die', 'uang sewa', 'Die Miete ist am ersten fällig.', 'MI-te'),
   ('der Kühlschrank', 'der', 'kulkas', 'Der Saft ist im Kühlschrank.', 'KÜL-schrank'),
   ('umziehen', '', 'pindah rumah', 'Nächsten Monat ziehen wir nach Berlin um.', 'UM-tsi-en'),
   ('der Nachbar', 'der', 'tetangga', 'Mein Nachbar ist sehr leise.', 'NACH-bar'),
   ('gemütlich', '', 'nyaman/homey', 'Deine Wohnung ist richtig gemütlich!', 'ge-MÜT-lich'),
   ('der Möbel', 'die', 'perabot (Pl.)', 'Die Möbel sind neu, aber billig.', 'MÖ-bel'),
  ],
 },
 'a1-18': {
  'sort': 18, 'kapitel': 'a1-k5', 'title': 'Kleidung & Einkaufen',
  'goals': ['Mampu menyebutkan pakaian dengan artikel yang benar', 'Mampu bertransaksi di toko (Was kostet…? Ich nehme…)', 'Mampu meminta ukuran & mencoba pakaian (Größe, anprobieren)'],
  'grammar': 'Verba belanja: kosten (berharga), nehmen (mengambil/membeli — di toko: Ich nehme die blaue Jacke), anprobieren (mencoba), passen (cocok ukuran: Die Hose passt gut). Pertanyaan harga: Was kostet das? / Wie viel kostet die Jacke?',
  'cultural': 'Jam toko di Jerman ketat: kebanyakan toko tutup pukul 20.00 dan MINGGU TUTUP SEMUA (kecuali stasiun & bandara). Sale hanya dua kali setahun resmi: Winterschlussverkauf (Januari) dan Sommerschlussverkauf (Juli). Kembali barang: tetap simpan struk (Kassenbon), tanpa itu pertukaran sulit. Ubah uang: tunai (Bargeld) masih sangat umum!',
  'mistakes': """**1. 'Ich will die Jacke probieren'**
Harusnya anprobieren (mencoba di badan). probieren = mencoba umum (makanan, ide). Di toko: Kann ich die Jacke anprobieren?
**2. Artikel pakaian terbalik**
der Schuh, die Jacke, das Hemd, die Hose (tunggal!), die Schuhe (jamak). Sering tertukar karena bahasa Indonesia tidak punya gender.
**3. 'Es gefällt mich'**
gefallen pakai Dativ: Es gefällt MIR (saya suka itu). Versi pemula yang benar: Die Jacke gefällt mir sehr.""",
  'dialogues': [
   {'personA': 'Entschuldigung, wie viel kostet diese Jacke?', 'personB': 'Sie kostet 79 Euro. In Ihrer Größe haben wir sie auch in Blau.', 'translation': 'A: Permisi, jaket ini harganya berapa?\\nB: 79 euro. Ukuranmu juga ada warna biru.'},
   {'personA': 'Kann ich die Hose anprobieren? Ich trage Größe 38.', 'personB': 'Ja, die Umkleide ist da drüben. Passt die Hose?', 'translation': 'A: Bisa saya coba celananya? Ukuran saya 38.\\nB: Bisa, ruang pasnya di sana. Celananya cocok?'},
  ],
  'vocab': [
   ('die Jacke', 'die', 'jaket', 'Die Jacke ist warm und schwarz.', 'JA-ke'),
   ('das Hemd', 'das', 'kemeja', 'Ich kaufe ein weißes Hemd für die Arbeit.', 'HEMT'),
   ('die Hose', 'die', 'celana', 'Die Hose ist zu lang für mich.', 'HO-se'),
   ('der Schuh', 'der', 'sepatu', 'Die Schuhe kosten 45 Euro.', 'SCHU'),
   ('anprobieren', '', 'mencoba (pakaian)', 'Kann ich den Pullover anprobieren?', 'AN-pro-bie-ren'),
   ('die Größe', 'die', 'ukuran', 'Welche Größe haben Sie? — Mittel.', 'GRÖ-se'),
   ('kosten', '', 'berharga', 'Was kostet diese Tasche?', 'KOS-ten'),
   ('das Geschäft', 'das', 'toko', 'Das Geschäft öffnet um neun Uhr.', 'ge-SCHÄFT'),
   ('günstig', '', 'murah/terjangkau', 'Der Markt ist sehr günstig.', 'GÜN-stich'),
   ('die Kasse', 'die', 'kasir', 'Bitte zahlen Sie an der Kasse.', 'KA-se'),
  ],
 },
}
