import Image from "next/image";
import { WALLY_POSES, type WallyPoseKey } from "@/wally/rendering/assets";

/**
 * docs/WALLY.md §12.4 "collision rule" (never cover primary controls) and
 * §31 (speech text must be readable by assistive technology, dismissible,
 * keyboard accessible). Fixed to a corner, small, and always dismissible —
 * the Lite/2D-tier presentation this project's actual art (a set of static
 * poses, not rigged clips — see wally/rendering/assets.ts's header) is
 * naturally suited to, rather than a full-screen takeover.
 */
export function WallySpeechBubble({
  text,
  pose,
  onDismiss,
}: {
  text: string;
  pose: WallyPoseKey;
  onDismiss: () => void;
}) {
  const asset = WALLY_POSES[pose] ?? WALLY_POSES.normal;

  return (
    <div
      role="status"
      className="motion-safe:animate-[wally-bubble-in_0.25s_ease-out] fixed right-4 bottom-4 z-40 flex max-w-xs items-end gap-3 sm:right-6 sm:bottom-6"
    >
      <Image
        src={asset.src}
        alt=""
        width={56}
        height={56}
        className="shrink-0 rounded-full border border-white/10 bg-surface"
      />
      <div className="relative rounded-2xl rounded-bl-none border border-white/10 bg-surface px-4 py-2.5 text-sm text-ink shadow-lg">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs text-muted hover:bg-white/20"
        >
          ×
        </button>
        {text}
      </div>
    </div>
  );
}
