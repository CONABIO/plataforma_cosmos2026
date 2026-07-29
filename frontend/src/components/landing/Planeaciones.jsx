import React, { useState, useEffect, useRef } from 'react'
import api from '../../services/api.js'
import PlaneacionPreview from './PlaneacionPreview.jsx'

const TEMAS = [
  { value: 'prevencion_incendios_forestales', label: 'Prevención de incendios forestales' },
  { value: 'fauna_silvestre_convivencia_responsable', label: 'Fauna silvestre y convivencia responsable' },
  { value: 'importancia_cuidado_agua', label: 'Importancia y cuidado del agua' },
  { value: 'servicios_ecosistemicos', label: 'Servicios ecosistémicos' },
  { value: 'especies_invasoras', label: 'Especies invasoras' },
  { value: 'turismo_responsable', label: 'Turismo responsable' },
  { value: 'restauracion_ecologica', label: 'Restauración ecológica' },
]

const RANGOS = [
  { value: 'infantil_4_7', label: 'Infantil (4–7 años)' },
  { value: 'ninez_8_12', label: 'Niñez (8–12 años)' },
  { value: 'adolescentes_13_17', label: 'Adolescentes (13–17 años)' },
  { value: 'adultos_18_mas', label: 'Adultos (18+ años)' },
  { value: 'todas_las_edades', label: 'Todas las edades' },
]

