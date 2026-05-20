'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { userStore } from '@/lib/store'

export default function LoginPage() {
  const [name, setName] = useState('')
  const router = useRouter()

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    userStore.set(trimmed)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#EDF0FF] flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Círculos decorativos — usando el color JAFRA */}
      <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-jafra/8" />
      <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full bg-indigo-200/30" />

      <div className="w-full max-w-sm relative fade-up">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl gradient-jafra flex items-center justify-center mx-auto mb-4"
            style={{ boxShadow: '0 8px 32px rgba(233,30,140,0.30)' }}>
            <span className="text-4xl">💎</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mini CRM</h1>
          <p className="text-indigo-400 text-sm mt-1 font-semibold tracking-widest uppercase">JAFRA</p>
        </div>

        {/* Card */}
        <div className="card rounded-3xl p-7">
          <p className="text-gray-600 text-sm text-center mb-5">Bienvenida de vuelta 👋<br />
            <span className="text-gray-400 text-xs">Tu asistente personal de seguimiento</span>
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tu nombre</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. María González"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:outline-none focus:border-jafra text-gray-800 text-sm bg-gray-50/50 transition-colors placeholder:text-gray-300"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3.5 rounded-2xl gradient-jafra text-white font-bold text-sm shadow-lg shadow-jafra/30 disabled:opacity-40 active:scale-95 transition-all duration-150"
            >
              Entrar al CRM →
            </button>
          </form>
        </div>

        <p className="text-center text-indigo-300 text-xs mt-6">Tus datos se guardan localmente en tu dispositivo</p>
      </div>
    </div>
  )
}
