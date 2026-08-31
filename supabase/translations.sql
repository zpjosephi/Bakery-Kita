-- ============================================================================
-- translations.sql  -  migration: EN/ID translation columns on products
-- Run after schema.sql.
--
-- The original name/description columns stay as the canonical text, meaning
-- whatever the admin typed. The four new columns hold the English and
-- Indonesian versions shown in the catalog depending on the visitor's language.
--
-- Why not a separate product_translations table with one row per language?
-- Normalised, that would be cleaner and would make a third language trivial.
-- But there are exactly two languages here and that isn't changing, so extra
-- columns are simpler: no join on every catalog page load. It is deliberate
-- denormalisation, and the reasoning is the part worth defending.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Add the columns. Nullable, because the updates below fill them in stages.
-- ----------------------------------------------------------------------------
alter table public.products
  add column if not exists name_en        text,
  add column if not exists name_id        text,
  add column if not exists description_en text,
  add column if not exists description_id text;


-- ----------------------------------------------------------------------------
-- Seed both languages from the canonical text first so nothing is ever blank,
-- including products an admin adds later.
--
-- coalesce(a, b) returns a, or b when a is NULL, so existing translations are
-- never overwritten. The "where name_id is null" clause makes the statement
-- re-runnable: the first run fills the columns, later runs match no rows.
-- ----------------------------------------------------------------------------
update public.products
   set name_id        = coalesce(name_id, name),
       name_en        = coalesce(name_en, name),
       description_id = coalesce(description_id, description),
       description_en = coalesce(description_en, description)
 where name_id is null;


-- ----------------------------------------------------------------------------
-- Hand-written English for the six seed products, so the catalog reads well
-- without needing an AI key. Products added through the admin page get
-- translated automatically instead (see app/lib/translate.ts).
--
-- Each update is pinned with "where id = ...". That habit is not optional:
-- an UPDATE without a WHERE hits every row in the table, and there is no undo.
-- ----------------------------------------------------------------------------
update public.products set
  name_en = 'Chocolate Bread',
  description_en = 'Molten chocolate inside, soft and fluffy bread. Best enjoyed warm.'
  where id = 'roti-coklat';

update public.products set
  name_en = 'Butter Croissant',
  description_en = 'Made with real butter, fragrant and light. The perfect partner for your morning coffee.'
  where id = 'croissant-butter';

-- A single quote inside a SQL string is escaped by doubling it: 'you''ll'.
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
