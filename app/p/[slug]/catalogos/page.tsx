'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getCatalogo } from '@/lib/publicApi'
import type { CatalogoItem } from '@/types'

const typeEmoji: Record<CatalogoItem['type'], string> = {
  link: '🔗', imagen: '🖼️', pdf: '📄', texto: '📝',
}

export default function PublicCatalogosPage() {
  const { slug } = useParams<{ slug: string }>()
  const [items, setItems] = useState<CatalogoItem[]>([])
  const [viewing, setViewing] = useState<CatalogoItem | null>(null)

  useEffect(() => {
    getCatalogo(slug)
      .then(list => setItems(list.filter(i => i.public)))
      .catch(() => setItems([]))
  }, [slug])

  function openItem(item: CatalogoItem) {
    if (item.type === 'link') {
      window.open(item.content, '_blank', 'noopener,noreferrer')
    } else if (item.type === 'pdf' && item.content.startsWith('http')) {
      window.open(item.content, '_blank', 'noopener,noreferrer')
    } else {
      setViewing(item)
    }
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <h1 className="text-[22px] font-bold text-gray-900">Catálogos</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">Material oficial JAFRA</p>
      </div>

      <div className="px-4">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📖</p>
            <p className="text-gray-400 text-sm">Pronto agregaremos<br />nuevos catálogos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id}
                onClick={() => openItem(item)}
                className="card p-4 flex items-center gap-3 active:scale-[0.99] transition-transform cursor-pointer">
                <span className="text-2xl flex-shrink-0">{typeEmoji[item.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400">
                    {item.type === 'pdf' ? 'PDF' : item.type === 'imagen' ? 'Imagen' : item.type === 'link' ? 'Enlace' : 'Texto'}
                  </p>
                </div>
                <span className="text-jafra">→</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewing && (
        <div onClick={() => setViewing(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, margin: 0 }}>{viewing.title}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href={viewing.content} download={viewing.title}
                onClick={e => e.stopPropagation()}
                style={{ padding: '6px 12px', borderRadius: '8px', background: '#E91E8C', color: '#fff', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                ⬇ Descargar
              </a>
              <button onClick={() => setViewing(null)}
                style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px', border: 'none' }}>
                Cerrar
              </button>
            </div>
          </div>
          <div onClick={e => e.stopPropagation()} style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
            {viewing.type === 'pdf' ? (
              <embed src={viewing.content} type="application/pdf"
                style={{ width: '100%', height: '100%', minHeight: '70vh', borderRadius: '8px' }} />
            ) : viewing.type === 'imagen' ? (
              <img src={viewing.content} alt={viewing.title}
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
            ) : (
              <pre style={{ background: '#fff', padding: '16px', borderRadius: '8px', whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px' }}>
                {viewing.content}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
