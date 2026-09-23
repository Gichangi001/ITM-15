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

  // Step 1: notice the redirect signal and show the toast. Nothing else
  // happens here - in particular, no router.replace() - see the second
  // effect below for why.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, error]);

  // Step 2: only once the toast has actually committed to the DOM (this
  // effect depends on `toast`, so it runs after that render), schedule
  // its auto-dismiss AND strip the query param. Doing this in the same
  // effect that shows the toast (as an earlier version of this component
  // did) raced router.replace()'s own re-render against the still-queued
  // setToast microtask and reliably lost the toast before a player ever
  // saw it - found live, the same bug class already fixed twice
  // elsewhere in this project (Phase 12's mission-page fix, the golden
  // card claim confirmation).
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
      const next = new URLSearchParams(searchParams);
      next.delete("success");
      next.delete("error");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  function dismiss() {
    setToast(null);
    const next = new URLSearchParams(searchParams);
    next.delete("success");
    next.delete("error");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

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
      <button type="button" onClick={dismiss} aria-label="Dismiss" className="ml-2 text-muted hover:text-ink">
        ×
      </button>
    </div>
  );
}
