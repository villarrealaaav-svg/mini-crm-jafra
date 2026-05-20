'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { userStore } from '@/lib/store'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const user = userStore.get()
    if (user) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-jafra-bg">
      <div className="w-8 h-8 border-4 border-jafra border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
