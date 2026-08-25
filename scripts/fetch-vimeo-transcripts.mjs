import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const requestedDays = process.argv.slice(2);
if (!requestedDays.length) throw new Error('Pass one or more day slugs, for example: day01 day02');
for (const slug of requestedDays) if (!/^day\d{2}$/.test(slug)) throw new Error(`Invalid day slug: ${slug}`);

function parseEnv(source) {
  return Object.fromEntries(source.split(/\r?\n/).flatMap((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return [];
    const separator = trimmed.indexOf('=');
    if (separator < 1) return [];
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return [[key, value]];
  }));
}

function parseCsv(source) {
  source = source.replace(/^\uFEFF/, '');
  const records = []; let record = []; let field = ''; let quoted = false;
  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') { field += '"'; index++; }
      else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ',') { record.push(field); field = ''; }
    else if (character === '\n') { record.push(field.replace(/\r$/, '')); records.push(record); record = []; field = ''; }
    else field += character;
  }
  if (field || record.length) { record.push(field); records.push(record); }
  const headers = records.shift() ?? [];
  return { headers, rows: records.filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? '']))) };
}

const csv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const env = parseEnv(await readFile(resolve(root, '.env'), 'utf8'));
if (!env.VIMEO_ACCESS_TOKEN) throw new Error('VIMEO_ACCESS_TOKEN is missing from the local .env file.');
const parsed = parseCsv(await readFile(resolve(root, 'migration/videos.csv'), 'utf8'));
if (!parsed.headers.includes('role')) parsed.headers.splice(parsed.headers.indexOf('title') + 1, 0, 'role');
const selected = parsed.rows.filter((row) => requestedDays.some((slug) => row.page_url.endsWith(`/${slug}`)));
if (!selected.length) throw new Error('No matching Vimeo records were found.');

const outputDirectory = resolve(root, 'Content/transcripts/raw');
await mkdir(outputDirectory, { recursive: true });
async function vimeoJson(path) {
  const response = await fetch(`https://api.vimeo.com${path}`, { headers: { Authorization: `Bearer ${env.VIMEO_ACCESS_TOKEN}`, Accept: 'application/vnd.vimeo.*+json;version=3.4' } });
  if (!response.ok) throw new Error(`Vimeo API returned ${response.status} for video metadata or text tracks.`);
  return response.json();
}

for (const row of selected) {
  const slug = new URL(row.page_url).pathname.slice(1);
  const video = await vimeoJson(`/videos/${row.video_id}?fields=name`);
  const tracks = await vimeoJson(`/videos/${row.video_id}/texttracks`);
  const english = (tracks.data ?? []).filter((track) => /^en(?:-|$)/i.test(track.language ?? ''));
  const track = english.find((item) => item.active) ?? english[0];
  row.title = video.name ?? row.title;
  row.role = /(?:guided\s+)?prayers? for holiness|guided prayers?/i.test(row.title) ? 'GUIDED_PRAYER' : 'TEACHING';
  row.notes = `Read-only Vimeo metadata checked; ${english.length} English text track(s) available.`;
  if (!track?.link) {
    row.transcript_status = 'NOT_AVAILABLE';
    console.log(`${slug} ${row.video_id}: no English transcript available`);
    continue;
  }
  const destination = resolve(outputDirectory, `${slug}-${row.video_id}-en.vtt`);
  try {
    await access(destination);
    console.log(`${slug} ${row.video_id}: raw transcript already exists; preserved unchanged`);
  } catch {
    const response = await fetch(track.link);
    if (!response.ok) throw new Error(`Transcript download returned ${response.status} for ${slug} video ${row.video_id}.`);
    const transcript = await response.text();
    if (!transcript.trimStart().startsWith('WEBVTT')) throw new Error(`Downloaded transcript is not WebVTT for ${slug} video ${row.video_id}.`);
    await writeFile(destination, transcript, { encoding: 'utf8', flag: 'wx' });
    console.log(`${slug} ${row.video_id}: downloaded English transcript`);
  }
  row.transcript_status = 'TRANSCRIPT_RETRIEVED';
  row.migration_stage = 'TRANSCRIPT_RETRIEVED';
}

await writeFile(resolve(root, 'migration/videos.csv'), '\uFEFF' + parsed.headers.map(csv).join(',') + '\n' + parsed.rows.map((row) => parsed.headers.map((header) => csv(row[header])).join(',')).join('\n') + '\n');
