create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  type text not null default '',
  category text not null check (category in ('Medicine', 'Skincare', 'Wellness')),
  price numeric(10, 2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image text not null default '',
  prescription_required boolean not null default false,
  old_price numeric(10, 2),
  badge text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products" on public.products for select using (true);

drop policy if exists "Public can manage products" on public.products;
drop policy if exists "Admin can insert products" on public.products;
drop policy if exists "Admin can update products" on public.products;
drop policy if exists "Admin can delete products" on public.products;
create policy "Admin can insert products" on public.products for insert with check (auth.role() = 'authenticated' and lower(auth.jwt() ->> 'email') = 'arshpinchoo859@gmail.com');
create policy "Admin can update products" on public.products for update using (auth.role() = 'authenticated' and lower(auth.jwt() ->> 'email') = 'arshpinchoo859@gmail.com') with check (auth.role() = 'authenticated' and lower(auth.jwt() ->> 'email') = 'arshpinchoo859@gmail.com');
create policy "Admin can delete products" on public.products for delete using (auth.role() = 'authenticated' and lower(auth.jwt() ->> 'email') = 'arshpinchoo859@gmail.com');

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images" on storage.objects for select using (bucket_id = 'product-images');

drop policy if exists "Public can upload product images" on storage.objects;
create policy "Public can upload product images" on storage.objects for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated' and lower(auth.jwt() ->> 'email') = 'arshpinchoo859@gmail.com');

drop policy if exists "Public can update product images" on storage.objects;
create policy "Public can update product images" on storage.objects for update using (bucket_id = 'product-images' and auth.role() = 'authenticated' and lower(auth.jwt() ->> 'email') = 'arshpinchoo859@gmail.com');

drop policy if exists "Public can delete product images" on storage.objects;
create policy "Public can delete product images" on storage.objects for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated' and lower(auth.jwt() ->> 'email') = 'arshpinchoo859@gmail.com');
