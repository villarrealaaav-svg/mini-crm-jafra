'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { personsStore, paymentsStore, remindersStore, meetingsStore, userStore } from '@/lib/store'
import type { Person, Payment } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [persons, setPersons] = useState<Person[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [reminderCount, setReminderCount] = useState(0)
  const [meetingCount, setMeetingCount] = useState(0)

  useEffect(() => {
    const user = userStore.get()
    if (!user) { router.replace('/login'); return }
    setUserName(user)
    setPersons(personsStore.getAll())
    const pays = paymentsStore.getAll()
    setPayments(pays)
    const today = new Date().toISOString().split('T')[0]
    setReminderCount(remindersStore.getAll().filter(r => r.reminder_date === today).length)
    setMeetingCount(meetingsStore.getAll().filter(m => m.meeting_date >= today).length)
  }, [router])

  const today = new Date().toISOString().split('T')[0]
  const pendingPayments = payments.filter(p => p.status !== 'pagado')
  const overduePayments = payments.filter(p => p.status !== 'pagado' && p.payment_date < today)
  const totalCobrado  = payments.filter(p => p.status === 'pagado').reduce((s, p) => s + (p.amount || 0), 0)
  const totalPendiente = pendingPayments.reduce((s, p) => s + (p.amount || 0), 0)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  })()

  const urgentPayments = payments
    .filter(p => p.status !== 'pagado')
    .map(p => {
      const diff = Math.ceil((new Date(p.payment_date + 'T12:00:00').getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)
      return { ...p, daysLeft: diff }
    })
    .filter(p => p.daysLeft <= 5)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3)

  const pctCobrado = totalCobrado + totalPendiente > 0
    ? Math.round(totalCobrado / (totalCobrado + totalPendiente) * 100)
    : 0

  const firstName = userName.trim().split(' ')[0] || ''
  const initial   = firstName[0]?.toUpperCase() ?? ''
  const fmt       = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  const fmtDec    = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2 })

  return (
    <div className="max-w-lg mx-auto pb-28">

      {/* ── HEADER — flota sobre el fondo lavanda ── */}
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] text-indigo-400 font-medium">{greeting}</p>
            <h1 className="text-[28px] font-bold text-gray-900 leading-none mt-0.5">{firstName}</h1>
          </div>
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full gradient-jafra flex items-center justify-center shadow-lg shadow-jafra/30">
            <span className="text-white text-[16px] font-bold">{initial}</span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 fade-up">

        {/* ── HERO FINANCIERO ── */}
        {(totalCobrado > 0 || totalPendiente > 0) ? (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ciclo actual</p>
              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                {pctCobrado}% cobrado
              </span>
            </div>
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-[10px] text-gray-400 mb-0.5">Cobrado</p>
                <p className="text-[28px] font-bold text-gray-900 leading-none">${fmt(totalCobrado)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 mb-0.5">Pendiente</p>
                <p className="text-[18px] font-bold text-amber-500 leading-none">${fmt(totalPendiente)}</p>
              </div>
            </div>
            <div className="h-1.5 bg-indigo-50 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pctCobrado}%`, background: 'linear-gradient(90deg,#26de81,#20bf6b)' }} />
            </div>
          </div>
        ) : null}

        {/* ── STAT CHIPS — 2×2 horizontal ── */}
        <div className="grid grid-cols-2 gap-2.5">

          <Link href="/dashboard/cobrar"
            className="card p-3.5 flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#FF6B6B,#EE5A24)', boxShadow: '0 4px 12px rgba(238,90,36,0.40)' }}>
              <MoneyIcon />
            </div>
            <div className="min-w-0">
              <p className="text-[22px] font-bold text-gray-900 leading-none">{pendingPayments.length}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Por cobrar</p>
              {overduePayments.length > 0 && (
                <p className="text-[10px] text-red-500 font-bold mt-0.5">{overduePayments.length} vencido{overduePayments.length !== 1 ? 's' : ''}</p>
              )}
            </div>
          </Link>

          <Link href="/dashboard/personas"
            className="card p-3.5 flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#E91E8C,#FF6BB0)', boxShadow: '0 4px 12px rgba(233,30,140,0.40)' }}>
              <PeopleIcon />
            </div>
            <div>
              <p className="text-[22px] font-bold text-gray-900 leading-none">{persons.length}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Personas</p>
            </div>
          </Link>

          <Link href="/dashboard/recordatorios"
            className="card p-3.5 flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#a55eea,#7048e8)', boxShadow: '0 4px 12px rgba(112,72,232,0.40)' }}>
              <BellChipIcon />
            </div>
            <div>
              <p className="text-[22px] font-bold text-gray-900 leading-none">{reminderCount}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Alertas hoy</p>
            </div>
          </Link>

          <Link href="/dashboard/reuniones"
            className="card p-3.5 flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#45aaf2,#2d98da)', boxShadow: '0 4px 12px rgba(45,152,218,0.40)' }}>
              <MeetingIcon />
            </div>
            <div>
              <p className="text-[22px] font-bold text-gray-900 leading-none">{meetingCount}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Reuniones</p>
            </div>
          </Link>

        </div>

        {/* ── URGENTES ── */}
        {urgentPayments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {overduePayments.length > 0 && (
                  <div className="w-2 h-2 rounded-full bg-red-500 pulse-dot" />
                )}
                <p className={`text-[11px] font-bold uppercase tracking-widest ${overduePayments.length > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {overduePayments.length > 0
                    ? `${overduePayments.length} vencido${overduePayments.length !== 1 ? 's' : ''}`
                    : 'Urgentes'}
                </p>
              </div>
              <Link href="/dashboard/cobrar" className="text-[11px] text-indigo-500 font-semibold">
                Ver todos →
              </Link>
            </div>

            <div className="space-y-2.5">
              {urgentPayments.map(p => {
                const isOverdue = p.daysLeft < 0
                const isToday   = p.daysLeft === 0
                const badgeGrad = isOverdue
                  ? 'linear-gradient(135deg,#FF6B6B,#EE5A24)'
                  : 'linear-gradient(135deg,#fd9644,#e67e22)'
                const badgeLabel = isOverdue ? `+${Math.abs(p.daysLeft)}d` : isToday ? 'HOY' : `${p.daysLeft}d`
                const phone = persons.find(per => per.id === p.person_id)?.phone || ''
                const waMsg = `Hola ${p.person_name} 💕 Te recuerdo que tu pago vence ${isToday ? 'hoy' : `en ${p.daysLeft} días`}. ¿Cómo quedamos? 😊`

                return (
                  <div key={p.id} className="card px-4 py-3.5 flex items-center gap-3">
                    <div className="w-14 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: badgeGrad }}>
                      <span className="text-white text-[11px] font-bold tracking-wide">{badgeLabel}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900 truncate">{p.person_name}</p>
                      {p.amount > 0 && (
                        <p className="text-[11px] text-gray-400 mt-0.5">${fmtDec(p.amount)}</p>
                      )}
                    </div>
                    {phone && (
                      <a href={`https://wa.me/52${phone.replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[15px] flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#26de81,#20bf6b)' }}>
                        <span>💬</span>
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── ACCESOS RÁPIDOS ── */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link href="/dashboard/catalogo"
            className="card p-3.5 flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#E91E8C,#FF6BB0)', boxShadow: '0 4px 10px rgba(233,30,140,0.38)' }}>
              <CatalogIcon />
            </div>
            <span className="text-[12px] font-semibold text-gray-800">Catálogo</span>
          </Link>
          <Link href="/dashboard/contacto"
            className="card p-3.5 flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#45aaf2,#2d98da)', boxShadow: '0 4px 10px rgba(45,152,218,0.38)' }}>
              <PhoneIcon />
            </div>
            <span className="text-[12px] font-semibold text-gray-800">Contacto</span>
          </Link>
        </div>

        {/* ── PRÓXIMOS PAGOS (6–30 días) ── */}
        {(() => {
          const proximos = payments
            .filter(p => p.status !== 'pagado')
            .map(p => {
              const diff = Math.ceil((new Date(p.payment_date + 'T12:00:00').getTime() - new Date().setHours(0,0,0,0)) / 86400000)
              return { ...p, daysLeft: diff }
            })
            .filter(p => p.daysLeft > 5 && p.daysLeft <= 30)
            .sort((a, b) => a.daysLeft - b.daysLeft)
            .slice(0, 5)

          if (proximos.length === 0) return null
          return (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Próximos pagos</p>
                <Link href="/dashboard/cobrar" className="text-[11px] text-indigo-500 font-semibold">Ver todos →</Link>
              </div>
              <div className="card overflow-hidden">
                {proximos.map((p, i) => (
                  <div key={p.id}
                    className={`flex items-center gap-3 px-4 py-3 ${i < proximos.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    {/* Días restantes */}
                    <div className="w-10 text-center flex-shrink-0">
                      <p className="text-[15px] font-bold text-gray-900 leading-none">{p.daysLeft}</p>
                      <p className="text-[9px] text-gray-400 font-medium">días</p>
                    </div>
                    {/* Separador */}
                    <div className="w-px h-8 bg-gray-100 flex-shrink-0" />
                    {/* Nombre */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900 truncate">{p.person_name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(p.payment_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    {/* Monto */}
                    {p.amount > 0 && (
                      <p className="text-[13px] font-bold text-gray-700 flex-shrink-0">
                        ${p.amount.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* ── PAGADOS RECIENTEMENTE ── */}
        {(() => {
          const recientes = payments
            .filter(p => p.status === 'pagado')
            .sort((a, b) => b.payment_date.localeCompare(a.payment_date))
            .slice(0, 4)

          if (recientes.length === 0) return null
          return (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pagados recientemente</p>
                <Link href="/dashboard/pagos" className="text-[11px] text-indigo-500 font-semibold">Ver todos →</Link>
              </div>
              <div className="card overflow-hidden">
                {recientes.map((p, i) => (
                  <div key={p.id}
                    className={`flex items-center gap-3 px-4 py-3 ${i < recientes.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    {/* Check verde */}
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#26de81,#20bf6b)' }}>
                      <svg className="w-3.5 h-3.5 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    {/* Nombre */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900 truncate">{p.person_name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(p.payment_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    {/* Monto */}
                    {p.amount > 0 && (
                      <p className="text-[13px] font-bold text-emerald-600 flex-shrink-0">
                        +${p.amount.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* ── EMPTY STATE ── */}
        {persons.length === 0 && payments.length === 0 && (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full gradient-jafra flex items-center justify-center mx-auto mb-4 shadow-lg shadow-jafra/30">
              <span className="text-3xl">🌸</span>
            </div>
            <p className="text-gray-900 font-bold text-[16px]">¡Bienvenida!</p>
            <p className="text-gray-400 text-[12px] mt-1.5 mb-6 max-w-[200px] mx-auto leading-relaxed">
              Importa tu Excel o agrega personas para comenzar
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/dashboard/pagos"
                className="px-5 py-2.5 gradient-jafra text-white rounded-xl text-[12px] font-semibold shadow-md shadow-jafra/30">
                Importar Excel
              </Link>
              <Link href="/dashboard/personas"
                className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[12px] font-semibold">
                + Agregar
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ── SVG Icon set ─────────────────────────────────────────────
function MoneyIcon() {
  return (
    <svg className="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75" />
    </svg>
  )
}
function PeopleIcon() {
  return (
    <svg className="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  )
}
function BellChipIcon() {
  return (
    <svg className="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  )
}
function MeetingIcon() {
  return (
    <svg className="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  )
}
function CatalogIcon() {
  return (
    <svg className="w-4 h-4 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg className="w-4 h-4 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  )
}
