'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function PublicHome() {
  const { slug } = useParams<{ slug: string }>()
  const base = `/p/${slug}`
  const cards = [
    { href: `${base}/catalogos`, title: 'Catálogos',      desc: 'Descarga el catálogo del mes', emoji: '📖', tint: 'linear-gradient(135deg,#E91E8C,#FF6BB0)' },
    { href: `${base}/muro`,      title: 'Muro del éxito', desc: 'Historias y reconocimientos',   emoji: '🏆', tint: 'linear-gradient(135deg,#E5C277,#C9A961)' },
    { href: `${base}/productos`, title: 'Nuevos',         desc: 'Lo último de JAFRA',           emoji: '✨', tint: 'linear-gradient(135deg,#FF8FA8,#E64B97)' },
    { href: `${base}/cursos`,    title: 'Cursos',         desc: 'Capacitaciones próximas',       emoji: '🎓', tint: 'linear-gradient(135deg,#A864C0,#7C3F8E)' },
    { href: `${base}/contacto`,  title: 'Contacto',       desc: 'JAFRA & asistencia',           emoji: '📞', tint: 'linear-gradient(135deg,#FCE4EC,#F9A8D4)' },
  ]

  return (
    <div className="max-w-lg mx-auto px-5 pb-24">
      <div className="pt-14 pb-6 text-center fade-up">
        <div className="w-16 h-16 rounded-2xl gradient-jafra flex items-center justify-center mx-auto mb-3"
          style={{ boxShadow: '0 8px 24px rgba(233,30,140,0.30)' }}>
          <span className="text-3xl">💎</span>
        </div>
        <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Bienvenida a JAFRA</h1>
        <p className="text-jafra-purple text-xs mt-1 font-semibold tracking-widest uppercase">Tu equipo, tu éxito</p>
      </div>

      <div className="space-y-2.5 fade-up">
        {cards.map(c => (
          <Link key={c.href} href={c.href}
            className="card p-4 flex items-center gap-4 active:scale-[0.98] transition-transform">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: c.tint, boxShadow: '0 4px 12px rgba(233,30,140,0.18)' }}>
              <span className="text-2xl">{c.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm">{c.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
            </div>
            <span className="text-jafra text-lg">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
