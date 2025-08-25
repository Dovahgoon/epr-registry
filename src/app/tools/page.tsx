// src/app/tools/page.tsx
import Link from 'next/link'

function Card({href, title, desc, icon}: {href:string, title:string, desc:string, icon:React.ReactNode}){
  return (
    <Link href={href} className="card pad" style={{display:'block'}}>
      <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
        <div aria-hidden style={{width:36,height:36,display:'grid',placeItems:'center',borderRadius:12,background:'linear-gradient(180deg,#e879f924,#60a5fa24)'}}>
          {icon}
        </div>
        <div>
          <h3 style={{margin:'0 0 6px',fontWeight:650}}>{title}</h3>
          <p style={{margin:0,color:'var(--muted)'}}>{desc}</p>
        </div>
      </div>
    </Link>
  )
}

export default function ToolsPage(){
  return (
    <div style={{padding:'10px 0 40px'}}>
      <h1 style={{fontSize:28,fontWeight:750,letterSpacing:'-0.02em',margin:'0 0 10px'}}>Tools</h1>
      <p style={{color:'var(--muted)',margin:'0 0 20px'}}>Calculators and checkers to speed up day-to-day work.</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        <Card
          href="/tools/fee-calculator"
          title="Fee Calculator"
          desc="Estimate per-material fees from volumes."
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="#334155"/><path d="M8 7h8M8 11h8M8 15h5" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/></svg>}
        />
        <Card
          href="/tools/scope-checker"
          title="Scope Checker"
          desc="Determine if a package is in scope."
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="10" r="6" stroke="#334155"/><path d="M14 14l5 5" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/></svg>}
        />
        <Card
          href="/tools/obligations"
          title="Obligations Wizard"
          desc="Identify registrations, reporting, and PROs."
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 4h12v4H6z" stroke="#334155"/><path d="M6 10h12v10H6z" stroke="#64748b"/><path d="M9 13h6M9 16h6" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/></svg>}
        />
      </div>
    </div>
  )
}
