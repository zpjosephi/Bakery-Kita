alter table public.orders
  add column if not exists fulfillment text not null default 'diproses'
  check (fulfillment in ('diproses', 'selesai'));

drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select using (user_id = auth.uid());

drop policy if exists orders_select_admin on public.orders;
create policy orders_select_admin on public.orders
  for select using (public.is_admin());

drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
