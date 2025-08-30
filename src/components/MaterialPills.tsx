'use client';
import React from 'react';

export function MaterialPills({ materials }: { materials: string[] }) {
  if (!materials || materials.length === 0) return null;
  return (
    <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
      {materials.map((m, i) => (
        <span key={i}
          style={{padding:'6px 10px', borderRadius:999, fontSize:12, border:'1px solid rgba(0,0,0,0.12)',
                  background:'linear-gradient(135deg, rgba(219,234,254,0.6), rgba(224,242,254,0.6))'}}>
          {m}
        </span>
      ))}
    </div>
  );
}
