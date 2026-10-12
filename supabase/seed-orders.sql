
do $$
declare
  c        record;
  v_pids   text[] := array['p1','p2','p3','p4','p5','p6','p7','p8','p9','p11','p12','p13',
                           'p14','p15','p16','p17','p18','p19','p20','p21'];
  v_notes  text[] := array['Giao giờ hành chính', 'Gọi trước khi giao', 'Gói quà giúp mình',
                           'Giao buổi tối', 'Để hàng ở bảo vệ'];
  v_order  uuid;
  v_n      integer := 0;
  v_created timestamptz;
  v_age    numeric;
  v_r      numeric;
  v_status text;
  v_note   text;
  v_pay    text;
  v_cnt    integer;
  v_gift   integer;
begin
  if exists (select 1 from public.orders where code like 'DEMO%') then
    raise notice 'Đã có đơn mẫu (DEMO...), bỏ qua. Xóa chúng trước nếu muốn nạp lại.';
    return;
  end if;

  perform setseed(0.42);   -- kết quả ngẫu nhiên nhưng lặp lại được

  for c in
    select id, name, phone, address, created_at
      from public.customers
     where phone between '0901000001' and '0901000020'
     order by phone
  loop
    for i in 1 .. (1 + floor(random() * 3))::int loop
      v_n := v_n + 1;

      -- thời điểm đặt: sau ngày tạo khách, lệch về phía gần hiện tại
      v_created := c.created_at + (now() - c.created_at) * (1 - power(random(), 2));
      v_age     := extract(epoch from (now() - v_created)) / 86400;

      -- trạng thái phụ thuộc đơn cũ hay mới
      v_r := random();
      if v_age > 10 then
        v_status := case when v_r < 0.88 then 'done' else 'cancelled' end;
      elsif v_age > 4 then
        v_status := case when v_r < 0.60 then 'done' when v_r < 0.90 then 'shipping' else 'cancelled' end;
      else
        v_status := case when v_r < 0.35 then 'new' when v_r < 0.65 then 'processing'
                         when v_r < 0.85 then 'shipping' else 'done' end;
      end if;

      v_pay  := case when random() < 0.4 then 'bank' else 'cod' end;
      v_note := case when random() < 0.35 then v_notes[1 + floor(random() * array_length(v_notes, 1))::int] end;

      insert into public.orders (code, customer_id, customer_name, phone, address, note,
                                 payment, status, total, created_at)
      values ('DEMO' || lpad(v_n::text, 4, '0'), c.id, c.name, c.phone, c.address, v_note,
              v_pay, v_status, 0, v_created)
      returning id into v_order;

      -- 1–4 sản phẩm khác nhau, số lượng 1–3
      v_cnt := 1 + floor(random() * 4)::int;
      insert into public.order_items (order_id, product_id, name, qty, unit_price)
      select v_order, p.id, p.name_vi, 1 + floor(random() * 3)::int, p.price
        from public.products p
       where p.id = any (v_pids) and p.in_stock and p.price > 0
       order by random()
       limit v_cnt;

      -- khoảng 10% đơn có thêm hộp quà tự chọn (Macca + Đắng + 72%)
      if random() < 0.10 then
        select coalesce(sum(price), 0) into v_gift from public.products where id in ('p8', 'p15', 'p17');
        insert into public.order_items (order_id, product_id, name, qty, unit_price, note)
        values (v_order, null, 'Hộp quà sô-cô-la (3)', 1, v_gift,
                'Chúc mừng sinh nhật · Sô-cô-la sữa hạt Macca, Sô-cô-la đắng, Sô-cô-la nguyên chất 72%');
      end if;

      update public.orders
         set total = (select coalesce(sum(qty * unit_price), 0) from public.order_items where order_id = v_order)
       where id = v_order;
    end loop;
  end loop;

  raise notice 'Đã tạo % đơn hàng mẫu.', v_n;
end $$;

-- Kiểm tra kết quả
select status, count(*) as so_don, sum(total) as tong_tien
  from public.orders where code like 'DEMO%' group by status order by so_don desc;

