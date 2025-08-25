// src/components/Hero.tsx
export default function Hero(){
  return (
    <section className="hero" style={{marginBottom:28}}>
      <div className="card pad">
        <h1
          style={{
            margin: "6px 0 8px",
            fontSize: 28,               // slightly smaller
            fontWeight: 750,
            letterSpacing: "-0.02em",
            background: "linear-gradient(90deg, #7c3aed 0%, #ec4899 50%, #6d28d9 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent"
          }}
        >
          Packaging EPR / PPWR playbooks
        </h1>
        <p style={{margin:0,color:"var(--muted)",lineHeight:1.6}}>
          Fast overview of obligations, regulators, PROs, and live fees by material for every EU market.
        </p>
        <div style={{display:"flex",gap:10,marginTop:16}}>
          <button className="cta">Start Free</button>
          <a
            className="cta"
            href="/tools/fee-calculator"
            style={{
              background: "linear-gradient(90deg, #e879f9 0%, #60a5fa 100%)",
              color: "white",
              borderColor: "transparent"
            }}
          >
            Open Fee Calculator
          </a>
        </div>
      </div>
      <div className="card pad">
        <div
          className="section-title"
          style={{
            fontSize: 22, // smaller
            background: "linear-gradient(90deg, #7c3aed 0%, #ec4899 50%, #6d28d9 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent"
          }}
        >
          Quick filters
        </div>
        <div className="pillbar">
          <button className="pill active">EU</button>
          <button className="pill">Packaging</button>
          <button className="pill">WEEE</button>
          <button className="pill">Batteries</button>
          <button className="pill">Textiles</button>
        </div>
        <div style={{marginTop:14,color:"var(--muted)",fontSize:13}}>
          Use filters to jump to the right scheme and fees.
        </div>
      </div>
    </section>
  )
}
