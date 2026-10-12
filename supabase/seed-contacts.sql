create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  email      text,
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
drop policy if exists "contact_admin" on public.contact_messages;
create policy "contact_admin" on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());

-- Khách gửi qua hàm này, không đọc lại được bảng.
create or replace function public.submit_contact(p_name text, p_phone text, p_email text, p_message text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if length(trim(coalesce(p_name, ''))) < 2 or length(trim(coalesce(p_phone, ''))) < 8 or length(trim(coalesce(p_message, ''))) < 5 then
    raise exception 'invalid contact';
  end if;
  insert into public.contact_messages (name, phone, email, message)
  values (left(trim(p_name), 120), left(trim(p_phone), 30), nullif(left(trim(coalesce(p_email, '')), 160), ''), left(trim(p_message), 2000));
end;
$$;
grant execute on function public.submit_contact(text, text, text, text) to anon, authenticated;

-- ---------- Phần 2: 10 tin nhắn mẫu ----------
insert into public.contact_messages (name, phone, email, message, handled, created_at)
select v.name, v.phone, v.email, v.message, v.handled, v.created_at
from (values
  ('Nguyễn Thị Hạnh',  '0902111001', 'hanh.nguyen@example.com', 'Shop cho mình hỏi bột cacao nguyên chất 250g có đường không ạ? Mình đang ăn kiêng.',                                 true,  now() - interval '28 days'),
  ('Trần Quốc Bảo',    '0902111002', null,                      'Mình muốn lấy sỉ sô-cô-la Bungo khoảng 200 thanh cho quán cà phê. Cho mình xin bảng giá sỉ.',                     true,  now() - interval '24 days'),
  ('Lê Minh Châu',     '0902111003', 'chau.le@example.com',     'Công ty mình cần đặt 50 hộp quà sô-cô-la làm quà tặng đối tác dịp cuối năm, có in logo được không?',             false, now() - interval '20 days'),
  ('Phạm Đức Dũng',    '0902111004', null,                      'Cho mình hỏi vườn ca cao ở Định Quán có nhận tham quan theo nhóm không? Nhóm khoảng 15 người.',                   true,  now() - interval '17 days'),
  ('Võ Thị Em',        '0902111005', 'em.vo@example.com',       'Đơn hàng của mình giao đã 5 ngày chưa thấy tới, nhờ shop kiểm tra giúp. Cảm ơn shop.',                            true,  now() - interval '13 days'),
  ('Đặng Hoài Nam',    '0902111006', 'nam.dang@example.com',    'Bên mình là siêu thị mini, muốn nhập bột cacao 3 in 1 Vinchoco 400g. Điều kiện hợp tác thế nào ạ?',              false, now() - interval '9 days'),
  ('Bùi Thanh Phương', '0902111007', null,                      'Sô-cô-la nguyên chất 85% có phù hợp cho người tiểu đường không? Hạn sử dụng bao lâu?',                            false, now() - interval '6 days'),
  ('Hoàng Gia Quân',   '0902111008', 'quan.hoang@example.com',  'Mình ở Hà Nội, shop có giao hàng ra Hà Nội không và phí ship khoảng bao nhiêu?',                                  false, now() - interval '4 days'),
  ('Ngô Mỹ Rạng',      '0902111009', null,                      'Mình muốn đặt sô-cô-la hạt bàng hộp quà nhưng thấy ghi liên hệ báo giá. Shop báo giúp mình nhé.',                 false, now() - interval '2 days'),
  ('Lý Văn Sang',      '0902111010', 'sang.ly@example.com',     'Đoàn du lịch của mình muốn kết hợp trải nghiệm làm sô-cô-la tại vườn. Vui lòng gọi lại cho mình.',               false, now() - interval '5 hours')
) as v(name, phone, email, message, handled, created_at)
where not exists (
  select 1 from public.contact_messages m where m.phone = v.phone and m.message = v.message
);

-- Kiểm tra kết quả
select handled, count(*) as so_tin from public.contact_messages group by handled order by handled;