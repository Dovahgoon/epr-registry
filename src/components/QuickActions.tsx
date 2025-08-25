// src/components/QuickActions.tsx
export default function QuickActions(){
  return (
    <section style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
      <a className="card pad" href="/tools/fee-calculator" style={{display:'block',textDecoration:'none',color:'inherit'}}>
        <div className="section-title">Fee calculator</div>
        <div style={{color:'var(--muted)'}}>Rates by material (EUR/kg), per country.</div>
      </a>
      <a className="card pad" href="/playbooks" style={{display:'block',textDecoration:'none',color:'inherit'}}>
        <div className="section-title">Compliance playbooks</div>
        <div style={{color:'var(--muted)'}}>Obligations, registration, reporting, PROs.</div>
      </a>
      <a className="card pad" href="/alerts" style={{display:'block',textDecoration:'none',color:'inherit'}}>
        <div className="section-title">Change alerts</div>
        <div style={{color:'var(--muted)'}}>Email alerts when tariffs or rules change.</div>
      </a>
    </section>
  )
}
