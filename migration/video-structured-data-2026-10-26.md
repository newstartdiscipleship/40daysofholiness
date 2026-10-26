# Video structured data repair — 2026-10-26

Status: READY_FOR_REVIEW; local repair complete, production unchanged.

Search Console Videos enhancement report (updated October 24) shows one invalid item on `/welcome`, last crawled October 21: “Welcome to 40 Days of Holiness! video 1”. Missing required thumbnailUrl and uploadDate; description also has a recommended-field warning. This is structured-data eligibility, not evidence that ordinary page indexing or video playback is broken.

The shared build emitted VideoObject entries without these properties. Public read-only Vimeo oEmbed metadata was captured for all 82 unique inventoried Vimeo videos in `video-metadata/vimeo.json`. No captions were retrieved and no Vimeo settings changed. Publication calendar dates are preserved without inventing a timezone; thumbnails use provider URLs. Build now includes verified thumbnailUrl, uploadDate, description and duration, and fails if a rendered Vimeo entry lacks verified metadata. Existing names, embeds, articles, prayers and links are preserved.

Validation: production build and existing site checks pass (49 routes, 84 Vimeo embed instances, 46 sitemap canonicals). Dedicated schema audit passes for all 82 generated VideoObject entries. Before/after normalized visible-content snapshots are identical: 50 HTML files, SHA-256 `49D23EC9BB6662B1E09F4CE471587F8C098CC0C34338A42E7D95C8C08B7455B9`. `git diff --check` passes. Existing owner changes were not reverted or staged.

Deployment gate: read-only live comparison found differences outside JSON-LD, including the local unpublished `/post/holiness-is-not-dull-cs-lewis` route (live 404). Do not deploy the current complete local build as this narrow metadata repair. First isolate the metadata repair against the deployed version, preserve its assets/Worker behavior, then verify that only authorized video schema changes. No production deployment, DNS change, Git push or Search Console validation was performed. After verified live deployment, validate both required-field issues in Search Console; Google processing is asynchronous.

Commit isolation: only this repair is staged against the existing GitHub baseline; other local migration/editorial changes remain uncommitted. The exact staged tree separately passed its baseline build/check (53 routes, 82 Vimeo embeds, 50 sitemap URLs) and all 82 VideoObject required-field checks. This GitHub baseline predates the current local/live site and must not be deployed wholesale as the production repair.
