interface GuardrailRule {
  pattern: RegExp;
  message: string;
}

const RULES: GuardrailRule[] = [
  { pattern: /—/, message: 'Em dash — use a comma or rewrite the sentence' },
  { pattern: /!/, message: 'Exclamation mark — ShopOS copy doesn\'t perform enthusiasm' },
  { pattern: /seamlessly/i, message: '"seamlessly" is a banned phrase' },
  { pattern: /game[- ]changing/i, message: '"game-changing" is a banned phrase' },
  { pattern: /leverage/i, message: '"leverage" — try "use" or be more specific' },
  { pattern: /revolutionary/i, message: '"revolutionary" is a banned phrase' },
  { pattern: /innovative/i, message: '"innovative" is a banned phrase' },
  { pattern: /cutting[- ]edge/i, message: '"cutting-edge" is a banned phrase' },
  { pattern: /powerful/i, message: '"powerful" — try something more specific' },
  { pattern: /world[- ]class/i, message: '"world-class" is a banned phrase' },
  { pattern: /best[- ]in[- ]class/i, message: '"best-in-class" is a banned phrase' },
];

export function checkGuardrails(text: string): string[] {
  if (!text.trim()) return [];
  return RULES
    .filter(rule => rule.pattern.test(text))
    .map(rule => rule.message);
}

export function subjectLineHints(text: string): string[] {
  const hints: string[] = [];
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length > 0 && words.length < 3) hints.push('Aim for 3–6 words');
  if (words.length > 6) hints.push('Consider shortening — 3–6 words is the sweet spot');
  if (text !== text.toLowerCase()) hints.push('ShopOS subject lines are lowercase');
  return hints;
}

export function wordCountWarning(text: string): string | null {
  const count = text.trim().split(/\s+/).filter(Boolean).length;
  if (count > 40) return `${count} words — consider splitting this into two shorter paragraphs`;
  return null;
}
