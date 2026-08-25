# Migration inventory and approval gate

Captured from the public Wix site on 2026-08-25 (America/Chicago). This is the authoritative discovery baseline, not rebuild authorization.

## Current implementation status

The owner approved implementation on 2026-08-25. A dependency-minimal Node ESM build now generates all 53 preserved routes into `dist/`; Cloudflare is configured to publish only that directory. Automated checks currently verify 53 generated route files, 82 Vimeo embeds, 50 unique indexable sitemap canonicals, required output files, H1s, and production-domain canonicals.

Authored Wix feature-model content has been normalized into `Content/pages/` for the static routes, and both Wix Blog articles were extracted from their public server-rendered post bodies. The Blog index and noindex Search route now have static implementations. Twenty-five unique original Wix media objects were downloaded locally, satisfying 326 tracker rows; three YouTube thumbnails remain external discoveries.

Fifty-one routes are at `PAGE_BUILT`. Two routes remain at `BASELINE_CAPTURED` and require owner decisions because their public Wix models contain no authored body content:

- `/fullscreen-page`
- `/pentecost-video-email-thanks`

No transcript retrieval, Git push, Cloudflare deployment, or production change has occurred.

## Canonical trackers

- `pages.csv`: one row per crawled HTML route with content, SEO, links, media references, functions, stage, QA, and owner status.
- `redirects.csv`: redirects observed publicly plus future owner/Wix exports. A crawl cannot prove unlinked redirect sources.
- `links.csv`: page-to-destination edges, anchor text, type, and download flag.
- `videos.csv`: 82 verified page/video associations from read-only Wix feature models: two distinct Vimeo IDs on each daily page, plus one on `/welcome` and one on `/congrats`. No Vimeo API call was made and transcripts remain unauthorized.
- `assets.csv`: discovered image usages and alt text. Assets are not yet downloaded or approved for migration.
- `seo-baseline.csv`: titles, descriptions, canonicals, H1s, robots, social metadata, and JSON-LD.

Supporting evidence includes `robots-source.txt`, sitemap XML files, `router-pages.csv`, and `crawl-summary.json`. Raw HTML/model debugging files are ignored and are not authoritative.

## Discovery coverage and limitations

Sources used: robots.txt, sitemap index, page/blog/category sitemaps, recursive internal links, public server-rendered HTML, and Wix router definitions. Owner inputs still required: Wix redirect export, URL lists, Search Console/analytics exports, backlinks, QR/book/workbook/email/ad links, and downloadable-resource knowledge.

The site relies on Wix client behavior. Rendered interaction, form submission destinations, download delivery triggered by scripts/email capture, and visual/mobile behavior need browser/network QA. No form was submitted and no authenticated service was accessed.

## Baseline findings and migration risks

- All 53 inventoried routes returned HTTP 200; all `/day01`–`/day40` routes are present.
- `/` and `/home` share the homepage canonical. Preserve both until the owner decides whether `/home` should remain a duplicate route or directly redirect; no change is proposed yet.
- `/day05` has an apparent title error (“Day 3”), and `/day36` has an apparent title error (“Day 37”). Correcting titles does not require changing their slugs.
- Six routes lack meta descriptions; four lack H1s. `/search` and `/congrats` correctly expose `noindex` in the current baseline.
- `/blank`, `/fullscreen-page`, `/home`, and `/congrats` are Wix-router routes omitted from ordinary navigation/sitemaps in some cases; they may be legacy, functional, campaign, or externally referenced. Never remove them without owner review.
- The public crawl observed no redirect sources. This is not evidence that no Wix redirects exist; the Wix redirect export is a launch blocker.
- Download/lead-capture pages expose no static file link or ordinary HTML form. Their delivery flow, consent, email integration, and required replacement behavior need owner/browser QA.
- There are 82 unique Vimeo embeds. Each daily page contains two, so their roles (for example teaching versus prayer/supporting content) must be labeled before template design and transcript selection.
- The crawl records 329 image usages and many Wix variants; asset deduplication, ownership, originals, dimensions, formats, and alt-text QA remain incomplete.
- Major outbound dependencies include NewStart/40 Days sales and challenge subdomains plus YouTube, SoundCloud, Facebook, LinkedIn, and X/Twitter. They require functional QA but must not be changed without authorization.

## Proposed architecture (approval required)

Use a small Node ESM build with data files plus reusable HTML templates/components. Source belongs outside `dist/`; generate all preserved routes, sitemap, robots, 404, redirects, local optimized assets, and canonical metadata into `dist/`. Cloudflare configuration must publish only `dist/`. Keep the live domain canonical and preview output non-indexable. Avoid a client framework unless discovery proves a real need.

Suggested layout: `src/data/`, `templates/`, `assets/`, `Content/transcripts/{raw,clean}/`, `Content/articles/`, `scripts/`, `migration/`, and generated `dist/`.

## Approval-gated implementation plan

1. Owner reviews this inventory, router-only/low-value pages, and risks.
2. Import Wix redirect export and owner URL/resource lists; reconcile without deleting routes.
3. Label the role of both videos on every daily page and, with separate authorization, enrich the verified IDs using read-only Vimeo metadata.
4. Confirm forms, download delivery, CTAs, integrations, analytics, and ownership/licensing of assets.
5. Approve architecture and visual fidelity target; then scaffold the build and templates.
6. Build preserved routes locally; generate SEO files, redirects, 404, and accessibility/performance improvements.
7. After separate transcript authorization, retrieve immutable raw captions and create fidelity-checked articles under `Content/EDITORIAL.md`.
8. Build/check/secret-scan, then connect the already-inspected empty GitHub repository and push meaningful history.
9. Deploy only `dist/` to a noindex Cloudflare preview; compare old/new and complete QA.
10. Owner approves; DNS cutover remains a separate explicit authorization.
