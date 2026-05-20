import type { Person, Payment, Reminder, Meeting } from '@/types'

const KEYS = {
  persons: 'jafra_persons',
  payments: 'jafra_payments',
  reminders: 'jafra_reminders',
  meetings: 'jafra_meetings',
  user: 'jafra_user',
}

function get<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function createAutoReminders(payment: Payment): void {
  if (!payment.billing_date || !payment.payment_date) return

  const all = get<Reminder>(KEYS.reminders)
  const manual = all.filter(r => !(r.person_id === payment.person_id && r.auto))

  const day20 = addDays(payment.billing_date, 20)
  const day5before = addDays(payment.payment_date, -5)
  const dayBefore = addDays(payment.payment_date, -1)

  const autoReminders: Reminder[] = [
    {
      id: crypto.randomUUID(),
      title: `Primer aviso: ${payment.person_name}`,
      reminder_type: 'cobro',
      reminder_date: day20,
      reminder_time: '09:00',
      notes: `Recordatorio de cobro — vence el ${payment.payment_date}`,
      person_id: payment.person_id,
      auto: true,
    },
    {
      id: crypto.randomUUID(),
      title: `5 días para cobrar: ${payment.person_name}`,
      reminder_type: 'cobro',
      reminder_date: day5before,
      reminder_time: '09:00',
      notes: `Pago vence el ${payment.payment_date} (faltan 5 días)`,
      person_id: payment.person_id,
      auto: true,
    },
    {
      id: crypto.randomUUID(),
      title: `¡Mañana cobra ${payment.person_name}!`,
      reminder_type: 'cobro',
      reminder_date: dayBefore,
      reminder_time: '09:00',
      notes: `Pago vence MAÑANA ${payment.payment_date}`,
      person_id: payment.person_id,
      auto: true,
    },
  ]

  // Dedup: si dos recordatorios caen el mismo día, solo guardar uno
  const uniqueByDate = autoReminders.filter(
    (r, i, arr) => arr.findIndex(x => x.reminder_date === r.reminder_date) === i
  )

  set(KEYS.reminders, [...manual, ...uniqueByDate])
}

export const userStore = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(KEYS.user)
  },
  set: (name: string) => localStorage.setItem(KEYS.user, name),
  clear: () => localStorage.removeItem(KEYS.user),
}

export const personsStore = {
  getAll: (): Person[] => get<Person>(KEYS.persons),
  add: (person: Omit<Person, 'id' | 'created_at'>): Person => {
    const all = get<Person>(KEYS.persons)
    const created: Person = { ...person, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    set(KEYS.persons, [...all, created])
    return created
  },
  update: (id: string, updates: Partial<Person>): void => {
    const all = get<Person>(KEYS.persons)
    set(KEYS.persons, all.map(p => p.id === id ? { ...p, ...updates } : p))
  },
  delete: (id: string): void => {
    set(KEYS.persons, get<Person>(KEYS.persons).filter(p => p.id !== id))
  },
}

export const paymentsStore = {
  getAll: (): Payment[] => get<Payment>(KEYS.payments),
  add: (payment: Omit<Payment, 'id'>): Payment => {
    const all = get<Payment>(KEYS.payments)
    const created: Payment = { ...payment, id: crypto.randomUUID() }
    set(KEYS.payments, [...all, created])
    createAutoReminders(created)
    return created
  },
  update: (id: string, updates: Partial<Payment>): void => {
    const all = get<Payment>(KEYS.payments)
    const updated = all.map(p => p.id === id ? { ...p, ...updates } : p)
    set(KEYS.payments, updated)
    const updatedPayment = updated.find(p => p.id === id)
    if (updatedPayment) createAutoReminders(updatedPayment)
  },
  delete: (id: string): void => {
    const payment = get<Payment>(KEYS.payments).find(p => p.id === id)
    set(KEYS.payments, get<Payment>(KEYS.payments).filter(p => p.id !== id))
    // Remove auto reminders for this person
    if (payment) {
      const reminders = get<Reminder>(KEYS.reminders)
      set(KEYS.reminders, reminders.filter(r => !(r.person_id === payment.person_id && r.auto)))
    }
  },
}

export const remindersStore = {
  getAll: (): Reminder[] => get<Reminder>(KEYS.reminders),
  add: (reminder: Omit<Reminder, 'id'>): Reminder => {
    const all = get<Reminder>(KEYS.reminders)
    const created: Reminder = { ...reminder, id: crypto.randomUUID() }
    set(KEYS.reminders, [...all, created])
    return created
  },
  update: (id: string, updates: Partial<Reminder>): void => {
    const all = get<Reminder>(KEYS.reminders)
    set(KEYS.reminders, all.map(r => r.id === id ? { ...r, ...updates } : r))
  },
  delete: (id: string): void => {
    set(KEYS.reminders, get<Reminder>(KEYS.reminders).filter(r => r.id !== id))
  },
}

export const meetingsStore = {
  getAll: (): Meeting[] => get<Meeting>(KEYS.meetings),
  add: (meeting: Omit<Meeting, 'id'>): Meeting => {
    const all = get<Meeting>(KEYS.meetings)
    const created: Meeting = { ...meeting, id: crypto.randomUUID() }
    set(KEYS.meetings, [...all, created])
    return created
  },
  update: (id: string, updates: Partial<Meeting>): void => {
    const all = get<Meeting>(KEYS.meetings)
    set(KEYS.meetings, all.map(m => m.id === id ? { ...m, ...updates } : m))
  },
  delete: (id: string): void => {
    set(KEYS.meetings, get<Meeting>(KEYS.meetings).filter(m => m.id !== id))
  },
}
