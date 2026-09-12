// Stub used by vitest.config.ts to alias `server-only`/`client-only` in
// tests. Those packages work by resolving to a throwing or empty module
// depending on a bundler "condition" (react-server vs default) that
// Next.js's webpack/Turbopack set but plain Vitest does not — so outside a
// Next.js build, `server-only` resolves to its throwing variant even in a
// plain Node test. Aliasing it to this genuinely-empty module keeps the
// production guard intact (it still works correctly under `next build`)
// while letting unit tests import server-only code directly.
export {};
