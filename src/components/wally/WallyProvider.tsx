"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  selectDialogue,
  substituteVariables,
  SAFE_GENERIC_DIALOGUE,
  type DialogueRow,
} from "@/wally/dialogue/resolver";
import { shouldInterrupt, type WallyPriority } from "@/wally/behavior/priority";
import { WallySpeechBubble } from "./WallySpeechBubble";
import type { WallyPoseKey } from "@/wally/rendering/assets";

type ActiveWally = {
  id: string;
  text: string;
  pose: WallyPoseKey;
  priority: WallyPriority;
  interruptible: boolean;
};

/**
 * docs/WALLY.md §4.3 "Wally Controller" (W1/W2 scope, Phase 13 per §37) —
 * a single mounted provider handling both the deterministic local greeting
 * and real, server-approved admin-triggered events.
 *
 * Real, disclosed scope boundaries for this first slice (not the full §4/
 * §10 architecture):
 * - One active "slot," not a queue — `shouldInterrupt` decides whether an
 *   incoming event replaces what's showing; anything it doesn't replace is
 *   dropped, not queued (see priority.ts's header).
 * - Audience targeting is GLOBAL/PLAYER only, matching what
 *   `wally_events`'s RLS policy and the admin trigger action both support
 *   today — COUNTRY/ENTITY/SQUAD are deferred at every layer, not just here.
 * - No `wally_event_receipts` persistence yet (WALLY.md §8.5) — dedupe is
 *   an in-memory Set for the life of this mounted component (a page
 *   reload can re-show an event once more). A real analytics/receipt
 *   pipeline is W7 scope, not required for W1/W2's acceptance criteria.
 * - Every fetch here goes through the RLS-scoped browser client — a
 *   player physically cannot receive another player's targeted event or
 *   another campaign's dialogue, regardless of what topic name a
 *   broadcast ping arrives on (see actions.ts's comment on this).
 */
export function WallyProvider({
  playerId,
  firstName,
}: {
  playerId: string;
  firstName: string | null;
}) {
  const [active, setActive] = useState<ActiveWally | null>(null);
  const shownIds = useRef<Set<string>>(new Set());

  const tryShow = useCallback((incoming: ActiveWally) => {
    if (shownIds.current.has(incoming.id)) return;
    setActive((current) => {
      const currentItem = current ? { priority: current.priority, interruptible: current.interruptible } : null;
      const incomingItem = { priority: incoming.priority, interruptible: incoming.interruptible };
      if (!shouldInterrupt(currentItem, incomingItem)) return current;
      shownIds.current.add(incoming.id);
      return incoming;
    });
  }, []);

  // LOGIN_GREETING: once per browser tab session, deterministic, uses the
  // player's real (server-supplied) first name — never fabricated.
  //
  // The session flag is written only *after* the async work below
  // resolves and the greeting is actually about to be shown — not before
  // the `await`. Writing it eagerly (to "claim" the greeting before a
  // React Strict Mode dev double-invoke could run it twice) turns out to
  // backfire in exactly that scenario: Strict Mode mounts, synchronously
  // unmounts, then remounts this effect in the same tick. The first
  // invocation would write the flag before yielding at its first `await`;
  // by the time the *second* (final, stable) invocation's synchronous
  // portion runs its own `sessionStorage` check moments later, the flag is
  // already "1" (written by the first invocation), so it bails out too —
  // and the first invocation's own continuation later finds `cancelled`
  // true from its own cleanup and also bails. Net result: neither
  // invocation ever calls `tryShow`, and the greeting silently never
  // appears in dev at all (not just delayed) — a real bug, not a Strict
  // Mode timing quirk to just wait out (see docs/PROJECT_STATE.md's
  // Presence section for that different, genuinely load-bearing pattern).
  // Deferring the write until after the fetch avoids this regardless of
  // how many times Strict Mode invokes the effect.
  useEffect(() => {
    if (!firstName) return;
    let greeted = false;
    try {
      greeted = sessionStorage.getItem("wally-greeted") === "1";
    } catch {
      // sessionStorage can throw in a locked-down/private context — a
      // missed greeting once is not worth failing the whole provider for.
    }
    if (greeted) return;

    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("wally_dialogues")
        .select("key, locale, event_type, variant, text, weight, is_active")
        .eq("event_type", "LOGIN_GREETING");
      if (cancelled) return;
      const rows = (data ?? []) as DialogueRow[];
      const dialogue = selectDialogue(rows, { key: "login.greeting" });
      const text = dialogue
        ? (substituteVariables(dialogue.text, { first_name: firstName }) ?? SAFE_GENERIC_DIALOGUE)
        : `${firstName}, ITM@15 has been waiting.`;
      try {
        sessionStorage.setItem("wally-greeted", "1");
      } catch {
        // see above
      }
      tryShow({ id: "login-greeting", text, pose: "normal", priority: "P3_GUIDANCE", interruptible: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [firstName, tryShow]);

  const fetchAndShowLatestTargetedEvent = useCallback(async () => {
    const supabase = createClient();
    // RLS ("players can read published global or own-targeted wally
    // events") is the real filter here — this query returns nothing this
    // player isn't actually eligible to see, regardless of which topic
    // triggered the refetch.
    const { data: events } = await supabase
      .from("wally_events")
      .select(
        "id, event_type, animation_key, dialogue_key, dialogue_override, priority, variables, created_at",
      )
      .eq("status", "PUBLISHED")
      .order("created_at", { ascending: false })
      .limit(5);

    const event = (events ?? []).find((e) => !shownIds.current.has(e.id));
    if (!event) return;

    let text: string | null = event.dialogue_override ?? null;
    if (!text && event.dialogue_key) {
      const { data: dialogueRows } = await supabase
        .from("wally_dialogues")
        .select("key, locale, event_type, variant, text, weight, is_active")
        .eq("event_type", event.event_type);
      const rows = (dialogueRows ?? []) as DialogueRow[];
      const dialogue = selectDialogue(rows, { key: event.dialogue_key });
      text = dialogue
        ? substituteVariables(dialogue.text, (event.variables as Record<string, string>) ?? {})
        : null;
    }

    tryShow({
      id: event.id,
      text: text ?? SAFE_GENERIC_DIALOGUE,
      pose: (event.animation_key as WallyPoseKey) || "normal",
      priority: (event.priority as WallyPriority) || "P3_GUIDANCE",
      interruptible: event.priority !== "P0_CRITICAL",
    });
  }, [tryShow]);

  // Catch up once on mount (an event published just before this tab
  // opened), then react live to new ones for the rest of the session —
  // "game:global" is the existing pause/resume/mission-publish channel,
  // reused here for GLOBAL Wally events too (Supabase multiplexes
  // multiple event names on one channel fine); "player:{id}" is this
  // player's own channel for PLAYER-targeted events.
  useEffect(() => {
    fetchAndShowLatestTargetedEvent();

    const supabase = createClient();
    const globalChannel = supabase.channel("game:global");
    globalChannel.on("broadcast", { event: "wally.triggered" }, () => {
      fetchAndShowLatestTargetedEvent();
    });
    globalChannel.subscribe();

    const playerChannel = supabase.channel(`player:${playerId}`);
    playerChannel.on("broadcast", { event: "wally.triggered" }, () => {
      fetchAndShowLatestTargetedEvent();
    });
    playerChannel.subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
      supabase.removeChannel(playerChannel);
    };
  }, [playerId, fetchAndShowLatestTargetedEvent]);

  if (!active) return null;

  return <WallySpeechBubble text={active.text} pose={active.pose} onDismiss={() => setActive(null)} />;
}
