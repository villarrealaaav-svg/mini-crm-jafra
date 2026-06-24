// PIN de admin en sessionStorage (se teclea 1 vez por sesión).
// NO es el secreto real — el PIN se valida del lado servidor en la Edge Function.
const KEY = 'jafra_admin_pin'

export const getPin = (): string | null => {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(KEY)
}

export const setPin = (pin: string): void => {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(KEY, pin)
}

export const clearPin = (): void => {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(KEY)
}
