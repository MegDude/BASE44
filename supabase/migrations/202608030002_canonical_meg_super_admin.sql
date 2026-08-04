begin;

insert into public.account_assignments (email, platform_role, protected_account)
values ('meg@megdude.com', 'super_admin', true)
on conflict (email) do update
set platform_role = 'super_admin',
    partner_id = null,
    partner_role = null,
    protected_account = true,
    updated_at = now();

update public.platform_profiles
set platform_role = 'super_admin',
    is_super_admin = true,
    protected_account = true,
    updated_at = now()
where lower(email) = 'meg@megdude.com';

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('platform_role', 'super_admin', 'is_super_admin', true, 'partner_id', null)
where lower(email) = 'meg@megdude.com';

commit;
