// src/app/tools/packaging-fee/ui/Calculator.tsx
'use client';

import React, { useState } from "react";

type CountryOpt = { iso2: string; name: string };

// Placeholder material rates €/kg (example only). Adjust with real data.
const RATES: Record<string, Record<string, number>> = {
  DE: { paper: 0.24, plastic: 1.10, glass: 0.08, aluminum: 0.70, steel: 0.18, wood: 0.06 },
  FR: { paper: 0.22, plastic: 1.05, glass: 0.09, aluminum: 0.65, steel: 0.17, wood: 0.05 },
  IT: { paper: 0.21, plastic: 0.95, glass: 0.07, aluminum: 0.60, steel: 0.16, wood: 0.05 },
};

const MATERIALS = ["paper", "plastic", "glass", "aluminum", "steel", "wood"] as const;

export default function Calculator({ countries }: { countries: CountryOpt[] }) {
  const [iso, setIso] = useState<string>(countries[0]?.iso2 ?? "DE");
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(MATERIALS.map(m => [m, 0]))
  );
  const rates = RATES[iso] || RATES["DE"];

  const total = MATERIALS.reduce((sum, m) => sum + (weights[m] || 0) * (rates[m] || 0), 0);

  function setW(m: string, v: string) {
    const n = Number(v);
    setWeights(prev => ({ ...prev, [m]: isNaN(n) ? 0 : n }));
  }

  return (
    <div>
      <div className="hero">
        <div>
          <h1>Packaging Fee Calculator</h1>
          <p className="muted">Rough estimate. Use real PRO tariffs for accuracy.</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <label>
            <div className="subtle">Country</div>
            <select value={iso} onChange={e => setIso(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}>
              {countries.map(c => <option key={c.iso2} value={c.iso2}>{c.name} ({c.iso2})</option>)}
            </select>
          </label>
          <div>
            <div className="subtle">Rates €/kg</div>
            <div className="muted">paper {rates.paper ?? 0} · plastic {rates.plastic ?? 0} · glass {rates.glass ?? 0} · aluminum {rates.aluminum ?? 0} · steel {rates.steel ?? 0} · wood {rates.wood ?? 0}</div>
          </div>
        </div>

        <div className="section">
          <h2>Annual placed on market (kg)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {MATERIALS.map(m => (
              <label key={m} className="card" style={{ padding: 10 }}>
                <div className="subtle" style={{ marginBottom: 6 }}>{m}</div>
                <input type="number" min="0" step="0.01" value={weights[m]} onChange={e => setW(m, e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }} />
              </label>
            ))}
          </div>
        </div>

        <div className="section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="muted">Estimated fees (ex VAT). Informational only.</div>
          <div className="btn" aria-live="polite">€ {total.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
