import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function Mapa() {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)
  const [anpSeleccionada, setAnpSeleccionada] = useState(null)

  useEffect(() => {
    if (instanceRef.current || !mapRef.current) return

    const map = L.map(mapRef.current, {
      center: [19.5, -99.5],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: true,
    })
    instanceRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    const estiloANP = {
      color: '#1f3d2b', weight: 1.5, fillColor: '#3e6b4f', fillOpacity: 0.4,
    }
    const estiloANPHover = {
      color: '#1f3d2b', weight: 2.5, fillOpacity: 0.65,
    }
    const estiloANPSeleccionado = {
      color: '#b6622b', weight: 2.5, fillColor: '#b6622b', fillOpacity: 0.5,
      stroke: true, opacity: 1,
    }

    let capaSeleccionada = null

    fetch('/geojson/cosmos_poligonos.geojson')
      .then(r => r.json())
      .then(data => {
        L.geoJSON(data, {
          style: estiloANP,
          onEachFeature: (feature, layer) => {
            const p = feature.properties
            const sup = p.SUPERFICIE
              ? `${p.SUPERFICIE.toLocaleString('es-MX', { maximumFractionDigits: 0 })} ha`
              : 'N/D'

            layer.on({
              mouseover: e => {
                if (capaSeleccionada !== layer) {
                  e.target.setStyle(estiloANPHover)
                }
                e.target.bringToFront()
                layer.bindTooltip(p.NOMBRE, {
                  sticky: true,
                  className: 'anp-tooltip',
                }).openTooltip()
              },
              mouseout: e => {
                if (capaSeleccionada !== layer) {
                  e.target.setStyle(estiloANP)
                }
                layer.closeTooltip()
              },
              click: e => {
                layer.closeTooltip()
                layer.unbindTooltip()
                if (capaSeleccionada && capaSeleccionada !== layer) {
                  capaSeleccionada.setStyle(estiloANP)
                }
                capaSeleccionada = layer
                layer.setStyle(estiloANPSeleccionado)
                setAnpSeleccionada({
                  nombre: p.NOMBRE,
                  categoria: p.CAT_MANEJO,
                  estado: p.ESTADOS,
                  superficie: sup,
                })
                L.DomEvent.stopPropagation(e)
              },
            })
          },
        }).addTo(map)
      })

    // Click en el mapa fuera de un polígono = deseleccionar
    map.on('click', () => {
      if (capaSeleccionada) {
        capaSeleccionada.setStyle(estiloANP)
        capaSeleccionada = null
      }
      setAnpSeleccionada(null)
    })

    return () => { map.remove(); instanceRef.current = null }
  }, [])

  return (
    <section id="mapa" className="py-24 sm:py-32 bg-arena-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-ocre-500 mb-4">Mapa</p>
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-musgo-900 leading-tight max-w-2xl">
            19 áreas naturales protegidas, una sola red de cuidado
          </h2>
          <p className="text-carbon-800/70 max-w-sm text-sm leading-relaxed">
            Haz clic sobre cualquier polígono verde para ver la información del área natural protegida.
          </p>
        </div>

        <div className="relative">
          <div ref={mapRef} className="w-full rounded-2xl overflow-hidden border border-musgo-900/10 shadow-sm" style={{ height: '560px' }} />

          {/* Panel de información — aparece sobre el mapa al seleccionar un ANP */}
          {anpSeleccionada && (
            <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg border border-musgo-900/10 p-5 w-64 z-[1000]">
              <button
                onClick={() => setAnpSeleccionada(null)}
                className="absolute top-3 right-3 text-carbon-800/40 hover:text-carbon-800 text-lg leading-none"
              >
                ✕
              </button>
              <p className="font-display font-semibold text-musgo-900 text-base leading-snug pr-6">
                {anpSeleccionada.nombre}
              </p>
              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wide text-carbon-800/40">Categoría</p>
                  <p className="text-sm text-carbon-800/80">{anpSeleccionada.categoria}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wide text-carbon-800/40">Estado(s)</p>
                  <p className="text-sm text-carbon-800/80">{anpSeleccionada.estado}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wide text-carbon-800/40">Superficie</p>
                  <p className="text-sm text-ocre-500 font-medium">{anpSeleccionada.superficie}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-carbon-800/60 font-mono">
          <span className="inline-block w-4 h-3 rounded-sm" style={{ background: '#3e6b4f', opacity: 0.7 }} />
          Área Natural Protegida — haz clic para ver detalles
        </div>
      </div>
    </section>
  )
}
