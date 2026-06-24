-- ============================================================
-- MINI CRM JAFRA — Schema contenido PÚBLICO (compartible vía /p)
-- Correr completo en Supabase → SQL Editor.
-- Lectura: anon (pública). Escritura: SOLO service-role (Edge Function con PIN).
-- Datos PRIVADOS (personas/pagos/recordatorios/reuniones) NO viven aquí.
-- ============================================================

-- ---------- Tablas ----------

-- Muro del Éxito: una sola fila (id=1)
create table if not exists public.muro_ranking (
  id         smallint primary key default 1,
  month      text not null default '',
  entries    jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint muro_singleton check (id = 1)
);

create table if not exists public.productos (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  price       text not null default '',
  image       text not null default '',
  category    text not null default '',
  highlight   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.cursos (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  date        date,
  "time"      text not null default '',
  modality    text not null default 'zoom',
  location    text not null default '',
  description text not null default '',
  image       text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists public.catalogo (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  type       text not null default 'pdf',   -- link | imagen | pdf | texto
  content    text not null default '',       -- URL Storage, URL externa, o texto
  public     boolean not null default false, -- true = visible en /p/catalogos
  created_at timestamptz not null default now()
);

-- QRs de contacto: una sola fila (id=1)
create table if not exists public.contacto_qr (
  id         smallint primary key default 1,
  app        text,
  whatsapp   text,
  updated_at timestamptz not null default now(),
  constraint qr_singleton check (id = 1)
);

-- ---------- RLS: anon SOLO lee. Sin policies de escritura para anon. ----------
-- (service-role usado por la Edge Function ignora RLS, así que puede escribir.)

alter table public.muro_ranking enable row level security;
alter table public.productos    enable row level security;
alter table public.cursos       enable row level security;
alter table public.catalogo     enable row level security;
alter table public.contacto_qr  enable row level security;

drop policy if exists "anon read muro"     on public.muro_ranking;
drop policy if exists "anon read productos" on public.productos;
drop policy if exists "anon read cursos"    on public.cursos;
drop policy if exists "anon read catalogo"  on public.catalogo;
drop policy if exists "anon read qr"        on public.contacto_qr;

create policy "anon read muro"     on public.muro_ranking for select using (true);
create policy "anon read productos" on public.productos    for select using (true);
create policy "anon read cursos"    on public.cursos       for select using (true);
create policy "anon read catalogo"  on public.catalogo     for select using (true);
create policy "anon read qr"        on public.contacto_qr  for select using (true);

-- Filas singleton iniciales (idempotente)
insert into public.muro_ranking (id, month, entries) values (1, '', '[]'::jsonb)
  on conflict (id) do nothing;
insert into public.contacto_qr (id) values (1)
  on conflict (id) do nothing;

-- ---------- Storage: bucket público para imágenes/PDF ----------
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

-- Lectura pública del bucket (las URLs públicas funcionan sin auth).
drop policy if exists "anon read public-assets" on storage.objects;
create policy "anon read public-assets" on storage.objects
  for select using (bucket_id = 'public-assets');
-- (Escritura al bucket: solo service-role vía Edge Function. Sin policy de insert para anon.)
