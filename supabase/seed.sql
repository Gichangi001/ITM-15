-- ITM@15 — local development seed data
--
-- Development-only. Never seed real employee names/emails/photos here
-- (runbook §41 / Product Guide §2.1). Country/entity/campaign data below is
-- non-sensitive reference data, not personal data.
--
-- UNVERIFIED — see the header comment in
-- supabase/migrations/20260912230000_init_foundation.sql for why this
-- hasn't been run against a real database yet.

insert into public.countries (name, iso_code, flag_emoji) values
  ('Kenya', 'KE', '🇰🇪'),
  ('Senegal', 'SN', '🇸🇳'),
  ('Benin', 'BJ', '🇧🇯'),
  ('Burundi', 'BI', '🇧🇮'),
  ('DR Congo', 'CD', '🇨🇩')
on conflict (iso_code) do nothing;

insert into public.campaigns (name, slug, status) values
  ('ITM@15', 'itm-15', 'DRAFT')
on conflict (slug) do nothing;

-- Wally placeholder image assets, sourced from MASCOTTE.zip (see
-- src/wally/rendering/assets.ts for the full registry and the spec-vs-art
-- reconciliation note). storage_path currently points at the Next.js
-- public/ path, NOT Supabase Storage — the wally-assets bucket
-- (Product Guide §12.1) doesn't exist yet. Update storage_path once these
-- are actually uploaded to that bucket; don't treat this as done until then.
insert into public.wally_assets (asset_type, key, storage_path, quality_tier) values
  ('IMAGE_2D', 'normal', '/wally/normal.webp', 'LITE'),
  ('IMAGE_2D', 'open-arms', '/wally/open-arms.webp', 'LITE'),
  ('IMAGE_2D', 'stop', '/wally/stop.webp', 'LITE'),
  ('IMAGE_2D', 'investigate', '/wally/investigate.webp', 'LITE'),
  ('IMAGE_2D', 'lean-clock', '/wally/lean-clock.webp', 'LITE'),
  ('IMAGE_2D', 'tired-sitting', '/wally/tired-sitting.webp', 'LITE'),
  ('IMAGE_2D', 'sleeping', '/wally/sleeping.webp', 'LITE'),
  ('IMAGE_2D', 'dance-pose', '/wally/dance-pose.webp', 'LITE')
on conflict (key) do nothing;
