'use client';
import React, { useEffect, useMemo, useState } from 'react';

/** Types kept minimal to avoid TSX parsing quirks */
type Scope = 'household' | 'commercial' | 'both' | 'unknown';
type Pro = { name: string; url?: string | null; scope?: Scope | null };
type Regulator = { name: string; url?: string | null };
type ItemRow = { country: string; pros?: Pro[]; regulators?: Regulator[]; updatedAt?: string };
type RegistryItems = { ok?: boolean; year?: string; items: ItemRow[]; generatedAt?: string };

type Scheme = { id: string; name: string; effectiveFrom?: string; materials?: Record<string, number> };
type CountryTariffs = { name: string; schemes: Scheme[] };
type TariffsDoc = { countries: Record<string, CountryTariffs> };

/** Constants */
const REGISTRY_API = '/api/registry';
const LOCAL_REGISTRY = '/data/registry.json';
const TARIFFS_URL = (process.env.NEXT_PUBLIC_TARIFFS_URL as string) || '/api/tariffs';
const LOCAL_TARIFFS = '/data/tariffs-2025.json';

/** Fetchers with fallback */
async function fetchRegistryItems(): Promise<RegistryItems> {
  try {
    const r = await fetch(REGISTRY_API, { cache: 'no-store' });
    if (r.ok) return await r.json();
  } catch {}
  try {
    const r2 = await fetch(LOCAL_REGISTRY, { cache: 'no-store' });
    if (r2.ok) return await r2.json();
  } catch {}
  const envUrl = (process.env.NEXT_PUBLIC_REGISTRY_URL as string) || (process.env.REGISTRY_URL as string) || '';
  if (envUrl) {
    try {
      const r3 = await fetch(envUrl, { cache: 'no-store' as RequestCache });
      if (r3.ok) return await r3.json();
    } catch {}
  }
  return { ok: false, items: [] };
}

async function fetchTariffs(): Promise<TariffsDoc | null> {
  try {
    const r = await fetch(TARIFFS_URL, { cache: 'no-store' });
    if (r.ok) {
      const j = await r.json();
      if (j && j.countries) return j as TariffsDoc;
    }
  } catch {}
  try {
    const r2 = await fetch(LOCAL_TARIFFS, { cache: 'no-store' });
    if (r2.ok) {
      const j2 = await r2.json();
      if (j2 && j2.countries) return j2 as TariffsDoc;
    }
  } catch {}
  return null;
}

/** Helpers */
function unionMaterials(ctry?: CountryTariffs): string[] {
  const set = new Set<string>();
  if (!ctry) return [];
  for (const s of (ctry.schemes || [])) {
    if (s.materials) {
      for (const m of Object.keys(s.materials)) set.add(m.replace(/_/g, ' '));
    }
  }
  return Array.from(set).sort((a,b)=>a.localeCompare(b));
}

function buildProMaterials(ctry?: CountryTariffs): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  if (!ctry) return map;
  for (const s of (ctry.schemes || [])) {
    const key = (s.name || '').trim();
    if (!key) continue;
    const set = map.get(key) || new Set<string>();
    for (const m of Object.keys(s.materials || {})) set.add(m.replace(/_/g, ' '));
    map.set(key, set);
  }
  return map;
}

function badgeClass(scope?: Scope | null): string {
  const x = scope || 'unknown';
  if (x === 'household') return 'ml-auto px-2 py-0.5 rounded-full text-xs border bg-emerald-100 text-emerald-800 border-emerald-200';
  if (x === 'commercial') return 'ml-auto px-2 py-0.5 rounded-full text-xs border bg-blue-100 text-blue-800 border-blue-200';
  if (x === 'both') return 'ml-auto px-2 py-0.5 rounded-full text-xs border bg-violet-100 text-violet-800 border-violet-200';
  return 'ml-auto px-2 py-0.5 rounded-full text-xs border bg-slate-100 text-slate-600 border-slate-200';
}

