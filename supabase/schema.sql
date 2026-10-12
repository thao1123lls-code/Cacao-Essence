
create table if not exists public.products (
  id         text primary key,
  category   text not null check (category in ('powder', 'chocolate')),
  name_vi    text not null,
  name_en    text not null,
  brand      text not null default '',
  price      integer not null default 0 check (price >= 0),   -- 0 = liên hệ báo giá
  in_stock   boolean not null default true,
  image      text not null default '',
  sort       integer not null default 0
);

create table if not exists public.customers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null unique,
  address    text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  customer_id   uuid references public.customers(id) on delete set null,
  customer_name text not null,
  phone         text not null,
  address       text not null,
  note          text,
  payment       text not null check (payment in ('cod', 'bank')),
  status        text not null default 'new'
                check (status in ('new', 'processing', 'shipping', 'done', 'cancelled')),
  total         integer not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx  on public.orders (status);

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  name       text not null,
  qty        integer not null check (qty > 0),
  unit_price integer not null check (unit_price >= 0),
  note       text
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- Danh sách tài khoản quản trị (tạo user ở Authentication rồi thêm user_id vào đây)
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------- Row Level Security ----------------
alter table public.products    enable row level security;
alter table public.customers   enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.admins      enable row level security;

drop policy if exists "products_read"  on public.products;
drop policy if exists "products_admin" on public.products;
create policy "products_read"  on public.products for select using (true);
create policy "products_admin" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "customers_admin"   on public.customers;
drop policy if exists "orders_admin"      on public.orders;
drop policy if exists "order_items_admin" on public.order_items;
create policy "customers_admin"   on public.customers   for all using (public.is_admin()) with check (public.is_admin());
create policy "orders_admin"      on public.orders      for all using (public.is_admin()) with check (public.is_admin());
create policy "order_items_admin" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins_self" on public.admins;
create policy "admins_self" on public.admins for select using (user_id = auth.uid());

create or replace function public.create_order(
  p_name text, p_phone text, p_address text, p_note text, p_payment text, p_items jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_cust uuid; v_order uuid; v_code text; v_total integer := 0;
  it jsonb; prod public.products%rowtype;
  v_qty integer; v_unit integer; v_name text; v_note text; v_n integer; v_names text;
begin
  p_phone := regexp_replace(coalesce(p_phone, ''), '[\s.\-]', '', 'g');
  if length(trim(coalesce(p_name, ''))) < 2 or length(trim(coalesce(p_address, ''))) < 5
     or p_phone !~ '^(0|\+84)[0-9]{9,10}$' then
    raise exception 'invalid_customer';
  end if;
  if p_payment not in ('cod', 'bank') then raise exception 'invalid_payment'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 30 then
    raise exception 'invalid_items';
  end if;

  insert into customers (name, phone, address)
  values (trim(p_name), p_phone, trim(p_address))
  on conflict (phone) do update set name = excluded.name, address = excluded.address
  returning id into v_cust;

  v_code := 'CO' || upper(to_hex((extract(epoch from clock_timestamp()) * 1000)::bigint))
                 || upper(substr(md5(random()::text), 1, 3));

  insert into orders (code, customer_id, customer_name, phone, address, note, payment, status, total)
  values (v_code, v_cust, trim(p_name), p_phone, trim(p_address), left(coalesce(p_note, ''), 500), p_payment, 'new', 0)
  returning id into v_order;

  for it in select * from jsonb_array_elements(p_items) loop
    v_qty := least(greatest(coalesce((it->>'qty')::int, 1), 1), 50);
    if it ? 'gift' then
      select count(*), coalesce(sum(p.price), 0), string_agg(p.name_vi, ', ')
        into v_n, v_unit, v_names
        from jsonb_array_elements_text(it->'gift'->'ids') g(id)
        join products p on p.id = g.id and p.in_stock and p.price > 0;
      if v_n < 1 or v_n > 7 then raise exception 'invalid_gift'; end if;
      v_name := 'Hộp quà sô-cô-la (' || v_n || ')';
      v_note := trim(both ' ·' from concat_ws(' · ', nullif(left(coalesce(it->'gift'->>'msg', ''), 80), ''), v_names));
      insert into order_items (order_id, product_id, name, qty, unit_price, note)
      values (v_order, null, v_name, v_qty, v_unit, v_note);
    else
      select * into prod from products where id = it->>'id' and in_stock and price > 0;
      if not found then raise exception 'invalid_product'; end if;
      v_unit := prod.price;
      insert into order_items (order_id, product_id, name, qty, unit_price)
      values (v_order, prod.id, prod.name_vi, v_qty, v_unit);
    end if;
    v_total := v_total + v_unit * v_qty;
  end loop;

  update orders set total = v_total where id = v_order;
  return jsonb_build_object('code', v_code, 'total', v_total);
end;
$$;

revoke all on function public.create_order(text, text, text, text, text, jsonb) from public;
grant execute on function public.create_order(text, text, text, text, text, jsonb) to anon, authenticated;

-- Realtime: admin nhận đơn mới ngay lập tức
alter publication supabase_realtime add table public.orders;
