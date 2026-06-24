'use client'

import { useEffect, useState } from 'react'
import { getSession, clearSession, type AdminSession } from '@/lib/adminPin'
import { login } from '@/lib/publicApi'

// Envuelve páginas de admin. Pide el NIP una vez por sesión.
//   role 'admin'  → páginas de edición de contenido (usa NIP de su espacio).
//   role 'master' → pantalla Administradoras (usa NIP maestro de la dueña).
export default function AdminGate({
  role = 'admin',
  children,
}: {
  role?: 'admin' | 'master'
  children: (session: AdminSession) => React.ReactNode
}) {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<AdminSession | null>(null)
  const [pin, setPin] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const s = getSession()
    if (s && s.role === role) setSession(s)
    setReady(true)
  }, [role])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!pin.trim()) return
    setChecking(true)
    setError('')
    const s = await login(pin.trim())
    setChecking(false)
    if (!s) { setError('NIP incorrecto'); return }
    if (s.role !== role) {
      clearSession()
      setError(role === 'master'
        ? 'Ese no es el NIP maestro de la dueña'
        : 'Usa el NIP de tu espacio (no el maestro)')
      return
    }
    setSession(s)
  }

  if (!ready) return null
  if (session) return <>{children(session)}</>

  const title = role === 'master' ? 'Administradoras' : 'Zona de edición'
  const hint = role === 'master'
    ? 'Ingresa tu NIP maestro para gestionar espacios.'
    : 'Ingresa el NIP de tu espacio para editar tu contenido.'

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col justify-center px-6">
      <div className="card-jafra p-6">
        <p className="text-3xl text-center mb-2">{role === 'master' ? '👑' : '🔐'}</p>
        <h1 className="text-lg font-bold text-gray-900 text-center">{title}</h1>
        <p className="text-xs text-gray-500 text-center mt-1 mb-5">{hint}</p>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            name="jafra-nip"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="NIP"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-lg tracking-widest focus:outline-none focus:border-jafra"
          />
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <button type="submit" disabled={checking}
            className="w-full py-3 rounded-xl bg-jafra text-white font-bold text-sm disabled:opacity-60">
            {checking ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
