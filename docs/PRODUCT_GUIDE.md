# WALUMO - ITM 15 WALLY TAKEOVER
## Product Guide and Claude Code Build Specification

**Document purpose:** This is the implementation source of truth for building the ITM 15 "Wally Takeover" digital experience from scratch. Claude Code must follow this document phase by phase. Do not skip foundations in order to jump into visual effects.

**Product owner:** Walumo

**Primary event:** ITM Group 15-Year Anniversary / Annual Review engagement experience

**Primary users:** ITM employees, game administrators, moderators, country administrators, event screens, Walumo product and leadership teams

**Build philosophy:** The product must feel like a live game, not a corporate portal. It must be visually premium, mobile-first, fast, social, competitive, educational, cinematic and easy for administrators to control without changing code.

---

# 1. PRODUCT VISION

Build an experience that makes employees say: **"Walumo built this?"**

The product is a seven-day interactive ITM anniversary experience guided by Wally, Walumo's animated mascot. Employees log in with approved email accounts, discover daily story chapters, answer questions, complete challenges, vote for colleagues, upload photos, meet people from other countries, earn points, unlock badges and interact with live surprise events.

Administrators operate the experience from a real-time Mission Control dashboard. They can change questions, edit points, publish surprise missions, approve photos, change themes, launch votes, send live messages, trigger Wally reactions and monitor participation without asking a developer to redeploy the site.

The public objective is an unforgettable anniversary game. The strategic objective is larger: this becomes a working demonstration of Walumo's ability to build digital engagement, learning, gamification, analytics, real-time interaction and branded enterprise experiences.

## 1.1 Non-negotiable product outcomes

1. Employees should understand more about ITM's history, people, countries and culture after playing.
2. Employees should interact with colleagues outside their normal country, entity or department.
3. Wally must feel present throughout the experience, not decorative.
4. Every day must feel different while still belonging to one coherent story.
5. Admins must be able to control almost all event content without modifying code.
6. Player actions, scores, votes, photos and admin actions must be auditable.
7. Mobile must be the primary gameplay surface.
8. The platform must degrade gracefully on weaker phones instead of breaking because of 3D.
9. The product must be reusable after ITM 15 as a Walumo engagement engine.
10. The experience should be memorable because of participation and human connection, not because of dark patterns or excessive notifications.

---

# 2. CLAUDE CODE OPERATING RULES

Claude Code must treat this document as the project's source of truth.

## 2.1 Rules before writing code

- Read the full guide before creating the repository structure.
- Build one phase at a time in the order defined in Section 26.
- Do not create a feature without defining its database ownership and authorization rules.
- Never store privileged Supabase secrets in browser-accessible code.
- Never allow client-side code to directly decide final points, vote validity, admin permissions or winners.
- Never hard-code day content, questions, points, Wally dialogue or themes if the admin CMS is expected to edit them.
- Every admin change that affects gameplay must create an audit-log entry.
- Every feature must have loading, empty, success and error states.
- Every interactive page must work at mobile widths first.
- Every feature must be keyboard accessible where practical and support reduced-motion preferences.
- No unreviewed user upload may automatically appear on a public event wall.
- Do not use placeholder lorem ipsum in production-facing views. Seed realistic ITM/Walumo demo content.
- Keep the visual experience premium but do not sacrifice performance for unnecessary 3D.

## 2.2 Delivery rule for every phase

A phase is complete only when all four are true:

1. Implementation is complete.
2. Database migrations and RLS are committed.
3. Automated checks/tests for critical behaviour pass.
4. The acceptance criteria in this guide are demonstrably satisfied.

Use meaningful commits such as:

```text
feat(auth): create invite-only employee login flow
feat(admin): add mission control dashboard
feat(game): add authoritative scoring ledger
feat(wally): add runtime behavior state machine
```

---

# 3. RECOMMENDED TECHNICAL STACK

Use a single production-oriented web application unless scaling evidence later requires separation.

| Layer | Recommended technology | Purpose |
|---|---|---|
| Framework | Next.js + TypeScript | Main application, server routes and UI |
| Hosting | Vercel | Production, preview deployments and scheduled jobs |
| Source control | GitHub | Repository, pull requests and CI history |
| Development assistant | Claude Code | Implementation against this guide |
| Database | Supabase PostgreSQL | Product data, game state, scoring, votes and audit data |
| Authentication | Supabase Auth | Email/password login and sessions |
| Realtime | Supabase Realtime Broadcast + Presence | Live events, notifications, leaderboards and online state |
| File storage | Supabase Storage | Photos, approved media, avatars and challenge evidence |
| Email | Resend + React Email | Account notices and daily Wally reminders |
| UI system | Tailwind CSS + shadcn/ui | Responsive interface primitives |
| State | Zustand where local shared state is useful | Client state without excessive complexity |
| Validation | Zod | Input and server payload validation |
| Forms | React Hook Form | Validated admin and player forms |
| Motion | Motion/Framer Motion + GSAP | UI transitions and cinematic sequencing |
| 3D | Three.js + React Three Fiber + Drei | Wally and selected game environments |
| 3D authoring | Blender | Wally model, rig, props and animation clips |
| Error monitoring | Sentry | Production errors and performance diagnostics |
| Product analytics | PostHog or first-party event tables | Funnel and behaviour analytics |

## 3.1 Why this architecture

- Next.js provides one codebase for the player experience, admin dashboard and server endpoints.
- Supabase keeps authentication, Postgres, storage and realtime close together.
- Realtime Broadcast is the default transport for game events and live notifications; Presence is used only for slow-changing online/active-user state.
- Resend handles transactional email separately from game state.
- Wally runs as a dedicated presentation/behaviour layer driven by server-approved events.

---

# 4. PRODUCT ROLES AND PERMISSIONS

## 4.1 Player

Can:
- Sign in using an approved email address and password.
- Complete onboarding.
- View unlocked game days.
- Complete assigned challenges.
- Upload challenge evidence.
- Vote where eligible.
- View permitted leaderboards.
- Receive live notifications.
- View personal passport, achievements and history.

Cannot:
- Change own score.
- Modify game content.
- View hidden vote totals before reveal.
- Approve own evidence.
- Access another user's private submissions.

## 4.2 Moderator

