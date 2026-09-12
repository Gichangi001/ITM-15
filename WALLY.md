# ITM@15 — WALLY EXPERIENCE ENGINE
## Claude Code Implementation Specification

**Repository:** `ITM@15`  
**Required file location in repository:** `/docs/WALLY.md`  
**Parent specification:** `/docs/PRODUCT_GUIDE.md`  
**Product:** Walumo — ITM 15 Wally Takeover  
**Subsystem owner:** Walumo  
**Status:** Required implementation specification  
**Version:** 1.0  

---

# 0. HOW CLAUDE CODE MUST USE THIS FILE

This file is the implementation source of truth for **Wally** inside the `ITM@15` project.

Claude Code must read:

1. `/CLAUDE.md`
2. `/docs/PRODUCT_GUIDE.md`
3. `/docs/WALLY.md`

before making or changing any Wally-related architecture.

## 0.1 Authority order

If documents appear to conflict, apply this order:

1. Security, privacy, permissions, scoring, voting, moderation and server-authority rules in `PRODUCT_GUIDE.md` always win.
2. This file is authoritative for Wally-specific behaviour, rendering, animation, dialogue, realtime events, placement, admin controls and integration details.
3. Existing code does not overrule either specification merely because it already exists. Refactor safely when needed.

## 0.2 Non-negotiable rule

**Wally is not a decorative mascot. Wally is the emotional interface and live game master of ITM@15.**

If Wally is removed, the game should still function technically. But with Wally present, the product should feel alive, personal, responsive, theatrical, social and memorable.

Wally must never become the source of truth for:

- scores;
- rankings;
- voting results;
- mission eligibility;
- challenge deadlines;
- moderation outcomes;
- winner calculations;
- player permissions;
- admin permissions.

Wally only **presents, reacts to and animates server-approved state**.

---

# 1. WALLY PRODUCT PURPOSE

Wally exists to make employees feel that ITM@15 is responding to them in real time.

Wally has six jobs:

1. **Guide** — show the player what to do without making the interface feel instructional or boring.
2. **Narrate** — carry the ITM story from 2011 through the 15-year celebration and into the future.
3. **React** — visibly respond to player actions, achievements, votes, scores, photos and milestones.
4. **Connect** — encourage players to meet colleagues, discover countries, vote, collaborate and share memories.
5. **Surprise** — trigger Wally Drops, Easter eggs, hidden missions, country takeovers and Golden Wally moments.
6. **Represent Walumo** — demonstrate that Walumo can build premium, real-time, data-driven engagement experiences.

The intended employee reaction is not:

> “Nice mascot.”

It is:

> “Wally just called my name.”  
> “Wally knows Kenya moved into second.”  
> “Wally just gave our squad a challenge.”  
> “Where is Wally going next?”  
> “Walumo built this?”

---

# 2. WALLY DESIGN PRINCIPLES

Claude must use these principles to resolve implementation choices.

## 2.1 Present, not intrusive

Wally should appear often enough to feel alive but never block gameplay.

- Critical controls always remain accessible.
- Wally must move away from active inputs and primary buttons.
- Important modals must not be covered.
- On small screens, Wally can collapse to a compact assistant form.

## 2.2 Reactive, not random

Wally should usually appear because something happened:

- player logged in;
- mission unlocked;
- answer submitted;
- photo approved;
- points awarded;
- country overtook another country;
- vote opened;
- Wally Drop launched;
- day completed.

Random ambient behaviour is allowed, but it must never create false game state.

## 2.3 Personal, not creepy

Wally may use approved profile and game data such as:

- first name;
- country;
- entity;
- squad;
- points;
- rank when permitted;
- completed mission count;
- current day;
- mission title;
- achievement title;
- passport stamps;
- approved challenge partners.

Wally must not infer sensitive personal characteristics or expose private information.

## 2.4 Funny, not disrespectful

Wally may tease lightly, celebrate loudly and use playful humour.

Do not use:

- insults;
- humiliation;
- jokes about race, ethnicity, religion, gender, health, disability or personal circumstances;
- public shaming of inactive players;
- sarcastic messages that could reasonably embarrass an employee;
- false claims about a player or colleague.

## 2.5 Cinematic, but fast

3D quality must never make the game unusable.

Use progressive rendering tiers:

- **High:** full rigged 3D Wally + richer lighting/effects.
- **Standard:** simplified 3D Wally + reduced effects.
- **Lite:** 2D animated Wally + static/lightweight scenes.
- **Reduced motion:** static/low-motion Wally with accessible transitions.

## 2.6 Server state is truth

Never write dialogue such as:

> “Kenya is number one!”

unless the server has supplied that exact valid state for the allowed audience.

---

# 3. WALLY CHARACTER BIBLE

## 3.1 Identity

**Name:** Wally  
**Brand:** Walumo  
**Role inside ITM@15:** Guide, storyteller, game master, challenger, connector and future-facing Walumo character.

Wally is energetic, clever, warm, mischievous and proud of ITM without sounding like a corporate press release.

## 3.2 Voice

Wally's voice should be:

- short;
- confident;
- playful;
- easy to understand;
- positive;
- occasionally competitive;
- curious about employees and countries;
- never over-explanatory.

Prefer:

> “Alexander, your squad just unlocked something.”

instead of:

> “Congratulations Alexander. Your squad has successfully achieved the conditions required to unlock the next available mission.”

## 3.3 Dialogue length

Default live dialogue:

- 3–18 words for a reaction;
- 15–35 words for a mission introduction;
- maximum approximately 60 words for a story beat unless the player actively opens a story panel.

Do not make employees read long paragraphs every time Wally appears.

## 3.4 Wally language modes

Architecture must allow dialogue localization.

Minimum fields:

```text
locale
text
fallback_locale
```

Initial implementation may launch in English, but the schema and content engine must be translation-ready.

Do not bake English text directly into animation components.

---

# 4. WALLY SYSTEM ARCHITECTURE

Wally is a subsystem composed of six layers.

```text
SERVER-APPROVED GAME STATE
          ↓
WALLY EVENT PRODUCER
          ↓
REALTIME / LOCAL EVENT BUS
          ↓
WALLY CONTROLLER + PRIORITY QUEUE
          ↓
DIALOGUE + ANIMATION + AUDIO RESOLVER
          ↓
WALLY RENDERER (3D / 2D / REDUCED MOTION)
```

## 4.1 Server-approved game state

Sources include:

- authentication events;
- mission engine;
- score ledger;
- vote engine;
- moderation engine;
- achievement engine;
- leaderboard service;
- scheduled event engine;
- admin Mission Control.

## 4.2 Wally event producers

