'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminGate from '@/components/AdminGate'
import Modal from '@/components/Modal'
import { listSpaces, createSpace, deleteSpace, type Space } from '@/lib/publicApi'

function AdminsInner() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', tenant: '', pin: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [delTenant, setDelTenant] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')

  async function load() {
    setLoading(true)
    try { setSpaces(await listSpaces()) } catch { /* noop */ }
    setLoading(false)
  }
  useEffect(() => {
    load()
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  function openAdd() { setForm({ name: '', tenant: '', pin: '' }); setError(''); setModalOpen(true) }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await createSpace(form.tenant.trim().toLowerCase(), form.pin.trim(), form.name.trim())
      await load()
      setModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(tenant: string) {
    try { await deleteSpace(tenant); await load() }
    catch (err) { alert('Error: ' + (err instanceof Error ? err.message : String(err))) }
    setDelTenant(null)
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-[11px] text-jafra-purple font-semibold">← Inicio</Link>
            <h1 className="text-[22px] font-bold text-gray-900 mt-0.5">Administradoras</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{spaces.length} espacio{spaces.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={openAdd}
            className="w-9 h-9 rounded-full bg-jafra text-white flex items-center justify-center text-xl active:scale-95 transition-transform">+</button>
        </div>
      </div>

      <div className="px-4">
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-12">Cargando…</p>
        ) : spaces.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">👑</p>
            <p className="text-gray-400 text-sm">Crea el primer espacio.<br />Cada admin tendrá su link y su NIP.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {spaces.map(s => (
              <div key={s.tenant} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                    <p className="text-[11px] text-jafra-purple font-mono mt-0.5 break-all">{origin}/p/{s.tenant}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">NIP: <span className="font-mono font-semibold">{s.pin}</span></p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0 ml-2">
                    <button onClick={() => navigator.clipboard?.writeText(`${origin}/p/${s.tenant}`)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-jafra-light text-jafra-dark font-semibold">📋 Link</button>
                    <button onClick={() => setDelTenant(s.tenant)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-red-50 text-red-600 font-semibold">Borrar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo espacio">
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre de la administradora*</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej. Rosa Martínez" autoComplete="off"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Link (solo letras/números/guiones)*</label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 font-mono">/p/</span>
              <input required value={form.tenant}
                onChange={e => setForm(f => ({ ...f, tenant: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                placeholder="rosa" autoComplete="off"
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">NIP para esa admin*</label>
            <input required value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))}
              placeholder="Ej. 1234" autoComplete="off" inputMode="numeric"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full py-3 bg-jafra text-white rounded-xl font-semibold text-sm disabled:opacity-60">
            {saving ? 'Creando…' : 'Crear espacio'}
          </button>
        </form>
      </Modal>

      <Modal open={!!delTenant} onClose={() => setDelTenant(null)} title="Borrar espacio">
        <p className="text-gray-600 text-sm mb-4">¿Borrar este espacio y TODO su contenido (muro, productos, cursos, catálogos, QRs)? No se puede deshacer.</p>
        <div className="flex gap-3">
          <button onClick={() => setDelTenant(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-600">Cancelar</button>
          <button onClick={() => delTenant && handleDelete(delTenant)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">Borrar todo</button>
        </div>
      </Modal>
    </div>
  )
}

export default function AdminsPage() {
  return (
    <AdminGate role="master">
      {() => <AdminsInner />}
    </AdminGate>
  )
}
