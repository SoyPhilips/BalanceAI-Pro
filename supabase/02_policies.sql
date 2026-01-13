-- PROFILES POLICIES
-- Users can view their own profile
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

-- Users can insert their own profile
create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

-- Users can update own profile
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- FOODS POLICIES
-- Everyone can read global foods (created_by is null)
create policy "Global foods are viewable by everyone"
  on foods for select
  using ( created_by is null );

-- Users can read their own custom foods
create policy "Users can view own custom foods"
  on foods for select
  using ( auth.uid() = created_by );

-- Users can create their own foods
create policy "Users can create custom foods"
  on foods for insert
  with check ( auth.uid() = created_by );

-- Users can update their own custom foods
create policy "Users can update own custom foods"
  on foods for update
  using ( auth.uid() = created_by );

-- Users can delete their own custom foods
create policy "Users can delete own custom foods"
  on foods for delete
  using ( auth.uid() = created_by );

-- RECIPES POLICIES
-- Everyone can read recipes
create policy "Recipes are viewable by everyone"
  on recipes for select
  using ( true );

-- DAILY_LOGS POLICIES
-- Users can view their own logs
create policy "Users can view own logs"
  on daily_logs for select
  using ( auth.uid() = user_id );

-- Users can insert their own logs
create policy "Users can insert own logs"
  on daily_logs for insert
  with check ( auth.uid() = user_id );

-- Users can delete their own logs
create policy "Users can delete own logs"
  on daily_logs for delete
  using ( auth.uid() = user_id );

-- TRIGGER FOR NEW USERS
-- Automatically create a profile entry when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
