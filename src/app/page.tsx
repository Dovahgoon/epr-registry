// src/app/page.tsx
import Hero from "@/components/Hero"
import QuickActions from "@/components/QuickActions"
import CountryGrid from "@/components/CountryGrid"

export default function HomePage(){
  return (
    <>
      <Hero />
      <QuickActions />
      <CountryGrid />
    </>
  )
}
