import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
const walk = async dir => (await Promise.all((await readdir(dir, {withFileTypes:true})).map(e => e.isDirectory() ? walk(resolve(dir,e.name)) : resolve(dir,e.name)))).flat();
let count = 0;
const differences = [];
for (const file of (await walk(resolve('dist'))).filter(f => f.endsWith('.html'))) {
  const html = await readFile(file,'utf8');
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    for (const item of JSON.parse(match[1])['@graph'] || []) {
      if (item['@type'] !== 'VideoObject') continue;
      for (const key of ['name','description','thumbnailUrl','uploadDate']) if (!item[key]) throw new Error(`Missing ${key}: ${file}`);
      if (!Number.isFinite(Date.parse(item.uploadDate))) throw new Error(`Invalid date: ${file}`);
      count++;
    }
  }
  if (process.argv.includes('--live')) {
    const path = relative(resolve('dist'),file).replaceAll('\\','/').replace(/index\.html$/,'').replace(/\/$/,'');
    const response = await fetch(`https://www.40daysofholiness.com/${path}`,{redirect:'manual'});
    const live = await response.text();
    const strip = text => text.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'');
    if (response.status !== 200 || strip(live) !== strip(html)) differences.push({path,status:response.status});
  }
}
console.log(JSON.stringify({validatedVideoObjects:count,nonSchemaLiveDifferences:differences},null,2));
