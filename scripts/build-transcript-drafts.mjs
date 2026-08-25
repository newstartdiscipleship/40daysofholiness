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
  day05: ['Jesus Is the Perfect Human Expression of Holiness', 'Guided Prayer: Becoming Like Jesus']
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
