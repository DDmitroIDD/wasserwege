-- APPLIED MANUALLY via Supabase (apply_migration: private_point_photos_photo_path). Kept here for the record.
-- For a fresh project: run in Supabase Dashboard -> SQL Editor BEFORE deploying the matching code.
-- The existing policy anon_upload_photos (INSERT for anon on point-photos) is left untouched.

begin;

-- 1. Bucket -> private
update storage.buckets set public = false where id = 'point-photos';

-- 2. Columns: store the object path, not a public URL
alter table public.submitted_points rename column photo_url to photo_path;
alter table public.access_points    rename column photo_url to photo_path;

-- 3. Read access to bucket objects only for authenticated (moderator); required for createSignedUrl
create policy "point-photos auth select"
  on storage.objects for select to authenticated
  using (bucket_id = 'point-photos');

commit;

-- Rollback:
-- update storage.buckets set public = true where id = 'point-photos';
-- alter table public.submitted_points rename column photo_path to photo_url;
-- alter table public.access_points    rename column photo_path to photo_url;
-- drop policy "point-photos auth select" on storage.objects;
