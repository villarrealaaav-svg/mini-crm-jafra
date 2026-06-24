// Sesión de admin en sessionStorage (NIP + espacio resuelto en el servidor).
// El NIP NO es el secreto real — se valida del lado servidor (Edge Function).
export interface AdminSession {
  pin: string
  tenant: string         // slug del espacio (vacío si role master)
  name: string
  role: 'admin' | 'master'
}

const KEY = 'jafra_admin_session'

export const getSession = (): AdminSession | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export const setSession = (s: AdminSession): void => {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(KEY, JSON.stringify(s))
}

export const clearSession = (): void => {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(KEY)
}

// PIN de la sesión actual (para las llamadas de escritura)
export const getPin = (): string | null => getSession()?.pin ?? null