An event producer must emit only after the relevant business transaction is valid.

Example:

```text
photo submitted
    ↓
moderator approves photo
    ↓
server writes APPROVED state
    ↓
server awards points through score ledger
    ↓
server emits submission.approved / points.awarded
    ↓
Wally displays approved celebration
```

Never celebrate approval before approval exists.

## 4.3 Wally Controller

Create a central client controller responsible for:

- receiving events;
- validating payload shape;
- resolving priority;
- preventing duplicate events;
- applying cooldowns;
- selecting dialogue;
- selecting animation;
- selecting entry/exit path;
- selecting audio/effects;
- queuing events;
- exposing current Wally state;
- respecting reduced-motion and Lite mode;
- pausing Wally when the application is backgrounded where appropriate.

Recommended file:

```text
/components/wally/WallyProvider.tsx
```

and core engine:

```text
/wally/behavior/controller.ts
```

---

# 5. REQUIRED WALLY EVENT CATALOGUE

Support at minimum these canonical event types.

```text
LOGIN_GREETING
FIRST_LOGIN_WELCOME
ONBOARDING_COMPLETE
DAY_UNLOCKED
DAY_INTRO
MISSION_AVAILABLE
MISSION_STARTED
MISSION_COMPLETED
MISSION_FAILED
MISSION_EXPIRING
CORRECT_ANSWER
WRONG_ANSWER
PHOTO_SUBMITTED
PHOTO_APPROVED
PHOTO_REJECTED
VOTE_OPENED
VOTE_CAST
VOTE_CLOSED
VOTE_REVEALED
BONUS_POINTS
POINTS_AWARDED
POINTS_REVERSED
ACHIEVEMENT_UNLOCKED
PASSPORT_STAMP_UNLOCKED
SQUAD_MILESTONE
COUNTRY_MILESTONE
COUNTRY_OVERTAKE
LEADERBOARD_FROZEN
LEADERBOARD_REVEALED
PLAYER_INACTIVE
PLAYER_RETURNED
WALLY_DROP
GOLDEN_WALLY_HINT
GOLDEN_WALLY_FOUND
COUNTRY_TAKEOVER
ADMIN_MESSAGE
GLOBAL_ANNOUNCEMENT
GAME_PAUSED
GAME_RESUMED
DAY_COMPLETE
FINAL_REVEAL
AMBIENT_IDLE
```

## 5.1 Event properties

Each resolved Wally event must be able to define:

```text
type
audience
priority
source
animation
entry_path
position
dialogue_key
dialogue_variables
sound_key
effect_key
duration_ms
interruptible
requires_acknowledgement
cta_label
cta_href
expires_at
dedupe_key
cooldown_key
```

---

# 6. PRIORITY AND INTERRUPTION RULES

Wally will receive many events. Implement a priority queue.

## 6.1 Priority levels

```text
P0_CRITICAL
P1_LIVE_EVENT
P2_PLAYER_RESULT
P3_GUIDANCE
P4_AMBIENT
```

### P0 — Critical

Examples:

- game paused;
- mandatory admin notice;
- serious connectivity/state notice if Wally is used for it.

May interrupt lower priority Wally behaviour.

### P1 — Live event

Examples:

- Wally Drop;
- Golden Wally found;
- vote reveal;
- final reveal;
- country takeover;
- admin live message.

May interrupt P3/P4. Should generally wait for an active P2 completion animation to finish if delay is acceptable.

### P2 — Player result

Examples:

- mission completed;
- achievement unlocked;
- photo approved;
- bonus points.

Must not be lost.

### P3 — Guidance

Examples:

- mission available;
- mission expiring;
- inactivity reminder.

Can queue or collapse.

### P4 — Ambient

Examples:

- idle wave;
- looking around;
- short stretch;
- nonessential idle comment.

Always interruptible.

## 6.2 Duplicate suppression

The same logical event must not fire repeatedly because of reconnects.

Use:

```text
event_id
dedupe_key
processed_event_ids
```

Persist event IDs server-side for important targeted events and locally cache recently rendered IDs.

---

# 7. REALTIME EVENT CONTRACT

Wally uses the realtime architecture defined by `PRODUCT_GUIDE.md`.

Expected channels include:

```text
game:global
game:day:{dayId}
country:{countryId}
entity:{entityId}
squad:{squadId}
player:{playerId}
admin:mission-control
```

## 7.1 Broadcast event name

Use:

```text
wally.triggered
```

for explicit Wally events.

Other business events such as `points.awarded` may also cause a local Wally resolver reaction, but avoid duplicate rendering.

## 7.2 Canonical TypeScript payload

Implement a shared type similar to:

```ts
export type WallyPriority =
  | 'P0_CRITICAL'
  | 'P1_LIVE_EVENT'
  | 'P2_PLAYER_RESULT'
  | 'P3_GUIDANCE'
  | 'P4_AMBIENT';

export type WallyAudience = {
  type: 'GLOBAL' | 'COUNTRY' | 'ENTITY' | 'SQUAD' | 'PLAYER';
  id?: string;
};

export type WallyTriggerPayload = {
  eventId: string;
  campaignId: string;
  eventType: string;
  audience: WallyAudience;
  priority: WallyPriority;
  animationKey: string;
  dialogueKey?: string;
  dialogueOverride?: string;
  variables?: Record<string, string | number | boolean | null>;
  soundKey?: string;
  effectKey?: string;
  entryPath?: string;
  position?: string;
  durationMs?: number;
  interruptible?: boolean;
  requiresAcknowledgement?: boolean;
  cta?: {
    label: string;
    href: string;
  };
  startsAt?: string;
  expiresAt?: string;
  dedupeKey?: string;
  createdBy?: string;
  createdAt: string;
};
```

## 7.3 Validation

Create a shared Zod schema.

Reject malformed realtime payloads rather than attempting to render unknown data.

Do not accept arbitrary HTML in Wally dialogue.

---

# 8. DATABASE MODEL FOR WALLY

The parent guide already requires:

```text
wally_dialogues
wally_events
```

Expand them as follows.

## 8.1 `wally_dialogues`

Recommended columns:

```text
id uuid primary key
campaign_id uuid nullable
key text not null
locale text not null default 'en'
event_type text not null
variant text nullable
text text not null
weight integer not null default 100
is_active boolean not null default true
valid_from timestamptz nullable
valid_until timestamptz nullable
created_by uuid nullable
created_at timestamptz not null
updated_at timestamptz not null
```

Constraint:

```text
unique(campaign_id, key, locale, variant)
```

## 8.2 `wally_events`

Recommended columns:

