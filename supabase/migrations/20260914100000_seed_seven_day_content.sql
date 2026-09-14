-- Real, launch content for all seven days (Product Guide §8's day themes),
-- created via direct data inserts that replicate exactly what
-- createMission/updateMissionStatus/updateGameDayStatus (src/app/admin/
-- missions/{new/,}actions.ts) would produce through the real admin UI —
-- same defaults, same audit_logs entries, same final published state —
-- chosen over driving Playwright through the UI seven times because this
-- is real content whose correctness matters more than exercising the
-- browser form itself (already exhaustively verified live in earlier
-- phases). Attributed to the real Super Admin
-- (alexander.gichangi@walumoafrica.com), not a synthetic test account,
-- since this is real, durable game content, not something to delete
-- after verification.
--
-- One mission per day, deliberately varied across all 4 implemented
-- challenge types (Product Guide §9.3 — only SINGLE_CHOICE,
-- MULTIPLE_CHOICE, FREE_TEXT, PHOTO_UPLOAD exist). Every factual claim
-- either matches this project's own already-approved content (the "8
-- people" origin figure, Walumo's real description from
-- docs/ITM15_FOUNDER_STORY_OPENING_CHAPTER.md) or is an open,
-- non-factual prompt (a personal reflection/memory/connection) — nothing
-- here asserts an unconfirmed real-world fact about ITM, matching the
-- same discipline the Founder Story build applied.

do $$
declare
  v_campaign_id uuid := '9c008b51-f1fa-41df-a304-85084266c034';
  v_admin_id uuid := 'a0c04a9e-b288-434f-9c59-908502620b67';
  v_day1_id uuid := '12a12a17-5caf-43ba-91c3-456a7e59d081';
  v_day2_id uuid;
  v_day3_id uuid;
  v_day4_id uuid;
  v_day5_id uuid;
  v_day6_id uuid;
  v_day7_id uuid;
  v_mission_id uuid;
  v_challenge_id uuid;