Can:
- Review photo/video/text evidence.
- Approve, reject or request resubmission.
- Flag inappropriate content.
- View moderation queue.

Cannot change global themes, game configuration or super-admin permissions unless separately granted.

## 4.3 Country Admin

Can:
- View their country's participation.
- Manage approved local content if enabled.
- Moderate their country submissions if assigned.
- Send country-targeted messages if allowed.

## 4.4 Game Master

Can:
- Create and edit missions.
- Schedule or launch missions.
- Open/close voting.
- Trigger Wally events.
- Award approved bonus points.
- Change live themes.
- Send notifications.
- Lock/unlock chapters.

## 4.5 Super Admin

Can access all functionality, user administration, permission management, platform configuration and audit records.

## 4.6 Analytics Viewer

Read-only access to dashboards and exports.

---

# 5. AUTHENTICATION AND ACCOUNT CREATION

This product is invite-only. There is no public self-sign-up.

## 5.1 Admin creates an employee account

Admin route: `/admin/players/new`

Form fields:
- Email address - required and unique.
- Full name - optional at creation, required before gameplay.
- Country - optional at creation, required before gameplay.
- Entity/Company - optional but recommended.
- Role - defaults to Player.
- Temporary password - default value: `Walumo`.
- Account status - Active / Disabled.
- Send welcome email - default ON.

### Required security handling for the shared starter password

The product requirement uses `Walumo` as the default starter password. Treat it only as a temporary first-login credential.

On account creation:
- Create the Supabase Auth user on the server only.
- Mark `must_change_password = true` in the application profile.
- On first successful login, redirect the employee to `/first-login` before any game page.
- Require a new private password that meets minimum rules.
- After successful change, set `must_change_password = false`.
- Do not permit the employee to continue using `Walumo` after first login.
- For any public/client reuse of the platform, replace the shared password approach with unique one-time credentials or SSO.

## 5.2 Login page

Route: `/login`

Visual design:
- Full-screen branded cinematic background.
- 3D or lightweight animated Wally on capable devices.
- Prominent ITM 15 / Wally Takeover identity.
- Email input.
- Password input.
- Show/hide password control.
- Sign-in button.
- "Need help?" action.
- Optional language selector if multilingual content is later enabled.

Login behaviour:
1. Validate input.
2. Authenticate through Supabase Auth.
3. Reject disabled application profiles even if an auth session exists.
4. If `must_change_password = true`, go to `/first-login`.
5. If required profile fields are incomplete, go to `/onboarding`.
6. Otherwise route Player to `/play` and Admin roles to `/admin`.

## 5.3 First-login password screen

Route: `/first-login`

Required fields:
- New password.
- Confirm password.

Requirements:
- Minimum 10 characters.
- Recommend mixed character classes, but do not use frustrating rules solely for appearance.
- Disallow exact reuse of `Walumo`.
- Explain: "Create your private password to continue into the game."

## 5.4 Player onboarding

Route: `/onboarding`

Capture:
- Full name.
- Email - read-only, sourced from Auth.
- Country - required.
- Entity/Company - recommended.
- Optional profile photo.
- Consent/acknowledgement for event photo use if required by policy.

The minimum required game identity is exactly: **name, email, country**.

On completion, create/update the player profile and assign the player to an eligible squad if automatic squad assignment is enabled.

---

# 6. LANDING PAGE

Route: `/`

The landing page must immediately establish that this is not a normal intranet.

## 6.1 Above-the-fold sequence

1. Dark or cinematic opening background.
2. ITM 15 identity appears.
3. Wally enters or is revealed.
4. Headline: **One Dream. Many Countries. Thousands of People. One ITM.**
5. Short invitation: "Seven days. One story. Your next mission is waiting."
6. Primary CTA: **Enter the Game**.
7. Secondary CTA for approved users: **Sign In**.

## 6.2 Landing-page sections

- Hero / Wally reveal.
- "15 years in motion" short timeline.
- A map or visual representation of ITM's multinational presence.
- Teaser of seven locked chapters without spoiling missions.
- Short explanation of points, squads and Unity Points.
- Countdown to next unlock when campaign is active.
- Walumo credit presented elegantly, not as an intrusive advertisement.
- Footer with privacy/help links.

## 6.3 Performance rule

The landing page can be visually ambitious, but interaction must become available quickly. Load essential HTML/UI first, then progressively load 3D assets.

---

# 7. PLAYER APPLICATION INFORMATION ARCHITECTURE

Primary authenticated routes:

```text
/play
/play/day/[dayNumber]
/play/mission/[missionId]
/passport
/leaderboards
/gallery
/achievements
/notifications
/profile
/help
```

## 7.1 Player home `/play`

Must show:
- Wally greeting using the player's name.
- Current day/chapter.
- Main mission card.
- Secondary/bonus missions.
- Personal points.
- Unity Points.
- Squad name and current squad position.
- Country position if country leaderboard is enabled.
- Passport progress.
- Achievement progress.
- Countdown to next event/unlock.
- Live event banner.
- Notifications indicator.

Example dynamic greeting:

> "Alexander, Kenya is moving. Your Day 3 mission is open."

Do not use AI to invent authoritative facts such as scores. Wally dialogue receives validated values from game state.

---

# 8. SEVEN-DAY GAME STRUCTURE

Game content must be database-driven. The code provides mechanics; administrators provide the campaign content.

## Day 1 - Origin
Purpose: ITM founding story and historical discovery.

Mechanics:
- Timeline reconstruction.
- Multi-player clue matching.
- Founder story questions.
- Hidden number/eight-person origin Easter egg.

## Day 2 - One ITM, Many Cultures
Purpose: cross-country learning and social discovery.

Mechanics:
- Country questions.
- Language teaching.
- Music selections.
- Cultural mini-challenges.
- Cross-country verification.

## Day 3 - The Journey
Purpose: annual/mid-year review memories and travel history.

Mechanics:
- Photo identification.
- City/year matching.
- Memory stories.
- "Find someone who attended" challenges.

## Day 4 - The People
Purpose: recognition and appreciation.

Mechanics:
- Nomination and voting.
- Quiet Builder, Connector, Problem Solver, Culture Carrier, Unsung Hero, Bridge.
- Mandatory explanation for meaningful recognition categories.

