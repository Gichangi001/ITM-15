# ITM@15 — STORYLINE & EXPERIENCE BUILD BIBLE

## Status
Authoritative creative and product-experience specification for the `Gichangi001/ITM-15` repository.

## Purpose
This document tells Claude Code **exactly how ITM@15 should feel and flow** from the first public landing page through login, onboarding, Day 1, Day 2, Day 3, Day 4, Day 5, Day 6, Day 7, the final reveal, and post-event memory.

This is not a page list. It is the **experience choreography** of ITM@15.

The finished product must feel like a premium interactive event, a social game, a cultural celebration, a live competition, and a digital story about ITM's first 15 years and the people who will build the next 15.

Claude must use this document together with:

- `CLAUDE.md`
- `ITM15_MASTER_BUILD_RUNBOOK.md`
- `ITM15_PROJECT_AUDIT_AND_PENDING_CONTROL.md`
- `docs/PRODUCT_GUIDE.md` or the actual Product Build Guide filename in the repository
- `docs/WALLY.md`
- all current ADRs, architecture documents, project-state files, security requirements, and test gates

If this document describes an experience that requires backend support, Claude must implement the backend, admin, realtime, audit, moderation, security, and testing required to make the experience real. Do not fake live functionality with hard-coded UI.

---

# 1. THE BIG IDEA

## ITM@15: THE STORY IS ALIVE

The player should never feel that they opened an anniversary website.

They should feel that they have **entered ITM's story**.

The game begins before Day 1. It begins the moment someone lands on the website.

The emotional progression is:

**Curiosity → Identity → Discovery → Competition → Connection → Pride → Belonging → Legacy**

The seven days must escalate.

Day 1 answers: **Where did we begin?**

Day 2 answers: **Who are we across cultures?**

Day 3 answers: **Where have we travelled together?**

Day 4 answers: **Who made the journey matter?**

Day 5 answers: **What are we building now?**

Day 6 answers: **Can we win together?**

Day 7 answers: **What will we become next?**

The final emotional answer is:

# I BELONG.

The letters `I B E L O N G` are secretly planted across the seven-day experience. The player should notice them, collect them, speculate about them, but not understand the full meaning until the finale.

---

# 2. THE EXPERIENCE STANDARD

Claude must build toward the following standard.

The player should repeatedly think:

- "What happens if I click this?"
- "How did Wally know that?"
- "My country just overtook us?"
- "Who is hiding the Golden Wally?"
- "I need one more person from another country."
- "Why did the leaderboard disappear?"
- "What is tomorrow's chapter?"
- "That photo is ours!"
- "I didn't know that about ITM."
- "I actually know people from other entities now."
- "Walumo built this?"

Every major interaction must provide at least one of these:

1. **Feedback** — sound, animation, Wally response, score, badge, motion.
2. **Consequence** — points, unlock, vote, progress, leaderboard movement.
3. **Discovery** — story, memory, clue, image, hidden object, country detail.
4. **Connection** — another employee, squad, country, recognition, collaboration.
5. **Anticipation** — locked chapter, timer, mystery item, scheduled reveal.

Avoid dead clicks and dead screens.

---

# 3. CORE PRODUCT LOOP

The repeatable gameplay loop is:

**Wally appears → Story hook → Mission appears → Player acts → System verifies → Immediate reaction → Points/progress → Social consequence → New clue/unlock → Next anticipation**

Example:

1. Wally runs onto screen.
2. "Alexander, Senegal just passed Kenya. I wouldn't let that stand."
3. A glowing mission card expands.
4. "Find someone from a country you have never interacted with."
5. Player selects or scans a colleague and uploads a photo.
6. Moderator approves or automatic rules validate applicable fields.
7. Wally celebrates.
8. `+200 UNITY POINTS` bursts upward.
9. Kenya's country score moves.
10. Senegal and Kenya positions animate on the leaderboard.
11. A passport stamp unlocks.
12. A fragment of the hidden Day clue appears.
13. The next challenge timer begins.

That is the expected quality of a basic mission.

---

# 4. GLOBAL EXPERIENCE LAYOUT

Every authenticated game screen should share a coherent game shell.

## Desktop shell

Top bar:

- ITM@15 logo
- Current Day / Chapter
- Live event indicator
- Personal points
- Unity Points
- Country rank
- Notifications
- Profile/avatar

Left or floating navigation:

- Home
- Today's Mission
- Passport
- Squad
- Leaderboards
- Gallery
- Achievements
- Story Vault

Right / contextual area:

- Wally zone
- live hint
- current countdown
- optional mini leaderboard

## Mobile shell

Bottom navigation should prioritize:

- Home
- Mission
- Wally
- Leaderboard
- Passport

Notifications and profile can live in the top-right.

The mobile game must not feel like a compressed desktop dashboard. It should feel purpose-built for one-handed play.

---

# 5. BUTTON & INTERACTION DESIGN SYSTEM

Buttons are a major part of the game language.

## Primary action button

Visual:

- subtle luminous edge
- slow breathing glow while actionable
- brighter halo on hover/focus
- small 3D lift on hover
- tactile 1–2 px press movement on click
- optional soft haptic on supported devices
- glow should match current Day theme

Example labels:

- `ENTER THE STORY`
- `BEGIN MISSION`
- `LOCK IN ANSWER`
- `CAST MY VOTE`
- `UPLOAD PROOF`
- `CLAIM REWARD`
- `OPEN THE VAULT`
- `JOIN THE DROP`
- `REVEAL` only where the user is meant to trigger a reveal

On click:

1. button compresses;
2. glow flashes;
3. action starts immediately;
4. loading state is visible if required;
5. Wally may react;
6. success or failure is explicit.

Never leave the user wondering whether the click worked.

## Secondary button

Quieter outline/glass treatment. Use for non-critical navigation.

## Locked button

Darkened, visible lock, readable reason.

Example:

`UNLOCKS IN 03:14:27`

Clicking a locked button may make Wally appear with a hint instead of doing nothing.

## Rare / Golden action

Used sparingly for Golden Wally, secret rooms, final reveals, major reward claims.

It should feel visually different from normal primary actions.

Do not overuse gold. Rarity creates value.

## Destructive admin action

Never style like a game reward. Clear warning, confirmation, role checks, audit log.

---

# 6. MOTION LANGUAGE

The UI should feel alive but controlled.

Use motion for:

- page chapter transitions;
- card reveals;
- leaderboard overtakes;
- point gains;
- badge unlocks;
- Wally entrances/exits;
- locked-content pulses;
- mystery clues;
- live notifications;
- countdown urgency;
- photo-wall movement;
- country-map highlights.

Do not animate every element continuously.

Motion hierarchy:

1. **Major story event** — cinematic.
2. **Mission completion** — strong celebration.
3. **Leaderboard movement** — visible and exciting.
4. **Normal navigation** — quick and elegant.
5. **Ambient background** — subtle.

Respect reduced-motion settings. The entire game must remain understandable without motion.

---

# 7. SOUND & HAPTIC LANGUAGE

Sound is optional per user and must have a mute control.

Recommended cues:

- login / world enter
- Wally arrival
- new mission
- correct answer
- wrong answer
- points awarded
- achievement unlocked
- Wally Drop alarm
- leaderboard overtake
- Golden Wally appearance
- Day chapter reveal
- final I BELONG reveal

Do not use loud sounds on every click.

The game should have a subtle sonic identity that makes people recognize an ITM@15 event even without looking at the screen.

---

# 8. BEFORE LOGIN — THE WEBSITE EXPERIENCE

## Scene 0: The Black Screen

The first visit starts with restraint.

Background: near black.

A faint low ambient sound if sound is enabled.

Centered text fades in:

`15 YEARS AGO...`

Pause.

Then:

`IT STARTED SMALL.`

Pause.

A number appears:

# 8

The `8` should feel important.

Then a line:

`Before the countries. Before the thousands. Before the Holding. Before Walumo.`

The screen does not dump company history yet.

Wally's silhouette crosses the far background quickly.

The user should wonder what they saw.

A single glowing button appears:

# ENTER THE STORY

On hover, Wally's eyes or a small environmental detail may react.

On click, transition into the landing world.

## Scene 1: ITM@15 Landing World

The user enters a premium animated scene.

Possible visual composition:

- stylized Africa map / connected city lights;
- faint routes linking countries;
- floating historical photo fragments;
- 15-year timeline markers in distance;
- Wally physically present in scene;
- current live countdown if campaign has not opened;
- subtle Walumo signature rather than huge sales branding.

Primary copy:

# ITM@15

## ONE DREAM. MANY COUNTRIES. THOUSANDS OF PEOPLE. ONE ITM.

Wally approaches.

Wally line:

> "You found it. Good. But you haven't earned the story yet."

Button:

# I’M READY

Click reaction:

Wally gestures toward login portal.

Transition should feel like moving deeper into the world rather than opening a generic form.

## Pre-campaign countdown mode

If the campaign has not started:

- show countdown;
- let employee log in and complete profile;
- reveal their squad only at a configured moment;
- allow one pre-launch micro-mission;
- do not expose future-day content.

Example pre-launch challenge:

`Choose the one word you hope describes ITM's next 15 years.`

Store responses for the finale.

---

# 9. LOGIN EXPERIENCE

The login page should still belong to the game world.

Avoid a blank white corporate authentication page.

## Screen

Left / background:

Wally in a calmer idle state with subtle animation.

Right / foreground:

Glass/premium login panel.

Copy:

# YOUR STORY STARTS HERE

Field:

`Work Email`

Field:

`Password`

Primary button:

# ENTER ITM@15

Secondary:

`Forgot password?`

Admin-created employees may use the temporary first-login password configured by the Product Guide. If `Walumo` is used, it must remain temporary and must trigger forced private-password setup.

## Wrong login reaction

Do not shame the player.

Wally can react lightly:

> "That door didn't open. Check your details and try again."

## First successful login

Do not immediately dump user into dashboard.

Run the Identity Sequence.

---

# 10. FIRST-LOGIN IDENTITY SEQUENCE

## Step 1 — Confirm identity

Large text:

`WE KNOW YOUR EMAIL.`

Then:

`NOW TELL US WHO IS ENTERING THE STORY.`

Capture / confirm:

- full name;
- email;
- country;
- entity;
- optional profile image if allowed;
- language preference where supported.

Admin preloaded values should be prefilled where possible.

## Step 2 — Private password

If first login uses a shared temporary password, require a private password now.

Wally:

> "One story. Your account. Your password. Keep it yours."

## Step 3 — Country reveal

Country flag / stylized country identity animates into view.

Example:

`KENYA CONFIRMED.`

Then:

`COUNTRY RANK: UNRANKED`

This plants competition immediately.

## Step 4 — Squad reveal

Do not make squad assignment feel administrative.

Dark screen.

Cards rotate / names appear one by one.

`YOUR SQUAD IS...`

Example:

# SQUAD UBUNTU

Reveal member first names, countries, and entities.

Wally:

> "You are not winning this alone. That's the point."

