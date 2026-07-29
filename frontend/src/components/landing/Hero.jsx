import React from 'react'
import heroImg from '../../assets/images/hero.jpg'

{/* 
const CIFRAS = [
  { valor: '19', etiqueta: 'ANP fortalecidas' },
  { valor: '44', etiqueta: 'Brigadas de manejo del fuego y monitoreo' },
  { valor: '2,255 ha', etiqueta: 'En restauración ecológica' },
  { valor: '111', etiqueta: 'Emprendimientos comunitarios acompañados' },
]
*/}

const sombra = { textShadow: '0 2px 12px rgba(0,0,0,0.85)' }
const sombraFuerte = { textShadow: '0 2px 16px rgba(0,0,0,0.95)' }

export default function Hero() {
  return (
    <section id="inicio" className="relative text-arena-100 overflow-hidden pt-16 bg-musgo-900">
      <img
        src={heroImg}
        alt="Paisaje de montaña en un Área Natural Protegida de México"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-20 pb-28 sm:pt-28 sm:pb-36">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-white mb-5" style={sombra}>
          19° 26′ N · Eje Neovolcánico · México
        </p>
        <h1 className="font-display text-5xl sm:text-7xl font-semibold leading-[1.05] max-w-3xl" style={sombraFuerte}>
          Montañas y sierras que se cuidan desde la comunidad.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-white max-w-2xl font-semibold leading-relaxed" style={sombra}>
          CoSMoS — Conservación y Uso Sostenible en Montañas y Sierras — fortalece el manejo de Áreas Naturales Protegidas en el centro de México.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a href="#sobre-cosmos" className="bg-ocre-500 hover:bg-ocre-400 text-arena-100 font-medium px-6 py-3 rounded-full transition-colors shadow-lg">
            Conoce el proyecto
          </a>
          <a href="#mapa" className="border border-white/60 hover:border-white bg-black/20 backdrop-blur-sm px-6 py-3 rounded-full transition-colors text-white">
            Explorar el mapa
          </a>
        </div>
        {/* 

        <dl className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 border-t border-white/20 pt-10">
          {CIFRAS.map((c) => (
            <div key={c.etiqueta}>
              <dt className="font-display text-3xl sm:text-4xl text-ocre-400" style={sombra}>{c.valor}</dt>
              <dd className="mt-2 text-sm text-white/90 leading-snug max-w-[16rem]" style={sombra}>{c.etiqueta}</dd>
            </div>
          ))}
        </dl>
        */}

      </div>
    </section>
  )
}
