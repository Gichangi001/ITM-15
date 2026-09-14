# ITM@15 — OPENING CHAPTER

## THE MAN BEFORE THE GROUP

**Status:** Supporting creative/experience specification (authority level 5, same tier as the Storyline & Experience Build Bible and the Admin Mission Control Vision document — see `docs/DOCS_INDEX.md`'s authority model). Subordinate to `docs/PRODUCT_GUIDE.md` and `docs/WALLY.md` for security, server-authority, and architecture; controlling for the Founder Story's own creative direction.

**Provided by:** the product owner, 2026-09-14, pasted directly into session.

**Implementation tracking:** see `docs/PROJECT_STATE.md`'s Founder Story section for what has actually been built and verified against this spec. This document is the source creative brief — do not treat anything below as "already implemented" merely because it's written here.

### Asset to use

Use the existing GitHub image:

```text
sylva-monga.webp
```

Claude must locate this asset inside the repository and use the existing file rather than creating a duplicate.

---

# 1. FIRST PAGE EXPERIENCE

The very first meaningful story page after the ITM@15 opening should introduce:

# MR SYLVA MONGA

## Founder & Chairman, ITM Group

This must feel cinematic.

Do **not** build this as:

* a normal biography page;
* a profile card;
* an image beside a paragraph;
* a corporate About Us section;
* a timeline immediately filled with text.

The page should feel like the player has entered the beginning of a story.

---

# 2. HERO IMAGE

Use:

```text
sylva-monga.webp
```

The image should cover the screen beautifully.

Recommended layout:

```text
100vh
```

or approximately:

```text
min-height: 100svh
```

The photograph should fill the entire hero.

Use:

```css
object-fit: cover;
object-position: center;
```

But Claude must inspect the actual photograph and adjust `object-position` so Mr Monga's face is never awkwardly cropped.

The focal point must always remain visible on:

* large desktop;
* laptop;
* tablet;
* mobile.

---

# 3. IMAGE TREATMENT

Do not place raw text directly over a busy photograph.

Use a premium cinematic treatment.

Recommended:

### Left or bottom gradient

From:

```text
deep black / near black
```

into:

```text
transparent
```

The photograph should remain visible.

Do not over-darken the full image.

Use subtle:

* vignette;
* depth;
* grain;
* light bloom;
* gold highlights where appropriate.

Avoid excessive corporate blue.

The opening should feel:

**Black. Warm gold. Human. Historic. Premium.**

---

# 4. INITIAL SCREEN STATE

When the page loads:

For approximately the first moment, show only the photograph.

No giant interface.

No menu clutter.

No leaderboard.

No points.

No challenge.

Let the user look at the man behind the story.

Then slowly reveal:

```text
BEFORE ITM BECAME A GROUP...
```

Small text.

Then:

# THERE WAS A BELIEF.

Pause.

Then:

# AFRICA'S GREATEST STRENGTH

# WOULD BE ITS PEOPLE.

Then reveal:

**Mr Sylva Monga**

Founder & Chairman
ITM Group

---

# 5. COPY ON THE HERO

Keep the first visible copy short.

Recommended:

> **Before the countries.
> Before the thousands of people.
> Before the companies.
> There was one belief.**

Then:

# AFRICA COULD BUILD THROUGH ITS PEOPLE.

Underneath:

**Mr Sylva Monga**
Founder & Chairman, ITM Group

Do not place his entire story on top of the photograph.

The image deserves space.

---

# 6. FIRST CTA

At the bottom of the page:

## DISCOVER THE BEGINNING

The button should glow subtly.

Not aggressively.

### Default

Dark translucent surface.

Fine gold border.

Very soft gold halo.

### Hover

Gold border becomes brighter.

Arrow slightly moves.

Background receives subtle glow.

Wally may look toward the button.

### Press

Button compresses slightly.

Light travels across the border.

Then transition into the story.

Button:

```text
DISCOVER THE BEGINNING   →
```

---

# 7. TRANSITION

When the player presses the button:

Do not instantly replace the page.

Animate the photograph.

Recommended sequence:

1. Image gently zooms in.
2. Background darkens.
3. Mr Monga's name remains visible for a moment.
4. Text fades.
5. A thin golden line begins drawing across the screen.
6. That line becomes the ITM timeline.

Then:

# 2011

appears.

---

# 8. STORY CHAPTER ONE

## ONE MAN. ONE IDEA.

Opening copy:

> Mr Sylva Monga returned to Africa with an ambition that was bigger than building another company.
>
> He believed that Africa's development would depend on skilled, capable and motivated people.
>
> And he believed African businesses could build the institutions needed to develop those people themselves.

Then isolate one sentence:

# PEOPLE WOULD BUILD THE FUTURE.

Do not dump paragraphs.

Reveal the story in controlled pieces.

---

# 9. GERMANY → AFRICA

Create a subtle visual journey.

Text:

## BEFORE ITM

> His journey had taken him beyond the continent, including years in Germany where he studied Business Administration and gained professional experience.
>
> But the opportunity he saw was back in Africa.

Visual direction:

A thin animated route.

```text
GERMANY
      ↓
AFRICA
      ↓
LUBUMBASHI
```

Not necessarily a literal Google-style map.

Use an elegant abstract map or glowing geographic line.

Then:

> He returned not simply to find a job.
>
> He returned to build.

Emphasize:

# TO BUILD.

---

# 10. 2011

The entire screen transitions.

Large:

# 2011

Then:

## LUBUMBASHI, DEMOCRATIC REPUBLIC OF CONGO

Text:

> In Lubumbashi, Mr Monga founded a company around a simple idea:
>
> organisations perform better when their people are properly selected, trained, motivated and continuously developed.

Then reveal the original name:

# INTERNATIONAL TRAINING & MOTIVATION

Below:

# I T M

Have the three letters animate into place individually.

```text
INTERNATIONAL
TRAINING
MOTIVATION
```

The first letters illuminate:

**I**

**T**

**M**

Then combine:

# ITM

This should be one of the first memorable visual reveals.

---

# 11. THE NUMBER EIGHT

Everything goes dark.

Then place in the middle of the screen:

# 8

Nothing else.

Large.

Powerful.

Wait.

Then Wally enters quietly.

He looks at the number.

Wally says:

> **"Not 15,000."**

Pause.

> **"Not twenty countries."**

Pause.

> **"Eight people."**

Then:

# IT STARTED WITH EIGHT.

This becomes the first major emotional moment.

---

# 12. WHY EIGHT MATTERS

Text appears:

> Great organisations often look obvious after they succeed.
>
> They rarely look obvious at the beginning.
>
> ITM began with eight people.

Then:

> Eight people around an idea.
>
> Eight people before the Group.
>
> Eight people before the countries.
>
> Eight people before thousands of careers became connected to the ITM story.

Then:

# EVERY BIG STORY HAS A MOMENT

# WHEN IT STILL LOOKS SMALL.

---

# 13. WALLY'S FIRST REAL INTERACTION

This should be the moment Wally properly introduces himself to the player.

Wally walks toward the `8`.

Looks at it.

Then toward the user.

Dialogue:

> "Remember that number."

Pause.

> "You're going to need it."

Then:

# + ORIGIN CLUE UNLOCKED

The player receives their first hidden story item.

This can become the first piece of the Day 1 challenge.

---

# 14. THE FIRST EVOLUTION

Next screen:

## TRAINING WAS ONLY THE BEGINNING.

Text:

> ITM began with training and personnel management.
>
> But the needs of its clients were larger than one service.
>
> Recruitment followed.
>
> Outsourcing followed.
>
> Workforce management followed.
>
> Continuous employee development followed.

Animate the evolution:

```text
TRAINING
    ↓
RECRUITMENT
    ↓
OUTSOURCING
    ↓
PEOPLE MANAGEMENT
    ↓
LONG-TERM PARTNERSHIPS
```

Then:

> ITM stopped asking only:
>
> **"Who can we train?"**
>
> And increasingly began asking:
>
> **"What people problem can we solve?"**

---

# 15. AFRICA BEGINS TO LIGHT UP

Now introduce geographic expansion.

Start with DRC glowing.

Then additional locations gradually illuminate.

Do not light every country at once.

The player should feel the organisation expanding.

Text:

# ONE COUNTRY BECAME MANY.

Then:

> As ITM grew, the model began travelling beyond the DRC.
>
> The organisation expanded into other African markets while building strong local teams that understood their own countries, cultures, labour markets and clients.

Then:

# ONE GROUP.

# LOCAL LEADERS.

# AFRICAN AMBITION.

This prepares the player for Day 2.

---

# 16. 2019 — FROM COMPANY TO GROUP

The timeline reaches:

# 2019

Visual shift.

Multiple lines that previously represented services and countries converge into a central node:

# ITM HOLDING

Narration:

> Growth eventually required a different structure.
>
> ITM could no longer think only like one operating company.
>
> It was becoming something capable of supporting multiple companies, investments, markets and sectors.

Then:

```text
COMPANY
      ↓
GROUP
      ↓
PLATFORM FOR NEW BUSINESSES
```

The word:

# HOLDING

lands powerfully.

---

# 17. THE BIGGER PATTERN

Now show the evolution.

```text
PEOPLE
↓
HR
↓
OUTSOURCING
↓
OPERATIONS
↓
LOGISTICS
↓
MAINTENANCE
↓
FINANCE
↓
BPO
↓
DISTRIBUTION
↓
TECHNOLOGY
```

Then ask:

# WHAT WAS ITM REALLY BUILDING?

Pause.

Answer:

# CAPABILITY.

Then:

> The industries changed.
>
> The underlying instinct remained remarkably similar:
>
> find an important operational problem and build the capability to solve it.

---

# 18. THE PEOPLE REVEAL

Now move beyond the founder.

This is important.

The story must not imply one person alone built every part of ITM.

Mr Monga started the vision.

Thousands of people carried it forward.

Use a photo mosaic.

Employees.

Country leaders.

Teams.

Annual Reviews.

Offices.

Clients where appropriate.

Text:

> A founder can begin a story.
>
> He cannot build fifteen years alone.

Then:

# THOUSANDS OF PEOPLE

# BECAME PART OF THE IDEA.

Then:

> Leaders joined.
>
> Teams formed.
>
> Countries opened.
>
> People solved problems Mr Monga could never have solved personally.
>
> ITM began becoming an institution rather than simply a founder-led business.

---

# 19. THE FOUNDER QUESTION

Return briefly to Mr Monga's image.

Not necessarily full screen this time.

Use a beautiful portrait treatment.

Put one question on screen:

# "WHAT DID YOU BELIEVE

# WHEN THERE WAS NO EVIDENCE YET?"

Then underneath:

> Mr Monga started ITM when the future organisation was still eight people.
>
> What do you have to believe before the evidence arrives?

This could eventually connect to a video or audio answer from Mr Monga if ITM provides one.

If a video is later uploaded, Claude should make this component media-ready.

Possible states:

```text
PORTRAIT ONLY
PORTRAIT + QUOTE
PORTRAIT + AUDIO
PORTRAIT + VIDEO
```

---

# 20. THE WALUMO BRIDGE

Timeline progresses.

# 2025

Then:

# WALUMO

Wally becomes visibly interested.

Narration:

> Fifteen years after ITM began by developing people, another question emerged:
>
> **What happens when the Group begins building more of its own technology?**

Then:

> Walumo was created as ITM Holding's technology innovation hub.

Now the visual style begins changing.

Historical gold transitions gradually toward futuristic light.

Not fully yet.

Then:

# FROM DEVELOPING PEOPLE

# TO BUILDING SYSTEMS

# THAT HELP PEOPLE WORK BETTER.

---

# 21. PRESENT DAY

The timeline reaches:

# ITM@15

The hero statistics can appear carefully.

Do not bombard users with numbers.

Use one at a time.

Example:

```text
8
```

becomes:

```text
15,000+
```

Then:

```text
1 COUNTRY
```

becomes:

```text
20+ MARKETS / PRESENCE
```

Use only figures approved in the project's content source of truth.

Claude must not hard-code conflicting public figures without checking the authoritative content configured for ITM@15.

---

# 22. FINAL FOUNDER MOMENT

Return once more to the original portrait.

This visually closes the circle.

Text:

> Fifteen years ago, this was an idea.

Then images begin appearing behind or around Mr Monga.

Teams.

Countries.

Products.

People.

Then:

> Today, thousands of people carry a piece of it.

Then:

# BUT THIS IS NOT THE END OF THE STORY.

Wally enters.

Looks toward the next portal.

Dialogue:

> **"Actually..."**

Pause.

> **"This is where you enter."**

---

# 23. PLAYER TRANSITION

Now personalize.

Example:

# ALEXANDER

Then:

```text
KENYA
WALUMO
```

Wally:

> "Mr Monga started with eight."

Pause.

> "You're joining the story fifteen years later."

Pause.

> "What are you going to add to it?"

Then:

# BEGIN MY ITM@15 JOURNEY

Button glows.

This button transitions into the player's Day 1 game.

---

# 24. OPTIONAL FOUNDER VOICE FEATURE

Build the component so ITM can later add:

```text
founder-audio.mp3
```

or:

```text
founder-video.mp4
```

without redesigning the page.

If media becomes available, a subtle button can appear:

# HEAR THE STORY FROM MR MONGA

Do not autoplay long speech.

Allow users to choose.

---

# 25. MUSIC

Opening:

Low cinematic atmosphere.

Not dramatic superhero music.

Something human.

Warm.

Reflective.

As the story grows:

Add layers.

By geographical expansion:

More rhythm.

By Walumo:

Introduce subtle futuristic elements.

At player transition:

Music becomes energetic.

It should sound like:

# HISTORY BECOMING MOMENTUM.

---

# 26. SCROLL BEHAVIOUR

Do not make this one enormous page of text.

Build controlled full-screen story scenes.

Example:

```text
SCENE 1 — PORTRAIT
↓
SCENE 2 — BELIEF
↓
SCENE 3 — RETURN
↓
SCENE 4 — 2011
↓
SCENE 5 — ITM NAME
↓
SCENE 6 — EIGHT
↓
SCENE 7 — GROWTH
↓
SCENE 8 — AFRICA
↓
SCENE 9 — HOLDING
↓
SCENE 10 — PEOPLE
↓
SCENE 11 — WALUMO
↓
SCENE 12 — PLAYER
```

Use scroll snapping or controlled cinematic transitions carefully.

Do not trap the user.

Provide:

**SKIP STORY**

for returning players.

But the first experience should encourage completion.

---

# 27. MOBILE

This story absolutely must work on mobile.

Do not merely shrink the desktop version.

For mobile:

* portrait image crops differently;
* text moves to lower third;
* shorter line lengths;
* 3D effects simplified;
* fewer simultaneous particles;
* touch-friendly CTA;
* scene transitions optimized;
* respect reduced motion.

The photograph must remain the emotional focus.

---

# 28. PERFORMANCE

Use optimized image delivery.

`sylva-monga.webp` should be:

* correctly sized;
* preloaded for the hero;
* responsive;
* not repeatedly downloaded;
* rendered using the project's appropriate Next.js image component if applicable.

The story cannot begin with a blank screen waiting for a huge image.

Use a tasteful loading state.

Example:

```text
15
```

very subtly pulsing.

Then fade directly into the photograph.

---

# 29. ACCESSIBILITY

The image needs meaningful alt text:

```text
Portrait of Mr Sylva Monga, Founder and Chairman of ITM Group
```

Maintain readable contrast.

Provide keyboard progression.

Respect reduced motion.

Story information must remain understandable without animation or audio.

---

# 30. ADMIN CONTENT CONTROL

Do not hard-code all founder content permanently.

Mission Control / Content Admin should eventually be able to edit:

* section titles;
* story paragraphs;
* dates;
* approved statistics;
* quote;
* image;
* optional audio;
* optional video;
* CTA labels.

But:

## THE CORE STORY STRUCTURE SHOULD REMAIN CONTROLLED.

Admins can tune content.

They should not accidentally destroy the entire layout.

---

# 31. ANALYTICS

Capture:

```text
founder_story_started
founder_story_completed
founder_story_skipped
founder_audio_played
founder_video_played
origin_clue_collected
day1_entered
```

This allows Walumo to understand whether people actually experienced the opening.

---

# 32. CLAUDE IMPLEMENTATION REQUIREMENT

Claude must connect this opening into the existing ITM@15 architecture.

Before implementation:

Read:

```text
CLAUDE.md
ITM15_MASTER_BUILD_RUNBOOK.md
ITM15_PROJECT_AUDIT_AND_PENDING_CONTROL.md
docs/PRODUCT_GUIDE.md
docs/WALLY.md
docs/ITM15_STORYLINE_EXPERIENCE_BUILD_BIBLE.md
```

Then locate:

```text
sylva-monga.webp
```

Do not create a duplicate asset.

Build the founder story as a reusable story sequence.

Suggested structure:

```text
components/story/founder/
├── FounderHero.tsx
├── FounderBelief.tsx
├── FounderReturn.tsx
├── Founder2011.tsx
├── ITMNameReveal.tsx
├── EightReveal.tsx
├── GrowthReveal.tsx
├── AfricaExpansion.tsx
├── HoldingReveal.tsx
├── PeopleReveal.tsx
├── WalumoBridge.tsx
├── PlayerTransition.tsx
└── FounderStory.tsx
```

Animation logic should remain separated from factual content wherever practical.

---

# 33. TEST REQUIREMENTS

Claude must test:

```text
desktop rendering
mobile rendering
hero image crop
reduced motion
keyboard progression
skip story
first-time story
returning player behavior
Wally interaction
origin clue unlock
player transition
Day 1 transition
analytics
content loading
missing optional audio
missing optional video
slow network
```

Visual tests should confirm Mr Monga's face is not cropped badly at major viewport sizes.

---

# 34. THE FEELING WE WANT

When someone sees Mr Sylva Monga on the first page, they should not think:

> "Here is the Chairman."

They should think:

> **"This is where the story started."**

When they see:

# 8

they should understand how small the beginning was.

When they see Africa light up, they should feel the scale.

When they see thousands of employees, they should understand that the story stopped belonging to one person.

When Walumo appears, they should understand that ITM is still creating new chapters.

And when Wally finally turns to the player and says:

> **"This is where you enter."**

the employee should understand:

# ITM@15 IS NOT A HISTORY LESSON.

# THEY ARE PART OF THE NEXT CHAPTER.
