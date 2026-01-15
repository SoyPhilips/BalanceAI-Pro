-- 1. PROFILES TABLE
-- Linked to auth.users to store additional user data
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  goal text,
  gender text,
  age int,
  height numeric,
  weight numeric,
  desired_weight numeric,
  pace text,
  daily_calories_target int,
  photo_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. FOODS TABLE
-- Stores both global foods (created_by is null) and user-custom foods
create table public.foods (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  calories int not null,
  protein numeric default 0,
  carbs numeric default 0,
  fat numeric default 0,
  serving_size text,
  created_by uuid references public.profiles(id), -- Null for global foods
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. RECIPES TABLE (Suggestions)
-- Stores curated recipes with ingredients
create table public.recipes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  category text, -- 'breakfast', 'lunch', 'dinner', 'snack'
  calories int not null,
  protein numeric default 0,
  carbs numeric default 0,
  fat numeric default 0,
  ingredients jsonb, -- List of ingredients e.g. ["2 eggs", "1 slice bread"]
  instructions text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. DAILY_LOGS TABLE
-- Stores what users eat each day
create table public.daily_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  date date default CURRENT_DATE,
  meal_type text not null, -- 'breakfast', 'lunch', 'dinner', 'snack'
  food_name text not null,
  calories int not null,
  protein numeric default 0,
  carbs numeric default 0,
  fat numeric default 0,
  healthy_tips text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.foods enable row level security;
alter table public.recipes enable row level security;
alter table public.daily_logs enable row level security;