## Step 5 — ITM Passport issued

A digital passport opens.

Show:

- player name;
- country;
- entity;
- squad;
- blank country stamps;
- seven locked chapter seals;
- hidden mystery slots.

The first mystery slot is blank. The player does not know it will hold `I`.

Button:

# OPEN DAY 1

---

# 11. HOME SCREEN — THE LIVING LOBBY

The home screen is the player's base between missions.

It must show:

- Wally in current-day costume/state;
- today's chapter title;
- story progress;
- primary mission;
- next timed event;
- personal points;
- Unity Points;
- squad position;
- country position;
- streak;
- newest achievement;
- inbox / live notifications;
- map or social pulse;
- one mystery element teasing future content.

The home screen should change throughout the day.

Morning may feel calm and exploratory.

During a Wally Drop it becomes urgent.

After major leaderboard movement it highlights competition.

At night it becomes reflective and teases tomorrow.

---

# 12. DAILY RHYTHM ENGINE

Every day should have multiple beats, not one static task.

Recommended configurable rhythm:

## Beat A — Morning Hook

Email + in-app message.

Wally introduces the chapter.

## Beat B — Main Mission

Core story / learning experience.

## Beat C — Social Mission

Requires another person, country, or squad member.

## Beat D — Surprise Event

Wally Drop, flash vote, Golden Wally clue, country challenge, photo sprint.

## Beat E — Live Competition

Leaderboard movement, country race, squad goal.

## Beat F — Reflection / Memory

Short human prompt, nomination, story, voice note, or photo.

## Beat G — Cliffhanger

Night reveal / locked clue / tomorrow countdown.

Admins must be able to schedule, trigger early, delay, cancel, or replace these beats from Mission Control.

---

# 13. DAY 1 — ORIGIN: THE EIGHT

## Objective

Make employees emotionally understand that today's scale began with a small team and a belief.

## Visual world

A stylized 2011-inspired environment that feels like the beginning of something, not a museum.

Use:

- old-photo treatment;
- map / route between Germany and Africa where appropriate to the documented story;
- Lubumbashi origin cues;
- eight illuminated silhouettes;
- timeline fragments;
- evolving scene as players unlock history.

## Opening

Wally is dressed as an explorer / archivist.

Wally:

> "Everyone loves the big number. I prefer the first one."

The number `8` appears.

> "Find out why this number matters."

Button:

# START THE ORIGIN MISSION

## Mission 1 — Reconstruct the Beginning

Players receive different story fragments.

Examples:

- `2011`
- `Lubumbashi`
- `International Training & Motivation`
- `8 people`
- `training`
- `people development`

The system must create collaboration requirements so one player does not receive every answer.

Mechanic options:

- squad members receive different clues;
- players trade clues;
- cross-country matching;
- timed sequence puzzle;
- image clue matching.

Success:

Timeline assembles visually.

Wally:

> "That's the beginning. Not the whole story."

Award:

- Origin Points;
- first Day seal;
- mystery letter `I` appears with no explanation.

## Mission 2 — The Belief

Present a short documented founder-story segment through interactive cards, images, or animated timeline.

Ask reflective question:

`What do you think someone must believe to start with eight people and keep going?`

No wrong answer. Use word cloud later.

## Challenge — Eight People

Squad must form a temporary group of exactly eight people across configured criteria and capture proof.

Possible criteria:

- minimum 3 countries;
- minimum 3 entities;
- cannot all belong to the same department.

This turns the number 8 into something physical and memorable.

## Surprise — 8-Minute Drop

Wally appears suddenly:

> "Eight people. Eight minutes. You know what to do."

Flash challenge runs for 8 minutes.

## Day 1 leaderboard twist

Only show squad leaderboard initially.

At configured evening time reveal country leaderboard for the first time.

Animation: countries rise into ranked positions.

## Night close

Wally stands beside the now-complete origin timeline.

> "Today you found where the story started. Tomorrow you lose home-field advantage."

Display locked Day 2 portal with multiple country lights.

Countdown begins.

---

# 14. DAY 2 — ONE ITM, MANY CULTURES

## Objective

Make people learn about ITM countries by interacting with people from those countries, not by taking a geography quiz.

## Visual world

Africa / world map with glowing country portals.

Countries where ITM has active representation light up based on authoritative project content.

Each country portal may contain:

- flag / identity;
- cultural card;
- team memory;
- song/audio where licensed and appropriate;
- photo;
- unlocked contacts / social mission.

## Wally state

Traveller Wally with passport/backpack cues.

Opening:

> "Today, your own country is the one place you can't hide."

## Rule

Primary cultural mission cannot be completed using only people from the player's own country.

## Mission 1 — Passport Hunt

Players receive 3–5 country targets.

Example:

`Meet someone from Senegal.`

`Ask them what Teranga means to them.`

`Capture one sentence.`

On completion:

- passport gets Senegal stamp;
- Unity Points awarded;
- Senegal portal becomes richer in that player's map.

## Mission 2 — Teach Me Something

One employee teaches another:

- a phrase;
- a greeting;
- a food tradition;
- a cultural habit;
- a dance step;
- a workplace custom.

Teacher confirms completion.

## Mission 3 — Country Sound

Country teams nominate one appropriate song or musical identity for their country experience.

Admin can curate the live event playlist.

Do not auto-play copyrighted music without proper licensing. The system may store titles/links/approved media according to rights.

## Live mechanic — Country Takeover

For a limited period one country takes over:

- themed accents;
- Wally greeting;
- spotlight story;
- challenge;
- leaderboard bonus opportunity.

