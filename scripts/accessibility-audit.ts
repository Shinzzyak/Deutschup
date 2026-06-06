/**
 * DeutschUp Accessibility & UX Audit
 * Run: npx tsx scripts/accessibility-audit.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '../src');

interface AuditResult {
  file: string;
  line?: number;
  issue: string;
  severity: 'error' | 'warning' | 'info';
  fix: string;
}

const results: AuditResult[] = [];

function addResult(file: string, issue: string, severity: AuditResult['severity'], fix: string, line?: number) {
  results.push({ file: path.relative(SRC_DIR, file), line, issue, severity, fix });
}

// Check files
const files = fs.readdirSync(SRC_DIR, { recursive: true, encoding: 'utf-8' })
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
  .map(f => path.join(SRC_DIR, f));

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // 1. Check for images without alt
    const imgMatches = line.match(/<img[^>]+>/g);
    if (imgMatches) {
      for (const img of imgMatches) {
        if (!img.includes('alt=')) {
          addResult(file, `Image tanpa atribut alt`, 'error', 'Tambahkan alt text deskriptif', lineNum);
        } else if (img.includes('alt=""') || img.includes("alt=''")) {
          addResult(file, `Image dengan alt kosong`, 'warning', 'Isi alt text meskipun dekoratif (alt="[dekoratif]")', lineNum);
        }
      }
    }

    // 2. Check for buttons without accessible name
    const btnMatches = line.match(/<button[^>]*>/g);
    if (btnMatches) {
      for (const btn of btnMatches) {
        if (!btn.includes('aria-label') && !btn.includes('title=')) {
          // Check if next content has text (check next 10 lines)
          const nextLines = lines.slice(i, i + 10).join(' ');
          if (!nextLines.match(/>[^<]+</)) {
            addResult(file, `Button tanpa accessible name`, 'error', 'Tambahkan aria-label atau text content', lineNum);
          }
        }
      }
    }

    // 3. Check for links without accessible name
    const linkMatches = line.match(/<a[^>]*>/g);
    if (linkMatches) {
      for (const link of linkMatches) {
        if (!link.includes('aria-label') && !link.includes('title=')) {
          const nextLines = lines.slice(i, i + 10).join(' ');
          if (!nextLines.match(/>[^<]+</)) {
            addResult(file, `Link tanpa accessible name`, 'error', 'Tambahkan aria-label atau text content', lineNum);
          }
        }
      }
    }

    // 3b. Check for <Link> (react-router) without accessible name
    const reactLinkMatches = line.match(/<Link[^>]*>/g);
    if (reactLinkMatches) {
      for (const link of reactLinkMatches) {
        if (!link.includes('aria-label') && !link.includes('title=')) {
          const nextLines = lines.slice(i, i + 10).join(' ');
          if (!nextLines.match(/>[^<]+</)) {
            // Skip false positives from JS code containing <Link as string
            const rawLine = line.trim();
            if (!rawLine.startsWith('const ') && !rawLine.startsWith('return ') && !rawLine.startsWith('//')) {
              addResult(file, `Link tanpa accessible name`, 'error', 'Tambahkan aria-label atau text content', lineNum);
            }
          }
        }
      }
    }

    // 4. Check for focus:outline-none without focus-visible
    if (line.includes('focus:outline-none') && !line.includes('focus:ring') && !line.includes('focus-visible:')) {
      addResult(file, `focus:outline-none tanpa replacement focus style`, 'warning', 'Gunakan focus-visible:ring-2 atau focus:ring-2 sebagai pengganti', lineNum);
    }

    // 5. Check for color contrast (basic check - bg-[color]-[shade] patterns)
    const contrastIssues = [
      { pattern: /text-slate-\d{3}/, bg: 'white', note: 'Periksa kontras manual' },
    ];

    // 6. Check for missing lang attribute on html
    if (file.endsWith('index.html') && !content.includes('lang="id"') && !content.includes("lang='id'")) {
      addResult(file, `html tag tanpa lang="id"`, 'error', 'Tambahkan lang="id" pada tag <html>', lineNum);
    }

    // 7. Check for tap target size (buttons/links < 44px)
    const sizePatterns = [
      { pattern: /w-\d+\s+h-\d+/, minPx: 44 },
    ];

    // 8. Check for semantic landmarks
    if (file.includes('App.tsx') || file.includes('Layout')) {
      if (!content.includes('<header') && content.includes('jsx')) {
        addResult(file, `Tidak ada <header> landmark`, 'warning', 'Bungkus header dengan <header>', lineNum);
      }
      if (!content.includes('<footer') && content.includes('jsx')) {
        addResult(file, `Tidak ada <footer> landmark`, 'warning', 'Bungkus footer dengan <footer>', lineNum);
      }
      if (!content.includes('<main') && content.includes('jsx')) {
        addResult(file, `Tidak ada <main> landmark`, 'warning', 'Bungkus konten utama dengan <main>', lineNum);
      }
    }

    // 9. Check for heading hierarchy
    const headingMatch = line.match(/<h(\d)[^>]*>/);
    if (headingMatch) {
      const level = parseInt(headingMatch[1]);
      // Check if previous heading was more than 1 level higher
      const prevHeading = content.slice(0, content.indexOf(line)).match(/<h(\d)[^>]*>/g);
      if (prevHeading && prevHeading.length > 0) {
        const prevLevel = parseInt(prevHeading[prevHeading.length - 1].match(/<h(\d)/)![1]);
        if (level - prevLevel > 1) {
          addResult(file, `Heading hierarchy skip: h${prevLevel} → h${level}`, 'warning', `Gunakan h${prevLevel + 1} sebagai ganti`, lineNum);
        }
      }
    }

    // 10. Check for aria-expanded on mobile menu toggles
    if (line.includes('onClick') && (line.includes('menu') || line.includes('toggle') || line.includes('sidebar'))) {
      if (!content.includes('aria-expanded')) {
        addResult(file, `Menu toggle tanpa aria-expanded`, 'warning', 'Tambahkan aria-expanded={isOpen} pada menu toggle', lineNum);
      }
    }
  }
}

// Print results
console.log('\n🔍 DeutschUp Accessibility & UX Audit\n');
console.log('='.repeat(60));

const errors = results.filter(r => r.severity === 'error');
const warnings = results.filter(r => r.severity === 'warning');
const infos = results.filter(r => r.severity === 'info');

if (errors.length > 0) {
  console.log(`\n❌ ERRORS (${errors.length})\n`);
  for (const r of errors) {
    console.log(`  [${r.file}:${r.line}] ${r.issue}`);
    console.log(`    Fix: ${r.fix}\n`);
  }
}

if (warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${warnings.length})\n`);
  for (const r of warnings) {
    console.log(`  [${r.file}:${r.line}] ${r.issue}`);
    console.log(`    Fix: ${r.fix}\n`);
  }
}

if (infos.length > 0) {
  console.log(`\n💡 INFO (${infos.length})\n`);
  for (const r of infos) {
    console.log(`  [${r.file}:${r.line}] ${r.issue}`);
    console.log(`    Fix: ${r.fix}\n`);
  }
}

console.log('='.repeat(60));
console.log(`\n📊 Summary: ${errors.length} errors, ${warnings.length} warnings, ${infos.length} info\n`);

// Specific checks
console.log('\n📋 Manual Checklist:\n');
console.log('  [ ] Kontras warna WCAG AA (4.5:1 normal text, 3:1 large text)');
console.log('  [ ] Semua interactive elements bisa diakses dengan keyboard');
console.log('  [ ] Focus order logis (tab顺序)');
console.log('  [ ] Screen reader test dengan NVDA/VoiceOver');
console.log('  [ ] Mobile tap target ≥ 44x44px');
console.log('  [ ] Tidak ada color-only information');
console.log('  [ ] Form inputs memiliki label eksplisit');
console.log('  [ ] Error messages terkait dengan input');
console.log('  [ ] Animations bisa dihentikan (prefers-reduced-motion)');
console.log('  [ ] Skip navigation link untuk keyboard users');
