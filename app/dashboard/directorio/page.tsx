'use client'

import { useEffect, useState } from 'react'
import { personsStore } from '@/lib/store'
import type { Person } from '@/types'

export default function DirectorioPage() {
  const [persons, setPersons] = useState<Person[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const all = personsStore.getAll()
    setPersons(all.sort((a, b) => a.name.localeCompare(b.name)))
  }, [])

  const filtered = persons.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  )

  const grouped = filtered.reduce<Record<string, Person[]>>((acc, p) => {
    const letter = p.name[0]?.toUpperCase() || '#'
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(p)
    return acc
  }, {})

  const letters = Object.keys(grouped).sort()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Directorio</h1>

      <input
        type="search"
        placeholder="Buscar..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl  bg-white text-sm text-gray-800 focus:outline-none focus:border-jafra mb-4"
      />

      {persons.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📒</p>
          <p className="text-gray-400 text-sm">Agrega personas para verlas aquí</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">Sin resultados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {letters.map(letter => (
            <div key={letter}>
              <div className="text-xs font-bold text-jafra uppercase tracking-wide mb-2 px-1">{letter}</div>
              <div className="card  divide-y divide-gray-50 overflow-hidden">
                {grouped[letter].map(p => (
                  <div key={p.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-jafra-light flex items-center justify-center flex-shrink-0">
                      <span className="text-jafra font-semibold text-sm">{p.name[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{p.name}</p>
                      {p.phone && <p className="text-xs text-gray-400 truncate">{p.phone}</p>}
                    </div>
                    <div className="flex gap-2">
                      {p.phone && (
                        <>
                          <a
                            href={`https://wa.me/52${p.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-base active:scale-95 transition-transform"
                          >
                            💬
                          </a>
                          <a
                            href={`tel:${p.phone}`}
                            className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-base active:scale-95 transition-transform"
                          >
                            📞
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
