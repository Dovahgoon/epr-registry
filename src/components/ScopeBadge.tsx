'use client';
import React from 'react';

export type ProScope = 'household' | 'commercial' | 'both' | 'unknown';

const LABEL: Record<ProScope,string> = {
  household: 'Household',
  commercial: 'Commercial',
  both: 'Household & Commercial',
  unknown: 'Unknown',
};

const DOTS: Record<ProScope, React.CSSProperties> = {
  household: { width: 12, height: 12, borderRadius: 9999, background: 'linear-gradient(135deg, #10b981, #34d399)', boxShadow: '0 0 0 2px rgba(255,255,255,0.9) inset' },
  commercial:{ width: 12, height: 12, borderRadius: 9999, background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', boxShadow: '0 0 0 2px rgba(255,255,255,0.9) inset' },
  both:      { width: 12, height: 12, borderRadius: 9999, background: 'linear-gradient(135deg, #6d28d9, #a78bfa)', boxShadow: '0 0 0 2px rgba(255,255,255,0.9) inset' },
  unknown:   { width: 12, height: 12, borderRadius: 9999, background: 'linear-gradient(135deg, #9ca3af, #cbd5e1)', boxShadow: '0 0 0 2px rgba(255,255,255,0.9) inset' },
};

const BACKS: Record<ProScope, string> = {
  household: 'linear-gradient(135deg, rgba(16,185,129,0.10), rgba(52,211,153,0.10))',
  commercial:'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.12))',
  both:      'linear-gradient(135deg, rgba(109,40,217,0.12), rgba(167,139,250,0.12))',
  unknown:   'linear-gradient(135deg, rgba(156,163,175,0.10), rgba(203,213,225,0.10))',
};

export function ScopeBadge({ scope }: { scope: ProScope }) {
  const s = (scope ?? 'unknown') as ProScope;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 10px',
                   fontSize:12, borderRadius:999, border:'1px solid rgba(0,0,0,0.12)', background: BACKS[s] }}>
      <span style={DOTS[s]} aria-hidden />
      <span style={{fontWeight:600, color:'#111827'}}>{LABEL[s]}</span>
    </span>
  );
}
