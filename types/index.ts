export type PersonStatus = 'activa' | 'pendiente' | 'inactiva'
export type PaymentStatus = 'pagado' | 'pendiente' | 'atrasado'
export type ReminderType = 'llamada' | 'cobro' | 'reunion' | 'catalogo'
export type MeetingModality = 'zoom' | 'presencial'

export interface Person {
  id: string
  name: string
  phone: string
  notes: string
  status: PersonStatus
  billing_date: string | null
  payment_date: string | null
  created_at: string
}

export interface Payment {
  id: string
  person_id: string
  person_name: string
  billing_date: string
  payment_date: string
  amount: number
  mod_fac: number
  status: PaymentStatus
  notes: string
}

export interface Reminder {
  id: string
  title: string
  reminder_type: ReminderType
  reminder_date: string
  reminder_time: string
  notes: string
  person_id?: string
  auto?: boolean
}

export interface Meeting {
  id: string
  title: string
  meeting_date: string
  modality: MeetingModality
  zoom_link: string
  notes: string
}
