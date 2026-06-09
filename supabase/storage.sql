-- ============================================================
-- Bakery WebApp — Storage untuk FOTO PRODUK
-- Jalankan sekali di Supabase: SQL Editor > New query > tempel > RUN.
-- ============================================================

-- Bucket publik bernama "products" (foto bisa dilihat siapa saja di katalog).
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Siapa pun boleh MELIHAT foto (katalog publik).
drop policy if exists "product_images_read" on storage.objects;
create policy "product_images_read" on storage.objects
  for select using (bucket_id = 'products');

-- Hanya ADMIN yang boleh UPLOAD / GANTI / HAPUS foto.
drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects
  for update using (bucket_id = 'products' and public.is_admin());

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'products' and public.is_admin());
