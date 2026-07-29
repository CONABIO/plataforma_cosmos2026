import React from 'react'

/**
 * Renderiza el contenido de la planeación con formato visual
 * similar al PDF: encabezados en verde, etapas 5E en ocre, bullets.
 */

const ETAPAS_5E = ['ENGANCHAR', 'EXPLORAR', 'EXPLICAR', 'ELABORAR', 'EVALUAR']

function parsearLinea(linea) {
  // Negritas **texto**
  return linea.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.+?)\*/g, '<em>$1</em>')
}

function clasificarLinea(linea) {
  const texto = linea.trim()
  const textoUpper = texto.toUpperCase().replace(/[#*\d.\)]/g, '').trim()

  if (!texto) return { tipo: 'vacia' }

  // Etapa 5E
  for (const etapa of ETAPAS_5E) {
    if (textoUpper.includes(etapa)) {
      const limpio = texto.replace(/^#+\s*/, '').replace(/^\d+[\.\)]\s*/, '').replace(/\*\*/g, '')
      return { tipo: 'etapa', texto: limpio }
    }
  }

  // Encabezado con #
  if (texto.startsWith('#')) {
    const nivel = texto.match(/^#+/)[0].length
    const limpio = texto.replace(/^#+\s*/, '').replace(/\*\*/g, '')
    return { tipo: nivel === 1 ? 'h1' : 'h2', texto: limpio }
  }

  // Todo mayúsculas (sección)
  const sinMarcas = texto.replace(/\*\*/g, '').replace(/\*/g, '')
  if (sinMarcas.length > 4 && sinMarcas.length < 80 && sinMarcas === sinMarcas.toUpperCase() && !sinMarcas.startsWith('-')) {
    return { tipo: 'h1', texto: sinMarcas }
  }

  // Bullet
  if (/^[\s]*[-•*]\s+/.test(linea)) {
    const limpio = linea.replace(/^[\s]*[-•*]\s+/, '')
    return { tipo: 'bullet', texto: limpio }
  }

  // Lista numerada
  if (/^[\s]*\d+[\.\)]\s+/.test(linea)) {
    const num = linea.match(/^[\s]*(\d+)[\.\)]\s+/)[1]
    const limpio = linea.replace(/^[\s]*\d+[\.\)]\s+/, '')
    return { tipo: 'numerada', texto: limpio, num }
  }

  // Etiqueta tipo "Propósito:", "Duración:"
  if (/^[A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]+:/.test(sinMarcas) && sinMarcas.length < 60) {
    return { tipo: 'etiqueta', texto: texto.replace(/\*\*/g, '') }
  }

  return { tipo: 'parrafo', texto: linea.trim() }
}

export default function PlaneacionPreview({ contenido }) {
  if (!contenido) return null

  const lineas = contenido.split('\n')

  return (
    <div className="text-sm leading-relaxed space-y-1">
      {lineas.map((linea, i) => {
        const { tipo, texto, num } = clasificarLinea(linea)

        if (tipo === 'vacia') return <div key={i} className="h-2" />

        if (tipo === 'etapa') return (
          <div key={i} className="mt-4 mb-1 bg-ocre-500 text-arena-100 px-3 py-1.5 rounded font-semibold text-xs uppercase tracking-wide">
            {texto}
          </div>
        )

        if (tipo === 'h1') return (
          <div key={i} className="mt-4 mb-1 bg-musgo-900 text-arena-100 px-3 py-1.5 rounded font-semibold text-xs uppercase tracking-wide">
            {texto}
          </div>
        )

        if (tipo === 'h2') return (
          <div key={i} className="mt-3 mb-1 font-semibold text-musgo-700 text-sm border-b border-musgo-100 pb-1">
            {texto}
          </div>
        )

        if (tipo === 'etiqueta') return (
          <div key={i} className="mt-2 font-semibold text-musgo-800 text-xs">
            {texto}
          </div>
        )

        if (tipo === 'bullet') return (
          <div key={i} className="flex gap-2 pl-2 text-carbon-800/80">
            <span className="text-ocre-500 shrink-0 mt-0.5">•</span>
            <span dangerouslySetInnerHTML={{ __html: parsearLinea(texto) }} />
          </div>
        )

        if (tipo === 'numerada') return (
          <div key={i} className="flex gap-2 pl-2 text-carbon-800/80">
            <span className="text-ocre-500 shrink-0 font-medium">{num}.</span>
            <span dangerouslySetInnerHTML={{ __html: parsearLinea(texto) }} />
          </div>
        )

        return (
          <p key={i} className="text-carbon-800/80 pl-0"
            dangerouslySetInnerHTML={{ __html: parsearLinea(texto) }} />
        )
      })}
    </div>
  )
}
