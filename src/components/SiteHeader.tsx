"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/tools", label: "Tools" },
  { href: "/alerts", label: "Alerts" },
  { href: "/vault", label: "Vault" },
  { href: "/health", label: "Health" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full header-colorful">
      <div className="container-narrow h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-slate-900">
            EPR / PPWR Directory
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "nav-link-active" : "nav-link"}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-slate-500">
            Demo plan:
          </span>
          <span className="badge-soft">pro</span>
          <Link href="/login" className="ml-2 text-sm nav-link">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
