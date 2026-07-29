import React, { useEffect, useState, useRef } from 'react'

const ICONOS = {
  'Ficha temática': '📄',
  'Guía': '📘',
  'Plantilla': '🖼️',
  'Actividad': '🎲',
  'Planeación': '📋',
  'Diagnóstico': '🔍',
  'Libro': '📚',
  'Otro': '📁',
}

const POR_PAGINA = 5

export default function Materiales() {
  const [materiales, setMateriales] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [pagina, setPagina] = useState(1)
  const busquedaRef = useRef(null)

  useEffect(() => {
    fetch('/materiales/index.json')
      .then(r => r.json())
      .then(data => { setMateriales(data); setCargando(false) })
      .catch(() => { setMateriales([]); setCargando(false) })
  }, [])

  // Resetear página al cambiar filtro o búsqueda
  useEffect(() => { setPagina(1) }, [filtro, busqueda])

  // Calcular sugerencias del dropdown
  useEffect(() => {
    if (busqueda.trim().length < 1) {
      setSugerencias([])
      return
    }
    const termino = busqueda.toLowerCase()
    const coincidencias = materiales
      .filter(m => m.nombre.toLowerCase().includes(termino))
      .slice(0, 8)
    setSugerencias(coincidencias)
  }, [busqueda, materiales])

  const tipos = ['Todos', ...new Set(materiales.map(m => m.tipo))]

  const filtrados = materiales.filter(m => {
    const coincideTipo = filtro === 'Todos' || m.tipo === filtro
    const coincideBusqueda = busqueda.trim() === '' ||
      m.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return coincideTipo && coincideBusqueda
  })

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA)
  const paginados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  function seleccionarSugerencia(m) {
    setBusqueda(m.nombre)
    setSugerencias([])
    setMostrarSugerencias(false)
  }

  return (
    <section id="materiales" className="py-24 sm:py-32 bg-arena-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-ocre-500 mb-4">Materiales</p>
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-musgo-900 leading-tight max-w-xl">
            Recursos de divulgación ambiental
          </h2>
          <p className="text-carbon-800/70 text-sm max-w-sm leading-relaxed">
            Descarga libremente fichas, guías, diagnósticos y materiales de divulgación para talleres comunitarios.
          </p>
        </div>

        {/* Búsqueda con dropdown */}
        <div className="relative mb-6" ref={busquedaRef}>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-musgo-900/40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setMostrarSugerencias(true) }}
              onFocus={() => setMostrarSugerencias(true)}
              onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
              placeholder="Buscar material por nombre…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-musgo-900/20 text-sm focus:outline-none focus:ring-2 focus:ring-musgo-500 bg-white"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-carbon-800/40 hover:text-carbon-800">
                ✕
              </button>
            )}
          </div>

          {/* Dropdown de sugerencias */}
          {mostrarSugerencias && sugerencias.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-musgo-900/10 rounded-xl shadow-lg z-20 overflow-hidden">
              {sugerencias.map((m, i) => (
                <button key={i} onMouseDown={() => seleccionarSugerencia(m)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-musgo-50 transition-colors border-b border-musgo-900/5 last:border-0">
                  <span className="text-lg shrink-0">{ICONOS[m.tipo] || ICONOS['Otro']}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-musgo-900 truncate">{m.nombre}</p>
                    <p className="text-xs text-carbon-800/50 font-mono">{m.tipo}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtros por tipo */}
        {tipos.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tipos.map(t => (
              <button key={t} onClick={() => setFiltro(t)}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  filtro === t
                    ? 'bg-musgo-900 text-arena-100'
                    : 'border border-musgo-900/20 text-musgo-900 hover:border-ocre-500 hover:text-ocre-500'
                }`}>
                {t}
              </button>
            ))}
          </div>
        )}

        {cargando && <p className="text-sm text-carbon-800/50 font-mono">Cargando materiales…</p>}

        {!cargando && filtrados.length === 0 && (
          <div className="border-2 border-dashed border-musgo-900/15 rounded-2xl p-12 text-center">
            <p className="text-4xl mb-4">📂</p>
            <p className="font-display text-xl text-musgo-900 mb-2">
              {busqueda ? `Sin resultados para "${busqueda}"` : 'Aún no hay materiales'}
            </p>
          </div>
        )}

        {!cargando && filtrados.length > 0 && (
          <>
            {/* Contador */}
            <p className="text-xs text-carbon-800/50 font-mono mb-3">
              {filtrados.length} material{filtrados.length !== 1 ? 'es' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
              {totalPaginas > 1 && ` · Página ${pagina} de ${totalPaginas}`}
            </p>

            {/* Lista compacta */}
            <div className="bg-white border border-musgo-900/10 rounded-2xl overflow-hidden">
              {paginados.map((m, i) => (
                <a key={i} href={`/materiales/${m.archivo}`} download
                  className="flex items-center gap-4 px-5 py-4 hover:bg-musgo-50 transition-colors border-b border-musgo-900/5 last:border-0 group">
                  <span className="text-xl shrink-0">{ICONOS[m.tipo] || ICONOS['Otro']}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-musgo-900 group-hover:text-ocre-500 transition-colors truncate">{m.nombre}</p>
                    <p className="text-xs text-carbon-800/50 font-mono mt-0.5">{m.tipo}</p>
                  </div>
                  <svg className="shrink-0 text-musgo-900/30 group-hover:text-ocre-400 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </a>
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
                  className="px-3 py-1.5 rounded-lg text-sm border border-musgo-900/20 text-musgo-900 disabled:opacity-40 hover:border-ocre-500 hover:text-ocre-500 transition-colors disabled:hover:border-musgo-900/20 disabled:hover:text-musgo-900">
                  ← Anterior
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPagina(n)}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                      pagina === n
                        ? 'bg-musgo-900 text-arena-100'
                        : 'border border-musgo-900/20 text-musgo-900 hover:border-ocre-500 hover:text-ocre-500'
                    }`}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
                  className="px-3 py-1.5 rounded-lg text-sm border border-musgo-900/20 text-musgo-900 disabled:opacity-40 hover:border-ocre-500 hover:text-ocre-500 transition-colors disabled:hover:border-musgo-900/20 disabled:hover:text-musgo-900">
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
