-- Initial company provisioning needs to bypass RLS because a newly created user
-- does not have a company membership yet. The helper is private and accepts the
-- actor ID only from trusted database callers; the public wrapper derives it from
-- auth.uid().
create schema if not exists private;

create or replace function private.create_company_for_user(
  p_user_id uuid,
  p_legal_name text,
  p_internal_name text,
  p_display_name text,
  p_public_slug text,
  p_default_timezone text default 'America/Bogota'
)
returns table (company_id uuid, public_slug text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_company_id uuid;
  v_legal_name text := btrim(p_legal_name);
  v_internal_name text := btrim(p_internal_name);
  v_display_name text := btrim(p_display_name);
  v_public_slug text := lower(btrim(p_public_slug));
  v_timezone text := btrim(coalesce(p_default_timezone, 'America/Bogota'));
begin
  if p_user_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  if v_legal_name = '' or v_internal_name = '' or v_display_name = '' then
    raise exception using errcode = '22023', message = 'company_name_required';
  end if;

  if v_public_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception using errcode = '22023', message = 'invalid_company_slug';
  end if;

  insert into public.companies (legal_name, internal_name, default_timezone, created_by)
  values (v_legal_name, v_internal_name, v_timezone, p_user_id)
  returning id into v_company_id;

  insert into public.company_branding (company_id, public_slug, display_name)
  values (v_company_id, v_public_slug, v_display_name);

  insert into public.company_members (company_id, user_id, role, status, joined_at)
  values (v_company_id, p_user_id, 'owner', 'active', now());

  insert into public.activity_logs (
    company_id,
    actor_user_id,
    actor_type,
    entity_type,
    entity_id,
    action,
    metadata
  )
  values (
    v_company_id,
    p_user_id,
    'user',
    'company',
    v_company_id,
    'company.created',
    jsonb_build_object('source', 'self_registration')
  );

  update public.profiles
  set onboarding_completed_at = coalesce(onboarding_completed_at, now()), updated_at = now()
  where id = p_user_id;

  return query select v_company_id, v_public_slug;
exception
  when unique_violation then
    raise exception using errcode = '23505', message = 'company_slug_unavailable';
end;
$$;

revoke all on function private.create_company_for_user(uuid, text, text, text, text, text) from public;

-- The public RPC remains available for an authenticated onboarding flow. It has
-- no caller-controlled authorization fields and uses a fixed search path.
create or replace function public.create_company(
  p_legal_name text,
  p_internal_name text,
  p_display_name text,
  p_public_slug text,
  p_default_timezone text default 'America/Bogota'
)
returns table (company_id uuid, public_slug text)
language plpgsql
security definer
set search_path = private, public, pg_temp
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  return query
  select *
  from private.create_company_for_user(
    v_user_id,
    p_legal_name,
    p_internal_name,
    p_display_name,
    p_public_slug,
    p_default_timezone
  );
end;
$$;

revoke all on function public.create_company(text, text, text, text, text) from public;
grant execute on function public.create_company(text, text, text, text, text) to authenticated;

-- Email confirmation is enabled in this project, so signUp does not provide a
-- session in which to call the RPC. Provision the initial tenant in the same
-- transaction that creates auth.users, using only the registration metadata.
create or replace function private.provision_initial_company_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = private, public, pg_temp
as $$
declare
  v_company_name text := btrim(coalesce(new.raw_user_meta_data ->> 'onboarding_company_name', ''));
  v_company_slug text := lower(btrim(coalesce(new.raw_user_meta_data ->> 'onboarding_company_slug', '')));
begin
  if v_company_name = '' or v_company_slug = '' then
    raise exception using errcode = '22023', message = 'onboarding_company_required';
  end if;

  perform 1
  from private.create_company_for_user(
    new.id,
    v_company_name,
    v_company_name,
    v_company_name,
    v_company_slug
  );

  return new;
end;
$$;

revoke all on function private.provision_initial_company_for_new_user() from public;

drop trigger if exists on_auth_user_created_provision_initial_company on auth.users;
create trigger on_auth_user_created_provision_initial_company
after insert on auth.users
for each row execute function private.provision_initial_company_for_new_user();
