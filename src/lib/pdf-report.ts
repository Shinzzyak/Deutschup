/**
 * PDF Report v6 — DeutschUp Brand Identity
 *
 * Design system match:
 * - Ink: #0a0a0a (from web --foreground)
 * - Paper: #f5f0eb (from web --card / cream)
 * - Accent: #8b2500 (from web Progress indicator)
 * - Success: oklch(0.6 0.15 145) → #22863a
 * - Warning: oklch(0.75 0.15 75) → #d97706
 * - Destructive: oklch(0.577 0.245 27.325) → #dc2626
 * - Font heading: DM Serif Display (simulated via helvetica bold + size)
 * - Font body: Geist (simulated via helvetica normal)
 *
 * Cultural touch: German "Lernbericht" + "Weiter lernen!" encouragement
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
  lessons: Array<{ level: string; title: string; goals: string[]; completed: boolean }>;
  mockTests: Array<{ createdAt: number; level: string; score: number; total: number }>;
}

// ════════════════════════════════════════════════════════════
// DESIGN TOKENS — Match Web Design System
// ════════════════════════════════════════════════════════════
const C = {
  // Ink scale (from --foreground: oklch(0.145 0 0) ≈ #0a0a0a)
  ink:        [10, 10, 10] as [number, number, number],
  inkLight:   [80, 85, 95] as [number, number, number],
  inkMuted:   [140, 145, 155] as [number, number, number],
  inkFaint:   [200, 200, 210] as [number, number, number],

  // Paper scale (from --card / cream: #f5f0eb)
  paper:      [245, 240, 235] as [number, number, number],
  paperLight: [250, 248, 244] as [number, number, number],
  cream:      [238, 232, 225] as [number, number, number],

  // Accent (from Progress indicator: #8b2500)
  accent:     [139, 37, 0] as [number, number, number],
  accentSoft: [245, 230, 220] as [number, number, number],

  // Semantic (from oklch values)
  success:    [26, 107, 61] as [number, number, number],
  successSoft: [240, 246, 242] as [number, number, number],
  warning:    [184, 133, 76] as [number, number, number],
  warningSoft: [250, 245, 238] as [number, number, number],
  danger:     [139, 37, 0] as [number, number, number],
  dangerSoft: [246, 232, 227] as [number, number, number],
  info:       [10, 10, 10] as [number, number, number],
  infoSoft:   [238, 234, 229] as [number, number, number],

  // Neutrals
  white:      [255, 255, 255] as [number, number, number],
  divider:    [225, 218, 208] as [number, number, number],
  dividerLight: [235, 230, 222] as [number, number, number],
};

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════
function trunc(doc: jsPDF, text: string, maxW: number): string {
  if (doc.getTextWidth(text) <= maxW) return text;
  let t = text;
  while (t.length > 1 && doc.getTextWidth(t + '...') > maxW) t = t.slice(0, -1);
  return t + '...';
}

function wrapText(doc: jsPDF, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (doc.getTextWidth(test) > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function centeredText(doc: jsPDF, text: string, bx: number, by: number, bw: number, bh: number) {
  doc.text(text, bx + bw / 2, by + bh / 2, { align: 'center' });
}

/** Decorative diamond pattern (brand motif) */
function drawBrandMark(doc: jsPDF, x: number, y: number, size: number) {
  // 3-dot brand mark (like web footer)
  const r = size / 5;
  const gap = size / 2.5;
  doc.setFillColor(...C.ink);
  doc.circle(x, y, r, 'F');
  doc.setFillColor(...C.accent);
  doc.circle(x + gap, y, r, 'F');
  doc.setFillColor(...C.warning);
  doc.circle(x + gap * 2, y, r, 'F');
}

/** Section divider with brand accent */
function drawSectionDivider(doc: jsPDF, x: number, y: number, w: number) {
  doc.setDrawColor(...C.divider);
  doc.setLineWidth(0.3);
  doc.line(x, y, x + w - 6, y);
  // Accent dot at end
  doc.setFillColor(...C.accent);
  doc.circle(x + w - 3, y, 1, 'F');
}

/** Page background fill */
function fillBg(doc: jsPDF, paper: [number, number, number] = C.paper) {
  doc.setFillColor(...paper);
  doc.rect(0, 0, 210, 297, 'F');
}

