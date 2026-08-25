import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const requestedDays = process.argv.slice(2);
if (!requestedDays.length) throw new Error('Pass one or more day slugs, for example: day01 day02');
const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const titles = {
  day01: ['God Is Holy and the Source of Holiness', 'Guided Prayer: The Holiness of God'],
  day02: ['All Things Are Holy Only as They Relate to God', 'Guided Prayer: Holiness Comes From God'],
  day03: ['Sin Separates Us From Holiness', 'Guided Prayer: Confession and Cleansing'],
  day04: ['God Planned to Make Us Holy', 'Guided Prayer: Resting in God’s Plan'],
  day05: ['Jesus Is the Perfect Human Expression of Holiness', 'Guided Prayer: Becoming Like Jesus'],
  day06: ['Saved by Grace for Holiness', 'Guided Prayer: Saved From Slavery for Holiness'],
  day07: ['Holiness in the Old Testament', 'Guided Prayer: Teach Us Your Holiness'],
  day08: ['Can You Grow in Holiness?', 'Guided Prayer: Deeper Holiness'],
  day09: ['Biblical Holiness Means Separation to God', 'Guided Prayer: Everything Belongs to God'],
  day10: ['Holiness Means Purity From Corruption', 'Guided Prayer: Purify the Heart'],
  day11: ['The Sin Nature and the Human Heart', 'Guided Prayer: Create in Me a Clean Heart'],
  day12: ['The Deceitful Heart and Self-Sovereignty', 'Guided Prayer: Search and Cure My Heart'],
  day13: ['Jesus Makes Us Holy Through His Blood', 'Guided Prayer: Holiness Through Jesus'],
  day14: ['Holiness and the New Birth', 'Guided Prayer: Live as One of God’s Holy People'],
  day15: ['The Possibilities of Grace', 'Guided Prayer: See the Possibilities of Grace']
};

const introductions = {
  day06: 'We are <strong>saved by grace for holiness</strong>. God does not wait for us to become holy before he loves and rescues us; he delivers us from slavery to sin and then leads us into the holy life for which he saved us.',
  day07: '<strong>Holiness in the Old Testament</strong> is not an irrelevant collection of rules. Leviticus patiently teaches Israel what God is like, why his holiness differs from pagan counterfeits, and how his people are to reflect his character.',
  day08: '<strong>Can you grow in holiness?</strong> Exodus and Leviticus show that deeper levels of holiness are both needed and possible. God calls his people beyond spiritual stagnation into deeper fellowship, usefulness, joy, and Christlikeness.',
  day09: '<strong>Biblical holiness means separation to God</strong> from what is common or ordinary. When God claims a life, no role, possession, routine, relationship, thought, or moment remains outside his ownership.',
  day10: '<strong>Holiness means purity from corruption</strong>—not merely cleaner outward behavior, but unmixed motives and a heart free from sin’s defilement. God intends to cleanse the wound at its deepest point.',
  day11: 'The <strong>sin nature and the human heart</strong> explain why knowing what is right does not automatically make us do it. Scripture identifies a bent toward self-sovereignty that produces sinful actions and attitudes.',
  day12: 'The Bible describes a <strong>deceitful heart</strong> whose inward bend toward self-sovereignty disguises itself as self-protection, self-esteem, and even religious correctness. God exposes this hidden corruption in order to heal it.',
  day13: '<strong>Jesus makes us holy through his blood.</strong> The cross provides both a righteous standing before God and the cleansing, transforming holiness that restores what sin has broken.',
  day14: '<strong>Holiness and the new birth</strong> belong together. God justifies, adopts, and regenerates believers, giving them a new and holy life through the presence and power of the Holy Spirit.',
  day15: 'The <strong>possibilities of grace</strong> change how we hear God’s call to holiness. Grace is not only forgiveness when we fail; it is God’s enabling power to accomplish his will in us.'
};

function paragraphs(text) {
  const sentences = text.match(/[^.!?]+(?:[.!?]+[”"']?|$)/g) ?? [text];
  const groups = [];
  for (let index = 0; index < sentences.length; index += 4) groups.push(sentences.slice(index, index + 4).join(' ').replace(/\s+/g, ' ').trim());
  return groups.filter(Boolean).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n\n');
}

await mkdir(resolve(root, 'Content/articles'), { recursive: true });
for (const slug of requestedDays) {
  if (!titles[slug]) throw new Error(`Unsupported day slug: ${slug}`);
  const videoRows = (await readFile(resolve(root, 'migration/videos.csv'), 'utf8')).split(/\r?\n/).filter((line) => line.includes(`/${slug}`));
  const teachingId = videoRows.find((line) => line.includes('TEACHING'))?.match(/,"(\d+)",/)?.[1];
  const prayerId = videoRows.find((line) => line.includes('GUIDED_PRAYER'))?.match(/,"(\d+)",/)?.[1];
  if (!teachingId || !prayerId) throw new Error(`Missing classified videos for ${slug}`);
  const teaching = await readFile(resolve(root, `Content/transcripts/clean/${slug}-${teachingId}-en.txt`), 'utf8');
  const prayer = await readFile(resolve(root, `Content/transcripts/clean/${slug}-${prayerId}-en.txt`), 'utf8');
  const html = `<!-- Transcript-faithful working draft. Raw VTT remains immutable in Content/transcripts/raw/. -->
<section class="teaching-article" aria-labelledby="teaching-heading">
  <p class="kicker">Teaching</p>
  <h2 id="teaching-heading">${titles[slug][0]}</h2>
  <!-- TEACHING_VIDEO -->
  ${introductions[slug]?`<p>${introductions[slug]}</p>`:''}
  ${paragraphs(teaching)}
</section>

<section class="guided-prayer" aria-labelledby="prayer-heading">
  <p class="kicker">Guided Prayer</p>
  <h2 id="prayer-heading">${titles[slug][1]}</h2>
  <!-- PRAYER_VIDEO -->
  ${paragraphs(prayer)}
</section>`;
  await writeFile(resolve(root, `Content/articles/${slug}.html`), html, 'utf8');
  await writeFile(resolve(root, `Content/pages/${slug}.html`), html, 'utf8');
  console.log(`${slug}: created teaching-first transcript draft and guided prayer`);
}
