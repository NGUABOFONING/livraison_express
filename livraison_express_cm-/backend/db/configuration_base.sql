-- USERS
create table users (
  id uuid primary key default gen_random_uuid(),
  phone varchar(20) unique not null,
  full_name varchar(100),
  role text check (role in ('client','coursier','admin')),
  created_at timestamp default now()
);

-- DELIVERIES
create table deliveries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references users(id),
  rider_id uuid references users(id),
  pickup_address text,
  delivery_address text,
  price integer,
  status text default'pending' check (status in ('pending','accepted','picked','delivered')),
  created_at timestamp default now()
);

-- PAYMENTS
create table payments (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid references deliveries(id),
  amount integer,
  status text default 'pending',
  created_at timestamp default now()
);

-- RATINGS
create table ratings (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid references deliveries(id),
  rating integer,
  comment text,
  created_at timestamp default now()
);

-- DISPUTES (litiges)
create table disputes (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid references deliveries(id),
  reason text,
  status text default 'open',
  created_at timestamp default now()
);
