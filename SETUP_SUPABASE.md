# Setup Supabase — MINI CRM JAFRA (contenido público)

Pasos para activar el contenido público compartible (`/p`). Todo por el **Dashboard de Supabase** (sin terminal).

---

## 1. Crear proyecto
1. Entra a https://supabase.com → inicia sesión → **New project**.
2. Nombre: `mini-crm-jafra`. Región: la más cercana (ej. *East US*). Pon una **Database Password** (guárdala).
3. Espera ~2 min a que termine de crear.

## 2. Crear tablas + bucket (SQL)
1. Menú izquierdo → **SQL Editor** → **New query**.
2. Abre el archivo `supabase/schema.sql` de este proyecto, copia TODO, pégalo.
3. Click **Run**. Debe decir *Success*. (Crea 5 tablas, RLS, y el bucket `public-assets`.)

## 3. Edge Function `admin-action` (la que valida el PIN)
1. Menú → **Edge Functions** → **Create a function** (o *Deploy a new function*).
2. Nombre exacto: `admin-action`.
3. Borra el código de ejemplo y pega TODO el contenido de
   `supabase/functions/admin-action/index.ts`.
4. Click **Deploy**.

## 4. Secretos de la función (PIN + service key)
1. Menú → **Project Settings** → **Edge Functions** → sección **Secrets**
   (o **Edge Functions → Manage secrets**).
2. Agrega DOS secrets:
   - `ADMIN_PIN` = el PIN que la líder va a teclear para editar (ej. `2580`). **Recuérdalo.**
   - `SERVICE_ROLE_KEY` = ve a **Project Settings → API** → copia el **service_role** (secret) y pégalo aquí.
   > ⚠️ El `service_role` es secreto total. NUNCA va en el código del navegador. Solo aquí.

## 5. Dame estos 2 datos (para conectar la web)
De **Project Settings → API**:
- **Project URL** (ej. `https://abcd1234.supabase.co`)
- **anon public** key (la `anon`, no la service)

Con eso yo seteo las variables en Vercel y hago el deploy:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Después del deploy — recapturar contenido (1 vez)
La data pública vieja vivía en el localStorage de tu cel. Ahora vive en Supabase.
Hay que **volver a capturar** una vez (es poco): entra a `mini-crm-jafra.vercel.app/dashboard/publicar`,
teclea el PIN, y vuelve a poner muro / productos / cursos / catálogos / QRs.
A partir de ahí el link `/p` funciona en cualquier dispositivo.

## Prueba final
1. Edita algo con el PIN en tu cel.
2. Abre `mini-crm-jafra.vercel.app/p` en una **ventana incógnita / otro cel** → debe verse el contenido.
3. PIN incorrecto → la edición falla. ✅
