-- Function to allow users to delete their own account and all associated data
-- This must be run in the Supabase SQL Editor

create or replace function delete_user()
returns void
language plpgsql
security definer
as $$
declare
  requesting_user_id uuid;
begin
  -- Get the ID of the currently authenticated user
  requesting_user_id := auth.uid();

  -- 1. Delete from daily_logs
  delete from public.daily_logs where user_id = requesting_user_id;

  -- 2. Delete from foods (custom foods created by user)
  delete from public.foods where created_by = requesting_user_id;

  -- 3. Delete from profiles
  delete from public.profiles where id = requesting_user_id;

  -- 4. Finally delete the user from auth.users
  delete from auth.users where id = requesting_user_id;
end;
$$;
