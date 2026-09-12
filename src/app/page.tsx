import Image from "next/image";
import { WALLY_POSES } from "@/wally/rendering/assets";

export default function Home() {
  const wally = WALLY_POSES["open-arms"];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-zinc-50">
      <Image
        src={wally.src}
        alt="Wally, the Walumo mascot, waving hello"
        width={wally.width}
        height={wally.height}
        priority
        className="h-40 w-auto sm:h-48"
      />
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
        Walumo
      </p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        ITM@15 — Wally Takeover
      </h1>
      <p className="max-w-md text-balance text-sm text-zinc-400">
        The seven-day anniversary experience is under construction. This is
        the Phase 0 foundation — the real landing page, with Wally, arrives in
        Phase 3.
      </p>
    </div>
  );
}
