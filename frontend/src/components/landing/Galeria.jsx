import React, { useState, useEffect } from 'react'

const ANP = [
  { id: 'mariposa-monarca', nombre: 'RB Mariposa Monarca', categoria: 'Reserva de la Biosfera', estado: 'Michoacán y Estado de México' },
  { id: 'barranca-meztitlan', nombre: 'Barranca de Metztitlán', categoria: 'Reserva de la Biosfera', estado: 'Hidalgo' },
  { id: 'veladero', nombre: 'PN El Veladero', categoria: 'Parque Nacional', estado: 'Guerrero' },
  { id: 'sierra-huautla', nombre: 'Sierra de Huautla', categoria: 'Reserva de la Biosfera', estado: 'Morelos' },
]

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/api/v1')

function Carrusel({ anpId }) {
  const [fotos, setFotos] = useState([])
  const [indice, setIndice] = useState(0)
  const [ampliada, setAmpliada] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    setCargando(true)
    setIndice(0)
    fetch(`${API_BASE}/galeria/${anpId}`)
      .then(r => r.json())
      .then(data => { setFotos(data.fotos || []); setCargando(false) })
      .catch(() => { setFotos([]); setCargando(false) })
  }, [anpId])

  const urlFoto = (nombre) => `${API_BASE}/galeria/${anpId}/${nombre}`

  function anterior() { setIndice(i => (i - 1 + fotos.length) % fotos.length) }
  function siguiente() { setIndice(i => (i + 1) % fotos.length) }

  if (cargando) return (
    <div className="aspect-[16/9] rounded-xl bg-musgo-800/40 flex items-center justify-center">
      <svg className="animate-spin w-8 h-8 text-arena-200/50" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  )

  if (fotos.length === 0) return (
    <div className="aspect-[16/9] rounded-xl border-2 border-dashed border-arena-100/20 flex flex-col items-center justify-center gap-2 text-arena-200/40">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <p className="text-xs font-mono text-center px-4">
        Agrega fotos en<br />
        <span className="text-ocre-400">cosmos_2/galeria/{anpId}/</span>
      </p>
    </div>
  )

  return (
    <>
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden group">
        <img
          src={urlFoto(fotos[indice])}
          alt={`Foto ${indice + 1}`}
          className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
          onClick={() => setAmpliada(true)}
        />

        {/* Flechas */}
        {fotos.length > 1 && (
          <>
            <button onClick={anterior}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100">
              ‹
            </button>
            <button onClick={siguiente}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100">
              ›
            </button>
          </>
        )}

        {/* Contador */}
        {fotos.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-mono px-2 py-1 rounded-full">
            {indice + 1} / {fotos.length}
          </div>
        )}

        {/* Puntos */}
        {fotos.length > 1 && fotos.length <= 10 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {fotos.map((_, i) => (
              <button key={i} onClick={() => setIndice(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === indice ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {ampliada && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setAmpliada(false)}>
          <button className="absolute top-5 right-5 text-white/80 hover:text-white text-3xl font-light"
            onClick={() => setAmpliada(false)}>✕</button>
          {fotos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); anterior() }}
              className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl">
              ‹
            </button>
          )}
          <img src={urlFoto(fotos[indice])} alt={`Foto ${indice + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={e => e.stopPropagation()} />
          {fotos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); siguiente() }}
              className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl">
              ›
            </button>
          )}
          <p className="absolute bottom-5 text-white/50 text-sm font-mono">{indice + 1} / {fotos.length}</p>
        </div>
      )}
    </>
  )
}

export default function Galeria() {
  const [anpActiva, setAnpActiva] = useState(ANP[0].id)
  const anp = ANP.find(a => a.id === anpActiva)

  return (
    <section id="galeria" className="py-24 sm:py-32 bg-musgo-900 text-arena-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-ocre-400 mb-4">Galería</p>
        <h2 className="font-display text-4xl sm:text-5xl font-semibold leading-tight max-w-2xl mb-10">
          Áreas naturales protegidas en imágenes
        </h2>

        <div className="flex flex-wrap gap-3 mb-6">
          {ANP.map(a => (
            <button key={a.id} onClick={() => setAnpActiva(a.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                anpActiva === a.id
                  ? 'bg-ocre-500 text-arena-100'
                  : 'border border-arena-100/30 text-arena-200/80 hover:border-ocre-400 hover:text-ocre-400'
              }`}>
              {a.nombre}
            </button>
          ))}
        </div>

        <p className="text-sm text-arena-200/60 font-mono mb-6">{anp.categoria} · {anp.estado}</p>

        <Carrusel anpId={anpActiva} />
      </div>
    </section>
  )
}
