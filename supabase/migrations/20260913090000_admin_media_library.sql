-- Product Guide §12.4 — Admin Media Library (the one remaining Phase 10 gap
-- per docs/PROJECT_AUDIT_CHECKLIST.md): "Admins must be able to upload and
-- manage: historical photographs, country images, event photos,
-- Walumo/product screenshots, Wally illustrations, backgrounds, audio
-- tracks, short video clips." Distinct from `challenge-submissions`
-- (private, player-uploaded evidence) and from `wally_assets` (the Wally
-- rendering registry) — this is admin-curated general reference media, not
-- user-generated content requiring moderation.
--
-- The `media_assets` table itself already exists (from
-- 20260913080000_content_submission_scoring_voting.sql), RLS-enabled with
-- a public-read policy already granted — nothing to change there. What was
-- missing is a storage bucket for admins to actually put files into.
--
-- Public bucket, not policy-gated reads: general reference media (a
-- historical photo, a background) is meant to be shown publicly (gallery,
-- spectator screen, landing page), so a public bucket serves reads without
-- needing per-object RLS policies. Writes go through a server action using
-- the service role (same pattern as every other admin write in this
-- project) — no client-facing storage INSERT policy exists, so there's
-- nothing here for a non-admin to exploit even by discovering the bucket
-- name.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'admin-media',
  'admin-media',
  true,
  20971520, -- 20 MB — larger than challenge-submissions' 10MB since this
            -- covers video/audio, not just photos
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'audio/mpeg', 'audio/wav']
)
on conflict (id) do nothing;
