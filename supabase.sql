-- Изоҳлар жадвали. Supabase → SQL Editor'га бутунлигича ёпиштириб, Run босинг.
-- Қоида: ҳамма изоҳ ёза олади, лекин фақат тасдиқланганлари (approved = true) кўринади.

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 40),
  text text not null check (char_length(text) between 1 and 400),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

-- ҳамма фақат тасдиқланган изоҳларни ўқийди
drop policy if exists "read approved comments" on public.comments;
create policy "read approved comments" on public.comments
  for select to anon, authenticated
  using (approved = true);

-- ҳамма янги изоҳ қўша олади, лекин у ҳар доим «тасдиқланмаган» бўлиб тушади
drop policy if exists "send comment" on public.comments;
create policy "send comment" on public.comments
  for insert to anon, authenticated
  with check (approved = false);

grant select (id, name, text, created_at, approved) on public.comments to anon, authenticated;
grant insert (name, text) on public.comments to anon, authenticated;

-- Тасдиқлаш: Supabase → Table Editor → comments → керакли қаторда approved ни true қилинг.
-- Ўчириш: шу жадвалда қаторни ўчиринг.
