'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Raíz pública sin espacio: pide el link de la líder.
export default function PublicRoot() {
  const router = useRouter()
  const [code, setCode] = useState('')

  function go(e: React.FormEvent) {
    e.preventDefault()
    const slug = code.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (slug) router.push(`/p/${slug}`)
  }

  return (
    <div className="min-h-screen bg-[#EDF0FF] flex flex-col justify-center px-6">
      <div className="max-w-sm w-full mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl gradient-jafra flex items-center justify-center mx-auto mb-4"
          style={{ boxShadow: '0 8px 24px rgba(233,30,140,0.30)' }}>
          <span className="text-3xl">💎</span>
        </div>
        <h1 className="text-[22px] font-bold text-gray-900">Material JAFRA</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Abre el link que te compartió tu líder<br />(ejemplo: <span className="font-mono text-jafra-purple">.../p/rosa</span>)
        </p>
        <form onSubmit={go} className="card p-4 space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Nombre del link (ej. rosa)"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-sm focus:outline-none focus:border-jafra"
          />
          <button type="submit" className="w-full py-3 rounded-xl bg-jafra text-white font-bold text-sm">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
