'use client'

import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      {/* Backdrop — sin blur para compatibilidad Opera Mini */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 0 }}
        onClick={onClose}
      />
      {/* Card — z-index explícito encima del backdrop */}
      <div
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '480px', background: '#fff', borderRadius: '24px 24px 0 0', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)' }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '9999px', background: '#e5e7eb' }} />
        </div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '9999px', background: '#f3f4f6', border: 'none', fontSize: '18px', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            ×
          </button>
        </div>
        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
