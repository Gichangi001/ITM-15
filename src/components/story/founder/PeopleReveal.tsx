import Image from "next/image";
import sylvaMonga from "@/sylva-monga.webp";
import { FOUNDER_IMAGE_ALT, founderPeople } from "@/content/founderStory";
import { FounderScene } from "./FounderScene";

/**
 * §18-19: the story moves beyond the founder — "a founder can begin a
 * story, he cannot build fifteen years alone" — then returns briefly to
 * his portrait for the reflective question. §18 asks for "a photo mosaic
 * [of] employees, country leaders, teams..." — this project has no real,
 * approved photo library of ITM staff to draw from (fabricating stand-in
 * photos of real people would be exactly the kind of invented content
 * this project's rules forbid), so that mosaic is honestly left
 * unbuilt for now; the scene still carries its full weight through text
 * and the founder's own real portrait, per §19's "beautiful portrait
 * treatment, not necessarily full screen."
 */
export function PeopleReveal() {
  return (
    <FounderScene id="people" className="bg-bg text-ink">
      <div className="founder-line flex flex-col gap-1 [--founder-delay:0.2s]">
        {founderPeople.paragraph1.map((p) => (
          <p key={p} className="text-base text-muted sm:text-lg">
            {p}
          </p>
        ))}
      </div>

      <div className="founder-line flex flex-col gap-0.5 [--founder-delay:1.8s]">
        {founderPeople.closingLines.map((line) => (
          <p key={line} className="founder-line-gold font-display text-2xl font-semibold sm:text-3xl">
            {line}
          </p>
        ))}
      </div>

      <div className="founder-line flex flex-col gap-1 [--founder-delay:3.4s]">
        {founderPeople.paragraph2.map((p) => (
          <p key={p} className="text-sm text-muted">
            {p}
          </p>
        ))}
      </div>

      <div className="founder-line mt-4 flex flex-col items-center gap-4 [--founder-delay:6.4s]">
        <Image
          src={sylvaMonga}
          alt={FOUNDER_IMAGE_ALT}
          width={96}
          height={96}
          className="h-24 w-24 rounded-full object-cover object-[50%_8%]"
        />
        <div className="flex flex-col gap-0.5">
          {founderPeople.founderQuestion.map((line) => (
            <p key={line} className="font-display text-lg font-semibold sm:text-xl">
              {line}
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-0.5">
          {founderPeople.founderQuestionSub.map((p) => (
            <p key={p} className="max-w-md text-sm text-muted">
              {p}
            </p>
          ))}
        </div>
      </div>
    </FounderScene>
  );
}
