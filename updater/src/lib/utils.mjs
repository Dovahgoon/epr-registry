export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export function normalizeName(s) {
  return s.trim().replace(/\s+/g,' ');
}
export function uniqueBy(arr, keyFn) {
  const m = new Map();
  for (const x of arr) {
    const k = keyFn(x);
    if (!m.has(k)) m.set(k, x);
  }
  return Array.from(m.values());
}
