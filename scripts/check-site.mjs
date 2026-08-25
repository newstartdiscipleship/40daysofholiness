import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const failures=[];
const walk=async (dir=resolve('dist'))=>(await Promise.all((await readdir(dir,{withFileTypes:true})).map(async e=>e.isDirectory()?walk(resolve(dir,e.name)):[resolve(dir,e.name)]))).flat();
const files=await walk(),pages=files.filter(f=>f.endsWith('index.html'));
if(pages.length!==53)failures.push(`Expected 53 generated routes; found ${pages.length}`);
let embeds=0;
for(const file of pages){const html=await readFile(file,'utf8');if(!/<link rel="canonical" href="https:\/\/www\.40daysofholiness\.com\//.test(html))failures.push(`Missing production canonical: ${file}`);if(!/<h1>[^<]+<\/h1>/.test(html))failures.push(`Missing H1: ${file}`);embeds+=(html.match(/<iframe\b[^>]*src="https:\/\/player\.vimeo\.com\/video\/\d+/g)||[]).length;const jsonld=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);if(!jsonld)failures.push(`Missing JSON-LD: ${file}`);else try{JSON.parse(jsonld[1])}catch{failures.push(`Invalid JSON-LD: ${file}`)}if(/<script[^>]+(?:migration|Content\/transcripts)/i.test(html))failures.push(`Development source exposed: ${file}`)}
if(embeds!==82)failures.push(`Expected 82 Vimeo embeds; found ${embeds}`);
const sitemap=await readFile(resolve('dist/sitemap.xml'),'utf8'),locs=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);if(locs.length!==new Set(locs).size)failures.push('Sitemap contains duplicate canonicals');if(sitemap.includes('/search')||sitemap.includes('/congrats'))failures.push('Sitemap contains a noindex route');
for(const required of ['404.html','robots.txt','sitemap.xml','_headers','_redirects'])if(!files.some(f=>f.endsWith(required)))failures.push(`Missing ${required}`);
if(failures.length){console.error(failures.join('\n'));process.exit(1)}console.log(`Checked ${pages.length} routes, ${embeds} Vimeo embeds, and ${locs.length} unique sitemap URLs.`);
