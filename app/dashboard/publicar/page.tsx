'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminGate from '@/components/AdminGate'
import { getMuro, getProductos, getCursos, getCatalogo } from '@/lib/publicApi'

function PublicarInner() {
  const [counts, setCounts] = useState({ muro: 0, productos: 0, cursos: 0, catalogos: 0 })
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    Promise.all([getMuro(), getProductos(), getCursos(), getCatalogo()])
      .then(([muro, productos, cursos, catalogo]) => {
        setCounts({
          muro: muro?.entries.length || 0,
          productos: productos.length,
          cursos: cursos.length,
          catalogos: catalogo.filter(i => i.public).length,
        })
      })
      .catch(() => {})
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/p`)
    }
  }, [])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('Copia este link:', shareUrl)
    }
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'JAFRA · Mi línea', text: 'Mira el material JAFRA', url: shareUrl })
      } catch { /* user cancel */ }
    } else {
      copyLink()
    }
  }

  const sections = [
    { href: '/dashboard/publicar/muro',      label: 'Muro del éxito',  desc: 'Logros, testimonios, reconocimientos', count: counts.muro,      emoji: '🏆', tint: 'linear-gradient(135deg,#E5C277,#C9A961)' },
    { href: '/dashboard/publicar/productos', label: 'Productos nuevos', desc: 'Catálogo de novedades',               count: counts.productos, emoji: '✨', tint: 'linear-gradient(135deg,#FF8FA8,#E64B97)' },
    { href: '/dashboard/publicar/cursos',    label: 'Cursos',           desc: 'Capacitaciones y eventos',            count: counts.cursos,    emoji: '🎓', tint: 'linear-gradient(135deg,#A864C0,#7C3F8E)' },
    { href: '/dashboard/catalogo',           label: 'Catálogos',        desc: `${counts.catalogos} marcados como públicos`, count: counts.catalogos, emoji: '📖', tint: 'linear-gradient(135deg,#E91E8C,#FF6BB0)' },
  ]

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <h1 className="text-[22px] font-bold text-gray-900">Publicar</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">Contenido visible para tu equipo</p>
      </div>

      <div className="px-4 space-y-4">

        {/* Link para compartir */}
        <div className="card-jafra p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-jafra-purple mb-2">Link público</p>
          <div className="bg-jafra-light rounded-xl p-3 mb-3 break-all text-xs text-jafra-dark font-mono">
            {shareUrl || '...'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={copyLink}
              className="py-2.5 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700 active:scale-95 transition-transform">
              {copied ? '✓ Copiado' : '📋 Copiar'}
            </button>
            <button onClick={shareLink}
              className="py-2.5 rounded-xl bg-jafra text-white text-xs font-semibold active:scale-95 transition-transform">
              📤 Compartir
            </button>
          </div>
          <a href={shareUrl || '/p'} target="_blank" rel="noopener noreferrer"
            className="block text-center mt-2 text-[11px] text-jafra-purple font-semibold underline-offset-2 hover:underline">
            👁 Ver página pública
          </a>
        </div>

        {/* Secciones */}
        <div className="space-y-2.5">
          {sections.map(s => (
            <Link key={s.href} href={s.href}
              className="card p-4 flex items-center gap-3 active:scale-[0.99] transition-transform">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.tint, boxShadow: '0 4px 12px rgba(233,30,140,0.18)' }}>
                <span className="text-xl">{s.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-jafra-purple leading-none">{s.count}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">items</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="card p-4 bg-jafra-cream">
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-semibold text-jafra-purple">Tip:</span> el link público muestra solo lo que tú apruebas. Tus saldos, personas y pagos NUNCA aparecen ahí.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PublicarPage() {
  return (
    <AdminGate>
      <PublicarInner />
    </AdminGate>
  )
}
