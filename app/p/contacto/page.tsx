'use client'

import { useEffect, useRef, useState } from 'react'

const QR_KEY = 'jafra_qr_images'

type QrSlot = 'app' | 'whatsapp'
type QrStore = Partial<Record<QrSlot, string>>

const sitios = [
  { label: 'JAFRA',             url: 'https://www.jafra.com.mx' },
  { label: 'JAFRANET',          url: 'https://www.jafranet.com.mx' },
  { label: 'Mi Programa JAFRA', url: 'https://www.miprogramajafra.com' },
]

export default function PublicContactoPage() {
  const [qrs, setQrs] = useState<QrStore>({})
  const [zoom, setZoom] = useState<string | null>(null)
  const appRef = useRef<HTMLInputElement>(null)
  const waRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem(QR_KEY)
    if (raw) try { setQrs(JSON.parse(raw)) } catch {}
  }, [])

  function saveQrs(next: QrStore) {
    setQrs(next)
    localStorage.setItem(QR_KEY, JSON.stringify(next))
  }

  function handleFile(slot: QrSlot, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const data = ev.target?.result as string
      saveQrs({ ...qrs, [slot]: data })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <h1 className="text-[22px] font-bold text-gray-900">Contacto</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">Información oficial JAFRA</p>
      </div>

      <div className="px-4 space-y-4">

        <div className="card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Tipo de servicio</h2>
          <div className="space-y-3">
            {sitios.map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm font-semibold text-gray-800">{s.label}</span>
                <span className="text-xs text-jafra">{s.url.replace('https://', '')}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">App</h2>
          <p className="text-sm font-semibold text-gray-800 mb-3">Consultor JAFRA</p>
          {qrs.app ? (
            <div onClick={() => setZoom(qrs.app!)}
              className="rounded-2xl bg-gray-50 p-3 flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
              <img src={qrs.app} alt="QR" className="max-w-[200px] max-h-[200px] rounded-lg" />
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">QR aún no disponible</p>
          )}
          <input ref={appRef} type="file" accept="image/*" className="hidden"
            onChange={e => handleFile('app', e)} />
        </div>

        <div className="card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Asistente Virtual</h2>
          <a href="https://wa.me/525651175940" target="_blank" rel="noopener noreferrer"
            className="text-sm font-semibold text-green-600 underline underline-offset-2 mb-3 block">
            WhatsApp: 56 5117 5940
          </a>
          {qrs.whatsapp ? (
            <div onClick={() => setZoom(qrs.whatsapp!)}
              className="rounded-2xl bg-gray-50 p-3 flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
              <img src={qrs.whatsapp} alt="QR" className="max-w-[200px] max-h-[200px] rounded-lg" />
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">QR aún no disponible</p>
          )}
          <input ref={waRef} type="file" accept="image/*" className="hidden"
            onChange={e => handleFile('whatsapp', e)} />
        </div>

        <div className="card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Correo electrónico</h2>
          <a href="mailto:contacta@jafra.com.mx"
            className="text-sm font-semibold text-jafra underline underline-offset-2 block">
            contacta@jafra.com.mx
          </a>
          <p className="text-[11px] text-gray-400 mt-1">Para envío exclusivo de documentos</p>
        </div>

        <div className="card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Contact Center (CAT)</h2>
          <a href="tel:5554901710" className="text-base font-bold text-gray-900 block">
            55 5490 1710
          </a>
        </div>
      </div>

      {zoom && (
        <div onClick={() => setZoom(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <img src={zoom} alt="QR ampliado" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', background: '#fff', padding: '12px' }} />
        </div>
      )}
    </div>
  )
}
