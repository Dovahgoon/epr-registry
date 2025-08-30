// src/lib/fees.ts
// rates are normalized to EUR per kg for calc; keep original unit for display
export function normalizeRate(rate: number, unit: string): number {
  const u = (unit || '').toLowerCase();
  if (u === 'per_kg') return rate;
  if (u === 'per_tonne' || u === 'per_ton' || u === 'per_t') return rate / 1000;
  // per_unit etc. -> return NaN to signal special handling
  return NaN;
}

export type QtyUnit = 'kg' | 'tonnes' | 'units';

export function lineFeeEUR(
  qty: number,                // input quantity
  qtyUnit: QtyUnit,
  rate: number,
  rateUnit: string
): number {
  const perKg = normalizeRate(rate, rateUnit);
  if (Number.isNaN(perKg)) {
    // unit-based (per_unit)
    if (qtyUnit !== 'units') return NaN; // force user to set correct unit
    return rate * qty;
  }
  const kg = qtyUnit === 'kg' ? qty : qtyUnit === 'tonnes' ? qty * 1000 : NaN;
  if (Number.isNaN(kg)) return NaN;
  return perKg * kg;
}
