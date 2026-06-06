'use client'

import { useEffect, useState } from 'react'
import { muroRankingStore } from '@/lib/store'
import type { MuroRanking, MuroEntry } from '@/types'

export default function PublicMuroPage() {
  const [ranking, setRanking] = useState<MuroRanking | null>(null)

  useEffect(() => {
    setRanking(muroRankingStore.get())
  }, [])

  const sorted: MuroEntry[] = ranking
    ? [...ranking.entries].sort((a, b) => b.score - a.score)
    : []

  return (
    <div className="min-h-screen w-full"
      style={{
        background: 'radial-gradient(ellipse at top, #5E2675 0%, #3D1351 45%, #2A0A3A 100%)',
        paddingBottom: '120px',
      }}>

      {/* Sparkles fondo */}
      <Sparkles />

      <div className="relative max-w-lg mx-auto px-5 pt-10">

        {/* Logo JAFRA */}
        <div className="flex items-center gap-2 mb-2">
          <span style={{ color: '#F4D689', fontSize: '18px', fontWeight: 700, letterSpacing: '0.15em' }}>JAFRA</span>
          <span style={{ color: '#F4D689', fontSize: '14px' }}>∞</span>
        </div>

        {/* Título */}
        <div className="text-center mt-4 mb-2 relative">
          <h1 style={{
            fontFamily: 'Georgia, serif',
            color: '#7C3F8E',
            fontSize: '34px',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '0.05em',
            textShadow: '0 2px 0 rgba(255,255,255,0.4)',
          }}>MURO DEL</h1>
          <div className="relative inline-block">
            <h2 style={{
              fontFamily: 'Georgia, serif',
              color: '#5E2675',
              fontSize: '64px',
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: '0.03em',
              textShadow: '0 4px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(244,214,137,0.5)',
            }}>ÉXITO</h2>
            <Star />
          </div>
        </div>

        {/* Pincelada dorada + Mes */}
        <div className="text-center my-4 relative">
          <div style={{
            width: '70%',
            height: '14px',
            margin: '0 auto',
            background: 'linear-gradient(90deg, transparent 0%, #F4D689 25%, #C9A961 50%, #F4D689 75%, transparent 100%)',
            borderRadius: '50%',
            filter: 'blur(2px)',
            opacity: 0.85,
          }} />
          <h3 style={{
            position: 'relative',
            marginTop: '-22px',
            fontFamily: 'Georgia, serif',
            color: '#FFFFFF',
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '0.25em',
            textShadow: '0 2px 4px rgba(0,0,0,0.4)',
          }}>{ranking?.month?.toUpperCase() || 'MES'}</h3>
        </div>

        {/* Eslogan */}
        <p className="text-center mb-6" style={{
          color: '#F4D689',
          fontSize: '11px',
          letterSpacing: '0.18em',
          fontWeight: 500,
        }}>
          LÍDERES QUE INSPIRAN, RESULTADOS QUE TRASCIENDEN
        </p>

        {/* Tabla ranking */}
        {sorted.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: '#F4D689', fontSize: '13px', opacity: 0.8 }}>
              Pronto publicaremos<br />el ranking de este mes ✨
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {sorted.map((e, i) => (
              <RankRow key={e.id} pos={i + 1} entry={e} />
            ))}
          </div>
        )}

        {/* Footer slogan */}
        <div className="text-center mt-10 pt-6" style={{ borderTop: '1px solid rgba(244,214,137,0.25)' }}>
          <div style={{ fontSize: '20px', color: '#F4D689', marginBottom: '8px' }}>∞</div>
          <p style={{
            color: '#F4D689',
            fontSize: '11px',
            letterSpacing: '0.18em',
            fontWeight: 600,
            marginBottom: '6px',
          }}>
            TU ESFUERZO HOY, TU LEGADO MAÑANA.
          </p>
          <p style={{
            color: '#FFD580',
            fontSize: '13px',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
          }}>
            ¡Gracias por ser parte del Éxito! <span style={{ color: '#FF6BB0' }}>♥</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function RankRow({ pos, entry }: { pos: number, entry: MuroEntry }) {
  const isTop3 = pos <= 3
  const bg = pos === 1
    ? 'linear-gradient(90deg, #C9A961 0%, #E5C277 50%, #C9A961 100%)'
    : 'linear-gradient(90deg, #3A1252 0%, #5E2675 50%, #3A1252 100%)'

  const textColor = pos === 1 ? '#3D1351' : '#FFFFFF'
  const scoreBg = pos === 1
    ? 'linear-gradient(135deg, #B0185F 0%, #E91E8C 100%)'
    : 'linear-gradient(135deg, #2A0A3A 0%, #4A1860 100%)'
  const scoreColor = pos === 1 ? '#FFD580' : '#F4D689'

  return (
    <div className="flex items-stretch overflow-hidden" style={{
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
    }}>
      {/* Posición */}
      <div style={{
        width: '46px',
        background: pos === 1 ? '#C9A961' : pos === 2 ? '#6B3A85' : pos === 3 ? '#5A2C72' : '#4A2160',
        color: pos === 1 ? '#3D1351' : '#F4D689',
        fontSize: '18px',
        fontWeight: 700,
        fontFamily: 'Georgia, serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {pos}
      </div>

      {/* Body */}
      <div className="flex-1 flex items-center gap-2.5 px-3 py-2.5 min-w-0" style={{ background: bg }}>
        <RankBadge pos={pos} />
        <p style={{
          flex: 1,
          color: textColor,
          fontSize: '13px',
          fontWeight: isTop3 && pos === 1 ? 700 : 600,
          fontFamily: 'Georgia, serif',
          margin: 0,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{entry.name}</p>
      </div>

      {/* Score */}
      <div style={{
        minWidth: '78px',
        background: scoreBg,
        color: scoreColor,
        fontSize: '15px',
        fontWeight: 700,
        fontFamily: 'Georgia, serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 10px',
        flexShrink: 0,
      }}>
        {entry.score.toFixed(2)}
      </div>
    </div>
  )
}

function RankBadge({ pos }: { pos: number }) {
  if (pos === 1) {
    return (
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
        <CrownSvg color="#C9A961" />
      </div>
    )
  }
  if (pos === 2) {
    return (
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#7C4D94', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <CrownSvg color="#D0D0D8" />
      </div>
    )
  }
  if (pos === 3) {
    return (
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#6B3A85', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <CrownSvg color="#CD7F32" />
      </div>
    )
  }
  return (
    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#4A2160', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <DiamondSvg />
    </div>
  )
}

function CrownSvg({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
      <path d="M2 6l4 4 6-6 6 6 4-4v12H2V6z" />
    </svg>
  )
}

function DiamondSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#E64B97">
      <path d="M12 2l4 6-4 14-4-14 4-6z M2 8l10 14L8 8H2z M22 8h-6l-4 14L22 8z" />
    </svg>
  )
}

function Star() {
  return (
    <svg style={{ position: 'absolute', top: '-10px', right: '-30px', filter: 'drop-shadow(0 4px 8px rgba(244,214,137,0.6))' }} width="64" height="64" viewBox="0 0 24 24" fill="#F4D689">
      <path d="M12 2 L14.5 9 L22 9.5 L16 14.5 L18 22 L12 18 L6 22 L8 14.5 L2 9.5 L9.5 9 Z" />
    </svg>
  )
}

function Sparkles() {
  const dots = [
    { top: '8%',  left: '12%', size: 2 },
    { top: '18%', left: '85%', size: 3 },
    { top: '28%', left: '8%',  size: 2 },
    { top: '42%', left: '92%', size: 2 },
    { top: '55%', left: '5%',  size: 3 },
    { top: '68%', left: '88%', size: 2 },
    { top: '78%', left: '15%', size: 2 },
    { top: '88%', left: '85%', size: 3 },
    { top: '92%', left: '40%', size: 2 },
  ]
  return (
    <>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: d.top, left: d.left,
          width: d.size + 'px', height: d.size + 'px',
          background: '#F4D689',
          borderRadius: '50%',
          boxShadow: `0 0 ${d.size * 3}px #F4D689`,
          opacity: 0.7,
        }} />
      ))}
    </>
  )
}
