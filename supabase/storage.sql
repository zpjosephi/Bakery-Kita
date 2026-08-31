-- ============================================================================
-- storage.sql  -  where admin-uploaded product images live
--
-- Supabase Storage is really just Postgres tables (storage.buckets and
-- storage.objects) holding file metadata. Because they are ordinary tables,
-- access is controlled with the same RLS policies as everything else, so there
-- is only one permission model to learn.
--
-- Needs public.is_admin() from schema.sql, so run that first.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- The 'products' bucket. public = true means files inside are reachable by
-- plain URL with no token, which is what catalog photos want.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;


-- ----------------------------------------------------------------------------
-- Policies: anyone reads, only admins write.
-- Every policy pins bucket_id = 'products'. Without that they would apply to
-- every bucket in the project, including private ones added later.
-- ----------------------------------------------------------------------------

drop policy if exists product_images_read on storage.objects;
create policy product_images_read on storage.objects
  for select using (bucket_id = 'products');

-- insert takes "with check" and no "using", which makes sense: there is no
-- existing row to filter, only an incoming one to validate.
drop policy if exists product_images_admin_insert on storage.objects;
create policy product_images_admin_insert on storage.objects
  for insert with check (bucket_id = 'products' and public.is_admin());

drop policy if exists product_images_admin_update on storage.objects;
create policy product_images_admin_update on storage.objects
  for update using (bucket_id = 'products' and public.is_admin());

drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_admin_delete on storage.objects
  for delete using (bucket_id = 'products' and public.is_admin());
