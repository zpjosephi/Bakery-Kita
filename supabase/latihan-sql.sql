-- ============================================================================
-- latihan-sql.sql  -  practice queries. Not part of the app.
--
-- How to use: open Supabase > SQL Editor, select one query, hit Run.
-- Everything here is read-only (SELECT), so nothing can be damaged.
--
-- Logical execution order, worth memorising because it is not the order you
-- write things in:
--   FROM -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT
-- That order explains why a SELECT alias can't be used in WHERE, but can be
-- used in ORDER BY.
-- ============================================================================


-- ############################################################################
-- PART 1  -  Basic SELECT
-- ############################################################################

-- 1.1 Every column. Fine for poking around, but in application code name the
--     columns instead so you don't drag back data nothing uses.
select * from products;

-- 1.2 Specific columns, renamed with an alias.
select id, name as nama_produk, price as harga
from products;

-- 1.3 WHERE filters rows, ORDER BY sorts, LIMIT caps how many come back.
select name, price
from products
where price > 15000
order by price desc
limit 3;

-- 1.4 Several conditions. AND binds tighter than OR, so parenthesise when you
--     mix them or the meaning changes.
select name, price
from products
where is_active = true
  and (price < 10000 or price > 20000);

-- 1.5 BETWEEN is inclusive: both bounds are included.
select name, price from products where price between 10000 and 20000;

-- 1.6 IN is shorthand for a chain of ORs.
select name from products where id in ('roti-coklat', 'donat-gula');

-- 1.7 LIKE matches a pattern. % is any number of characters, _ is exactly one.
--     ILIKE is the Postgres case-insensitive version.
select name from products where name ilike '%roti%';

-- 1.8 NULL means "unknown", not zero and not empty string. That is why it needs
--     IS NULL: "= NULL" is never true, not even for a NULL value.
select order_id, user_id
from orders
where user_id is null;          -- guest orders, placed without logging in

-- 1.9 DISTINCT removes duplicates.
select distinct status from orders;


-- ############################################################################
-- PART 2  -  Aggregates and GROUP BY
-- ############################################################################

-- 2.1 An aggregate squeezes many rows into one value.
select
  count(*)    as jumlah_pesanan,   -- count(*) counts rows, NULLs included
  sum(amount) as total_omzet,
  avg(amount) as rata_rata,
  min(amount) as terkecil,
  max(amount) as terbesar
from orders;

-- 2.2 count(*) vs count(column): count(column) SKIPS NULLs. Here that
--     difference tells you how many orders came from guests.
select
  count(*)       as semua_pesanan,
  count(user_id) as pesanan_user_login
from orders;

-- 2.3 GROUP BY splits rows into buckets, then aggregates each bucket.
--     The rule: every column in SELECT is either in GROUP BY or inside an
--     aggregate function.
select status, count(*) as jumlah, sum(amount) as total
from orders
group by status
order by jumlah desc;

-- 2.4 WHERE vs HAVING. Asked constantly in interviews.
--     WHERE filters ROWS before grouping.
--     HAVING filters GROUPS after aggregating, and is the only place an
--     aggregate function is allowed in a filter.
select
  date(created_at) as tanggal,
  count(*)         as jumlah_pesanan,
  sum(amount)      as omzet
from orders
where status = 'LUNAS'          -- rows: paid orders only
group by date(created_at)
having sum(amount) > 50000      -- groups: days that took more than 50k
order by tanggal desc;

-- 2.5 CASE WHEN is if/else inside SQL. The workhorse of report queries.
select
  case
    when price < 10000 then 'murah'
    when price < 20000 then 'sedang'
    else 'mahal'
  end          as kategori_harga,
  count(*)     as jumlah_produk
from products
group by 1                       -- "1" means the first column in the SELECT
order by jumlah_produk desc;


-- ############################################################################
-- PART 3  -  JOIN
-- The most commonly tested topic. Know these well enough to draw them.
--
--   INNER JOIN  -> only rows that match in BOTH tables
--   LEFT JOIN   -> all rows from the left; unmatched right side comes back NULL
--   RIGHT JOIN  -> the mirror image (rare, usually rewritten as a LEFT JOIN)
--   FULL JOIN   -> everything from both sides
--   CROSS JOIN  -> every combination; the row count multiplies, so be careful
-- ############################################################################

-- 3.1 INNER JOIN: orders with the buyer's name.
--     Guest orders (user_id NULL) SILENTLY DISAPPEAR here, because no profiles
--     row matches. That is the classic interview trap.
select
  o.order_id,
  o.amount,
  o.status,
  p.full_name
