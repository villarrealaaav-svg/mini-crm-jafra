import type { PersonStatus, PaymentStatus } from '@/types'

const personColors: Record<PersonStatus, string> = {
  activa: 'bg-green-100 text-green-700',
  pendiente: 'bg-amber-100 text-amber-700',
  inactiva: 'bg-gray-100 text-gray-500',
}

const paymentColors: Record<PaymentStatus, string> = {
  pagado: 'bg-green-100 text-green-700',
  pendiente: 'bg-amber-100 text-amber-700',
  atrasado: 'bg-red-100 text-red-600',
}

const personLabels: Record<PersonStatus, string> = {
  activa: 'Activa',
  pendiente: 'Pendiente',
  inactiva: 'Inactiva',
}

const paymentLabels: Record<PaymentStatus, string> = {
  pagado: 'Pagado',
  pendiente: 'Pendiente',
  atrasado: 'Atrasado',
}

export function PersonBadge({ status }: { status: PersonStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${personColors[status]}`}>
      {personLabels[status]}
    </span>
  )
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${paymentColors[status]}`}>
      {paymentLabels[status]}
    </span>
  )
}
