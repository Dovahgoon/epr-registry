'use client';
import React from 'react';

/** ==== Tariffs schema (from tariffs-2025.json) ==== */
type PlasticSub = { code: string; label: string; rate: number };
type Scheme = {
  id: string;
  name: string;
  effectiveFrom: string;
  sourceUrl?: string;
  materials?: Record<string, number>;
  plastic?: { label?: string; subMaterials?: PlasticSub[] };
};
type CountryTariffs = { name: string; schemes: Scheme[] };
type TariffsDoc = {
  version: number;
  year: string | number;
  currency: string; // e.g. 'EUR/kg'
  countries: Record<string, CountryTariffs>;
};

/** ==== Config ==== */
const ENV_URL = process.env.NEXT_PUBLIC_TARIFFS_URL as string | undefined;
const FALLBACK_URL = '/data/tariffs-2025.json';

/** ==== Fetch ==== */
async function fetchTariffs(): Promise<TariffsDoc | null> {
  const tryUrls = [ENV_URL, FALLBACK_URL].filter(Boolean) as string[];
  for (const url of tryUrls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const json = await res.json();
      if (json && json.countries) return json as TariffsDoc;
    } catch {}
  }
  return null;
}

/** ==== Helpers ==== */
function prettify(materialCode: string): string {
  return materialCode.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}
type FlatRate = { label: string; rate: number; unitRate: 'kg' | 'tonne' | 'unit' };

/** format plain number like 0.04 -> 0.04, 0.200000 -> 0.2 */
function fmtRate(n: number) {
  const s = n.toFixed(6);
  return s.replace(/\.0+$/,'').replace(/(\.\d*?[1-9])0+$/,'$1');
}

/** If a scheme provides subMaterials with identical labels (e.g., many "Plastic"),
 *  append a hint so users can distinguish them (e.g., "Plastic — €0.04/kg"). */
function normalizePlasticSubs(subs: PlasticSub[] | undefined): PlasticSub[] {
  if (!subs || subs.length === 0) return [];
  const lcCount: Record<string, number> = {};
  for (const sm of subs) {
    const key = (sm.label || sm.code || '').toLowerCase();
    lcCount[key] = (lcCount[key] || 0) + 1;
  }
  return subs.map(sm => {
    const base = sm.label || prettify(sm.code || 'Plastic') || 'Plastic';
    const sameLabel = lcCount[(base || '').toLowerCase()] > 1;
    return {
      ...sm,
      label: sameLabel ? `${base} — €${fmtRate(sm.rate)}/kg` : base,
    };
  });
}

function flattenRates(s: Scheme): FlatRate[] {
  const out: FlatRate[] = [];
  if (s.materials) {
    for (const [code, val] of Object.entries(s.materials)) {
      if (typeof val === 'number') out.push({ label: prettify(code), rate: val, unitRate: 'kg' });
    }
  }
  const subs = normalizePlasticSubs(s.plastic?.subMaterials);
  for (const sm of subs) {
    const label = sm.label || prettify(sm.code) || 'Plastic';
    out.push({ label, rate: sm.rate, unitRate: 'kg' });
  }
  // De-duplicate (same label+rate)
  const dedup = new Map<string, FlatRate>();
  for (const r of out) {
    const key = `${r.label}::${r.rate}::${r.unitRate}`;
    if (!dedup.has(key)) dedup.set(key, r);
  }
  return Array.from(dedup.values()).sort((a,b)=>a.label.localeCompare(b.label));
}

