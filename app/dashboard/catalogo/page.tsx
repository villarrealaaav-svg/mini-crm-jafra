'use client'

import { useEffect, useRef, useState } from 'react'
import Modal from '@/components/Modal'

interface CatalogoItem {
  id: string
  title: string
  type: 'link' | 'imagen' | 'pdf' | 'texto'
  content: string  // URL, base64 data URL, o texto
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

const emptyForm = { title: '', type: 'pdf' as CatalogoItem['type'], content: '' }

export default function CatalogoPage() {
  const [items, setItems] = useState<CatalogoItem[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewing, setViewing] = useState<CatalogoItem | null>(null)
  const [fileError, setFileError] = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)

  function load() { setItems(getItems()) }
  useEffect(() => { load() }, [])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError('')

    // Validar tipo
    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'
    if (form.type === 'imagen' && !isImage) {
      setFileError('Selecciona un archivo de imagen')
      return
    }
    if (form.type === 'pdf' && !isPdf) {
      setFileError('Selecciona un archivo PDF')
      return
    }

    // Límite ~4MB (localStorage tiene ~5MB total)
    if (file.size > 4 * 1024 * 1024) {
      setFileError(`Archivo muy grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máx 4MB.`)
      return
    }

    const reader = new FileReader()
    reader.onload = ev => {
      const data = ev.target?.result as string
      setForm(f => ({ ...f, content: data, title: f.title || file.name.replace(/\.[^.]+$/, '') }))
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.content) {
      setFileError(form.type === 'pdf' || form.type === 'imagen' ? 'Sube un archivo o pega una URL' : 'Ingresa contenido')
      return
    }
    try {
      const all = getItems()
      const newItem: CatalogoItem = { ...form, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      saveItems([...all, newItem])
      load()
      setModalOpen(false)
      setForm(emptyForm)
      setFileError('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setFileError(`Error guardando: ${msg}. Archivo posiblemente muy grande.`)
    }
  }

  function handleDelete(id: string) {
    saveItems(getItems().filter(i => i.id !== id))
    load()
    setDeleteId(null)
  }

  function openItem(item: CatalogoItem) {
    if (item.type === 'link') {
      window.open(item.content, '_blank', 'noopener,noreferrer')
    } else if (item.type === 'pdf' && item.content.startsWith('http')) {
      window.open(item.content, '_blank', 'noopener,noreferrer')
    } else {
      setViewing(item)
    }
  }

  const acceptForType = form.type === 'imagen' ? 'image/*' : form.type === 'pdf' ? 'application/pdf' : ''
  const isFileType = form.type === 'imagen' || form.type === 'pdf'
  const hasUploadedFile = isFileType && form.content.startsWith('data:')

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900">Catálogo</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => { setForm(emptyForm); setFileError(''); setModalOpen(true) }}
            className="w-9 h-9 rounded-full bg-jafra text-white flex items-center justify-center text-xl shadow-sm active:scale-95 transition-transform">+</button>
        </div>
      </div>

      <div className="px-4">

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-gray-400 text-sm">Agrega PDFs, imágenes o links<br />de tu catálogo aquí</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex items-center gap-3 active:scale-[0.99] transition-transform cursor-pointer"
              onClick={() => openItem(item)}>
              <span className="text-2xl flex-shrink-0">{typeEmoji[item.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                <p className="text-xs text-gray-400 truncate">
                  {item.content.startsWith('data:') ? `Archivo ${item.type}` : item.content}
                </p>
              </div>
              <button onClick={e => { e.stopPropagation(); setDeleteId(item.id) }}
                className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">🗑️</button>
            </div>
          ))}
        </div>
      )}

      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setFileError('') }} title="Agregar al catálogo">
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <div className="grid grid-cols-4 gap-2">
              {(['pdf', 'imagen', 'link', 'texto'] as CatalogoItem['type'][]).map(t => (
                <button key={t} type="button"
                  onClick={() => { setForm(f => ({ ...f, type: t, content: '' })); setFileError('') }}
                  className={`py-2 rounded-xl text-xs font-medium border transition-colors ${form.type === t ? 'bg-jafra text-white border-jafra' : 'border-gray-200 text-gray-600'}`}>
                  {typeEmoji[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre*</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ej. Catálogo Marzo 2026"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
          </div>

          {isFileType && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {form.type === 'pdf' ? 'Archivo PDF' : 'Imagen'}
              </label>
              <input ref={fileRef} type="file" accept={acceptForType} onChange={handleFile} className="hidden" />
              {hasUploadedFile ? (
                <div className="rounded-xl bg-green-50 border border-green-200 p-3 flex items-center gap-3">
                  <span className="text-xl">{typeEmoji[form.type]}</span>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-green-700">Archivo cargado ({(form.content.length / 1024).toFixed(0)} KB)</p>
                    <p className="text-green-600">Listo para guardar</p>
                  </div>
                  <button type="button" onClick={() => { setForm(f => ({ ...f, content: '' })); setFileError('') }}
                    className="text-red-500 text-xs font-medium">Quitar</button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full py-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-xs text-gray-500 active:scale-95 transition-transform">
                  📎 Selecciona {form.type === 'pdf' ? 'un PDF' : 'una imagen'}
                </button>
              )}
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">o pega URL abajo</p>
              <input type="url" value={form.content.startsWith('data:') ? '' : form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="https://..." disabled={hasUploadedFile}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-jafra disabled:bg-gray-50 disabled:text-gray-400" />
            </div>
          )}

          {form.type === 'link' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
              <input required type="url" value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
            </div>
          )}

          {form.type === 'texto' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contenido</label>
              <textarea required value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Escribe el contenido..." rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra" />
            </div>
          )}

          {fileError && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{fileError}</p>
          )}

          <button type="submit" className="w-full py-3 bg-jafra text-white rounded-xl font-semibold text-sm">
            Agregar al catálogo
          </button>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar item">
        <p className="text-gray-600 text-sm mb-4">¿Eliminar este item del catálogo?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-600">Cancelar</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">Eliminar</button>
        </div>
      </Modal>

      {/* Viewer fullscreen para PDFs e imágenes */}
      {viewing && (
        <div onClick={() => setViewing(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, margin: 0 }}>{viewing.title}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href={viewing.content} download={viewing.title}
                onClick={e => e.stopPropagation()}
                style={{ padding: '6px 12px', borderRadius: '8px', background: '#E91E8C', color: '#fff', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                ⬇ Descargar
              </a>
              <button onClick={() => setViewing(null)}
                style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px', border: 'none' }}>
                Cerrar
              </button>
            </div>
          </div>
          <div onClick={e => e.stopPropagation()}
            style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
            {viewing.type === 'pdf' ? (
              <embed src={viewing.content} type="application/pdf"
                style={{ width: '100%', height: '100%', minHeight: '70vh', borderRadius: '8px' }} />
            ) : viewing.type === 'imagen' ? (
              <img src={viewing.content} alt={viewing.title}
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
            ) : (
              <pre style={{ background: '#fff', padding: '16px', borderRadius: '8px', whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px' }}>
                {viewing.content}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
