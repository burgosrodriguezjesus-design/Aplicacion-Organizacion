-- Centro — esquema para el calendario compartido en pareja.
--
-- Cómo usarlo: entra en tu proyecto de Supabase -> "SQL Editor" -> "New query",
-- pega TODO este archivo y pulsa "Run". Solo hay que hacerlo una vez.
--
-- Qué crea:
--   profiles         un perfil público mínimo por usuario (nombre, emoji)
--   couples          un "espacio de pareja" con un código de invitación
--   couple_members   quién pertenece a cada espacio (máximo 2 personas)
--   shared_events    los eventos del calendario compartido
-- Y activa Row Level Security (RLS) en todas las tablas: cada persona solo
-- puede ver y modificar los datos de su propio espacio de pareja, nunca los
-- de otras parejas.

-- ============ PROFILES ============

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Yo',
  avatar_emoji text not null default '🙂',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ============ COUPLES ============

-- created_by / user_id point to public.profiles (not auth.users directly) so
-- that Supabase can auto-join "who created this" in queries from the app.
-- profiles.id is always kept in sync with auth.users.id (see the trigger below).
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.couples enable row level security;

-- ============ COUPLE_MEMBERS ============

create table if not exists public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id),
  -- una persona solo puede estar en un espacio de pareja a la vez
  unique (user_id)
);

alter table public.couple_members enable row level security;

-- Un espacio de pareja no puede tener más de 2 personas.
create or replace function public.check_couple_capacity()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.couple_members where couple_id = new.couple_id) >= 2 then
    raise exception 'Este espacio de pareja ya tiene 2 miembros';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_couple_capacity on public.couple_members;
create trigger enforce_couple_capacity
  before insert on public.couple_members
  for each row execute procedure public.check_couple_capacity();

-- ============ SHARED_EVENTS ============

create table if not exists public.shared_events (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  title text not null,
  date date not null,
  start_time text not null default '09:00',
  end_time text not null default '10:00',
  location text not null default '',
  notes text not null default '',
  color text not null default '#ec4899',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shared_events enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shared_events_set_updated_at on public.shared_events;
create trigger shared_events_set_updated_at
  before update on public.shared_events
  for each row execute procedure public.set_updated_at();

-- ============ PERFIL AUTOMÁTICO AL REGISTRARSE ============

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Yo'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============ UNIRSE A UN ESPACIO CON UN CÓDIGO ============
-- Se ejecuta con privilegios elevados (security definer) porque, por
-- privacidad, nadie puede leer la tabla "couples" directamente para buscar
-- un código — así se evita que alguien pueda enumerar espacios de otras
-- parejas. Esta función es la única puerta de entrada para unirse.

create or replace function public.join_couple(code text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  target_couple_id uuid;
  member_count int;
begin
  select id into target_couple_id from public.couples where invite_code = upper(code);
  if target_couple_id is null then
    raise exception 'Código no válido';
  end if;

  select count(*) into member_count from public.couple_members where couple_id = target_couple_id;
  if member_count >= 2 then
    raise exception 'Este espacio ya tiene dos personas';
  end if;

  if exists (
    select 1 from public.couple_members
    where couple_id = target_couple_id and user_id = auth.uid()
  ) then
    raise exception 'Ya estás en este espacio';
  end if;

  insert into public.couple_members (couple_id, user_id) values (target_couple_id, auth.uid());
  return target_couple_id;
end;
$$;

grant execute on function public.join_couple(text) to authenticated;

-- ============ POLÍTICAS DE ACCESO (RLS) ============

-- profiles: tú y la persona con la que compartes espacio os podéis ver.
drop policy if exists "profiles select" on public.profiles;
create policy "profiles select" on public.profiles
  for select using (
    id = auth.uid()
    or id in (
      select cm2.user_id from public.couple_members cm1
      join public.couple_members cm2 on cm2.couple_id = cm1.couple_id
      where cm1.user_id = auth.uid()
    )
  );

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (id = auth.uid());

-- couples: solo lo ven sus miembros (para unirse se usa join_couple, no select directo).
drop policy if exists "couples select if member" on public.couples;
create policy "couples select if member" on public.couples
  for select using (
    id in (select couple_id from public.couple_members where user_id = auth.uid())
  );

drop policy if exists "couples insert own" on public.couples;
create policy "couples insert own" on public.couples
  for insert with check (auth.uid() = created_by);

-- couple_members: ver la lista de tu propio espacio; entrar/salir como tú mismo.
drop policy if exists "couple_members select" on public.couple_members;
create policy "couple_members select" on public.couple_members
  for select using (
    couple_id in (select couple_id from public.couple_members where user_id = auth.uid())
  );

drop policy if exists "couple_members insert self" on public.couple_members;
create policy "couple_members insert self" on public.couple_members
  for insert with check (user_id = auth.uid());

drop policy if exists "couple_members delete self" on public.couple_members;
create policy "couple_members delete self" on public.couple_members
  for delete using (user_id = auth.uid());

-- shared_events: solo los miembros del espacio pueden ver/crear/editar/borrar.
drop policy if exists "shared_events select" on public.shared_events;
create policy "shared_events select" on public.shared_events
  for select using (
    couple_id in (select couple_id from public.couple_members where user_id = auth.uid())
  );

drop policy if exists "shared_events insert" on public.shared_events;
create policy "shared_events insert" on public.shared_events
  for insert with check (
    created_by = auth.uid()
    and couple_id in (select couple_id from public.couple_members where user_id = auth.uid())
  );

drop policy if exists "shared_events update" on public.shared_events;
create policy "shared_events update" on public.shared_events
  for update using (
    couple_id in (select couple_id from public.couple_members where user_id = auth.uid())
  );

drop policy if exists "shared_events delete" on public.shared_events;
create policy "shared_events delete" on public.shared_events
  for delete using (
    couple_id in (select couple_id from public.couple_members where user_id = auth.uid())
  );

-- ============ TIEMPO REAL ============
-- Así, cuando tu pareja añada o cambie un evento, a ti te aparece al momento.

alter publication supabase_realtime add table public.shared_events;
