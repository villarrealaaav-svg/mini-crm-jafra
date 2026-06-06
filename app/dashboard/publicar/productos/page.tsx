'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import { productosStore } from '@/lib/store'
import type { PublicProducto } from '@/types'

const emptyForm = {
  name: '', description: '', price: '', image: '', category: '',
  highlight: true,
}

export default function PublicarProductosPage() {
  const [items, setItems] = useState<PublicProducto[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PublicProducto | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [fileError, setFileError] = useState('')
  const imgRef = useRef<HTMLInputElement>(null)

  function load() {
    setItems(productosStore.getAll().sort((a, b) => b.created_at.localeCompare(a.created_at)))
  }
  useEffect(() => { load() }, [])

  function openAdd() { setEditing(null); setForm(emptyForm); setFileError(''); setModalOpen(true) }
  function openEdit(p: PublicProducto) {
    setEditing(p)
    setForm({ name: p.name, description: p.description, price: p.price, image: p.image, category: p.category, highlight: p.highlight })
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
    if (editing) productosStore.update(editing.id, form)
    else productosStore.add(form)
    load(); setModalOpen(false)
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/publicar" className="text-[11px] text-jafra-purple font-semibold">← Publicar</Link>
            <h1 className="text-[22px] font-bold text-gray-900 mt-0.5">Productos</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{items.length} producto{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={openAdd}
            className="w-9 h-9 rounded-full bg-jafra text-white flex items-center justify-center text-xl active:scale-95 transition-transform">+</button>
        </div>
      </div>

      <div className="px-4">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💄</p>
            <p className="text-gray-400 text-sm">Agrega el primer producto nuevo</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {items.map(p => (
              <article key={p.id} className="card overflow-hidden">
                <div onClick={() => openEdit(p)} className="cursor-pointer">
                  <div className="relative aspect-square bg-gray-50">
                    {p.image
                      ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">💄</div>
                    }
                    {p.highlight && (
                      <span className="absolute top-2 left-2 text-[9px] font-bold bg-jafra text-white px-2 py-0.5 rounded-full">NUEVO</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{p.name}</p>
                    {p.price && <p className="text-sm font-bold text-jafra mt-1">{p.price}</p>}
                  </div>
                </div>
                <button onClick={() => setDeleteId(p.id)}
                  className="w-full py-1.5 text-[10px] text-red-500 border-t border-gray-100">Eliminar</button>
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar producto' : 'Nuevo producto'}>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre*</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej. Royal Coconut Aceite" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio</label>
              <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="$549.00" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="Fragancia, Cuidado..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Breve descripción..." rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Imagen</label>
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
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-jafra-light cursor-pointer">
            <input type="checkbox" checked={form.highlight}
              onChange={e => setForm(f => ({ ...f, highlight: e.target.checked }))}
              className="w-4 h-4 accent-jafra" />
            <span className="text-xs font-semibold text-jafra-dark">Marcar como NUEVO</span>
          </label>
          <button type="submit" className="w-full py-3 bg-jafra text-white rounded-xl font-semibold text-sm">
            {editing ? 'Guardar' : 'Agregar producto'}
          </button>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar producto">
        <p className="text-gray-600 text-sm mb-4">¿Eliminar este producto?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-600">Cancelar</button>
          <button onClick={() => { if (deleteId) { productosStore.delete(deleteId); load(); setDeleteId(null) } }}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">Eliminar</button>
        </div>
      </Modal>
    </div>
  )
}
