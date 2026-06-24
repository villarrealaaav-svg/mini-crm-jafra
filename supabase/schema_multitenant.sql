-- ============================================================
-- Migración a MULTI-ESPACIO (multi-tenant)
-- Correr DESPUÉS del schema.sql inicial. Idempotente.
-- (No hay data real aún → seguro recrear muro_ranking/contacto_qr.)
-- ============================================================

-- Tabla de administradoras: cada fila = un espacio (link + NIP).
-- Sin acceso anon (solo la Edge Function con service_role la lee/escribe).
create table if not exists public.admins (
  tenant     text primary key,            -- slug del link, ej. 'rosa'
  pin        text not null unique,        -- NIP de esa admin
  name       text not null,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- (sin policies → anon no puede leer NIPs)

-- Columna tenant en las tablas de contenido por-fila
alter table public.productos add column if not exists tenant text not null default '';
alter table public.cursos    add column if not exists tenant text not null default '';
alter table public.catalogo  add column if not exists tenant text not null default '';
create index if not exists productos_tenant_idx on public.productos(tenant);
create index if not exists cursos_tenant_idx    on public.cursos(tenant);
create index if not exists catalogo_tenant_idx  on public.catalogo(tenant);

-- muro_ranking y contacto_qr eran singleton (id=1) → ahora una fila por espacio
drop table if exists public.muro_ranking;
drop table if exists public.contacto_qr;

create table public.muro_ranking (
  tenant     text primary key,
  month      text not null default '',
  entries    jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
create table public.contacto_qr (
  tenant     text primary key,
  app        text,
  whatsapp   text,
  updated_at timestamptz not null default now()
);

alter table public.muro_ranking enable row level security;
alter table public.contacto_qr  enable row level security;

drop policy if exists "anon read muro" on public.muro_ranking;
drop policy if exists "anon read qr"   on public.contacto_qr;
create policy "anon read muro" on public.muro_ranking for select using (true);
create policy "anon read qr"   on public.contacto_qr  for select using (true);

-- (productos/cursos/catalogo conservan sus policies de SELECT anon del schema inicial)
