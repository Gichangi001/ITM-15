-- Experience Transformation Slice 8 — makes the journey's country
-- name/flag/tagline admin-editable, closing the gap where
-- src/content/journey.ts was the only source of truth (brief §8: "admin
-- can... Change country copy"). Merged into the existing `tokens` jsonb
-- (no schema change — same flexible-column pattern as every other theme
-- extension) rather than new columns, since these are content fields an
-- admin edits the same way they'd edit a color token.
update public.themes set tokens = tokens || '{"countryName":"DRC","countryFlag":"🇨🇩","tagline":"Where Our Story Begins"}'::jsonb where key = 'journey_drc';
update public.themes set tokens = tokens || '{"countryName":"Kenya","countryFlag":"🇰🇪","tagline":"Build the Future","dayNumber":1}'::jsonb where key = 'journey_kenya';
update public.themes set tokens = tokens || '{"countryName":"Senegal","countryFlag":"🇸🇳","tagline":"Teranga","dayNumber":2}'::jsonb where key = 'journey_senegal';
update public.themes set tokens = tokens || '{"countryName":"Tanzania","countryFlag":"🇹🇿","tagline":"Umoja & Horizons","dayNumber":3}'::jsonb where key = 'journey_tanzania';
update public.themes set tokens = tokens || '{"countryName":"Uganda","countryFlag":"🇺🇬","tagline":"The Pearl — Discover More","dayNumber":4}'::jsonb where key = 'journey_uganda';
update public.themes set tokens = tokens || '{"countryName":"Nigeria","countryFlag":"🇳🇬","tagline":"Energy Without Limits","dayNumber":5}'::jsonb where key = 'journey_nigeria';
update public.themes set tokens = tokens || '{"countryName":"South Africa","countryFlag":"🇿🇦","tagline":"Ubuntu & Possibility","dayNumber":6}'::jsonb where key = 'journey_south_africa';
update public.themes set tokens = tokens || '{"countryName":"Benin","countryFlag":"🇧🇯","tagline":"Heritage Meets Tomorrow","dayNumber":7}'::jsonb where key = 'journey_benin';
update public.themes set tokens = tokens || '{"countryName":"Kinshasa, DRC","countryFlag":"🇨🇩","tagline":"One ITM. One Story. Fifteen Years."}'::jsonb where key = 'journey_kinshasa';
