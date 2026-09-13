"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { WALLY_POSES, type WallyPoseKey } from "@/wally/rendering/assets";
import { publishWallyEvent } from "./actions";

const ANIMATION_OPTIONS: WallyPoseKey[] = [
  "open-arms",
  "dance-pose",
  "investigate",
  "stop",
  "lean-clock",
];

/**
 * docs/WALLY.md §16.1's layout (audience/event config, preview stage,
 * message/delivery controls) condensed to what this slice actually needs.
 * §16.3: "Admins must preview before mass global publish" — implemented as
 * a live client-side preview bubble plus a `window.confirm()` gate on
 * submit specifically for the GLOBAL audience (a specific-player message
 * reaches one person, so it doesn't carry the same "482 connected
 * players" risk a global send does).
 */
export function WallyTriggerForm() {
  const [audienceType, setAudienceType] = useState<"GLOBAL" | "PLAYER">("GLOBAL");
  const [message, setMessage] = useState("");
  const [animationKey, setAnimationKey] = useState<WallyPoseKey>("open-arms");
  const formId = useId();
  const pose = WALLY_POSES[animationKey];

  return (
    <form
      action={publishWallyEvent}
      onSubmit={(e) => {
        if (audienceType === "GLOBAL" && !window.confirm("Send this Wally event to everyone connected?")) {
          e.preventDefault();
        }
      }}
      className="grid grid-cols-1 gap-6 md:grid-cols-2"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold tracking-wide text-muted uppercase">Audience</label>
          <div className="flex gap-4 text-sm text-ink">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="audienceType"
                value="GLOBAL"
                checked={audienceType === "GLOBAL"}
                onChange={() => setAudienceType("GLOBAL")}
              />
              Everyone
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="audienceType"
                value="PLAYER"
                checked={audienceType === "PLAYER"}
                onChange={() => setAudienceType("PLAYER")}
              />
              Specific player
            </label>
          </div>
        </div>

        {audienceType === "PLAYER" ? (
          <div className="flex flex-col gap-2">
            <label htmlFor={`${formId}-email`} className="text-xs font-semibold tracking-wide text-muted uppercase">
              Player email
            </label>
            <input
              id={`${formId}-email`}
              type="email"
              name="playerEmail"
              required
              placeholder="amina.kenya@itm15.test"
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <label htmlFor={`${formId}-message`} className="text-xs font-semibold tracking-wide text-muted uppercase">
            Message
          </label>
          <textarea
            id={`${formId}-message`}
            name="message"
            required
            maxLength={220}
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Kenya just took the lead. Senegal, what are you going to do?"
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${formId}-animation`} className="text-xs font-semibold tracking-wide text-muted uppercase">
            Wally pose
          </label>
          <select
            id={`${formId}-animation`}
            name="animationKey"
            value={animationKey}
            onChange={(e) => setAnimationKey(e.target.value as WallyPoseKey)}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink"
          >
            {ANIMATION_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${formId}-priority`} className="text-xs font-semibold tracking-wide text-muted uppercase">
            Priority
          </label>
          <select
            id={`${formId}-priority`}
            name="priority"
            defaultValue={audienceType === "GLOBAL" ? "P1_LIVE_EVENT" : "P2_PLAYER_RESULT"}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink"
          >
            <option value="P1_LIVE_EVENT">P1 — Live event (Wally Drop, big moment)</option>
            <option value="P2_PLAYER_RESULT">P2 — Player result</option>
            <option value="P3_GUIDANCE">P3 — Guidance</option>
          </select>
        </div>

        <button type="submit" className="btn-primary self-start">
          Publish
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Preview</p>
        <div className="flex items-end gap-3 rounded-xl border border-white/10 bg-surface p-5">
          <Image src={pose.src} alt="" width={64} height={64} className="rounded-lg" />
          <div className="rounded-2xl rounded-bl-none bg-white/10 px-4 py-2.5 text-sm text-ink">
            {message.trim() || "Your message will appear here."}
          </div>
        </div>
      </div>
    </form>
  );
}
