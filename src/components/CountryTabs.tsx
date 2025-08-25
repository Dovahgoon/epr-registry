// src/components/CountryTabs.tsx
'use client'
import * as React from 'react'

type Linkish = string | { name?: string; label?: string; url?: string }

function asLink(item?: Linkish | null): { name: string, url?: string } | null {
  if (!item) return null
  if (typeof item === 'string') return { name: item }
  return { name: item.name ?? item.label ?? '', url: item.url }
}

function asLinks(list?: Linkish[] | null): Array<{ name: string, url?: string }> {
  if (!Array.isArray(list)) return []
  return list.map(asLink).filter(Boolean) as Array<{ name: string, url?: string }>
}

function SectionCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-background/75 backdrop-blur-sm shadow-sm">
      <header className="px-6 pt-5 pb-3">
        <h3 className="text-[15px] leading-6 font-semibold tracking-tight">{title}</h3>
      </header>
      <div className="px-6 pb-6">{children}</div>
    </section>
  )
}

export default function CountryTabs({ iso }: { iso: string }) {
  const [tab, setTab] = React.useState<'overview'|'regulators'|'pros'|'reporting'|'fees'>('overview')
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancel = false
    setLoading(true)
    fetch(`/api/country/${encodeURIComponent(iso)}/live`)
      .then(r => r.json())
      .then(j => { if (!cancel) setData(j) })
      .finally(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [iso])

  const details = data?.details ?? {}
  const tariffs = data?.tariffs

  const overview = {
    status: details?.overview?.status ?? 'active',
    scope: details?.overview?.scope ?? 'Packaging',
    producerRegister: asLink(details?.producerRegister ?? details?.register),
    notes: details?.notes,
  }

  const regulators = asLinks(details?.regulators ?? details?.regulatorsAndRegisters)
  const pros = asLinks(details?.pros ?? details?.organizations ?? details?.prosPackaging)

  const reporting = {
    frequencies: Array.isArray(details?.reporting?.frequencies) ? details.reporting.frequencies : (Array.isArray(details?.reportingFrequencies) ? details.reportingFrequencies : []),
    portal: asLink(details?.reporting?.portal),
    methods: Array.isArray(details?.reporting?.methods) ? details.reporting.methods : [],
  }

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-2 rounded-full border border-border/60 bg-background/70 p-1.5 shadow-sm w-fit">
        {[
          ['overview','Overview'],
          ['regulators','Regulators'],
          ['pros','PROs'],
          ['reporting','Reporting'],
          ['fees','Fees'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`px-4 py-2 text-[15px] leading-6 rounded-full transition ${tab===key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Panels */}
      {loading ? (
        <div className="animate-pulse text-[15px] leading-6 text-muted-foreground">Loading {iso}…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {tab === 'overview' && (
            <div className="lg:col-span-3 grid gap-6"
                 style={{gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))'}}>
              <SectionCard title="Status">
                <div className="text-[15px] leading-6">{
                  (overview.status || '').toString()
                }</div>
              </SectionCard>
              <SectionCard title="Scope">
                <div className="text-[15px] leading-6">{
                  (overview.scope || '').toString()
                }</div>
              </SectionCard>
              <SectionCard title="Producer Register">
                {overview.producerRegister ? (
                  <a
                    href={overview.producerRegister.url}
                    target="_blank"
                    className="text-[15px] leading-6 underline underline-offset-4 break-words"
                    style={{wordBreak:'break-word'}}
                  >
                    {overview.producerRegister.name}
                  </a>
                ) : <div className="text-[15px] leading-6 text-muted-foreground">—</div>}
              </SectionCard>
              {overview.notes ? (
                <div className="md:col-span-2 xl:col-span-3">
                  <SectionCard title="Notes">
                    <p className="text-[15px] leading-7 whitespace-pre-wrap">{overview.notes}</p>
                  </SectionCard>
                </div>
              ) : null}
            </div>
          )}

          {tab === 'regulators' && (
            <div className="lg:col-span-3">
              <SectionCard title="Regulators">
                {regulators.length ? (
                  <ul className="text-[15px] leading-7 space-y-2">
                    {regulators.map((r, i) => (
                      <li key={i}>
                        {r.url ? <a href={r.url} target="_blank" className="underline underline-offset-4 break-words">{r.name}</a> : r.name}
                      </li>
                    ))}
                  </ul>
                ) : <div className="text-[15px] leading-6 text-muted-foreground">No regulators listed.</div>}
              </SectionCard>
            </div>
          )}

          {tab === 'pros' && (
            <div className="lg:col-span-3">
              <SectionCard title="Producer Responsibility Organisations (PROs)">
                {pros.length ? (
                  <ul className="text-[15px] leading-7 space-y-2">
                    {pros.map((p, i) => (
                      <li key={i}>
                        {p.url ? <a href={p.url} target="_blank" className="underline underline-offset-4 break-words">{p.name}</a> : p.name}
                      </li>
                    ))}
                  </ul>
                ) : <div className="text-[15px] leading-6 text-muted-foreground">No PROs listed.</div>}
              </SectionCard>
            </div>
          )}

          {tab === 'reporting' && (
            <div className="lg:col-span-3 grid gap-6"
                 style={{gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))'}}>
              <SectionCard title="Frequencies">
                {reporting.frequencies?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {reporting.frequencies.map((f: string, i: number) => (
                      <span key={i} className="rounded-full border border-border/60 px-2 py-1 text-xs">{f}</span>
                    ))}
                  </div>
                ) : <div className="text-[15px] leading-6 text-muted-foreground">—</div>}
              </SectionCard>
              <SectionCard title="Portal">
                {reporting.portal ? (
                  <a href={reporting.portal.url} target="_blank" className="text-[15px] leading-6 underline underline-offset-4 break-words">{reporting.portal.name}</a>
                ) : <div className="text-[15px] leading-6 text-muted-foreground">—</div>}
              </SectionCard>
              <SectionCard title="Methods">
                {reporting.methods?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {reporting.methods.map((m: string, i: number) => (
                      <span key={i} className="rounded-full border border-border/60 px-2 py-1 text-xs">{m}</span>
                    ))}
                  </div>
                ) : <div className="text-[15px] leading-6 text-muted-foreground">—</div>}
              </SectionCard>
            </div>
          )}

          {tab === 'fees' && (
            <div className="lg:col-span-3">
              <SectionCard title="Fees (EUR/kg)">
                {(() => {
                  const materials = Array.isArray(tariffs)
                    ? tariffs
                    : (tariffs?.materials ?? [])
                  if (!materials?.length) {
                    return (
                      <div className="text-[15px] leading-6 text-muted-foreground space-y-2">
                        <p>No live fees found.</p>
                        <p>Set <code className="px-1 py-0.5 rounded bg-muted">NEXT_PUBLIC_TARIFFS_URL</code> to a JSON endpoint, or add <code className="px-1 py-0.5 rounded bg-muted">src/data/tariffs-2025.json</code>.</p>
                      </div>
                    )
                  }
                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-left text-muted-foreground">
                          <tr>
                            <th className="py-2 pr-4">Material</th>
                            <th className="py-2 pr-4">Rate</th>
                            <th className="py-2 pr-4">Unit</th>
                            <th className="py-2 pr-4">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {materials.map((m: any, i: number) => (
                            <tr key={i} className="border-t border-border/40">
                              <td className="py-2 pr-4">{m.name ?? m.code ?? '—'}</td>
                              <td className="py-2 pr-4">{(m.rate ?? m.tariff ?? m.price ?? 0).toString()}</td>
                              <td className="py-2 pr-4">{m.unit ?? 'EUR/kg'}</td>
                              <td className="py-2 pr-4">{m.notes ?? ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                })()}
              </SectionCard>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
