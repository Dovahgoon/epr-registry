// src/app/country/[iso]/page.tsx
import dynamic from 'next/dynamic';
const CountryClient = dynamic(() => import('./CountryClient'), { ssr: false });

export default function Page({ params }: { params: { iso: string } }) {
  const iso = (params.iso || '').toUpperCase();
  return <CountryClient iso={iso} />;
}
