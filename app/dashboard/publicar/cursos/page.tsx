'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import { cursosStore } from '@/lib/store'
import type { PublicCurso } from '@/types'

const modalityOpts: PublicCurso['modality'][] = ['zoom', 'presencial', 'híbrido']

const emptyForm = {
  title: '', date: '', time: '',
  modality: 'zoom' as PublicCurso['modality'],
  location: '', description: '', image: '',
}

export default function PublicarCursosPage() {
  const [items, setItems] = useState<PublicCurso[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PublicCurso | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [fileError, setFileError] = useState('')
  const imgRef = useRef<HTMLInputElement>(null)

  function load() {
    setItems(cursosStore.getAll().sort((a, b) => a.date.localeCompare(b.date)))
  }
  useEffect(() => { load() }, [])

  function openAdd() { setEditing(null); setForm(emptyForm); setFileError(''); setModalOpen(true) }
  function openEdit(c: PublicCurso) {
    setEditing(c)
    setForm({ title: c.title, date: c.date, time: c.time, modality: c.modality, location: c.location, description: c.description, image: c.image })
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
    if (editing) cursosStore.update(editing.id, form)
    else cursosStore.add(form)
    load(); setModalOpen(false)
  }

  function formatDate(d: string) {
    if (!d) return ''
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/publicar" className="text-[11px] text-jafra-purple font-semibold">← Publicar</Link>
            <h1 className="text-[22px] font-bold text-gray-900 mt-0.5">Cursos</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{items.length} próximo{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={openAdd}
            className="w-9 h-9 rounded-full bg-jafra text-white flex items-center justify-center text-xl active:scale-95 transition-transform">+</button>
        </div>
      </div>

      <div className="px-4">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎓</p>
            <p className="text-gray-400 text-sm">Agrega el primer curso</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(c => (
              <div key={c.id} className="card p-4 flex items-start gap-3">
                {c.image && <img src={c.image} alt={c.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />}
                <div className="flex-1 min-w-0" onClick={() => openEdit(c)}>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{c.title}</p>
                  <p className="text-[11px] text-jafra-purple mt-0.5">{formatDate(c.date)}{c.time ? ` · ${c.time}` : ''}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{c.modality} · {c.location}</p>
                </div>
                <button onClick={() => setDeleteId(c.id)} className="text-gray-300">🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar curso' : 'Nuevo curso'}>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Título*</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ej. Maquillaje profesional" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha*</label>
              <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hora</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Modalidad</label>
            <div className="grid grid-cols-3 gap-2">
              {modalityOpts.map(m => (
                <button key={m} type="button" onClick={() => setForm(f => ({ ...f, modality: m }))}
                  className={`py-2 rounded-xl text-xs font-medium border transition-colors ${form.modality === m ? 'bg-jafra text-white border-jafra' : 'border-gray-200 text-gray-600'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ubicación / Link</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Dirección o https://zoom..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Detalles del curso..." rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
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
            {editing ? 'Guardar' : 'Agregar curso'}
          </button>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar curso">
        <p className="text-gray-600 text-sm mb-4">¿Eliminar este curso?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-600">Cancelar</button>
          <button onClick={() => { if (deleteId) { cursosStore.delete(deleteId); load(); setDeleteId(null) } }}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">Eliminar</button>
        </div>
      </Modal>
    </div>
  )
}
