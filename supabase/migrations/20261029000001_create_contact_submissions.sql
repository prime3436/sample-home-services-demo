create table if not exists public.contact_submissions (
  request_id uuid primary key,
  name text not null check (char_length(btrim(name)) between 2 and 80),
  email text not null check (char_length(btrim(email)) between 3 and 254),
  message text not null check (char_length(btrim(message)) between 10 and 1000),
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;
alter table public.contact_submissions force row level security;

revoke all on table public.contact_submissions from public;
revoke all on table public.contact_submissions from anon;
revoke all on table public.contact_submissions from authenticated;
grant select, insert on table public.contact_submissions to service_role;

drop policy if exists "deny_anon_select" on public.contact_submissions;
create policy "deny_anon_select"
  on public.contact_submissions
  as restrictive
  for select
  to anon, authenticated
  using (false);

drop policy if exists "deny_anon_insert" on public.contact_submissions;
create policy "deny_anon_insert"
  on public.contact_submissions
  as restrictive
  for insert
  to anon, authenticated
  with check (false);

drop policy if exists "deny_anon_update" on public.contact_submissions;
create policy "deny_anon_update"
  on public.contact_submissions
  as restrictive
  for update
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "deny_anon_delete" on public.contact_submissions;
create policy "deny_anon_delete"
  on public.contact_submissions
  as restrictive
  for delete
  to anon, authenticated
  using (false);
