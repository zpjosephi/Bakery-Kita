create table if not exists public.orders (
  order_id     text primary key,
  user_id      uuid references auth.users(id) on delete set null,
  amount       integer not null,
  status       text not null default 'PENDING',
  customer     jsonb not null,
  items        jsonb not null,
  qr_string    text,
  qr_image_url text,
  expiry_time  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;