/** Component */
export default function CountryClient({ iso }: { iso: string }) {
  const [data, setData] = useState<RegistryItems | null>(null);
  const [tariffs, setTariffs] = useState<TariffsDoc | null>(null);
  const [query, setQuery] = useState('');
  const [scopes, setScopes] = useState<Scope[]>(['household','commercial','both','unknown']);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  useEffect(() => { (async () => setData(await fetchRegistryItems()))(); }, []);
  useEffect(() => { (async () => setTariffs(await fetchTariffs()))(); }, []);

  const row = useMemo(() => (data?.items || []).find(r => (r.country || '').toUpperCase() === iso), [data, iso]);
  const tariffsForIso = tariffs?.countries?.[iso];
  const matsAll = useMemo(() => unionMaterials(tariffsForIso), [tariffsForIso]);
  const proMats = useMemo(() => buildProMaterials(tariffsForIso), [tariffsForIso]);

  const scopeOptions: Scope[] = ['household','commercial','both','unknown'];

  // De-duplicate PROs and regulators by name+url
  const prosRaw = (row?.pros || []);
  const prosDedup = useMemo(() => {
    const seen = new Set<string>();
    const out: Pro[] = [];
    for (const p of prosRaw) {
      const key = `${(p.name||'').trim().toLowerCase()}|${(p.url||'')}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...p, scope: (p.scope || 'unknown') as Scope });
    }
    return out;
  }, [prosRaw]);

  const pros = useMemo(() => {
    const list = prosDedup;
    const q = query.trim().toLowerCase();
    return list
      .filter(p => (q ? (p.name || '').toLowerCase().includes(q) : true))
      .filter(p => scopes.includes((p.scope || 'unknown') as Scope))
      .filter(p => {
        if (selectedMaterials.length === 0) return true;
        const set = proMats.get(p.name) || new Set<string>();
        return selectedMaterials.some(m => set.has(m));
      });
  }, [prosDedup, query, scopes, selectedMaterials, proMats]);

  const regulators = useMemo(() => {
    const list = (row?.regulators || []);
    const seen = new Set<string>();
    const out: Regulator[] = [];
    for (const r of list) {
      const key = `${(r.name||'').trim().toLowerCase()}|${(r.url||'')}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }
    return out;
  }, [row]);

  return (
    <div className="max-w-5xl mx-auto py-2">
      <section>
        <h2 className="text-2xl font-semibold">Materials</h2>
        {matsAll.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {matsAll.map((m) => {
              const active = selectedMaterials.includes(m);
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMaterials(s => active ? s.filter(x => x !== m) : [...s, m])}
                  className={`px-3 py-1.5 rounded-full border ${active ? 'bg-violet-50 border-violet-200 text-violet-800' : 'bg-white border-slate-200 text-slate-700'} shadow-sm`}
                  title={m}
                >
                  {m}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No materials listed for this country yet.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold">PROs</h2>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-slate-500">Results: {pros.length}</span>
          <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-50" onClick={() => setQuery('')}>Clear</button>
          <input
            className="px-3 py-1.5 rounded-xl border border-slate-200 outline-none focus:ring focus:ring-violet-200"
            placeholder="Search PRO name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {scopeOptions.map((s) => {
            const on = scopes.includes(s);
            return (
              <button
                key={s}
                className={`px-3 py-1.5 rounded-full border ${on ? 'bg-violet-50 border-violet-200 text-violet-800' : 'bg-white border-slate-200 text-slate-700'}`}
                onClick={() => setScopes(prev => on ? prev.filter(x => x !== s) : [...prev, s])}
              >
                {s}
              </button>
            );
          })}
        </div>

        {pros.length > 0 ? (
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {pros.map((p, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-3">
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noreferrer" className="font-medium text-slate-900 hover:underline">{p.name}</a>
                ) : (
                  <span className="font-medium text-slate-900">{p.name}</span>
                )}
                <span className={badgeClass(p.scope)}>{p.scope || 'unknown'}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No PROs match your filters.</p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Regulators</h2>
        {regulators.length > 0 ? (
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {regulators.map((r, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noreferrer" className="font-medium text-slate-900 hover:underline">{r.name}</a>
                ) : (
                  <span className="font-medium text-slate-900">{r.name}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No regulators listed for this country yet.</p>
        )}
      </section>
    </div>
  );
}
