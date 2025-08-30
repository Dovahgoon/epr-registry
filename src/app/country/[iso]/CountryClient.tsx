'use client';
import React from 'react';

type Pro = { name: string; url?: string | null; scope?: 'household'|'commercial'|'both'|'unknown'|null };
type Regulator = { name: string; url?: string | null };
type ItemRow = { country: string; pros?: Pro[]; regulators?: Regulator[]; updatedAt?: string };
type RegistryItems = { ok?: boolean; year?: string; items: ItemRow[]; generatedAt?: string };

type PlasticSub = { code: string; label: string; rate: number };
type Scheme = { id: string; name: string; effectiveFrom: string; materials?: Record<string, number>; plastic?: { subMaterials?: PlasticSub[] } };
type CountryTariffs = { name: string; schemes: Scheme[] };
type TariffsDoc = { countries: Record<string, CountryTariffs> };

const REGISTRY_URL = process.env.NEXT_PUBLIC_REGISTRY_URL as string;
const TARIFFS_URL = (process.env.NEXT_PUBLIC_TARIFFS_URL as string) || '/data/tariffs-2025.json';

async function fetchRegistryItems(): Promise<RegistryItems> {
  if (!REGISTRY_URL) throw new Error('NEXT_PUBLIC_REGISTRY_URL is not set');
  const res = await fetch(REGISTRY_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch registry items');
  return await res.json();
}
async function fetchTariffs(): Promise<TariffsDoc | null> {
  try {
    const res = await fetch(TARIFFS_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.countries) return json as TariffsDoc;
    if (json && json.items) {
      // build a light structure from flat items[] (country-level)
      const byIso: Record<string, CountryTariffs> = {};
      for (const it of json.items) {
        const iso = (it.country || '').toUpperCase();
        const scheme = (it.scheme || 'Unknown');
        const material = (it.material || '').replace(/\s+/g,'-').toLowerCase();
        const rate = typeof it.rate === 'number' ? it.rate : Number(it.rate || 0);
        byIso[iso] ||= { name: iso, schemes: [] };
        let s = byIso[iso].schemes.find(x => x.name === scheme);
        if (!s) {
          s = { id: scheme, name: scheme, effectiveFrom: it.effective_from || '2025-01-01', materials: {} };
          byIso[iso].schemes.push(s);
        }
        if (material) (s.materials as any)[material] = rate;
      }
      return { countries: byIso };
    }
  } catch {}
  return null;
}

function unionMaterials(ctry?: CountryTariffs) {

  const set = new Set<string>();
  if (!ctry) return [] as string[];
  for (const s of (ctry.schemes || [])) {
    if (s.materials) for (const m of Object.keys(s.materials)) set.add(m.replace(/_/g, ' '));
    if (s.plastic?.subMaterials) for (const p of s.plastic.subMaterials) set.add((p.label || p.code || 'Plastic'));
  }
  return Array.from(set).sort((a,b)=>a.localeCompare(b));
}

function sanitizeMaterials(list: string[]) {
  const ALLOW = new Set([
    'aluminum','steel','glass','paper','wood','plastic','pe films','pet bottles clear','bioplastic','composite','other'
  ]);
  return list.filter((m) => {
    const t = (m || '').toLowerCase().trim();
    if (/^a\d(\s*\d+)?$/i.test(t)) return false; // drop tokens like "a1 1", "a1 2"
    // Allow if explicitly allowed or if it's clearly a material word (alpha-heavy)
    if (ALLOW.has(t)) return true;
    return /[a-z]{3,}/i.test(t);
  });
}

function materialsByPro(ctry?: CountryTariffs): Record<string, Set<string>> {
  const map: Record<string, Set<string>> = {};
  if (!ctry) return map;
  const schemes = ctry.schemes || [];
  for (const sch of schemes) {
    const mats = new Set<string>();
    if (sch.materials) for (const k of Object.keys(sch.materials)) mats.add(k.replace(/_/g, ' '));
    if (sch.plastic?.subMaterials?.length) mats.add('Plastic');
    map[sch.name.toLowerCase()] = mats;
  }
  return map;
}
function bestMaterialsForPro(proName: string, proMaterialsIndex: Record<string, Set<string>>): Set<string> {
  const pn = proName.toLowerCase();
  const found = new Set<string>();
  for (const [schemeName, mats] of Object.entries(proMaterialsIndex)) {
    if (schemeName.includes(pn) || pn.includes(schemeName)) mats.forEach(m => found.add(m));
  }
  return found;
}
function ScopeBadge({scope}:{scope:Pro['scope']}){
  const txt = scope || 'unknown';
  const cls = txt==='household' ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
            : txt==='commercial' ? 'bg-blue-100 text-blue-800 border-blue-200'
            : txt==='both' ? 'bg-violet-100 text-violet-800 border-violet-200'
            : 'bg-slate-100 text-slate-600 border-slate-200';
  return <span className={`ml-auto px-2 py-0.5 rounded-full text-xs border whitespace-nowrap ${cls}`}>{txt}</span>;
}

export default function CountryClient({ iso }: { iso: string }) {
  const [data, setData] = React.useState<RegistryItems | null>(null);
  const [tariffs, setTariffs] = React.useState<TariffsDoc | null>(null);
  const [query, setQuery] = React.useState('');
  const [scopes, setScopes] = React.useState<Array<'household'|'commercial'|'both'|'unknown'>>(['household','commercial','both','unknown']);
  const [selectedMaterials, setSelectedMaterials] = React.useState<string[]>([]);

  React.useEffect(() => { (async () => setData(await fetchRegistryItems()))(); }, []);
  React.useEffect(() => { (async () => setTariffs(await fetchTariffs()))(); }, []);

  const row = React.useMemo(() => (data?.items || []).find(r => (r.country || '').toUpperCase() === iso), [data, iso]);
  const proMatIndex = React.useMemo(() => materialsByPro(tariffs?.countries?.[iso]), [tariffs, iso]);

  const pros = React.useMemo(() => {
    const list = (row?.pros || []).map(p => ({ ...p, scope: (p.scope || 'unknown') }));
    const q = query.trim().toLowerCase();
    return list
      .filter(p => (q ? (p.name || '').toLowerCase().includes(q) : true))
      .filter(p => scopes.includes((p.scope as any)));
  }, [row, query, scopes]);

  const regulators = row?.regulators || [];
  const materials = React.useMemo(() => tariffs?.countries ? unionMaterials(tariffs.countries[iso]) : [], [tariffs, iso]);

  function toggleScope(s: 'household'|'commercial'|'both'|'unknown') {
    setScopes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }
  function toggleMaterial(m: string) {
    setSelectedMaterials(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  }

  const prosFiltered = React.useMemo(() => {
    if (selectedMaterials.length === 0) return pros;
    const want = new Set(selectedMaterials.map(s => s.toLowerCase()));
    return pros.filter(p => {
      const mats = bestMaterialsForPro(p.name, proMatIndex);
      for (const m of mats) { if (want.has(m.toLowerCase())) return true; }
      return false;
    });
  }, [pros, selectedMaterials, proMatIndex]);

  return (
    <div className="min-h-screen px-6 py-10 overflow-x-hidden bg-gradient-to-b from-violet-50 via-fuchsia-50 to-white text-slate-800">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-6xl font-extrabold tracking-tight text-slate-900">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-700 via-fuchsia-600 to-sky-600">{iso}</span>
        </h1>
        <p className="text-slate-600">{iso}</p>

        <section className="mt-6">
  <h3 className="text-lg font-semibold">Materials</h3>
  {materials.length > 0 ? (
    <div className="mt-2 flex flex-wrap gap-2">
              {materials.map(m => {
                const active = selectedMaterials.includes(m);
                return (
                  <button key={m} onClick={() => toggleMaterial(m)}
                    className={`px-3 py-1.5 rounded-full border text-sm ${active ? 'border-violet-400 bg-violet-100 text-violet-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
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
            <span className="text-sm text-slate-500">Results: {prosFiltered.length}</span>
            <button className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 hover:bg-slate-50" onClick={() => setQuery('')}>Clear</button>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search PRO name..." className="rounded-2xl bg-white border border-slate-300 px-4 py-2 w-64 shadow-sm min-w-0" />
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium text-slate-600 mb-2">Purpose</div>
            <div className="flex gap-2 flex-wrap">
              {(['household','commercial','both','unknown'] as const).map(s => (
                <button key={s} onClick={() => toggleScope(s)} className={`px-3 py-1.5 rounded-full border ${scopes.includes(s) ? 'border-violet-400 bg-violet-100' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {prosFiltered.length === 0 ? (
              <div className="col-span-full text-slate-500">No PROs match your filters.</div>
            ) : prosFiltered.map(p => {
              const mats = sanitizeMaterials(Array.from(bestMaterialsForPro(p.name, proMatIndex)));
              return (
                <div key={p.name}
                     className="relative min-w-0 rounded-2xl p-4 bg-white border border-slate-200 hover:border-violet-400 shadow-lg shadow-violet-100 overflow-visible pr-14
                                before:content-[''] before:absolute before:top-2 before:bottom-2 before:right-[-12px] before:z-10 before:w-[4px]
                                before:rounded-full before:bg-gradient-to-b before:from-violet-600 before:via-fuchsia-500 before:to-pink-500">
                  <div className="relative">
                    <div className="text-lg font-semibold pr-16">{p.name}</div>
                    <div className="absolute top-2 right-3 z-10"><ScopeBadge scope={p.scope}/></div>
                  </div>
                  {p.url ? <a href={p.url} target="_blank" className="text-xs text-violet-700 hover:underline break-all mt-2 inline-block">{p.url}</a> : null}
                  {mats.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {mats.slice(0,8).map(m => (
                        <span key={p.name + m} className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-700">{m}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Regulators</h2>
          {row?.regulators?.length ? (
            <ul className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {row.regulators.map(r => (
                <li key={r.name} className="rounded-2xl p-5 bg-white border border-slate-200 shadow-lg shadow-violet-100 overflow-hidden">
                  <div className="font-medium">{r.name}</div>
                  {r.url ? (<a href={r.url} target="_blank" className="text-sm text-violet-700 hover:underline break-all">{r.url}</a>) : null}
                </li>
              ))}
            </ul>
          ) : <p className="text-slate-500 mt-2">No regulators listed for this country yet.</p>}
        </section>
      </div>
    </div>
  );
}
