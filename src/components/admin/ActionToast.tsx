"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * Direct request 2026-09-18: "add pop up actions when things are done eg
 * failed when it fails and send or confirmed when it works." Every admin
 * server action in this app already redirects with `?success=1` or
 * `?error=<code>` (9 pages use this exact pattern) - this component reads
 * that same signal and shows a real floating confirmation instead of the
 * static inline text each page previously rendered in place, then strips
 * the query param so a refresh doesn't re-show it. No new server-action
 * plumbing needed anywhere; every existing redirect already carries
 * everything this needs.
 *
 * `successMessage` lets a page customize the confirmation text (default
 * "Done." is honest but generic); `errorMessages` maps this page's own
 * error codes to the same human text it used to render inline, so nothing
 * is lost by switching to a toast.
 */
export function ActionToast({
  successMessage = "Done.",
  errorMessages = {},
}: {
  successMessage?: string;
  errorMessages?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const error = searchParams.get("error");
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (success !== "1" && !error) {
      return;
    }

    // Matches this project's existing PlayerTransition fix for the same
    // rule: queueMicrotask defers the setState out of the synchronous
    // effect body, avoiding react-hooks/set-state-in-effect's cascading-
    // render warning.
    queueMicrotask(() => {
      if (success === "1") {
        setToast({ kind: "success", text: successMessage });
      } else if (error) {
        setToast({ kind: "error", text: errorMessages[error] ?? "Something went wrong. Try again." });
      }
    });

    // Strip the param immediately so a later manual refresh (or the
    // params changing again for an unrelated reason) doesn't re-trigger
    // this same toast - the URL itself was never meant to be a durable
    // record of "you just did something," only a one-shot signal.
    const next = new URLSearchParams(searchParams);
    next.delete("success");
    next.delete("error");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
    // Deliberately depends only on the raw success/error values, not the
    // whole searchParams/router/pathname objects - this must NOT re-run
    // just because our own router.replace() below changed the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, error]);

  if (!toast) return null;

  return (
    <div
      role={toast.kind === "error" ? "alert" : "status"}
      className={`itm-card fixed right-4 bottom-4 z-50 flex max-w-sm items-center gap-2 px-4 py-3 text-sm shadow-lg ${
        toast.kind === "success" ? "border-walumo/40 text-walumo" : "border-red-400/40 text-red-400"
      }`}
    >
      <span aria-hidden>{toast.kind === "success" ? "✓" : "✕"}</span>
      <span className="text-ink">{toast.text}</span>
      <button
        type="button"
        onClick={() => setToast(null)}
        aria-label="Dismiss"
        className="ml-2 text-muted hover:text-ink"
      >
        ×
      </button>
    </div>
  );
}
