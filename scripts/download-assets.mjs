import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
function parseCsv(text){const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++}else if(c==='"')quoted=false;else cell+=c}else if(c==='"')quoted=true;else if(c===','){row.push(cell);cell=''}else if(c==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell=''}else cell+=c}if(cell||row.length){row.push(cell);rows.push(row)}const headers=rows.shift().map(x=>x.replace(/^\uFEFF/,''));return {headers,rows:rows.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])))} }
const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const parsed=parseCsv(await readFile(resolve('migration/assets.csv'),'utf8')),assets=parsed.rows;
await mkdir(resolve('assets/images'),{recursive:true});const downloaded=new Map();
for(const row of assets){let u;try{u=new URL(row.source_url)}catch{continue}if(u.hostname!=='static.wixstatic.com')continue;const match=u.pathname.match(/^\/media\/([^/]+)/);if(!match)continue;const mediaName=decodeURIComponent(match[1]).replace(/[^A-Za-z0-9._~-]/g,'_'),original=`https://static.wixstatic.com/media/${match[1]}`;
  if(!downloaded.has(original)){try{const r=await fetch(original,{headers:{'user-agent':'40DaysOfHolinessMigrationAssets/1.0'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);await writeFile(resolve('assets/images',mediaName),Buffer.from(await r.arrayBuffer()));downloaded.set(original,{path:`assets/images/${mediaName}`,status:r.status})}catch(e){downloaded.set(original,{path:'',status:`ERROR: ${e.message}`})}}
  const result=downloaded.get(original);row.local_path=result.path;row.http_status=String(result.status);if(result.path)row.migration_stage='ASSETS_CAPTURED';
}
await writeFile(resolve('migration/assets.csv'),'\uFEFF'+parsed.headers.map(csv).join(',')+'\n'+assets.map(r=>parsed.headers.map(h=>csv(r[h])).join(',')).join('\n')+'\n');
console.log(`Captured ${[...downloaded.values()].filter(x=>x.path).length} unique original assets; ${[...downloaded.values()].filter(x=>!x.path).length} failed.`);
