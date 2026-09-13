import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentRoles } from "@/lib/auth/session";
import { canManageContent } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { MediaUploadForm } from "./MediaUploadForm";
import { toggleMediaFeatured } from "./actions";

export const metadata: Metadata = { title: "Media Library — ITM@15" };

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "You are not authorized to manage media.",
  invalid_input: "That action didn't look right — nothing was changed.",
  update_failed: "Something went wrong saving that change. Try again.",
};

/**
 * Product Guide §12.4 — the one remaining Phase 10 gap. Game Master/Super
 * Admin only, same capability as mission content management
 * (`canManageContent`). Reads via the service-role client since an admin
 * curating the library needs to see everything regardless of the public
 * read policy already on `media_assets` — consistent with every other
 * admin list page in this app.
 */
export default async function MediaLibraryPage({
  searchParams,
}: PageProps<"/admin/media">) {
  const roles = await getCurrentRoles();
  if (!canManageContent(roles)) {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorParam = typeof params.error === "string" ? params.error : undefined;
  const errorMessage = errorParam ? ERROR_MESSAGES[errorParam] : undefined;
  const succeeded = params.success === "1";

  const admin = createAdminClient();
  const { data: assets } = await admin
    .from("media_assets")
    .select("id, asset_type, storage_path, caption, tags, is_featured, created_at")
    .order("created_at", { ascending: false });

  const assetsWithUrls = (assets ?? []).map((asset) => {
    const { data } = admin.storage.from("admin-media").getPublicUrl(asset.storage_path);
    return { ...asset, url: data.publicUrl };
  });

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-walumo uppercase">
          ITM@15 — Mission Control
        </p>
        <h1 className="text-3xl">Media Library</h1>
        <p className="text-sm text-muted">
          Historical photos, event photos, backgrounds and clips — general
          reference media, separate from challenge evidence (moderated
          separately under Submissions).
        </p>
      </div>

      {succeeded ? (
        <p role="status" className="text-sm text-walumo">
          Saved.
        </p>
      ) : null}
      {errorMessage ? (
        <p role="alert" className="text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">Upload</h2>
        <MediaUploadForm />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-muted uppercase">
          Library ({assetsWithUrls.length})
        </h2>
        {assetsWithUrls.length === 0 ? (
          <p className="text-sm text-muted">No media uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {assetsWithUrls.map((asset) => (
              <figure
                key={asset.id}
                className="flex flex-col gap-2 overflow-hidden rounded-xl border border-white/10 bg-surface p-3"
              >
                {asset.asset_type === "PHOTO" ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a public bucket's own URL, not worth Next/Image's remote-pattern config for an admin-only library
                  <img
                    src={asset.url}
                    alt={asset.caption ?? ""}
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-md bg-white/5 text-xs text-muted">
                    {asset.asset_type}
                  </div>
                )}
                <figcaption className="flex flex-col gap-1 text-xs text-muted">
                  {asset.caption ? <span className="text-ink">{asset.caption}</span> : null}
                  {asset.tags.length > 0 ? <span>{asset.tags.join(", ")}</span> : null}
                </figcaption>
                <form action={toggleMediaFeatured}>
                  <input type="hidden" name="assetId" value={asset.id} />
                  <input type="hidden" name="featured" value={String(asset.is_featured)} />
                  <button
                    type="submit"
                    className={`w-full rounded-md px-2 py-1 text-xs ${
                      asset.is_featured
                        ? "bg-gold/15 text-gold"
                        : "border border-white/10 text-muted hover:text-ink"
                    }`}
                  >
                    {asset.is_featured ? "★ Featured" : "Feature"}
                  </button>
                </form>
              </figure>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
