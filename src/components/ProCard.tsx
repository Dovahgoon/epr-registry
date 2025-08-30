import Link from 'next/link';
import React from 'react';
import { ScopeBadge } from '@/components/ScopeBadge';
import { MaterialPills } from '@/components/MaterialPills';

export type Pro = {
  id?: string;
  name: string;
  url?: string | null;
  sourceUrl?: string | null;
  lastVerifiedAt?: string | null;
  scope?: 'household' | 'commercial' | 'both' | 'unknown';
  materials?: string[];
};

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden style={{display:'inline-block',verticalAlign:'-2px', color:'#6d28d9'}}>
      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" fill="currentColor"/>
      <path d="M19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7z" fill="currentColor"/>
    </svg>
  );
}

function domainFromUrl(u?: string | null) {
  if (!u) return null;
  try { return new URL(u).hostname.replace(/^www\./,''); } catch { return u; }
}

const STRIPE: React.CSSProperties = {
  width: 6, borderRadius: 12, background: 'linear-gradient(135deg, #6d28d9 0%, #a78bfa 50%, #9333ea 100%)',
};

export function ProCard({ pro, href, onTariffs, hasTariffs }: { pro: Pro; href?: string; onTariffs?: ()=>void; hasTariffs?: boolean }) {
  const scope = (pro.scope ?? 'unknown') as NonNullable<Pro['scope']>;
  const last = pro.lastVerifiedAt ? new Date(pro.lastVerifiedAt) : null;
  const domain = domainFromUrl(pro.url);
  const hasMaterials = Array.isArray(pro.materials) && pro.materials.length > 0;

  return (
    <div style={{display:'grid', gridTemplateColumns:'6px 1fr', gap:12}}>
      <div style={STRIPE} />
      <div style={{border:'1px solid rgba(0,0,0,0.12)', borderRadius:16, padding:16, background:'#fff',
                   boxShadow:'0 1px 2px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12}}>
          <div style={{minWidth:0}}>
            <h3 style={{fontSize:15, fontWeight:700, lineHeight:1.25, margin:0}}>
              {href ? (
                <Link href={href} style={{textDecoration:'none', color:'#111'}}>
                  {pro.name}
                </Link>
              ) : (
                <span style={{color:'#111'}}>{pro.name}</span>
              )}
            </h3>
            {pro.url ? (
              <a href={pro.url} target="_blank" rel="noreferrer"
                 style={{fontSize:12, opacity:0.8, color:'#0f172a', textDecoration:'none', display:'inline-flex', gap:6, marginTop:6}}>
                {domain}
                <ExternalIcon />
              </a>
            ) : null}
          </div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <ScopeBadge scope={scope} />
            {hasTariffs ? (
              <button onClick={onTariffs} title="View tariffs"
                style={{border:'1px solid rgba(0,0,0,0.12)', borderRadius:10, padding:'8px 10px', fontSize:12, cursor:'pointer',
                        background:'linear-gradient(135deg, rgba(109,40,217,0.10), rgba(167,139,250,0.10))'}}>
                Tariffs
              </button>
            ) : null}
          </div>
        </div>

        {hasMaterials ? (
          <div style={{marginTop:12}}>
            <MaterialPills materials={pro.materials!} />
          </div>
        ) : null}

        {last ? (
          <div style={{marginTop: hasMaterials ? 12 : 8, fontSize:11, opacity:0.6}}>Updated: {last.toLocaleDateString()}</div>
        ) : null}
      </div>
    </div>
  );
}