```text
id uuid primary key
campaign_id uuid not null
event_type text not null
audience_type text not null
audience_id uuid nullable
priority text not null
animation_key text not null
dialogue_key text nullable
dialogue_override text nullable
variables jsonb not null default '{}'
sound_key text nullable
effect_key text nullable
entry_path text nullable
position_key text nullable
duration_ms integer nullable
interruptible boolean not null default true
requires_acknowledgement boolean not null default false
cta jsonb nullable
status text not null
starts_at timestamptz nullable
expires_at timestamptz nullable
dedupe_key text nullable
created_by uuid nullable
created_at timestamptz not null
published_at timestamptz nullable
cancelled_at timestamptz nullable
```

Suggested statuses:

```text
DRAFT
SCHEDULED
PUBLISHED
CANCELLED
EXPIRED
```

## 8.3 `wally_assets`

Add this table because Wally needs swappable production assets.

```text
id uuid primary key
asset_type text not null
key text not null
storage_path text not null
quality_tier text nullable
skin_key text nullable
locale text nullable
metadata jsonb not null default '{}'
is_active boolean not null default true
created_at timestamptz not null
updated_at timestamptz not null
```

Asset types:

```text
MODEL_GLB
TEXTURE
ANIMATION
AUDIO
VOICE
IMAGE_2D
LOTTIE
EFFECT
THUMBNAIL
```

## 8.4 `wally_skins`

Recommended:

```text
id uuid primary key
key text unique not null
name text not null
description text nullable
model_asset_id uuid nullable
thumbnail_asset_id uuid nullable
theme_token_overrides jsonb not null default '{}'
is_active boolean not null default true
created_at timestamptz not null
updated_at timestamptz not null
```

## 8.5 `wally_event_receipts`

Use this for important targeted deliveries and acknowledgement.

```text
id uuid primary key
wally_event_id uuid not null
player_id uuid not null
delivered_at timestamptz nullable
rendered_at timestamptz nullable
acknowledged_at timestamptz nullable
dismissed_at timestamptz nullable
cta_clicked_at timestamptz nullable
created_at timestamptz not null
```

This enables analytics without making delivery fragile.

---

# 9. RLS AND SECURITY RULES

Follow the global RLS model from `PRODUCT_GUIDE.md`.

Minimum rules:

- Players may read Wally events targeted to them or to an audience they belong to.
- Players may not create or edit Wally events.
- Players may not edit Wally dialogue.
- Moderators do not automatically receive Wally authoring permission.
- Game Masters and Super Admins may author events according to role.
- All mass messages must create an audit log.
- `dialogueOverride` from admin must be sanitized and treated as plain text.
- Server endpoints must validate that target country/entity/squad/player exists and that the admin is authorized to target it.
- Never expose service-role keys to the browser.

---

# 10. WALLY STATE MACHINE

Implement Wally as a deterministic state machine.

Core states:

```text
UNMOUNTED
LOADING
IDLE
ENTERING
MOVING
TALKING
REACTING
WAITING_ACK
EXITING
SUSPENDED
ERROR_FALLBACK
```

## 10.1 Typical flow

```text
IDLE
  ↓ event received
ENTERING
  ↓
MOVING
  ↓
TALKING / REACTING
  ↓
WAITING_ACK (optional)
  ↓
EXITING
  ↓
IDLE
```

## 10.2 State rules

- Only one primary Wally performance runs at a time on player screens.
- Ambient loops may run while no primary event is active.
- High-priority events can cancel an interruptible lower-priority event.
- Non-interruptible events include final reveal and certain confirmed result celebrations.
- On route change, preserve critical queued events but cancel stale ambient events.
- On sign-out, clear player-targeted queue.

---

# 11. REQUIRED ANIMATION LIBRARY

Minimum animation clips:

```text
idle_primary
idle_secondary
walk
run
wave
celebrate_short
celebrate_big
dance
think
point_left
point_right
point_up
shocked
proud
sneak
sleep
talk_neutral
talk_excited
talk_serious
look_left
look_right
look_up
exit_left
exit_right
```

## 11.1 Clip requirements

- Loops must loop cleanly.
- Entry/exit clips should blend into idle/walk.
- Use cross-fades to avoid snapping.
- Root motion must be predictable or disabled where screen-space movement is controlled externally.
- Keep mobile asset size reasonable.
- Compress GLB with production-appropriate techniques.
- Do not make face rig complexity a launch blocker.

## 11.2 Optional later animations

```text
high_five
selfie_pose
camera_pose
passport_stamp
confetti_throw
peek_behind_card
portal_enter
portal_exit
head_shake
slow_clap
```

---

# 12. WALLY MOVEMENT SYSTEM

Wally must move through the interface rather than remain permanently fixed.

## 12.1 Supported entry paths

```text
LEFT_EDGE
RIGHT_EDGE
BOTTOM_LEFT
BOTTOM_RIGHT
CENTER_PORTAL
BEHIND_CARD
SCENE_ENTRY
FADE_IN
```

## 12.2 Supported anchor positions

```text
BOTTOM_LEFT
BOTTOM_RIGHT
CENTER_LEFT
CENTER_RIGHT
MISSION_CARD_LEFT
MISSION_CARD_RIGHT
ACHIEVEMENT_PANEL
LEADERBOARD_EDGE
VOTE_PANEL_EDGE
CUSTOM_TARGET
```

## 12.3 UI target pointing

For supported components, expose safe refs/anchors such as:

```text
data-wally-anchor="current-mission"
data-wally-anchor="vote-button"
data-wally-anchor="leaderboard"
data-wally-anchor="passport"
```

Wally may move toward an anchor and point to it.

Never rely on brittle DOM selectors like deeply nested class names.

## 12.4 Collision rule

Before Wally settles in a position:

- measure viewport;
- avoid primary CTA area;
- avoid keyboard/input focus area;
- avoid modals;
- avoid toast stack;
- avoid bottom browser safe area on mobile.

If no safe area exists, collapse to compact assistant mode.

---

# 13. RENDERING ARCHITECTURE

## 13.1 High/Standard 3D renderer

Use:

- Three.js;
- React Three Fiber;
- Drei utilities;
- GLB/GLTF model;
- AnimationMixer or R3F-compatible animation controls;
- dynamic import so 3D does not block initial page hydration.

Recommended components:

```text
components/wally/WallyProvider.tsx
components/wally/WallyViewport.tsx
components/wally/Wally3D.tsx
components/wally/Wally2D.tsx
components/wally/WallySpeechBubble.tsx
components/wally/WallyEffects.tsx
components/wally/WallyDebugPanel.tsx
```

## 13.2 Lite renderer

Lite Wally must support the same event contract.

It may use:

