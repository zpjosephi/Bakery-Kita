-- ============================================================
-- Bakery WebApp — Skema Database (Supabase / Postgres)
-- Cara pakai: Supabase Dashboard > SQL Editor > New query >
--            tempel SEMUA isi file ini > klik RUN (sekali aja).
-- ============================================================

-- 1) PROFIL: perpanjangan dari auth.users untuk simpan ROLE & data pembeli.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'customer' check (role in ('customer','admin')),
  full_name  text,
  phone      text,
  created_at timestamptz not null default now()
);

-- 2) PRODUK: pindahan dari app/lib/products.ts ke database.
create table if not exists public.products (
  id          text primary key,
  name        text not null,
  description text not null default '',
  price       integer not null check (price >= 0),
  emoji       text not null default '',
  image       text not null default '',
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Helper dipakai RLS: apakah user yang sedang login itu admin?
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Trigger: tiap user baru daftar -> otomatis dibuatkan baris profil (role: customer).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- RLS (Row Level Security) — pagar akses per baris
-- ============================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;

-- PROFIL: user lihat profil sendiri; admin lihat semua. User ubah profil sendiri.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- PRODUK: semua orang boleh BACA (katalog publik); hanya ADMIN boleh tambah/ubah/hapus.
drop policy if exists products_select_all on public.products;
create policy products_select_all on public.products
  for select using (true);

drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- SEED: masukkan 6 produk yang sekarang sudah ada di katalog
-- ============================================================
insert into public.products (id, name, description, price, emoji, image, sort_order) values
  ('roti-coklat',     'Roti Coklat',        'Coklatnya lumer di dalam, rotinya empuk. Paling enak selagi hangat.',          12000, '🍫', '/products/roti-coklat.jpg',     1),
  ('croissant-butter','Croissant Butter',   'Pakai butter asli, jadi wangi dan ringan. Teman pas buat kopi pagi.',          18000, '🥐', '/products/croissant-butter.jpg',2),
  ('donat-gula',      'Donat Gula',         'Donat empuk klasik, taburan gula halus. Sederhana tapi bikin nambah.',          8000, '🍩', '/products/donat-gula.jpg',      3),
  ('roti-tawar',      'Roti Tawar Premium', 'Lembut dan awet buat stok di rumah. Enak dipanggang atau dibikin roti isi.',   22000, '🍞', '/products/roti-tawar.jpg',      4),
  ('kue-keju',        'Bolu Keju',          'Bolu lembut, kejunya nggak pelit. Manis-gurihnya pas buat nyemil sore.',       25000, '🧀', '/products/kue-keju.jpg',        5),
  ('bagel-wijen',     'Bagel Wijen',        'Kenyal, padat, penuh wijen. Belah dua, panggang, olesi krim keju.',            15000, '🥯', '/products/bagel-wijen.jpg',     6)
on conflict (id) do nothing;
