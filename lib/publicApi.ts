// Capa única de datos PÚBLICOS (Supabase).
//   Lecturas  → SELECT anon directo.
//   Escrituras → Edge Function `admin-action` (valida PIN en el servidor).
import { supabase } from './supabase'
import { getPin } from './adminPin'
import type {
  MuroRanking, MuroEntry, PublicProducto, PublicCurso, CatalogoItem, ContactoQR, QrSlot,
} from '@/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
// Nombre del slug de la Edge Function (en Supabase quedó como 'dynamic-endpoint')
const FN_NAME = process.env.NEXT_PUBLIC_SUPABASE_FN || 'admin-action'
const FN_URL = `${SUPABASE_URL}/functions/v1/${FN_NAME}`

type FilePayload = { base64: string; contentType: string; ext: string }

// ─── Helpers ──────────────────────────────────────────────

export async function fileToPayload(file: File): Promise<FilePayload> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(new Error('No se pudo leer el archivo'))
    r.readAsDataURL(file)
  })
  const base64 = dataUrl.split(',')[1] || ''
  const ext = file.name.split('.').pop()?.toLowerCase() || file.type.split('/')[1] || 'bin'
  return { base64, contentType: file.type, ext }
}

async function callAdmin(action: string, payload: Record<string, unknown>): Promise<unknown> {
  const pin = getPin()
  if (!pin) throw new Error('Ingresa el PIN de administrador')
  const res = await fetch(FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ANON}`,
      apikey: ANON,
    },
    body: JSON.stringify({ pin, action, payload }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Error ${res.status}`)
  }
  return res.json()
}

// Valida el PIN contra el servidor (acción ping). Usado por AdminGate.
export async function validatePin(pin: string): Promise<boolean> {
  try {
    const res = await fetch(FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ANON}`,
        apikey: ANON,
      },
      body: JSON.stringify({ pin, action: 'ping' }),
    })
    return res.ok
  } catch {
    return false
  }
}

// ─── LECTURAS (anon) ──────────────────────────────────────

export async function getMuro(): Promise<MuroRanking | null> {
  const { data } = await supabase
    .from('muro_ranking')
    .select('month, entries, updated_at')
    .eq('id', 1)
    .maybeSingle()
  if (!data || !data.month) return null
  return {
    month: data.month,
    entries: (data.entries as MuroEntry[]) || [],
    updated_at: data.updated_at,
  }
}

export async function getProductos(): Promise<PublicProducto[]> {
  const { data } = await supabase.from('productos').select('*')
  return (data as PublicProducto[]) || []
}

export async function getCursos(): Promise<PublicCurso[]> {
  const { data } = await supabase.from('cursos').select('*')
  return (data as PublicCurso[]) || []
}

export async function getCatalogo(): Promise<CatalogoItem[]> {
  const { data } = await supabase.from('catalogo').select('*')
  return (data as CatalogoItem[]) || []
}

export async function getContactoQR(): Promise<ContactoQR> {
  const { data } = await supabase
    .from('contacto_qr')
    .select('app, whatsapp')
    .eq('id', 1)
    .maybeSingle()
  return (data as ContactoQR) || {}
}

// ─── ESCRITURAS (vía Edge Function + PIN) ─────────────────

export const saveMuro = (month: string, entries: MuroEntry[]) =>
  callAdmin('muro.save', { month, entries })

export async function upsertProducto(row: PublicProducto, file?: File) {
  const payload: Record<string, unknown> = { row }
  if (file) payload.file = await fileToPayload(file)
  return callAdmin('producto.upsert', payload)
}
export const deleteProducto = (id: string) => callAdmin('producto.delete', { id })

export async function upsertCurso(row: PublicCurso, file?: File) {
  const payload: Record<string, unknown> = { row }
  if (file) payload.file = await fileToPayload(file)
  return callAdmin('curso.upsert', payload)
}
export const deleteCurso = (id: string) => callAdmin('curso.delete', { id })

export async function upsertCatalogo(row: CatalogoItem, file?: File) {
  const payload: Record<string, unknown> = { row }
  if (file) payload.file = await fileToPayload(file)
  return callAdmin('catalogo.upsert', payload)
}
export const toggleCatalogoPublic = (id: string, isPublic: boolean) =>
  callAdmin('catalogo.togglePublic', { id, public: isPublic })
export const deleteCatalogo = (id: string) => callAdmin('catalogo.delete', { id })

export async function setContactoQR(slot: QrSlot, file: File) {
  const payload = { slot, file: await fileToPayload(file) }
  return callAdmin('contacto.setQr', payload)
}
export const removeContactoQR = (slot: QrSlot) => callAdmin('contacto.removeQr', { slot })