- transparent WebP sequences;
- Lottie;
- sprite sheets;
- lightweight CSS transforms.

Do not fork business logic for Lite mode.

## 13.3 Reduced motion

Respect `prefers-reduced-motion`.

Reduced-motion mode should:

- skip long walks/runs;
- reduce scale/rotation effects;
- replace camera movement with fades;
- preserve dialogue, results and CTA access;
- never penalize the user.

---

# 14. QUALITY TIER DETECTION

Do not use one simplistic check only.

Create a client capability resolver using signals such as:

- reduced-motion preference;
- viewport;
- device memory where available;
- hardware concurrency where available;
- WebGL support;
- measured initial frame time;
- user override stored in preferences.

Return:

```text
HIGH
STANDARD
LITE
REDUCED_MOTION
```

Admin must never be required to know a player's tier.

Give players a manual setting:

```text
Visual quality: Auto / High / Standard / Lite
```

---

# 15. WALLY ON EVERY CORE PRODUCT SURFACE

Wally must connect to the overall `ITM@15` journey.

## 15.1 Public landing page

Purpose: intrigue, not gameplay.

Wally behaviour:

- appear as a cinematic teaser;
- peek, walk or reveal logo;
- optionally respond to hover/tap;
- guide to `Enter ITM@15` CTA;
- do not expose player-specific state.

Suggested line:

> “Fifteen years. One story. Ready to enter?”

## 15.2 Login page

Wally must make login feel like entering the game.

Behaviour:

- idle while form is untouched;
- look toward email field when focused;
- celebrate successful sign-in;
- never reveal whether an email exists beyond approved auth UX;
- show short, helpful error reaction without mockery.

Example successful login:

> “There you are. Let’s see what’s waiting.”

## 15.3 First-login password change

Wally becomes helpful and reassuring.

Example:

> “First mission: make this account yours. Choose a private password.”

Do not joke about passwords.

## 15.4 Onboarding

Wally guides collection of:

- full name;
- email already known from auth;
- country;
- entity if required;
- profile image if enabled.

Wally should react when country is selected.

Example:

> “Kenya. Good. Your passport has somewhere to begin.”

## 15.5 Main game home

This is Wally's primary habitat.

Wally can:

- greet player by first name;
- introduce current day;
- point to active mission;
- react to leaderboard movement;
- deliver surprise events;
- show countdown reminder;
- celebrate progress.

## 15.6 Mission page

Wally must:

- introduce mission;
- optionally explain one key rule;
- retreat while player interacts;
- react only after authoritative result;
- never obscure input controls.

## 15.7 Voting

Wally can:

- announce poll opening;
- explain one-line voting rule;
- thank player after successful vote;
- host result reveal.

Wally must not reveal hidden interim totals.

## 15.8 Photo challenge

Flow:

1. Wally introduces challenge.
2. Player uploads photo.
3. Wally confirms submission only, not approval.
4. Moderator approves/rejects.
5. Wally reacts to authoritative outcome.

Submission line:

> “Got it. It’s with the moderators now.”

Approval line:

> “Verified. That one counts.”

## 15.9 Passport

Wally can stamp or celebrate country unlocks.

Example:

> “Senegal discovered. Your ITM map just got bigger.”

## 15.10 Leaderboard

Wally may announce meaningful movement, not every tiny score change.

Use thresholds/cooldowns.

## 15.11 Gallery

Wally can highlight featured approved memories, but must never make unmoderated content public.

## 15.12 Event screen / spectator mode

Wally should be larger and more theatrical.

He can:

- walk into leaderboard reveals;
- introduce vote results;
- trigger countdowns;
- celebrate country milestones;
- host Golden Wally announcements;
- appear alongside approved photo wall content.

Spectator mode must never expose private player-only messages.

---

# 16. ADMIN MISSION CONTROL — WALLY CONTROL ROOM

Required route:

```text
/admin/live/wally
```

This is one of the most important admin experiences in the product.

## 16.1 Layout

Use a premium command-centre layout with:

### Left: audience and event configuration

- Audience type.
- Audience selector.
- Event type.
- Priority.
- Start now / schedule.
- Expiry.

### Center: Wally preview stage

- Current selected skin.
- Animation preview.
- Speech bubble preview.
- Sound preview.
- Theme/effect preview.
- Desktop/mobile toggle.

### Right: message and delivery controls

- Dialogue template selector.
- Message override.
- Safe variable insertion.
- CTA label/link.
- Sound.
- Effect.
- Requires acknowledgement.
- Send test to self.
- Publish.

### Bottom: live event history

Show:

- status;
- audience;
- time;
- created by;
- delivered count if available;
- acknowledged count if applicable;
- cancel action where allowed.

## 16.2 Targeting

Support:

```text
Everyone
Country
Entity
Squad
Individual Player
```

Search must work by name/email for player targeting.

## 16.3 Preview is mandatory

Admins must preview before mass global publish, except predefined one-click emergency/approved presets.

For global messages, use a confirmation step:

> “Send this Wally event to 482 eligible connected players?”

## 16.4 Admin quick actions

Provide quick buttons:

```text
Wave
Celebrate
Dance
Point
Look Shocked
Run In
Wally Drop
Country Takeover
Golden Wally Hint
Leaderboard Reveal
Final Reveal
Custom Message
```

Quick actions still pass through authorization and audit logging.

---

# 17. LIVE ADMIN → CONNECTED PLAYER FLOW

Required latency experience:

1. Game Master opens `/admin/live/wally`.
2. Selects `Country: Kenya`.
3. Chooses `COUNTRY_OVERTAKE` or custom message.
4. Previews Wally animation.
5. Clicks Publish.
6. Server validates admin authorization and target.
7. Server writes `wally_events` row.
8. Server creates audit log.
9. Server broadcasts `wally.triggered` to authorized country channel.
10. Connected Kenyan players receive event without refreshing.
11. Wally enters, animates and displays message.
12. Event receipt/analytics record delivery/render where configured.

Acceptance target: connected eligible users should normally see live Wally events within a few seconds under healthy network conditions.

---

# 18. WALLY DIALOGUE ENGINE

## 18.1 Never hard-code all dialogue in components

Use dialogue keys.

Example:

```text
login.greeting.default
mission.completed.default
mission.completed.cross_country
photo.approved.default
leaderboard.country_overtake
wally_drop.global
final_reveal.intro
```

## 18.2 Supported variables

Initial safe variables:

```text
{{first_name}}
{{full_name}}
{{country_name}}
{{entity_name}}
{{squad_name}}
{{points}}
{{bonus_points}}
{{country_rank}}
{{player_rank}}
{{mission_title}}
{{achievement_title}}
{{passport_country}}
{{next_unlock_time}}
{{time_remaining}}
{{day_number}}
{{day_title}}
```