## Day 5 - Walumo / Builders
Purpose: reveal Walumo and teach products through gameplay.

Mechanics:
- KaziPro workflow challenge.
- TalentPro recruitment challenge.
- Sales Tracker field-sales challenge.
- Product Easter eggs and unlocks.

## Day 6 - The Alliance
Purpose: collaboration across boundaries.

Mechanics:
- Group photos.
- Learn-a-phrase missions.
- Song/video challenges.
- Cross-country human-finding missions.
- Unity Points heavily weighted.

## Day 7 - Legacy
Purpose: emotional close and future contribution.

Mechanics:
- 2026 chapter-name prompt.
- What ITM must preserve.
- What ITM must improve.
- Personal contribution pledge.
- I-B-E-L-O-N-G final reveal.

---

# 9. GAME CONTENT ENGINE

The application must not hard-code questions into React components.

## 9.1 Core content hierarchy

```text
Campaign
  -> Game Day
      -> Story Scene
      -> Mission
          -> Challenge
              -> Question / Action / Upload / Vote / Interaction
```

## 9.2 Mission fields

Each mission should support:
- Title.
- Slug.
- Description.
- Day.
- Status: Draft / Scheduled / Live / Paused / Completed / Archived.
- Visibility target.
- Start time.
- End time.
- Base points.
- Unity points.
- Bonus points ceiling.
- Completion rule.
- Evidence type.
- Moderator approval requirement.
- Wally intro dialogue.
- Wally completion dialogue.
- Wally animation state.
- Theme override.
- Asset attachments.
- Prerequisites.
- Retry rule.
- Maximum attempts.
- Result reveal rule.

## 9.3 Challenge types

Implement a reusable challenge renderer supporting at minimum:

1. Single-choice quiz.
2. Multiple-choice quiz.
3. Free-text answer.
4. Short story/long answer.
5. Photo upload.
6. Video upload or video-link submission if storage policy allows.
7. Audio recording/upload.
8. Select colleague.
9. Nomination + reason.
10. Vote.
11. Timed challenge.
12. Cross-country partner challenge.
13. Squad challenge.
14. QR/code discovery.
15. "Find a person" interaction.
16. Image identification.
17. Sequence/order puzzle.
18. Poll.
19. Confirmation/check-in challenge.
20. Admin-verified live challenge.

---

# 10. SCORING ENGINE

Scores are authoritative server-side records.

## 10.1 Never store only a mutable total

Create an append-oriented `score_events` ledger.

Example events:

```text
+100 mission_completed
+200 unity_partner_verified
+50 early_completion_bonus
+300 golden_wally
+75 moderator_creativity_bonus
-100 duplicate_submission_penalty
```

Fields:
- id.
- player_id or squad_id/country_id as appropriate.
- points.
- point_type.
- source_type.
- source_id.
- reason.
- created_by.
- created_at.
- reversible flag.
- reversal_of if reversed.

## 10.2 Admin bonus points

Admin dashboard must support:
- Award to player.
- Award to squad.
- Award to country.
- Required reason.
- Optional note visible to player.
- Maximum bonus guardrail configurable.
- Confirmation modal.
- Audit log entry.

Never permit silent score edits.

## 10.3 Leaderboards

Support:
- Individual.
- Squad.
- Country.
- Optional entity/company.

Admin controls:
- Show/hide each leaderboard.
- Freeze standings.
- Delay public updates.
- Trigger dramatic reveal.
- Reset only in non-production/testing mode.

---

# 11. VOTING AND NOMINATIONS

Voting is a core engine, not an embedded survey.

## 11.1 Poll configuration

Admin can select:
- Single or multiple choice.
- Named or anonymous ballot.
- Eligible voter countries/entities/roles.
- Candidate source: manual choices or eligible employee list.
- Self-voting permitted: yes/no.
- One ballot per player by default.
- Start/end time.
- Public live count: yes/no.
- Results visibility: live / after vote / admin reveal / never public.
- Reason required: yes/no.

## 11.2 Integrity

Enforce vote uniqueness in the database, not just the UI.

Where voting should remain private, store the minimum identity necessary for eligibility and duplicate prevention. Avoid exposing raw ballots in general admin views unless explicitly required.

## 11.3 Reveal experience

Admins can press **Reveal Results**. Connected clients receive a realtime event. The result page animates with Wally and the selected theme.

---

# 12. PHOTO, VIDEO AND MEDIA SYSTEM

Photos are part of the game and must be handled as product data.

## 12.1 Storage buckets

Recommended logical separation:
- `avatars`.
- `challenge-submissions` - private by default.
- `approved-gallery` - public or signed-view depending on policy.
- `admin-media`.
- `wally-assets`.

## 12.2 Upload flow

1. Player chooses media.
2. Client validates type and size before upload.
3. Server/storage policy validates authorization.
4. Create submission record as Pending.
5. Moderator reviews.
6. Moderator approves/rejects/requests resubmission.
7. Approved media becomes eligible for gallery/event-screen use.
8. Wally sends completion/approval reaction where appropriate.

## 12.3 Media metadata

Capture:
- Player.
- Challenge.
- Country.
- Squad.
- Timestamp.
- Moderation status.
- Moderator.
- Caption.
- Tags.
- Featured flag.
- Retention/deletion status.

## 12.4 Admin Media Library

Admins must be able to upload and manage:
- Historical photographs.
- Country images.
- Event photos.
- Walumo/product screenshots.
- Wally illustrations/models.
- Backgrounds.
- Audio tracks.
- Short video clips.

Assets should be tagged by country, year, event, people, theme and usage type.

---

# 13. WALLY EXPERIENCE ENGINE

Wally is the product's emotional interface.

## 13.1 Wally must be data-driven

Create a `WallyController` that receives events such as:

```text
LOGIN_GREETING
MISSION_AVAILABLE
MISSION_COMPLETED
WRONG_ANSWER
CORRECT_ANSWER
ACHIEVEMENT_UNLOCKED
BONUS_POINTS
VOTE_OPENED
PHOTO_APPROVED
PLAYER_INACTIVE
WALLY_DROP
COUNTRY_OVERTAKE
LEADERBOARD_REVEAL
DAY_COMPLETE
FINAL_REVEAL
ADMIN_MESSAGE
```

