'use client'

import { useEffect, useRef, useState } from 'react'
import { paymentsStore, personsStore } from '@/lib/store'
import { parseImportFile, parseExcelBuffer, exportToCSV } from '@/lib/csv'
import type { ImportRow } from '@/lib/csv'
import type { Payment, PaymentStatus, Person } from '@/types'
import Modal from '@/components/Modal'

const statusOptions: PaymentStatus[] = ['pendiente', 'pagado', 'atrasado']
const statusStyle: Record<PaymentStatus, string> = {
  pagado: 'bg-green-100 text-green-700 font-semibold',
  pendiente: 'bg-amber-100 text-amber-700',
  atrasado: 'bg-red-100 text-red-600 font-semibold',
}
const statusLabel: Record<PaymentStatus, string> = {
  pagado: 'PAGADO', pendiente: 'PENDIENTE', atrasado: 'ATRASADO',
}

const emptyForm = {
  person_id: '', person_name: '',
  billing_date: '', payment_date: '',
  amount: '', mod_fac: '',
  status: 'pendiente' as PaymentStatus,
  notes: '',
}

export default function PagosPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Payment | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Duplicados detectados durante import
  const [dupAnalysis, setDupAnalysis] = useState<{
    cleanRows: ImportRow[]
    duplicates: Array<{
      row: ImportRow
      existing: Payment[]
      sameAmount: boolean
      sameDate: boolean
    }>
  } | null>(null)
  const [dupSelected, setDupSelected] = useState<Set<number>>(new Set())

  function load() {
    const ps = paymentsStore.getAll()
    setPayments(ps.sort((a, b) => a.billing_date.localeCompare(b.billing_date)))
    setPersons(personsStore.getAll())
  }
  useEffect(() => { load() }, [])

  function openAdd() { setEditing(null); setForm(emptyForm); setModalOpen(true) }

  function openEdit(p: Payment) {
    setEditing(p)
    setForm({
      person_id: p.person_id, person_name: p.person_name,
      billing_date: p.billing_date, payment_date: p.payment_date,
      amount: p.amount ? String(p.amount) : '',
      mod_fac: p.mod_fac ? String(p.mod_fac) : '',
      status: p.status, notes: p.notes,
    })
    setModalOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      person_id: form.person_id, person_name: form.person_name,
      billing_date: form.billing_date, payment_date: form.payment_date,
      amount: parseFloat(form.amount) || 0,
      mod_fac: parseFloat(form.mod_fac) || 0,
      status: form.status, notes: form.notes,
    }
    if (editing) { paymentsStore.update(editing.id, data) } else { paymentsStore.add(data) }
    load(); setModalOpen(false)
  }

  function togglePagado(p: Payment) {
    const next: PaymentStatus = p.status === 'pagado' ? 'pendiente' : 'pagado'
    paymentsStore.update(p.id, { status: next })
    load()
  }

  function handlePersonSelect(id: string) {
    const p = persons.find(x => x.id === id)
    setForm(f => ({
      ...f, person_id: id, person_name: p?.name || '',
      billing_date: p?.billing_date || f.billing_date,
      payment_date: p?.payment_date || f.payment_date,
    }))
  }

  function whatsAppLink(p: Payment): string {
    const person = persons.find(x => x.id === p.person_id)
    const phone = person?.phone?.replace(/\D/g, '') || ''
    if (!phone) return ''
    const date = formatDate(p.payment_date)
    const amount = p.amount ? `$${p.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : 'tu saldo'
    const msg = `Hola ${p.person_name} 💕 Te recuerdo que tu pago de ${amount} vence el ${date}. Por favor avísame cómo quedamos 😊`
    return `https://wa.me/52${phone}?text=${encodeURIComponent(msg)}`
  }

  // --- Import ---
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const isExcel = /\.(xlsx|xls)$/i.test(file.name)
    const reader = new FileReader()
    if (isExcel) {
      reader.onload = ev => {
        const rows = parseExcelBuffer(ev.target?.result as ArrayBuffer)
        doImport(rows)
      }
      reader.readAsArrayBuffer(file)
    } else {
      reader.onload = ev => {
        const rows = parseImportFile(ev.target?.result as string)
        doImport(rows)
      }
      reader.readAsText(file, 'UTF-8')
    }
    e.target.value = ''
  }

  function doImport(rows: ImportRow[]) {
    if (!rows.length) return
    const existingPayments = paymentsStore.getAll()

    // Mapa: nombre normalizado → todos los pagos existentes con ese nombre
    const byName = new Map<string, Payment[]>()
    for (const p of existingPayments) {
      const key = p.person_name.toLowerCase().trim()
      const arr = byName.get(key) || []
      arr.push(p)
      byName.set(key, arr)
    }

    const cleanRows: ImportRow[] = []
    const duplicates: Array<{ row: ImportRow; existing: Payment[]; sameAmount: boolean; sameDate: boolean }> = []
    const seenInImport = new Set<string>()

    for (const row of rows) {
      if (!row.name) continue
      const key = row.name.toLowerCase().trim()

      // Detección intra-import: misma fila 2 veces en el mismo Excel
      const intraKey = `${key}|${row.billing_date}|${row.amount}`
      if (seenInImport.has(intraKey)) {
        duplicates.push({ row, existing: [], sameAmount: true, sameDate: true })
        continue
      }
      seenInImport.add(intraKey)

      const existing = byName.get(key) || []
      if (existing.length > 0) {
        const sameAmount = existing.some(e => Math.abs((e.amount || 0) - row.amount) < 0.01)
        const sameDate = existing.some(e => e.billing_date === row.billing_date)
        duplicates.push({ row, existing, sameAmount, sameDate })
      } else {
        cleanRows.push(row)
      }
    }

    if (duplicates.length === 0) {
      // Sin duplicados: importar todo directo
      importRows(rows)
      alert(`✓ ${rows.length} registros importados`)
      return
    }

    // Hay duplicados: abrir modal comparativo
    setDupAnalysis({ cleanRows, duplicates })
    setDupSelected(new Set()) // ninguno seleccionado por default
  }

  function importRows(rows: ImportRow[]) {
    const existingPersons = personsStore.getAll()
    const personMap = new Map(existingPersons.map(p => [p.name.toLowerCase().trim(), p]))
    for (const row of rows) {
      if (!row.name) continue
      const key = row.name.toLowerCase().trim()
      let person = personMap.get(key)
      if (!person) {
        person = personsStore.add({
          name: row.name, phone: '', notes: '',
          status: 'activa',
          billing_date: row.billing_date || null,
          payment_date: row.payment_date || null,
        })
        personMap.set(key, person)
      }
      paymentsStore.add({
        person_id: person.id,
        person_name: person.name,
        billing_date: row.billing_date,
        payment_date: row.payment_date,
        amount: row.amount,
        mod_fac: row.mod_fac,
        status: row.status,
        notes: row.notes,
      })
    }
    load()
  }

  function confirmDupImport() {
    if (!dupAnalysis) return
    const dupRowsToAdd = Array.from(dupSelected).map(i => dupAnalysis.duplicates[i].row)
    const allToAdd = [...dupAnalysis.cleanRows, ...dupRowsToAdd]
    importRows(allToAdd)
    const skipped = dupAnalysis.duplicates.length - dupSelected.size
    alert(`✓ ${allToAdd.length} importados${skipped > 0 ? ` (${skipped} duplicados omitidos)` : ''}`)
    setDupAnalysis(null)
    setDupSelected(new Set())
  }

  function toggleDup(i: number) {
    const next = new Set(dupSelected)
    if (next.has(i)) next.delete(i)
    else next.add(i)
    setDupSelected(next)
  }

  function selectAllDups() {
    if (!dupAnalysis) return
    setDupSelected(new Set(dupAnalysis.duplicates.map((_, i) => i)))
  }

  function deselectAllDups() {
    setDupSelected(new Set())
  }

  function formatDate(d: string) {
    if (!d) return '—'
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const totalAmount = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const totalPagado = payments.filter(p => p.status === 'pagado').reduce((s, p) => s + (p.amount || 0), 0)
  const totalPendiente = payments.filter(p => p.status !== 'pagado').reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div className="max-w-full pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900">Saldos</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{payments.length} registros</p>
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFileChange} className="hidden" />
            <button onClick={() => fileRef.current?.click()}
              className="px-3 py-2 rounded-xl  bg-gray-50 text-xs font-medium text-gray-600 active:scale-95 transition-transform">
              📥 Importar
            </button>
            {payments.length > 0 && (
              <button onClick={() => exportToCSV(payments, persons)}
                className="px-3 py-2 rounded-xl  bg-gray-50 text-xs font-medium text-gray-600 active:scale-95 transition-transform">
                📤 Exportar
              </button>
            )}
            <button onClick={openAdd} className="w-9 h-9 rounded-full bg-jafra text-white flex items-center justify-center text-xl shadow-sm active:scale-95 transition-transform">+</button>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="max-w-lg mx-auto grid grid-cols-3 gap-2 mb-5">
        <div className="card p-3  text-center">
          <p className="text-xs text-gray-400 mb-0.5">Total</p>
          <p className="text-sm font-bold text-gray-700">${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 border border-green-200 text-center">
          <p className="text-xs text-green-500 mb-0.5">Cobrado</p>
          <p className="text-sm font-bold text-green-700">${totalPagado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-center">
          <p className="text-xs text-amber-500 mb-0.5">Por cobrar</p>
          <p className="text-sm font-bold text-amber-700">${totalPendiente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Tabla */}
      {payments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">💰</p>
          <p className="text-gray-400 text-sm">Sin pagos registrados</p>
          <p className="text-gray-300 text-xs mt-1">Usa "Importar" para cargar tu Excel, o "+" para agregar uno a uno</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl  bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-jafra-light text-gray-600 text-xs">
                <th className="px-3 py-2.5 text-left font-semibold">#</th>
                <th className="px-3 py-2.5 text-left font-semibold min-w-52">Nombre</th>
                <th className="px-3 py-2.5 text-center font-semibold whitespace-nowrap">Fecha Fac.</th>
                <th className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">Importe</th>
                <th className="px-3 py-2.5 text-center font-semibold">Mód.</th>
                <th className="px-3 py-2.5 text-center font-semibold whitespace-nowrap">Fecha Pago</th>
                <th className="px-3 py-2.5 text-center font-semibold">Estado</th>
                <th className="px-2 py-2.5 text-center font-semibold">Acc.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p, i) => {
                const wa = whatsAppLink(p)
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${p.status === 'atrasado' ? 'bg-red-50/40' : ''}`}>
                    <td className="px-3 py-2.5 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-normal break-words">{p.person_name || '—'}</td>
                    <td className="px-3 py-2.5 text-center text-gray-500 text-xs whitespace-nowrap">{formatDate(p.billing_date)}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-gray-700 whitespace-nowrap">
                      {p.amount ? `$${p.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center text-gray-500 text-xs">{p.mod_fac || '—'}</td>
                    <td className="px-3 py-2.5 text-center text-gray-500 text-xs whitespace-nowrap">{formatDate(p.payment_date)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <button onClick={() => togglePagado(p)}
                        className={`text-xs px-2 py-1 rounded-full transition-all ${statusStyle[p.status]}`}>
                        {statusLabel[p.status]}
                      </button>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-1">
                        {wa && (
                          <a href={wa} target="_blank" rel="noopener noreferrer"
                            className="w-6 h-6 flex items-center justify-center text-green-500 hover:text-green-600 text-sm" title="WhatsApp">
                            💬
                          </a>
                        )}
                        <button onClick={() => openEdit(p)} className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-jafra text-xs">✏️</button>
                        <button onClick={() => setDeleteId(p.id)} className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 text-xs">🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal agregar/editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar pago' : 'Nuevo pago'}>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Persona</label>
            {persons.length > 0 ? (
              <select value={form.person_id} onChange={e => handlePersonSelect(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra">
                <option value="">Seleccionar persona</option>
                {persons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ) : (
              <input value={form.person_name} onChange={e => setForm(f => ({ ...f, person_name: e.target.value }))}
                placeholder="Nombre" className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de facturación*</label>
              <input required type="date" value={form.billing_date} onChange={e => setForm(f => ({ ...f, billing_date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de pago*</label>
              <input required type="date" value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Importe ($)</label>
              <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Módulos</label>
              <input type="number" step="0.01" min="0" value={form.mod_fac} onChange={e => setForm(f => ({ ...f, mod_fac: e.target.value }))}
                placeholder="1.00" className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <div className="flex gap-2">
              {statusOptions.map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${form.status === s ? 'bg-jafra text-white border-jafra' : 'border-gray-200 text-gray-600'}`}>
                  {statusLabel[s]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Observaciones..." rows={2}
              className="w-full px-3 py-2.5 rounded-xl  text-sm focus:outline-none focus:border-jafra" />
          </div>
          <div className="bg-jafra-light rounded-xl px-3 py-2 text-xs text-jafra-dark">
            🔔 Se crean 3 recordatorios automáticos al guardar
          </div>
          <button type="submit" className="w-full py-3 bg-jafra text-white rounded-xl font-semibold text-sm">
            {editing ? 'Guardar cambios' : 'Agregar pago'}
          </button>
        </form>
      </Modal>

      {/* Modal duplicados detectados */}
      <Modal
        open={!!dupAnalysis}
        onClose={() => { setDupAnalysis(null); setDupSelected(new Set()) }}
        title={`${dupAnalysis?.duplicates.length || 0} duplicados encontrados`}
        footer={
          dupAnalysis && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button onClick={selectAllDups}
                  className="flex-1 py-2 rounded-xl bg-gray-100 text-xs font-medium text-gray-700">
                  Seleccionar todos
                </button>
                <button onClick={deselectAllDups}
                  className="flex-1 py-2 rounded-xl bg-gray-100 text-xs font-medium text-gray-700">
                  Ninguno
                </button>
              </div>
              <button onClick={confirmDupImport}
                className="w-full py-3 rounded-xl bg-jafra text-white text-sm font-bold">
                ✓ Importar {dupAnalysis.cleanRows.length + dupSelected.size} en total
              </button>
              <p className="text-[10px] text-gray-400 text-center">
                {dupAnalysis.cleanRows.length} nuevos + {dupSelected.size} duplicados seleccionados
              </p>
            </div>
          )
        }
      >
        {dupAnalysis && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-2">
              Estos nombres ya existen. Marca los que sí quieras agregar igual:
            </p>
            {dupAnalysis.duplicates.map((d, i) => {
              const checked = dupSelected.has(i)
              const newAmount = d.row.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })
              const conflictBadge = !d.sameAmount
                ? <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">⚠ MONTO DISTINTO</span>
                : d.sameAmount && d.sameDate
                ? <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">IDÉNTICO</span>
                : <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">FECHA DISTINTA</span>
              return (
                <label key={i}
                  className={`block rounded-xl border p-3 cursor-pointer transition-colors ${checked ? 'bg-jafra-light border-jafra' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-start gap-2.5">
                    <input type="checkbox" checked={checked} onChange={() => toggleDup(i)}
                      className="mt-0.5 accent-jafra w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <p className="text-xs font-bold text-gray-800">{d.row.name}</p>
                        {conflictBadge}
                      </div>
                      <p className="text-[11px] text-gray-600">
                        <span className="font-semibold text-jafra-dark">Nuevo:</span> ${newAmount} · {formatDate(d.row.billing_date)}
                      </p>
                      {d.existing.length > 0 && (
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          <span className="font-semibold">Existente{d.existing.length > 1 ? 's' : ''}:</span>{' '}
                          {d.existing.map(e => `$${(e.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} · ${formatDate(e.billing_date)}`).join(' | ')}
                        </p>
                      )}
                      {d.existing.length === 0 && (
                        <p className="text-[11px] text-orange-500 mt-0.5">Repetido dentro del mismo archivo Excel</p>
                      )}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        )}
      </Modal>

      {/* Modal eliminar */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar pago">
        <p className="text-gray-600 text-sm mb-1">¿Eliminar este pago?</p>
        <p className="text-xs text-gray-400 mb-4">También se eliminarán sus recordatorios automáticos.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl  text-sm font-medium text-gray-600">Cancelar</button>
          <button onClick={() => { if (deleteId) { paymentsStore.delete(deleteId); load(); setDeleteId(null) } }}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">Eliminar</button>
        </div>
      </Modal>
    </div>
  )
}
