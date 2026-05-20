import type { Reminder } from '@/types'

const SHOWN_KEY = 'jafra_notif_shown'

export function requestNotificationPermission(): void {
  if (typeof window === 'undefined') return
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

export function showTodayNotifications(reminders: Reminder[]): void {
  if (typeof window === 'undefined') return
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const today = new Date().toISOString().split('T')[0]
  const dayKey = new Date().toDateString()

  let shown: string[] = []
  try {
    const raw = localStorage.getItem(SHOWN_KEY) || '[]'
    shown = JSON.parse(raw).filter((s: string) => s.startsWith(dayKey))
  } catch {
    shown = []
  }

  const typeLabel: Record<string, string> = {
    llamada: '📞 Llamada', cobro: '💰 Cobro', reunion: '🤝 Reunión', catalogo: '📖 Catálogo',
  }

  for (const r of reminders) {
    if (r.reminder_date !== today) continue
    const key = `${dayKey}:${r.id}`
    if (shown.includes(key)) continue

    try {
      new Notification('Mini CRM JAFRA — ' + (typeLabel[r.reminder_type] || 'Recordatorio'), {
        body: r.title + (r.notes ? `\n${r.notes}` : ''),
        icon: '/favicon.ico',
        tag: r.id,
      })
    } catch {
      // Notifications not supported in this context
    }

    shown.push(key)
  }

  localStorage.setItem(SHOWN_KEY, JSON.stringify(shown))
}