Each event maps to:
- Animation.
- Position/entry path.
- Dialogue.
- Sound cue.
- Optional confetti/effect.
- Duration.
- Dismissal rule.

## 13.2 Wally animation states

Minimum states:
- Idle.
- Walk.
- Run.
- Wave.
- Celebrate.
- Dance.
- Think.
- Point.
- Shocked.
- Proud.
- Sneak.
- Sleep.
- Talk.
- Exit.

## 13.3 Wally movement

Wally should be able to:
- Enter from screen edges.
- Walk to a UI target.
- Point toward a mission card.
- Celebrate near an achievement.
- Appear as a compact assistant bubble on low-performance devices.
- Move within selected 3D scenes on capable devices.

Do not allow Wally to block critical controls.

## 13.4 Personalised dialogue

Dialogue templates may use safe variables:

```text
{{first_name}}
{{country_name}}
{{squad_name}}
{{points}}
{{country_rank}}
{{mission_title}}
{{next_unlock_time}}
```

Example:

> "{{first_name}}, {{country_name}} just moved to position {{country_rank}}. Your bonus mission is live."

All substituted statistics must come from authoritative server state.

## 13.5 Admin Wally Control

Admin route: `/admin/live/wally`

Controls:
- Target: Everyone / Country / Entity / Squad / Player.
- Animation.
- Message.
- Sound.
- Theme/effect.
- Delivery: now or scheduled.
- Preview before send.

Example:

> "Kenya just took the lead. Senegal, what are you going to do?"

Connected users receive the event instantly.

---

# 14. REAL-TIME ENGINE

Use private authenticated Realtime channels where user-specific or internal data is involved.

## 14.1 Suggested channel topics

```text
game:global
game:day:{dayId}
country:{countryId}
entity:{entityId}
squad:{squadId}
player:{playerId}
admin:mission-control
```

## 14.2 Event catalogue

Minimum broadcast events:

```text
notification.created
mission.published
mission.updated
mission.paused
mission.closed
theme.changed
wally.triggered
vote.opened
vote.closed
vote.revealed
leaderboard.updated
leaderboard.frozen
leaderboard.revealed
submission.approved
submission.rejected
points.awarded
achievement.unlocked
day.unlocked
game.paused
game.resumed
```

## 14.3 Presence

Use Presence for:
- Online user counts.
- Country active counts.
- Current page/day where useful.

Do not use Presence for cursor tracking or rapid animation state. Use Broadcast for active game events.

---

# 15. NOTIFICATION SYSTEM

Notifications exist in two forms: persistent notifications and live on-screen interruptions.

## 15.1 Persistent notifications

Examples:
- New mission available.
- Photo approved.
- Bonus points awarded.
- Vote opened.
- Achievement unlocked.
- Day unlocked.

Store them in a `notifications` table with read/unread state.

## 15.2 Live on-screen notifications

Admin Mission Control can send a targeted message that appears immediately to connected players.

Admin options:
- Audience.
- Severity/style: Info / Celebration / Urgent / Wally Drop.
- Title.
- Message.
- CTA label and URL.
- Duration.
- Wally animation.
- Sound on/off.
- Schedule now/later.

## 15.3 Notification UX

Use toasts for low-priority messages, banners for persistent event state, and modal/cinematic takeovers only for high-value moments. Do not constantly interrupt users.

---

# 16. DAILY WALLY EMAIL REMINDERS

Every active approved employee receives a daily email from Wally during the campaign.

## 16.1 Delivery logic

Use a scheduled Vercel job to call a protected server route once per day at the campaign's configured reminder time.

The job:
1. Loads active campaign.
2. Loads active players.
3. Determines current game day and player completion state.
4. Selects the appropriate email variant.
5. Sends through Resend.
6. Records delivery attempt/status.

Every email contains the canonical game link.

## 16.2 Email variants

### New day unlocked
Subject example: `Wally has unlocked Day 3 - your mission is waiting`

Message:
- Personalized greeting.
- One-sentence tease.
- Current chapter.
- CTA button: **Play Now**.
- Direct URL fallback.

### Mission incomplete
Subject: `Wally noticed something...`

Use respectful, playful language. Do not shame the employee.

### Player already completed main mission
Send the new/bonus content message instead of pretending they have not played.

## 16.3 Admin email controls

Admin can configure:
- Campaign email sender name.
- Reminder time.
- Enable/disable daily email.
- Preview email.
- Send test email.
- Resend failed delivery.

---

# 17. ADMIN MISSION CONTROL

Primary admin route: `/admin`

The dashboard should feel like an event operations center.

## 17.1 Main dashboard header

Display:
- Campaign status.
- Current day.
- Players online now.
- Total active accounts.
- Countries active.
- Main mission completion rate.
- Pending moderation count.
- Live vote status.
- Current theme.

## 17.2 Real-time widgets

1. **Live Activity Feed** - latest completions, approvals, achievements and admin actions.
2. **Online Players** - count and breakdown.
3. **Country Activity** - active players and completion rates.
4. **Mission Completion** - real-time progress.
5. **Leaderboard Snapshot**.
6. **Pending Reviews**.
7. **Notification Status**.
8. **Upcoming Scheduled Events**.
9. **Wally Status** - latest trigger and current global behaviour.
10. **System Health** - errors, email failures and realtime connection warnings.

## 17.3 Quick Action buttons

- Launch Challenge.
- Send Notification.
- Trigger Wally.
- Award Bonus Points.
- Open Vote.
- Change Theme.
- Unlock Day.
- Feature Photo.
- Pause Game.

Each opens a confirmation/preview flow appropriate to its risk.

---

# 18. ADMIN CONTENT EDITOR

Route group: `/admin/content`

Admins must be able to tune the game without code.

## 18.1 Question editor

Functions:
- Create/edit/archive.
- Rich text prompt.
- Add image/audio/video.
- Answer options.
- Correct answer where relevant.
- Explanation after answer.
- Points.
- Time limit.
- Country targeting.
- Randomize options.
- Retry policy.
- Preview as player.

## 18.2 Mission editor

Use a guided builder:

**Step 1 - Basics**: title, description, day.

**Step 2 - Audience**: everyone/country/entity/squad/player rules.

**Step 3 - Challenge**: type, prompts and evidence.

**Step 4 - Scoring**: base, Unity and bonus points.

