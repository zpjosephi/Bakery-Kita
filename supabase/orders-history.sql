-- ============================================================================
-- orders-history.sql  -  migration: fulfillment state + RLS policies on orders
-- Run after orders.sql.
--
-- This file is what a migration looks like: adding a column to a table that
-- already holds data. Every statement has to be safe to re-run, and the new
-- column needs a default so existing rows don't end up NULL.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- New column: fulfillment
-- Separate from "status" because they track two different things:
--   status      = the MONEY, driven by Midtrans (PENDING / LUNAS / GAGAL / ...)
--   fulfillment = the BREAD, driven by the shop admin (diproses / selesai)
-- An order can be paid and still being baked. Folding both into one column
-- would let one flow overwrite the other.
--
-- "add column if not exists" keeps it re-runnable.
-- "not null default 'diproses'" backfills every existing row.
-- "check (...)" makes the database reject anything outside the two values.
-- ----------------------------------------------------------------------------
alter table public.orders
  add column if not exists fulfillment text not null default 'diproses'
  check (fulfillment in ('diproses', 'selesai'));


-- ============================================================================
-- RLS policies for orders.
-- The "drop policy if exists" then "create policy" pattern is used because
-- Postgres has no "create or replace policy". When several policies cover the
-- same action they combine with OR: satisfying any one of them is enough.
-- ============================================================================

-- A customer sees only their own orders. This filter runs in the database, not
-- in the web code, so even if a page forgets to filter, nobody can read someone
-- else's order.
drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select using (user_id = auth.uid());

-- An admin sees every order, which is what /admin/pesanan needs.
drop policy if exists orders_select_admin on public.orders;
create policy orders_select_admin on public.orders
  for select using (public.is_admin());

-- Only an admin may update an order; used to flip fulfillment to 'selesai'.
-- Both clauses matter: "using" guards which rows can be touched, "with check"
-- guards what they may be turned into.
drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
