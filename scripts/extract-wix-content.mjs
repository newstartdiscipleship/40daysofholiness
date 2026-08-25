import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function parseCsv(text){const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++}else if(c==='"')quoted=false;else cell+=c}else if(c==='"')quoted=true;else if(c===','){row.push(cell);cell=''}else if(c==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell=''}else cell+=c}if(cell||row.length){row.push(cell);rows.push(row)}const headers=rows.shift().map(x=>x.replace(/^\uFEFF/,''));return rows.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])))}
const cleanHtml=html=>html
  .replace(/<span\b[^>]*class=["'][^"']*wixGuard[^"']*["'][^>]*>[\s\S]*?<\/span>/gi,'')
  .replace(/\s(?:class|style|id|data-[\w-]+)=["'][^"']*["']/gi,'')
  .replace(/<span\b[^>]*>/gi,'').replace(/<\/span>/gi,'')
  .replace(/<p>\s*(?:&nbsp;|&#8203;|​|<br\s*\/?\s*>)*\s*<\/p>/gi,'')
  .replace(/<a\s+href=["']http:\/\/(?:www\.)?40daysofholiness\.com([^"']*)["']/gi,'<a href="https://www.40daysofholiness.com$1"')
  .replace(/\s+target=["']_self["']/gi,'')
  .replace(/\n{3,}/g,'\n\n').trim();
const escapeHtml=v=>String(v??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const routers=parseCsv(await readFile(resolve('migration/router-pages.csv'),'utf8'));
await mkdir(resolve('Content/pages'),{recursive:true});
const report=[];
for(const page of routers){
  if(!page.path||page.path==='/post'||page.path==='/search')continue;
  const raw=await readFile(resolve('migration/wix-page-models',page.page_model_file),'utf8');let model;
  try{model=JSON.parse(raw)}catch{continue}
  const components=model.structure?.components||{},props=model.props?.render?.compProps||{};
  const root=components[Object.keys(components).find(id=>components[id]?.componentType==='Page')];
  const ordered=[];const visit=id=>{const c=components[id];if(!c)return;if(c.componentType==='WRichText'||c.componentType==='SiteButton'||c.componentType==='ImageX'||c.componentType==='WPhoto')ordered.push(id);for(const child of c.components||[])visit(child)};for(const id of root?.components||[])visit(id);
  // Some landing/lightbox models omit a conventional Page root. Preserve any
  // authored props not reached by the structure traversal in model order.
  for(const id of Object.keys(props))if(!ordered.includes(id)&&(props[id]?.html||props[id]?.label||props[id]?.image||props[id]?.imageData||props[id]?.url))ordered.push(id);
  const blocks=[];let richText=0,buttons=0,images=0;
  for(const id of ordered){const p=props[id]||{},type=components[id]?.componentType||(p.fullNameCompType?.includes('WRichText')?'WRichText':p.fullNameCompType?.includes('SiteButton')?'SiteButton':'');
    if((type==='WRichText'||p.html)&&p.html){const cleaned=cleanHtml(p.html);if(cleaned){blocks.push(cleaned);richText++}}
    else if((type==='SiteButton'||p.label)&&p.label){const href=p.link?.href||'';blocks.push(`<p class="legacy-cta"><a class="button button-primary" href="${escapeHtml(href)}">${escapeHtml(p.label)}</a></p>`);buttons++}
    else if(p.url&&/^https?:\/\//.test(p.url)){blocks.push(`<div class="legacy-embed"><iframe src="${escapeHtml(p.url)}" title="Embedded page content" loading="lazy"></iframe></div>`)}
    else {const src=p.image?.uri||p.imageData?.uri||p.src?.uri||p.src;if(typeof src==='string'&&src){const url=src.startsWith('http')?src:`https://static.wixstatic.com/media/${src}`;blocks.push(`<figure><img src="${escapeHtml(url)}" alt="${escapeHtml(p.alt||p.altText||'')}" loading="lazy"></figure>`);images++}}
  }
  const slug=page.path==='/'?'home':page.path.replace(/^\//,'').replaceAll('/','--');
  if(blocks.length)await writeFile(resolve('Content/pages',slug+'.html'),blocks.join('\n\n')+'\n','utf8');
  report.push({path:page.path,file:slug+'.html',components:ordered.length,rich_text_blocks:richText,buttons,images,bytes:Buffer.byteLength(blocks.join('\n\n'))});
}
await writeFile(resolve('migration/content-extraction.json'),JSON.stringify(report,null,2)+'\n');
console.log(`Extracted authored content for ${report.length} Wix routes (${report.reduce((n,x)=>n+x.rich_text_blocks,0)} rich-text blocks).`);
