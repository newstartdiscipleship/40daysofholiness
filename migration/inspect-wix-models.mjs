// Read-only inspection of Wix's public page models for routes and encoded embeds.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const html=await readFile(resolve('migration/day01-source.html'),'utf8');
const marker='<script type="application/json" id="wix-viewer-model">';
const start=html.indexOf(marker)+marker.length,end=html.indexOf('</script>',start);
if(start<marker.length||end<0)throw new Error('wix-viewer-model not found');
const viewer=JSON.parse(html.slice(start,end));
const files=viewer.siteAssets?.siteScopeParams?.pageJsonFileNames||{};
const pagesMap=viewer.siteFeaturesConfigs?.router?.pagesMap||{};
const routes=viewer.siteFeaturesConfigs?.router?.routes||{};
const routeById={};for(const [route,v] of Object.entries(routes))if(v?.pageId&&!routeById[v.pageId])routeById[v.pageId]=route.replace(/^\.\//,'/');
await mkdir(resolve('migration/wix-page-models'),{recursive:true});
const q=v=>'"'+String(v??'').replaceAll('"','""')+'"',csv=(rows,fields)=>'\uFEFF'+[fields,...rows.map(r=>fields.map(f=>r[f]??''))].map(r=>r.map(q).join(',')).join('\r\n')+'\r\n';
const pageRows=[],videoRows=[];
let template='';
try{
  const log=JSON.parse(await readFile(resolve('migration/netlog.json'),'utf8'));
  template=log.events.map(e=>e?.params?.url).find(u=>u?.includes('siteassets.parastorage.com/pages/pages/thunderbolt?')&&u.includes('module=thunderbolt-features')&&u.includes('pageId='))||'';
}catch{}
if(!template)throw new Error('Wix feature-model request template not found in netlog.json');
for(const [pageId,file] of Object.entries(files)){
  if(pageId==='masterPage')continue;const info=pagesMap[pageId]||{},route=routeById[pageId]||('/'+(info.pageUriSEO||'')),url=new URL(route,'https://www.40daysofholiness.com/').href;
  const row={page_id:pageId,page_model_file:file,title:info.title||'',path:route,url,public_model_status:''};pageRows.push(row);
  try{const modelUrl=new URL(template);modelUrl.searchParams.set('pageId',file);const r=await fetch(modelUrl,{headers:{'user-agent':'40DaysOfHolinessMigrationInventory/1.0','origin':'https://www.40daysofholiness.com','referer':'https://www.40daysofholiness.com/'}});row.public_model_status=r.status;const raw=await r.text();await writeFile(resolve('migration/wix-page-models',file),raw);const ids=new Set();for(const re of [/(?:player\.)?vimeo\.com\\?\/(?:video\\?\/)?(\d{5,12})/gi,/"(?:videoId|vimeoId)"\s*:\s*"?(\d{5,12})"?/gi])for(const m of raw.matchAll(re))ids.add(m[1]);for(const id of ids)videoRows.push({page_url:url,provider:'VIMEO',video_id:id,embed_url:'https://vimeo.com/'+id,title:'',transcript_status:'NOT_AUTHORIZED',migration_stage:'VIDEO_IDENTIFIED',qa_status:'NOT_TESTED',owner_decision_status:'PENDING_OWNER_REVIEW',page_model_file:file,notes:'Discovered in public Wix feature model; no Vimeo API call made.'});}catch(e){row.public_model_status='ERROR: '+e.message}
}
await writeFile(resolve('migration/router-pages.csv'),csv(pageRows,['page_id','page_model_file','title','path','url','public_model_status']));
await writeFile(resolve('migration/videos.csv'),csv(videoRows,['page_url','provider','video_id','embed_url','title','transcript_status','migration_stage','qa_status','owner_decision_status','page_model_file','notes']));
console.log(JSON.stringify({router_pages:pageRows.length,model_files:Object.keys(files).length,vimeo_embeds:videoRows.length,unique_vimeo_ids:new Set(videoRows.map(v=>v.video_id)).size,failed_models:pageRows.filter(x=>x.public_model_status!==200)},null,2));
