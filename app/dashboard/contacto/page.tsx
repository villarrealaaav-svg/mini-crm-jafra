'use client'

import { useEffect, useRef, useState } from 'react'
import AdminGate from '@/components/AdminGate'
import { getContactoQR, setContactoQR, removeContactoQR } from '@/lib/publicApi'
import type { ContactoQR, QrSlot } from '@/types'

const sitios = [
  { label: 'JAFRA',           url: 'https://www.jafra.com.mx' },
  { label: 'JAFRANET',        url: 'https://www.jafranet.com.mx' },
  { label: 'Mi Programa JAFRA', url: 'https://www.miprogramajafra.com' },
]

function ContactoInner({ tenant }: { tenant: string }) {
  const [qrs, setQrs] = useState<ContactoQR>({})
  const [zoom, setZoom] = useState<string | null>(null)
  const [busy, setBusy] = useState<QrSlot | null>(null)
  const appRef = useRef<HTMLInputElement>(null)
  const waRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getContactoQR(tenant).then(setQrs).catch(() => setQrs({}))
  }, [tenant])

  async function handleFile(slot: QrSlot, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 50 * 1024 * 1024) { alert('Imagen muy grande (máx 50MB)'); return }
    setBusy(slot)
    try {
      await setContactoQR(slot, file)
      setQrs(await getContactoQR(tenant))
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setBusy(null)
    }
  }

  async function removeQr(slot: QrSlot) {
    setBusy(slot)
    try {
      await removeContactoQR(slot)
      setQrs(await getContactoQR(tenant))
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <h1 className="text-[22px] font-bold text-gray-900">Contacto</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">Información oficial JAFRA</p>
      </div>

      <div className="px-4 space-y-4">

        {/* Tipos de servicio */}
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

        {/* QR App Consultor */}
        <div className="card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">App</h2>
          <p className="text-sm font-semibold text-gray-800 mb-3">Consultor JAFRA</p>
          <QrBlock
            data={qrs.app}
            onPick={() => appRef.current?.click()}
            onZoom={() => qrs.app && setZoom(qrs.app)}
            onDelete={() => removeQr('app')}
            label="Sube el QR de la App"
          />
          <input ref={appRef} type="file" accept="image/*" className="hidden"
            onChange={e => handleFile('app', e)} />
        </div>

        {/* WhatsApp */}
        <div className="card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Asistente Virtual</h2>
          <a href="https://wa.me/525651175940" target="_blank" rel="noopener noreferrer"
            className="text-sm font-semibold text-green-600 underline underline-offset-2 mb-3 block">
            WhatsApp: 56 5117 5940
          </a>
          <QrBlock
            data={qrs.whatsapp}
            onPick={() => waRef.current?.click()}
            onZoom={() => qrs.whatsapp && setZoom(qrs.whatsapp)}
            onDelete={() => removeQr('whatsapp')}
            label="Sube el QR de WhatsApp"
          />
          <input ref={waRef} type="file" accept="image/*" className="hidden"
            onChange={e => handleFile('whatsapp', e)} />
        </div>

        {/* Correo */}
        <div className="card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Correo electrónico</h2>
          <a href="mailto:contacta@jafra.com.mx"
            className="text-sm font-semibold text-jafra underline underline-offset-2 block">
            contacta@jafra.com.mx
          </a>
          <p className="text-[11px] text-gray-400 mt-1">Para envío exclusivo de documentos</p>
        </div>

        {/* Contact Center */}
        <div className="card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Contact Center (CAT)</h2>
          <a href="tel:5554901710"
            className="text-base font-bold text-gray-900 block">
            55 5490 1710
          </a>
        </div>

      </div>

      {/* Modal zoom QR */}
      {zoom && (
        <div onClick={() => setZoom(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <img src={zoom} alt="QR ampliado" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', background: '#fff', padding: '12px' }} />
        </div>
      )}
    </div>
  )
}

export default function ContactoPage() {
  return (
    <AdminGate>
      {(s) => <ContactoInner tenant={s.tenant} />}
    </AdminGate>
  )
}

function QrBlock({ data, onPick, onZoom, onDelete, label }: {
  data?: string | null
  onPick: () => void
  onZoom: () => void
  onDelete: () => void
  label: string
}) {
  if (data) {
    return (
      <div className="space-y-2">
        <div onClick={onZoom}
          className="rounded-2xl bg-gray-50 p-3 flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
          <img src={data} alt="QR" className="max-w-[200px] max-h-[200px] rounded-lg" />
        </div>
        <div className="flex gap-2">
          <button onClick={onPick}
            className="flex-1 py-2 rounded-xl bg-gray-100 text-xs font-medium text-gray-700">
            Cambiar
          </button>
          <button onClick={onDelete}
            className="flex-1 py-2 rounded-xl bg-red-50 text-xs font-medium text-red-600">
            Eliminar
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center">Toca el QR para ampliar</p>
      </div>
    )
  }
  return (
    <button onClick={onPick}
      className="w-full py-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-xs text-gray-500 active:scale-95 transition-transform">
      📷 {label}
    </button>
  )
}
