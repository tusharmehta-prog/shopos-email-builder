import type { LoopsContactProperty } from '../types';

const LOOPS_KEY = 'shopos-loops-api-key';
const LOOPS_PROPS_KEY = 'shopos-loops-props';

export function getStoredApiKey(): string {
  return localStorage.getItem(LOOPS_KEY) || '';
}

export function saveApiKey(key: string): void {
  localStorage.setItem(LOOPS_KEY, key);
}

export function clearApiKey(): void {
  localStorage.removeItem(LOOPS_KEY);
  localStorage.removeItem(LOOPS_PROPS_KEY);
}

export function getStoredProperties(): LoopsContactProperty[] | null {
  const raw = localStorage.getItem(LOOPS_PROPS_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function fetchContactProperties(apiKey: string): Promise<LoopsContactProperty[]> {
  const res = await fetch('https://api.loops.so/v1/contacts/customFields', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Loops API error ${res.status}: ${await res.text()}`);
  const data = await res.json() as Array<{ key: string; label: string }>;

  // Merge built-in Loops properties with custom ones
  const builtIn: LoopsContactProperty[] = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'userId', label: 'User ID' },
  ];

  const custom = data.map(f => ({ key: f.key, label: f.label }));
  const merged = [
    ...builtIn,
    ...custom.filter(c => !builtIn.find(b => b.key === c.key)),
  ];

  localStorage.setItem(LOOPS_PROPS_KEY, JSON.stringify(merged));
  return merged;
}

// Default properties shown when not connected to Loops
export const DEFAULT_MERGE_PROPS: LoopsContactProperty[] = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'userId', label: 'User ID' },
  { key: 'unsubscribeLink', label: 'Unsubscribe Link' },
];
