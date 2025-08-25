//
// src/app/search/page.tsx
'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Country = { iso2: string; name: string };
type Pro = { countryIso2: string; name: string; type?: string; url?: string; };
type Rule = { countryIso2: string; regime?: string; law?: string; notes?: string; url?: string; };
type Consultant = { countryIso2: string; name: string; email?: string; url?: string; };

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<any>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) { setRes(null); return; }
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r=>r.json());
      setRes(r);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      <div className="hero">
        <div>
          <h1>Search</h1>
          <p className="muted">Find countries, PROs, rules, and consultants.</p>
        </div>
      </div>

      <div className="card">
        <input autoFocus placeholder="Search (e.g., 'LUCID', 'Dual System', 'Germany')"
          value={q} onChange={e=>setQ(e.target.value)}
          style={{ width:'100%', padding:12, borderRadius:12, border:'1px solid var(--border)', background:'var(--panel)', color:'var(--text)'}}/>
      </div>

      {!res ? <p className="muted" style={{marginTop:10}}>Type to search…</p> : (
        <div className="section">
          <div className="grid">
            <div className="card">
              <h3 className="title">Countries</h3>
              {res.countries?.length ? <ul className="list">
                {res.countries.map((c: Country, i:number) => (
                  <li key={i}><Link href={`/country/${String(c.iso2).toLowerCase()}`}><strong>{c.name}</strong> ({c.iso2})</Link></li>
                ))}
              </ul> : <p className="muted">No matches.</p>}
            </div>

            <div className="card">
              <h3 className="title">PROs</h3>
              {res.pros?.length ? <ul className="list">
                {res.pros.map((p: Pro, i:number) => (
                  <li key={i}>
                    <strong>{p.name}</strong> — {p.countryIso2}
                    {p.type ? <> <span className="badge">{p.type}</span></> : null}
                    {p.url ? <> — <a href={p.url} target="_blank" rel="noopener noreferrer">Website ↗</a></> : null}
                  </li>
                ))}
              </ul> : <p className="muted">No matches.</p>}
            </div>

            <div className="card">
              <h3 className="title">Rules</h3>
              {res.rules?.length ? <ul className="list">
                {res.rules.map((r: Rule, i:number) => (
                  <li key={i}><strong>{r.regime}</strong> — {r.law} — {r.countryIso2}</li>
                ))}
              </ul> : <p className="muted">No matches.</p>}
            </div>

            <div className="card">
              <h3 className="title">Consultants</h3>
              {res.consultants?.length ? <ul className="list">
                {res.consultants.map((c: Consultant, i:number) => (
                  <li key={i}><strong>{c.name}</strong> — {c.countryIso2} {c.email ? <>— <a href={`mailto:${c.email}`}>{c.email}</a></> : null}</li>
                ))}
              </ul> : <p className="muted">No matches.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
