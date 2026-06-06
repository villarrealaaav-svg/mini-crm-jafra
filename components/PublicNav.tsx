'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/p',           label: 'Inicio',    icon: HomeIcon    },
  { href: '/p/catalogos', label: 'Catálogos', icon: BookIcon    },
  { href: '/p/muro',      label: 'Éxito',     icon: TrophyIcon  },
  { href: '/p/productos', label: 'Productos', icon: SparkleIcon },
  { href: '/p/cursos',    label: 'Cursos',    icon: CapIcon     },
  { href: '/p/contacto',  label: 'Contacto',  icon: PhoneIcon   },
]

export default function PublicNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white" style={{ boxShadow: '0 -4px 24px rgba(124, 63, 142, 0.10)' }}>
        <div className="flex max-w-lg mx-auto items-end px-1 overflow-x-auto scroll-hide">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex-1 min-w-[60px] flex flex-col items-center gap-1 py-3 text-[9px] font-semibold transition-colors relative ${active ? 'text-jafra' : 'text-gray-400'}`}>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-jafra" />
                )}
                <Icon active={active} />
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
function BookIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'stroke-jafra' : 'stroke-gray-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2.2 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  )
}
function TrophyIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'stroke-jafra' : 'stroke-gray-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2.2 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.006 0a4.5 4.5 0 0 0-5.006 0M14.5 14.25c1.65 0 3.5-.5 5-1.5C20 8 19.5 4.5 19.5 4.5h-15S4 8 4.5 12.75c1.5 1 3.35 1.5 5 1.5" />
    </svg>
  )
}
function SparkleIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'stroke-jafra' : 'stroke-gray-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2.2 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  )
}
function CapIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'stroke-jafra' : 'stroke-gray-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2.2 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  )
}
function PhoneIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? 'stroke-jafra' : 'stroke-gray-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2.2 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  )
}
