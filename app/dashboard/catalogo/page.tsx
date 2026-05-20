'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'

interface CatalogoItem {
  id: string
  title: string
  type: 'link' | 'imagen' | 'pdf' | 'texto'
  content: string
  created_at: string
}

const typeEmoji: Record<CatalogoItem['type'], string> = {
  link: '🔗', imagen: '🖼️', pdf: '📄', texto: '📝',
}

const KEY = 'jafra_catalogo'

function getItems(): CatalogoItem[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

function saveItems(items: CatalogoItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

const emptyForm = { title: '', type: 'link' as CatalogoItem['type'], content: '' }

export default function CatalogoPage() {
  const [items, setItems] = useState<CatalogoItem[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function load() { setItems(getItems()) }
  useEffect(() => { load() }, [])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const all = getItems()
    const newItem: CatalogoItem = { ...form, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    saveItems([...all, newItem])
    load()
    setModalOpen(false)
    setForm(emptyForm)
  }

  function handleDelete(id: string) {
    saveItems(getItems().filter(i => i.id !== id))
    load()
    setDeleteId(null)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Catálogo del mes</h1>
        <button onClick={() => { setForm(emptyForm); setModalOpen(true) }}
          className="w-9 h-9 rounded-full bg-jafra text-white flex items-center justify-center text-xl shadow-sm active:scale-95 transition-transform">+</button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-gray-400 text-sm">Agrega links, imágenes o PDFs<br />de tu catálogo aquí</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="card p-4  flex items-center gap-3">
              <span className="text-2xl flex-shrink-0">{typeEmoji[item.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                {item.type === 'link' ? (
                  <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-xs text-jafra truncate block">{item.content}</a>
                ) : (
                  <p className="text-xs text-gray-400 truncate">{item.content}</p>
                )}
              </div>
              <button onClick={() => setDeleteId(item.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">🗑️</button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Agregar al catálogo">
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre*</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ej. Catálogo Agosto 2025" className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {(['link', 'imagen', 'pdf', 'texto'] as CatalogoItem['type'][]).map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`py-2 rounded-xl text-sm font-medium border transition-colors ${form.type === t ? 'bg-jafra text-white border-jafra' : 'border-gray-200 text-gray-600'}`}>
                  {typeEmoji[t]} {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {form.type === 'link' ? 'URL' : form.type === 'texto' ? 'Texto' : 'Descripción / URL'}
            </label>
            {form.type === 'texto' ? (
              <textarea required value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Escribe el contenido..." rows={3}
                className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
            ) : (
              <input required value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder={form.type === 'link' ? 'https://...' : 'Link o descripción'}
                className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
            )}
          </div>
          <button type="submit" className="w-full py-3 bg-jafra text-white rounded-xl font-semibold text-sm">Agregar</button>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar item">
        <p className="text-gray-600 text-sm mb-4">¿Eliminar este item del catálogo?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl  text-sm font-medium text-gray-600">Cancelar</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">Eliminar</button>
        </div>
      </Modal>
    </div>
  )
}