Admin can trigger Country Takeover from Mission Control.

## Live vote

Examples:

- `Which country taught you something you did not know today?`
- `Which cultural experience should appear at the final celebration?`

## Social proof wall

Show approved cross-country photos in a moving mosaic.

Never expose photos before moderation rules are satisfied.

## Mystery letter

Complete Day 2 seal.

Letter `B` appears.

Player now has `I B` but no explicit explanation.

## Night close

Wally:

> "Two letters. Twenty conversations. Still think this is a quiz?"

Day 3 preview shows airport board / destinations.

---

# 15. DAY 3 — THE JOURNEY: MEMORY VAULT

## Objective

Turn previous ITM Reviews and travel into living memories and cross-generation storytelling.

## Visual world

Airport / journey / memory archive.

Departure board includes documented review destinations such as:

- Nairobi;
- Dar es Salaam;
- Lusaka;
- Abidjan;
- Libreville;
- Dakar;

Use dates only where verified in source documents.

## Wally state

Historian / camera Wally.

Opening:

> "A meeting ends. A memory doesn't. Let's see what survived."

## Mission 1 — Guess the Memory

Show an approved historical image with selected metadata hidden.

Prompt:

`WHERE WAS THIS?`

Choices animate as destination cards.

Correct:

- image expands;
- actual story appears;
- Wally celebrates;
- points awarded.

Wrong:

- no harsh penalty initially;
- Wally gives contextual hint;
- second attempt may award fewer points.

## Mission 2 — Find the Human Story

Player must find someone who attended a previous Review and ask a prompt:

`Tell me one thing that happened there that never appeared in the official presentation.`

The response can be text/audio/video depending configuration and consent.

## Mission 3 — Recreate It

Teams recreate an approved historical photograph.

Photo comparison can be side-by-side for fun.

Admin chooses featured recreations.

## Memory Vault

Every approved story becomes a collectible card.

Cards can show:

- location;
- year;
- storyteller;
- image;
- short memory;
- related people / country tags.

## Surprise — Lost Luggage

Wally "loses" a virtual suitcase containing clues.

Players must solve 3 micro-puzzles across the app to retrieve it.

Reward may include bonus clue, badge, or points.

## Leaderboard event

At one point hide exact scores and show only:

`1st–3rd separated by less than 500 points.`

This increases suspense without misleading users.

## Mystery letter

Day 3 gives `E`.

Sequence: `I B E`.

## Night close

> "We crossed countries. Tomorrow we stop looking at places and look at people."

---

# 16. DAY 4 — THE PEOPLE: WHO MADE THE STORY MATTER?

## Objective

Create meaningful recognition and make invisible contributors visible.

## Visual world

Hall of people / constellation of faces / living recognition wall.

Avoid corporate award-show stiffness.

## Wally state

People Champion Wally.

Opening:

> "Companies remember numbers. People remember people."

## Recognition categories

Examples:

- Quiet Builder
- Connector
- Problem Solver
- Culture Carrier
- Unsung Hero
- Bridge Builder
- The Person Who Showed Up
- 2026 Moment Maker

Admins must be able to edit categories.

## Nomination flow

1. Choose category.
2. Search/select eligible person.
3. Write `WHY`.
4. Optional memory/photo.
5. Submit.

A nomination without explanation should not count where the category requires a story.

## Button

Instead of `Submit`, use:

# GIVE THEM THEIR FLOWERS

On click:

- card seals;
- soft celebratory animation;
- Wally says something like: "Good. People should know when they mattered."

## Voting

Where voting is appropriate:

- enforce eligibility;
- one vote per rules;
- anonymous/named configured;
- do not expose interim results unless admin chooses;
- reveal with live animation.

## Mission — Find the Invisible Work

Prompt:

`Find someone whose work helps your job but whom you rarely speak to.`

Have a short conversation and record one thing they do that others may not see.

## Surprise — Appreciation Relay

A player receives a person to appreciate. That person receives another person, forming a controlled chain.

Prevent abuse / unwanted direct messaging by using platform-mediated prompts and moderation rules.

## Live recognition wall

Approved quotes appear with names/photos where consent/configuration allows.

## Mystery letter

Day 4 gives `L`.

Sequence: `I B E L`.

## Night close

Wally:

> "Tomorrow, history stops looking backward."

The environment glitches / transforms into a futuristic lab.

---

# 17. DAY 5 — WALUMO: THE BUILDERS ENTER

## Objective

Make people experience why Walumo and its products exist without forcing a sales presentation.

## Visual world

Futuristic Walumo lab / command workshop.

Wally shifts from historian to Builder.

Opening:

> "ITM spent years solving problems with people. What happens when we start building the technology too?"

## Core principle

Every product is introduced through a **problem first**.

Never begin with:

`Here is KaziPro.`

Begin with:

`Three requests. Two countries. One approval missing. Fix the operation.`

## KaziPro Mission

Scenario examples:

- leave request;
- payment request;
- attendance;
- onboarding;
- approvals.

Players arrange workflow steps or make decisions.

Only after understanding the problem:

# KAZIPRO UNLOCKED

Wally:

> "That's why it exists."

## TalentPro Mission

Scenario:

100 fictional candidates / profiles. Limited time. Find the strongest shortlist using defined criteria.

Reveal recruitment workflow and candidate experience.

# TALENTPRO UNLOCKED

## Sales Tracker Mission

Give squad a territory simulation.

Tasks:

- identify customer;
- record interaction;
- close sale;
- capture incident;
- protect account;
- hit target.

# SALES TRACKER UNLOCKED

