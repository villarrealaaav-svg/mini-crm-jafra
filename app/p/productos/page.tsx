'use client'

import { useEffect, useState } from 'react'
import { getProductos } from '@/lib/publicApi'
import type { PublicProducto } from '@/types'

export default function PublicProductosPage() {
  const [items, setItems] = useState<PublicProducto[]>([])

  useEffect(() => {
    getProductos().then(list => {
      setItems(list.sort((a, b) => {
        if (a.highlight !== b.highlight) return a.highlight ? -1 : 1
        return b.created_at.localeCompare(a.created_at)
      }))
    }).catch(() => setItems([]))
  }, [])

  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)))
  const grouped: Record<string, PublicProducto[]> = {}
  for (const cat of categories) grouped[cat] = items.filter(i => i.category === cat)
  const uncategorized = items.filter(i => !i.category)

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <h1 className="text-[22px] font-bold text-gray-900">Nuevos productos</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">Lo último en JAFRA</p>
      </div>

      <div className="px-4">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">✨</p>
            <p className="text-gray-400 text-sm">Pronto<br />habrá novedades</p>
          </div>
        ) : (
          <div className="space-y-5">
            {categories.map(cat => (
              <section key={cat}>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-jafra-purple mb-2">{cat}</h2>
                <ProductGrid items={grouped[cat]} />
              </section>
            ))}
            {uncategorized.length > 0 && (
              <section>
                {categories.length > 0 && (
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-jafra-purple mb-2">Otros</h2>
                )}
                <ProductGrid items={uncategorized} />
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductGrid({ items }: { items: PublicProducto[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map(p => (
        <article key={p.id} className="card overflow-hidden">
          <div className="relative aspect-square bg-gray-50">
            {p.image
              ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">💄</div>
            }
            {p.highlight && (
              <span className="absolute top-2 left-2 text-[9px] font-bold bg-jafra text-white px-2 py-0.5 rounded-full">
                NUEVO
              </span>
            )}
          </div>
          <div className="p-3">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{p.name}</p>
            {p.description && <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{p.description}</p>}
            {p.price && <p className="text-sm font-bold text-jafra mt-1.5">{p.price}</p>}
          </div>
        </article>
      ))}
    </div>
  )
}
