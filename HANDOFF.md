# HANDOFF TÉCNICO — Mini CRM JAFRA

> Documento de traspaso completo para retomar el proyecto en una sesión nueva sin depender del historial. No resumir, todo el contexto útil aquí.

**Fecha:** 2026-06-07
**Repo:** `https://github.com/villarrealaaav-svg/mini-crm-jafra` (privado)
**Deploy producción:** `https://mini-crm-jafra.vercel.app`
**Cuenta Vercel:** villarrealaaav-svg (Hobby tier)
**Ruta local:** `D:\AI_WORKSPACE\EXPERIMENTOS\Sandbox\MINI CRM JAFRA\mini-crm`

---

## 1. OBJETIVO FINAL DEL PROYECTO

### Qué es

App web mobile-first instalable como PWA, **bilingüe en propósito**:

- **Privada (`/dashboard/*`)** — herramienta interna para una **líder de distribución JAFRA** (cosméticos). Maneja personas (consultoras de su línea), saldos pendientes, facturas a cobrar, cumpleaños, recordatorios automáticos de cobro, reuniones, catálogo de archivos y datos de contacto JAFRA.
- **Pública (`/p/*`)** — sitio compartible con su equipo/consultoras/clientes. Misma URL base pero rama distinta del árbol. Muestra: catálogos marcados como públicos, Muro del Éxito (ranking mensual estilo JAFRA), productos nuevos, cursos próximos y contacto. **NUNCA expone saldos, personas, ni datos privados.**

### Cómo debe verse

- **Estilo:** elegante, femenino, premium, JAFRA. No infantil.
- **Paleta JAFRA enriquecida (en `app/globals.css` bajo `@theme`):**
  - `--color-jafra: #E91E8C` (magenta brand)
  - `--color-jafra-dark: #B0185F` (burgundy)
  - `--color-jafra-light: #FCE4EC` (rosa pétalo)
  - `--color-jafra-bg: #F4E8F2` (declarada pero NO usada — bg actual es `#EDF0FF` lavanda)
  - `--color-jafra-muted: #F9A8D4` (rosa polvo)
  - `--color-jafra-purple: #7C3F8E` (violeta JAFRA brand, footer real del sitio JAFRA)
  - `--color-jafra-rose: #E64B97` (rosa coral medio)
  - `--color-jafra-cream: #FFF7F9`
  - `--color-jafra-gold: #C9A961` (champagne premium)
- **Fondo dashboard/login/p:** `#EDF0FF` (lavanda azulada, declarada en `bg-[#EDF0FF]` directo)
- **Cards:** clase `.card` con sombra rosada doble (`0 2px 8px rgba(124,63,142,0.08), 0 8px 24px rgba(233,30,140,0.06)`). Border-radius 18px.
- **Card hero:** `.card-hero` con gradient cream sutil + sombra magenta.
- **Gradientes JSX:** inline styles (no clases CSS en Tailwind v4 con `@apply` para gradientes). Patrón usado:
  ```tsx
  style={{ background: 'linear-gradient(135deg,#E91E8C,#FF6BB0)', boxShadow: '0 4px 12px rgba(233,30,140,0.40)' }}
  ```

### Experiencia que debe transmitir

- **Lider que abre app:** sensación de control + confianza. Hero card con ciclo cobrado vs pendiente, stat chips claros, lista de cobros urgentes con indicador rojo pulsante.
- **Consultora que abre el link público:** sensación de orgullo (Muro del Éxito impactante), inspiración (testimonios), urgencia (productos NUEVO badge), pertenencia (cursos próximos).

### Elementos CRÍTICOS — NO modificar

- **Diseño Muro del Éxito (`app/p/muro/page.tsx`):** está PIXEL-PERFECT al PDF oficial JAFRA enviado por la líder. Fondo púrpura royal radial, título serif "MURO DEL ÉXITO", pincelada dorada con mes, eslogan "LÍDERES QUE INSPIRAN, RESULTADOS QUE TRASCIENDEN", tabla con cintas púrpura/oro, corona 1°/2°/3°, diamante 4°+, footer "TU ESFUERZO HOY, TU LEGADO MAÑANA. ¡Gracias por ser parte del Éxito! ♥". **Solo es editable mes + nombre + puntaje. Todo lo demás es fijo.**
- **Brand JAFRA:** logo 💎 (emoji), color magenta `#E91E8C` como primario.
- **PWA install + manifest.json:** funcionando, no romper.
- **Middleware `no-cache`:** crítico para que cambios se vean al instante en Vercel (sin esto la CDN cachea por horas).

### Lo que NO debe parecer

- App genérica de "todo morado y rosa pero sin alma"
- Excel disfrazado
- Material design plano
- App de banco fría
- Algo "moderno minimalista sin personalidad"