**Step 5 - Wally**: intro/completion dialogue and animation.

**Step 6 - Timing**: start/end/schedule.

**Step 7 - Theme**: default or override.

**Step 8 - Preview**.

**Step 9 - Save Draft / Publish / Schedule**.

## 18.3 Safe editing of live content

If a live mission is edited:
- Show a warning.
- Create a content revision.
- Record admin and timestamp.
- Do not retroactively invalidate completed submissions unless admin explicitly chooses a migration/review action.

---

# 19. THEME ENGINE

Admins should be able to change the visual mood without redeployment.

## 19.1 Theme structure

A theme can define:
- Theme name.
- Background color/gradient.
- Accent color.
- Text colors.
- Card treatment.
- Background image/video.
- 3D environment asset.
- Wally outfit/skin reference.
- Sound pack.
- Confetti/effect pack.
- Logo treatment.
- Optional country motif.

Store theme tokens as validated JSON plus asset references.

## 19.2 Runtime theme switching

Admin clicks **Activate Theme**.

System:
1. Saves active theme.
2. Creates audit event.
3. Broadcasts `theme.changed`.
4. Connected clients transition without full refresh.

## 19.3 Theme presets

Seed at least:
- Origin / Heritage.
- Africa / Culture.
- Journey / Passport.
- Recognition / Gold.
- Walumo / Future Lab.
- Alliance / Festival.
- Legacy / Future 2041.

---

# 20. 3D AND VISUAL EXPERIENCE

The visual standard should be premium and cinematic, but 3D is a tool rather than the product itself.

## 20.1 Where to use 3D

Use 3D for:
- Wally.
- Day/scene intros.
- Country/map portals.
- Key Easter eggs.
- Final reveal.
- Optional event-screen scenes.

Use normal highly polished UI for:
- Forms.
- Voting.
- Long text.
- Admin dashboard.
- Data tables.
- Moderation.

## 20.2 Progressive rendering levels

Implement three quality modes:

**High:** full Wally 3D + richer scene effects.

**Standard:** simplified 3D Wally + reduced scene complexity.

**Lite:** 2D/animated Wally fallback + static backgrounds.

Select automatically based on device/performance signals and allow user override.

## 20.3 Asset constraints

- Prefer GLB/GLTF.
- Compress geometry and textures.
- Lazy-load non-essential assets.
- Keep mobile memory use controlled.
- Use poster images while 3D scenes load.
- Provide reduced-motion alternative.

---

# 21. GALLERY AND EVENT WALL

## 21.1 Player gallery

Route: `/gallery`

Only approved/featured content appears.

Filters:
- Day.
- Country.
- Challenge.
- Squad.
- Featured.

## 21.2 Spectator/event screen

Route: `/screen`

This route is optimized for a large display and does not expose admin controls.

Rotating modules:
- Live leaderboard.
- Approved photo wall.
- Current mission.
- Countdown.
- Country activity.
- Voting reveal.
- Wally messages.
- Recent achievements.

Admin can choose what the screen currently displays from Mission Control.

---

# 22. ANALYTICS AND WALUMO IMPACT

Build analytics from the beginning rather than trying to reconstruct them afterward.

## 22.1 Core campaign KPIs

- Accounts invited.
- First logins.
- Daily active players.
- Day-by-day retention.
- Mission-start rate.
- Mission-completion rate.
- Votes cast.
- Submissions uploaded.
- Approved media count.
- Cross-country interactions.
- Unity Points earned.
- Number of unique country connections.
- Email delivery/open/click where available and policy-compliant.
- Average mission completion time.
- Realtime active users.
- Wally interactions.

## 22.2 Belonging/learning outcomes

Use explicit, ethical questions rather than inferring sensitive traits.

Possible measurements:
- "I learned something new about another ITM country."
- "I interacted with someone I had not worked with before."
- "I understand the ITM story better."
- "I better understand what Walumo builds."

## 22.3 Post-event report

Admin can export or generate a summary containing:
- Participation.
- Country performance.
- Most engaging missions.
- Cross-country connections.
- Top approved memories.
- Recognition themes.
- Product-learning interactions.
- Operational lessons.

This becomes evidence of Walumo's product capability.

---

# 23. DATABASE MODEL

Use UUID primary keys unless a strong reason exists otherwise.

Minimum tables:

```text
campaigns
profiles
countries
entities
user_roles
squads
squad_members
game_days
story_scenes
missions
mission_targets
challenges
challenge_options
submissions
submission_participants
media_assets
media_submissions
polls
poll_options
votes
score_events
achievements
player_achievements
passport_stamps
wally_dialogues
wally_events
notifications
themes
scheduled_events
email_deliveries
analytics_events
audit_logs
```

## 23.1 Important profile fields

```text
id -> references auth.users
email
full_name
first_name
country_id
entity_id
role/status
must_change_password
onboarding_completed
avatar_path
created_at
updated_at
```

## 23.2 Required constraints

- One profile per auth user.
- Email uniqueness through auth identity.
- Vote uniqueness according to poll rule.
- Submission ownership constraints.
- Score ledger immutability or controlled reversal rather than direct destructive edits.
- Foreign-key integrity for missions, days and campaigns.

---

# 24. SECURITY AND PRIVACY REQUIREMENTS

## 24.1 Authentication

- Invite-only accounts.
- Server-side admin user creation.
- Forced password replacement after the temporary `Walumo` credential.
- Session expiry/re-authentication rules appropriate to admin actions.

## 24.2 Authorization

Use Postgres RLS for player data and storage access.

Examples:
- Player can read own private profile fields.
- Player can submit to eligible live missions only.
- Player cannot insert `score_events` directly.
- Player cannot create admin notifications.
- Moderator can access pending submissions according to scope.
- Admin actions go through authorized server endpoints.

## 24.3 Upload security

- Allowed MIME types.
- Maximum file sizes.
- Randomized object paths.
- No executable uploads.
- Private original submission bucket.
- Signed URLs or controlled access.
- Moderation before event-wall display.

## 24.4 Abuse protection

- Rate-limit login and sensitive endpoints.
- Prevent duplicate challenge submissions where rules disallow them.
- Server timestamps for deadlines.
- Do not trust client clocks.
- Validate audience eligibility server-side.
- Keep secrets in Vercel environment variables.

