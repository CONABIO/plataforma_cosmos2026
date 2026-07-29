import React, { useState } from 'react'

const ENLACES = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#sobre-cosmos', label: 'Sobre CoSMoS' },
  { href: '#mapa', label: 'Mapa' },
  { href: '#galeria', label: 'Galería' },
  { href: '#materiales', label: 'Materiales' },
  { href: '#planeaciones', label: 'Planeaciones' },
]

export default function LandingNav() {
  const [abierto, setAbierto] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-musgo-900/25 backdrop-blur-md border-b border-arena-100/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between drop-shadow-md">
        <a href="#inicio" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-xl font-semibold text-arena-100 tracking-wide">CoSMoS</span>
          <span className="hidden sm:inline text-[11px] font-mono uppercase tracking-widest text-arena-200/80 mt-0.5">ANP México</span>
        </a>

        <nav className="hidden lg:flex items-center gap-7">
          {ENLACES.map((e) => (
            <a key={e.href} href={e.href} className="text-sm text-arena-200/90 hover:text-arena-100 transition-colors">
              {e.label}
            </a>
          ))}
        </nav>

        <button onClick={() => setAbierto((v) => !v)} className="lg:hidden text-arena-100 p-2" aria-label="Abrir menú">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {abierto && (
        <nav className="lg:hidden bg-musgo-900 border-t border-musgo-700/60 px-5 py-4 flex flex-col gap-4">
          {ENLACES.map((e) => (
            <a key={e.href} href={e.href} onClick={() => setAbierto(false)} className="text-sm text-arena-200">
              {e.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
