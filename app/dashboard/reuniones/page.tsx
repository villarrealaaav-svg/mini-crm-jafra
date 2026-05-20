'use client'

import { useEffect, useState } from 'react'
import { meetingsStore } from '@/lib/store'
import type { Meeting, MeetingModality } from '@/types'
import Modal from '@/components/Modal'

const emptyForm = {
  title: '', meeting_date: '', modality: 'presencial' as MeetingModality, zoom_link: '', notes: '',
}

export default function ReunionesPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Meeting | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function load() {
    const all = meetingsStore.getAll()
    setMeetings(all.sort((a, b) => a.meeting_date.localeCompare(b.meeting_date)))
  }
  useEffect(() => { load() }, [])

  function openAdd() {
    setEditing(null)
    setForm({ ...emptyForm, meeting_date: new Date().toISOString().split('T')[0] })
    setModalOpen(true)
  }

  function openEdit(m: Meeting) {
    setEditing(m)
    setForm({ title: m.title, meeting_date: m.meeting_date, modality: m.modality, zoom_link: m.zoom_link, notes: m.notes })
    setModalOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (editing) {
      meetingsStore.update(editing.id, form)
    } else {
      meetingsStore.add(form)
    }
    load()
    setModalOpen(false)
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = meetings.filter(m => m.meeting_date >= today)
  const past = meetings.filter(m => m.meeting_date < today)

  function formatDate(d: string) {
    if (!d) return ''
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  function MeetingCard({ m }: { m: Meeting }) {
    return (
      <div className="card p-4 ">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{m.modality === 'zoom' ? '💻' : '🤝'}</span>
              <p className="font-semibold text-gray-800 text-sm">{m.title}</p>
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-7">{formatDate(m.meeting_date)}</p>
            <div className="ml-7 mt-1 flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.modality === 'zoom' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {m.modality === 'zoom' ? 'Zoom' : 'Presencial'}
              </span>
            </div>
            {m.notes && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{m.notes}</p>}
            {m.zoom_link && (
              <a href={m.zoom_link} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium">
                🎥 Abrir Zoom
              </a>
            )}
          </div>
          <div className="flex gap-2 ml-2">
            <button onClick={() => openEdit(m)} className="text-gray-300 hover:text-jafra transition-colors">✏️</button>
            <button onClick={() => setDeleteId(m.id)} className="text-gray-300 hover:text-red-400 transition-colors">🗑️</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Reuniones</h1>
        <button onClick={openAdd} className="w-9 h-9 rounded-full bg-jafra text-white flex items-center justify-center text-xl shadow-sm active:scale-95 transition-transform">+</button>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🤝</p>
          <p className="text-gray-400 text-sm">Sin reuniones registradas</p>
        </div>
      ) : (
        <div className="space-y-5">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wide text-jafra mb-2">Próximas ({upcoming.length})</h2>
              <div className="space-y-2">{upcoming.map(m => <MeetingCard key={m.id} m={m} />)}</div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Pasadas ({past.length})</h2>
              <div className="space-y-2 opacity-60">{past.map(m => <MeetingCard key={m.id} m={m} />)}</div>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar reunión' : 'Nueva reunión'}>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Título*</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ej. Reunión mensual" className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha*</label>
            <input required type="date" value={form.meeting_date} onChange={e => setForm(f => ({ ...f, meeting_date: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Modalidad</label>
            <div className="grid grid-cols-2 gap-2">
              {(['presencial', 'zoom'] as MeetingModality[]).map(m => (
                <button key={m} type="button" onClick={() => setForm(f => ({ ...f, modality: m }))}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${form.modality === m ? 'bg-jafra text-white border-jafra' : 'border-gray-200 text-gray-600'}`}>
                  {m === 'zoom' ? '💻 Zoom' : '🤝 Presencial'}
                </button>
              ))}
            </div>
          </div>
          {form.modality === 'zoom' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Link de Zoom</label>
              <input type="url" value={form.zoom_link} onChange={e => setForm(f => ({ ...f, zoom_link: e.target.value }))}
                placeholder="https://zoom.us/j/..." className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Agenda, temas, etc." rows={2}
              className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
          </div>
          <button type="submit" className="w-full py-3 bg-jafra text-white rounded-xl font-semibold text-sm">
            {editing ? 'Guardar cambios' : 'Agregar reunión'}
          </button>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar reunión">
        <p className="text-gray-600 text-sm mb-4">¿Eliminar esta reunión?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl  text-sm font-medium text-gray-600">Cancelar</button>
          <button onClick={() => { if (deleteId) { meetingsStore.delete(deleteId); load(); setDeleteId(null) } }}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">Eliminar</button>
        </div>
      </Modal>
    </div>
  )
}
