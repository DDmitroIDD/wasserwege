# Expected RLS behaviour

Legend: ALLOW = operation succeeds, DENY = 0 rows / permission denied / RLS violation.

Based on what admin.html actually does: it SELECTs and UPDATEs `submitted_points` (status change),
and does full CRUD on `access_points` and `custom_waterways`. It never INSERTs or DELETEs `submitted_points`.

| Table | Role | Operation | Expected |
|---|---|---|---|
| submitted_points | anon | INSERT | ALLOW only with status = 'pending' (submission form) |
| submitted_points | anon | SELECT | DENY |
| submitted_points | anon | UPDATE | DENY |
| submitted_points | anon | DELETE | DENY |
| submitted_points | authenticated | SELECT | ALLOW |
| submitted_points | authenticated | UPDATE | ALLOW (moderation: approve / reject) |
| submitted_points | authenticated | INSERT | DENY (not used by the app) |
| submitted_points | authenticated | DELETE | DENY (not used by the app) |
| access_points | anon | SELECT | ALLOW (map) |
| access_points | anon | INSERT | DENY |
| access_points | anon | UPDATE | DENY |
| access_points | anon | DELETE | DENY |
| access_points | authenticated | SELECT | ALLOW |
| access_points | authenticated | INSERT | ALLOW |
| access_points | authenticated | UPDATE | ALLOW |
| access_points | authenticated | DELETE | ALLOW |
| custom_waterways | anon | SELECT | ALLOW |
| custom_waterways | anon | INSERT | DENY |
| custom_waterways | anon | UPDATE | DENY |
| custom_waterways | anon | DELETE | DENY |
| custom_waterways | authenticated | SELECT | ALLOW |
| custom_waterways | authenticated | INSERT | ALLOW |
| custom_waterways | authenticated | UPDATE | ALLOW |
| custom_waterways | authenticated | DELETE | ALLOW |

Also expected: RLS enabled on all three tables; no public table without RLS;
no TRUNCATE / TRIGGER / REFERENCES privileges for anon and authenticated.

## Known weakness of this model
`authenticated` = ANY logged-in Supabase user, not only the moderator.
If public sign-ups are enabled (Auth -> Sign In / Providers -> "Allow new users to sign up"),
anyone can register and get full CRUD. Either disable sign-ups or restrict policies to a specific user, e.g.
`auth.uid() = '<moderator-uuid>'` (must be done manually in Dashboard).
