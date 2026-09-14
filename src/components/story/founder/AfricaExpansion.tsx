import { founderAfrica } from "@/content/founderStory";
import { FounderScene, type FounderDelayStyle } from "./FounderScene";

/**
 * §15: "Start with DRC glowing. Then additional locations gradually
 * illuminate. Do not light every country at once." An abstract sequence
 * of country names lighting up one at a time (not a literal map — this
 * project has no map-tile/geo-data source to draw one honestly) — DRC
 * first (where ITM began), then the countries actually seeded for this
 * campaign (`countries`, Phase 1), in the same order onboarding already
 * offers them, rather than an invented list.
 */
const EXPANSION_COUNTRIES = [
  { flag: "🇨🇩", name: "DR Congo" },
  { flag: "🇰🇪", name: "Kenya" },
  { flag: "🇸🇳", name: "Senegal" },
  { flag: "🇧🇯", name: "Benin" },
  { flag: "🇧🇮", name: "Burundi" },
];

export function AfricaExpansion() {
  return (
    <FounderScene id="africa" className="bg-bg text-ink">
      <p className="founder-line founder-line-gold font-display text-2xl font-semibold sm:text-3xl [--founder-delay:0.2s]">
        {founderAfrica.heading}
      </p>

      <div className="founder-line flex flex-wrap items-center justify-center gap-3 [--founder-delay:1.4s]">
        {EXPANSION_COUNTRIES.map((country, index) => (
          <span
            key={country.name}
            className="founder-line inline-flex items-center gap-2 rounded-full border border-walumo/30 bg-walumo/10 px-4 py-2 text-sm"
            style={{ "--founder-delay": `${1.4 + index * 0.9}s` } as FounderDelayStyle}
          >
            <span aria-hidden="true">{country.flag}</span>
            {country.name}
          </span>
        ))}
      </div>

      <p className="founder-line max-w-lg text-sm text-muted sm:text-base [--founder-delay:6.6s]">
        {founderAfrica.paragraph}
      </p>

      <div className="founder-line flex flex-col gap-0.5 [--founder-delay:8s]">
        {founderAfrica.closingLines.map((line) => (
          <p key={line} className="font-display text-xl font-semibold sm:text-2xl">
            {line}
          </p>
        ))}
      </div>
    </FounderScene>
  );
}
