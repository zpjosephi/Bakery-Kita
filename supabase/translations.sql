-- Localized product fields. The canonical name/description columns hold what the
-- admin typed; these hold the English & Indonesian versions shown in the catalog.
alter table public.products
  add column if not exists name_en        text,
  add column if not exists name_id        text,
  add column if not exists description_en text,
  add column if not exists description_id text;

-- Default both languages to the canonical text first (covers any product),
-- so nothing is ever blank. The known seed products get proper English below.
update public.products
   set name_id        = coalesce(name_id, name),
       name_en        = coalesce(name_en, name),
       description_id = coalesce(description_id, description),
       description_en = coalesce(description_en, description)
 where name_id is null;

-- Hand-written English for the original 6 products (no AI key needed for these).
update public.products set
  name_en = 'Chocolate Bread',
  description_en = 'Molten chocolate inside, soft and fluffy bread. Best enjoyed warm.'
  where id = 'roti-coklat';

update public.products set
  name_en = 'Butter Croissant',
  description_en = 'Made with real butter — fragrant and light. The perfect partner for your morning coffee.'
  where id = 'croissant-butter';

update public.products set
  name_en = 'Sugar Donut',
  description_en = 'A soft, classic donut dusted with fine sugar. Simple, but you''ll want seconds.'
  where id = 'donat-gula';

update public.products set
  name_en = 'Premium White Bread',
  description_en = 'Soft and long-lasting for your home stock. Great toasted or made into sandwiches.'
  where id = 'roti-tawar';

update public.products set
  name_en = 'Cheese Sponge Cake',
  description_en = 'A soft sponge cake, generous with cheese. The sweet-and-savoury balance is perfect for an afternoon snack.'
  where id = 'kue-keju';

update public.products set
  name_en = 'Sesame Bagel',
  description_en = 'Chewy, dense, and packed with sesame. Slice it, toast it, spread on some cream cheese.'
  where id = 'bagel-wijen';
