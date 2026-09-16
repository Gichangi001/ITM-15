/**
 * A subtle abstract geometric flourish (brief §22: "avoid reducing
 * countries to... imagery... use contemporary culture... pattern...
 * design" — deliberately not a country-specific motif, since this project
 * has no real curated cultural pattern library yet; a wrong or stereotyped
 * pattern would be worse than a neutral one). Uses `currentColor`, so it
 * re-colors automatically with whichever destination theme is currently
 * active (src/components/ThemeProvider.tsx sets `--color-walumo`, and this
 * is meant to be rendered inside an element with `text-walumo` or similar)
 * — one reusable flourish for every stop on the journey, not a
 * bespoke asset per country.
 *
 * Pure decoration: `aria-hidden`, absolutely positioned behind real
 * content, low opacity so it never competes with text contrast.
 */
export function JourneyPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-[0.07] ${className}`}
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <defs>
        <pattern id="journey-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="400" height="200" fill="url(#journey-dots)" />
      <path d="M -20 180 L 180 -20" stroke="currentColor" strokeWidth="1" />
      <path d="M 60 220 L 260 20" stroke="currentColor" strokeWidth="1" />
      <path d="M 220 220 L 420 20" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
