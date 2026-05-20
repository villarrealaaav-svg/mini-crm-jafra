'use client'

import { useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import { requestNotificationPermission, showTodayNotifications } from '@/lib/notifications'
import { remindersStore } from '@/lib/store'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    requestNotificationPermission()
    const reminders = remindersStore.getAll()
    showTodayNotifications(reminders)
  }, [])

  return (
    <div className="min-h-screen bg-[#EDF0FF] pb-20">
      {children}
      <BottomNav />
    </div>
  )
}