Each variable must have a declared data source and permission rule.

## 18.3 Missing variables

Never render raw `{{variable}}` text.

If a required variable is missing:

- use a fallback dialogue variant;
- or omit the variable-dependent sentence.

## 18.4 Dialogue variation

Allow multiple variants to prevent repetition.

Example:

```text
mission.completed.default.a
mission.completed.default.b
mission.completed.default.c
```

Select deterministically or weighted-random while respecting cooldowns.

## 18.5 No fabricated AI dialogue at launch

Version 1 should use curated dialogue templates.

If an LLM personality layer is added later:

- it may rewrite tone or generate non-authoritative flavour text;
- it must receive only approved context;
- it must never calculate scores/ranks/winners;
- server-approved numbers must be inserted after generation or strictly constrained;
- all content must follow the character safety rules in this file.

---

# 19. STARTER DIALOGUE LIBRARY

Seed realistic dialogue so the product does not launch with placeholders.

## 19.1 Login

```text
“There you are. ITM@15 has been waiting.”
“Welcome back, {{first_name}}. Something changed while you were away.”
“{{first_name}}, good timing. Your next mission is live.”
```

## 19.2 Day unlock

```text
“Day {{day_number}} is open. New story. New mission.”
“Chapter unlocked. I hope you’re ready for this one.”
“{{first_name}}, the next part of the ITM story just opened.”
```

## 19.3 Correct answer

```text
“That’s it.”
“Correct. Somebody has been paying attention.”
“Exactly. Keep going.”
```

## 19.4 Wrong answer

```text
“Not quite. Try that one again.”
“Close. Look at the clue one more time.”
“Wally says no. The story says try again.”
```

Never insult the player.

## 19.5 Mission completion

```text
“Mission complete. That counts.”
“Done. Your squad just got stronger.”
“{{first_name}}, mission cleared.”
```

## 19.6 Cross-country challenge

```text
“Now that is One ITM.”
“{{country_name}} just made a new connection.”
“Different countries. One mission. Exactly the point.”
```

## 19.7 Photo submitted

```text
“Photo received. Moderators are checking it.”
“Got it. Don’t celebrate yet — verification first.”
```

## 19.8 Photo approved

```text
“Verified. +{{bonus_points}} points.”
“That memory is official.”
“Approved. I’m keeping that one.”
```

## 19.9 Photo rejected

```text
“Not approved yet. Check the reason and try again.”
“This one needs another attempt. I’ve left you the feedback.”
```

## 19.10 Bonus points

```text
“Bonus unlocked: +{{bonus_points}}.”
“Unexpected points are still points.”
“Wally bonus. Don’t waste it.”
```

## 19.11 Achievement

```text
“Achievement unlocked: {{achievement_title}}.”
“That badge was earned.”
“New badge. Your passport is getting serious.”
```

## 19.12 Country movement

```text
“{{country_name}} just moved to #{{country_rank}}.”
“Leaderboard movement. {{country_name}} is now #{{country_rank}}.”
```

## 19.13 Wally Drop

```text
“WALLY DROP. You have {{time_remaining}}.”
“Everything else can wait. A Wally Drop just landed.”
“Surprise mission. Clock starts now.”
```

## 19.14 Inactivity reminder

Keep private and light.

```text
“{{first_name}}, today’s mission is still waiting.”
“You’ve got unfinished business in Day {{day_number}}.”
“When you’re ready, I left your mission open.”
```

## 19.15 Return

```text
“You’re back. Good.”
“Welcome back, {{first_name}}. Let’s continue.”
```

## 19.16 Golden Wally

```text
“Someone found something they were not supposed to find.”
“Golden Wally is moving.”
“There is a clue hiding in plain sight.”
```

## 19.17 Final reveal

```text
“You thought this was a game about points.”
“The leaderboard tells one story. The people tell the bigger one.”
“Fifteen years are written. What happens next belongs to you.”
```

---

# 20. SEVEN-DAY WALLY CHARACTER ARC

Wally must visibly evolve with the game.

## Day 1 — ORIGIN

**Role:** Explorer / historian beginning the story.  
**Visual idea:** Simple explorer styling, notebook/map detail.  
**Behaviour:** Curious, reveals the eight-person beginning, invites discovery.  
**Primary actions:** walk, point, think, proud.

## Day 2 — PASSPORT

**Role:** Traveller.  
**Visual idea:** Travel backpack/passport accents.  
**Behaviour:** Energetic, jumps between cultures/country missions.  
**Primary actions:** wave, run, point, dance.

## Day 3 — THE JOURNEY

**Role:** Memory hunter / photographer.  
**Visual idea:** Camera/travel detail.  
**Behaviour:** Pulls players into Annual Review destinations and memories.  
**Primary actions:** camera pose, think, point, proud.

## Day 4 — THE PEOPLE

**Role:** Recognition host.  
**Visual idea:** Medal/ribbon detail.  
**Behaviour:** Warm, less teasing, celebrates colleagues.  
**Primary actions:** proud, celebrate, wave.

## Day 5 — WALUMO

**Role:** Builder / futurist.  
**Visual idea:** Walumo hoodie or technology styling.  
**Behaviour:** Faster, more futuristic, product Easter eggs.  
**Primary actions:** run, portal, point, excited talk.

## Day 6 — THE ALLIANCE

**Role:** Connector / festival game master.  
**Visual idea:** Cross-country/festival accessories that remain brand-safe.  
**Behaviour:** Social, loud, launches group challenges.  
**Primary actions:** dance, celebrate, high-five, selfie pose.

## Day 7 — LEGACY

**Role:** Future Wally.  
**Visual idea:** Clean elevated/futuristic version.  
**Behaviour:** More cinematic, reflective, then celebratory.  
**Primary actions:** proud, serious talk, final celebration, portal exit.

Skins must be data-driven, not hard-coded to routes.

---

# 21. WALLY AND THE HIDDEN “I BELONG” ARC

The parent product uses one hidden symbol/letter per day.

Wally is the carrier of this mystery.

At appropriate day-completion moments, Wally may reveal one symbol without explaining it.

```text
Day 1 → I
Day 2 → B
Day 3 → E
Day 4 → L
Day 5 → O
Day 6 → N
Day 7 → G
```

Rules:

- Do not reveal the final phrase early.
- Store unlock state per player/campaign.
- Day 7 final reveal assembles `I BELONG`.
- Wally's final dialogue should connect belonging to the employee story, not just the game score.

---

# 22. WALLY DROPS

Wally Drops are time-limited live surprise missions.

## 22.1 Requirements

