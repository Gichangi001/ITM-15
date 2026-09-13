-- Applied live via mcp__supabase__apply_migration on 2026-09-13 in response
-- to a real finding from mcp__supabase__get_advisors(type: "performance"):
-- "Unindexed foreign keys" — public.wally_dialogues.created_by and
-- public.wally_events.created_by (both referencing auth.users) were missed
-- in the original migration review's FK-indexing pass.
--
-- Low-traffic columns today (only matters for a future "who authored this
-- dialogue/event" admin view), but free to add now and correct to fix
-- rather than leave a known advisor finding unaddressed.
create index wally_dialogues_created_by_idx on public.wally_dialogues (created_by);
create index wally_events_created_by_idx on public.wally_events (created_by);
