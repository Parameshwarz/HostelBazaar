-- Products table
create table products (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references auth.users(id),
  title text not null,
  description text,
  price decimal(10,2) not null,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  stock_quantity integer not null default 0,
  is_active boolean default true
);

-- Product Images table
create table product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product Variants (for different sizes/colors)
create table product_variants (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  size text,
  color text,
  stock_quantity integer not null default 0,
  price_adjustment decimal(10,2) default 0
);

-- Reviews table
create table product_reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  user_id uuid references auth.users(id),
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cart table
create table cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  quantity integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table product_reviews enable row level security;
alter table cart_items enable row level security;

-- Products policies
create policy "Products are viewable by everyone"
  on products for select
  using (true);

create policy "Products are insertable by authenticated users"
  on products for insert
  with check (auth.uid() = seller_id);

create policy "Products are updatable by seller"
  on products for update
  using (auth.uid() = seller_id);

-- Similar policies for other tables... 