A Wally Drop must define:

```text
title
instructions
audience
starts_at
ends_at
points
submission_type
validation/moderation_rule
wally_intro_event
wally_expiry_event
```

## 22.2 Admin flow

1. Game Master creates or selects Wally Drop.
2. Preview Wally intro.
3. Publish.
4. Mission engine creates authoritative challenge state.
5. Notification engine sends live event.
6. Wally announces challenge.
7. Timer is based on server deadline.

## 22.3 Do not let Wally define the timer

Wally displays the timer; mission engine owns it.

---

# 23. GOLDEN WALLY

Golden Wally is a rare campaign mechanic.

Possible implementation modes:

- digital hidden object;
- clue chain;
- time-limited page Easter egg;
- admin-triggered real-world challenge;
- QR-based clue if event operations approve it.

## 23.1 Rules

- Golden Wally state must be server-authoritative.
- Claim must be atomic so two players cannot both win one unique claim unless rules allow it.
- If physical-world verification is needed, moderator approval occurs before final award.
- Award uses `score_events`, never direct score mutation.
- Wally announces global discovery only after claim is validated.

---

# 24. EMAIL WALLY VS IN-APP WALLY

Daily email reminders are part of the parent product.

Use the same character voice, but keep systems separate.

## 24.1 Daily Wally email

Every active eligible employee receives the scheduled campaign reminder according to global campaign rules.

Required elements:

- Wally identity/visual;
- player first name when available;
- current day/title;
- one-line hook;
- clear `Play ITM@15` button;
- direct production link;
- optional current mission teaser;
- unsubscribe/preferences only where organizational policy permits and campaign requirements allow.

Never include password in reminder emails.

## 24.2 Email deep links

Preferred:

```text
https://<production-domain>/play
```

or safe deep link to current day:

```text
https://<production-domain>/play/day/{daySlug}
```

The application must still check login/session/eligibility.

## 24.3 Email event tracking

Track operational delivery separately from game completion.

Do not award game points merely because an email was opened.

---

# 25. WALLY NOTIFICATIONS

Wally may deliver three in-app presentation types.

## 25.1 Ambient toast

Use for low-priority guidance.

## 25.2 Character interruption

Use for meaningful live/game events.

## 25.3 Full-screen cinematic

Reserve for:

- campaign opening;
- major day intro;
- leaderboard reveal;
- Golden Wally reveal;
- Day 7 final reveal.

Do not overuse full-screen interruptions.

---

# 26. AUDIO AND SOUND DESIGN

Wally should have a coherent sound system.

## 26.1 Required sound keys

```text
wally_enter
wally_drop_alert
correct_short
wrong_soft
achievement
bonus_points
passport_stamp
vote_reveal
leaderboard_move
country_overtake
golden_wally
final_reveal
```

## 26.2 Audio rules

- Audio defaults must respect browser autoplay restrictions.
- Provide mute setting.
- Remember preference.
- Critical information must never depend on sound.
- Do not play overlapping stings excessively.
- Spectator screen may use richer sound than personal phones.

---

# 27. THEMES AND WALLY

Admin can change themes live in the parent product.

Wally renderer must consume theme tokens, not embed fixed scene colors everywhere.

Examples:

```text
--wally-accent
--wally-glow
--wally-shadow
--scene-fog
--scene-light-intensity
--speech-bg
--speech-text
```

When `theme.changed` arrives:

- transition safely;
- do not remount full Wally model unless necessary;
- preserve current event where possible;
- respect accessibility contrast.

---

# 28. WALLY ANALYTICS

Track enough to understand engagement, not to create invasive surveillance.

Suggested analytics events:

```text
wally_rendered
wally_dialogue_shown
wally_cta_clicked
wally_dismissed
wally_acknowledged
wally_drop_seen
wally_drop_started
wally_drop_completed
golden_wally_hint_seen
wally_quality_tier_selected
wally_quality_auto_downgraded
```

Useful admin metrics:

- Wally events published today;
- delivery/render success;
- CTA click rate;
- Wally Drop participation;
- average reaction-to-mission start time;
- quality tier distribution;
- events dismissed immediately;
- client errors associated with Wally renderer.

Never present analytics as employee performance unless separately and legitimately defined by the product rules.

---

# 29. ERROR HANDLING

Wally must fail gracefully.

## 29.1 3D failure

If model or WebGL fails:

1. log error;
2. switch to 2D renderer;
3. preserve message/CTA/event;
4. do not block game.

## 29.2 Audio failure

Continue silently.

## 29.3 Realtime disconnect

- show standard connectivity state in app;
- reconnect channel;
- fetch current authoritative live state after reconnect;
- do not replay expired Wally events;
- replay required acknowledgement events if still active.

## 29.4 Missing dialogue

Fallback chain:

```text
requested locale + variant
requested locale + default
fallback locale + variant
fallback locale + default
safe generic text
```

---

# 30. PERFORMANCE BUDGET

Treat performance as a product feature.

Goals:

- Landing/login should become usable before optional Wally 3D finishes loading.
- Player can complete game even if Wally asset download fails.
- Lazy-load heavy day scenes.
- Cache Wally model/assets aggressively with versioned URLs.
- Avoid multiple WebGL canvases on one mobile page unless proven safe.
- Dispose textures/materials/scenes on unmount where applicable.
- Pause animation when tab is hidden.
- Use compressed textures and models.

Claude must measure rather than assume performance.

---

# 31. ACCESSIBILITY

Wally cannot be the only way information is communicated.

Every Wally event with important information needs equivalent semantic UI text.

Requirements:

- Speech bubble text is selectable/readable by assistive technology where practical.
- CTA is keyboard accessible.
- Do not trap keyboard focus on Wally unless event explicitly requires acknowledgement.
- Reduced-motion mode.
- Mute option.
- Sufficient contrast.
- Avoid essential information delivered only through color, movement or audio.

---

# 32. TESTING STRATEGY

## 32.1 Unit tests

Test:

- event priority resolver;
- cooldown resolver;
- dialogue variable resolver;
- fallback dialogue selection;
- quality tier resolver where deterministic;
- Wally event Zod validation;
- audience matching helpers.

## 32.2 Integration tests

Test:

- mission completion → points event → Wally completion reaction;
- approved photo → Wally approval reaction;
- rejected photo → no points + rejection reaction;
- admin targeted Wally event reaches correct audience only;
- theme change does not break active Wally event;
- reconnect does not duplicate one-time event.

## 32.3 End-to-end tests

Critical scenarios:

### E2E 1 — Login greeting

1. Employee logs in.
2. Correct player profile resolves.
3. Wally greets using first name.
4. No fabricated rank/score appears.

