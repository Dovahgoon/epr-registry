// src/app/country/[iso]/page.tsx
import dynamic from 'next/dynamic';
const CountryClient = dynamic(() => import('./CountryClient'), { ssr: false });

export default function Page({ params }: { params: { iso: string } }) {
  const iso = (params.iso || '').toUpperCase();
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-violet-500 via-sky-500 to-fuchsia-500 bg-clip-text text-transparent">
          {iso}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{iso}</p>
      </header>
      <CountryClient iso={iso} />
    </div>
  );
}