## Walumo Origin Mini-Story

Reveal the documented Walumo progression and builder story.

If the project guide uses the narrative "one employee to four builders", present it as a visual growth sequence only if supported by the authoritative content in the repository.

## Easter Egg Layer

Hide product-related symbols around the environment.

Clicking them should open useful micro-content, not random trivia.

## Secret Developer Room

Rare unlock for players who discover enough Easter eggs.

Show:

- concept art;
- Wally development;
- blurred/code-inspired visuals;
- a message from Walumo team;
- bonus challenge.

Do not expose secrets or real source code.

## Walumo image moment

At the end of Day 5 the user should think:

`Walumo did not just build a game. Walumo can build experiences.`

## Mystery letter

Day 5 gives `O`.

Sequence: `I B E L O`.

## Night close

Wally:

> "You've seen what we can build. Tomorrow I remove the easiest way to win."

---

# 18. DAY 6 — THE ALLIANCE: YOU CANNOT WIN ALONE

## Objective

Create maximum human interaction and prove "One ITM" behavior through gameplay.

## Rule change

Individual points become less valuable for the day.

Unity Points become strategically important.

Major challenges require multiple people across countries/entities/functions.

## Visual world

Festival / connected city / alliance arena.

Lines visibly connect active countries or squads.

## Wally state

Connector Wally.

Opening:

> "Today, being brilliant alone is almost useless."

## Challenge families

### Five Flags

Get five people from five countries in one approved photo or verified interaction.

### Teach Me

Learn a phrase from another language. Teacher validates.

### Sing It

Short approved musical/social challenge. Keep participation optional and respectful.

### 15 Seconds of Courage

Record:

`One thing I appreciate about the people of ITM is...`

### Find the Human

Dynamic prompts:

- someone who joined this year;
- someone with 10+ years in ITM;
- someone who has worked in more than one ITM country;
- someone outside your function;
- someone you have never spoken to.

Only use criteria the system can verify or ask players to self-confirm appropriately.

### Bridge Mission

Two squads must collaborate even though they compete.

Both earn a large bonus if both complete.

This creates the paradox: helping a competitor can grow the Group.

## Wally Drop

Day 6 should contain the strongest surprise drop.

Example:

`THE MAP IS DARK.`

Goal: every active country must complete one action within 30 minutes to relight the map.

As countries complete, map lights up live.

This is collective spectacle.

## Golden Wally Hunt

Clues appear in waves.

Golden Wally can be:

- digital hidden object;
- QR or physical integration if approved;
- secret multi-user unlock;
- admin-controlled reveal.

Prevent winner determination from being client-side.

## Leaderboard twist

At midpoint show:

- personal leaderboard frozen;
- squad leaderboard live;
- country leaderboard live.

At the end, merge selected Day 6 Unity bonuses into final standings according to transparent rules.

## Mystery letter

Day 6 gives `N`.

Sequence: `I B E L O N`.

## Night close

Wally becomes unusually serious.

> "Six days. Six letters. Tomorrow you find out what you were really collecting."

No extra explanation.

---

# 19. DAY 7 — LEGACY: WRITE THE NEXT 15

## Objective

Resolve the story emotionally, celebrate winners, capture organizational insight, and make every participant feel part of what comes next.

## Visual world

Future ITM / 2041 horizon.

Fragments from all previous days appear integrated into one environment:

- eight silhouettes;
- country routes;
- review photos;
- employee recognition;
- Walumo lab;
- alliance links.

Wally is Future Wally.

## Opening deception

The player expects final leaderboard.

Display:

`FINAL RESULTS LOADING...`

Then interrupt it.

Wally walks in.

> "You thought this was a game about points."

Pause.

> "It wasn't."

Leaderboards disappear temporarily.

## Final Mission Part 1 — Name the Chapter

Country prompt:

`If 2026 became a chapter in the history of ITM [COUNTRY], what would you call it?`

Country team votes or collaborates depending configuration.

## Final Mission Part 2 — Protect One Thing

`What should ITM never lose as it grows?`

## Final Mission Part 3 — Change One Thing

`What must ITM become better at in the next 15 years?`

## Final Mission Part 4 — My Contribution

`What do you personally want to contribute to the next chapter?`

Store responses in the ITM 2041 Time Capsule.

## Final Letter

Day 7 gives `G`.

All letters animate into alignment:

`I B E L O N G`

Pause.

Then collapse spacing:

# I BELONG.

Bring back images and moments from the week.

Wally:

> "That was the mission."

## Final montage

Use approved content collected during the week:

- cross-country photos;
- memories;
- recognition quotes;
- challenge clips;
- country moments;
- product discoveries;
- Wally interactions;
- founder/history imagery where approved.

Do not automatically publish private content. Respect media permissions and moderation.

## Final metrics reveal

Before winners, reveal human metrics:

- cross-country connections created;
- countries connected;
- missions completed;
- memories captured;
- appreciation stories submitted;
- passport stamps earned;
- Unity Points generated.

This reframes success beyond rank.

## Final leaderboard

Then reveal:

- Player Champion;
- Squad Champion;
- Country Champion;
- Unity Champion;
- Culture Explorer;
- Connector;
- Memory Hunter;
- Wally Hunter;
- optional admin-curated special awards.

Leaderboard reveal should be cinematic and live.

## Final button

Not `Finish`.

Use:

# SEAL MY TIME CAPSULE

After click:

- player's Day 7 response is sealed;
- full seven-day passport is shown;
- badges animate;
- final personal recap generated.

Then final button:

# SEE MY ITM@15 STORY

This opens a personalized recap page.

