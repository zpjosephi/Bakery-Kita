-- ============================================================
-- Bakery WebApp — Riwayat pesanan: status pemenuhan + akses
-- Jalankan sekali di Supabase: SQL Editor > New query > tempel > RUN.
-- ============================================================

-- Status PEMENUHAN (setelah dibayar): sedang diproses → selesai.
-- (Status PEMBAYARAN tetap di kolom `status`: PENDING/LUNAS/GAGAL/KEDALUWARSA.)
alter table public.orders
  add column if not exists fulfillment text not null default 'diproses'
  check (fulfillment in ('diproses', 'selesai'));

-- Pelanggan boleh MELIHAT pesanannya sendiri (untuk halaman riwayat).
drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select using (user_id = auth.uid());

-- Admin boleh MELIHAT semua pesanan.
drop policy if exists orders_select_admin on public.orders;
create policy orders_select_admin on public.orders
  for select using (public.is_admin());

-- Admin boleh MENGUBAH status (mis. tandai selesai).
drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