## 24.5 Audit logging

Log at minimum:
- User creation/disablement.
- Role changes.
- Point awards/reversals.
- Mission publish/edit/pause.
- Vote open/close/reveal.
- Theme change.
- Wally mass messages.
- Media moderation.
- Campaign pause/resume.

---

# 25. REPOSITORY STRUCTURE

Recommended repository:

```text
itm15-wally/
├── app/
│   ├── (public)/
│   │   └── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   ├── first-login/
│   │   └── onboarding/
│   ├── (game)/
│   │   ├── play/
│   │   ├── passport/
│   │   ├── leaderboards/
│   │   ├── gallery/
│   │   ├── achievements/
│   │   ├── notifications/
│   │   └── profile/
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── live/
│   │   ├── players/
│   │   ├── content/
│   │   ├── missions/
│   │   ├── voting/
│   │   ├── submissions/
│   │   ├── scoring/
│   │   ├── themes/
│   │   ├── media/
│   │   ├── analytics/
│   │   ├── audit/
│   │   └── settings/
│   ├── screen/
│   └── api/
├── components/
│   ├── admin/
│   ├── game/
│   ├── ui/
│   └── wally/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── realtime/
│   ├── scoring/
│   ├── voting/
│   ├── notifications/
│   ├── email/
│   └── validation/
├── game-engine/
│   ├── challenges/
│   ├── rules/
│   ├── scoring/
│   ├── achievements/
│   └── scheduler/
├── wally/
│   ├── models/
│   ├── animations/
│   ├── behavior/
│   ├── dialogue/
│   └── audio/
├── emails/
├── public/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── tests/
├── tests/
├── docs/
│   └── PRODUCT_GUIDE.md
└── CLAUDE.md
```

`CLAUDE.md` should point Claude Code to `docs/PRODUCT_GUIDE.md` and repeat the non-negotiable operating rules.

---

# 26. STEP-BY-STEP BUILD PLAN FOR CLAUDE CODE

Claude must execute these phases in order.

## PHASE 0 - Repository and quality foundation

### Build
- Create GitHub repository.
- Initialize latest stable Next.js with TypeScript.
- Add Tailwind and shadcn/ui.
- Configure ESLint/formatting.
- Add environment validation with Zod.
- Connect Vercel project.
- Create preview/production environment strategy.
- Add Sentry placeholder/config.
- Create `/docs/PRODUCT_GUIDE.md` and `CLAUDE.md`.

### Acceptance
- App deploys to Vercel Preview.
- CI/build succeeds.
- No secrets committed.

## PHASE 1 - Supabase foundation

### Build
- Create Supabase project.
- Add migrations for profiles, countries, entities, roles, campaigns and audit logs.
- Add server/client Supabase helpers.
- Establish RLS from the first migration.
- Seed initial countries and admin account configuration.

### Acceptance
- Database can be rebuilt from migrations.
- Anonymous browser cannot read private player data.

## PHASE 2 - Invite-only authentication

### Build
- Login page.
- Admin-only create-user server action/API.
- Temporary `Walumo` password default.
- `must_change_password` gating.
- First-login password change.
- Disabled user handling.
- Role-aware redirects.

### Acceptance
- Unknown email cannot self-register.
- Admin can create player.
- Player can login with starter password once.
- Player must create private password before entering game.
- Admin routes reject normal players.

## PHASE 3 - Landing page and onboarding

### Build
- Cinematic landing page.
- Progressive Wally teaser.
- Campaign countdown/status.
- Onboarding form: name, email read-only, country required, entity optional.

### Acceptance
- Landing loads well on mobile.
- Incomplete user cannot bypass onboarding.
- Profile displays correctly after completion.

## PHASE 4 - Player shell

### Build
- Navigation.
- `/play` dashboard.
- Passport placeholder.
- Leaderboard placeholder.
- Achievements placeholder.
- Notifications center.
- Responsive layout.

### Acceptance
- A player can move through all authenticated player routes.
- No admin navigation leaks to players.

## PHASE 5 - Admin Mission Control shell

### Build
- Admin layout.
- Real-time KPI cards.
- Players table.
- Role filters.
- Audit viewer.
- Quick-action placeholders.

### Acceptance
- Admin can monitor account state.
- Responsive desktop/tablet dashboard.
- Role-based navigation works.

## PHASE 6 - Content engine

### Build
- Campaigns.
- Days.
- Missions.
- Challenge schema.
- Question editor.
- Mission editor with draft/preview/publish.
- Revision handling.

### Acceptance
- Admin creates a mission without code.
- Player sees newly published eligible mission.
- Draft mission is invisible to player.

## PHASE 7 - Submission engine

### Build
- Question-answer submission.
- Free-text submission.
- Completion state.
- Attempts/retry rules.
- Server deadline validation.

### Acceptance
- Player completes a mission end-to-end.
- Expired mission rejects late completion when configured.

## PHASE 8 - Authoritative scoring and leaderboards

### Build
- `score_events` ledger.
- Mission score rules.
- Bonus points admin flow.
- Player/squad/country aggregation.
- Leaderboards.

### Acceptance
- Browser cannot award itself points.
- Every point can be traced to a source/reason.
- Bonus points create audit entries.

## PHASE 9 - Voting and nominations

### Build
- Poll editor.
- Employee candidate selector.
- Eligibility rules.
- Vote uniqueness.
- Nomination + reason.
- Admin-controlled result reveal.

### Acceptance
- Self-vote rule works.
- Duplicate vote blocked at database/server level.
- Reveal can happen live.

## PHASE 10 - Media uploads and moderation

### Build
- Storage buckets/policies.
- Player upload UI.
- Moderation queue.
- Approve/reject/resubmit.
- Approved gallery.
- Media library.

### Acceptance
- Unapproved image cannot appear on public gallery/event screen.
- Player cannot see another player's private source upload unless rules allow.

## PHASE 11 - Realtime engine

### Build
- Broadcast helper.
- Private channels.
- Presence.
- Live activity feed.
- Realtime mission publish.
- Realtime notification delivery.
- Realtime leaderboard refresh signal.

### Acceptance
- Two browsers see a published Wally Drop without refresh.
- Admin online count changes as users connect/disconnect.

## PHASE 12 - Admin notifications and live controls