from orders o
join profiles p on p.id = o.user_id
order by o.created_at desc;

-- 3.2 LEFT JOIN: guest orders survive, with a NULL name.
--     coalesce(a, b) returns a, or b when a is NULL.
select
  o.order_id,
  o.amount,
  coalesce(p.full_name, 'Tamu') as pemesan
from orders o
left join profiles p on p.id = o.user_id
order by o.created_at desc;

-- 3.3 LEFT JOIN plus aggregate: orders per user, INCLUDING users who have never
--     ordered (they come back as 0).
--     Note count(o.order_id), not count(*). With count(*) a user who never
--     ordered would score 1, because the LEFT JOIN still produced a row for
--     them, just full of NULLs.
select
  pr.id,
  pr.full_name,
  count(o.order_id) as jumlah_pesanan,
  coalesce(sum(o.amount), 0) as total_belanja
from profiles pr
left join orders o on o.user_id = pr.id
group by pr.id, pr.full_name
order by total_belanja desc;

-- 3.4 Finding rows with NO match: LEFT JOIN, then keep the NULLs. This
--     "anti join" pattern answers questions like "which users never ordered?"
select pr.id, pr.full_name
from profiles pr
left join orders o on o.user_id = pr.id
where o.order_id is null;


-- ############################################################################
-- PART 4  -  Subqueries
-- ############################################################################

-- 4.1 Scalar subquery: returns a single value, used in a comparison.
select name, price
from products
where price > (select avg(price) from products);

-- 4.2 Subquery in the SELECT list: attaches a computed value per row.
select
  pr.full_name,
  (select count(*) from orders o where o.user_id = pr.id) as jumlah_pesanan
from profiles pr;

-- 4.3 EXISTS only asks "is there at least one?", it never cares about the
--     values. Usually beats IN on large subqueries because it stops at the
--     first match.
select pr.full_name
from profiles pr
where exists (
  select 1 from orders o where o.user_id = pr.id and o.status = 'LUNAS'
);

-- 4.4 Subquery in FROM (a derived table): aggregate first, then filter the
--     result again.
select *
from (
  select user_id, sum(amount) as total
  from orders
  where status = 'LUNAS'
  group by user_id
) t
where t.total > 30000;


-- ############################################################################
-- PART 5  -  Specific to this schema: reading jsonb
--
-- orders.items holds a JSON array: [{ id, name, price, qty }, ...]. To report
-- on it, the JSON has to be expanded into rows first.
--   jsonb_array_elements(col) turns one array element into one row
--   ->  extracts as JSON,  ->> extracts as text
--   ::int  casts that text to a number
-- ############################################################################

-- 5.1 Every line item as its own row.
select
  o.order_id,
  it->>'name'          as produk,
  (it->>'qty')::int    as qty,
  (it->>'price')::int  as harga
from orders o
cross join lateral jsonb_array_elements(o.items) as it
order by o.created_at desc;

-- 5.2 BEST SELLERS. This is the shape of report question that gets asked most.
select
  it->>'name'                                  as produk,
  sum((it->>'qty')::int)                       as total_terjual,
  sum((it->>'qty')::int * (it->>'price')::int) as total_rupiah
from orders o
cross join lateral jsonb_array_elements(o.items) as it
where o.status = 'LUNAS'
group by it->>'name'
order by total_terjual desc;

-- 5.3 Pulling fields out of a plain JSON object rather than an array.
select order_id, customer->>'nama' as nama, customer->>'hp' as hp
from orders;


-- ############################################################################
-- PART 6  -  Bonus: the things that show you actually understand it
-- ############################################################################

-- 6.1 EXPLAIN ANALYZE prints the execution plan. "Seq Scan" on a big table
--     usually means a missing index; "Index Scan" means the index is being used.
explain analyze
select * from orders where user_id = '00000000-0000-0000-0000-000000000000';

-- 6.2 Window functions: ranking without collapsing rows. The difference from
--     GROUP BY is that a plain aggregate merges rows into one, while a window
--     function adds a computed column and leaves every row intact.
select
  order_id,
  amount,
  rank() over (order by amount desc) as peringkat,
  sum(amount) over ()                as total_semua
from orders
where status = 'LUNAS';

-- 6.3 Inspect a table's structure through information_schema, which exists in
--     every SQL database, not just Postgres. Handy when asked to walk through
--     your own schema.
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'orders'
order by ordinal_position;
