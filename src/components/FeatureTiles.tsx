'use client';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

type Tile = { title: string; desc: string; href: string };

const tiles: Tile[] = [
  { title: 'EU Directory', desc: 'Country playbooks, PROs, contacts, compliance scope.', href: '/features' },
  { title: 'Fee Calculators', desc: 'Estimate EPR fees by material mix & volume.', href: '/tools' },
  { title: 'Change Alerts', desc: 'Watchlists & notifications on regulatory changes.', href: '/alerts' },
  { title: 'Evidence Vault', desc: 'Registration numbers, certificates, renewals.', href: '/vault' },
  { title: 'API', desc: 'Validate orders & IDs in checkout, sync data to EPR.', href: '/api/docs' },
];

export default function FeatureTiles() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {tiles.map((t) => (
        <Link
          key={t.title}
          href={t.href}
          className="card-colorful group transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-2xl"
          aria-label={t.title}
        >
          <div className="inner p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.title}</h3>
            </div>
            <p className="mt-2 text-slate-600">{t.desc}</p>
            <span className="mt-4 inline-block text-sm underline opacity-80 group-hover:opacity-100">Open</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
