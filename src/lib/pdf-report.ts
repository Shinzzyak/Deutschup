/**
 * PDF Report v5 — Centered text, proper bounds
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
  mockTests: Array<{ createdAt: string; level: string; score: number; total: number }>;
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

/** Draw text vertically centered inside a box at (bx, by, bw, bh) */
function centeredText(doc: jsPDF, text: string, bx: number, by: number, bw: number, bh: number) {
  doc.text(text, bx + bw / 2, by + bh / 2, { align: 'center' });
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

  // Page background
  doc.setFillColor(...C.paper);
  doc.rect(0, 0, W, 297, 'F');

  let y = 20;

  // ── HEADER ──
  doc.setFillColor(...C.ink);  doc.circle(M + 3, y + 2, 2, 'F');
  doc.setFillColor(...C.red);  doc.circle(M + 10, y + 2, 2, 'F');
  doc.setFillColor(...C.amber); doc.circle(M + 17, y + 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...C.ink);
  doc.text('Laporan Pembelajaran', M, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...C.inkLight);
  doc.text('DeutschUp - Belajar Bahasa Jerman', M, y + 26);

  // Date (right, safe bounds)
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(trunc(doc, dateStr, 70), W - M, y + 8, { align: 'right' });

  // Level badge
  const bx = W - M - 16, by = y + 12;
  doc.setFillColor(...C.accent);
  doc.roundedRect(bx, by, 16, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C.white);
  centeredText(doc, data.currentLevel, bx, by, 16, 10);

  // Divider
  doc.setDrawColor(...C.divider);
  doc.setLineWidth(0.3);
  doc.line(M, y + 34, W - M, y + 34);

  y = 48;

  // ── GREETING ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...C.inkLight);
  doc.text(trunc(doc, `Halo, ${data.userName}! Berikut ringkasan belajarmu.`, CW, 10), M, y);
  y += 12;

  // ── STAT PILLS ──
  // jsPDF text() uses CENTER baseline = top + height/2 + fontSize*0.35
  // So for a pill of height H, text at y+H/2 will be centered
  const gap = 3;
  const pillW = (CW - gap * 3) / 4;
  const pillH = 30;

  const pills = [
    { label: 'XP', value: data.xp.toLocaleString(), color: C.accent, bg: C.accentSoft },
    { label: 'KOSAKATA', value: String(data.vocabCount), color: C.success, bg: C.successSoft },
    { label: 'PELAJARAN', value: `${data.completedCount}/${data.totalLessons}`, color: C.amber, bg: C.amberSoft },
    { label: 'PROGRES', value: `${data.overallProgress}%`, color: C.red, bg: C.redSoft },
  ];

  pills.forEach((p, i) => {
    const px = M + i * (pillW + gap);

    // Pill background
    doc.setFillColor(...p.bg);
    doc.roundedRect(px, y, pillW, pillH, 3, 3, 'F');

    // Value — centered in top 60% of pill
    doc.setFont('helvetica', 'bold');
    let fs = 18;
    while (fs > 11 && doc.getTextWidth(p.value) > pillW - 6) fs--;
    doc.setFontSize(fs);
    doc.setTextColor(...p.color);
    // Top half center: y + pillH*0.28
    doc.text(trunc(doc, p.value, pillW - 4), px + pillW / 2, y + pillH * 0.38, { align: 'center' });

    // Label — centered in bottom 40% of pill
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.inkLight);
    doc.text(p.label, px + pillW / 2, y + pillH * 0.78, { align: 'center' });
  });

  y += pillH + 10;

  // ── INSIGHTS CARD ──
  const padX = 8, padY = 6, lineH = 6;
  const insights = [
    { text: `${data.streak} hari streak - pertahankan!`, color: C.accent },
    { text: `${data.studyHours} jam waktu belajar`, color: C.success },
    { text: `Rata-rata skor: ${data.averageScore}%`, color: C.amber },
    { text: `${data.vocabCount} kosakata dikuasai`, color: C.red },
  ];
  const cardH = padY + 10 + insights.length * lineH + padY;

  doc.setFillColor(...C.cream);
  doc.roundedRect(M, y, CW, cardH, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.ink);
  doc.text('Catatan Belajar', M + padX, y + padY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  insights.forEach((ins, i) => {
    const iy = y + padY + 12 + i * lineH;
    doc.setFillColor(...ins.color);
    doc.circle(M + padX + 2, iy - 1, 1.2, 'F');
    doc.setTextColor(...C.inkLight);
    doc.text(trunc(doc, ins.text, CW - padX * 2 - 8), M + padX + 7, iy);
  });

  y += cardH + 10;

  // ── LESSONS ──
  if (y > 248) { doc.addPage(); doc.setFillColor(...C.paper); doc.rect(0, 0, W, 297, 'F'); y = 20; }

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
    doc.text('Belum ada pelajaran selesai. Mulai sekarang!', M, y);
    y += 12;
  } else {
    const byLevel: Record<string, typeof completedLessons> = {};
    for (const l of completedLessons) {
      if (!byLevel[l.level]) byLevel[l.level] = [];
      byLevel[l.level].push(l);
    }

    const lc: Record<string, [number, number, number]> = { A1: C.success, A2: C.accent, B1: C.amber, B2: C.red };

    for (const [level, lessons] of Object.entries(byLevel)) {
      if (y > 250) { doc.addPage(); doc.setFillColor(...C.paper); doc.rect(0, 0, W, 297, 'F'); y = 20; }

      // Level badge
      const lColor = lc[level] || C.ink;
      doc.setFillColor(...lColor);
      doc.roundedRect(M, y, 14, 7, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...C.white);
      centeredText(doc, level, M, y, 14, 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...C.inkMuted);
      doc.text(`${lessons.length} pelajaran`, M + 18, y + 4.5);

      y += 10;

      for (const lesson of lessons.slice(0, 5)) {
        if (y > 265) { doc.addPage(); doc.setFillColor(...C.paper); doc.rect(0, 0, W, 297, 'F'); y = 20; }

        // Bullet
        doc.setFillColor(...C.success);
        doc.circle(M + 3, y - 1, 1.5, 'F');

        // Title
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...C.ink);
        doc.text(trunc(doc, lesson.title, CW - 14), M + 8, y);

        y += 4.5;

        // First goal
        if (lesson.goals.length > 0) {
          doc.setFontSize(7);
          doc.setTextColor(...C.inkMuted);
          const lines = wrapText(doc, lesson.goals[0], CW - 18);
          for (const line of lines.slice(0, 2)) {
            doc.text(trunc(doc, line, CW - 18), M + 8, y);
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

  // ── SIMULASI ──
  if (y > 235) { doc.addPage(); doc.setFillColor(...C.paper); doc.rect(0, 0, W, 297, 'F'); y = 20; }

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
        return [String(i + 1), new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), t.level, `${t.score}/${t.total} (${pct}%)`, pct >= 70 ? 'Lulus' : 'Belum'];
      }),
      theme: 'plain',
      headStyles: { fillColor: C.cream, textColor: C.inkLight, fontStyle: 'bold', fontSize: 7.5, cellPadding: 3 },
      bodyStyles: { fontSize: 8, textColor: C.ink, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 246, 242] },
      columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 1: { cellWidth: 35 }, 2: { cellWidth: 15, halign: 'center' }, 3: { cellWidth: 35, halign: 'center' }, 4: { cellWidth: 18, halign: 'center' } },
      didParseCell(d: any) {
        if (d.section === 'body' && d.column.index === 4) {
          d.cell.styles.fontStyle = 'bold';
          d.cell.styles.textColor = d.cell.raw === 'Lulus' ? C.success : C.amber;
        }
      },
    });
  }

  // ── FOOTER ──
  const pc = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pc; i++) {
    doc.setPage(i);
    doc.setDrawColor(...C.divider);
    doc.setLineWidth(0.2);
    doc.line(M, 278, W - M, 278);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.inkMuted);
    doc.text('DeutschUp - Belajar Bahasa Jerman Menyenangkan', M, 282);
    doc.text(`Halaman ${i}/${pc}`, W - M, 282, { align: 'right' });

    doc.setFillColor(...C.ink);   doc.circle(W / 2 - 3, 282, 0.8, 'F');
    doc.setFillColor(...C.red);   doc.circle(W / 2, 282, 0.8, 'F');
    doc.setFillColor(...C.amber); doc.circle(W / 2 + 3, 282, 0.8, 'F');
  }

  return doc.output('blob');
}
