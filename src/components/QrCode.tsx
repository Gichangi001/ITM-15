import QRCode from "qrcode";

/**
 * A "scan to join" code for a live event — printed on a screen/poster/badge
 * so someone can point their phone camera at it instead of typing a URL.
 * Always points at `/login`, never at anything that itself grants access —
 * scanning it does exactly what typing the URL by hand would: it lands on
 * the real sign-in/onboarding entry point (password for admin-surface
 * accounts, a one-time emailed link — or, for a brand-new email, real
 * self-serve onboarding — for everyone else, per
 * `src/app/login/actions.ts`). The QR code is a convenience for reaching
 * that page, not a credential or a bypass of it.
 *
 * Rendered fully server-side (an async Server Component) as a small PNG
 * data URI — no client JS, no external image request, nothing to fail on
 * a bad connection at a live event.
 */
export async function QrCode({ url, size = 160 }: { url: string; size?: number }) {
  const dataUrl = await QRCode.toDataURL(url, {
    width: size,
    margin: 1,
    color: { dark: "#0b0f1a", light: "#ffffff" },
  });

  return (
    // eslint-disable-next-line @next/next/no-img-element -- a small generated data: URI, not worth Next/Image's optimization pipeline
    <img
      src={dataUrl}
      alt={`QR code — scan to open ${url}`}
      width={size}
      height={size}
      className="rounded-lg"
    />
  );
}

/** Resolves the same way every other server-side redirect in this app already does — see src/app/login/actions.ts. */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