### E2E 2 — Day Zero full loop

1. Admin publishes cross-country challenge.
2. Player receives Wally event without refresh.
3. Player opens challenge.
4. Player uploads photo.
5. Moderator approves.
6. Server awards Unity Points.
7. Leaderboard refreshes.
8. Wally celebrates with approved point amount.

### E2E 3 — Country-targeted message

1. Admin targets Kenya.
2. Kenyan connected player receives Wally event.
3. Senegal player does not.
4. Audit record exists.

### E2E 4 — Lite fallback

1. Force WebGL failure or Lite preference.
2. Wally 2D appears.
3. Same message and CTA are available.
4. Game remains fully playable.

### E2E 5 — Final reveal

1. Day 7 completion criteria met.
2. Wally final sequence runs once.
3. I BELONG reveal appears.
4. Event remains accessible in reduced-motion form.

---

# 33. CLAUDE CODE REPOSITORY STRUCTURE FOR WALLY

Inside `ITM@15`, use the existing parent structure and add/maintain:

```text
ITM@15/
├── docs/
│   ├── PRODUCT_GUIDE.md
│   └── WALLY.md
│
├── components/
│   └── wally/
│       ├── WallyProvider.tsx
│       ├── WallyViewport.tsx
│       ├── Wally3D.tsx
│       ├── Wally2D.tsx
│       ├── WallySpeechBubble.tsx
│       ├── WallyEffects.tsx
│       ├── WallyAnchor.tsx
│       └── WallyDebugPanel.tsx
│
├── wally/
│   ├── behavior/
│   │   ├── controller.ts
│   │   ├── machine.ts
│   │   ├── priority.ts
│   │   ├── cooldown.ts
│   │   └── positioning.ts
│   ├── dialogue/
│   │   ├── resolver.ts
│   │   ├── variables.ts
│   │   └── fallbacks.ts
│   ├── events/
│   │   ├── types.ts
│   │   ├── schema.ts
│   │   ├── audience.ts
│   │   └── handlers.ts
│   ├── rendering/
│   │   ├── capability.ts
│   │   ├── quality.ts
│   │   └── assets.ts
│   ├── animations/
│   │   ├── registry.ts
│   │   └── transitions.ts
│   ├── audio/
│   │   ├── registry.ts
│   │   └── player.ts
│   ├── models/
│   └── skins/
│
├── app/
│   └── admin/
│       └── live/
│           └── wally/
│               └── page.tsx
│
├── lib/
│   ├── realtime/
│   └── notifications/
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
└── tests/
    ├── wally/
    └── e2e/
```

Do not create a second independent app for Wally.

Wally is part of the same authenticated `ITM@15` application, database and realtime system.

---

# 34. API / SERVER ACTIONS

Suggested secure server operations:

```text
createWallyEvent
scheduleWallyEvent
publishWallyEvent
cancelWallyEvent
previewWallyEvent
acknowledgeWallyEvent
recordWallyReceipt
getWallyDialogues
upsertWallyDialogue
getWallyAssets
upsertWallySkin
```

Rules:

- Authoring endpoints require correct admin role.
- Preview to self may be less restrictive but still authenticated.
- Publishing to GLOBAL requires Game Master or Super Admin.
- All writes validate campaign state.
- Publishing creates audit entry.

---

# 35. ADMIN DIALOGUE MANAGEMENT

Add a Wally content area inside admin, for example:

```text
/admin/content/wally
```

Admins with permission can:

- search dialogue keys;
- edit text;
- add variants;
- enable/disable a variant;
- preview variables;
- preview desktop/mobile;
- duplicate for another locale;
- view where a dialogue key is used.

Do not allow arbitrary code/script in dialogue.

---

# 36. WALLY DEBUG MODE

Development and staging only.

Provide a hidden/dev panel that can:

- select any event type;
- inject test variables;
- preview any animation;
- force High/Standard/Lite/Reduced Motion;
- simulate narrow viewport;
- inspect current queue;
- inspect current state-machine state;
- show last realtime event ID;
- show resolved dialogue key;
- show FPS/basic render diagnostic.

Never expose this unrestricted in production.

---

# 37. IMPLEMENTATION ORDER INSIDE THE OVERALL PROJECT

This Wally plan must align with the phases in `PRODUCT_GUIDE.md`.

## W0 — Contract and placeholders

Do during general product foundations.

Build:

- `/docs/WALLY.md` committed;
- Wally event types;
- database migrations for Wally tables;
- placeholder Wally asset registry;
- no heavy 3D yet.

Acceptance:

- project compiles;
- schema is committed;
- no player gameplay depends on unfinished 3D.

## W1 — Event and dialogue core

Build before Wally visuals become complex.

- event schema;
- controller;
- priority queue;
- dialogue resolver;
- safe variables;
- local debug trigger.

Acceptance:

- test event can resolve deterministic dialogue and state.

## W2 — 2D Wally prototype

Corresponds to parent **Phase 13**.

Build:

- WallyProvider;
- WallyViewport;
- 2D renderer;
- speech bubble;
- entry/exit movement;
- admin trigger panel basic version;
- realtime event handling.

Acceptance:

- Wally reacts to mission completion, bonus points and admin message;
- targeted realtime Wally event appears without refresh;
- no fabricated numbers.

## W3 — Full admin Wally control

Build:

- targeting;
- preview;
- scheduling;
- dialogue selection;
- custom safe text;
- quick actions;
- history;
- audit integration.

Acceptance:

- Game Master can send one player, one country and global event correctly.

## W4 — 3D Wally

Corresponds to parent **Phase 14**.

Build:

- rigged GLB;
- animation registry;
- animation blending;
- movement anchors;
- quality resolver;
- Lite fallback.

Acceptance:

- 3D Wally does not block gameplay;
- Lite mode is feature-equivalent;
- tested mobile performance is acceptable.

## W5 — Day skins and narrative integration

Build:

- day-aware skin resolver;
- Day 1–7 outfits;
- cinematic intros;
- I BELONG symbol moments.

Acceptance:

- day content comes from database/config rather than route hard-coding.

## W6 — Surprise mechanics

Build:

- Wally Drop integration;
- Golden Wally events;
- country takeover;
- live reveal presets.

Acceptance:

- all points and deadlines remain server-authoritative.

## W7 — Audio, analytics and polish

Build:

- sound registry;
- mute/preference;
- event receipts;
- analytics;
- Sentry instrumentation;
- reduced-motion polish;
- spectator mode polish.

## W8 — Production hardening

Run:

- load/realtime tests;
- reconnect tests;
- duplicate suppression tests;
- mobile device tests;
- moderation flow tests;
- admin permission tests;
- Wally asset failure tests.