### Build
- Notification composer.
- Audience targeting.
- CTA links.
- Live toast/banner/modal delivery.
- Schedule support.
- Pause/resume game.

### Acceptance
- Admin can target one player and that player alone receives private message.
- Global announcement reaches all connected eligible players.

## PHASE 13 - Wally 2D behaviour prototype

### Build
- Wally event state machine using lightweight animated placeholder assets.
- Dialogue templates.
- Personalised variables.
- Admin trigger panel.

### Acceptance
- Wally reacts to mission completion, bonus points and admin message.
- Wally never displays fabricated score/rank values.

## PHASE 14 - Wally 3D

### Build
- Import rigged GLB.
- Animation mixer/state mapping.
- Walk/run/wave/celebrate/dance/think/point/shocked/proud/sneak/sleep/talk.
- Screen movement paths.
- Quality detection and Lite fallback.

### Acceptance
- 3D Wally does not block gameplay.
- Lite mode remains fully usable.
- Mobile performance target is acceptable under test devices.

## PHASE 15 - Themes and cinematic day scenes

### Build
- Theme editor.
- Runtime CSS token application.
- Theme broadcast.
- Seven presets.
- Optional day intro 3D scenes.

### Acceptance
- Admin changes theme live without redeploy.
- Connected player transitions to new theme.

## PHASE 16 - Email automation

### Build
- Resend integration.
- React Email templates.
- Account-created email.
- Daily Wally email.
- Protected Vercel cron endpoint.
- Delivery log.
- Admin preview/test controls.

### Acceptance
- Every active test employee receives campaign email with correct game link.
- Daily template changes based on completion status.
- Failed sends are visible to admin.

## PHASE 17 - Achievements and passport

### Build
- Achievement rules.
- Passport stamps.
- Cross-country interaction validation.
- Badge animations.

### Acceptance
- Player can unlock a country stamp and achievement from valid activity.
- Duplicate stamp rules behave correctly.

## PHASE 18 - Spectator/event screen

### Build
- `/screen` display mode.
- Admin screen controller.
- Leaderboard/photo/current-mission/vote reveal modules.

### Acceptance
- Large display can run unattended.
- Admin changes its content remotely.

## PHASE 19 - Analytics

### Build
- Analytics event taxonomy.
- Admin charts and funnels.
- Country comparisons.
- Completion/retention metrics.
- Export.

### Acceptance
- Admin can answer who logged in, who completed each day and which missions drove the most engagement.

## PHASE 20 - Security, performance and load testing

### Build/Test
- RLS review.
- Admin endpoint authorization review.
- Rate limiting.
- Upload abuse tests.
- Vote/scoring integrity tests.
- Realtime reconnect behaviour.
- Image optimization.
- 3D bundle optimization.
- Accessibility/reduced motion.
- Simulated concurrent players.

### Acceptance
- No critical authorization issue remains.
- Core game loop works after reconnect.
- Slow-device mode is usable.

## PHASE 21 - Day Zero rehearsal

Run one complete realistic test:

1. Admin adds Alexander's approved email.
2. Welcome instructions are sent.
3. Alexander signs in using the temporary credential.
4. Alexander creates a private password.
5. Alexander completes name/email/country onboarding.
6. Wally greets Alexander by name.
7. Admin publishes: "Find someone from another ITM country."
8. Alexander and a Senegal participant submit a photo.
9. Moderator approves.
10. Both receive Unity Points.
11. Leaderboards update.
12. Wally celebrates.
13. Senegal stamp unlocks in Alexander's passport.
14. Admin sees the activity in Mission Control.
15. Event screen can feature the approved photo.

Do not proceed to real campaign launch until this loop is reliable.

---

# 27. ADMIN DASHBOARD DETAILED ROUTES

```text
/admin                         Mission Control overview
/admin/players                 Users, status, country, roles
/admin/players/new             Add employee/admin account
/admin/live                    Live event operations
/admin/live/wally              Wally controller
/admin/content                 Story/questions/content
/admin/missions                Mission list
/admin/missions/new            Mission builder
/admin/voting                  Polls and nominations
/admin/submissions             Moderation queue
/admin/scoring                 Bonuses and score ledger
/admin/themes                  Theme editor
/admin/media                   Media library
/admin/notifications           Notification history/composer
/admin/schedule                Scheduled events
/admin/analytics               Engagement analytics
/admin/audit                   Audit log
/admin/settings                Campaign/global settings
```

---

# 28. CRITICAL ADMIN EXPERIENCES

## 28.1 Add employee

Admin clicks **Add Player**.

Fields:
- Email.
- Name optional.
- Country optional.
- Entity optional.
- Role.
- Temporary password defaults to Walumo.

After create:
- Success card.
- "Welcome email queued/sent" status.
- Copy game link.
- Create another.

## 28.2 Tune a live question

Admin opens question.

The page shows:
- Current live version.
- Edit draft.
- Preview phone view.
- "Players already completed: X" warning.
- Publish revision.

## 28.3 Award bonus

Admin chooses target, amount and reason.

Preview:
> "Award +250 points to Squad Umoja for Best Cross-Country Video?"

Confirm creates score event + audit event + targeted Wally celebration.

## 28.4 Change theme live

Admin selects preset or custom theme.

Preview first.

Click **Activate for Everyone**.

All connected players receive a smooth theme transition.

## 28.5 Send surprise notification

Admin writes:
> "WALLY DROP: Find someone from a country whose flag contains green. 15 minutes."

Select target: Everyone.

Select Wally: Run + Point.

Select timer: 15 minutes.

Publish.

The game creates challenge + notification + Wally event together.

---

# 29. PLAYER ENGAGEMENT DESIGN PRINCIPLES

The product should be compelling without becoming manipulative.

## 29.1 Use anticipation

- Locked chapters.
- Countdown to next reveal.
- Wally hints.
- Unknown bonus missions.

## 29.2 Use social connection

- Cross-country squads.
- Partner validation.
- Shared Unity Points.
- Recognition and gratitude.

## 29.3 Use progress

- Passport stamps.
- Achievement collections.
- Visible chapter completion.
- Points and country progress.

## 29.4 Use surprise sparingly

- Wally Drops.
- Golden Wally.
- Surprise theme switch.
- Country takeover.

