-- Product Guide §12.1: "challenge-submissions - private by default" storage
-- bucket for PHOTO_UPLOAD evidence.
--
-- Design: objects are stored under a path prefixed with the uploader's own
-- auth uid (e.g. "{uid}/{submissionId}.jpg") — enforced by the INSERT
-- policy below via storage.foldername(name). Only the uploader can read
-- their own object directly; the moderation queue (Phase 10) reads via the
-- service-role admin client instead (same pattern as every other
-- cross-user admin read in this project), and the public gallery (Phase
-- 10) never reads storage.objects directly — it goes through a server
-- action that mints a short-lived signed URL only for submissions that are
-- already APPROVED, so "unapproved media never appears on public/event
-- surfaces" (Product Guide §26 Phase 10 acceptance) holds even though the
-- bucket itself is not public.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'challenge-submissions',
  'challenge-submissions',
  false,
  10485760, -- 10 MB — Product Guide §24.3 "Maximum file sizes"
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- A player may upload only into a folder named after their own uid —
-- prevents uploading into another player's namespace or an arbitrary path.
create policy "players can upload their own challenge evidence"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'challenge-submissions'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- A player may read only their own uploaded evidence (e.g. to preview it
-- after submitting) — never another player's.
create policy "players can read their own challenge evidence"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'challenge-submissions'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- No update/delete policy: evidence is append-only once submitted, matching
-- the submissions table having no client-facing UPDATE policy either.
