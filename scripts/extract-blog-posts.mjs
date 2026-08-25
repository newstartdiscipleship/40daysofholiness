import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const posts=[
  ['migration/post-wesley-source.html','Content/pages/post--john-wesley-s-covenant-prayer.html'],
  ['migration/post-holiness-source.html','Content/pages/post--what-is-the-holiness-of-god.html']
];
const clean=html=>html
  .replace(/\s(?:class|style|id|data-[\w-]+|dir|tabindex|contenteditable|role)=["'][^"']*["']/gi,'')
  .replace(/<span\b[^>]*>/gi,'').replace(/<\/span>/gi,'')
  .replace(/<div\b[^>]*>/gi,'').replace(/<\/div>/gi,'')
  .replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi,'')
  .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi,'')
  .replace(/<p>\s*(?:&nbsp;|&#8203;|​|<br\s*\/?>)*\s*<\/p>/gi,'')
  .replace(/\n{3,}/g,'\n\n').trim();
for(const [source,target] of posts){
  const html=await readFile(resolve(source),'utf8');const start=html.indexOf('data-hook="post-description"');
  if(start<0)throw new Error(`Post body start not found in ${source}`);
  const endCandidates=['data-hook="post-footer"','data-hook="post-social-actions"','data-hook="recent-posts"'].map(x=>html.indexOf(x,start)).filter(x=>x>start);
  const segment=html.slice(start,endCandidates.length?Math.min(...endCandidates):html.indexOf('</article>',start));
  const blocks=[];const re=/<(?:h[2-6]|p|blockquote|ul|ol|figure)\b[^>]*>[\s\S]*?<\/(?:h[2-6]|p|blockquote|ul|ol|figure)>/gi;
  for(const match of segment.matchAll(re)){const block=clean(match[0]);const text=block.replace(/<[^>]+>/g,'').replace(/&nbsp;|&#8203;/g,'').trim();if(text)blocks.push(block)}
  await writeFile(resolve(target),blocks.join('\n\n')+'\n','utf8');console.log(`${target}: ${blocks.length} blocks, ${Buffer.byteLength(blocks.join('\n\n'))} bytes`);
}
