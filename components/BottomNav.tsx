'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/dashboard',              label: 'Inicio',   icon: HomeIcon   },
  { href: '/dashboard/personas',     label: 'Personas', icon: UsersIcon  },
  { href: '/dashboard/cobrar',       label: 'Facturas', icon: null       }, // FAB central
  { href: '/dashboard/pagos',        label: 'Saldos',   icon: WalletIcon },
  { href: '/dashboard/recordatorios',label: 'Alertas',  icon: BellIcon   },
]

export default function BottomNav() {
  const pathname = usePathname()
  const cobrarActive = pathname === '/dashboard/cobrar'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Sombra superior suave */}
      <div className="bg-white" style={{ boxShadow: '0 -4px 24px rgba(99,102,241,0.10)' }}>
        <div className="flex max-w-lg mx-auto items-end px-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href

            if (label === 'Facturas') {
              return (
                <Link key={href} href={href} className="flex-1 flex flex-col items-center pb-2 -mt-5">
                  <div className={`w-13 h-13 w-[52px] h-[52px] rounded-full flex items-center justify-center bg-jafra transition-transform duration-200 ${cobrarActive ? 'scale-105' : 'active:scale-95'}`}
                    style={{ boxShadow: '0 4px 14px rgba(233,30,140,0.35)' }}>
                    <CobrarIcon />
                  </div>
                  <span className={`text-[10px] font-semibold mt-1.5 ${cobrarActive ? 'text-jafra' : 'text-gray-400'}`}>
                    Facturas
                  </span>
                </Link>
              )
            }

            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors relative ${active ? 'text-jafra' : 'text-gray-400'}`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-jafra" />
                )}
                {Icon && <Icon active={active} />}
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'stroke-jafra' : 'stroke-gray-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2.2 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </svg>
  )
}

function UsersIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'stroke-jafra' : 'stroke-gray-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2.2 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  )
}

function CobrarIcon() {
  return (
    <svg className="w-6 h-6 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function WalletIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'stroke-jafra' : 'stroke-gray-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2.2 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75" />
    </svg>
  )
}

function BellIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'stroke-jafra' : 'stroke-gray-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2.2 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  )
}
