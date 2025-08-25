import { fetchCountryUI } from '@/lib/ui-adapter'

export default function CountryPlaybook({ params }: { params: { iso: string } }) {
  const iso = (params.iso || '').toUpperCase()
  const c = fetchCountryUI(iso)

  const pros = c.pros ?? []
  const regulators = c.regulators ?? []

  return (
    <div className="page">
      <h1 className="page-title">{iso}</h1>
      <p className="page-sub">Live overview, regulators, PROs, reporting & fees</p>

      <div className="subtabs">
        <button className="is-active">Overview</button>
        <button>Regulators</button>
        <button>PROs</button>
        <button>Reporting</button>
        <button>Fees</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Status</div>
          <div className={`kpi-value ${String(c.overview?.status).toLowerCase()==='active' ? 'success' : ''}`}>
            {c.overview?.status ?? '—'}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Scope</div>
          <div className="kpi-value">{c.overview?.scope ?? '—'}</div>
        </div>
        <a className="kpi-card" href={c.producerRegister?.url} target="_blank" rel="noopener noreferrer">
          <div className="kpi-label">Producer Register</div>
          <div className="kpi-value" style={{display:'flex',gap:8,alignItems:'center'}}>Open <span aria-hidden>→</span></div>
        </a>
      </div>

      {!!pros.length && (
        <div className="list-card" style={{marginTop:8}}>
          <div className="title">Producer Responsibility Organisations (PROs)</div>
          <div className="link-list">
            {pros.map((p:any) => (
              <a key={p.url || p.name} href={p.url} target="_blank" rel="noopener noreferrer">{p.name}</a>
            ))}
          </div>
        </div>
      )}

      {!!regulators.length && (
        <div className="list-card" style={{marginTop:16}}>
          <div className="title">Regulators</div>
          <div className="link-list">
            {regulators.map((r:any) => (
              <a key={r.url || r.name} href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
