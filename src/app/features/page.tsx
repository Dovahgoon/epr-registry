// src/app/features/page.tsx
import Link from 'next/link'

type Item = { title: string; desc: string; href: string }

const items: Item[] = [
  { title: 'Live fee calculator', href: '/tools/fee-calculator', desc: 'Up-to-date EUR/kg tariffs by material and country.' },
  { title: 'Compliance playbooks', href: '/playbooks', desc: 'Registration, reporting, and obligations per market.' },
  { title: 'Change alerts', href: '/alerts', desc: 'Email alerts the moment tariffs or rules change.' },
  { title: 'Vault', href: '/vault', desc: 'Store documents, evidence and declarations.' },
  { title: 'Investor view', href: '/investor', desc: 'Market coverage, obligations, exposure at a glance.' },
  { title: 'Health', href: '/health', desc: 'System status & data freshness (internal).' },
]

export default function FeaturesPage(){
  return (
    <div style={{padding:'10px 0 40px'}}>
      <h1 style={{fontSize:28,fontWeight:750,letterSpacing:'-0.02em',margin:'0 0 16px'}}>Features</h1>
      <p style={{color:'var(--muted)',margin:'0 0 24px'}}>Everything you need to stay compliant across the EU.</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        {items.map((it) => (
          <Link key={it.title} href={it.href} className="card pad" style={{textDecoration:'none',color:'inherit',display:'block'}}>
            <h3 style={{margin:'0 0 8px',fontWeight:650}}>{it.title}</h3>
            <p style={{margin:0,color:'var(--muted)'}}>{it.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
