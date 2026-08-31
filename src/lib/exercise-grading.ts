// Deterministic grading for the non-AI exercise types. Pure functions —
// same input → same verdict, no network. Essay grading stays server-side
// (/api/ai?action=check-answer).
// German normalization mirrors useSearch.normalizeGerman semantics:
// umlauts folded (ä→ae…), ß→ss, lowercase, whitespace collapsed,
// trailing sentence punctuation stripped.

export function normalizeGerman(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, ' ')
    .replace(/[.!?;:,]+$/, '')
    .trim();
}

export function gradeChoice(selected: string, options: string[], correctAnswer: number): boolean {
  return selected === options[correctAnswer];
}

/** Exact match against any accepted variant, after German normalization.
 * Case-insensitive, umlaut-folding, trailing punctuation ignored. */
export function gradeTextAnswer(userAnswer: string, accepted: string[]): boolean {
  const u = normalizeGerman(userAnswer);
  if (!u) return false;
  return accepted.some(a => normalizeGerman(a) === u);
}

/** Every left item must be paired with the normalized-correct right item.
 * Extra/missing pairs fail. */
export function gradeMatching(
  userPairs: Array<[string, string]>,
  correctPairs: Array<[string, string]>,
): boolean {
  if (userPairs.length !== correctPairs.length) return false;
  const rightByLeft = new Map(correctPairs.map(([l, r]) => [normalizeGerman(l), normalizeGerman(r)]));
  return userPairs.every(([l, r]) => rightByLeft.get(normalizeGerman(l)) === normalizeGerman(r));
}

/** Human-readable answer key for the verdict panel. */
export function matchingAnswerKey(pairs: Array<[string, string]>): string {
  return pairs.map(([l, r]) => `${l} → ${r}`).join('   ·   ');
}
