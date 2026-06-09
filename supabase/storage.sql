insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists product_images_read on storage.objects;
create policy product_images_read on storage.objects
  for select using (bucket_id = 'products');

drop policy if exists product_images_admin_insert on storage.objects;
create policy product_images_admin_insert on storage.objects
  for insert with check (bucket_id = 'products' and public.is_admin());

drop policy if exists product_images_admin_update on storage.objects;
create policy product_images_admin_update on storage.objects
  for update using (bucket_id = 'products' and public.is_admin());

drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_admin_delete on storage.objects
  for delete using (bucket_id = 'products' and public.is_admin());
