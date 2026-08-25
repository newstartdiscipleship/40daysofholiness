import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const path=resolve('migration/assets.csv'),source=(await readFile(path,'utf8')).replace(/^\uFEFF/,'');
const rows=[
['holiness-package.jpg','Pursuing Holiness workbook, daily teaching videos, guided prayer videos, and sermon series'],
['daily-teaching-videos.jpg','40 Days of Holiness teaching displayed on a tablet'],
['guided-prayer-videos.jpg','Guided prayer video displayed on a desktop monitor'],
['workbook-study-pages.jpg','Open Pursuing Holiness workbook with meditation questions and lesson notes'],
['holiness-workbook-cover.jpg','Spiral-bound Pursuing Holiness workbook'],
['sermon-series.jpg','Pursuing Holiness six-sermon series package']
];
const csv=value=>'"'+String(value).replaceAll('"','""')+'"';
const additions=rows.filter(([name])=>!source.includes(`assets/images/${name}`)).map(([name,alt])=>[
  'https://www.40daysofholiness.com/','IMAGE','OWNER_SUPPLIED_LOCAL',alt,`assets/images/${name}`,'LOCAL','ASSETS_CAPTURED','VISUAL_QA','PENDING_OWNER_REVIEW','Owner-supplied homepage image; optimized to a descriptive JPEG delivery asset while the high-resolution source remains local and unpublished.'
].map(csv).join(','));
if(additions.length)await writeFile(path,'\uFEFF'+source.trimEnd()+'\n'+additions.join('\n')+'\n','utf8');
console.log(`Recorded ${additions.length} optimized homepage assets.`);