---

# 38. REQUIRED SEED DATA

Seed at least:

- core dialogue variants for every required event type;
- one default Wally skin;
- one skin per day or placeholder key for each day;
- animation registry keys;
- sound registry keys;
- one global Wally Drop example;
- one country-targeted message example;
- one player-targeted message example;
- final reveal dialogue.

Do not seed fake employee data into production.

---

# 39. ACCEPTANCE CRITERIA — WALLY MVP

Wally MVP is complete only when all are true:

1. Wally is connected to authenticated player state.
2. Wally can greet player by verified first name.
3. Wally can react to a server-approved mission completion.
4. Wally can display exact bonus points from authoritative score event.
5. Wally can receive an admin live trigger without refresh.
6. Admin can target Everyone, Country, Squad and Player according to permissions.
7. Wally can point the player toward an active mission.
8. Dialogue is database/config-driven, not entirely hard-coded in components.
9. 3D failure automatically falls back to Lite Wally.
10. Reduced-motion users can complete every flow.
11. Wally never blocks primary controls.
12. Global Wally publishes create audit logs.
13. Duplicate realtime events do not produce repeated celebrations.
14. Wally does not expose hidden vote results.
15. Wally does not expose another player's private content.
16. Player can mute Wally sound.
17. Spectator screen does not show private messages.
18. Wally works on a modest smartphone using Lite mode.

---

# 40. ACCEPTANCE CRITERIA — “THIS FEELS ALIVE”

Technical completion is not enough.

Before launch, run a human experience test.

A test employee should experience all of this in one session:

1. Opens ITM@15.
2. Wally appears before login as a teaser.
3. Logs in.
4. Wally greets them by first name.
5. Wally introduces the current chapter.
6. A live admin event arrives while they are connected.
7. Wally physically enters or animates differently for that event.
8. Player completes a mission.
9. Wally reacts only after the server confirms it.
10. Player receives a passport/achievement moment.
11. Wally later points them toward another action rather than repeating the same pattern.
12. The experience remains smooth on mobile.

Ask the tester:

> “Did Wally feel like part of the game, or just an animation placed on top of it?”

If the answer is “just an animation,” Wally is not finished.

---

# 41. ANTI-PATTERNS — DO NOT BUILD THESE

Claude must not:

- create Wally as one fixed GIF in the corner;
- hard-code all dialogue inside JSX;
- use client-calculated ranks in Wally messages;
- create a second database specifically for Wally;
- create a second auth system;
- let Wally award points directly;
- make Wally's 3D canvas cover the entire UI and intercept clicks;
- trigger celebration before moderation completes;
- reveal vote totals before reveal rules permit;
- replay the same realtime event on every reconnect;
- require 3D support to play;
- store permanent admin secrets in frontend environment variables;
- allow arbitrary HTML/JavaScript in admin Wally messages;
- make every Wally event a modal;
- make Wally speak every time the user clicks something;
- send excessive notifications to create artificial engagement.

---

# 42. WALLY + WALUMO BRAND OUTCOME

Wally should quietly demonstrate Walumo's capabilities.

Through Wally, ITM@15 demonstrates:

- real-time systems;
- 3D product experience;
- data-driven personalization;
- secure role-based administration;
- live audience targeting;
- workflow automation;
- gamification;
- analytics;
- responsive design;
- content management;
- event technology;
- digital storytelling.

Do not turn Wally into a constant Walumo advertisement.

The product itself is the proof.

The desired question is:

> “Can Walumo build something like this for another company?”

---

# 43. CLAUDE CODE INSTRUCTION FOR WALLY WORK

Whenever Claude Code is asked to implement or change Wally, follow this workflow:

```text
You are working inside the GitHub project ITM@15.

Read, in order:
1. CLAUDE.md
2. docs/PRODUCT_GUIDE.md
3. docs/WALLY.md

For Wally-specific work, docs/WALLY.md is the subsystem specification.
Global security, permissions, scoring, voting, moderation and server-authority rules
from PRODUCT_GUIDE.md remain controlling.

Before coding:
- identify the Wally event(s) involved;
- identify the authoritative data source;
- identify the target audience;
- identify whether the event is local or realtime;
- identify which renderer tiers must support it;
- identify admin/audit requirements.

Then:
1. State the Wally implementation slice.
2. List files and migrations to change.
3. Implement the smallest complete vertical slice.
4. Add/adjust tests.
5. Run lint, typecheck, tests and build.
6. Verify relevant WALLY.md acceptance criteria.
7. Summarize what changed and any remaining dependency.

Never let Wally become authoritative for scores, rankings, deadlines, eligibility,
votes, moderation, permissions or winner calculations.

Wally must always degrade gracefully to a usable Lite experience.
```

---

# 44. FIRST WALLY VERTICAL SLICE TO BUILD

Do not begin by creating seven expensive 3D scenes.

Build this first:

## Scenario: Day Zero — “Meet Another Country”

1. Admin has created two employee accounts.
2. Employees complete onboarding with name, email and country.
3. Admin publishes a cross-country challenge.
4. Connected player receives realtime `wally.triggered` event.
5. Wally walks/animates onto screen.
6. Wally says:

> “{{first_name}}, find someone from another ITM country. Your first connection starts now.”

7. Player opens challenge.
8. Player selects/adds challenge partner as required by game rules.
9. Photo is uploaded.
10. Wally says only:

> “Got it. It’s with the moderators now.”

11. Moderator approves photo.
12. Server writes approval.
13. Server writes score event.
14. Server broadcasts leaderboard/points updates.
15. Wally celebrates:

> “Verified. {{country_name}} just made a new connection. +{{bonus_points}} Unity Points.”

16. Passport stamp unlocks where rules allow.
17. Admin Mission Control reflects completion live.

If this scenario works beautifully and reliably, the rest of Wally can scale from it.

---

# 45. FINAL NORTH STAR

At the end of ITM@15, employees should remember Wally because he helped them participate in the story, not because he occupied screen space.

Wally should have:

- welcomed them;
- remembered their name;
- taken them through ITM's history;
- challenged them;
- made them laugh;
- pushed them to meet someone new;
- celebrated a real achievement;
- delivered live surprises;
- carried the mystery across seven days;
- and finally revealed that the campaign was never only about points.

The final Wally moment should leave the employee with:

# I KNOW THIS STORY.
# I KNOW THESE PEOPLE.
# I BELONG HERE.

And the product should leave leadership with another conclusion:

# WALUMO CAN BUILD EXPERIENCES PEOPLE REMEMBER.

---

**End of `/docs/WALLY.md` specification for `ITM@15`.**
