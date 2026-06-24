// ============================================================
// Edge Function: admin-action
// Única pieza con SERVICE_ROLE. Valida el PIN del lado servidor y
// realiza TODAS las escrituras de contenido público (tablas + Storage).
// El navegador NUNCA toca la service key ni compara el PIN localmente.
//
// Deploy:
//   supabase functions deploy admin-action --no-verify-jwt
//   supabase secrets set ADMIN_PIN=xxxx SERVICE_ROLE_KEY=eyJ...
// (SUPABASE_URL la inyecta Supabase automáticamente.)
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const ADMIN_PIN = Deno.env.get('ADMIN_PIN') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY =
  Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const BUCKET = 'public-assets'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

// Comparación de tiempo constante (evita timing attacks sobre el PIN)
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

type FilePayload = { base64: string; contentType: string; ext: string }

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  let body: { pin?: string; action?: string; payload?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  const { pin, action, payload = {} } = body

  if (!ADMIN_PIN || !safeEqual(String(pin ?? ''), ADMIN_PIN)) {
    return json({ error: 'PIN incorrecto' }, 401)
  }

  if (action === 'ping') return json({ ok: true })

  const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  async function uploadFile(file: FilePayload): Promise<string> {
    const bytes = Uint8Array.from(atob(file.base64), (c) => c.charCodeAt(0))
    const ext = (file.ext || 'bin').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin'
    const path = `${crypto.randomUUID()}.${ext}`
    const { error } = await db.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: file.contentType || 'application/octet-stream', upsert: false })
    if (error) throw new Error('Storage: ' + error.message)
    return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  }

  try {
    switch (action) {
      case 'muro.save': {
        const { month, entries } = payload as { month: string; entries: unknown }
        const { error } = await db.from('muro_ranking').upsert({
          id: 1,
          month: month ?? '',
          entries: entries ?? [],
          updated_at: new Date().toISOString(),
        })
        if (error) throw error
        return json({ ok: true })
      }

      case 'producto.upsert': {
        const row = { ...(payload.row as Record<string, unknown>) }
        const file = payload.file as FilePayload | undefined
        if (file) row.image = await uploadFile(file)
        const { error } = await db.from('productos').upsert(row)
        if (error) throw error
        return json({ ok: true })
      }
      case 'producto.delete': {
        const { error } = await db.from('productos').delete().eq('id', payload.id)
        if (error) throw error
        return json({ ok: true })
      }

      case 'curso.upsert': {
        const row = { ...(payload.row as Record<string, unknown>) }
        const file = payload.file as FilePayload | undefined
        if (file) row.image = await uploadFile(file)
        const { error } = await db.from('cursos').upsert(row)
        if (error) throw error
        return json({ ok: true })
      }
      case 'curso.delete': {
        const { error } = await db.from('cursos').delete().eq('id', payload.id)
        if (error) throw error
        return json({ ok: true })
      }

      case 'catalogo.upsert': {
        const row = { ...(payload.row as Record<string, unknown>) }
        const file = payload.file as FilePayload | undefined
        if (file) row.content = await uploadFile(file)
        const { error } = await db.from('catalogo').upsert(row)
        if (error) throw error
        return json({ ok: true })
      }
      case 'catalogo.togglePublic': {
        const { error } = await db
          .from('catalogo')
          .update({ public: payload.public })
          .eq('id', payload.id)
        if (error) throw error
        return json({ ok: true })
      }
      case 'catalogo.delete': {
        const { error } = await db.from('catalogo').delete().eq('id', payload.id)
        if (error) throw error
        return json({ ok: true })
      }

      case 'contacto.setQr': {
        const slot = payload.slot as 'app' | 'whatsapp'
        const file = payload.file as FilePayload | undefined
        if (slot !== 'app' && slot !== 'whatsapp') throw new Error('slot inválido')
        if (!file) throw new Error('falta archivo')
        const url = await uploadFile(file)
        const { error } = await db
          .from('contacto_qr')
          .update({ [slot]: url, updated_at: new Date().toISOString() })
          .eq('id', 1)
        if (error) throw error
        return json({ ok: true, url })
      }
      case 'contacto.removeQr': {
        const slot = payload.slot as 'app' | 'whatsapp'
        if (slot !== 'app' && slot !== 'whatsapp') throw new Error('slot inválido')
        const { error } = await db
          .from('contacto_qr')
          .update({ [slot]: null, updated_at: new Date().toISOString() })
          .eq('id', 1)
        if (error) throw error
        return json({ ok: true })
      }

      default:
        return json({ error: 'Acción desconocida: ' + action }, 400)
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return json({ error: msg }, 400)
  }
})
