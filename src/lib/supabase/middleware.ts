import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { parseServerEnv } from "@/lib/env.server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Middleware-flavored Supabase client. Distinct from `src/lib/supabase/
 * server.ts` because middleware gets cookies via `NextRequest`/`NextResponse`
 * rather than `next/headers`'s `cookies()` — this is the shape
 * `@supabase/ssr`'s own Next.js middleware guide documents. Returns both the
 * client and the response so route logic can read the session AND still
 * attach any refreshed auth cookies to the response that's actually sent.
 */
export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = parseServerEnv(process.env);

  const supabase = createServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  return { supabase, getResponse: () => response };
}
