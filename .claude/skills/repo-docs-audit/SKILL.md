---
name: repo-docs-audit
description: Inventories Markdown and Word requirements documents for ITM@15, extracts DOCX text locally without third-party upload, and keeps docs/DOCS_INDEX.md current. Use when a document is added or changed, or when a Word/Markdown pair might have diverged.
---

# ITM@15 Repository Documentation Audit

Purpose (per `ITM15_MASTER_BUILD_RUNBOOK.md` §3): keep `docs/DOCS_INDEX.md` accurate, and confirm `.docx` sources haven't silently gained a requirement the `.md` versions lack.

## Steps

1. Find all documentation: `find . -type f \( -iname '*.md' -o -iname '*.mdx' -o -iname '*.docx' -o -iname '*.pdf' \) -not -path './node_modules/*' -not -path './.git/*' | sort`.
2. For any `.docx` whose git blob hash or commit changed since the last audit, extract its text **locally** — check `/skills` first for a trustworthy document-reading skill (the `docx` skill is available and preferred); only fall back to a small deterministic OOXML-extraction script if none exists. Never upload the document to a third-party service to read it.
3. Store extracted temporary text under `.tmp/docs/` (gitignored). Never treat this extracted text as a new authoritative document — it exists only to diff against the committed `.md`.
4. Diff the extracted text's substance against the companion `.md`. If they agree, note "no divergence" in the index. If the `.docx` contains a clearly newer approved requirement absent from the `.md`, stop and surface the conflict — do not silently merge it into the `.md`.
5. Update `docs/DOCS_INDEX.md`: path, type, purpose, authority level (per the order in `ITM15_MASTER_BUILD_RUNBOOK.md` §1.1), last-modified commit, blob SHA, key requirements, whether fully read, whether superseded.
6. If a conflict between two controlling documents is found (not just Word-vs-Markdown), apply the authority model, record the resolution in `docs/adr/` if it's architectural/security-relevant, and update project memory. If it can't be resolved from the documents themselves, stop that implementation slice and surface the conflict rather than guessing.
