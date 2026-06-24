// ============================================================
// Edge Function: admin-action (multi-espacio / multi-tenant)
// Única pieza con SERVICE_ROLE. Valida el NIP del lado servidor.
//   - NIP MAESTRO (env ADMIN_PIN) → gestiona espacios (crear/listar/borrar).
//   - NIP de espacio (tabla admins) → edita SOLO el contenido de su espacio.
// El navegador nunca toca la service key ni compara NIPs.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const MASTER_PIN = Deno.env.get('ADMIN_PIN') ?? ''
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
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

const slugOk = (s: string) => /^[a-z0-9][a-z0-9-]{1,30}$/.test(s)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  let body: { pin?: string; action?: string; payload?: Record<string, unknown> }
  try { body = await req.json() } catch { return json({ error: 'JSON inválido' }, 400) }

  const pin = String(body.pin ?? '')
  const action = body.action ?? ''
  const payload = body.payload ?? {}
  if (!pin) return json({ error: 'Falta NIP' }, 401)

  const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const isMaster = MASTER_PIN.length > 0 && safeEqual(pin, MASTER_PIN)

  // ── Login: resuelve role + espacio ──
  if (action === 'auth.login') {
    if (isMaster) return json({ role: 'master', tenant: '', name: 'Dueña' })
    const { data } = await db.from('admins').select('tenant, name').eq('pin', pin).maybeSingle()
    if (!data) return json({ error: 'NIP incorrecto' }, 401)
    return json({ role: 'admin', tenant: data.tenant, name: data.name })
  }

  // ── Acciones MAESTRO (gestión de espacios) ──
  if (action.startsWith('space.')) {
    if (!isMaster) return json({ error: 'Solo la dueña (NIP maestro)' }, 401)
    try {
      switch (action) {
        case 'space.list': {
          const { data, error } = await db.from('admins').select('tenant, name, pin, created_at').order('created_at')
          if (error) throw error
          return json({ spaces: data ?? [] })
        }
        case 'space.create': {
          const tenant = String(payload.tenant ?? '').trim().toLowerCase()
          const spin = String(payload.pin ?? '').trim()
          const name = String(payload.name ?? '').trim()
          if (!slugOk(tenant)) throw new Error('Link inválido (usa minúsculas, números y guiones; 2-31 chars)')
          if (spin.length < 3) throw new Error('NIP muy corto (mín 3 dígitos)')
          if (!name) throw new Error('Falta nombre')
          if (MASTER_PIN && safeEqual(spin, MASTER_PIN)) throw new Error('Ese NIP es el maestro, usa otro')
          const dupPin = await db.from('admins').select('tenant').eq('pin', spin).maybeSingle()
          if (dupPin.data) throw new Error('Ese NIP ya lo usa otro espacio')
          const { error } = await db.from('admins').insert({ tenant, pin: spin, name })
          if (error) throw new Error(error.message.includes('duplicate') ? 'Ese link ya existe' : error.message)
          return json({ ok: true })
        }
        case 'space.delete': {
          const tenant = String(payload.tenant ?? '')
          // borra contenido del espacio + el admin
          await db.from('productos').delete().eq('tenant', tenant)
          await db.from('cursos').delete().eq('tenant', tenant)
          await db.from('catalogo').delete().eq('tenant', tenant)
          await db.from('muro_ranking').delete().eq('tenant', tenant)
          await db.from('contacto_qr').delete().eq('tenant', tenant)
          const { error } = await db.from('admins').delete().eq('tenant', tenant)
          if (error) throw error
          return json({ ok: true })
        }
        default:
          return json({ error: 'Acción desconocida' }, 400)
      }
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : String(e) }, 400)
    }
  }

  // ── Acciones de CONTENIDO: requieren NIP de espacio ──
  const { data: adm } = await db.from('admins').select('tenant').eq('pin', pin).maybeSingle()
  if (!adm) return json({ error: 'NIP incorrecto' }, 401)
  const tenant = adm.tenant as string

  try {
    switch (action) {
      case 'storage.signUpload': {
        const ext = String(payload.ext ?? 'bin').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin'
        const path = `${tenant}/${crypto.randomUUID()}.${ext}`
        const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path)
        if (error) throw new Error('Storage: ' + error.message)
        return json({ path: data.path, token: data.token })
      }

      case 'muro.save': {
        const { month, entries } = payload as { month: string; entries: unknown }
        const { error } = await db.from('muro_ranking').upsert({
          tenant, month: month ?? '', entries: entries ?? [], updated_at: new Date().toISOString(),
        })
        if (error) throw error
        return json({ ok: true })
      }

      case 'producto.upsert': {
        const row = { ...(payload.row as Record<string, unknown>), tenant }
        const { error } = await db.from('productos').upsert(row)
        if (error) throw error
        return json({ ok: true })
      }
      case 'producto.delete': {
        const { error } = await db.from('productos').delete().eq('id', payload.id).eq('tenant', tenant)
        if (error) throw error
        return json({ ok: true })
      }

      case 'curso.upsert': {
        const row = { ...(payload.row as Record<string, unknown>), tenant }
        const { error } = await db.from('cursos').upsert(row)
        if (error) throw error
        return json({ ok: true })
      }
      case 'curso.delete': {
        const { error } = await db.from('cursos').delete().eq('id', payload.id).eq('tenant', tenant)
        if (error) throw error
        return json({ ok: true })
      }

      case 'catalogo.upsert': {
        const row = { ...(payload.row as Record<string, unknown>), tenant }
        const { error } = await db.from('catalogo').upsert(row)
        if (error) throw error
        return json({ ok: true })
      }
      case 'catalogo.togglePublic': {
        const { error } = await db.from('catalogo').update({ public: payload.public }).eq('id', payload.id).eq('tenant', tenant)
        if (error) throw error
        return json({ ok: true })
      }
      case 'catalogo.delete': {
        const { error } = await db.from('catalogo').delete().eq('id', payload.id).eq('tenant', tenant)
        if (error) throw error
        return json({ ok: true })
      }

      case 'contacto.setQr': {
        const slot = payload.slot as 'app' | 'whatsapp'
        const url = payload.url as string
        if (slot !== 'app' && slot !== 'whatsapp') throw new Error('slot inválido')
        const { error } = await db.from('contacto_qr').upsert({
          tenant, [slot]: url, updated_at: new Date().toISOString(),
        })
        if (error) throw error
        return json({ ok: true })
      }
      case 'contacto.removeQr': {
        const slot = payload.slot as 'app' | 'whatsapp'
        if (slot !== 'app' && slot !== 'whatsapp') throw new Error('slot inválido')
        const { error } = await db.from('contacto_qr').upsert({
          tenant, [slot]: null, updated_at: new Date().toISOString(),
        })
        if (error) throw error
        return json({ ok: true })
      }

      default:
        return json({ error: 'Acción desconocida: ' + action }, 400)
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 400)
  }
})
