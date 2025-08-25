// src/components/CountryGrid.tsx
import Link from 'next/link'
import { COUNTRIES } from '@/data/countries'

export default function CountryGrid(){
  // Keep exact visual from canvas, but use dynamic EU list
  return (
    <section>
      <div className="section-title">EU Markets</div>
      <div className="grid">
        {COUNTRIES.map(c => (
          <Link key={c.iso} className="country" href={`/country/${c.iso}`}>
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
