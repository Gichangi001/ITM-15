"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades + lifts a child in as it scrolls into view, once.
 *
 * Reduced motion is handled entirely via the `motion-reduce:` Tailwind
 * variant (a real CSS media query, identical on server and client output)
 * rather than JS-computed state — that avoids both a hydration mismatch
 * (server has no `window.matchMedia`) and a synchronous `setState` call in
 * the effect body, which `eslint-plugin-react-hooks` correctly flags: an
 * effect should synchronize with an external system via a callback
 * (the IntersectionObserver callback below), not fire state updates
 * unconditionally on every mount.
 */
export function RevealOnScroll({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
