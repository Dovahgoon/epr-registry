// src/app/pricing/page.tsx
function Plan({name,price,cta,features}:{name:string,price:string,cta:string,features:string[]}){
  return (
    <div className="card pad" style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
        <h3 style={{margin:0,fontWeight:700}}>{name}</h3>
        <div style={{fontSize:24,fontWeight:800}}>{price}</div>
      </div>
      <ul style={{margin:0,padding:'0 0 0 16px',color:'var(--muted)'}}>
        {features.map((f,i)=>(<li key={i} style={{margin:'6px 0'}}>{f}</li>))}
      </ul>
      <div>
        <a className="cta" href="/checkout">{cta}</a>
      </div>
    </div>
  )
}

export default function PricingPage(){
  return (
    <div style={{padding:'10px 0 40px'}}>
      <h1 style={{fontSize:28,fontWeight:750,letterSpacing:'-0.02em',margin:'0 0 16px'}}>Pricing</h1>
      <p style={{color:'var(--muted)',margin:'0 0 24px'}}>Transparent plans for teams of any size.</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        <Plan
          name="Demo"
          price="€0"
          cta="Start Free"
          features={[
            '3 EU markets',
            'Fee calculator (demo tariffs)',
            'Playbooks (summary)',
          ]}
        />
        <Plan
          name="Pro"
          price="€149/mo"
          cta="Go Pro"
          features={[
            'All EU markets',
            'Live tariffs API',
            'Change alerts',
            'Download CSV/PDF',
          ]}
        />
        <Plan
          name="Enterprise"
          price="Let’s talk"
          cta="Contact Sales"
          features={[
            'SSO & audit trail',
            'Custom feeds & exports',
            'SLA & support',
          ]}
        />
      </div>
    </div>
  )
}
