/**
 * PDF Report v7 — DeutschUp "Lernkarte" single-page dashboard
 *
 * Rombakan total dari v6 (multi-page verbose → 1 halaman scannable).
 * Semua informasi kunci dalam satu A4: header, stat utama, progress
 * per level, insight, rekomendasi, dan mini riwayat simulasi.
 *
 * Design language tetap brand: ink #0a0a0a, paper cream, accent #8b2500,
 * square markers (radius-0), DM Serif-esque bold headers.
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

const C = {
  ink:      [10, 10, 10]     as [number, number, number],
  inkLight: [80, 85, 95]     as [number, number, number],
  inkMuted: [140, 145, 155]  as [number, number, number],
  paper:    [245, 240, 235]  as [number, number, number],
  paperDim: [235, 229, 221]  as [number, number, number],
  accent:   [139, 37, 0]     as [number, number, number],
  accentSoft:[245, 230, 220] as [number, number, number],
  success:  [26, 107, 61]    as [number, number, number],
  warning:  [184, 133, 76]   as [number, number, number],
  danger:   [139, 37, 0]     as [number, number, number],
  white:    [255, 255, 255]  as [number, number, number],
  divider:  [220, 213, 203]  as [number, number, number],
};

function trunc(doc: jsPDF, text: string, maxW: number): string {
  if (doc.getTextWidth(text) <= maxW) return text;
  let t = text;
  while (t.length > 1 && doc.getTextWidth(t + '…') > maxW) t = t.slice(0, -1);
  return t + '…';
}

function bg(doc: jsPDF) {
  doc.setFillColor(...C.paper);
  doc.rect(0, 0, 210, 297, 'F');
}

function brandMark(doc: jsPDF, x: number, y: number, s: number) {
  const r = s / 5, g = s / 2.5;
  doc.setFillColor(...C.ink);     doc.circle(x, y, r, 'F');
  doc.setFillColor(...C.accent);  doc.circle(x + g, y, r, 'F');
  doc.setFillColor(...C.warning); doc.circle(x + g * 2, y, r, 'F');
}

export async function generateReportPDF(data: ReportData): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const W = 210, M = 16, CW = W - M * 2;

  bg(doc);

  // ═══ TOP STRIP ═══
  doc.setFillColor(...C.ink);    doc.rect(0, 0, W, 7, 'F');
  doc.setFillColor(...C.accent); doc.rect(0, 7, W, 1.5, 'F');

  // ═══ HEADER ═══
  let y = 20;
  brandMark(doc, M, y + 1, 5);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(...C.ink);
  doc.text('DeutschUp', M + 18, y + 3);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...C.inkLight);
  doc.text('Lernbericht · Belajar Bahasa Jerman', M + 18, y + 9);

  // Right: date + level badge
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFontSize(7.5); doc.setTextColor(...C.inkMuted);
  doc.text(dateStr, W - M, y, { align: 'right' });
  const bx = W - M - 22, by = y + 2;
  doc.setFillColor(...C.accent); doc.rect(bx, by, 22, 12, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...C.paper);
  doc.text(data.currentLevel.toUpperCase(), bx + 11, by + 8, { align: 'center' });

  y += 18;
  doc.setDrawColor(...C.divider); doc.setLineWidth(0.3); doc.line(M, y, W - M, y);
  y += 7;

  // ═══ GREETING (1 line) ═══
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...C.ink);
  doc.text(`Hallo, ${trunc(doc, data.userName, 90)}!`, M, y);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...C.inkLight);
  doc.text('Dein Fortschritt auf einen Blick. Progresmu dalam satu pandangan.', W - M, y, { align: 'right' });
  y += 8;

  // ═══ HERO STATS (4 big tiles) ═══
  const gap = 3.5;
  const tw = (CW - gap * 3) / 4;
  const th = 30;
  const stats = [
    { label: 'XP', value: data.xp.toLocaleString('de-DE'), col: C.accent },
    { label: 'KOSAKATA', value: String(data.vocabCount), col: C.success },
    { label: 'STREAK', value: `${data.streak} hari`, col: C.danger },
    { label: 'RATA2 SKOR', value: `${data.averageScore}%`, col: C.warning },
  ];
  stats.forEach((s, i) => {
    const px = M + i * (tw + gap);
    doc.setFillColor(...C.white); doc.rect(px, y, tw, th, 'F');
    doc.setDrawColor(...C.divider); doc.setLineWidth(0.25); doc.rect(px, y, tw, th, 'S');
    doc.setFillColor(...s.col); doc.rect(px, y, tw, 2, 'F'); // top accent bar
    doc.setFont('helvetica', 'bold');
    let fs = 15;
    while (fs > 9 && doc.getTextWidth(s.value) > tw - 6) fs--;
    doc.setFontSize(fs); doc.setTextColor(...s.col);
    doc.text(trunc(doc, s.value, tw - 5), px + tw / 2, y + th * 0.48, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...C.inkMuted);
    doc.text(s.label, px + tw / 2, y + th * 0.78, { align: 'center' });
  });
  y += th + 7;

  // ═══ PROGRESS PER LEVEL (4 bars, 1 row each) ═══
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...C.ink);
  doc.text('Fortschritt pro Level', M, y);
  y += 5;
  const levels: Array<[string, [number, number, number]]> = [
    ['A1', C.success], ['A2', C.ink], ['B1', C.warning], ['B2', C.danger],
  ];
  const rowH = 8;
  levels.forEach(([lv, col], i) => {
    const ry = y + i * rowH;
    const lvlLessons = data.lessons.filter(l => l.level === lv);
    const done = lvlLessons.filter(l => l.completed).length;
    const tot = lvlLessons.length || 1;
    const pct = Math.round((done / tot) * 100);
    // Level chip
    doc.setFillColor(...col); doc.rect(M, ry, 14, 6, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...C.white);
    doc.text(lv, M + 7, ry + 4.3, { align: 'center' });
    // Bar
    const barX = M + 18, barW = CW - 18 - 42;
    doc.setFillColor(...C.paperDim); doc.rect(barX, ry + 1, barW, 4, 'F');
    if (pct > 0) { doc.setFillColor(...col); doc.rect(barX, ry + 1, barW * pct / 100, 4, 'F'); }
    // Numbers
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...C.inkLight);
    doc.text(`${done}/${tot} · ${pct}%`, W - M, ry + 4.5, { align: 'right' });
  });
  y += rowH * 4 + 8;

  // ═══ TWO-COLUMN: Pelajaran terakhir ║ Simulasi terakhir ═══
  const colW = (CW - 6) / 2;
  const colX = [M, M + colW + 6];
  const secY = y;

  // — Left: Pelajaran selesai terakhir —
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...C.ink);
  doc.text('Pelajaran Selesai', colX[0], secY);
  let ly = secY + 5;
  const recentDone = data.lessons.filter(l => l.completed).slice(-4).reverse();
  if (recentDone.length === 0) {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...C.inkMuted);
    doc.text('Belum ada. Mulai sekarang!', colX[0], ly);
  } else {
    recentDone.forEach(l => {
      doc.setFillColor(...C.success); doc.rect(colX[0], ly - 2.6, 2.6, 2.6, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...C.ink);
      doc.text(trunc(doc, l.title, colW - 8), colX[0] + 5, ly);
      ly += 5.2;
    });
  }

  // — Right: Riwayat simulasi —
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...C.ink);
  doc.text('Simulasi Terakhir', colX[1], secY);
  let ry2 = secY + 5;
  const recentTests = data.mockTests.slice(-4).reverse();
  if (recentTests.length === 0) {
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...C.inkMuted);
    doc.text('Belum ada simulasi.', colX[1], ry2);
  } else {
    recentTests.forEach(t => {
      const pct = Math.round((t.score / t.total) * 100);
      const pass = pct >= 70;
      const col = pass ? C.success : C.warning;
      doc.setFillColor(...col); doc.rect(colX[1], ry2 - 2.6, 2.6, 2.6, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...C.ink);
      const dt = new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      doc.text(`${t.level} · ${dt}`, colX[1] + 5, ry2);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...col);
      doc.text(`${pct}%`, colX[1] + colW, ry2, { align: 'right' });
      ry2 += 5.2;
    });
  }
  y = Math.max(ly, ry2) + 6;

  // ═══ INSIGHT STRIP (1 row of key facts) ═══
  doc.setFillColor(...C.paperDim); doc.rect(M, y, CW, 12, 'F');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...C.inkLight);
  const facts = [
    `${data.completedCount}/${data.totalLessons} pelajaran (${data.overallProgress}%)`,
    `${data.studyHours} jam belajar`,
    `${data.mockTests.length} simulasi dikerjakan`,
  ];
  const fw = CW / 3;
  facts.forEach((f, i) => {
    doc.text(trunc(doc, f, fw - 8), M + fw * i + fw / 2, y + 7.5, { align: 'center' });
    if (i > 0) { doc.setDrawColor(...C.divider); doc.line(M + fw * i, y + 2.5, M + fw * i, y + 9.5); }
  });
  y += 12 + 8;

  // ═══ REKOMENDASI (accent card) ═══
  const recoms: string[] = [];
  if (data.overallProgress < 50) recoms.push('Selesaikan pelajaran yang tertunda untuk naikkan progres.');
  if (data.vocabCount < 100)  recoms.push('Target 10 kosakata baru per hari.');
  if (data.averageScore < 70) recoms.push('Ulangi materi dan kerjakan simulasi lagi.');
  if (data.streak < 3)        recoms.push('Bangun rutinitas 15 menit setiap hari.');
  if (recoms.length === 0)    recoms.push('Sehr gut! Pertahankan konsistensimu. Weiter so!');
  const recList = recoms.slice(0, 3);
  const recH = 11 + recList.length * 5.5;
  doc.setFillColor(...C.accentSoft); doc.rect(M, y, CW, recH, 'F');
  doc.setFillColor(...C.accent);     doc.rect(M, y, 3, recH, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...C.accent);
  doc.text('Empfehlung. Rekomendasi', M + 8, y + 7);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.8); doc.setTextColor(...C.inkLight);
  recList.forEach((r, i) => {
    doc.setFillColor(...C.accent); doc.rect(M + 9, y + 11.5 + i * 5.5 - 1.5, 1.8, 1.8, 'F');
    doc.text(trunc(doc, r, CW - 22), M + 14, y + 11.5 + i * 5.5);
  });

  // ═══ FOOTER ═══
  doc.setFillColor(...C.accent); doc.rect(0, 289, W, 1.5, 'F');
  doc.setFillColor(...C.ink);    doc.rect(0, 290.5, W, 6.5, 'F');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...C.inkMuted);
  doc.text('DeutschUp. Belajar Bahasa Jerman Menyenangkan', M, 286);
  brandMark(doc, W - M - 8, 285.5, 3);

  return doc.output('blob');
}
