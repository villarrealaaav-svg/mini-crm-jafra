# Brief técnico — adaptación para Gym

Documento para arrancar sesión con Claude usando este repo como template.

---

## Stack actual

- **Next.js 16.2.6** con App Router + Turbopack
- **TypeScript** estricto
- **Tailwind v4** (`@theme` block en `app/globals.css` — NO `tailwind.config.js`)
- **localStorage** como base de datos (sin backend)
- **xlsx** para import Excel
- **PWA** instalable (manifest.json + íconos)
- Deploy: **Vercel** (auto desde GitHub)
- Auth: nombre simple en localStorage (sin login real)

## Estructura

```
app/
├── layout.tsx            # root (metadata + PWA tags)
├── globals.css           # paleta JAFRA + .card + gradientes
├── login/                # ingreso por nombre
├── dashboard/            # PRIVADO (lider)
│   ├── layout.tsx        # BottomNav + bg lavanda
│   ├── page.tsx          # home con stats + accesos rápidos
│   ├── personas/         # CRUD personas + historial
│   ├── pagos/            # tabla saldos + import Excel
│   ├── cobrar/           # facturas pendientes
│   ├── recordatorios/    # auto + manual
│   ├── reuniones/        # zoom/presencial
│   ├── catalogo/         # archivos (PDF/img/link)
│   ├── contacto/         # info marca + QRs
│   └── publicar/         # admin contenido público
│       ├── muro/         # ranking
│       ├── productos/
│       └── cursos/
├── p/                    # PÚBLICO (compartible)
│   ├── layout.tsx        # PublicNav propio
│   ├── page.tsx          # landing
│   ├── catalogos/
│   ├── muro/             # ranking visual fijo
│   ├── productos/
│   ├── cursos/
│   └── contacto/
components/
├── BottomNav.tsx
├── PublicNav.tsx
├── Modal.tsx
└── StatusBadge.tsx
lib/
├── store.ts              # todos los stores localStorage
├── csv.ts                # parser xlsx
└── notifications.ts      # web push (básico)
types/index.ts            # interfaces compartidas
```

## Cambios MÍNIMOS para gym

### 1. Marca (paleta + nombres)

`app/globals.css` → cambiar `@theme`:
```css
--color-jafra:        #COLOR_GYM_PRIMARIO
--color-jafra-dark:   #COLOR_GYM_OSCURO
--color-jafra-light:  #COLOR_GYM_CLARO
--color-jafra-purple: #COLOR_GYM_ACENTO
```
(También renombrar `jafra` → marca del gym en todos los `bg-jafra`, `text-jafra-*`, `gradient-jafra` con sed)

`app/layout.tsx` → cambiar `<title>`, manifest theme_color
`public/manifest.json` → name, short_name, theme_color, background_color
`public/icon-192.png` y `icon-512.png` → íconos gym

### 2. Dominio del modelo

Reescribir entidades en `types/index.ts`:
- `Person` → `Miembro` (nombre, teléfono, membresía, fecha_alta, fecha_vencimiento, plan)
- `Payment` → `Pago` (miembro, monto, mes_cubre, fecha_pago, método, status)
- `Reminder` → mantener (recordar vencimientos)
- `Meeting` → `Clase` (entrenador, hora, capacidad, día_semana)
- `Person.billing_date/payment_date` → `Miembro.fecha_inicio_mes/fecha_vencimiento`

### 3. Funcionalidad nueva del gym

Pensar:
- Check-in (registrar entrada del día)
- Asistencias mensuales por miembro
- Rutinas asignadas
- Pesas/medidas progreso

Eliminar:
- Saldos/facturas estilo JAFRA (no aplica)
- Catálogo (a menos que sea de productos suplementos)
- Mod_fac (campo JAFRA específico)

### 4. Páginas a renombrar/reescribir

| Original CRM JAFRA | Gym sugerido |
|---|---|
| Personas | Miembros |
| Saldos (Pagos) | Mensualidades |
| Facturas pendientes (Cobrar) | Vencimientos próximos |
| Alertas (Recordatorios) | Mismo |
| Reuniones | Clases |
| Catálogo | Planes / Suplementos |
| Contacto | Datos gym |
| Muro del Éxito | Top miembros del mes (transformaciones, asistencia, etc) |

### 5. Quitar todo lo JAFRA-específico

- Pestaña "Contacto" tiene URLs JAFRA hardcoded → reemplazar
- WhatsApp/CAT/correo JAFRA → del gym
- QRs: app JAFRA + WhatsApp → instagram del gym + reservas
- "Mi Programa JAFRA" link → quitar
- Muro: eslogan "Líderes que inspiran" → eslogan del gym

## Reglas críticas

### Tailwind v4 (IMPORTANTE)
- NO existe `tailwind.config.js` en este proyecto
- Custom CSS classes con gradientes en `globals.css` NO siempre funcionan con `@apply` — usar **inline styles** para gradientes en JSX:
```tsx
style={{ background: 'linear-gradient(135deg,#color1,#color2)' }}
```

### Next.js 16 cambios vs versiones anteriores
- `middleware.ts` → DEPRECADO, usar `proxy.ts` (este repo aún usa middleware, funciona pero warn)
- `'use client'` en cualquier componente con hooks
- Cliente components NO pueden tener `export const dynamic`

### Deploy gotcha
- Cuando hagas git push, asegúrate que `user.name` y `user.email` de git SEAN los mismos de la cuenta de GitHub conectada a Vercel. Si no, Vercel BLOQUEA los deploys.
```bash
git config user.name "tu-usuario-github"
git config user.email "tu-usuario@users.noreply.github.com"
```

### Cache CDN Vercel
Repo trae `middleware.ts` con headers `no-store` para evitar caché agresivo. Mantener.

## Comandos

```bash
npm install
npm run dev          # dev en localhost:3000
npm run build        # build producción (Turbopack)
npm run start        # producción local
```

## Setup desde template

1. En github.com → "Use this template" → "Create new repository"
2. Clone local: `git clone https://github.com/TU_USER/REPO.git`
3. `cd REPO && npm install`
4. Borrar `.next/` si existe
5. `npm run dev` para verificar funcionamiento
6. Aplicar cambios de marca (sección 1)
7. Conectar a Vercel: vercel.com → New Project → Import del repo

## Storage keys a renombrar

`lib/store.ts` tiene keys con prefijo `jafra_*`. Renombrar a `gym_*` para evitar colisión si el usuario tuvo la app JAFRA instalada previamente:

```ts
const KEYS = {
  persons: 'gym_miembros',
  payments: 'gym_pagos',
  // ...
}
```

## Lo que YA funciona y NO tocar (a menos que rompa cosas)

- Modal con footer fijo
- Import Excel + parser xlsx
- PWA install
- BottomNav con FAB central
- Fade-up animation
- Card system con sombras

---

**Prompt sugerido para arrancar la nueva sesión:**

> Tengo este repo como template basado en un CRM JAFRA. Quiero convertirlo en una app de gestión para un GYM llamado [NOMBRE] con colores [HEX_PRIMARIO, HEX_SECUNDARIO]. Lee el archivo `BRIEF_GYM.md` para entender el stack y los cambios mínimos. Procedamos por fases: primero rebrand (paleta + nombres + manifest), después renombrar entidades del modelo (Personas→Miembros, Pagos→Mensualidades). No toques lógica de Modal, Import Excel, ni PublicNav.
