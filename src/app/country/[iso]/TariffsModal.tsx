'use client';
import React from 'react';

// allow 'both' for display after merging
type Stream = 'household' | 'commercial' | 'both';

type Rate = {
  id?: string;
  schemeId?: string;
  material: string;
  packagingType?: string | null;
  rate: number;
  currency: string;
  unit: string;
  sourceUrl?: string | null;
};

type Scheme = {
  id: string;
  countryId: any;
  proId: any | null;
  name: string;
  stream: Exclude<Stream,'both'>; // incoming data is HH or COMM
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  sourceUrl?: string | null;
  rates?: Rate[];
};

type MergedScheme = Omit<Scheme, 'stream'> & { stream: Stream };

// ---- merge identical schemes (same name + dates + identical rates) ----
function normalizeRate(r: Rate) {
  return [
    (r.material || '').toLowerCase(),
    (r.packagingType || '').toLowerCase(),
    String(r.rate),
    (r.currency || '').toUpperCase(),
    (r.unit || '').toLowerCase(),
  ].join('|');
}
function sigForScheme(s: Scheme) {
  const rateSigs = [...(s.rates || [])].map(normalizeRate).sort().join('~');
  return [
    (s.name || '').trim().toLowerCase(),
    s.effectiveFrom || '',
    s.effectiveTo || '',
    rateSigs,
  ].join('::');
}
function mergeSchemes(schemes: Scheme[]): MergedScheme[] {
  const map = new Map<string, MergedScheme>();
  for (const s of schemes) {
    const sig = sigForScheme(s);
    const existing = map.get(sig);
    if (!existing) {
      map.set(sig, { ...s, stream: s.stream as Stream });
    } else {
      // if the only difference is stream, collapse to 'both'
      const nextStream: Stream =
        existing.stream === s.stream ? existing.stream : 'both';
      map.set(sig, { ...existing, stream: nextStream });
    }
  }
  return [...map.values()];
}

export function TariffsModal({
  open,
  onClose,
  proName,
  schemes,
}: {
  open: boolean;
  onClose: () => void;
  proName: string;
  schemes: Scheme[];
}) {
  if (!open) return null;

  const merged = mergeSchemes(schemes);

  const streamLabel = (s: Stream) =>
    s === 'both' ? 'Household & Commercial' : s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div style={{position:'fixed', inset:0, zIndex:50, display:'grid', placeItems:'center', background:'rgba(17,24,39,0.5)'}}>
      <div style={{width:'min(920px, 92vw)', maxHeight:'85vh', overflow:'auto',
                   background:'#fff', borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,0.25)'}}>
        <div style={{padding:'16px 20px', borderBottom:'1px solid rgba(0,0,0,0.08)',
                     background: 'linear-gradient(135deg, rgba(109,40,217,0.08), rgba(167,139,250,0.08))'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
            <div>
              <div style={{fontSize:12, opacity:0.7}}>Tariffs</div>
              <div style={{fontSize:18, fontWeight:700}}>{proName}</div>
            </div>
            <button onClick={onClose} style={{border:'1px solid rgba(0,0,0,0.12)', borderRadius:10, padding:'8px 12px', background:'#fff', cursor:'pointer'}}>Close</button>
          </div>
        </div>
        <div style={{padding:16}}>
          {merged.length === 0 ? (
            <div style={{fontSize:14, opacity:0.7}}>No tariffs available.</div>
          ) : merged.map((s) => (
            <div key={s.id + '|' + s.stream} style={{border:'1px solid rgba(0,0,0,0.10)', borderRadius:14, overflow:'hidden', marginBottom:16}}>
              <div style={{padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'baseline',
                           background:'linear-gradient(135deg, rgba(191,219,254,0.35), rgba(224,242,254,0.35))'}}>
                <div style={{fontWeight:700}}>{s.name}</div>
                <div style={{fontSize:12, opacity:0.75, display:'flex', gap:12}}>
                  <span>Stream: <strong>{streamLabel(s.stream)}</strong></span>
                  {s.effectiveFrom ? <span>From: <strong>{new Date(s.effectiveFrom).toLocaleDateString()}</strong></span> : null}
                  {s.effectiveTo ? <span>To: <strong>{new Date(s.effectiveTo).toLocaleDateString()}</strong></span> : null}
                </div>
              </div>
              <div style={{padding:12}}>
                <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
                  <thead>
                    <tr style={{textAlign:'left'}}>
                      <th style={{padding:'8px 6px', borderBottom:'1px solid rgba(0,0,0,0.08)'}}>Material</th>
                      <th style={{padding:'8px 6px', borderBottom:'1px solid rgba(0,0,0,0.08)'}}>Packaging type</th>
                      <th style={{padding:'8px 6px', borderBottom:'1px solid rgba(0,0,0,0.08)'}}>Rate</th>
                      <th style={{padding:'8px 6px', borderBottom:'1px solid rgba(0,0,0,0.08)'}}>Unit</th>
                      <th style={{padding:'8px 6px', borderBottom:'1px solid rgba(0,0,0,0.08)'}}>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(s.rates || []).map((r, i) => (
                      <tr key={i}>
                        <td style={{padding:'6px 6px'}}>{r.material}</td>
                        <td style={{padding:'6px 6px', opacity:0.8}}>{r.packagingType || '—'}</td>
                        <td style={{padding:'6px 6px', fontVariantNumeric:'tabular-nums'}}>{r.rate}</td>
                        <td style={{padding:'6px 6px'}}>{r.currency} / {r.unit.replace('_','/')}</td>
                        <td style={{padding:'6px 6px'}}>{r.sourceUrl ? <a href={r.sourceUrl} target="_blank" rel="noreferrer">Link</a> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
