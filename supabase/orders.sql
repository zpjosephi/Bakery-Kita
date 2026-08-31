-- ============================================================================
-- orders.sql  -  the orders table
-- Run after schema.sql (it needs auth.users to exist).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- TABLE: orders
-- One row per checkout. The relationship to a user is many-to-one: a user can
-- have many orders, an order belongs to at most one user.
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  -- The PK is a string the app builds: "ORDER-<timestamp>-<random>". Same value
  -- is sent to Midtrans as its order_id, so one number traces the payment
  -- across both systems.
  order_id     text primary key,

  -- FK to whoever checked out. Nullable, because guests can order without an
  -- account. "on delete set null" means deleting the account KEEPS the order
  -- and just blanks the link. Deliberate: sales records shouldn't disappear
  -- because someone deleted their account. Compare with profiles, which
  -- cascades instead.
  user_id      uuid references auth.users(id) on delete set null,

  -- Total in whole rupiah. Recomputed on the server from product prices rather
  -- than trusting the number the browser sent, otherwise the price is forgeable.
  amount       integer not null,

  -- Payment status driven by Midtrans: PENDING / LUNAS / GAGAL / KEDALUWARSA.
  status       text not null default 'PENDING',

  -- jsonb is Postgres' binary JSON type: stored structured, and queryable.
  -- customer holds { nama, hp, alamat }, a snapshot of the buyer at checkout.
  customer     jsonb not null,

  -- items holds [{ id, name, price, qty }, ...] and is a SNAPSHOT of the price
  -- at the time of purchase. This is the main design decision in the schema:
  -- why not a separate order_items table joined to products? Because product
  -- prices change, and an old receipt has to keep showing what was actually
  -- paid. The trade-off is that reporting ("which product sold most this
  -- month") means unpacking JSON instead of a plain join.
  items        jsonb not null,

  qr_string    text,          -- raw QRIS payload from Midtrans
  qr_image_url text,          -- hosted QR image
  expiry_time  text,          -- payment deadline, stored as Midtrans returns it

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- INDEXES
-- An index is the book's table of contents. Without one Postgres reads every
-- row to find matches (a sequential scan). These two exist because they match
-- the two queries this app actually runs. The cost is slower inserts and extra
-- storage, so don't index columns nothing searches on.
-- ----------------------------------------------------------------------------

-- For /pesanan: "where user_id = <me>"
create index if not exists orders_user_id_idx on public.orders (user_id);

-- For the admin dashboard: "order by created_at desc". The direction is baked
-- into the index, so reading the newest orders needs no sort step at all.
create index if not exists orders_created_at_idx on public.orders (created_at desc);


-- ----------------------------------------------------------------------------
-- Turn RLS on. From here the table is locked until a policy opens it; the
-- policies live in orders-history.sql.
--
-- Note the server writes to this table with the service role key
-- (see app/lib/supabase/admin.ts), which bypasses RLS on purpose. That is safe
-- because the key never leaves the server.
-- ----------------------------------------------------------------------------
alter table public.orders enable row level security;
