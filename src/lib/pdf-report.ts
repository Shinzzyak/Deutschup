/**
 * PDF Report Generator — DeutschUp Laporan Pembelajaran
 * Modern design with German flag accent, gradient header, clean typography
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

// Color palette (RGB)
const COLORS = {
  germanBlack: [30, 30, 30] as [number, number, number],
  germanRed: [221, 0, 0] as [number, number, number],
  germanGold: [255, 204, 0] as [number, number, number],
  primary: [37, 99, 235] as [number, number, number],
  primaryDark: [29, 78, 216] as [number, number, number],
  success: [22, 163, 74] as [number, number, number],
  warning: [234, 179, 8] as [number, number, number],
  textDark: [15, 23, 42] as [number, number, number],
  textMuted: [100, 116, 139] as [number, number, number],
  textLight: [248, 250, 252] as [number, number, number],
  bgLight: [248, 250, 252] as [number, number, number],
  bgCard: [241, 245, 249] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number) {
  doc.roundedRect(x, y, w, h, r, r);
}

function drawStatCard(doc: jsPDF, x: number, y: number, w: number, h: number, label: string, value: string, color: [number, number, number]) {
  // Card background
  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.border);
  drawRoundedRect(doc, x, y, w, h, 3);

  // Color accent bar (top)
  doc.setFillColor(...color);
  doc.rect(x + 1, y + 1, w - 2, 3, 'F');

  // Value
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...color);
  doc.text(value, x + w / 2, y + h / 2 + 2, { align: 'center' });

  // Label
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(label.toUpperCase(), x + w / 2, y + h / 2 + 12, { align: 'center' });
}

export async function generateReportPDF(data: ReportData): Promise<Blob> {
  const [{ jsPDF }, autoTable] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable').then(m => m.default),
  ]);

  const doc = new jsPDF();
  const pageW = 210;
  const margin = 14;
  const contentW = pageW - margin * 2;

  // ═══════════════════════════════════════
  // HEADER — German flag gradient + logo
  // ═══════════════════════════════════════
  // Black stripe
  doc.setFillColor(...COLORS.germanBlack);
  doc.rect(0, 0, pageW, 14, 'F');
  // Red stripe
  doc.setFillColor(...COLORS.germanRed);
  doc.rect(0, 14, pageW, 14, 'F');
  // Gold stripe
  doc.setFillColor(...COLORS.germanGold);
  doc.rect(0, 28, pageW, 14, 'F');

  // Title overlay
  doc.setFillColor(0, 0, 0, 0.7);
  doc.rect(0, 0, pageW, 42, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.white);
  doc.text('LAPORAN PEMBELAJARAN', margin, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text('DeutschUp — Platform Belajar Bahasa Jerman', margin, 28);

  // Date (right-aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.germanGold);
  doc.text(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), pageW - margin, 20, { align: 'right' });

  let yPos = 52;

  // ═══════════════════════════════════════
  // PROFILE SECTION
  // ═══════════════════════════════════════
  doc.setFillColor(...COLORS.bgLight);
  drawRoundedRect(doc, margin, yPos, contentW, 28, 3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.textDark);
  doc.text(data.userName, margin + 6, yPos + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Level ${data.currentLevel} • Siswa DeutschUp`, margin + 6, yPos + 18);

  // Level badge
  doc.setFillColor(...COLORS.primary);
  drawRoundedRect(doc, pageW - margin - 28, yPos + 5, 24, 16, 2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.white);
  doc.text(data.currentLevel, pageW - margin - 16, yPos + 16, { align: 'center' });

  yPos += 36;

  // ═══════════════════════════════════════
  // STATS CARDS (4 cards in a row)
  // ═══════════════════════════════════════
  const cardW = (contentW - 9) / 4; // 3 gaps of 3px
  const cardH = 32;

  drawStatCard(doc, margin, yPos, cardW, cardH, 'Total XP', data.xp.toLocaleString(), COLORS.primary);
  drawStatCard(doc, margin + cardW + 3, yPos, cardW, cardH, 'Kosakata', data.vocabCount.toLocaleString(), COLORS.success);
  drawStatCard(doc, margin + (cardW + 3) * 2, yPos, cardW, cardH, 'Pelajaran', `${data.completedCount}/${data.totalLessons}`, COLORS.warning);
  drawStatCard(doc, margin + (cardW + 3) * 3, yPos, cardW, cardH, 'Progres', `${data.overallProgress}%`, COLORS.germanRed);

  yPos += cardH + 12;

  // ═══════════════════════════════════════
  // LEARNING SUMMARY
  // ═══════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textDark);
  doc.text('Ringkasan Belajar', margin, yPos);

  // Accent line
  doc.setFillColor(...COLORS.germanRed);
  doc.rect(margin, yPos + 2, 30, 1.5, 'F');

  yPos += 10;

  const summaryItems = [
    { label: 'Streak belajar', value: `${data.streak} hari berturut-turut` },
    { label: 'Waktu belajar', value: `${data.studyHours} jam` },
    { label: 'Rata-rata skor simulasi', value: `${data.averageScore}%` },
    { label: 'Kosakata dikuasai', value: `${data.vocabCount} kata` },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  for (const item of summaryItems) {
    doc.setTextColor(...COLORS.textMuted);
    doc.text(item.label, margin + 4, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.textDark);
    doc.text(item.value, margin + 60, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 6;
  }

  yPos += 8;

  // ═══════════════════════════════════════
  // LESSONS TABLE
  // ═══════════════════════════════════════
  if (yPos > 220) { doc.addPage(); yPos = 20; }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textDark);
  doc.text('Pelajaran & Kompetensi', margin, yPos);
  doc.setFillColor(...COLORS.primary);
  doc.rect(margin, yPos + 2, 30, 1.5, 'F');
  yPos += 8;

  const completedLessons = data.lessons.filter(l => l.completed);

  if (completedLessons.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('Belum ada pelajaran yang diselesaikan.', margin, yPos + 5);
    yPos += 15;
  } else {
    const tableBody = completedLessons.map((l, i) => {
      const goalsStr = l.goals.length > 0
        ? l.goals.slice(0, 2).join('; ') + (l.goals.length > 2 ? ` (+${l.goals.length - 2} lainnya)` : '')
        : '-';
      return [String(i + 1), l.level, l.title, goalsStr];
    });

    autoTable(doc, {
      startY: yPos + 2,
      head: [['No', 'Level', 'Pelajaran', 'Kompetensi yang Dicapai']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: { fillColor: COLORS.bgLight },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 50 },
        3: { cellWidth: 105 },
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        textColor: COLORS.textDark,
      },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ═══════════════════════════════════════
  // SIMULASI TABLE
  // ═══════════════════════════════════════
  if (yPos > 230) { doc.addPage(); yPos = 20; }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textDark);
  doc.text('Riwayat Simulasi Ujian', margin, yPos);
  doc.setFillColor(...COLORS.success);
  doc.rect(margin, yPos + 2, 30, 1.5, 'F');
  yPos += 8;

  if (data.mockTests.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('Belum ada riwayat simulasi ujian.', margin, yPos + 5);
  } else {
    const tableData = data.mockTests.map((t, i) => {
      const pct = Math.round((t.score / t.total) * 100);
      return [
        String(i + 1),
        new Date(t.createdAt).toLocaleDateString('id-ID'),
        t.level,
        `${t.score} / ${t.total}`,
        `${pct}%`,
      ];
    });

    autoTable(doc, {
      startY: yPos + 2,
      head: [['No', 'Tanggal', 'Level', 'Skor', 'Persentase']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.success,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: { fillColor: COLORS.bgLight },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: COLORS.textDark,
      },
    });
  }

  // ═══════════════════════════════════════
  // FOOTER (every page)
  // ═══════════════════════════════════════
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(...COLORS.border);
    doc.line(margin, 280, pageW - margin, 280);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`DeutschUp — Laporan Pembelajaran`, margin, 285);
    doc.text(`Halaman ${i} dari ${pageCount}`, pageW - margin, 285, { align: 'right' });
  }

  return doc.output('blob');
}
