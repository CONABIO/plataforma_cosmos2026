import React from 'react'
import LandingNav from '../components/landing/LandingNav.jsx'
import Hero from '../components/landing/Hero.jsx'
import SobreCosmos from '../components/landing/SobreCosmos.jsx'
import Mapa from '../components/landing/Mapa.jsx'
import Galeria from '../components/landing/Galeria.jsx'
import Materiales from '../components/landing/Materiales.jsx'
import Planeaciones from '../components/landing/Planeaciones.jsx'
import LandingFooter from '../components/landing/LandingFooter.jsx'

export default function Home() {
  return (
    <div className="font-sans">
      <LandingNav />
      <Hero />
      <SobreCosmos />
      <Mapa />
      <Galeria />
      <Materiales />
      <Planeaciones />
      <LandingFooter />
    </div>
  )
}
