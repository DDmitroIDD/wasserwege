-- RLS audit for wasserwege. Run MANUALLY in Supabase Dashboard -> SQL Editor.
-- SQL Editor shows only the LAST statement's result: select ONE block and press "Run selected".
-- All blocks are read-only; the behavioural tests (6-7) run in a transaction that is rolled back.

-- 1. All policies on the app tables
SELECT tablename, policyname, cmd, roles, permissive, qual AS using_expr, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('submitted_points','access_points','custom_waterways')
ORDER BY tablename, cmd, policyname;

-- 2. RLS flag on the app tables (rowsecurity MUST be true)
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('submitted_points','access_points','custom_waterways');

-- 3. ALL public tables WITHOUT RLS (expected: 0 rows)
SELECT n.nspname AS schema, c.relname AS table_name, c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r','p') AND NOT c.relrowsecurity;

-- 4. Table privileges (GRANTs) for anon / authenticated. RLS filters rows, GRANT gates the operation.
SELECT table_name, grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('submitted_points','access_points','custom_waterways')
  AND grantee IN ('anon','authenticated')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- 5. Dangerous policies: anon/public with write commands (except INSERT on submitted_points)
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('submitted_points','access_points','custom_waterways')
  AND cmd IN ('INSERT','UPDATE','DELETE','ALL')
  AND (roles && ARRAY['anon','public']::name[])
  AND NOT (tablename = 'submitted_points' AND cmd = 'INSERT');

-- 6. Behavioural test as anon: SELECT counts.
-- Expected: submitted_points = 0 (or permission denied), access_points / custom_waterways = real counts.
BEGIN;
SET LOCAL ROLE anon;
SELECT 'submitted_points' AS t, count(*) FROM public.submitted_points
UNION ALL SELECT 'access_points', count(*) FROM public.access_points
UNION ALL SELECT 'custom_waterways', count(*) FROM public.custom_waterways;
ROLLBACK;

-- 7. Behavioural test as anon: DELETE (rolled back anyway).
-- Expected: 0 for every table (or "permission denied"). Any number > 0 = CRITICAL hole.
BEGIN;
SET LOCAL ROLE anon;
WITH a AS (DELETE FROM public.access_points RETURNING 1),
     b AS (DELETE FROM public.custom_waterways RETURNING 1),
     c AS (DELETE FROM public.submitted_points RETURNING 1)
SELECT (SELECT count(*) FROM a) AS access_points_deleted,
       (SELECT count(*) FROM b) AS custom_waterways_deleted,
       (SELECT count(*) FROM c) AS submitted_points_deleted;
ROLLBACK;

-- 8. Storage policies (bucket point-photos)
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY cmd, policyname;
