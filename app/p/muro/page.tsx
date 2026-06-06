'use client'

import { useEffect, useState } from 'react'
import { muroStore } from '@/lib/store'
import type { MuroPost } from '@/types'

const typeMeta: Record<MuroPost['type'], { label: string; tint: string; emoji: string }> = {
  logro:          { label: 'Logro',          tint: 'linear-gradient(135deg,#E5C277,#C9A961)', emoji: '🏆' },
  testimonio:     { label: 'Testimonio',     tint: 'linear-gradient(135deg,#FF8FA8,#E64B97)', emoji: '💬' },
  reconocimiento: { label: 'Reconocimiento', tint: 'linear-gradient(135deg,#A864C0,#7C3F8E)', emoji: '🌟' },
}

export default function PublicMuroPage() {
  const [posts, setPosts] = useState<MuroPost[]>([])

  useEffect(() => {
    setPosts(muroStore.getAll().sort((a, b) => b.date.localeCompare(a.date)))
  }, [])

  function formatDate(d: string) {
    if (!d) return ''
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <h1 className="text-[22px] font-bold text-gray-900">Muro del Éxito</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">Historias que inspiran</p>
      </div>

      <div className="px-4">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🌟</p>
            <p className="text-gray-400 text-sm">Pronto compartiremos<br />nuestras historias de éxito</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(p => {
              const meta = typeMeta[p.type]
              return (
                <article key={p.id} className="card overflow-hidden">
                  {p.image && (
                    <img src={p.image} alt={p.title} className="w-full h-44 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                        style={{ background: meta.tint, boxShadow: '0 2px 6px rgba(233,30,140,0.20)' }}>
                        <span>{meta.emoji}</span>
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-jafra-purple">{meta.label}</span>
                    </div>
                    <h2 className="text-base font-bold text-gray-900 leading-snug">{p.title}</h2>
                    {p.body && <p className="text-sm text-gray-700 mt-1.5 leading-relaxed whitespace-pre-line">{p.body}</p>}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                      {p.author && <p className="text-xs font-semibold text-jafra">— {p.author}</p>}
                      <p className="text-[10px] text-gray-400">{formatDate(p.date)}</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
