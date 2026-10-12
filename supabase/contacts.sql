
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
