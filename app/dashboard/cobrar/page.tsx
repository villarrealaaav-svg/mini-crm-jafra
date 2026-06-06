'use client'

import { useEffect, useState } from 'react'
import { paymentsStore, personsStore } from '@/lib/store'
import type { Payment, Person } from '@/types'

interface EnrichedPayment extends Payment {
  phone: string
  daysUntilPayment: number
}

export default function CobrarPage() {
  const [items, setItems] = useState<EnrichedPayment[]>([])

  useEffect(() => {
    const payments = paymentsStore.getAll()
    const persons = personsStore.getAll()
    const personMap = new Map(persons.map(p => [p.id, p]))
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const enriched: EnrichedPayment[] = payments
      .filter(p => p.status !== 'pagado')
      .map(p => {
        const person = personMap.get(p.person_id) as Person | undefined
        const payDate = new Date(p.payment_date + 'T12:00:00')
        const diff = Math.ceil((payDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return {
          ...p,
          phone: person?.phone || '',
          daysUntilPayment: diff,
        }
      })
      .sort((a, b) => a.daysUntilPayment - b.daysUntilPayment)

    setItems(enriched)
  }, [])

  function whatsAppLink(p: EnrichedPayment): string {
    if (!p.phone) return ''
    const phone = p.phone.replace(/\D/g, '')
    const date = formatDate(p.payment_date)
    const amount = p.amount
      ? `$${p.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
      : 'tu saldo'
    const msg = `Hola ${p.person_name} 💕 Te recuerdo que tu pago de ${amount} vence el ${date}. Por favor avísame cómo quedamos 😊`
    return `https://wa.me/52${phone}?text=${encodeURIComponent(msg)}`
  }

  function formatDate(d: string) {
    if (!d) return '—'
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  function urgencyStyle(days: number) {
    if (days < 0) return { card: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-700', label: `${Math.abs(days)}d vencido` }
    if (days === 0) return { card: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-700', label: '¡Hoy!' }
    if (days <= 3) return { card: 'border-amber-200 bg-amber-50', badge: 'bg-amber-100 text-amber-700', label: `${days}d` }
    if (days <= 7) return { card: 'border-yellow-200 bg-white', badge: 'bg-yellow-100 text-yellow-700', label: `${days}d` }
    return { card: 'border-gray-200 bg-white', badge: 'bg-gray-100 text-gray-500', label: `${days}d` }
  }

  const overdue = items.filter(p => p.daysUntilPayment < 0)
  const today = items.filter(p => p.daysUntilPayment === 0)
  const thisWeek = items.filter(p => p.daysUntilPayment > 0 && p.daysUntilPayment <= 7)
  const upcoming = items.filter(p => p.daysUntilPayment > 7)

  const sections = [
    { title: '🚨 Vencidos', items: overdue, color: 'text-red-500' },
    { title: '📅 Hoy', items: today, color: 'text-red-500' },
    { title: '⚠️ Esta semana', items: thisWeek, color: 'text-amber-600' },
    { title: '📋 Próximos', items: upcoming, color: 'text-gray-500' },
  ]

  function markPagado(id: string) {
    paymentsStore.update(id, { status: 'pagado' })
    setItems(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-200 mb-4">
        <h1 className="text-[22px] font-bold text-gray-900">Facturas pendientes</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {items.length === 0 ? '¡Todo al día!' : `${items.length} pendiente${items.length !== 1 ? 's' : ''}`}
        </p>
      </div>
      <div className="px-4">

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-3">🎉</p>
          <p className="text-gray-500 font-medium">¡Todo al día!</p>
          <p className="text-gray-400 text-sm mt-1">No hay pagos pendientes</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map(({ title, items: sItems, color }) => sItems.length > 0 && (
            <div key={title}>
              <h2 className={`text-xs font-bold uppercase tracking-wide mb-2 ${color}`}>{title} ({sItems.length})</h2>
              <div className="space-y-2">
                {sItems.map(p => {
                  const { card, badge, label } = urgencyStyle(p.daysUntilPayment)
                  return (
                    <div key={p.id} className={`rounded-2xl p-4 border ${card}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-800 text-sm">{p.person_name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${badge}`}>{label}</span>
                          </div>
                          <div className="flex gap-3 mt-1">
                            {p.amount > 0 && (
                              <p className="text-sm font-bold text-gray-700">
                                ${p.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 self-center">Vence {formatDate(p.payment_date)}</p>
                          </div>
                          {p.mod_fac > 0 && <p className="text-xs text-gray-400">Módulos: {p.mod_fac}</p>}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {p.phone && (
                          <a
                            href={whatsAppLink(p)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 text-white rounded-xl text-xs font-semibold active:scale-95 transition-transform"
                          >
                            💬 WhatsApp
                          </a>
                        )}
                        <button
                          onClick={() => markPagado(p.id)}
                          className="flex-1 py-2 bg-jafra text-white rounded-xl text-xs font-semibold active:scale-95 transition-transform"
                        >
                          ✓ Marcar pagado
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
