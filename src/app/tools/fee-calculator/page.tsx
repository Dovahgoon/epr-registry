'use client'

import { useMemo, useState } from 'react'
import { EU_COUNTRIES } from '@/lib/countries'
import { MATERIALS, TARIFFS, type Material } from '@/lib/tariffs'
import './fee-calc-ui.css'

type Unit = 'kg' | 'tonnes'
type Inputs = Record<Material, number>

function toKg(v: number, unit: Unit) { return unit === 'kg' ? v : v * 1000 }
function fmt(n: number) { return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

export default function FeeCalculatorPage() {
  const [countryIso, setCountryIso] = useState('NL')
  const [unit, setUnit] = useState<Unit>('kg')
  const [inputs, setInputs] = useState<Inputs>({ paper: 0, plastic: 0, glass: 0, steel: 0, aluminum: 0, wood: 0 })

  const tariffs = TARIFFS[countryIso]

  const fees = useMemo(() => {
    return MATERIALS.map((m) => {
      const rate = tariffs?.[m] ?? null
      const volKg = toKg(inputs[m] || 0, unit)
      const fee = rate == null ? 0 : volKg * rate
      return { material: m, rate, volKg, fee }
    })
  }, [tariffs, inputs, unit])

  const total = fees.reduce((acc, r) => acc + (r.rate == null ? 0 : r.fee), 0)

  function setInput(m: Material, v: number) {
    setInputs(prev => ({ ...prev, [m]: isFinite(v) && v >= 0 ? v : 0 }))
  }

  function resetAll() {
    setInputs({ paper: 0, plastic: 0, glass: 0, steel: 0, aluminum: 0, wood: 0 })
  }

  function downloadCSV() {
    const rows = [
      ['Country', countryIso],
      ['Unit', unit],
      [],
      ['Material', 'Rate (EUR/kg)', `Volume (${unit})`, ...(unit === 'tonnes' ? ['Volume (kg)'] : []), 'Fee (EUR)'],
      ...fees.map(r => [
        r.material,
        r.rate == null ? '' : r.rate,
        inputs[r.material as Material],
        ...(unit === 'tonnes' ? [r.volKg] : []),
        r.rate == null ? '' : r.fee
      ]),
      [],
      ['Total', '', '', ...(unit === 'tonnes' ? [''] : []), total]
    ]
    const csv = rows.map(r => r.map(x => typeof x === 'string' ? x : (Number.isFinite(x) ? String(x) : '')).join(',')).join('\\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fee_calc_${countryIso}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fc-shell">
      <h1 className="fc-title">Fee Calculator</h1>
      <p className="fc-sub">Estimate EPR fees from annual placed-on-market volumes. Demo tariffs, EUR/kg.</p>

      <section className="fc-card fc-grid">
        {/* Country */}
        <div className="fc-field">
          <div className="fc-label">Country</div>
          <div className="fc-select-wrap">
            <select
              className="fc-select"
              value={countryIso}
              onChange={(e) => setCountryIso(e.target.value)}
            >
              {EU_COUNTRIES.map(c => (
                <option key={c.iso} value={c.iso}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Unit */}
        <div className="fc-field">
          <div className="fc-label">Input unit</div>
          <div className="fc-segment">
            {(['kg', 'tonnes'] as Unit[]).map(u => (
              <button
                key={u}
                type="button"
                className={`fc-seg ${unit === u ? 'is-active' : ''}`}
                onClick={() => setUnit(u)}
              >
                {u}
              </button>
            ))}
          </div>
          <div className="fc-help">We convert tonnes → kg internally.</div>
        </div>

        {/* Actions */}
        <div className="fc-field fc-actions">
          <div className="fc-label">Actions</div>
          <div className="fc-actions-row">
            <button type="button" onClick={resetAll} className="btn btn-ghost">Reset</button>
            <button type="button" onClick={downloadCSV} className="btn btn-primary">Download CSV</button>
          </div>
        </div>
      </section>

      <section className="fc-card">
        <div className="fc-table-wrap">
          <table className="fc-table">
            <thead>
              <tr>
                <th className="left">Material</th>
                <th className="right">Rate (EUR/kg)</th>
                <th className="right">Volume ({unit})</th>
                {unit === 'tonnes' && <th className="right">Volume (kg)</th>}
                <th className="right">Fee (EUR)</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((r) => {
                const m = r.material as Material
                const disabled = r.rate == null
                return (
                  <tr key={m}>
                    <td className="left cap">{m}</td>
                    <td className="right">{r.rate == null ? '—' : fmt(r.rate)}</td>
                    <td className="right">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={inputs[m] || 0}
                        disabled={disabled}
                        onChange={(e) => setInput(m, parseFloat(e.target.value))}
                        className="fc-input"
                      />
                    </td>
                    {unit === 'tonnes' && <td className="right">{fmt(r.volKg)}</td>}
                    <td className="right">{r.rate == null ? '—' : fmt(r.fee)}</td>
                  </tr>
                )
              })}
              <tr className="fc-total">
                <td className="left">Total</td>
                <td></td>
                <td></td>
                {unit === 'tonnes' && <td></td>}
                <td className="right">{fmt(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p className="fc-note">
        Note: Rates shown are demo placeholders for the MVP. Real EPR fees are scheme- and year-specific.
      </p>
    </div>
  )
}
