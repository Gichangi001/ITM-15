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
