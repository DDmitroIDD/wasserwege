-- RLS audit for wasserwege. Run MANUALLY in Supabase Dashboard -> SQL Editor.
-- SQL Editor shows only the LAST statement's result: select ONE block and press "Run selected".
-- All blocks are read-only. Blocks 6 uses a transaction that is rolled back.

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

-- 6. Behavioural test as anon: SELECT counts (no data is modified).
-- Expected: submitted_points = 0 (or permission denied), access_points / custom_waterways = real counts.
BEGIN;
SET LOCAL ROLE anon;
SELECT 'submitted_points' AS t, count(*) FROM public.submitted_points
UNION ALL SELECT 'access_points', count(*) FROM public.access_points
UNION ALL SELECT 'custom_waterways', count(*) FROM public.custom_waterways;
ROLLBACK;

-- 7. Privileges NOT protected by RLS (read-only check, modifies nothing).
-- Expected: can_truncate = false, can_trigger = false, can_references = false for anon AND authenticated.
SELECT t.table_name, r.role_name,
       has_table_privilege(r.role_name, 'public.' || t.table_name, 'TRUNCATE')   AS can_truncate,
       has_table_privilege(r.role_name, 'public.' || t.table_name, 'TRIGGER')    AS can_trigger,
       has_table_privilege(r.role_name, 'public.' || t.table_name, 'REFERENCES') AS can_references
FROM (VALUES ('submitted_points'),('access_points'),('custom_waterways')) AS t(table_name)
CROSS JOIN (VALUES ('anon'),('authenticated')) AS r(role_name)
ORDER BY t.table_name, r.role_name;

-- 8. Storage policies (bucket point-photos)
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY cmd, policyname;