If everything is a surprise, nothing feels special.

## 29.5 Use learning invisibly

The employee should learn ITM history, culture and Walumo products through action rather than long lessons.

Example:
- Do not show a 10-slide KaziPro deck.
- Give players a workflow problem and let the solution reveal KaziPro.

---

# 30. WALUMO BRAND POSITIONING

The product should communicate Walumo's capability through execution, not repeated self-promotion.

Visible Walumo moments:
- Opening credit: "An experience by Walumo."
- Day 5 product story.
- Subtle footer/credits.
- Final film/end screen.

What the experience should prove:
- Walumo understands people and product design.
- Walumo can ship polished enterprise applications.
- Walumo can build real-time systems.
- Walumo can turn business learning into participation.
- Walumo can build reusable technology, not one-off presentations.

Avoid turning every page into a Walumo advertisement. The quality of the experience is the strongest advertisement.

---

# 31. ENVIRONMENT VARIABLES

Create `.env.example`; never commit real values.

```text
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
RESEND_API_KEY=
EMAIL_FROM=
CRON_SECRET=
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
POSTHOG_KEY=
POSTHOG_HOST=
```

Use the current Supabase key naming recommended by the project dashboard. Privileged secrets remain server-only.

---

# 32. SEED DATA REQUIREMENTS

Development seed must create:
- One active campaign.
- Seven game days.
- At least five countries.
- Two entities.
- One super admin.
- Two moderators.
- Twenty sample players.
- Four squads.
- Example questions for each challenge type.
- One live vote.
- Sample approved and pending photos using safe placeholder assets.
- Seven theme presets.
- Wally dialogue templates.
- Sample achievements.

This allows Claude and the team to test the experience realistically from the first week.

---

# 33. TEST PLAN

## 33.1 Authentication tests

- Unknown email fails.
- Disabled user fails.
- Temporary password redirects to first-login.
- Changed password works.
- Player cannot access admin routes.

## 33.2 Game tests

- Mission visibility obeys target and time.
- Correct answer scoring.
- Retry limit.
- Expiry.
- Partner requirement.

## 33.3 Score tests

- Client cannot forge points.
- Duplicate completion does not double-pay unless configured.
- Reversal behaves correctly.

## 33.4 Vote tests

- Eligibility.
- Duplicate prevention.
- Self-vote restriction.
- Reveal control.

## 33.5 Upload tests

- Invalid type rejected.
- Oversized file rejected.
- Pending not public.
- Approved becomes viewable.

## 33.6 Realtime tests

- Publish mission without refresh.
- Targeted notification.
- Wally event.
- Theme update.
- Reconnect after network interruption.

## 33.7 Admin tests

- Every privileged action requires role authorization.
- Every critical change creates audit event.

---

# 34. DEFINITION OF MVP

The minimum launchable version is not "all seven days look perfect." It is a reliable core loop.

MVP must include:
- Landing page.
- Invite-only login.
- First-login password change.
- Onboarding with name/email/country.
- Player home.
- Admin user management.
- Mission builder.
- At least quiz, photo, nomination and partner challenge types.
- Server-side score ledger.
- Individual/squad/country leaderboards.
- Voting.
- Media moderation.
- Realtime mission/notification delivery.
- Wally 2D behaviour engine.
- Daily email reminder.
- Basic analytics.

Only after the loop is stable should full 3D scenes become launch blockers.

---

# 35. DEFINITION OF PREMIUM LAUNCH

Premium launch adds:
- Fully rigged 3D Wally.
- Seven visual themes.
- Selected 3D environments.
- Audio design.
- Event-screen mode.
- Golden Wally mechanics.
- Advanced achievements/passport.
- Cinematic vote reveals.
- Automatic campaign recap media selection.
- Deep analytics and post-event report.

---

# 36. FINAL PRODUCT QUALITY BAR

Before launch, ask these questions:

1. Can an employee understand what to do in under 20 seconds after login?
2. Does Wally make the experience feel alive without becoming annoying?
3. Can an admin change tomorrow's challenge without contacting a developer?
4. Can an admin send a live message to one country immediately?
5. Can a photo challenge be submitted, moderated, scored and featured without manual database work?
6. Are scores and votes protected from simple browser manipulation?
7. Does the game still work on a modest smartphone?
8. Does the first minute look good enough that an employee wants to show a colleague?
9. Does each day teach or reveal something meaningful?
10. At the end, can Walumo point to measurable engagement rather than only say that people "liked it"?

If the answer to any critical question is no, fix that before adding another visual effect.

---

# 37. CLAUDE CODE STARTING INSTRUCTION

Place this exact instruction in the repository `CLAUDE.md`:

```text
You are implementing the Walumo ITM 15 Wally Takeover product.

The authoritative product specification is docs/PRODUCT_GUIDE.md.
Read it fully before making architectural decisions.

Implement the phases in Section 26 in order. Do not skip database, authorization,
admin-control or acceptance requirements to jump ahead to 3D work.

For every phase:
1. State the phase being implemented.
2. List files/migrations you will change.
3. Implement the smallest complete vertical slice.
4. Run lint/typecheck/tests/build.
5. Verify the phase acceptance criteria.
6. Summarize what is complete and what remains.
7. Commit with a meaningful conventional commit message.

Business rules that must never be client-authoritative:
- permissions
- scores
- votes
- deadlines
- mission eligibility
- moderation status
- winner calculations

Game content should be database-driven when administrators are expected to edit it.
Every high-impact admin action must be auditable.
Mobile is the primary player experience.
Wally must enhance gameplay without blocking it.
```

---

# 38. FINAL NORTH STAR

The finished product should not feel like an HR quiz wearing game colours.

It should feel like ITM's history has become playable.

An employee should be able to log in, see Wally move toward them, hear that their country has just changed position, discover a mission that requires meeting someone they do not know, take a photo together, receive approval and Unity Points, see the leaderboard change live, unlock a country stamp and then wonder what Wally will do tomorrow.

An administrator should be able to watch this happen from Mission Control, tune a question, award a justified bonus, switch the visual theme, open a vote and send a message to hundreds of connected employees without calling a developer.

And at the end of the seven days, the strongest product message should not need to be written on a banner.

People should already be asking:

**"Who built this?"**

The answer is:

**Walumo.**
