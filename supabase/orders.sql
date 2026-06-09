-- ============================================================
-- Bakery WebApp — Tabel PESANAN (orders)
-- Jalankan sekali di Supabase: SQL Editor > New query > tempel > RUN.
-- ============================================================

create table if not exists public.orders (
  order_id     text primary key,
  user_id      uuid references auth.users(id) on delete set null, -- terisi kalau pembeli login (riwayat)
  amount       integer not null,
  status       text not null default 'PENDING', -- PENDING / LUNAS / GAGAL / KEDALUWARSA
  customer     jsonb not null,                  -- { nama, hp, alamat }
  items        jsonb not null,                  -- [ { id, name, price, qty } ]
  qr_string    text,
  qr_image_url text,
  expiry_time  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- Pesanan berisi DATA PRIBADI pembeli → kunci rapat.
-- RLS aktif TANPA policy = akses langsung (anon/authenticated) DITOLAK.
-- Server memakai service_role (klien admin) yang menembus RLS.
alter table public.orders enable row level security;
