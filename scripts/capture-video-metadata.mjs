import { readFile, writeFile } from 'node:fs/promises';

// Public, read-only oEmbed metadata only. Never retrieves or changes text tracks.
const source = await readFile('migration/videos.csv', 'utf8');
const urls = [...new Set([...source.matchAll(/"(https:\/\/(?:www\.)?vimeo\.com\/\d+(?:\/[a-z0-9]+)?)(?:\?[^" ]*)?"/g)].map(m => m[1]))];
const metadata = {};
for (const url of urls) {
  const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}&width=1280`);
  if (!response.ok) throw new Error(`Public video metadata returned HTTP ${response.status}: ${url}`);
  const data = await response.json();
  if (!data.thumbnail_url || !/^\d{4}-\d{2}-\d{2} /.test(data.upload_date || '')) throw new Error(`Incomplete video metadata: ${url}`);
  metadata[String(data.video_id)] = {
    name: data.title,
    description: data.description?.trim() || data.title,
    thumbnailUrl: data.thumbnail_url,
    // oEmbed supplies no timezone: preserve its publication calendar date.
    uploadDate: data.upload_date.slice(0, 10),
    duration: `PT${data.duration}S`,
    source: url,
    retrieved: new Date().toISOString()
  };
}
await writeFile('migration/video-metadata/vimeo.json', JSON.stringify(metadata, null, 2) + '\n');
console.log(`Captured public metadata for ${Object.keys(metadata).length} Vimeo videos.`);
