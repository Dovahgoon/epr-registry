
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header(){
  const pathname = usePathname()
  const is = (p:string)=> pathname === p

  return (
    <header className="nav brand-gradient">
      <div className="nav-inner">
        <Link className="brand" href="/">EPR / PPWR Directory</Link>
        <nav className="tabs">
          <Link className={is('/features')? 'active': ''} aria-current={is('/features')?'page':undefined} href="/features">Features</Link>
          <Link className={is('/pricing')? 'active': ''} aria-current={is('/pricing')?'page':undefined} href="/pricing">Pricing</Link>
          <Link className={is('/tools')? 'active': ''} aria-current={is('/tools')?'page':undefined} href="/tools">Tools</Link>
          <Link className={is('/alerts')? 'active': ''} aria-current={is('/alerts')?'page':undefined} href="/alerts">Alerts</Link>
          <Link className={is('/vault')? 'active': ''} aria-current={is('/vault')?'page':undefined} href="/vault">Vault</Link>
          <Link className={is('/health')? 'active': ''} aria-current={is('/health')?'page':undefined} href="/health">Health</Link>
        </nav>
        <div style={{marginLeft:'auto',fontSize:12,color:'var(--muted)'}}>Demo plan</div>
      </div>
    </header>
  )
}