---

## 2. COSAS QUE NO ME GUSTARON (errores históricos, no repetir)

- **Fondo blanco puro:** demasiado clínico, las cards se perdían. Se cambió a lavanda `#EDF0FF`.
- **Sombras grises/azuladas (indigo) genéricas:** rompían el feel JAFRA. Se reemplazaron por sombras con tinte púrpura (`rgba(124,63,142,...)`).
- **Texto "indigo-500" en links:** todavía existe rastro en algunos lugares (recordatorios, otras subpáginas). **Cambiarlo a `text-jafra-purple` donde aparezca.**
- **Modal con backdrop-blur + position fixed mal aplicado:** en Opera Mini y Chrome móvil rompía. Solución actual: Modal usa `style={{ position: 'fixed', zIndex: 9999 }}` inline, sin backdrop-blur, con footer separado.
- **Import Excel con modal de confirmación + lista de preview:** la lider no podía ver el botón confirmar en móvil. Se cambió a: **detección automática de duplicados** (intra-import + vs existentes), si hay duplicados abre modal comparativo, si no importa directo con `alert()`. **No volver al modal con lista de scroll.**
- **Tabla pagos con `max-w-36 truncate`:** cortaba nombres en móvil. Se cambió a `min-w-52` columna nombre + `whitespace-normal break-words` en celdas.
- **"Cobrar" y "Pagos" como labels:** se renombraron a "Facturas" y "Saldos" porque "pagos" sonaba a deuda a pagar y la lider COBRA. NO volver a "Cobrar"/"Pagos".
- **Pestaña "Directorio":** se eliminó completa. NO recrear.
- **JAFRAMIA en pestaña contacto:** ya no existe. URL correcta es "Mi Programa JAFRA" → `https://www.miprogramajafra.com`.
- **Stat chips con colores random (azul, naranja saturado, púrpura random):** se refinaron a paleta JAFRA coherente. Cobrar=rosa coral, Personas=magenta, Alertas=violeta brand, Reuniones=dorado champagne. NO usar azules/naranjas chillones.
- **Caché agresivo Vercel:** los primeros 4 deploys NO se actualizaban en móvil porque (a) commits hechos con autor "JAFRA CRM" (no era usuario Vercel) → Vercel bloqueaba builds, (b) CDN cacheaba HTML estático por 19+ horas. Solución: `middleware.ts` con `no-store` headers + commits con autor `villarrealaaav-svg`.
- **Decorativos azul indigo en login:** sustituidos por círculos púrpura + rosa polvo JAFRA.
- **Texto truncado en lista personas / cards:** revisar — usar `whitespace-normal break-words` donde haga falta.

---

## 3. COSAS QUE YA SE INTENTARON (prompts, decisiones, soluciones)

### Iteración de diseño (ya resuelto en el estado actual)

