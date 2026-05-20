'use client'

import { useEffect, useState } from 'react'
import { remindersStore } from '@/lib/store'
import type { Reminder, ReminderType } from '@/types'
import Modal from '@/components/Modal'

const typeOptions: ReminderType[] = ['llamada', 'cobro', 'reunion', 'catalogo']
const typeEmoji: Record<ReminderType, string> = {
  llamada: '📞', cobro: '💰', reunion: '🤝', catalogo: '📖',
}
const typeColors: Record<ReminderType, string> = {
  llamada: 'bg-blue-100 text-blue-700',
  cobro: 'bg-amber-100 text-amber-700',
  reunion: 'bg-purple-100 text-purple-700',
  catalogo: 'bg-pink-100 text-pink-700',
}

const emptyForm = {
  title: '', reminder_type: 'llamada' as ReminderType,
  reminder_date: '', reminder_time: '', notes: '',
}

export default function RecordatoriosPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Reminder | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'todos' | 'auto' | 'manual'>('todos')

  function load() {
    const all = remindersStore.getAll()
    setReminders(all.sort((a, b) => a.reminder_date.localeCompare(b.reminder_date)))
  }
  useEffect(() => { load() }, [])

  function openAdd() {
    setEditing(null)
    setForm({ ...emptyForm, reminder_date: new Date().toISOString().split('T')[0] })
    setModalOpen(true)
  }

  function openEdit(r: Reminder) {
    if (r.auto) return
    setEditing(r)
    setForm({ title: r.title, reminder_type: r.reminder_type, reminder_date: r.reminder_date, reminder_time: r.reminder_time, notes: r.notes })
    setModalOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (editing) {
      remindersStore.update(editing.id, form)
    } else {
      remindersStore.add(form)
    }
    load()
    setModalOpen(false)
  }

  function todayStr() { return new Date().toISOString().split('T')[0] }

  function formatDate(d: string) {
    if (!d) return ''
    const t = todayStr()
    const tom = new Date(); tom.setDate(tom.getDate() + 1)
    const tomStr = tom.toISOString().split('T')[0]
    if (d === t) return 'Hoy'
    if (d === tomStr) return 'Mañana'
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const filtered = reminders.filter(r => {
    if (filter === 'auto') return r.auto
    if (filter === 'manual') return !r.auto
    return true
  })

  const grouped = filtered.reduce<Record<string, Reminder[]>>((acc, r) => {
    const key = r.reminder_date
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort()
  const today = todayStr()
  const autoCount = reminders.filter(r => r.auto).length
  const manualCount = reminders.filter(r => !r.auto).length

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900">Recordatorios</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{reminders.length} total</p>
          </div>
          <button onClick={openAdd} className="w-9 h-9 rounded-full bg-jafra text-white flex items-center justify-center text-xl shadow-sm active:scale-95 transition-transform">+</button>
        </div>
        {/* Filtros */}
        <div className="flex gap-2 mt-3">
        {([['todos', `Todos (${reminders.length})`], ['auto', `🔔 Auto (${autoCount})`], ['manual', `Manual (${manualCount})`]] as const).map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val as typeof filter)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === val ? 'bg-jafra text-white border-jafra' : 'border-gray-200 text-gray-600 bg-white'}`}>
            {label}
          </button>
        ))}
      </div>
      </div>
      <div className="px-4">

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-400 text-sm">
            {filter === 'auto' ? 'Agrega pagos para generar recordatorios automáticos' : 'Sin recordatorios'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {sortedDates.map(date => (
            <div key={date}>
              <h2 className={`text-xs font-bold uppercase tracking-wide mb-2 ${
                date < today ? 'text-red-400' : date === today ? 'text-jafra' : 'text-gray-500'
              }`}>
                {formatDate(date)}
                {date < today && ' · Vencido'}
              </h2>
              <div className="space-y-2">
                {grouped[date].map(r => (
                  <div key={r.id}
                    className={`rounded-2xl p-4 border flex items-start gap-3 ${
                      r.auto ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'
                    }`}>
                    <span className="text-xl flex-shrink-0">{typeEmoji[r.reminder_type]}</span>
                    <div className="flex-1 min-w-0" onClick={() => !r.auto && openEdit(r)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-800 text-sm">{r.title}</p>
                        {r.auto && (
                          <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">
                            auto
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[r.reminder_type]}`}>
                          {r.reminder_type}
                        </span>
                      </div>
                      {r.reminder_time && <p className="text-xs text-gray-400 mt-0.5">{r.reminder_time} hrs</p>}
                      {r.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.notes}</p>}
                    </div>
                    {!r.auto && (
                      <button onClick={() => setDeleteId(r.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">🗑️</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar recordatorio' : 'Nuevo recordatorio'}>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Título*</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ej. Llamar a María" className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, reminder_type: t }))}
                  className={`py-2 rounded-xl text-sm font-medium border transition-colors ${form.reminder_type === t ? 'bg-jafra text-white border-jafra' : 'border-gray-200 text-gray-600'}`}>
                  {typeEmoji[t]} {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha*</label>
              <input required type="date" value={form.reminder_date} onChange={e => setForm(f => ({ ...f, reminder_date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hora</label>
              <input type="time" value={form.reminder_time} onChange={e => setForm(f => ({ ...f, reminder_time: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Notas adicionales" rows={2}
              className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
          </div>
          <button type="submit" className="w-full py-3 bg-jafra text-white rounded-xl font-semibold text-sm">
            {editing ? 'Guardar cambios' : 'Agregar recordatorio'}
          </button>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar recordatorio">
        <p className="text-gray-600 text-sm mb-4">¿Eliminar este recordatorio?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl  text-sm font-medium text-gray-600">Cancelar</button>
          <button onClick={() => { if (deleteId) { remindersStore.delete(deleteId); load(); setDeleteId(null) } }}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">Eliminar</button>
        </div>
      </Modal>
      </div>
    </div>
  )
}
