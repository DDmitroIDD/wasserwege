# wasserwege
Kayak routes app for Hamburg canals - MVP (map, launch points, OSM)

## RLS Audit

App authorization relies entirely on Supabase RLS policies, which are NOT stored in this repo.
Check them manually after every change in the Dashboard.

### How to run
1. Supabase Dashboard -> SQL Editor -> New query.
2. Paste ONE numbered block from `scripts/rls-audit.sql` (the editor shows only the last result).
3. Run it. Block 6 may trigger a "make sure you are not accidentally removing something important" warning because of ROLLBACK; it modifies nothing.
4. Compare the output with `scripts/rls-expected.md`.

### What to check
- Block 1: policies match `scripts/rls-expected.md`.
- Block 2: `rowsecurity = true` for all three tables.
- Block 3: 0 rows (no public table without RLS).
- Block 4/5: no write policies for anon except INSERT on `submitted_points`.
- Block 6: anon sees 0 rows in `submitted_points`.
- Block 7: `can_truncate`, `can_trigger`, `can_references` are all false.
- Block 8: `point-photos` is not writable by anon beyond what the form needs.

### On mismatch
1. Do not deploy anything else until fixed.
2. Fix manually in Dashboard -> Authentication -> Policies (or SQL Editor).
3. Re-run the failed block, then block 6.
4. Check that the map, the submission form and the admin panel still work.
