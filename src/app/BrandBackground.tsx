// src/app/BrandBackground.tsx
'use client'
import React from 'react'

export default function BrandBackground(){
  const style: React.CSSProperties = {
    position:'fixed', inset:0, zIndex:-1, pointerEvents:'none',
    backgroundColor:'#fafafc',
    backgroundImage:[
      'radial-gradient(1100px 720px at -12% -18%, rgba(196, 181, 253, 0.32), rgba(196, 181, 253, 0) 58%)', // lavender TL
      'radial-gradient(1050px 650px at 112% -14%, rgba(244, 114, 182, 0.28), rgba(244, 114, 182, 0) 60%)',  // pink TR
      'radial-gradient(1300px 800px at 50% 120%, rgba(251, 207, 232, 0.20), rgba(251, 207, 232, 0) 62%)'   // blush bottom
    ].join(', '),
    backgroundRepeat:'no-repeat',
    backgroundSize:'cover'
  }
  return <div style={style} aria-hidden="true"/>
}
