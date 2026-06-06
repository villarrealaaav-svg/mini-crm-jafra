'use client'

import { useEffect, useState } from 'react'
import { personsStore, paymentsStore } from '@/lib/store'
import type { Person, PersonStatus, Payment } from '@/types'
import { PersonBadge, PaymentBadge } from '@/components/StatusBadge'
import Modal from '@/components/Modal'

const statusOptions: PersonStatus[] = ['activa', 'pendiente', 'inactiva']

const emptyForm = {
  name: '', phone: '', birthday: '', notes: '',
  status: 'pendiente' as PersonStatus,
  billing_date: '', payment_date: '',
}

export default function PersonasPage() {
  const [persons, setPersons] = useState<Person[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Person | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [historyPerson, setHistoryPerson] = useState<Person | null>(null)

  function load() {
    setPersons(personsStore.getAll())
    setPayments(paymentsStore.getAll())
  }
  useEffect(() => { load() }, [])

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true) }

  function openEdit(p: Person) {
    setEditing(p)
    setForm({
      name: p.name, phone: p.phone, birthday: p.birthday || '', notes: p.notes,
      status: p.status,
      billing_date: p.billing_date || '',
      payment_date: p.payment_date || '',
    })
    setModalOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      ...form,
      birthday: form.birthday || null,
      billing_date: form.billing_date || null,
      payment_date: form.payment_date || null,
    }
    if (editing) { personsStore.update(editing.id, data) } else { personsStore.add(data) }
    load(); setModalOpen(false)
  }

  function formatBirthday(d: string | null) {
    if (!d) return ''
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
  }

  function isBirthdaySoon(d: string | null): boolean {
    if (!d) return false
    const today = new Date()
    const bd = new Date(d + 'T12:00:00')
    const thisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate())
    const diff = Math.ceil((thisYear.getTime() - today.setHours(0,0,0,0)) / 86400000)
    return diff >= 0 && diff <= 7
  }

  function handleDelete(id: string) {
    personsStore.delete(id)
    load(); setDeleteConfirm(null)
  }

  const filtered = persons.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  )

  function formatDate(d: string | null) {
    if (!d) return ''
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function getPersonPayments(personId: string): Payment[] {
    return payments
      .filter(p => p.person_id === personId)
      .sort((a, b) => b.billing_date.localeCompare(a.billing_date))
  }

  const historyPayments = historyPerson ? getPersonPayments(historyPerson.id) : []
  const historyTotal = historyPayments.reduce((s, p) => s + (p.amount || 0), 0)
  const historyCobrado = historyPayments.filter(p => p.status === 'pagado').reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900">Personas</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{persons.length} registradas</p>
          </div>
          <button onClick={openAdd} className="w-9 h-9 rounded-full bg-jafra text-white flex items-center justify-center text-xl shadow-sm active:scale-95 transition-transform">+</button>
        </div>
        <input
          type="search"
          placeholder="Buscar nombre o teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mt-3 w-full px-4 py-2.5 rounded-xl  bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-jafra"
        />
      </div>
      <div className="px-4 pt-3">

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-400 text-sm">{search ? 'Sin resultados' : 'Agrega tu primera persona'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const personPayments = getPersonPayments(p.id)
            const hasPending = personPayments.some(pay => pay.status !== 'pagado')
            return (
              <div key={p.id} className="card p-4 ">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                      <PersonBadge status={p.status} />
                      {hasPending && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">💰 pendiente</span>}
                    </div>
                    {p.phone && <p className="text-xs text-gray-400 mt-0.5">{p.phone}</p>}
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {p.billing_date && <p className="text-xs text-gray-500">📋 Fac: {formatDate(p.billing_date)}</p>}
                      {p.payment_date && <p className="text-xs text-jafra">💰 Pago: {formatDate(p.payment_date)}</p>}
                      {p.birthday && (
                        <p className={`text-xs font-medium ${isBirthdaySoon(p.birthday) ? 'text-jafra-purple bg-jafra-light px-1.5 py-0.5 rounded-full' : 'text-jafra-purple'}`}>
                          🎂 {formatBirthday(p.birthday)}{isBirthdaySoon(p.birthday) ? ' · ¡pronto!' : ''}
                        </p>
                      )}
                    </div>
                    {personPayments.length > 0 && (
                      <button onClick={() => setHistoryPerson(p)}
                        className="mt-2 text-xs text-jafra font-medium underline-offset-2 hover:underline">
                        Ver historial ({personPayments.length} ciclo{personPayments.length !== 1 ? 's' : ''})
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    {p.phone && (
                      <a href={`https://wa.me/52${p.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-sm">💬</a>
                    )}
                    <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-sm">✏️</button>
                    <button onClick={() => setDeleteConfirm(p.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-sm">🗑️</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal agregar/editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar persona' : 'Nueva persona'}>
        <form onSubmit={handleSave} className="space-y-3">
          <Field label="Nombre*" required value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Nombre completo" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Teléfono" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="10 dígitos" type="tel" />
            <Field label="🎂 Cumpleaños" value={form.birthday} onChange={v => setForm(f => ({ ...f, birthday: v }))} type="date" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PersonStatus }))}
              className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra">
              {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Fecha de facturación" value={form.billing_date} onChange={v => setForm(f => ({ ...f, billing_date: v }))} type="date" />
            <Field label="Fecha de pago" value={form.payment_date} onChange={v => setForm(f => ({ ...f, payment_date: v }))} type="date" />
          </div>
          <Field label="Notas" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Notas adicionales" textarea />
          <button type="submit" className="w-full py-3 bg-jafra text-white rounded-xl font-semibold text-sm">
            {editing ? 'Guardar cambios' : 'Agregar persona'}
          </button>
        </form>
      </Modal>

      {/* Modal historial */}
      <Modal open={!!historyPerson} onClose={() => setHistoryPerson(null)} title={`Historial — ${historyPerson?.name}`}>
        {historyPerson && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">Total facturado</p>
                <p className="text-sm font-bold text-gray-700">${historyTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-green-400">Cobrado</p>
                <p className="text-sm font-bold text-green-700">${historyCobrado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            {historyPayments.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">Sin pagos registrados</p>
            ) : (
              <div className="space-y-2">
                {historyPayments.map((pay, i) => (
                  <div key={pay.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Ciclo {historyPayments.length - i}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {formatDate(pay.billing_date)} → {formatDate(pay.payment_date)}
                      </p>
                      {pay.amount > 0 && (
                        <p className="text-sm font-semibold text-gray-800">${pay.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                      )}
                      {pay.mod_fac > 0 && <p className="text-xs text-gray-400">Mód: {pay.mod_fac}</p>}
                    </div>
                    <PaymentBadge status={pay.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal eliminar */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar persona">
        <p className="text-gray-600 text-sm mb-4">¿Eliminar esta persona? Esta acción no se puede deshacer.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl  text-sm font-medium text-gray-600">Cancelar</button>
          <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">Eliminar</button>
        </div>
      </Modal>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', required, textarea }: {
  label: string, value: string, onChange: (v: string) => void
  placeholder?: string, type?: string, required?: boolean, textarea?: boolean
}) {
  const cls = "w-full px-3 py-2.5 rounded-xl  text-sm text-gray-800 focus:outline-none focus:border-jafra"
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} className={cls} />
      }
    </div>
  )
}