- Se aplicó skill `canvas-design` para generar visual de referencia (PNG/PDF en `~/Desktop/jafra_crm_design.png`). Filosofía: "Rosa Precisa".
- Paleta inicial era `--color-jafra-bg: #EDF0FF` lavanda azul. Se evaluó cambiar a más rosa (#F4E8F2) pero **se mantuvo lavanda** porque la líder dijo que le gustaba como estaba.
- Se intentó cambio masivo dashboard → "moderno minimalista". **Fallido**: perdía personalidad. Se revirtió a JAFRA personality.

### Tailwind v4 quirks descubiertos

- **NO existe `tailwind.config.js`** — sólo `@theme` en `globals.css`.
- Custom classes con gradientes (`.chip-coral { background: linear-gradient(...) }`) **NO se aplican correctamente** desde JSX (Tailwind v4 + Turbopack). **Solución:** usar inline styles `style={{ background: 'linear-gradient(...)' }}`. Las clases existen pero no rinden.
- `@apply` con custom vars no siempre funciona.

### Tema deploy/caché

- Probado: `vercel.json` con headers no-cache → ignorado por Vercel para páginas pre-rendered.
- Probado: `export const dynamic = 'force-dynamic'` en `app/layout.tsx` → no se propaga a páginas `'use client'`.
- Probado: `export const revalidate = 0` → mismo problema.
- **Solución final:** `middleware.ts` con `NextResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')` + `CDN-Cache-Control: no-store` + `Vercel-CDN-Cache-Control: no-store`. ESTO FUNCIONA. NO TOCAR.
- Vercel deprecó `middleware.ts` a favor de `proxy.ts` (warn en build). **Por ahora funciona**. Si rompe en futuro, renombrar a `proxy.ts` con mismo código.

### Tema git/Vercel autor

- Inicialmente git user.name fue "JAFRA CRM" → todos los commits BLOQUEABAN deploys en Vercel porque ese usuario no existe en Vercel.
- **Fix permanente:** `git config user.name "villarrealaaav-svg"` + `git config user.email "villarrealaaav-svg@users.noreply.github.com"` ya aplicado al repo local.
- Si la lider trabaja desde otra máquina, debe repetir esto.

### Modal: 3 redesigns

1. Original: `position: fixed inset-0` con backdrop-blur → roto en Opera Mini.
2. Segundo intento: `position: sticky` fallback → no resolvió.
3. Final: inline styles con `position: fixed, zIndex: 9999, alignItems: flex-end` + footer fijo + scroll content. Funciona en Chrome móvil/desktop, Safari iOS, Opera Mini High mode.

### Import Excel

- v1: modal con preview de TODOS los registros + botón confirmar abajo → ilegible móvil.
- v2: pantalla fullscreen reemplazando todo → demasiado invasivo.
- v3 (actual): **import directo + alert** si no hay duplicados. **Modal comparativo** sólo si detecta duplicados (mismo nombre vs existente, o mismo intra-import). Comparación lado a lado: nombre, monto nuevo vs existente, fecha. Checkboxes para elegir cuáles agregar. Footer fijo con botones "Seleccionar todos" / "Ninguno" / "Importar X total".

### Catálogo

- v1: sólo URL input → no servía para archivos locales.
- v2 (actual): file picker `<input type="file" accept="application/pdf|image/*">`, base64 a localStorage, viewer fullscreen embed PDF / img. Limite 4MB por archivo (localStorage tope ~5MB).

### Persona — campo cumpleaños

- Recién agregado. `Person.birthday: string | null` (formato YYYY-MM-DD). Form con input type=date al lado del teléfono. Card muestra 🎂 + fecha en formato "15 marzo" (sin año porque cumple cada año). Badge "¡pronto!" si está en próximos 7 días en color púrpura JAFRA.

### Estructura pública /p

- Decisión arquitectónica: routes `/p/*` totalmente separadas de `/dashboard/*`. No comparten layout, no comparten auth check. `/p` tiene su propio `PublicNav.tsx` con 6 items: Inicio · Catálogos · Éxito · Productos · Cursos · Contacto.
- Catálogo es bidireccional: misma data en `/dashboard/catalogo`, flag `public: boolean` en cada item, `/p/catalogos` filtra `items.filter(i => i.public)`. Lider tiene botón toggle 🌐/🔒 en cada item.
- Muro, Productos, Cursos: stores SEPARADOS (`jafra_public_muro_ranking`, `jafra_public_productos`, `jafra_public_cursos`). NO mezclar con stores privados.
- Contacto: misma data en ambas pestañas (sitios + QRs). Sólo cambia la barra de nav (privada vs pública).

### Compartir link público

- Admin `/dashboard/publicar` tiene botón "Copiar" y "Compartir" (usa `navigator.share` cuando disponible, fallback a clipboard).
- Link generado: `${window.location.origin}/p`
- **Limitación NO resuelta:** los datos en localStorage son por dispositivo. Si la lider comparte el link, el destinatario ve pantallas VACÍAS porque su navegador no tiene la data de ella. **Se requiere Supabase para que el link sea funcional realmente.** Se documentó en sesión anterior, plan para Sesión 2. Ver sección 6.

---

## 4. ESTADO ACTUAL DEL PROYECTO

### Árbol de archivos relevante

```
mini-crm/
├── .gitignore                    # ignora .claude/, .next/, etc
├── AGENTS.md                     # nota: Next.js 16 es distinto, ver node_modules/next/dist/docs/
├── BRIEF_GYM.md                  # documento para forkear template a gym
├── CLAUDE.md                     # @AGENTS.md
├── HANDOFF.md                    # ESTE archivo
├── README.md
├── eslint.config.mjs
├── middleware.ts                 # no-cache CDN — CRÍTICO
├── next.config.ts                # headers no-store
├── next-env.d.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── public/
│   ├── manifest.json             # PWA — name, theme_color #E91E8C, start_url /dashboard
│   ├── icon-192.png              # ícono PWA generado con Python Pillow
│   ├── icon-512.png
│   └── *.svg                     # íconos originales Next.js (vercel, next, file, globe, window)
├── app/
│   ├── layout.tsx                # root: Geist font, manifest, apple-touch-icon, theme-color, viewport
│   ├── globals.css               # @theme + .card + .card-hero + .card-jafra + .gradient-jafra* + .fade-up
│   ├── page.tsx                  # redirect a /login o /dashboard según userStore.get()
│   ├── login/
│   │   └── page.tsx              # ingresa nombre, guarda en userStore, push /dashboard
│   ├── dashboard/
│   │   ├── layout.tsx            # 'use client', envuelve con BottomNav, bg lavanda, request notification permission
│   │   ├── page.tsx              # home: header con saludo+avatar, hero card ciclo, stat chips 2x2, urgentes, accesos rápidos 3-col (Catálogo/Publicar/Contacto), próximos pagos, pagados recientemente
│   │   ├── personas/page.tsx     # CRUD personas, búsqueda, historial pagos por persona, campo birthday
│   │   ├── pagos/page.tsx        # tabla "Saldos" con import Excel, export, dedupe modal
│   │   ├── cobrar/page.tsx       # "Facturas pendientes" — lista de cobros con WhatsApp link
│   │   ├── recordatorios/page.tsx
│   │   ├── reuniones/page.tsx
│   │   ├── catalogo/page.tsx     # archivos con file picker + viewer + toggle público
│   │   ├── contacto/page.tsx     # info JAFRA + 2 QRs subibles (App + WhatsApp)
│   │   └── publicar/
│   │       ├── page.tsx          # landing admin: link compartible + cards a subseciones
│   │       ├── muro/page.tsx     # ranking editor: mes + lista + sort + preview
│   │       ├── productos/page.tsx
│   │       └── cursos/page.tsx
│   └── p/
│       ├── layout.tsx            # envuelve con PublicNav, bg lavanda, SIN auth check
│       ├── page.tsx              # landing pública con grid 5 secciones
│       ├── catalogos/page.tsx    # filtra jafra_catalogo por public:true
│       ├── muro/page.tsx         # ★ DISEÑO FIJO púrpura+oro JAFRA — NO TOCAR el diseño
│       ├── productos/page.tsx    # grid 2 cols con badge NUEVO
│       ├── cursos/page.tsx       # lista cursos futuros con modalidad
│       └── contacto/page.tsx     # info JAFRA pública (clon contacto privado SIN editar QRs)
├── components/
│   ├── BottomNav.tsx             # nav privado: Inicio · Personas · [FAB Facturas] · Saldos · Alertas
│   ├── PublicNav.tsx             # nav público: Inicio · Catálogos · Éxito · Productos · Cursos · Contacto
│   ├── Modal.tsx                 # inline styles, footer fijo opcional, lock body scroll
│   └── StatusBadge.tsx
├── lib/
│   ├── store.ts                  # localStorage CRUD para todas las entidades
│   ├── csv.ts                    # parser xlsx/csv → ImportRow[]
│   └── notifications.ts          # web push básico
└── types/
    └── index.ts                  # Person, Payment, Reminder, Meeting, MuroPost (legacy), MuroEntry, MuroRanking, PublicProducto, PublicCurso
```

### Rutas críticas

| Ruta | Acceso | Propósito |
|---|---|---|
| `/` | público | redirect a login o dashboard |
| `/login` | público | ingreso por nombre (sin contraseña real) |
| `/dashboard` | privado* | home lider |
| `/dashboard/*` | privado* | CRM completo |
| `/dashboard/publicar/*` | privado* | admin contenido público |
| `/p` | público | landing compartible |
| `/p/*` | público | secciones públicas |

*Privacidad "soft": no hay auth real, solo verifica que `userStore.get()` retorne nombre. Sin nombre, redirect a `/login`. localStorage = sesión efectiva.

### Componentes clave

- **`Modal.tsx`** — usado en TODOS los CRUD. Acepta prop `footer` opcional para botones fijos abajo. Bloquea scroll body. Click backdrop cierra. **No usar createPortal** — funciona sin él.
- **`BottomNav.tsx`** — 5 slots, slot central (Facturas) es FAB redondo elevado. Activo se marca con linea púrpura arriba.
- **`PublicNav.tsx`** — 6 slots, scroll horizontal si no caben. Iconos diferentes.

### Stores localStorage

Todos en `lib/store.ts`:

| Store | Key | Tipo |
|---|---|---|
| `userStore` | `jafra_user` | string |
| `personsStore` | `jafra_persons` | `Person[]` |
| `paymentsStore` | `jafra_payments` | `Payment[]` |
| `remindersStore` | `jafra_reminders` | `Reminder[]` |
| `meetingsStore` | `jafra_meetings` | `Meeting[]` |
| `muroStore` (legacy) | `jafra_public_muro` | `MuroPost[]` ← NO usar más |
| `muroRankingStore` | `jafra_public_muro_ranking` | `MuroRanking` (objeto único) |
| `productosStore` | `jafra_public_productos` | `PublicProducto[]` |
| `cursosStore` | `jafra_public_cursos` | `PublicCurso[]` |
| (sin store, raw) | `jafra_qr_images` | `{ app?, whatsapp? }` base64 |
| (sin store, raw) | `jafra_catalogo` | `CatalogoItem[]` con `public: boolean` |

### Variables globales

- Solo CSS vars en `globals.css` `:root` y `@theme`.
- No hay env vars todavía. Cuando se conecte Supabase: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` van en `.env.local` y en Vercel Environment Variables.

### Stack técnico

- **Next.js 16.2.6** con App Router + Turbopack
- **React 19.2.4**
- **TypeScript 5** strict
- **Tailwind v4** (sin tailwind.config.js)
- **xlsx 0.18.5** para parser Excel
- **@supabase/ssr 0.10.3** y **@supabase/supabase-js 2.106.1** ← **INSTALADOS pero NO usados**. Quedaron de un intento abandonado. Disponibles para conectar Supabase cuando se haga.

### Cómo correr el proyecto

```bash
cd "D:\AI_WORKSPACE\EXPERIMENTOS\Sandbox\MINI CRM JAFRA\mini-crm"
npm install          # primera vez
npm run dev          # localhost:3000 (puede pedir otro puerto si 3000 ocupado)
npm run build        # production build con Turbopack
npm run lint
```

Deploy producción: auto desde push a `main` del repo GitHub conectado a Vercel.

### Qué SÍ funciona (verificado en producción móvil)

- ✅ Login con nombre
- ✅ Dashboard con stats reales
- ✅ Import Excel (xlsx) con dedupe inteligente
- ✅ Export Excel
- ✅ Modal con footer fijo (Opera Mini, Chrome móvil, Safari iOS)
- ✅ PWA install desde Chrome Android y Safari iOS
- ✅ WhatsApp link directo desde cada persona/pago
- ✅ Recordatorios automáticos a +20d, -5d, -1d del pago
- ✅ Toggle público en catálogo
- ✅ Páginas /p/* renderizando con su nav propio
- ✅ Muro del Éxito con diseño JAFRA fijo
- ✅ Compartir link `/p` con copy + share API
- ✅ Cache invalidation via middleware (cambios se ven al instante en móvil tras refresh)
- ✅ Hot deploy con git push

### Qué está roto / pendiente

- ⚠️ **Linkclient/cliente:** datos en localStorage solo del lider. Si comparte `/p`, destinatarios ven vacío. **Crítico para resolver con Supabase.**
- ⚠️ **Notificaciones push reales:** sólo notifications API básico cuando app está abierta. Para notificar día 20/−5/−1 con app cerrada se necesita Web Push + service worker + VAPID + backend scheduler. NO implementado.
- ⚠️ **`middleware.ts` deprecado:** Next.js 16 prefiere `proxy.ts`. Build emite warn pero funciona. Renombrar cuando rompa.
- ⚠️ **Tildes en URLs públicas:** `/p/cursos` con modalidad 'híbrido' usa tilde en clave, puede dar problemas si se serializa mal. Verificar.
- ⚠️ **`BRIEF_GYM.md`** existe en repo, no afecta producción, sólo para template.
- ⚠️ **Algunos `text-indigo-*`** residuales en subpáginas que no se han migrado a `text-jafra-purple`. Auditar: recordatorios, reuniones.
- ⚠️ **Empty states con emoji** ej "👥", "💰" — funcionan pero podrían refinarse a ilustración premium.
- ⚠️ **next.config.ts headers** — redundante con middleware pero no estorba.

---

## 5. REFERENCIAS VISUALES

### Referencia PRINCIPAL

- **Sitio JAFRA oficial:** `https://www.jafra.com.mx` — usar como source of truth para paleta, tipografía y feel premium femenino.
- **Página JAFRA "Encuentra una consultora":** footer púrpura `#7C3F8E`, fondo lavanda, productos con fotografía aspiracional.
- **PDF Muro del Éxito (compartido por lider en sesión):** establece el formato fijo del ranking. Coronas oro/plata/bronce 1-2-3, diamante violeta 4+, fondo púrpura royal radial, eslogan en mayúsculas con tracking amplio dorado, estrella decorativa en título, pincelada gold con mes centrado, footer con símbolo infinito ∞.

### Qué elementos deben copiarse

- Color púrpura `#7C3F8E` (del footer JAFRA) como ACENTO de marca (greetings, links, dorados sutiles)
- Magenta `#E91E8C` como PRIMARIO (CTAs, FAB, hero gradient)
- Sombras con tinte rosado/violeta (NUNCA gris/azul)
- Tipografía limpia Geist/Helvetica para UI + **Georgia serif** para títulos premium (usado en muro)
- Espaciado generoso en cards
- Border-radius grande (rounded-2xl, rounded-3xl en hero)
- Dorado champagne `#C9A961` como acento premium puntual (Reuniones chip, Contacto chip, MURO completo)

### Qué NO debe copiarse

- El layout de tienda e-commerce (carrito, filtros, paginación). Esta app NO vende, sólo organiza datos personales.
- El logo JAFRA infinity como ÚNICO branding — se usa 💎 emoji + texto "JAFRA" tipográfico.

### Qué debe reinterpretarse

- El "look catalogo de productos" como una versión simplificada: grid 2 cols con foto + nombre + precio + badge NUEVO.
- La sensación "femenina premium" en cards de pago: NO infantil, sí elegante con sombras sutiles.

### Detalles estéticos clave

- **Bordes:** rounded-2xl (16px) en cards estándar, rounded-3xl (24px) en hero/login card, rounded-full en chips y avatares.
- **Sombras:** doble layer rosadas. NUNCA grises planas.
- **Textura:** lavanda solid + sparkles SVG en muro (no más).
- **Marcos:** ninguno excepto borders sutiles `border-gray-100/200`.
- **Distribución:** mobile-first, max-w-lg centrado. Padding consistente px-4 a px-5.
- **Numeración:** estilo elegante en muro (cuadrados oro/violeta con número grande Georgia serif). En tabla pagos, numeración pequeña gray sutil.
- **Colores stats:** cada categoría tiene su gradiente CONSISTENTE en todo el app:
  - Cobrar/Facturas: rosa coral `#FF8FA8 → #E64B97`
  - Personas: magenta `#E91E8C → #FF6BB0`
  - Alertas: violeta `#A864C0 → #7C3F8E`
  - Reuniones: dorado `#E5C277 → #C9A961`
  - Contacto: dorado (mismo que Reuniones, distinto contexto)
  - Catálogo: magenta principal
  - Publicar: violeta brand
- **Estilo ilustración:** mínimo. Sin ilustraciones decorativas grandes. Sólo iconos SVG en chips.
- **Saturación:** alta en magenta/púrpura pero CONTRABALANCEADA por lavanda y blancos suaves.
- **Contraste:** texto principal `text-gray-900`, secundario `text-gray-500/600`, hint `text-gray-400`. Vencidos en `text-red-500`.

---

## 6. PLAN DE ACCIÓN RECOMENDADO

### Prioridad URGENTE (próxima sesión)

1. **Conectar Supabase** para que el link público `/p` funcione realmente cuando se comparte:
   - Crear proyecto en supabase.com (free tier)
   - Tablas mínimas: `muro_ranking` (id, month, entries jsonb, updated_at), `productos`, `cursos`, `catalogo_publico`
   - RLS abierta para SELECT en filas marcadas public, INSERT/UPDATE/DELETE sólo con auth (lider)
   - Migrar stores: `muroRankingStore`, `productosStore`, `cursosStore`, y `jafra_catalogo` filtrado por public
   - Privado (personas, pagos, reminders, meetings) **mantener en localStorage** por ahora — son datos sensibles del lider, NO sincronizar.
   - Env vars Vercel: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Service role key sólo si se hace auth real con magic link (post-Supabase).

2. **Verificar /p en navegador incognito** después de Supabase. Debe mostrar contenido sin necesidad de que el usuario tenga la localStorage del lider.

### Prioridad MEDIA

3. **Push notifications reales** (día 20 / -5 / -1):
   - Generar VAPID keys (`web-push generate-vapid-keys`)
   - Service worker `public/sw.js` con event listener push
   - Lider suscribe → guarda subscription en Supabase
   - Edge Function Supabase con cron diario que checa pagos y manda push a subscriptions correspondientes

4. **Migrar middleware.ts → proxy.ts** cuando Vercel deprecate definitivamente

5. **Refinamiento UI pendiente:**
   - Auditar y reemplazar `text-indigo-*` residuales por `text-jafra-purple`
   - Empty states con mejor ilustración (SVG no emoji)
   - Status badges (PAGADO/PENDIENTE/ATRASADO) más femeninos
   - Hero del dashboard con gradient sutil

### Prioridad BAJA

6. **Histórico de Muros pasados** — actualmente sólo guarda el ranking activo. Si la lider quiere ver mayo + junio + julio históricos, refactor a array de rankings.
7. **Tema dark elegante** — actualmente respeta sistema, pero si el usuario está en dark mode el contraste es accidental. Ya se tomó decisión de mantener auto.
8. **Slide-over para detalles** en lugar de modales en algunos casos (UX más fluida).

### Qué archivos NO conviene tocar

- `app/p/muro/page.tsx` — diseño fijo de la líder. Solo el dato (mes, entries) se edita.
- `components/Modal.tsx` — frágil, costó 3 iteraciones. Solo tocar si hay bug específico móvil.
- `middleware.ts` — funciona, no romper.
- `lib/csv.ts` — parser Excel testeado con archivos reales JAFRA, ojo con cambios.

### Qué reconstruir desde cero — NADA. Estado actual es bueno

### Pipeline de trabajo sugerido

1. Lee `AGENTS.md` (Next.js 16 quirks). Consulta `node_modules/next/dist/docs/` antes de escribir código.
2. Reproduce el flujo del usuario en local antes de pushear:
   ```bash
   npm run build  # verifica compile
   npm run dev    # prueba en localhost
   ```
3. Commits con autor `villarrealaaav-svg` (ya configurado).
4. `git push origin main` → Vercel auto-deploy ~1 min.
5. Verifica en `mini-crm-jafra.vercel.app` desde el celular (no solo PC).

---

## 7. REGLAS ESTRICTAS

### Diseño / UX

- **NO usar colores azul indigo, naranja chillón, ni morados random.** Solo paleta JAFRA enriquecida.
- **NO crear modales sin footer fijo** para acciones críticas en móvil.
- **NO truncar nombres con `truncate` + `max-w-X`** en celdas de tabla en móvil. Usar `whitespace-normal break-words`.
- **NO usar `text-indigo-*` ni `bg-indigo-*`** en nuevos componentes. Si encuentras restos, sustituye por `text-jafra-purple` / `bg-jafra-light`.
- **NO romper el diseño del Muro del Éxito.** Solo el contenido (mes + entries) es editable.
- **NO mostrar datos privados en `/p/*`.** Saldos, personas, recordatorios son SECRETOS.
- **NO eliminar el toggle público en catálogo.** Es el único modo de filtrar.
- **NO renombrar "Saldos"→"Pagos" ni "Facturas"→"Cobrar".** La lider los pidió así.
- **NO restaurar la pestaña "Directorio".** Está eliminada por decisión del usuario.
- **NO meter back-button azul-iOS** ni patrones de design system Material. Es JAFRA femenino premium.

### Técnicas

- **NO usar `tailwind.config.js`** — Tailwind v4 usa `@theme` en `globals.css`.
- **NO usar custom CSS gradient classes en JSX** — siempre inline `style={{ background: 'linear-gradient(...)' }}`.
- **NO removerl `middleware.ts`** sin reemplazarlo con `proxy.ts` con los mismos headers.
- **NO commitear con autor distinto a `villarrealaaav-svg`.** Vercel los bloquea.
- **NO subir archivos > 4MB** a localStorage. Tiene tope ~5MB total.
- **NO mezclar stores privados con públicos.** Personas en localStorage. Productos/cursos/muro/catálogos públicos: van a Supabase cuando se conecte.
- **NO usar `export const dynamic` en archivos `'use client'`** — no funciona.
- **NO commitear `.claude/`, `.next/`, `.env.local`** — ya en .gitignore.
- **NO instalar paquetes UI heavy (MUI, antd, shadcn).** Mantener todo custom con Tailwind v4.
- **NO usar Image de next/image todavía** — todos los `<img>` son data URLs o externos, optimización rota con base64.

### Storage

- localStorage SOLO para data del lider que NO necesita compartirse.
- Supabase (cuando se haga) SOLO para contenido público + auth real.
- NUNCA poner datos sensibles (saldos, teléfonos de clientes) en Supabase sin RLS estricta.

---

## 8. CONTEXTO EXTRA

### Intención real del usuario

La líder de distribución JAFRA quiere:
1. **Para ella:** una herramienta de CRM + cobranza que reemplace su Excel manual con recordatorios automáticos para no olvidar cobros.
2. **Para su equipo:** una vitrina compartible donde mostrar logros (muro), productos nuevos, agenda de cursos, todo con presencia digital profesional.
3. **Estética:** debe lucir **premium y femenino**, no genérico. JAFRA es marca aspiracional, la app debe transmitir eso.
4. **PWA instalable:** quiere que se vea como app nativa en su celular y el de su equipo.
5. **Notificaciones reales:** crítico para que no se le olviden cobros a 20/-5/-1 días del pago.

### Nivel de exigencia visual

ALTO. Iteró 4 veces el diseño hasta dar OK al actual. Pidió específicamente:
- "Que se vea como app premium tipo Revolut o Linear pero femenino"
- "Que las cajas no se pierdan en el fondo"
- "Que no brille tanto" (rechazó gradientes saturados iniciales)
- "Que tenga personalidad, no genérico"
- "JAFRA es rosa, púrpura y dorado, así debe verse"

### Qué significa "que se vea bien" en este proyecto

- Cards con sombra rosada sutil flotando sobre lavanda
- Texto grande legible NO gris-sobre-gris
- Iconos SVG color en chips redondeados
- Numeros grandes en stats
- Empty states amables con mensaje útil
- Animación fadeUp en transiciones de página
- Hover sutil en cards (NO grande)
- Touch feedback active:scale-95 en cualquier botón
- Texto en español MX (siempre `toLocaleDateString('es-MX', ...)`)
- WhatsApp con código país +52

### Errores que suelen repetirse (a evitar)

- Asumir que CSS custom classes funcionan en Tailwind v4 con gradientes (NO).
- Cambiar el orden visual del Muro del Éxito (la lider quiere PIXEL-PERFECT al PDF).
- Dejar texto cortado en móvil (lo notó inmediatamente).
- Romper el botón de import Excel (lo usa intensivamente, NO afectar).
- Volver a `bg-indigo-*` o `text-indigo-*` por costumbre.

### Validaciones antes de seguir

- ¿El cambio respeta paleta JAFRA?
- ¿Se ve bien en mobile width 390-414px?
- ¿El modal/CTA es alcanzable sin scroll en móvil?
- ¿Los nombres completos NO se truncan en cards y tablas?
- ¿El build pasa sin errores TypeScript?
- ¿El autor de commit es `villarrealaaav-svg`?
- ¿La lider ya aprobó el cambio antes de pushear (si es de UX visible)?

### Datos sensibles que NO loguear ni exponer

- Nombres y teléfonos de personas (consultoras)
- Montos cobrados y pendientes
- Fechas de facturación/pago

### Cuentas y servicios involucrados

| Servicio | Cuenta | Propósito |
|---|---|---|
| GitHub | villarrealaaav-svg | repo privado |
| Vercel | villarrealaaav-svg (Hobby) | deploy auto |
| Supabase | pendiente crear | DB pública (futuro) |
| Email lider | (confidencial, no en repo) | login email si se hace |

### Comandos git útiles

```bash
# verificar autor
git config user.name
# ver últimos cambios
git log --oneline -20
# crear commit típico
git add -A && git commit -m "feat: descripción" && git push origin main
# verificar build local antes de pushear
npm run build
# limpiar .next si cache stale
rm -rf .next
```

### Cómo se ve el repo desde fuera

- Es PRIVADO (verificado).
- Sólo el dueño villarrealaaav-svg tiene acceso.
- Brevemente fue público para compartir template — ya regresado a privado.
- `BRIEF_GYM.md` quedó en repo pero no afecta nada (referencia para un contacto que adaptaría a gym).

### Si algo se ve raro en producción y NO en localhost

1. Verifica que el commit llegó a GitHub (`git log origin/main..HEAD` debe estar vacío).
2. Verifica deploy en Vercel: vercel.com → mini-crm-jafra → Deployments → último Ready y NO Failed.
3. Verifica autor del commit (`git log --pretty=format:"%an" -1` debe decir villarrealaaav-svg).
4. Fuerza hard reload en móvil (cierra Chrome de apps recientes, vuelve a abrir).
5. Si persiste, revisa `middleware.ts` que tenga no-store headers.

### Recordatorios automáticos — cómo funciona

`lib/store.ts` función `createAutoReminders(payment)` ejecuta al añadir un `Payment`. Crea 3 reminders:
- +20 días desde `billing_date` (cobrar a los 20 días post-factura)
- -5 días desde `payment_date` (recordar 5 días antes)
- -1 día desde `payment_date` (víspera)

Los reminders aparecen en `/dashboard/recordatorios` con badge `auto`. NO se pueden editar (sólo eliminar). Se borran automáticamente si el pago cambia a `status: pagado` o si se elimina el `Payment`.

### Personajes técnicos / personas mencionadas

- **Lider JAFRA:** Alejandro (nombre observado en captura del dashboard "Buenas tardes Alejandro"). Sin embargo el dueño del repo es `villarrealaaav` (el usuario actual). La lider real puede tener otro nombre — Alejandro es probablemente el test data del usuario.
- **Contacto del gym:** persona externa a quien se le mandó template repo. Sin relación con el repo principal ahora.

### Última iteración (sesión actual)

- Muro del Éxito completo rediseño púrpura+oro fijo con coronas/diamantes
- BRIEF_GYM.md creado para template share
- Repo temporalmente público → regresado a privado
- TODOS los cambios desplegados en producción

### Prompt sugerido para arrancar nueva sesión

> Tengo un proyecto en `D:\AI_WORKSPACE\EXPERIMENTOS\Sandbox\MINI CRM JAFRA\mini-crm`. Lee primero `HANDOFF.md` completo, después `AGENTS.md`. Es un CRM JAFRA mobile-first deployado en Vercel, Next.js 16, Tailwind v4, sin backend. Quiero avanzar con [tarea específica]. Pregúntame si algo no está claro antes de tocar código. NO toques el diseño del Muro del Éxito (`app/p/muro/page.tsx`), está fijo por requerimiento de la líder. Usa modo caveman para responder.

---

**FIN DEL HANDOFF**