export default function FeeCalculatorPage() {
  const [doc, setDoc] = React.useState<TariffsDoc | null>(null);
  const [countryIso, setCountryIso] = React.useState('');
  const [schemeIdx, setSchemeIdx] = React.useState<number | ''>('');
  const [inputUnit, setInputUnit] = React.useState<'kg' | 'tonnes' | 'units'>('kg');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [fees, setFees] = React.useState<Record<string, number>>({});

  React.useEffect(() => { (async () => setDoc(await fetchTariffs()))(); }, []);

  const countryCodes = React.useMemo(() => doc ? Object.keys(doc.countries || {}).sort() : [], [doc]);
  const schemes = React.useMemo(() => {
    if (!doc || !countryIso) return [] as Scheme[];
    const c = doc.countries[countryIso];
    return c?.schemes || [];
  }, [doc, countryIso]);

  const pool = React.useMemo(() => {
    if (!doc || schemeIdx === '' || !countryIso) return [] as FlatRate[];
    const scheme = schemes[schemeIdx as number];
    if (!scheme) return [];
    return flattenRates(scheme);
  }, [doc, countryIso, schemeIdx, schemes]);

  const rows = React.useMemo(() => {
    if (!pool.length) return [] as FlatRate[];
    if (selected.length === 0) return [] as FlatRate[];
    const set = new Set(selected);
    return pool.filter(r => set.has(r.label));
  }, [pool, selected]);

  React.useEffect(() => { setSelected([]); setFees({}); }, [schemeIdx, countryIso]);

  function addMaterial(label: string) { setSelected(prev => prev.includes(label) ? prev : [...prev, label]); }
  function removeMaterial(label: string) { setSelected(prev => prev.filter(x => x !== label)); setFees(prev => { const { [label]:_, ...rest } = prev; return rest; }); }
  function addAll() { setSelected(pool.map(p => p.label)); }
  function clearAll() { setSelected([]); setFees({}); }

  const total = Object.values(fees).reduce((a,b)=>a+b,0);

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-violet-50 via-fuchsia-50 to-white text-slate-800">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-700 via-fuchsia-600 to-sky-600">Fee Calculator</span>
        </h1>
        <p className="mt-2 text-slate-600">Estimate EPR fees from placed-on-market volumes. Pulls live tariffs when available.</p>

        {/* selectors */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-slate-700 mb-2">Country</label>
            <select className="w-full rounded-2xl bg-white border border-slate-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={countryIso} onChange={e => { setCountryIso(e.target.value); setSchemeIdx(''); }}>
              <option value="">—</option>
              {countryCodes.map(iso => (
                <option key={iso} value={iso}>
                  {iso} — {doc?.countries[iso]?.name || ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-2">Scheme / PRO</label>
            <select className="w-full rounded-2xl bg-white border border-slate-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={schemeIdx === '' ? '' : String(schemeIdx)} onChange={e => setSchemeIdx(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={!countryIso}>
              <option value="">—</option>
              {schemes.map((s, i) => (
                <option key={s.id} value={i}>
                  {s.name} — eff. {s.effectiveFrom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-2">Input unit</label>
            <div className="flex gap-2">
              {(['kg','tonnes','units'] as const).map(u => (
                <button key={u} onClick={() => setInputUnit(u)}
                  className={`px-4 py-2 rounded-full border ${inputUnit===u ? 'border-violet-400 bg-violet-100 shadow' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
                  {u}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">We convert tonnes → kg internally. For per‑unit rates choose “units”.</p>
          </div>
        </div>

        {/* material picker */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow">
          <div className="flex flex-wrap items-center gap-3">
            <div className="font-medium text-slate-700">Materials</div>
            <div className="flex gap-2">
              <select
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm min-w-[240px]"
                disabled={!pool.length}
                onChange={(e) => { if (e.target.value) { addMaterial(e.target.value); e.currentTarget.selectedIndex = 0; } }}
              >
                <option value="">{pool.length ? 'Add material…' : 'Select country & scheme first'}</option>
                {pool.map((p) => (
                  <option key={p.label + p.rate} value={p.label}>{p.label}</option>
                ))}
              </select>
              <button className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 hover:bg-slate-50" onClick={addAll} disabled={!pool.length}>Add all</button>
              <button className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 hover:bg-slate-50" onClick={clearAll} disabled={!selected.length}>Clear</button>
            </div>
          </div>
          {selected.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {selected.map((s) => (
                <span key={s} className="inline-flex items-center gap-2 rounded-full bg-violet-100 text-violet-800 px-3 py-1 border border-violet-200">
                  {s}
                  <button className="text-xs hover:underline" onClick={() => removeMaterial(s)}>remove</button>
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-sm text-slate-500">Pick the materials you want to calculate fees for.</div>
          )}
        </div>

        {/* table */}
        <div className="mt-4 rounded-3xl bg-white/90 border border-slate-200 shadow-xl shadow-violet-200 ring-1 ring-white/60 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">{doc ? `Currency: ${doc.currency}` : ''}</div>
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 hover:bg-slate-50"
                onClick={() => { setCountryIso(''); setSchemeIdx(''); setInputUnit('kg'); clearAll(); }}>
                Reset
              </button>
              <button className="px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500"
                onClick={() => {
                  if (!rows.length) return;
                  const csvRows = [['Material','Rate (EUR)','Rate Unit'], ...rows.map(r => [r.label, String(r.rate), r.unitRate])];
                  const csv = csvRows.map(r => r.join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = `tariffs_${countryIso || '_'}.csv`; a.click();
                }}>
                Download CSV
              </button>
            </div>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-slate-800">
              <thead className="text-sm text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Material</th>
                  <th className="py-2 pr-4">Rate (EUR)</th>
                  <th className="py-2 pr-4">Rate Unit</th>
                  <th className="py-2 pr-4">{`Volume (${inputUnit})`}</th>
                  <th className="py-2">Fee (EUR)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {rows.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-slate-500">Add materials from the picker above.</td></tr>
                ) : rows.map((r, i) => (
                  <Row key={i} label={r.label} rate={r.rate} unitRate={r.unitRate} inputUnit={inputUnit}
                       onFeeChange={(label, value) => setFees(prev => ({ ...prev, [label]: value }))}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* total footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-white via-violet-50 to-white text-right">
            <span className="text-base font-semibold text-slate-700">Total: </span>
            <span className="text-xl font-extrabold text-violet-700">€{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function toKg(value: number, from: 'kg'|'tonnes'|'units'): number {
  if (from === 'kg') return value;
  if (from === 'tonnes') return value * 1000;
  return 0; // cannot convert 'units' to kg
}

function Row({ label, rate, unitRate, inputUnit, onFeeChange }:{ label:string; rate:number; unitRate:'kg'|'tonne'|'unit'; inputUnit:'kg'|'tonnes'|'units'; onFeeChange:(label:string,value:number)=>void }) {
  const [qty, setQty] = React.useState(0);

  let qtyForCalc = qty;
  if (unitRate === 'kg') qtyForCalc = toKg(qty, inputUnit);
  else if (unitRate === 'tonne') qtyForCalc = (inputUnit === 'kg' ? qty/1000 : (inputUnit === 'tonnes' ? qty : 0));
  else if (unitRate === 'unit') qtyForCalc = (inputUnit === 'units' ? qty : 0);
  const fee = qtyForCalc * rate;

  React.useEffect(() => { onFeeChange(label, Number.isFinite(fee) ? fee : 0); }, [label, fee, onFeeChange]);

  return (
    <tr className="border-t border-slate-200">
      <td className="py-2 pr-4">{label}</td>
      <td className="py-2 pr-4">{rate}</td>
      <td className="py-2 pr-4">{unitRate}</td>
      <td className="py-2 pr-4">
        <input type="number" min={0} step="any" className="w-28 rounded-xl bg-white border border-slate-300 px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-violet-500"
               onChange={e => setQty(parseFloat(e.target.value || '0'))} />
      </td>
      <td className="py-2">{Number.isFinite(fee) ? fee.toFixed(2) : '0.00'}</td>
    </tr>
  );
}
