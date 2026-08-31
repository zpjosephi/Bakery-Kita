-- ============================================================================
-- schema.sql  -  core tables: profiles + products
-- Run in Supabase > SQL Editor. Safe to re-run: everything uses
-- "if not exists" / "or replace", so running it twice changes nothing.
--
-- Order to run the files in this folder:
--   1. schema.sql         (profiles & products, is_admin(), new-user trigger)
--   2. orders.sql         (orders table)
--   3. orders-history.sql (fulfillment column + orders RLS policies)
--   4. storage.sql        (product image bucket)
--   5. translations.sql   (EN/ID translation columns on products)
-- ============================================================================


-- ----------------------------------------------------------------------------
-- TABLE: profiles
-- Extra data per user. Supabase already owns auth.users (email, password hash,
-- etc.) and we can't add columns to it, so this table hangs off it via a
-- foreign key. profiles to auth.users is one-to-one: one user, one profile.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  -- Primary key AND foreign key at once. Because the PK is the user id itself,
  -- a user can never end up with two profile rows.
  -- "on delete cascade": delete the user, the profile row goes with it.
  id         uuid primary key references auth.users(id) on delete cascade,

  -- CHECK constraint: the database enforces valid values, not just app code.
  -- Try to insert role 'superadmin' and Postgres rejects it at the table level.
  role       text not null default 'customer' check (role in ('customer','admin')),

  full_name  text,          -- nullable: signing up without a name is allowed
  phone      text,          -- nullable
  created_at timestamptz not null default now()   -- timestamp with time zone
);


-- ----------------------------------------------------------------------------
-- TABLE: products
-- The catalog. The id is a text slug ('roti-coklat') rather than an
-- auto-increment number, so it stays readable in URLs and image paths.
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id          text primary key,

  name        text not null,                       -- not null: required
  description text not null default '',            -- defaults to '' so it is never NULL
  price       integer not null check (price >= 0), -- whole rupiah, never negative

  emoji       text not null default '',            -- fallback when no image is set
  image       text not null default '',            -- local path or Supabase Storage URL

  is_active   boolean not null default true,       -- soft delete: hide without deleting
  sort_order  integer not null default 0,          -- display order in the catalog

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- FUNCTION: is_admin()
-- Used by most of the RLS policies below. It is one query: "does a profiles row
-- exist whose id is the current user and whose role is admin?"
--
-- auth.uid()       = Supabase built-in, returns the UUID of the requesting user.
-- security definer = the function runs with its owner's rights, not the
--                    caller's. Required here, otherwise reading profiles would
--                    trigger the profiles RLS policy, which calls this function
--                    again, and recurse forever.
-- set search_path  = pins the schema so the function can't be hijacked by a
--                    same-named table planted in another schema.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;


-- ----------------------------------------------------------------------------
-- FUNCTION + TRIGGER: create a profile row whenever a user signs up
-- Without this, a new user exists in auth.users with no profile, so their role
-- is unknown. A trigger is "when X happens, run Y", enforced by the database
-- itself, so it still fires for users created from the Supabase dashboard
-- rather than through the site.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- "new" is the auth.users row that was just inserted.
  -- raw_user_meta_data is jsonb; the ->> operator pulls a field out as text.
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;   -- profile already there? leave it alone
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users                                -- when: after the user row lands
  for each row execute function public.handle_new_user();   -- per row, not per statement


-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- The rule of "who may see or change which rows" lives inside the database, not
-- only in the web code. So even someone calling the Supabase API directly,
-- outside this app, is bound by the same rules.
--
-- Once RLS is enabled, everything is denied by default; policies open it back
-- up. One policy grants one permission for one action (select/insert/update/
-- delete/all).
--   using (...)      -> which existing rows the action may touch
--   with check (...) -> what the resulting row is allowed to look like, so a
--                       user can't write a row that ends up belonging to
--                       someone else
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;

-- profiles: a user sees only their own row; an admin sees all of them.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- profiles: a user may only update their own row, and the result must still be
-- their own row (with check), so they can't reassign a profile to another id.
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- products: the catalog is meant to be public, readable even when logged out.
drop policy if exists products_select_all on public.products;
create policy products_select_all on public.products
  for select using (true);

-- products: writing (insert/update/delete, which is what "for all" covers) is
-- admin only.
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());


-- ----------------------------------------------------------------------------
-- SEED: the starting catalog.
-- "on conflict (id) do nothing" skips rows that already exist instead of
-- erroring, which is what makes this file safe to run again.
-- ----------------------------------------------------------------------------
insert into public.products (id, name, description, price, emoji, image, sort_order) values
  ('roti-coklat','Roti Coklat','Coklatnya lumer di dalam, rotinya empuk. Paling enak selagi hangat.',12000,'🍫','/products/roti-coklat.jpg',1),
  ('croissant-butter','Croissant Butter','Pakai butter asli, jadi wangi dan ringan. Teman pas buat kopi pagi.',18000,'🥐','/products/croissant-butter.jpg',2),
  ('donat-gula','Donat Gula','Donat empuk klasik, taburan gula halus. Sederhana tapi bikin nambah.',8000,'🍩','/products/donat-gula.jpg',3),
  ('roti-tawar','Roti Tawar Premium','Lembut dan awet buat stok di rumah. Enak dipanggang atau dibikin roti isi.',22000,'🍞','/products/roti-tawar.jpg',4),
  ('kue-keju','Bolu Keju','Bolu lembut, kejunya nggak pelit. Manis-gurihnya pas buat nyemil sore.',25000,'🧀','/products/kue-keju.jpg',5),
  ('bagel-wijen','Bagel Wijen','Kenyal, padat, penuh wijen. Belah dua, panggang, olesi krim keju.',15000,'🥯','/products/bagel-wijen.jpg',6)
on conflict (id) do nothing;
