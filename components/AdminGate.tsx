'use client'

import { useEffect, useState } from 'react'
import { getPin, setPin as savePin, clearPin } from '@/lib/adminPin'
import { validatePin } from '@/lib/publicApi'

// Envuelve páginas de ESCRITURA admin. Pide el PIN una vez por sesión.
// El PIN se valida contra la Edge Function (servidor), no en el cliente.
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setUnlocked(Boolean(getPin()))
    setReady(true)
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!pin.trim()) return
    setChecking(true)
    setError('')
    const ok = await validatePin(pin.trim())
    setChecking(false)
    if (ok) {
      savePin(pin.trim())
      setUnlocked(true)
    } else {
      setError('PIN incorrecto')
      clearPin()
    }
  }

  if (!ready) return null
  if (unlocked) return <>{children}</>

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col justify-center px-6">
      <div className="card-jafra p-6">
        <p className="text-3xl text-center mb-2">🔐</p>
        <h1 className="text-lg font-bold text-gray-900 text-center">Zona de administración</h1>
        <p className="text-xs text-gray-500 text-center mt-1 mb-5">
          Ingresa el PIN para editar el contenido público.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-lg tracking-widest focus:outline-none focus:border-jafra"
          />
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            disabled={checking}
            className="w-full py-3 rounded-xl bg-jafra text-white font-bold text-sm disabled:opacity-60"
          >
            {checking ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
