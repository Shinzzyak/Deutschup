import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const OUTLINES = {
  "B1": [
    "Kasus Genitiv",
    "Relativsätze (Kalimat Relatif)",
    "Konjunktiv II (würde, könnte, müsste)",
    "Passiv Präsens & Präteritum",
    "Zweiteilige Konjunktionen",
    "Indirekte Rede",
    "Infinitivkonstruktionen (zu + Infinitiv)",
    "Adjektivdeklination lengkap",
    "Futur I & Futur II",
    "Wortbildung (Komposita, Präfixe)"
  ],
  "B2": [
    "Partizipalkonstruktionen",
    "Erweiterte Relativsätze",
    "Modalpartikeln (doch, mal, ja, eben)",
    "Wissenschaftlicher Schreibstil",
    "Konjunktiv I (Indirekte Rede formal)",
    "Komplexe Satzstrukturen",
    "Idiome & Redewendungen",
    "Fachvokabular (Medizin, Hukum, Bisnis)",
    "Textanalyse & Argumentation",
    "Persiapan Ujian Goethe B2"
  ]
};

async function generateLessonsForLevel(level: string, outlines: string[]) {
  console.log(`Generating lessons for ${level}...`);
  const prompt = `Anda adalah seorang ahli kurikulum bahasa Jerman (CEFR).
Tugas Anda adalah menghasilkan konten pembelajaran yang lengkap dan terstruktur dalam format JSON untuk level ${level}.

Berikut adalah daftar materi untuk 10 pertemuan (Lesson 1-10):
${outlines.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Syarat untuk masing-masing Lesson:
- "id": "${level.toLowerCase()}-" + (i+1) (contoh: a1-1, a1-2)
- "level": "${level}"
- "title": Judul lesson (sesuai daftar)
- "grammarDescription": Penjelasan grammar/praktis dalam bahasa Indonesia (harus edukatif, bukan dummy)
- "sentenceBreakdowns": Array string berisi analisis kalimat (misal: "Ich (subjek) + esse (verb) + den Apfel (objek Akkusativ)")
- "pronunciationTips": Tips pelafalan (fokus: ch, sch, ei/ie, umlaut ä/ö/ü, dll)
- "vocabulary": Minimal 15 VocabWord. Harus ada "id", "word", "translation", "exampleSentence" (contoh kalimat), "phonetic" (cara baca, e.g. "APP-fel"), dan "level"="${level}". Jika berupa kata benda, wajib ada "article" ("der", "die", atau "das").
- "exercises": 5 soal latihan campuran (pilihan ganda, "options" array length 4, "correctAnswer" index 0-3)
- "miniQuiz": 3 soal mini kuis di akhir pelajaran (pilihan ganda)
- "dialogues": 3 dialog pendek (personA, personB, translation di bahasa Indonesia)
- "culturalNotes": Catatan budaya Jerman/Austria/Swiss

Syarat khusus untuk Review Checkpoints:
Hanya untuk Lesson ke-3, ke-6, dan ke-9 setiap level, tambahkan objek "checkpoint":
- "id": "${level.toLowerCase()}-checkpoint-X"
- "title": "Review Konten Sebelumnya"
- "requiredScore": 0.7 
- "questions": 10 latihan soal campuran dari 3 pelajaran terakhir
- "reviewLessons": array berisi 3 id pelajaran yang direview.

Keluarkan hasil murni sebagai JSON array of Lessons tanpa markdown tag atau text tambahan. PASTIKAN JSON VALID! Format lengkap.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.2
    }
  });

  const text = response.text || "[]";
  const data = JSON.parse(text);
  
  const destPath = path.join(process.cwd(), `src/data/lessons_${level}.json`);
  fs.writeFileSync(destPath, JSON.stringify(data, null, 2));
  console.log(`Saved ${level} to ${destPath} (Total lessons: ${data.length})`);
}

async function main() {
  try {
    for (const [level, outlines] of Object.entries(OUTLINES)) {
        await generateLessonsForLevel(level, outlines);
    }
    
    // Combine all into one file
    let combined: any[] = [];
    for (const level of ["A1", "A2", "B1", "B2"]) { // explicitly include all
        const fileData = JSON.parse(fs.readFileSync(path.join(process.cwd(), `src/data/lessons_${level}.json`), 'utf-8'));
        combined = combined.concat(fileData);
    }
    
    // Create an exported TS file
    const tsContent = `import { Lesson, VocabWord } from './course';

export const courseData: Lesson[] = ${JSON.stringify(combined, null, 2)};
export const allVocab: VocabWord[] = courseData.flatMap(lesson => lesson.vocabulary);
`;
    
    fs.writeFileSync(path.join(process.cwd(), 'src/data/lessons.ts'), tsContent);
    console.log("All generated successfully!");
  } catch (err) {
    console.error("Failed to generate:", err);
  }
}

main();