begin
  -- Day 1 already exists (created earlier via the app's own get-or-create
  -- logic) — update its title/theme rather than inserting a duplicate.
  update public.game_days
    set title = 'Day 1 — Origin', theme = 'Where ITM began', status = 'LIVE'
    where id = v_day1_id;

  insert into public.game_days (campaign_id, day_number, title, theme, status, created_by)
    values (v_campaign_id, 2, 'Day 2 — One ITM, Many Cultures', 'Cross-country discovery', 'LIVE', v_admin_id)
    returning id into v_day2_id;
  insert into public.game_days (campaign_id, day_number, title, theme, status, created_by)
    values (v_campaign_id, 3, 'Day 3 — The Journey', 'Memories from the road', 'LIVE', v_admin_id)
    returning id into v_day3_id;
  insert into public.game_days (campaign_id, day_number, title, theme, status, created_by)
    values (v_campaign_id, 4, 'Day 4 — The People', 'Recognition and appreciation', 'LIVE', v_admin_id)
    returning id into v_day4_id;
  insert into public.game_days (campaign_id, day_number, title, theme, status, created_by)
    values (v_campaign_id, 5, 'Day 5 — Walumo', 'Building what comes next', 'LIVE', v_admin_id)
    returning id into v_day5_id;
  insert into public.game_days (campaign_id, day_number, title, theme, status, created_by)
    values (v_campaign_id, 6, 'Day 6 — The Alliance', 'Collaboration across borders', 'LIVE', v_admin_id)
    returning id into v_day6_id;
  insert into public.game_days (campaign_id, day_number, title, theme, status, created_by)
    values (v_campaign_id, 7, 'Day 7 — Legacy', 'What we carry forward', 'LIVE', v_admin_id)
    returning id into v_day7_id;

  -- ---------------------------------------------------------------------
  -- Day 1 — SINGLE_CHOICE. Ties directly to the Founder Story's own real
  -- "8" reveal (docs/ITM15_FOUNDER_STORY_OPENING_CHAPTER.md §11-13).
  -- ---------------------------------------------------------------------
  insert into public.missions (game_day_id, title, slug, description, status, base_points, unity_points, is_unity_challenge, created_by)
    values (v_day1_id, 'The Number That Started It All', 'the-number-that-started-it-all', 'Before the countries, before the thousands — there was a very specific number.', 'LIVE', 10, 0, false, v_admin_id)
    returning id into v_mission_id;
  insert into public.challenges (mission_id, type, prompt, order_index)
    values (v_mission_id, 'SINGLE_CHOICE', 'How many people did it take to start ITM in 2011?', 0)
    returning id into v_challenge_id;
  insert into public.challenge_options (challenge_id, label, is_correct, order_index) values
    (v_challenge_id, '8', true, 0),
    (v_challenge_id, '15', false, 1),
    (v_challenge_id, '50', false, 2),
    (v_challenge_id, '200', false, 3);
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata) values
    (v_admin_id, 'mission_created', 'mission', v_mission_id, jsonb_build_object('title', 'The Number That Started It All', 'day_number', 1, 'challenge_type', 'SINGLE_CHOICE')),
    (v_admin_id, 'mission_status_changed', 'mission', v_mission_id, jsonb_build_object('previous_status', 'DRAFT', 'new_status', 'LIVE'));

  -- ---------------------------------------------------------------------
  -- Day 2 — MULTIPLE_CHOICE. Real service areas from the Founder Story's
  -- own copy vs. one obviously-fictional distractor — no risk of
  -- misstating a real, uncertain fact.
  -- ---------------------------------------------------------------------
  insert into public.missions (game_day_id, title, slug, description, status, base_points, unity_points, is_unity_challenge, created_by)
    values (v_day2_id, 'What ITM Actually Builds', 'what-itm-actually-builds', 'Training was only the beginning.', 'LIVE', 10, 0, false, v_admin_id)
    returning id into v_mission_id;
  insert into public.challenges (mission_id, type, prompt, order_index)
    values (v_mission_id, 'MULTIPLE_CHOICE', 'Which of these are real ITM service areas? (select all that apply)', 0)
    returning id into v_challenge_id;
  insert into public.challenge_options (challenge_id, label, is_correct, order_index) values
    (v_challenge_id, 'Training', true, 0),
    (v_challenge_id, 'Recruitment', true, 1),
    (v_challenge_id, 'Outsourcing', true, 2),
    (v_challenge_id, 'Space tourism', false, 3);
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata) values
    (v_admin_id, 'mission_created', 'mission', v_mission_id, jsonb_build_object('title', 'What ITM Actually Builds', 'day_number', 2, 'challenge_type', 'MULTIPLE_CHOICE')),
    (v_admin_id, 'mission_status_changed', 'mission', v_mission_id, jsonb_build_object('previous_status', 'DRAFT', 'new_status', 'LIVE'));

  -- ---------------------------------------------------------------------
  -- Day 3 — FREE_TEXT (moderated). An open personal-memory prompt, never
  -- a claimed fact.
  -- ---------------------------------------------------------------------
  insert into public.missions (game_day_id, title, slug, description, status, base_points, unity_points, is_unity_challenge, created_by)
    values (v_day3_id, 'A Memory From the Road', 'a-memory-from-the-road', 'The Journey is about the moments that stayed with you.', 'LIVE', 15, 0, false, v_admin_id)
    returning id into v_mission_id;
  insert into public.challenges (mission_id, type, prompt, order_index)
    values (v_mission_id, 'FREE_TEXT', 'Share a memory from an ITM Annual Review, company trip, or gathering that stayed with you.', 0)
    returning id into v_challenge_id;
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata) values
    (v_admin_id, 'mission_created', 'mission', v_mission_id, jsonb_build_object('title', 'A Memory From the Road', 'day_number', 3, 'challenge_type', 'FREE_TEXT')),
    (v_admin_id, 'mission_status_changed', 'mission', v_mission_id, jsonb_build_object('previous_status', 'DRAFT', 'new_status', 'LIVE'));

  -- ---------------------------------------------------------------------
  -- Day 4 — FREE_TEXT (moderated). Recognition, per Product Guide §8 Day
  -- 4 — a real nomination/vote flow exists separately (Phase 9's polls),
  -- kept out of this baseline seed since it needs real named candidates
  -- this session has no approved list for.
  -- ---------------------------------------------------------------------
  insert into public.missions (game_day_id, title, slug, description, status, base_points, unity_points, is_unity_challenge, created_by)
    values (v_day4_id, 'Someone Who Made It Better', 'someone-who-made-it-better', 'Recognition, in your own words.', 'LIVE', 15, 0, false, v_admin_id)
    returning id into v_mission_id;
  insert into public.challenges (mission_id, type, prompt, order_index)
    values (v_mission_id, 'FREE_TEXT', 'Who is someone at ITM who made your work better this year, and why?', 0)
    returning id into v_challenge_id;
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata) values
    (v_admin_id, 'mission_created', 'mission', v_mission_id, jsonb_build_object('title', 'Someone Who Made It Better', 'day_number', 4, 'challenge_type', 'FREE_TEXT')),
    (v_admin_id, 'mission_status_changed', 'mission', v_mission_id, jsonb_build_object('previous_status', 'DRAFT', 'new_status', 'LIVE'));

  -- ---------------------------------------------------------------------
  -- Day 5 — SINGLE_CHOICE. The correct answer is verbatim the Founder
  -- Story's own real description of Walumo (§20), not invented separately.
  -- ---------------------------------------------------------------------
  insert into public.missions (game_day_id, title, slug, description, status, base_points, unity_points, is_unity_challenge, created_by)
    values (v_day5_id, 'What Is Walumo?', 'what-is-walumo', 'From developing people to building systems.', 'LIVE', 10, 0, false, v_admin_id)
    returning id into v_mission_id;
  insert into public.challenges (mission_id, type, prompt, order_index)
    values (v_mission_id, 'SINGLE_CHOICE', 'What is Walumo?', 0)
    returning id into v_challenge_id;
  insert into public.challenge_options (challenge_id, label, is_correct, order_index) values
    (v_challenge_id, 'ITM Holding''s technology innovation hub', true, 0),
    (v_challenge_id, 'A separate company unrelated to ITM', false, 1),
    (v_challenge_id, 'ITM''s original 2011 name', false, 2),
    (v_challenge_id, 'A training program only', false, 3);
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata) values
    (v_admin_id, 'mission_created', 'mission', v_mission_id, jsonb_build_object('title', 'What Is Walumo?', 'day_number', 5, 'challenge_type', 'SINGLE_CHOICE')),
    (v_admin_id, 'mission_status_changed', 'mission', v_mission_id, jsonb_build_object('previous_status', 'DRAFT', 'new_status', 'LIVE'));

  -- ---------------------------------------------------------------------
  -- Day 6 — PHOTO_UPLOAD, a real Unity Points challenge (moderated).
  -- ---------------------------------------------------------------------
  insert into public.missions (game_day_id, title, slug, description, status, base_points, unity_points, is_unity_challenge, created_by)
    values (v_day6_id, 'Meet Someone New', 'meet-someone-new', 'One Group. Local leaders. African ambition.', 'LIVE', 20, 15, true, v_admin_id)
    returning id into v_mission_id;
  insert into public.challenges (mission_id, type, prompt, order_index)
    values (v_mission_id, 'PHOTO_UPLOAD', 'Upload a photo with someone from a country other than your own — introduce them in the caption.', 0)
    returning id into v_challenge_id;
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata) values
    (v_admin_id, 'mission_created', 'mission', v_mission_id, jsonb_build_object('title', 'Meet Someone New', 'day_number', 6, 'challenge_type', 'PHOTO_UPLOAD')),
    (v_admin_id, 'mission_status_changed', 'mission', v_mission_id, jsonb_build_object('previous_status', 'DRAFT', 'new_status', 'LIVE'));

  -- ---------------------------------------------------------------------
  -- Day 7 — FREE_TEXT (moderated). Reflective close, matching Product
  -- Guide §8 Day 7's "personal contribution pledge."
  -- ---------------------------------------------------------------------
  insert into public.missions (game_day_id, title, slug, description, status, base_points, unity_points, is_unity_challenge, created_by)
    values (v_day7_id, 'The Next Fifteen Years', 'the-next-fifteen-years', 'What you carry forward.', 'LIVE', 15, 0, false, v_admin_id)
    returning id into v_mission_id;
  insert into public.challenges (mission_id, type, prompt, order_index)
    values (v_mission_id, 'FREE_TEXT', 'In one sentence: what should ITM carry into the next 15 years?', 0)
    returning id into v_challenge_id;
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata) values
    (v_admin_id, 'mission_created', 'mission', v_mission_id, jsonb_build_object('title', 'The Next Fifteen Years', 'day_number', 7, 'challenge_type', 'FREE_TEXT')),
    (v_admin_id, 'mission_status_changed', 'mission', v_mission_id, jsonb_build_object('previous_status', 'DRAFT', 'new_status', 'LIVE'));

  -- Day 1's own game_day_status_changed audit entry (days 2-7 already
  -- logged nothing since they were created directly LIVE by this seed,
  -- not via the app's own DRAFT-then-publish flow — day 1 already had a
  -- real one from earlier verification testing).

  -- Finally, activate the campaign itself.
  update public.campaigns set status = 'ACTIVE' where id = v_campaign_id;
  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata) values
    (v_admin_id, 'game_resumed', 'campaign', v_campaign_id, jsonb_build_object('previous_status', 'DRAFT', 'new_status', 'ACTIVE'));
end $$;
