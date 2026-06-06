'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import { muroStore } from '@/lib/store'
import type { MuroPost } from '@/types'

const typeOpts: MuroPost['type'][] = ['logro', 'testimonio', 'reconocimiento']
const typeEmoji: Record<MuroPost['type'], string> = {
  logro: '🏆', testimonio: '💬', reconocimiento: '🌟',
}

const emptyForm = {
  type: 'logro' as MuroPost['type'],
  title: '', body: '', author: '', image: '',
  date: new Date().toISOString().split('T')[0],
}

export default function PublicarMuroPage() {
  const [posts, setPosts] = useState<MuroPost[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MuroPost | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [fileError, setFileError] = useState('')
  const imgRef = useRef<HTMLInputElement>(null)

  function load() {
    setPosts(muroStore.getAll().sort((a, b) => b.date.localeCompare(a.date)))
  }
  useEffect(() => { load() }, [])

  function openAdd() { setEditing(null); setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] }); setFileError(''); setModalOpen(true) }
  function openEdit(p: MuroPost) {
    setEditing(p)
    setForm({ type: p.type, title: p.title, body: p.body, author: p.author, image: p.image, date: p.date })
    setFileError(''); setModalOpen(true)
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 2 * 1024 * 1024) { setFileError('Imagen muy grande (máx 2MB)'); return }
    const r = new FileReader()
    r.onload = ev => setForm(fr => ({ ...fr, image: ev.target?.result as string }))
    r.readAsDataURL(f)
    e.target.value = ''
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (editing) muroStore.update(editing.id, form)
    else muroStore.add(form)
    load(); setModalOpen(false)
  }

  function formatDate(d: string) {
    if (!d) return ''
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/publicar" className="text-[11px] text-jafra-purple font-semibold">← Publicar</Link>
            <h1 className="text-[22px] font-bold text-gray-900 mt-0.5">Muro del éxito</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={openAdd}
            className="w-9 h-9 rounded-full bg-jafra text-white flex items-center justify-center text-xl active:scale-95 transition-transform">+</button>
        </div>
      </div>

      <div className="px-4">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🌟</p>
            <p className="text-gray-400 text-sm">Agrega el primer post del muro</p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map(p => (
              <div key={p.id} className="card p-4 flex items-start gap-3">
                {p.image && <img src={p.image} alt={p.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />}
                <div className="flex-1 min-w-0" onClick={() => openEdit(p)}>
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="text-[10px] uppercase font-bold text-jafra-purple">{typeEmoji[p.type]} {p.type}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{p.title}</p>
                  {p.author && <p className="text-xs text-jafra mt-0.5">— {p.author}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{formatDate(p.date)}</p>
                </div>
                <button onClick={() => setDeleteId(p.id)} className="text-gray-300">🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar post' : 'Nuevo post'}>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {typeOpts.map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`py-2 rounded-xl text-xs font-medium border transition-colors ${form.type === t ? 'bg-jafra text-white border-jafra' : 'border-gray-200 text-gray-600'}`}>
                  {typeEmoji[t]} {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Título*</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ej. Subí de nivel a Senior" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Cuéntalo..." rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Autor</label>
              <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                placeholder="Nombre" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha*</label>
              <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Imagen (opcional)</label>
            <input ref={imgRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
            {form.image ? (
              <div className="rounded-xl bg-gray-50 p-2 flex items-center gap-3">
                <img src={form.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
                <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))}
                  className="text-xs text-red-500 font-medium">Quitar</button>
              </div>
            ) : (
              <button type="button" onClick={() => imgRef.current?.click()}
                className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-xs text-gray-500">
                📷 Sube imagen
              </button>
            )}
            {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
          </div>
          <button type="submit" className="w-full py-3 bg-jafra text-white rounded-xl font-semibold text-sm">
            {editing ? 'Guardar' : 'Publicar'}
          </button>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar post">
        <p className="text-gray-600 text-sm mb-4">¿Eliminar este post?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-600">Cancelar</button>
          <button onClick={() => { if (deleteId) { muroStore.delete(deleteId); load(); setDeleteId(null) } }}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">Eliminar</button>
        </div>
      </Modal>
    </div>
  )
}