/** Check page overflow, add new page if needed */
function checkPage(doc: jsPDF, y: number, threshold = 250): number {
  if (y > threshold) {
    doc.addPage();
    fillBg(doc);
    return 20;
  }
  return y;
}

// ════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════
export async function generateReportPDF(data: ReportData): Promise<Blob> {
  const [{ jsPDF }, autoTable] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable').then(m => m.default),
  ]);

  const doc = new jsPDF();
  const W = 210;
  const M = 18;
  const CW = W - M * 2;

  fillBg(doc);
  let y = 22;

  // ── HEADER: Brand strip ──
  // Top accent bar
  doc.setFillColor(...C.ink);
  doc.rect(0, 0, W, 8, 'F');
  doc.setFillColor(...C.accent);
  doc.rect(0, 8, W, 2, 'F');

  y = 24;

  // Brand mark + name
  drawBrandMark(doc, M, y + 2, 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...C.ink);
  doc.text('DeutschUp', M + 22, y + 4);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.inkLight);
  doc.text('Lernbericht — Belajar Bahasa Jerman', M + 22, y + 11);

  // Date (right)
  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  doc.setFontSize(8);
  doc.setTextColor(...C.inkMuted);
  doc.text(dateStr, W - M, y + 2, { align: 'right' });

  // Level badge (right, below date)
  const bx = W - M - 20, by = y + 5;
  doc.setFillColor(...C.ink);
  doc.rect(bx, by, 20, 11, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.paper);
  centeredText(doc, data.currentLevel.toUpperCase(), bx, by, 20, 11);

  y += 22;

  // Divider
  drawSectionDivider(doc, M, y, CW);
  y += 10;

  // ── GREETING ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.ink);
  doc.text(`Hallo, ${data.userName}!`, M, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.inkLight);
  const greetLines = wrapText(doc, 'Hier ist dein Lernbericht — ein Überblick über deine Fortschritte beim Deutschlernen. Weiter so!', CW);
  for (const line of greetLines.slice(0, 2)) {
    doc.text(line, M, y);
    y += 5;
  }
  y += 6;

  // ── STAT PILLS (4 grid) ──
  const gap = 4;
  const pillW = (CW - gap * 3) / 4;
  const pillH = 34;

  const pills = [
    { label: 'XP PUNKTE', value: data.xp.toLocaleString(), color: C.accent, bg: C.accentSoft, dot: true },
    { label: 'WORTSCHATZ', value: String(data.vocabCount), color: C.success, bg: C.successSoft, dot: true },
    { label: 'LEKTIONEN', value: `${data.completedCount}/${data.totalLessons}`, color: C.warning, bg: C.warningSoft, dot: true },
    { label: 'FORTSCHRITT', value: `${data.overallProgress}%`, color: C.danger, bg: C.dangerSoft, dot: true },
  ];

  pills.forEach((p, i) => {
    const px = M + i * (pillW + gap);

    // Pill background with border (sharp 0px radius)
    doc.setFillColor(...p.bg);
    doc.rect(px, y, pillW, pillH, 'F');
    doc.setDrawColor(...C.divider);
    doc.setLineWidth(0.3);
    doc.rect(px, y, pillW, pillH, 'S');

    // Square status marker (radius-0 design language)
    doc.setFillColor(...p.color);
    doc.rect(px + 3, y + 5, 4, 4, 'F');

    // Value — centered in top 50%
    doc.setFont('helvetica', 'bold');
    let fs = 17;
    while (fs > 10 && doc.getTextWidth(p.value) > pillW - 8) fs--;
    doc.setFontSize(fs);
    doc.setTextColor(...p.color);
    doc.text(trunc(doc, p.value, pillW - 6), px + pillW / 2, y + pillH * 0.42, { align: 'center' });

    // Label — centered in bottom 35%
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.inkLight);
    doc.text(p.label, px + pillW / 2, y + pillH * 0.82, { align: 'center' });

    // Bottom accent line
    doc.setDrawColor(...p.color);
    doc.setLineWidth(1.5);
    doc.line(px + 6, y + pillH - 3, px + pillW - 6, y + pillH - 3);
  });

  y += pillH + 12;

  // ── INSIGHTS CARD ──
  const padX = 10, padY = 8, lineH = 6.5;
  const insights = [
    { text: `${data.streak} hari streak — pertahankan!`, color: C.danger },
    { text: `${data.studyHours} jam total waktu belajar`, color: C.info },
    { text: `Rata-rata skor: ${data.averageScore}%`, color: C.warning },
    { text: `${data.vocabCount} kosakata dikuasai`, color: C.success },
  ];
  const cardH = padY + 8 + insights.length * lineH + padY;

  doc.setFillColor(...C.cream);
  doc.rect(M, y, CW, cardH, 'F');
  doc.setDrawColor(...C.divider);
  doc.setLineWidth(0.3);
  doc.rect(M, y, CW, cardH, 'S');

  // Card header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.ink);
  doc.text('Catatan Belajar', M + padX, y + padY + 5);

  // Left accent bar inside card
  doc.setFillColor(...C.accent);
  doc.rect(M, y + padY + 7, 2, cardH - padY * 2 - 8, 'F');

  insights.forEach((ins, i) => {
    const iy = y + padY + 14 + i * lineH;
    // Square bullet (radius-0)
    doc.setFillColor(...ins.color);
    doc.rect(M + padX + 1.5, iy - 3, 3, 3, 'F');
    // Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.inkLight);
    doc.text(trunc(doc, ins.text, CW - padX * 2 - 10), M + padX + 10, iy);
  });

  y += cardH + 12;

  // ── LESSONS SECTION ──
  y = checkPage(doc, y, 245);
  if (y < 25) { // new page — re-draw mini header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...C.ink);
    drawBrandMark(doc, M, y + 2, 4);
    doc.text('DeutschUp Lernbericht', M + 14, y + 4);
    drawSectionDivider(doc, M, y + 8, CW);
    y += 14;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.ink);
  doc.text('Pelajaran Selesai', M, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.inkMuted);
  const compCount = data.lessons.filter(l => l.completed).length;
  doc.text(`${compCount} pelajaran`, W - M, y, { align: 'right' });

  y += 4;
  drawSectionDivider(doc, M, y, CW);
  y += 8;

  const completedLessons = data.lessons.filter(l => l.completed);
  if (completedLessons.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...C.inkMuted);
    doc.text('Belum ada pelajaran selesai. Mulai sekarang!', M, y);
    y += 12;
  } else {
    const byLevel: Record<string, typeof completedLessons> = {};
    for (const l of completedLessons) {
      if (!byLevel[l.level]) byLevel[l.level] = [];
      byLevel[l.level].push(l);
    }

    const lc: Record<string, [number, number, number]> = {
      A1: C.success, A2: C.info, B1: C.warning, B2: C.danger
    };

    for (const [level, lessons] of Object.entries(byLevel)) {
      y = checkPage(doc, y, 255);

      // Level header row
      const lColor = lc[level] || C.ink;
      doc.setFillColor(...lColor);
      doc.rect(M, y, 16, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...C.white);
      centeredText(doc, level, M, y, 16, 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...C.inkMuted);
      doc.text(`${lessons.length} pelajaran`, M + 20, y + 5);

      // Progress bar for this level
      const levelTotal = data.lessons.filter(l => l.level === level).length;
      const levelProgress = levelTotal > 0 ? lessons.length / levelTotal : 0;
      const barX = W - M - 40, barY = y + 2, barW = 40, barH = 4;
      doc.setFillColor(...C.cream);
      doc.rect(barX, barY, barW, barH, 'F');
      doc.setFillColor(...lColor);
      doc.rect(barX, barY, barW * levelProgress, barH, 'F');

      y += 12;

      for (const lesson of lessons.slice(0, 5)) {
        y = checkPage(doc, y, 265);

        // Square success marker (radius-0, no glyph)
        doc.setFillColor(...C.success);
        doc.rect(M + 1.5, y - 3, 3, 3, 'F');

        // Title
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...C.ink);
        doc.text(trunc(doc, lesson.title, CW - 14), M + 8, y);

        y += 5;

        // First goal
        if (lesson.goals.length > 0) {
          doc.setFontSize(7.5);
          doc.setTextColor(...C.inkMuted);
          const lines = wrapText(doc, lesson.goals[0], CW - 18);
          for (const line of lines.slice(0, 2)) {
            doc.text(trunc(doc, line, CW - 18), M + 8, y);
            y += 4;
          }
        }
        y += 2;
      }

      if (lessons.length > 5) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(...C.inkMuted);
        doc.text(`+ ${lessons.length - 5} pelajaran lainnya`, M + 8, y);
        y += 5;
      }
      y += 5;
    }
  }

  // ── SIMULASI (Exam History) ──
  y = checkPage(doc, y, 235);
  if (y < 25) {
    drawBrandMark(doc, M, y + 2, 4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...C.ink);
    doc.text('DeutschUp Lernbericht', M + 14, y + 4);
    drawSectionDivider(doc, M, y + 8, CW);
    y += 14;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.ink);
  doc.text('Riwayat Simulasi', M, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.inkMuted);
  doc.text(`${data.mockTests.length} simulasi`, W - M, y, { align: 'right' });

  y += 4;
  drawSectionDivider(doc, M, y, CW);
  y += 8;

  if (data.mockTests.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...C.inkMuted);
    doc.text('Belum ada riwayat simulasi ujian.', M, y);
    y += 8;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      tableWidth: CW,
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
        fontStyle: 'bold' as const,
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
        0: { cellWidth: 8, halign: 'center' as const },
        1: { cellWidth: 35 },
        2: { cellWidth: 15, halign: 'center' as const },
        3: { cellWidth: 35, halign: 'center' as const },
        4: { cellWidth: 20, halign: 'center' as const },
      },
      didParseCell(d: any) {
        if (d.section === 'body' && d.column.index === 4) {
          d.cell.styles.fontStyle = 'bold';
          d.cell.styles.textColor = d.cell.raw === 'Lulus' ? C.success : C.warning;
        }
      },
    });
  }

  // ── RECOMMENDATION BOX ──
  y = (doc as any).lastAutoTable?.finalY || y + 10;
  y = checkPage(doc, y, 240);
  y += 8;

  const recoms: string[] = [];
  if (data.overallProgress < 50) {
    recoms.push('Fokus menyelesaikan pelajaran yang belum selesai untuk meningkatkan progres.');
  }
  if (data.vocabCount < 100) {
    recoms.push('Tambah latihan kosakata harian — target 10 kata baru per hari.');
  }
  if (data.averageScore < 70) {
    recoms.push('Ulangi materi yang belum tuntas dan kerjakan simulasi lagi.');
  }
  if (data.streak < 3) {
    recoms.push('Bangun rutinitas harian — belajar 15 menit setiap hari lebih efektif!');
  }
  if (recoms.length === 0) {
    recoms.push('Sehr gut! Pertahankan konsistensi belajarmu. Weiter so!');
  }
  recoms.push('Coba simulasi ujian Goethe level berikutnya untuk tantangan baru!');

  const recCardH = 10 + recoms.length * 6 + 8;
  doc.setFillColor(...C.accentSoft);
  doc.rect(M, y, CW, recCardH, 'F');
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.3);
  doc.rect(M, y, CW, recCardH, 'S');

  // Left accent bar
  doc.setFillColor(...C.accent);
  doc.rect(M, y, 3, recCardH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.accent);
  doc.text('Empfehlung — Rekomendasi', M + 10, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.inkLight);
  recoms.forEach((r, i) => {
    const ry = y + 14 + i * 6;
    doc.setFillColor(...C.accent);
    doc.rect(M + 11, ry - 2.5, 2, 2, 'F');
    doc.text(trunc(doc, r, CW - 25), M + 16, ry);
  });

  // ── FOOTER ──
  const pc = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pc; i++) {
    doc.setPage(i);

    // Bottom accent bar (mirror of top)
    doc.setFillColor(...C.accent);
    doc.rect(0, 289, 210, 2, 'F');
    doc.setFillColor(...C.ink);
    doc.rect(0, 291, 210, 6, 'F');

    // Footer content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.inkMuted);
    doc.text('DeutschUp — Belajar Bahasa Jerman Menyenangkan', M, 286);
    doc.text(`Halaman ${i}/${pc}`, W - M, 286, { align: 'right' });

    // Brand mark centered
    drawBrandMark(doc, W / 2 - 3, 286, 3);
  }

  return doc.output('blob');
}
