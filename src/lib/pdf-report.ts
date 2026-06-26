/**
 * PDF Report Generator v3 — DeutschUp Laporan Pembelajaran
 * Fix: proper text wrapping, no overflow
 */

import type { jsPDF } from 'jspdf';

interface ReportData {
  userName: string;
  currentLevel: string;
  xp: number;
  vocabCount: number;
  completedCount: number;
  totalLessons: number;
  overallProgress: number;
  streak: number;
  studyHours: number;
  averageScore: number;
  lessons: Array<{
    level: string;
    title: string;
    goals: string[];
    completed: boolean;
  }>;
  mockTests: Array<{
    createdAt: string;
    level: string;
    score: number;
    total: number;
  }>;
}

const C = {
  ink: [30, 30, 35] as [number, number, number],
  inkLight: [100, 105, 115] as [number, number, number],
  inkMuted: [160, 165, 175] as [number, number, number],
  paper: [252, 250, 247] as [number, number, number],
  cream: [245, 241, 235] as [number, number, number],
  accent: [37, 99, 235] as [number, number, number],
  accentSoft: [219, 234, 254] as [number, number, number],
  success: [22, 163, 74] as [number, number, number],
  successSoft: [220, 252, 231] as [number, number, number],
  amber: [217, 119, 6] as [number, number, number],
  amberSoft: [254, 243, 199] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  redSoft: [254, 226, 226] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  divider: [230, 225, 218] as [number, number, number],
};

