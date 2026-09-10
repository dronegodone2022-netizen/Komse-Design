-- Run this migration after the initial KOMSE Supabase schema.

alter table public.products
  add column if not exists product_data jsonb;

drop policy if exists "Anyone can view products" on public.products;
create policy "Anyone can view products"
on public.products for select
using (true);

alter table public.orders
  add column if not exists items_count integer not null default 0,
  add column if not exists items_summary text not null default '';

-- Create profiles securely during signup, including when email confirmation is enabled.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'Customer',
    'Active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Prevent duplicate profile identities, regardless of letter case or extra spaces.
create unique index if not exists profiles_email_unique_ci
on public.profiles (lower(trim(email)));

create unique index if not exists profiles_name_unique_ci
on public.profiles (lower(regexp_replace(trim(name), E'\\s+', ' ', 'g')));

create or replace function public.check_registration_availability(requested_email text, requested_name text)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'email_taken', exists (
      select 1 from public.profiles
      where lower(trim(email)) = lower(trim(requested_email))
    ),
    'name_taken', exists (
      select 1 from public.profiles
      where lower(regexp_replace(trim(name), E'\\s+', ' ', 'g')) = lower(regexp_replace(trim(requested_name), E'\\s+', ' ', 'g'))
    )
  );
$$;

revoke all on function public.check_registration_availability(text, text) from public;
grant execute on function public.check_registration_availability(text, text) to anon, authenticated;

-- Keep customer order access limited to the authenticated owner.
drop policy if exists "Users can create their own orders" on public.orders;
create policy "Users can create their own orders"
on public.orders for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own orders" on public.orders;
create policy "Users can delete their own orders"
on public.orders for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders"
on public.orders for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can create reproduction requests" on public.reproduction_requests;
create policy "Users can create reproduction requests"
on public.reproduction_requests for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can view their reproduction requests" on public.reproduction_requests;
create policy "Users can view their reproduction requests"
on public.reproduction_requests for select
using (auth.uid() = user_id);

drop policy if exists "Users can update their reproduction requests" on public.reproduction_requests;
create policy "Users can update their reproduction requests"
on public.reproduction_requests for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their reproduction requests" on public.reproduction_requests;
create policy "Users can delete their reproduction requests"
on public.reproduction_requests for delete
using (auth.uid() = user_id);

-- Admin access is controlled by the role stored on the user's profile.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'Admin'
      and profiles.status = 'Active'
  );
$$;

drop policy if exists "Admins can manage all profiles" on public.profiles;
create policy "Admins can manage all profiles"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage all products" on public.products;
create policy "Admins can manage all products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage all orders" on public.orders;
create policy "Admins can manage all orders"
on public.orders for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage all order items" on public.order_items;
create policy "Admins can manage all order items"
on public.order_items for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage all reproduction requests" on public.reproduction_requests;
create policy "Admins can manage all reproduction requests"
on public.reproduction_requests for all
using (public.is_admin())
with check (public.is_admin());

-- Private avatar bucket policies. Files are stored under the authenticated user's ID.
drop policy if exists "Users can upload their avatar" on storage.objects;
create policy "Users can upload their avatar"
on storage.objects for insert
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can update their avatar" on storage.objects;
create policy "Users can update their avatar"
on storage.objects for update
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can delete their avatar" on storage.objects;
create policy "Users can delete their avatar"
on storage.objects for delete
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can read their avatar" on storage.objects;
create policy "Users can read their avatar"
on storage.objects for select
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
