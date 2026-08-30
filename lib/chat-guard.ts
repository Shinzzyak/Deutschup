// ============================================================
// Chat topical guard for Herr Deutsch (server-side)
// ============================================================
// Pure helpers, no I/O — safe to unit test. api/ai.ts enforces these on
// every chat turn; they never run client-side, so the browser cannot
// bypass them. Layers:
//   1. hardened CHAT_SYSTEM prompt (api/ai.ts) — model-level defense
//   2. checkChatInput — rejects explicit redirect/jailbreak attempts
//   3. sanitizeHistory — history is UNTRUSTED client input; fake "model
//      agreed" turns and override phrases are dropped per-turn

export const MAX_CHAT_MESSAGE = 1000;
export const MAX_HISTORY_TURNS = 6;
export const MAX_HISTORY_TEXT = 1500;

export const GUARD_REJECT_MESSAGE =
  'Herr Deutsch di sini khusus buat bantu kamu belajar bahasa Jerman — kosakata, tata bahasa, pelafalan, atau contoh kalimat. Coba tanya hal-hal seputar bahasa Jerman, ya!';

// High-precision patterns only: explicit attempts to break the tutor's role.
// Gray-zone off-topic chat is left to the hardened system prompt — a wider
// regex here would bounce legitimate questions (e.g. asking how to translate
// "act as if" into German).
const REDIRECT_PATTERNS: RegExp[] = [
  // English override classics
  /ignore\s+(all\s+)?(previous|prior|above|earlier|any)\s+instructions?/i,
  /disregard\s+(all\s+)?(previous|prior|above|earlier|any)?\s*instructions?/i,
  /\b(system\s+prompt|system\s+instruction)\b/i,
  /you\s+are\s+now\b/i,
  /(act|behave)\s+(as|like)\s+(a|an|the|my|your)\s+\w+/i,
  /(developer|god)\s*mode|\bjailbreak\b|\bDAN\s+mode\b/i,
  /\bbreak\s+character\b/i,
  // Indonesian variants
  /abaikan\s+(semua\s+)?(instruksi|perintah|aturan)/i,
  /lupakan\s+(semua\s+)?(instruksi|perintah|aturan|konteks)/i,
  /(prompt|instruksi|aturan)\s+sistem/i,
  /(sekarang|dari\s+sekarang)\s+kamu\s+(adalah|akan|berperan)/i,
  /berpura-puralah\s+(menjadi|sebagai)|berperanlah\s+sebagai|berperan\s+sebagai/i,
  /keluar\s+dari\s+(peran|karakter)/i,
  /\bbypass\s+(sistem|sistemnya|guard)/i,
];

function normalizeForMatch(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function findRedirectAttempt(text: string): boolean {
  if (typeof text !== 'string' || !text) return false;
  const t = normalizeForMatch(text);
  return REDIRECT_PATTERNS.some((re) => re.test(t));
}

// Flat shape on purpose: this repo's tsconfig has no `strict`, so a
// discriminated union ({ok:true}|{ok:false}) does NOT narrow on `!check.ok`
// and `check.reason` fails to type-check at the call site. Keeping every
// field always present (text='' / reason=null on the unused side) needs no
// narrowing at all. ponytail: swap to a real discriminated union if `strict`
// is ever enabled repo-wide.
export interface ChatInputCheck {
  ok: boolean;
  text: string;
  reason: 'empty' | 'too_long' | 'redirect' | null;
}

/** Validate + normalize a chat turn coming from the client. */
export function checkChatInput(message: unknown): ChatInputCheck {
  if (typeof message !== 'string') return { ok: false, text: '', reason: 'empty' };
  const text = message.trim();
  if (!text) return { ok: false, text: '', reason: 'empty' };
  if (text.length > MAX_CHAT_MESSAGE) return { ok: false, text: '', reason: 'too_long' };
  if (findRedirectAttempt(text)) return { ok: false, text: '', reason: 'redirect' };
  return { ok: true, text, reason: null };
}

export interface SanitizedTurn {
  role: 'user' | 'model';
  text: string;
}

/**
 * History is client-controlled: roles are coerced, texts are truncated,
 * empty turns dropped, and turns carrying override phrases are removed so
 * a crafted fake "model" turn cannot smuggle a role change into context.
 */
export function sanitizeHistory(raw: unknown): SanitizedTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(-MAX_HISTORY_TURNS)
    .map((h: any): SanitizedTurn => ({
      role: h && h.role === 'model' ? 'model' : 'user',
      text: typeof h?.text === 'string' ? h.text.slice(0, MAX_HISTORY_TEXT).trim() : '',
    }))
    .filter((h) => h.text.length > 0 && !findRedirectAttempt(h.text));
}

/** Only real CEFR levels may reach the system prompt — anything else is 'A1'. */
export function sanitizeLevel(level: unknown): string {
  if (typeof level !== 'string') return 'A1';
  const t = level.trim().toUpperCase();
  return /^(A1|A2|B1|B2|C1|C2)$/.test(t) ? t : 'A1';
}
