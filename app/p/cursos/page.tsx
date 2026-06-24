'use client'

import { useEffect, useState } from 'react'
import { getCursos } from '@/lib/publicApi'
import type { PublicCurso } from '@/types'

const modMeta: Record<PublicCurso['modality'], { label: string; tint: string }> = {
  zoom:       { label: '💻 Zoom',       tint: 'bg-blue-100 text-blue-700' },
  presencial: { label: '📍 Presencial', tint: 'bg-green-100 text-green-700' },
  'híbrido':  { label: '🌐 Híbrido',    tint: 'bg-amber-100 text-amber-700' },
}

export default function PublicCursosPage() {
  const [items, setItems] = useState<PublicCurso[]>([])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    getCursos().then(list => {
      setItems(list
        .filter(c => c.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date)))
    }).catch(() => setItems([]))
  }, [])

  function formatDate(d: string) {
    if (!d) return ''
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <h1 className="text-[22px] font-bold text-gray-900">Cursos</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">Capacitaciones próximas</p>
      </div>

      <div className="px-4">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎓</p>
            <p className="text-gray-400 text-sm">Pronto compartiremos<br />nuevos cursos y eventos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(c => (
              <article key={c.id} className="card overflow-hidden">
                {c.image && <img src={c.image} alt={c.title} className="w-full h-36 object-cover" />}
                <div className="p-4">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${modMeta[c.modality].tint}`}>
                      {modMeta[c.modality].label}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-gray-900">{c.title}</h2>
                  <div className="mt-2 space-y-0.5">
                    <p className="text-xs text-gray-700"><span className="text-jafra-purple font-semibold">📅</span> {formatDate(c.date)}{c.time ? ` · ${c.time} hrs` : ''}</p>
                    {c.location && (
                      <p className="text-xs text-gray-700">
                        <span className="text-jafra-purple font-semibold">📍</span>{' '}
                        {c.location.startsWith('http') ? (
                          <a href={c.location} target="_blank" rel="noopener noreferrer" className="text-jafra underline">
                            Abrir enlace
                          </a>
                        ) : c.location}
                      </p>
                    )}
                  </div>
                  {c.description && (
                    <p className="text-xs text-gray-600 mt-2 whitespace-pre-line">{c.description}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
