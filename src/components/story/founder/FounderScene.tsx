"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * For scenes whose stagger delay is computed at runtime (e.g. from a
 * `.map()` index) rather than a fixed value known at build time — those
 * use the `[--founder-delay:2s]` Tailwind arbitrary-value className
 * directly, but a dynamic delay can't be a static class string Tailwind's
 * JIT can see, so it needs a real inline `style` instead. React's
 * `CSSProperties` doesn't know about custom properties, hence the cast.
 */
export type FounderDelayStyle = CSSProperties & { "--founder-delay"?: string };

/**
 * §26: "Build controlled full-screen story scenes... use scroll snapping."
 * One `min-h-svh` (§2: "approximately min-height: 100svh") snap-aligned
 * section per scene — the parent scroll container (FounderStory.tsx) owns
 * `scroll-snap-type`, this just declares each child as a snap point and
 * arms its staged text reveal once it actually scrolls into view (see
 * globals.css's `.founder-scene-armed`/`.founder-line` comment for why
 * that can't just be a fixed `animation-delay` the way the homepage's
 * Scene 0 gets away with).
 *
 * Kept deliberately dumb beyond that (layout + visibility arming only) so
 * every scene's own copy/content logic stays in its own file, per §32:
 * "Animation logic should remain separated from factual content wherever
 * practical."
 */
export function FounderScene({
  id,
  children,
  className,
  background,
  onVisible,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  /** Full-bleed background layer (an image, a gradient) painted behind `children`. */
  background?: ReactNode;
  /** Fires once, the first time this scene scrolls into view. */
  onVisible?: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          onVisible?.();
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onVisible is a stable per-scene callback identity isn't guaranteed by callers; firing once on first intersection is the whole point, re-subscribing on every render would be wrong
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      data-founder-scene={id}
      className={`relative flex min-h-svh w-full snap-start flex-col items-center justify-center overflow-hidden px-6 py-16 text-center ${armed ? "founder-scene-armed" : ""} ${className ?? ""}`}
    >
      {background}
      <div className="relative z-10 flex max-w-2xl flex-col items-center gap-6">{children}</div>
    </section>
  );
}