export default function Planeaciones() {
  const [form, setForm] = useState({
    tema: '', rango_edad: '', duracion_minutos: 60,
    numero_participantes: '', contexto_adicional: '',
  })
  const [resultado, setResultado] = useState(null)
  const [generando, setGenerando] = useState(false)
  const [mensajeEstado, setMensajeEstado] = useState('')
  const [error, setError] = useState('')
  const [alturaFormulario, setAlturaFormulario] = useState(500)
  const pollingRef = useRef(null)
  const formularioRef = useRef(null)

  // Medir la altura del formulario en tiempo real
  useEffect(() => {
    if (!formularioRef.current) return
    const observer = new ResizeObserver(() => {
      if (formularioRef.current) {
        setAlturaFormulario(formularioRef.current.offsetHeight)
      }
    })
    observer.observe(formularioRef.current)
    return () => observer.disconnect()
  }, [])

  function detenerPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  useEffect(() => { return () => detenerPolling() }, [])

  async function iniciarPolling(id) {
    const mensajes = [
      'El modelo está procesando tu solicitud…',
      'Generando objetivos y mensajes clave…',
      'Construyendo las etapas del taller…',
      'Elaborando actividades y recomendaciones…',
      'Casi listo, revisando la estructura…',
    ]
    let i = 0
    setMensajeEstado(mensajes[0])
    pollingRef.current = setInterval(async () => {
      i = (i + 1) % mensajes.length
      setMensajeEstado(mensajes[i])
      try {
        const data = await api.get(`/ia/planeaciones/${id}`).then(r => r.data)
        if (data.estado === 'listo') {
          detenerPolling()
          setResultado(data)
          setGenerando(false)
          setMensajeEstado('')
        } else if (data.estado === 'error') {
          detenerPolling()
          setError('Error al generar: ' + (data.error_mensaje || 'intenta de nuevo'))
          setGenerando(false)
          setMensajeEstado('')
        }
      } catch { }
    }, 10000)
  }

  async function manejarSubmit(e) {
    e.preventDefault()
    setGenerando(true)
    setError('')
    setResultado(null)
    setMensajeEstado('Enviando solicitud…')
    try {
      const payload = {
        ...form,
        duracion_minutos: Number(form.duracion_minutos),
        numero_participantes: form.numero_participantes ? Number(form.numero_participantes) : null,
      }
      const data = await api.post('/ia/planeaciones', payload).then(r => r.data)
      setMensajeEstado('Solicitud recibida, generando planeación…')
      await iniciarPolling(data.id)
    } catch {
      setError('No fue posible enviar la solicitud. Verifica que el servidor esté activo.')
      setGenerando(false)
      setMensajeEstado('')
    }
  }

  async function descargarPDF() {
    if (!resultado) return
    setError('')
    try {
      const { pdf_url } = await api.post(`/ia/planeaciones/${resultado.id}/pdf`).then(r => r.data)
      window.open(`http://localhost:5173${pdf_url}`, '_blank')
    } catch (err) {
      setError('No fue posible generar el PDF. ' + (err.response?.data?.detail || ''))
    }
  }

  return (
    <section id="planeaciones" className="py-24 sm:py-32 bg-musgo-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-ocre-500 mb-4">Planeaciones con IA</p>
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-musgo-900 leading-tight max-w-xl">
            Genera tu planeación de taller automáticamente
          </h2>
          <p className="text-carbon-800/70 text-sm max-w-sm leading-relaxed">
            Completa el formulario y la IA generará una planeación con el Modelo de las 5E, lista para usar y descargable en PDF.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Formulario */}
          <div ref={formularioRef} className="bg-white border border-musgo-900/10 rounded-2xl p-7 shadow-sm">
            <form onSubmit={manejarSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-musgo-900 mb-1">Tema ambiental *</label>
                  <select required value={form.tema} onChange={(e) => setForm({ ...form, tema: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-musgo-500">
                    <option value="">Selecciona…</option>
                    {TEMAS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-musgo-900 mb-1">Rango de edad *</label>
                  <select required value={form.rango_edad} onChange={(e) => setForm({ ...form, rango_edad: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-musgo-500">
                    <option value="">Selecciona…</option>
                    {RANGOS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-musgo-900 mb-1">Duración (minutos)</label>
                  <input type="number" min="15" value={form.duracion_minutos}
                    onChange={(e) => setForm({ ...form, duracion_minutos: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-musgo-900 mb-1">Participantes (opcional)</label>
                  <input type="number" min="1" value={form.numero_participantes}
                    onChange={(e) => setForm({ ...form, numero_participantes: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-musgo-900 mb-1">Contexto adicional (opcional)</label>
                <textarea rows={3} value={form.contexto_adicional}
                  onChange={(e) => setForm({ ...form, contexto_adicional: e.target.value })}
                  placeholder="Ej. taller en escuela rural, espacio al aire libre, recursos limitados…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={generando}
                className="w-full bg-musgo-700 hover:bg-musgo-900 text-arena-100 font-medium py-3 rounded-lg transition-colors disabled:opacity-60">
                {generando ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generando…
                  </span>
                ) : 'Generar planeación'}
              </button>
            </form>
          </div>

          {/* Previsualización — misma altura exacta que el formulario */}
          <div
            className="bg-white border border-musgo-900/10 rounded-2xl shadow-sm flex flex-col overflow-hidden"
            style={{ height: alturaFormulario }}
          >
            {!resultado && !generando && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-carbon-800/40 p-7">
                <span className="text-4xl">📋</span>
                <p className="text-sm font-mono">La planeación generada aparecerá aquí</p>
              </div>
            )}
            {generando && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-musgo-700 p-7">
                <svg className="animate-spin w-10 h-10" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <p className="text-sm font-mono text-musgo-700/80 text-center max-w-xs">{mensajeEstado}</p>
                <p className="text-xs text-carbon-800/40 text-center max-w-xs">Puedes seguir navegando mientras esperas.</p>
              </div>
            )}
            {resultado && (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-musgo-900/10 shrink-0">
                  <div>
                    <h3 className="font-display font-semibold text-musgo-900 text-base leading-snug">{resultado.titulo}</h3>
                    <p className="text-xs text-carbon-800/50 mt-0.5 font-mono">Previsualización — Modelo 5E</p>
                  </div>
                  <button onClick={descargarPDF}
                    className="shrink-0 ml-3 flex items-center gap-1.5 text-xs font-medium text-ocre-500 hover:text-ocre-700 border border-ocre-400 hover:border-ocre-600 px-3 py-1.5 rounded-full transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Descargar PDF
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <PlaneacionPreview contenido={resultado.contenido_generado} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
