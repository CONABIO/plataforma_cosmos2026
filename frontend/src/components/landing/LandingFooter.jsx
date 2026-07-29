import React from 'react'

export default function LandingFooter() {
  return (
    <footer className="bg-musgo-900 text-arena-200/80 py-14">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid sm:grid-cols-3 gap-10">
          <div>
            <p className="font-display text-xl font-semibold text-arena-100">CoSMoS</p>
            <p className="mt-3 text-sm leading-relaxed max-w-xs">
              Conservación y Uso Sostenible en Montañas y Sierras. Una alianza CONANP–CONABIO con cooperación México–Alemania.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-arena-100/70 mb-3">Socios</p>
            <ul className="text-sm space-y-1.5">
              <li>CONANP</li>
              <li>CONABIO</li>
              <li>KfW Banco de Desarrollo</li>
            </ul>
          </div>
          {/* Espacio para el contacto
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-arena-100/70 mb-3">Contacto</p>
            <p className="text-sm">contacto@cosmos-anp.mx</p>
          </div>
          */}
        </div>
        <div className="mt-12 pt-6 border-t border-musgo-700/60 text-xs text-arena-200/50">
          © {new Date().getFullYear()} CoSMoS — Plataforma de divulgación comunitaria para Áreas Naturales Protegidas de México.
        </div>
      </div>
    </footer>
  )
}
