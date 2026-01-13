-- Enable Realtime for daily_logs and profiles tables
-- This allows the UI to update automatically when data changes in the database

begin;
  -- Remove the tables from publication if they already exist (to avoid errors)
  alter publication supabase_realtime drop table if exists public.daily_logs;
  alter publication supabase_realtime drop table if exists public.profiles;

  -- Add the tables to the supabase_realtime publication
  alter publication supabase_realtime add table public.daily_logs;
  alter publication supabase_realtime add table public.profiles;
commit;
