// Capa única de datos PÚBLICOS multi-espacio (Supabase).
//   Lecturas  → SELECT anon directo, filtrado por `tenant` (slug del espacio).
//   Escrituras → Edge Function (valida NIP en el servidor y resuelve el espacio).
//   Archivos  → subida directa a Storage vía signed URL (sin tope chico).
import { supabase } from './supabase'
import { getPin, getSession, setSession, type AdminSession } from './adminPin'
import type {
  MuroRanking, MuroEntry, PublicProducto, PublicCurso, CatalogoItem, ContactoQR, QrSlot,
} from '@/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const FN_NAME = process.env.NEXT_PUBLIC_SUPABASE_FN || 'admin-action'
const FN_URL = `${SUPABASE_URL}/functions/v1/${FN_NAME}`
const BUCKET = 'public-assets'

// ─── Llamada base a la Edge Function ──────────────────────
async function callFn(pin: string, action: string, payload: Record<string, unknown> = {}) {
  const res = await fetch(FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ANON}`,
      apikey: ANON,
    },
    body: JSON.stringify({ pin, action, payload }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || `Error ${res.status}`)
  return data
}

// Usa el NIP de la sesión actual para escrituras de contenido.
function callAdmin(action: string, payload: Record<string, unknown> = {}) {
  const pin = getPin()
  if (!pin) throw new Error('Sesión expirada — vuelve a ingresar tu NIP')
  return callFn(pin, action, payload)
}

// ─── Auth / login ─────────────────────────────────────────
// Valida el NIP y devuelve la sesión (role + espacio). null si NIP inválido.
export async function login(pin: string): Promise<AdminSession | null> {
  try {
    const data = await callFn(pin, 'auth.login') as { role: 'admin' | 'master'; tenant: string; name: string }
    const session: AdminSession = { pin, tenant: data.tenant, name: data.name, role: data.role }
    setSession(session)
    return session
  } catch {
    return null
  }
}

// ─── Subida de archivo (signed URL directo a Storage) ─────
export async function uploadAsset(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || file.type.split('/')[1] || 'bin'
  const signed = await callAdmin('storage.signUpload', { ext, contentType: file.type }) as { path: string; token: string }
  const { error } = await supabase.storage.from(BUCKET).uploadToSignedUrl(signed.path, signed.token, file)
  if (error) throw new Error('Subida: ' + error.message)
  return supabase.storage.from(BUCKET).getPublicUrl(signed.path).data.publicUrl
}

// ─── LECTURAS (anon, por espacio) ─────────────────────────
export async function getMuro(tenant: string): Promise<MuroRanking | null> {
  const { data } = await supabase
    .from('muro_ranking')
    .select('month, entries, updated_at')
    .eq('tenant', tenant)
    .maybeSingle()
  if (!data || !data.month) return null
  return { month: data.month, entries: (data.entries as MuroEntry[]) || [], updated_at: data.updated_at }
}

export async function getProductos(tenant: string): Promise<PublicProducto[]> {
  const { data } = await supabase.from('productos').select('*').eq('tenant', tenant)
  return (data as PublicProducto[]) || []
}

export async function getCursos(tenant: string): Promise<PublicCurso[]> {
  const { data } = await supabase.from('cursos').select('*').eq('tenant', tenant)
  return (data as PublicCurso[]) || []
}

export async function getCatalogo(tenant: string): Promise<CatalogoItem[]> {
  const { data } = await supabase.from('catalogo').select('*').eq('tenant', tenant)
  return (data as CatalogoItem[]) || []
}

export async function getContactoQR(tenant: string): Promise<ContactoQR> {
  const { data } = await supabase
    .from('contacto_qr')
    .select('app, whatsapp')
    .eq('tenant', tenant)
    .maybeSingle()
  return (data as ContactoQR) || {}
}

// ─── ESCRITURAS de contenido (NIP de espacio; el servidor lo scopea) ──
export const saveMuro = (month: string, entries: MuroEntry[]) =>
  callAdmin('muro.save', { month, entries })

export async function upsertProducto(row: PublicProducto, file?: File) {
  if (file) row = { ...row, image: await uploadAsset(file) }
  return callAdmin('producto.upsert', { row })
}
export const deleteProducto = (id: string) => callAdmin('producto.delete', { id })

export async function upsertCurso(row: PublicCurso, file?: File) {
  if (file) row = { ...row, image: await uploadAsset(file) }
  return callAdmin('curso.upsert', { row })
}
export const deleteCurso = (id: string) => callAdmin('curso.delete', { id })

export async function upsertCatalogo(row: CatalogoItem, file?: File) {
  if (file) row = { ...row, content: await uploadAsset(file) }
  return callAdmin('catalogo.upsert', { row })
}
export const toggleCatalogoPublic = (id: string, isPublic: boolean) =>
  callAdmin('catalogo.togglePublic', { id, public: isPublic })
export const deleteCatalogo = (id: string) => callAdmin('catalogo.delete', { id })

export async function setContactoQR(slot: QrSlot, file: File) {
  const url = await uploadAsset(file)
  return callAdmin('contacto.setQr', { slot, url })
}
export const removeContactoQR = (slot: QrSlot) => callAdmin('contacto.removeQr', { slot })

// ─── Gestión de espacios (solo NIP MAESTRO) ───────────────
export interface Space { tenant: string; name: string; pin: string; created_at: string }

export async function listSpaces(): Promise<Space[]> {
  const data = await callAdmin('space.list') as { spaces: Space[] }
  return data.spaces || []
}
export const createSpace = (tenant: string, pin: string, name: string) =>
  callAdmin('space.create', { tenant, pin, name })
export const deleteSpace = (tenant: string) => callAdmin('space.delete', { tenant })

export { getSession }
