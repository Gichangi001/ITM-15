"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Product Guide §26 Phase 4: "Navigation... Responsive layout." §7's player
 * information architecture, minus /profile and /help which the IA lists
 * but which aren't primary game surfaces — both are still real routes
 * (linked from elsewhere), just not first-row nav items, to keep this bar
 * from overflowing on narrow phones.
 *
 * No admin link exists anywhere in this component — the Phase 4 acceptance
 * criterion "no admin navigation leaks to players" is trivially true here,
 * not because of a role check (a PLAYER-role account is exactly who
 * reaches this nav; src/proxy.ts is what actually keeps a player out of
 * /admin).
 */
const NAV_ITEMS = [
  { href: "/play", label: "Play" },
  { href: "/passport", label: "Passport" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/gallery", label: "Gallery" },
  { href: "/achievements", label: "Achievements" },
  { href: "/notifications", label: "Notifications" },
] as const;

export function PlayerNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Player navigation" className="border-b border-white/5 bg-bg">
      <ul className="mx-auto flex max-w-4xl items-center gap-1 overflow-x-auto px-4 py-3 sm:px-6">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`block rounded-full px-3.5 py-1.5 text-sm whitespace-nowrap transition ${
                  isActive ? "bg-walumo/15 text-walumo" : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        <li className="ml-auto flex shrink-0 gap-1">
          <Link
            href="/profile"
            aria-current={pathname === "/profile" ? "page" : undefined}
            className={`block rounded-full px-3.5 py-1.5 text-sm whitespace-nowrap transition ${
              pathname === "/profile" ? "bg-walumo/15 text-walumo" : "text-muted hover:text-ink"
            }`}
          >
            Profile
          </Link>
          <Link
            href="/help"
            aria-current={pathname === "/help" ? "page" : undefined}
            className={`block rounded-full px-3.5 py-1.5 text-sm whitespace-nowrap transition ${
              pathname === "/help" ? "bg-walumo/15 text-walumo" : "text-muted hover:text-ink"
            }`}
          >
            Help
          </Link>
        </li>
      </ul>
    </nav>
  );
}
