# wasserwege
Kayak routes app for Hamburg canals - MVP (map, launch points, OSM)

## RLS Audit

App authorization relies entirely on Supabase RLS policies, which are NOT stored in this repo.
Check them manually after every change in the Dashboard.

### How to run
1. Supabase Dashboard -> SQL Editor -> New query.
2. Paste `scripts/rls-audit.sql`.
3. Select ONE numbered block and press "Run selected" (the editor shows only the last result).
4. Compare the output with `scripts/rls-expected.md`.

### What to check
- Block 2: `rowsecurity = true` for all three tables.
- Block 3: 0 rows (no public table without RLS).
- Block 4/5: anon has no write privileges/policies except INSERT on `submitted_points`.
- Block 6: anon sees 0 rows in `submitted_points`.
- Block 7: all counters 0 (or "permission denied").
- Block 8: `point-photos` is not writable by anon beyond what the form needs.

### On mismatch
1. Do not deploy anything else until fixed.
2. Fix manually in Dashboard -> Authentication -> Policies (or SQL Editor).
3. Re-run the failed block, then blocks 6-7.
4. Check that the map and the submission form still work.
