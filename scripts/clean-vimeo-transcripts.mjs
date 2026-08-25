import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const requestedDays = process.argv.slice(2);
if (!requestedDays.length) throw new Error('Pass one or more day slugs, for example: day01 day02');
for (const slug of requestedDays) if (!/^day\d{2}$/.test(slug)) throw new Error(`Invalid day slug: ${slug}`);

const rawDirectory = resolve(root, 'Content/transcripts/raw');
const cleanDirectory = resolve(root, 'Content/transcripts/clean');
await mkdir(cleanDirectory, { recursive: true });
const files = (await readdir(rawDirectory)).filter((name) => requestedDays.some((slug) => name.startsWith(`${slug}-`)) && name.endsWith('.vtt'));

for (const name of files) {
  const source = await readFile(resolve(rawDirectory, name), 'utf8');
  const lines = source.replace(/^\uFEFF/, '').split(/\r?\n/);
  const spoken = lines.filter((line) => line.trim()
    && line.trim() !== 'WEBVTT'
    && !/^\d+$/.test(line.trim())
    && !/^\d{2}:\d{2}:\d{2}\.\d{3} --> /.test(line.trim())
    && !/^(?:Kind|Language):/.test(line.trim()));
  const text = spoken.join(' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() + '\n';
  const destination = resolve(cleanDirectory, name.replace(/\.vtt$/, '.txt'));
  await writeFile(destination, text, 'utf8');
  console.log(`${name}: created clean working transcript`);
}
