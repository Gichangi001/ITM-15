---
name: security-gate
description: Security and authorization review for ITM@15. Use before merging changes involving auth, Supabase, RLS, admin actions, scores, votes, uploads, realtime channels, secrets, or production release.
context: fork
---

# ITM@15 Security Gate

Read `docs/PRODUCT_GUIDE.md` §24, `docs/WALLY.md` §9, and the changed files. Review only grounded code — open every file before making a claim about it.

## Checklist (per `ITM15_MASTER_BUILD_RUNBOOK.md` §19)

- Authentication: can an uninvited user enter?
- Authorization: can a player reach admin server actions?
- RLS: can one player read another player's private data?
- Scoring: can browser input increase score without server validation? Every point must trace to a `score_events` row.
- Voting: can votes be duplicated or forged? Is uniqueness enforced at the database level, not just the UI?
- Uploads: can arbitrary executable content be served? Are MIME/size validated server-side?
- Moderation: can unapproved images/media reach public surfaces?
- Realtime: can users subscribe to audiences (country/entity/squad/player channels) they don't belong to?
- Admin actions: are high-impact actions audited (`audit_logs`)?
- Secrets: are service-role/Resend/Sentry/Vercel credentials server-only, never in `NEXT_PUBLIC_*` or Wally event payloads?
- Logs: do logs leak PII or tokens?
- Password flow: is the `Walumo` starter password strictly temporary, replaced at first login (`must_change_password`)?
- Rate limits: can mission/vote/upload endpoints be abused?
- Dependencies: any known critical vulnerability in what was just added?

## Output

Return **PASS** or **BLOCK** with evidence (file:line) and required fixes. Any critical finding is a BLOCK. Never weaken this checklist to obtain a PASS, and never expose secret values in the review output.
