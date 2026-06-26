/**
 * PDF Report Generator v2 — DeutschUp Laporan Pembelajaran
 * Design: Organic, warm, typography-driven. No harsh boxes.
 * Inspired by: modern editorial reports, German warmth.
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

// Warm color palette
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

function softRect(doc: jsPDF, x: number, y: number, w: number, h: number, color: [number, number, number]) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, w, h, 4, 4, 'F');
}

function dot(doc: jsPDF, x: number, y: number, r: number, color: [number, number, number]) {
  doc.setFillColor(...color);
  doc.circle(x, y, r, 'F');
}

export async function generateReportPDF(data: ReportData): Promise<Blob> {
  const [{ jsPDF }, autoTable] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable').then(m => m.default),
  ]);

  const doc = new jsPDF();
  const W = 210;
  const M = 18;
  const CW = W - M * 2;

  // ───────────────────────────────────────
  // PAGE BACKGROUND (warm paper tone)
  // ───────────────────────────────────────
  doc.setFillColor(...C.paper);
  doc.rect(0, 0, W, 297, 'F');

  let y = 20;

  // ───────────────────────────────────────
  // HEADER — minimal, typography-driven
  // ───────────────────────────────────────
  // Small German flag dots (subtle accent)
  dot(doc, M + 3, y + 2, 2, C.ink);
  dot(doc, M + 10, y + 2, 2, C.red);
  dot(doc, M + 17, y + 2, 2, C.amber);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...C.ink);
  doc.text('Laporan', M, y + 18);
  doc.text('Pembelajaran', M, y + 30);

  // Right side: date + level
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.inkLight);
  doc.text(new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), W - M, y + 8, { align: 'right' });

  // Level badge (rounded, soft)
  const badgeX = W - M - 22;
  const badgeY = y + 14;
  softRect(doc, badgeX, badgeY, 22, 14, C.accent);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...C.white);
  doc.text(data.currentLevel, badgeX + 11, badgeY + 10.5, { align: 'center' });

  // Thin divider
  doc.setDrawColor(...C.divider);
  doc.setLineWidth(0.3);
  doc.line(M, y + 38, W - M, y + 38);

  y = 50;

  // ───────────────────────────────────────
  // GREETING + PROFILE
  // ───────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...C.inkLight);
  doc.text(`Halo, ${data.userName}! Berikut ringkasan perjalanan belajarmu.`, M, y);
  y += 14;

  // ───────────────────────────────────────
  // STAT PILLS (soft, rounded, no hard boxes)
  // ───────────────────────────────────────
  const pillW = (CW - 9) / 4;
  const pillH = 28;
  const pills = [
    { label: 'XP Terkumpul', value: data.xp.toLocaleString(), color: C.accent, bg: C.accentSoft },
    { label: 'Kosakata', value: `${data.vocabCount}`, color: C.success, bg: C.successSoft },
    { label: 'Pelajaran', value: `${data.completedCount}/${data.totalLessons}`, color: C.amber, bg: C.amberSoft },
    { label: 'Progres', value: `${data.overallProgress}%`, color: C.red, bg: C.redSoft },
  ];

  pills.forEach((p, i) => {
    const px = M + i * (pillW + 3);
    softRect(doc, px, y, pillW, pillH, p.bg);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...p.color);
    doc.text(p.value, px + pillW / 2, y + 13, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.inkLight);
    doc.text(p.label.toUpperCase(), px + pillW / 2, y + 22, { align: 'center' });
  });

  y += pillH + 14;

  // ───────────────────────────────────────
  // INSIGHTS (warm, editorial style)
  // ───────────────────────────────────────
  softRect(doc, M, y, CW, 36, C.cream);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...C.ink);
  doc.text('Catatan Belajar', M + 8, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.inkLight);

  const insights = [
    `${data.streak} hari streak belajar — pertahankan konsistensimu!`,
    `${data.studyHours} jam total waktu belajar`,
    `Rata-rata skor simulasi: ${data.averageScore}%`,
    `${data.vocabCount} kosakata sudah dikuasai`,
  ];

  insights.forEach((text, i) => {
    // Small colored dot
    const dotColor = [C.accent, C.success, C.amber, C.red][i];
    dot(doc, M + 10, y + 17 + i * 6.5, 1.2, dotColor);
    doc.text(text, M + 15, y + 18.5 + i * 6.5);
  });

  y += 46;

  // ───────────────────────────────────────
  // LESSONS — clean list, no grid/table
  // ───────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.ink);
  doc.text('Pelajaran Selesai', M, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.inkMuted);
  doc.text(`${data.lessons.filter(l => l.completed).length} dari ${data.lessons.length} pelajaran`, W - M, y, { align: 'right' });

  y += 4;
  doc.setDrawColor(...C.divider);
  doc.line(M, y + 2, W - M, y + 2);
  y += 8;

  const completedLessons = data.lessons.filter(l => l.completed);

  if (completedLessons.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...C.inkMuted);
    doc.text('Belum ada pelajaran yang diselesaikan. Mulai belajar sekarang!', M, y + 5);
    y += 18;
  } else {
    // Group by level
    const byLevel: Record<string, typeof completedLessons> = {};
    for (const l of completedLessons) {
      if (!byLevel[l.level]) byLevel[l.level] = [];
      byLevel[l.level].push(l);
    }

    const levelColors: Record<string, [number, number, number]> = {
      A1: C.success, A2: C.accent, B1: C.amber, B2: C.red,
    };

    for (const [level, lessons] of Object.entries(byLevel)) {
      if (y > 255) { doc.addPage(); doc.setFillColor(...C.paper); doc.rect(0, 0, W, 297, 'F'); y = 20; }

      const lColor = levelColors[level] || C.ink;

      // Level pill
      softRect(doc, M, y, 16, 8, lColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...C.white);
      doc.text(level, M + 8, y + 5.5, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...C.inkMuted);
      doc.text(`${lessons.length} pelajaran`, M + 20, y + 5.5);

      y += 12;

      for (const lesson of lessons.slice(0, 6)) {
        if (y > 270) { doc.addPage(); doc.setFillColor(...C.paper); doc.rect(0, 0, W, 297, 'F'); y = 20; }

        // Checkmark
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...C.success);
        doc.text('✓', M + 2, y);

        // Title
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...C.ink);
        const title = lesson.title.length > 65 ? lesson.title.slice(0, 62) + '...' : lesson.title;
        doc.text(title, M + 8, y);

        y += 5.5;

        // Goals (first 2, muted)
        if (lesson.goals.length > 0) {
          doc.setFontSize(7.5);
          doc.setTextColor(...C.inkMuted);
          const goal = lesson.goals[0].length > 80 ? lesson.goals[0].slice(0, 77) + '...' : lesson.goals[0];
          doc.text(`→ ${goal}`, M + 8, y);
          y += 4.5;
        }
      }

      if (lessons.length > 6) {
        doc.setFontSize(7.5);
        doc.setTextColor(...C.inkMuted);
        doc.text(`+ ${lessons.length - 6} pelajaran lainnya`, M + 8, y);
        y += 5;
      }

      y += 6;
    }
  }

  // ───────────────────────────────────────
  // SIMULASI SECTION
  // ───────────────────────────────────────
  if (y > 230) { doc.addPage(); doc.setFillColor(...C.paper); doc.rect(0, 0, W, 297, 'F'); y = 20; }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.ink);
  doc.text('Riwayat Simulasi', M, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.inkMuted);
  doc.text(`${data.mockTests.length} simulasi`, W - M, y, { align: 'right' });

  y += 4;
  doc.setDrawColor(...C.divider);
  doc.line(M, y + 2, W - M, y + 2);
  y += 10;

  if (data.mockTests.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...C.inkMuted);
    doc.text('Belum ada riwayat simulasi ujian.', M, y);
  } else {
    autoTable(doc, {
      startY: y,
      head: [['#', 'Tanggal', 'Level', 'Skor', 'Hasil']],
      body: data.mockTests.map((t, i) => {
        const pct = Math.round((t.score / t.total) * 100);
        const status = pct >= 70 ? 'Lulus' : 'Belum';
        return [
          String(i + 1),
          new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          t.level,
          `${t.score}/${t.total} (${pct}%)`,
          status,
        ];
      }),
      theme: 'plain',
      headStyles: {
        fillColor: C.cream,
        textColor: C.inkLight,
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: C.ink,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [248, 246, 242],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 38 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 35, halign: 'center' },
        4: { cellWidth: 18, halign: 'center' },
      },
      didParseCell(data: any) {
        // Color the status column
        if (data.section === 'body' && data.column.index === 4) {
          const val = data.cell.raw;
          data.cell.styles.fontStyle = 'bold';
          if (val === 'Lulus') {
            data.cell.styles.textColor = C.success;
          } else {
            data.cell.styles.textColor = C.amber;
          }
        }
      },
    });
  }

  // ───────────────────────────────────────
  // FOOTER — subtle, warm
  // ───────────────────────────────────────
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor(...C.divider);
    doc.setLineWidth(0.2);
    doc.line(M, 278, W - M, 278);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.inkMuted);
    doc.text('DeutschUp — Belajar Bahasa Jerman Menyenangkan', M, 283);
    doc.text(`Halaman ${i} dari ${pageCount}`, W - M, 283, { align: 'right' });

    // Tiny flag dots
    dot(doc, W / 2 - 4, 283, 1, C.ink);
    dot(doc, W / 2, 283, 1, C.red);
    dot(doc, W / 2 + 4, 283, 1, C.amber);
  }

  return doc.output('blob');
}
