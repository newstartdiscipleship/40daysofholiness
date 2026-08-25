# 40 Days of Holiness Website Migration

## Authority and purpose

This repository migrates `https://www.40daysofholiness.com/` from Wix to a maintainable static site. Read this file, `migration/README.md`, and `Content/EDITORIAL.md` before migration work. The repository trackers—not chat memory—are authoritative.

The Obedience Challenge repository at `C:\Users\Darrell Home Office\CodexProjects\obediencechallenge` is a read-only architectural reference. Never modify it or copy its credentials, `.env`, transcripts, text, tracking data, canonicals, Vimeo IDs, analytics identifiers, or other site-specific/private values.

## Production safety and approval gates

- Treat Wix and all production services as read-only.
- Do not alter Wix, DNS, registration, email, Vimeo, payments, analytics, Search Console, or integrations without explicit owner authorization.
- Use a Cloudflare preview while Wix remains live. Do not deploy to the production domain or recommend cutover without explicit approval.
- Keep `https://www.40daysofholiness.com/` canonical during development unless the owner approves another strategy. Prevent preview indexing.
- Workflow: crawl/inventory → owner review → local build → authorized transcripts/articles → GitHub → preview → old/new QA → owner approval → separately authorized DNS cutover.
- This discovery phase stops before the full rebuild. Only the owner may set `APPROVED`; Codex may set `READY_FOR_REVIEW`.

## Discovery and authoritative trackers

Discover from XML sitemaps, robots.txt, navigation, internal links, Wix router routes, observed redirects, downloads, and later owner inputs. Maintain:

- `migration/pages.csv`
- `migration/redirects.csv`
- `migration/links.csv`
- `migration/videos.csv`
- `migration/assets.csv`
- `migration/seo-baseline.csv`
- `migration/README.md`

Record URLs/status, titles/descriptions/canonicals, H1–H3, body summary, links, images/alt, videos, forms, CTAs, downloads, OG/social/robots/schema, special behavior, migration stage, QA, and owner decision. Never let automation overwrite owner decisions or approvals.

States: `DISCOVERED → CRAWLED → BASELINE_CAPTURED → ASSETS_CAPTURED → VIDEO_IDENTIFIED → TRANSCRIPT_RETRIEVED → ARTICLE_CREATED → PAGE_BUILT → LINKS_QA → SEO_QA → VISUAL_QA → READY_FOR_REVIEW → APPROVED`. Use `NOT_APPLICABLE` explicitly.

## URL and redirect preservation

Keep every existing slug by default and never silently remove a page. Any possible change must be recorded exactly `SLUG CHANGE PROPOSED — OWNER REVIEW REQUIRED` with old/proposed URLs, reason, SEO rationale, dependencies, risk, and a direct 301. Avoid chains. Unlinked Wix redirects may serve print, QR, email, ads, backlinks, or books; never remove/replace one without approval. Incorporate the owner’s Wix redirect export when supplied.

## Credentials and Git security

- Never display or print credentials or `.env`; never expose secrets in source, static output, browser JS, logs, screenshots, or commands.
- Use environment variables and minimum read-only scopes. Never commit `.env` or downloaded credentials.
- If `.env` was ever tracked, stop before pushing and report it; treat committed credentials as compromised.
- Before every relevant push, verify `.env` is ignored, untracked, absent from history and staging; scan staged changes for likely secrets without printing values; review the staged list.
- Inspect local and remote histories before setting a remote. Preserve/reconcile work safely, avoid needless history rewrites, use meaningful commits, and do not push until build/QA/secret checks pass.

## Vimeo and transcript rules

Vimeo access is read-only: metadata, text-track listing, and transcript/caption download only. Never upload, edit, replace, configure, or delete videos or alter transcript settings. Do not begin bulk processing without explicit owner authorization. Preserve raw downloads unchanged in `Content/transcripts/raw/`; keep cleaned material in `Content/transcripts/clean/` and articles in `Content/articles/`. Never overwrite raw data.

## Architecture and deployment

Produce static HTML with a lightweight dependency-minimal build. Reuse header/nav, footer, SEO metadata, video, article, daily nav, Bible-reading links, CTA, schema, and analytics components. Generate sitemap, robots, redirects, and an accessible 404. Preserve recognizable branding while improving semantics, accessibility, responsiveness, performance, and maintainability. Use optimized local assets where appropriate; do not rename images for keywords.

Cloudflare must publish only generated `dist/`, never the repository root, transcripts, `.env`, migration data, or development files. Track non-interactive configuration and redirects. Do not alter production DNS.

## Required QA

Before major commits/pushes: full build and syntax checks; `git diff --check`; expected page/slug/nav/canonical/video/Scripture/BibleGateway checks; transcript-fidelity spot checks where applicable; tracker updates; `.env` ignore/history/stage verification; non-printing secret scan; staged-file review. Stop on any credential risk.

Before cutover, create an old→new comparison covering status/redirects, SEO/content/function, visual/mobile/accessibility, and notes. Do not recommend cutover until every known page, redirect, link, asset, video, form, download, CTA, metadata/schema, sitemap/robots/404, analytics, layout, accessibility basic, and Cloudflare behavior has been reviewed.
