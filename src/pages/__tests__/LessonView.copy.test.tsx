import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const lessonViewSource = readFileSync(resolve(process.cwd(), 'src/pages/LessonView.tsx'), 'utf8');

describe('LessonView production copy', () => {
  it('keeps learner-facing headings localized without rendering heavy lesson dependencies', () => {
    expect(lessonViewSource).toContain('Catatan Kehidupan Nyata di Jerman');
    expect(lessonViewSource).toContain('Catatan Ragam Bahasa (Formal/Nonformal)');
    expect(lessonViewSource).toContain('Transkrip Simulasi Mendengarkan');
    expect(lessonViewSource).toContain('Pertanyaan Singkat');
    expect(lessonViewSource).toContain('Terjadi gangguan jaringan, silakan coba lagi.');

    expect(lessonViewSource).not.toMatch(/Real-Life Germany Notes/i);
    expect(lessonViewSource).not.toMatch(/Register Notes/i);
    expect(lessonViewSource).not.toMatch(/Listening Simulation Transcript/i);
    expect(lessonViewSource).not.toMatch(/Quick Question/i);
    expect(lessonViewSource).not.toMatch(/Network error, please try again/i);
  });
});
