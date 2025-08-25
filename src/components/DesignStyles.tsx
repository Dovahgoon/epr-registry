// src/components/DesignStyles.tsx
'use client'

export default function DesignStyles() {
  return (
    <style jsx global>{`
      *{box-sizing:border-box}
      :root{
        --bg: #fafafc;
        --fg: #0f172a; /* slate-900 */
        --muted: #64748b; /* slate-500 */
        --card: rgba(255,255,255,0.7);
        --border: rgba(15,23,42,0.12);
        --ring: rgba(99,102,241,0.35);
      }
      body{margin:0;background:var(--bg);color:var(--fg);}
      .container{max-width:1100px;margin:0 auto;padding:40px 20px;}
      .nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.7);backdrop-filter:saturate(1.1) blur(8px);border-bottom:1px solid var(--border)}
      .nav-inner{max-width:1100px;margin:0 auto;display:flex;gap:18px;align-items:center;padding:12px 20px}
      .brand{font-weight:700;letter-spacing:-0.02em}
      .tabs{display:none;gap:16px;align-items:center}
      @media (min-width: 820px){ .tabs{display:flex} }
      .tab{font-size:14px;color:var(--muted);text-decoration:none}
      .tab:hover{color:var(--fg);text-decoration:underline;text-underline-offset:4px}
      .pillbar{display:inline-flex;gap:6px;border:1px solid var(--border);background:var(--card);padding:6px;border-radius:999px;box-shadow:0 2px 10px rgba(2,6,23,0.04)}
      .pill{padding:6px 12px;border-radius:999px;font-size:13px;color:var(--muted);background:transparent;border:0;cursor:pointer}
      .pill.active{background:rgba(99,102,241,0.10);color:#6366f1}
      .hero{display:grid;grid-template-columns:1.1fr 0.9fr;gap:24px;align-items:center}
      @media (max-width: 860px){ .hero{grid-template-columns:1fr} }
      .card{border:1px solid var(--border);background:var(--card);backdrop-filter:saturate(1.1) blur(6px);border-radius:18px;box-shadow:0 6px 30px rgba(2,6,23,0.06)}
      .card.pad{padding:18px}
      .cta{display:inline-flex;gap:8px;align-items:center;padding:10px 14px;border-radius:12px;border:1px solid var(--border);background:white;cursor:pointer}
      .cta:hover{box-shadow:0 4px 24px rgba(99,102,241,0.18)}
      .grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
      @media (max-width: 1024px){ .grid{grid-template-columns:repeat(4,1fr)} }
      @media (max-width: 720px){ .grid{grid-template-columns:repeat(2,1fr)} }
      .country{padding:12px;border-radius:14px;border:1px solid var(--border);background:white;text-align:center;font-size:14px}
      .country:hover{box-shadow:0 8px 30px rgba(244,114,182,0.18)}
      .section-title{font-weight:650;letter-spacing:-0.01em;margin:18px 0 10px}
    `}</style>
  )
}
