import React from 'react'
import sobreImg from '../../assets/images/sobre-cosmos.jpg'

const sombra = { textShadow: '0 2px 12px rgba(0,0,0,0.85)' }
const sombraFuerte = { textShadow: '0 2px 16px rgba(0,0,0,0.95)' }

const LINEAS = [
  { numero: '01', titulo: 'Manejo efectivo de las ANP', texto: 'Equipamiento técnico, brigadas permanentes de protección contra incendios forestales y monitoreo biológico en 19 áreas naturales protegidas.' },
  { numero: '02', titulo: 'Restauración de ecosistemas', texto: 'Iniciativas lideradas por organizaciones locales que recuperan suelos, cuencas y cobertura forestal dentro de las áreas protegidas.' },
  { numero: '03', titulo: 'Economías locales sostenibles', texto: 'Acompañamiento técnico a emprendimientos comunitarios que aprovechan responsablemente los bienes y servicios de las sierras y montañas.' },
  { numero: '04', titulo: 'Divulgación ambiental', texto: 'Herramientas y materiales para mejorar la comunicación y educación ambiental comunitaria en torno a las ANP.' },
]

export default function SobreCosmos() {
  return (
    <section id="sobre-cosmos" className="relative py-24 sm:py-32 overflow-hidden">
      <img src={sobreImg} alt="Sierra en Área Natural Protegida de México" className="absolute inset-0 w-full h-full object-cover" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-ocre-400 mb-4" style={sombra}>Sobre CoSMoS</p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-white leading-tight" style={sombraFuerte}>
            Un proyecto de cooperación binacional para el corazón montañoso de México
          </h2>
          <p className="mt-6 text-white leading-relaxed" style={sombra}>
            En el marco de la cooperación entre México y Alemania, CoSMoS materializa acciones de conservación y uso sostenible en el Eje Neovolcánico y el Altiplano. Es una alianza entre CONANP y CONABIO, con financiamiento de KfW Banco de Desarrollo.
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 gap-5">
          {LINEAS.map((l) => (
            <div key={l.numero} className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-black/40 transition-colors">
              <span className="font-mono text-sm text-ocre-400" style={sombra}>{l.numero}</span>
              <h3 className="mt-3 font-display text-xl font-semibold text-white" style={sombra}>{l.titulo}</h3>
              <p className="mt-3 text-sm text-white/80 leading-relaxed" style={sombra}>{l.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
