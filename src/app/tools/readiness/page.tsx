//
// src/app/tools/readiness/page.tsx
'use client';

import React, { useState } from "react";

type Item = { id: string; text: string };

const DEFAULTS: Item[] = [
  { id: "country-register", text: "Registered in national packaging register" },
  { id: "pro-contract", text: "Contract signed with PRO / dual system" },
  { id: "weights", text: "We can report packaging weights by material" },
  { id: "labeling", text: "Labeling requirements confirmed (symbols/language)" },
  { id: "evidence", text: "Registration number & certificate stored" },
];

export default function ReadinessPage() {
  const [items, setItems] = useState<Item[]>(DEFAULTS);
  const [done, setDone] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setDone(d => ({ ...d, [id]: !d[id] }));
  }

  return (
    <div>
      <div className="hero">
        <div>
          <h1>EPR Readiness Checklist</h1>
          <p className="muted">Tick off the steps before shipping to a new country.</p>
        </div>
      </div>

      <div className="card">
        <ul className="list">
          {items.map((it) => (
            <li key={it.id} className="row">
              <label style={{display:'flex', alignItems:'center', gap:10}}>
                <input type="checkbox" checked={!!done[it.id]} onChange={()=>toggle(it.id)} />
                <span>{it.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
