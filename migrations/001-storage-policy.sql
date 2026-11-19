-- ВЫПОЛНИТЬ ВРУЧНУЮ В SUPABASE DASHBOARD (SQL Editor) или через apply_migration.
-- Не запускается автоматически. Выполнять ДО мержа PR с изменениями accessPoints.js/admin.html.
-- На момент написания photo_url пуст в обеих таблицах (проверено), миграция данных не нужна.
-- Уже существует политика anon_upload_photos (INSERT для anon на point-photos) — не трогаем.

begin;

-- 1. Бакет -> private
update storage.buckets set public = false where id = 'point-photos';

-- 2. Колонки: хранится путь объекта, а не публичный URL
alter table public.submitted_points rename column photo_url to photo_path;
alter table public.access_points    rename column photo_url to photo_path;

-- 3. Чтение объектов бакета только для authenticated (модератор), нужно для createSignedUrl
create policy "point-photos auth select"
  on storage.objects for select to authenticated
  using (bucket_id = 'point-photos');

commit;

-- Откат:
-- update storage.buckets set public = true where id = 'point-photos';
-- alter table public.submitted_points rename column photo_path to photo_url;
-- alter table public.access_points    rename column photo_path to photo_url;
-- drop policy "point-photos auth select" on storage.objects;