/** Wrap text to fit within maxWidth, returns array of lines */
function wrapText(doc: jsPDF, text: string, maxWidth: number, fontSize: number): string[] {
  doc.setFontSize(fontSize);
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    const w = doc.getTextWidth(test);
    if (w > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Truncate text to fit maxWidth */
function truncate(doc: jsPDF, text: string, maxWidth: number, fontSize: number): string {
  doc.setFontSize(fontSize);
  if (doc.getTextWidth(text) <= maxWidth) return text;
  let t = text;
  while (t.length > 0 && doc.getTextWidth(t + '...') > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + '...';
}

export async function generateReportPDF(data: ReportData): Promise<Blob> {
  const [{ jsPDF }, autoTable] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable').then(m => m.default),
  ]);

  const doc = new jsPDF();
  const W = 210;
  const M = 18;
  const CW = W - M * 2; // 174mm content width

  // Page background
  doc.setFillColor(...C.paper);
  doc.rect(0, 0, W, 297, 'F');

  let y = 20;

  // ═══════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════
  doc.setFillColor(...C.ink);
  doc.circle(M + 3, y + 2, 2, 'F');
  doc.setFillColor(...C.red);
  doc.circle(M + 10, y + 2, 2, 'F');
  doc.setFillColor(...C.amber);
  doc.circle(M + 17, y + 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...C.ink);
  doc.text('Laporan Pembelajaran', M, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.inkLight);
  doc.text('DeutschUp — Platform Belajar Bahasa Jerman', M, y + 22);

  // Date (right)
  doc.setFontSize(8);
  doc.text(
    new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    W - M, y + 8, { align: 'right' }
  );

  // Level badge
  doc.setFillColor(...C.accent);
  doc.roundedRect(W - M - 18, y + 12, 18, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.white);
  doc.text(data.currentLevel, W - M - 9, y + 21, { align: 'center' });

  // Divider
  doc.setDrawColor(...C.divider);
  doc.setLineWidth(0.3);
  doc.line(M, y + 30, W - M, y + 30);

  y = 42;

  // ═══════════════════════════════════════
  // GREETING
  // ═══════════════════════════════════════
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...C.inkLight);
  const greeting = `Halo, ${data.userName}! Berikut ringkasan perjalanan belajarmu.`;
  doc.text(truncate(doc, greeting, CW, 10), M, y);
  y += 12;

  // ═══════════════════════════════════════
  // STAT PILLS
  // ═══════════════════════════════════════
  const gap = 3;
  const pillW = (CW - gap * 3) / 4;
  const pillH = 26;

  const pills = [
    { label: 'XP', value: data.xp.toLocaleString(), color: C.accent, bg: C.accentSoft },
    { label: 'KOSAKATA', value: String(data.vocabCount), color: C.success, bg: C.successSoft },
    { label: 'PELAJARAN', value: `${data.completedCount}/${data.totalLessons}`, color: C.amber, bg: C.amberSoft },
    { label: 'PROGRES', value: `${data.overallProgress}%`, color: C.red, bg: C.redSoft },
  ];

  pills.forEach((p, i) => {
    const px = M + i * (pillW + gap);
    doc.setFillColor(...p.bg);
    doc.roundedRect(px, y, pillW, pillH, 3, 3, 'F');

    // Value — fit within pill
    doc.setFont('helvetica', 'bold');
    const valWidth = doc.getTextWidth(p.value);
    const valSize = valWidth > pillW - 8 ? 12 : 16;
    doc.setFontSize(valSize);
    doc.setTextColor(...p.color);
    doc.text(p.value, px + pillW / 2, y + 12, { align: 'center' });

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.inkLight);
    doc.text(p.label, px + pillW / 2, y + 21, { align: 'center' });
  });

  y += pillH + 10;

  // ═══════════════════════════════════════
  // INSIGHTS CARD
  // ═══════════════════════════════════════
  const insightH = 34;
  doc.setFillColor(...C.cream);
  doc.roundedRect(M, y, CW, insightH, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.ink);
  doc.text('Catatan Belajar', M + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.inkLight);

  const insights = [
    { text: `${data.streak} hari streak — pertahankan!`, color: C.accent },
    { text: `${data.studyHours} jam waktu belajar`, color: C.success },
    { text: `Rata-rata skor simulasi: ${data.averageScore}%`, color: C.amber },
    { text: `${data.vocabCount} kosakata dikuasai`, color: C.red },
  ];

  insights.forEach((ins, i) => {
    const iy = y + 14 + i * 5;
    doc.setFillColor(...ins.color);
    doc.circle(M + 8, iy - 1, 1.2, 'F');
    doc.text(truncate(doc, ins.text, CW - 18, 8), M + 13, iy);
  });

  y += insightH + 10;

  // ═══════════════════════════════════════
  // LESSONS SECTION
  // ═══════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.ink);
  doc.text('Pelajaran Selesai', M, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.inkMuted);
  doc.text(`${data.lessons.filter(l => l.completed).length} pelajaran`, W - M, y, { align: 'right' });

  y += 3;
  doc.setDrawColor(...C.divider);
  doc.line(M, y + 1, W - M, y + 1);
  y += 7;

  const completedLessons = data.lessons.filter(l => l.completed);

  if (completedLessons.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...C.inkMuted);
    doc.text('Belum ada pelajaran selesai. Mulai belajar sekarang!', M, y);
    y += 12;
  } else {
    const byLevel: Record<string, typeof completedLessons> = {};
    for (const l of completedLessons) {
      if (!byLevel[l.level]) byLevel[l.level] = [];
      byLevel[l.level].push(l);
    }

    const levelColors: Record<string, [number, number, number]> = {
      A1: C.success, A2: C.accent, B1: C.amber, B2: C.red,
    };

    for (const [level, lessons] of Object.entries(byLevel)) {
      // Page break check
      if (y > 252) {
        doc.addPage();
        doc.setFillColor(...C.paper);
        doc.rect(0, 0, W, 297, 'F');
        y = 20;
      }

      const lColor = levelColors[level] || C.ink;

      // Level badge
      doc.setFillColor(...lColor);
      doc.roundedRect(M, y, 14, 7, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...C.white);
      doc.text(level, M + 7, y + 5, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...C.inkMuted);
      doc.text(`${lessons.length} pelajaran`, M + 18, y + 5);

      y += 10;

      for (const lesson of lessons.slice(0, 5)) {
        if (y > 268) {
          doc.addPage();
          doc.setFillColor(...C.paper);
          doc.rect(0, 0, W, 297, 'F');
          y = 20;
        }

        // Checkmark
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...C.success);
        doc.text('\u2713', M + 2, y);

        // Title (truncated to fit)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...C.ink);
        doc.text(truncate(doc, lesson.title, CW - 12, 8.5), M + 8, y);

        y += 4.5;

        // First goal (wrapped if needed)
        if (lesson.goals.length > 0) {
          doc.setFontSize(7);
          doc.setTextColor(...C.inkMuted);
          const goalLines = wrapText(doc, lesson.goals[0], CW - 16, 7);
          for (const line of goalLines.slice(0, 2)) {
            doc.text(truncate(doc, line, CW - 16, 7), M + 8, y);
            y += 3.5;
          }
        }

        y += 2;
      }

      if (lessons.length > 5) {
        doc.setFontSize(7);
        doc.setTextColor(...C.inkMuted);
        doc.text(`+ ${lessons.length - 5} pelajaran lainnya`, M + 8, y);
        y += 4;
      }

      y += 4;
    }
  }

  // ═══════════════════════════════════════
  // SIMULASI SECTION
  // ═══════════════════════════════════════
  if (y > 230) {
    doc.addPage();
    doc.setFillColor(...C.paper);
    doc.rect(0, 0, W, 297, 'F');
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.ink);
  doc.text('Riwayat Simulasi', M, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.inkMuted);
  doc.text(`${data.mockTests.length} simulasi`, W - M, y, { align: 'right' });

  y += 3;
  doc.setDrawColor(...C.divider);
  doc.line(M, y + 1, W - M, y + 1);
  y += 8;

  if (data.mockTests.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...C.inkMuted);
    doc.text('Belum ada riwayat simulasi ujian.', M, y);
  } else {
    autoTable(doc, {
      startY: y,
      head: [['#', 'Tanggal', 'Level', 'Skor', 'Hasil']],
      body: data.mockTests.map((t, i) => {
        const pct = Math.round((t.score / t.total) * 100);
        return [
          String(i + 1),
          new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          t.level,
          `${t.score}/${t.total} (${pct}%)`,
          pct >= 70 ? 'Lulus' : 'Belum',
        ];
      }),
      theme: 'plain',
      headStyles: {
        fillColor: C.cream,
        textColor: C.inkLight,
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: C.ink,
        cellPadding: 3,
      },
      alternateRowStyles: { fillColor: [248, 246, 242] },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 35, halign: 'center' },
        4: { cellWidth: 18, halign: 'center' },
      },
      didParseCell(data: any) {
        if (data.section === 'body' && data.column.index === 4) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = data.cell.raw === 'Lulus' ? C.success : C.amber;
        }
      },
    });
  }

  // ═══════════════════════════════════════
  // FOOTER (all pages)
  // ═══════════════════════════════════════
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...C.divider);
    doc.setLineWidth(0.2);
    doc.line(M, 278, W - M, 278);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.inkMuted);
    doc.text('DeutschUp — Belajar Bahasa Jerman Menyenangkan', M, 282);
    doc.text(`Halaman ${i}/${pageCount}`, W - M, 282, { align: 'right' });

    doc.setFillColor(...C.ink);
    doc.circle(W / 2 - 3, 282, 0.8, 'F');
    doc.setFillColor(...C.red);
    doc.circle(W / 2, 282, 0.8, 'F');
    doc.setFillColor(...C.amber);
    doc.circle(W / 2 + 3, 282, 0.8, 'F');
  }

  return doc.output('blob');
}