---

# 20. PERSONALIZED RECAP

Each player receives a shareable/private recap depending policy.

Possible content:

- days completed;
- total points;
- Unity Points;
- countries interacted with;
- passport stamps;
- achievements;
- squad result;
- country result;
- favorite/featured photo;
- people recognized;
- personal 2041 contribution statement.

Do not turn this into an employee-performance score.

This is celebration and memory, not HR evaluation.

---

# 21. LEADERBOARD SYSTEM

Leaderboards are story devices, not just tables.

## Types

### Personal

Ranks individual game score.

### Squad

Cross-country team score.

### Country

Aggregated country score using defined fair rules.

### Unity

Ranks collaboration / Unity Points.

## Overtake animation

When rank changes materially:

- old position slides;
- new country/squad rises;
- glow pulse;
- optional Wally comment;
- realtime notification for meaningful overtakes.

Do not send a notification for every tiny change.

## Suspense modes

Admin can switch to:

- exact scores;
- top 10 only;
- rank without points;
- "too close to call" mode;
- temporarily hidden scores;
- final lock.

All modes must be honest and derived from actual data.

## Anti-toxicity principle

Competition should create energy, not humiliation.

Avoid public "worst player" lists.

Celebrate participation and connection alongside winners.

---

# 22. SCORING DESIGN

Suggested base system, configurable by admin:

- normal mission: 50
- knowledge/story mission: 75
- social mission: 100
- cross-country mission: 150
- Unity mission: 200 Unity Points
- Wally Drop: 100–500 depending difficulty
- hidden Easter egg: 150
- rare Golden Wally: major bonus configured transparently
- chapter completion: 250
- seven-day completion: 1000 legacy bonus

Use a score ledger. Never allow frontend authoritative score mutation.

Avoid unlimited repeatable point exploits.

Every score rule requires:

- event type;
- eligibility;
- max frequency;
- server verification;
- auditability.

---

# 23. STREAKS & RETENTION

Streaks should reward returning without punishing someone who legitimately cannot play every hour.

Examples:

- Daily Chapter Streak
- Social Streak
- Passport Streak
- Wally Drop Streak

Avoid manipulative dark patterns.

Use positive anticipation:

`6 DAYS COMPLETE — ONE CHAPTER REMAINS`

not fear-based copy.

---

# 24. ACHIEVEMENTS

Examples:

- First Step
- Origin Keeper
- One ITM Citizen
- Five Flags
- Culture Explorer
- Memory Hunter
- Quiet Builder
- Bridge Builder
- Passport Master
- Wally Hunter
- Golden Wally
- Perfect Chapter
- Seven-Day Legend
- Unity Champion

Each achievement should have:

- icon;
- rarity;
- unlock criteria;
- Wally response;
- timestamp;
- optional share card.

Rare achievements must actually be rare.

---

# 25. WALLY'S EXPERIENCE ROLE

Follow `WALLY.md` for implementation architecture.

This document defines his creative role.

Wally should be:

- curious;
- clever;
- warm;
- occasionally mischievous;
- never childish;
- never insulting;
- aware of game context;
- aware of player name where safe;
- aware of country/squad/state;
- capable of live admin-triggered appearances.

## Wally should move

He can:

- walk into scene;
- run during urgent drops;
- point to buttons/cards;
- inspect a leaderboard;
- celebrate;
- look shocked;
- hide;
- sneak behind UI;
- dance during cultural moments;
- sit/idle;
- leave through environment transitions.

## Wally should guide

If user appears stuck:

- highlight next action;
- Wally looks toward it;
- after appropriate delay he can give a hint.

Do not interrupt constantly.

## Wally should remember session context

Examples:

> "Alexander, that's your third country today."

> "Your squad is one stamp away from a bonus."

> "Kenya just moved to second."

All factual Wally statements must be generated from validated game state, not hallucinated.

---

# 26. REALTIME EVENT CHOREOGRAPHY

Important realtime event examples:

## New mission

- top live banner;
- Wally entrance;
- mission card pulses;
- optional sound;
- countdown starts.

## Score award

- points fly toward score counter;
- score count animates;
- leaderboard position updates if changed;
- achievement check runs;
- Wally response where significant.

## Country overtake

- mini leaderboard expands;
- overtaking country rises;
- tasteful glow;
- Wally line;
- optional country-only callout.

## Photo approved

- approval notification;
- points award;
- image may enter gallery if featured;
- Wally celebrates.

## Theme takeover

- theme transition begins smoothly;
- do not hard refresh;
- preserve current mission state.

## Emergency pause

Admin can pause timed activity.

Players see:

`MISSION PAUSED — WALLY WILL RETURN.`

Do not lose submissions or state.

---

# 27. NOTIFICATIONS

Notification types:

- mission;
- Wally message;
- vote;
- approval;
- achievement;
- leaderboard;
- squad request;
- country event;
- reminder;
- system.

Notifications need priority levels.

Critical live event should not be visually identical to `photo approved`.

Allow read/unread and notification center.

Do not spam connected users.

---

# 28. DAILY EMAIL STORYLINE

Every day email should feel like Wally opening the next chapter.

Structure:

1. Name.
2. One-line hook.
3. Tiny story clue.
4. Today's mission tease.
5. Clear CTA with game link.

Example Day 6:

`Alexander, today being brilliant alone is almost useless.`

`Your squad needs people it does not usually work with.`

Button:

`ENTER DAY 6`

Always include the valid game link.

Admins need preview, test-send, schedule, audience, send logs, retry status.

---

# 29. ADMIN MISSION CONTROL — LIVE STORY DIRECTOR

