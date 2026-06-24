'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminGate from '@/components/AdminGate'
import { getMuro, saveMuro } from '@/lib/publicApi'
import type { MuroEntry } from '@/types'

const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']

function defaultMonth(): string {
  const d = new Date()
  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`
}

function PublicarMuroInner({ tenant }: { tenant: string }) {
  const [month, setMonth] = useState('')
  const [entries, setEntries] = useState<MuroEntry[]>([])
  const [saving, setSaving] = useState<'' | 'saving' | 'saved' | 'error'>('')

  useEffect(() => {
    getMuro(tenant).then(r => {
      if (r) {
        setMonth(r.month)
        setEntries(r.entries)
      } else {
        setMonth(defaultMonth())
      }
    }).catch(() => setMonth(defaultMonth()))
  }, [tenant])

  function updateEntry(id: string, patch: Partial<MuroEntry>) {
    setEntries(es => es.map(e => e.id === id ? { ...e, ...patch } : e))
  }

  function addEntry() {
    setEntries(es => [...es, { id: crypto.randomUUID(), name: '', score: 0 }])
  }

  function removeEntry(id: string) {
    setEntries(es => es.filter(e => e.id !== id))
  }

  function moveUp(i: number) {
    if (i === 0) return
    setEntries(es => {
      const next = [...es]
      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
      return next
    })
  }

  function moveDown(i: number) {
    setEntries(es => {
      if (i === es.length - 1) return es
      const next = [...es]
      ;[next[i + 1], next[i]] = [next[i], next[i + 1]]
      return next
    })
  }

  function sortByScore() {
    setEntries(es => [...es].sort((a, b) => b.score - a.score))
  }

  async function handleSave() {
    setSaving('saving')
    try {
      await saveMuro(
        month.trim() || defaultMonth(),
        entries.filter(e => e.name.trim()),
      )
      setSaving('saved')
      setTimeout(() => setSaving(''), 2000)
    } catch (err) {
      setSaving('error')
      alert('No se pudo guardar: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  // Vista previa ordenada como aparecerá en público
  const previewSorted = [...entries].sort((a, b) => b.score - a.score)

  return (
    <div className="max-w-lg mx-auto pb-32">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 mb-4">
        <Link href="/dashboard/publicar" className="text-[11px] text-jafra-purple font-semibold">← Publicar</Link>
        <h1 className="text-[22px] font-bold text-gray-900 mt-0.5">Muro del éxito</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">Solo editas mes + ranking. Diseño es fijo.</p>
      </div>

      <div className="px-4 space-y-4">

        {/* Mes */}
        <div className="card p-4">
          <label className="block text-xs font-bold uppercase tracking-wide text-jafra-purple mb-2">Mes / Período</label>
          <input
            value={month}
            onChange={e => setMonth(e.target.value)}
            placeholder="MAYO 2026"
            className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-jafra"
          />
          <p className="text-[10px] text-gray-400 mt-1.5">Se muestra grande en mayúsculas debajo del título.</p>
        </div>

        {/* Lista */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wide text-jafra-purple">Ranking</p>
            <button onClick={sortByScore}
              className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">
              Ordenar por puntaje
            </button>
          </div>

          {entries.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Sin personas. Agrega la primera.</p>
          ) : (
            <div className="space-y-2">
              {entries.map((e, i) => (
                <div key={e.id} className="rounded-xl bg-gray-50 border border-gray-200 p-2.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] font-bold text-jafra-purple w-6">{i + 1}</span>
                    <button onClick={() => moveUp(i)} className="text-xs px-1.5 py-0.5 rounded bg-white border border-gray-200" disabled={i === 0}>↑</button>
                    <button onClick={() => moveDown(i)} className="text-xs px-1.5 py-0.5 rounded bg-white border border-gray-200" disabled={i === entries.length - 1}>↓</button>
                    <div className="flex-1" />
                    <button onClick={() => removeEntry(e.id)} className="text-xs text-red-500 px-2">🗑</button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={e.name}
                      onChange={ev => updateEntry(e.id, { name: ev.target.value })}
                      placeholder="Nombre completo"
                      className="flex-1 px-2.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-jafra bg-white"
                    />
                    <input
                      type="number" step="0.01"
                      value={e.score || ''}
                      onChange={ev => updateEntry(e.id, { score: parseFloat(ev.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-24 px-2.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-jafra text-right bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={addEntry}
            className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-jafra/30 bg-jafra-light/40 text-xs font-semibold text-jafra-dark active:scale-95 transition-transform">
            + Agregar persona
          </button>
        </div>

        {/* Vista previa orden */}
        {previewSorted.length > 0 && (
          <div className="card p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-jafra-purple mb-2">Vista previa orden</p>
            <div className="space-y-1">
              {previewSorted.map((e, i) => (
                <div key={e.id} className="flex items-center gap-2 text-xs">
                  <span className="w-5 text-jafra-purple font-bold">{i + 1}</span>
                  <span className="flex-1 text-gray-700 truncate">{e.name || '(sin nombre)'}</span>
                  <span className="text-gray-500 font-mono">{e.score.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link href="/p/muro" target="_blank"
          className="block text-center py-2.5 rounded-xl bg-jafra-light text-jafra-dark text-xs font-semibold">
          👁 Ver cómo se verá público
        </Link>
      </div>

      {/* Footer fijo Guardar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-40"
        style={{ boxShadow: '0 -4px 14px rgba(0,0,0,0.06)' }}>
        <div className="max-w-lg mx-auto">
          <button onClick={handleSave} disabled={saving === 'saving'}
            className="w-full py-3 rounded-xl bg-jafra text-white text-sm font-bold disabled:opacity-60">
            {saving === 'saving' ? 'Guardando...' : saving === 'saved' ? '✓ Guardado' : 'Guardar ranking'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PublicarMuroAdminPage() {
  return (
    <AdminGate>
      {(s) => <PublicarMuroInner tenant={s.tenant} />}
    </AdminGate>
  )
}
