
create table if not exists public.faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_logs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  handoff    boolean not null default false,
  resolved   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.faqs      enable row level security;
alter table public.chat_logs enable row level security;

drop policy if exists "faqs_read"       on public.faqs;
drop policy if exists "faqs_admin"      on public.faqs;
drop policy if exists "chat_logs_admin" on public.chat_logs;
create policy "faqs_read"       on public.faqs      for select using (active);
create policy "faqs_admin"      on public.faqs      for all using (public.is_admin()) with check (public.is_admin());
create policy "chat_logs_admin" on public.chat_logs for all using (public.is_admin()) with check (public.is_admin());

-- Khách ghi nhật ký qua hàm này, không được đọc lại bảng.
create or replace function public.log_chat(p_question text, p_answer text, p_handoff boolean)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.chat_logs (question, answer, handoff)
  values (left(p_question, 1000), left(p_answer, 2000), coalesce(p_handoff, false));
$$;
grant execute on function public.log_chat(text, text, boolean) to anon, authenticated;