Admin is not merely editing content. Admin is **directing the live experience**.

Mission Control must include:

## Live Overview

- connected users;
- active countries;
- active squads;
- current chapter;
- current mission;
- submission rate;
- live leaderboard;
- realtime health;
- moderation queue;
- alerts.

## Story Control

Admin can:

- open/close chapter;
- launch mission;
- edit future mission;
- schedule event;
- delay event;
- pause event;
- change challenge copy;
- change points within authorization rules;
- change theme;
- reveal clue;
- trigger Wally;
- trigger Golden Wally;
- hide/reveal leaderboard;
- launch vote;
- close vote;
- reveal vote;
- feature photo;
- send notification;
- send country/squad/player-targeted message.

## Wally Control Room

Preview:

- message;
- animation;
- audience;
- theme;
- sound;
- CTA;
- duration.

Then `SEND LIVE` with confirmation and audit log.

## Safe edit rule

Editing a live mission must not corrupt existing submissions.

Version content or restrict incompatible edits once responses exist.

---

# 30. CONTENT MANAGEMENT

Admins need a proper content model for:

- chapters;
- missions;
- challenge rules;
- questions;
- answer options;
- images;
- video;
- audio;
- country content;
- historical content;
- Wally dialogue;
- themes;
- rewards;
- achievements;
- emails;
- notifications.

Every content item should support draft/publish where appropriate.

Future scheduled content should be editable until locked by release rules.

---

# 31. PHOTO & MEDIA EXPERIENCE

Uploading should be fast and satisfying.

Flow:

1. Tap `UPLOAD PROOF`.
2. Camera/gallery chooser.
3. Preview image.
4. Optional caption.
5. Confirm participants where required.
6. Submit.
7. Progress indicator.
8. State becomes `AWAITING REVIEW`.
9. Wally acknowledges.
10. On approval/rejection, realtime notification.

Reject reasons should be clear and respectful.

Support image optimization and safe storage.

---

# 32. VOTING EXPERIENCE

Votes should feel consequential.

Before voting:

Wally can frame question.

Options may be:

- names;
- photos;
- country cards;
- text answers.

Selected option gains glow / depth.

Button:

# LOCK IN MY VOTE

On click:

- confirmation motion;
- no accidental duplicate;
- show `VOTE RECORDED`;
- do not reveal result if poll is hidden.

When results are revealed, animate bars/cards from zero based on actual totals.

---

# 33. 3D WORLD STRATEGY

Do not make every page a heavy 3D scene.

Use 3D where it creates memory:

- landing world;
- Day chapter portals;
- Wally;
- Africa/country map;
- Memory Vault;
- Walumo lab;
- Day 6 alliance map;
- Day 7 future world.

Use normal performant UI for:

- forms;
- long text;
- admin tables;
- settings;
- moderation;
- audit logs.

Performance tiers:

- High: full 3D + richer effects.
- Standard: reduced scene complexity.
- Lite: 2D / pre-rendered Wally and lightweight motion.
- Reduced Motion: minimal movement.

Gameplay must remain identical.

---

# 34. THEME SYSTEM

Each day should have a distinct identity while remaining ITM@15.

Suggested emotional palettes, not hard-coded colors:

- Day 1: origin / warm archival / spark
- Day 2: vibrant cultural spectrum
- Day 3: travel / midnight / airport light
- Day 4: human / warm / recognition
- Day 5: futuristic / Walumo innovation
- Day 6: electric alliance / live energy
- Day 7: premium future / legacy / restrained gold

Admin can change theme accents live according to Product Guide permissions.

Changing theme must not alter game logic.

---

# 35. SPECTATOR / EVENT SCREEN MODE

Large-screen mode should turn the physical venue into part of the game.

It can rotate:

- live leaderboard;
- country map;
- latest approved photos;
- Wally announcement;
- countdown;
- challenge prompt;
- country overtake;
- achievement feed;
- vote reveal;
- connection metrics.

Do not expose private information or moderation-pending media.

Admin controls what appears.

---

# 36. SOCIAL SAFETY & MODERATION

The game is social, but participation must remain respectful.

Implement:

- media moderation;
- report flow where appropriate;
- configurable visibility;
- consent-aware image use;
- no public humiliation;
- no forced sharing of sensitive personal information;
- no ranking employees by work performance;
- no offensive Wally copy;
- admin audit logs;
- clear content-removal controls.

---

# 37. ANTI-CHEAT & FAIRNESS

Protect:

- score ledger;
- duplicate missions;
- repeated upload farming;
- duplicate votes;
- unauthorized admin actions;
- client-side score edits;
- fake completion;
- expired timed challenges;
- audience restrictions.

Country scoring should account for population-size differences if necessary. The final scoring model must be documented and approved so large countries do not automatically dominate simply because of headcount.

Possible fairness methods:

- participation-rate normalized country score;
- capped per-player contribution;
- separate absolute and participation leaderboards;
- Unity objectives independent of headcount.

---

# 38. ANALYTICS FOR SUCCESS

Track product analytics without turning the experience into surveillance.

Useful metrics:

- invited users;
- activated users;
- daily active users;
- chapter completion;
- mission completion;
- average time to first mission;
- cross-country interactions;
- unique country connections per player;
- photo submissions;
- approval turnaround;
- votes cast;
- Wally event engagement;
- email open/click where legally and technically appropriate;
- returning users;
- seven-day completion;
- Unity Points;
- spectator engagement where measurable;
- errors / failed uploads;
- performance metrics.

Final executive metric should include **connections created**, not only clicks.

---

# 39. CLAUDE IMPLEMENTATION CONTRACT

Claude must implement this experience as real product behavior.

For each feature described here:

1. identify requirement;
2. map it to existing architecture;
3. create/update database model if needed;
4. enforce permissions;
5. build server logic;
6. build realtime event if needed;
7. build UI states;
8. build Wally response;
9. build admin controls;
10. build analytics event;
11. build tests;
12. update audit checklist;
13. update project state;
14. update memory/knowledge graph;
15. only mark complete after verification.

Do not implement a fake demo where admin buttons only modify local React state.

---

# 40. RECOMMENDED FRONTEND COMPONENT MAP

Claude should adapt to the existing repo, but the experience needs equivalent components.

```text
components/
  experience/
    CinematicIntro
    ChapterPortal
    StoryCard
    MysteryLetter
    LiveEventBanner
    Countdown
    PointBurst
    AchievementReveal
    CountryOvertake
    LockedChapter
  game/
    MissionCard
    ChallengeCard
    ChallengeTimer
    SubmissionFlow
    VoteCard
    VoteReveal
    Leaderboard
    SquadPanel
    CountryPanel
    Passport
    StampReveal
    MemoryVault
    PhotoWall
  wally/
    WallyStage
    WallyController
    WallySpeech
    WallyHint
    WallyReaction
  admin/
    MissionControl
    StoryScheduler
    WallyControlRoom
    LiveAudiencePicker
    ScoreControl
    VoteControl
    MediaModeration
    ThemeControl
    SpectatorControl
```

Do not create these blindly if equivalent components already exist. Reuse and refactor appropriately.

---

# 41. REQUIRED GAME STATES

At minimum support:

```text
PRELAUNCH
DAY_LOCKED
DAY_OPEN
MISSION_AVAILABLE
MISSION_ACTIVE
MISSION_SUBMITTED
MISSION_PENDING_REVIEW
MISSION_APPROVED
MISSION_REJECTED
MISSION_EXPIRED
VOTE_OPEN
VOTE_CLOSED
WALLY_DROP_ACTIVE
CHAPTER_COMPLETE
LEADERBOARD_HIDDEN
EVENT_PAUSED
FINAL_REVEAL
POST_EVENT
```

UI and server must agree on authoritative state.

---

# 42. EXPERIENCE TESTING

In addition to normal engineering tests, create experience E2E tests.

## Landing test

- cold open appears;
- Enter Story works;
- login route works;
- reduced-motion mode works.

## First-login test

- invited employee logs in;
- forced password update;
- name/country/entity captured;
- squad reveal;
- passport issued;
- Day 1 becomes available.

## Day 1 test

- origin mission loads;
- clue collaboration logic works;
- points award server-side;
- `I` unlocks;
- Day 2 remains locked.

Repeat equivalent chapter tests through Day 7.

## Realtime test

Two browser sessions plus admin:

- admin launches Wally Drop;
- both eligible sessions receive it;
- ineligible target does not;
- submission changes leaderboard;
- Wally reaction appears;
- reconnect preserves state.

## Final reveal test

- letters collected;
- final `G` unlocks;
- `I BELONG` reveal occurs;
- time-capsule responses save;
- final leaderboard uses actual data;
- personal recap generated.

---

# 43. EXPERIENCE QA QUESTIONS

Before approving any screen, Claude/reviewer should ask:

- Is this screen alive or static?
- Does the user know what to do?
- Is there a clear primary action?
- Does clicking it visibly react?
- Does Wally add value here?
- Is there a reason to return?
- Is there a social consequence?
- Is there an emotional beat?
- Does this teach something?
- Does it feel like ITM@15, or generic SaaS?
- Does it work on mobile?
- Does it work without heavy 3D?
- Is it accessible?
- Is it secure?
- Is the data real?

If the answer to the final question is no, the feature is not complete.

---

# 44. SUCCESS CRITERIA FOR THE ENTIRE EXPERIENCE

The project succeeds if:

1. Employees return across the seven days.
2. People interact across countries and entities.
3. Employees learn real ITM history and culture.
4. Recognition reaches people who may normally be invisible.
5. Walumo is experienced as an innovation builder rather than advertised as one.
6. The live game feels responsive and surprising.
7. Admins can direct the experience without developer intervention.
8. Wally feels present and contextual, not decorative.
9. The finale creates an emotional payoff.
10. The product is secure, fast, mobile-friendly, measurable, and reusable.

The strongest compliment should not be:

`Nice website.`

It should be:

# "WHO BUILT THIS?"

And the answer should be:

# WALUMO.

---

# 45. FINAL CLAUDE DIRECTIVE

Build ITM@15 as though every screen will be projected in front of the entire Group and every interaction will be discussed afterward.

Do not optimize for the minimum feature that technically satisfies a ticket.

Optimize for:

**clarity + reliability + spectacle + human connection + story + speed + security.**

Start with the foundation and Day Zero vertical slice required by the Master Build Runbook.

Then build the experience chapter by chapter.

For every chapter:

- make the story understandable;
- make the primary action irresistible;
- make the button react;
- make Wally matter;
- make the server authoritative;
- make realtime real;
- make the admin able to direct it;
- make the result visible;
- make the next moment anticipated;
- test it;
- secure it;
- document it;
- only then mark it complete.

The finished experience should make people feel that **ITM's history is not behind them. They are standing inside it.**

And when the seven letters finally become `I BELONG`, the player should understand that the entire week was designed to answer one question:

# DO I BELONG TO THIS STORY?

The product's answer is not given to them.

They should have lived it.
