"""Read-only public-site inventory crawler for 40daysofholiness.com.

Uses only Python's standard library. It never authenticates or submits forms.
Canonical CSVs are regenerated from public HTTP responses; owner-decision fields
are initialized but must not be overwritten once owner review begins.
"""
from __future__ import annotations

import csv, json, re, sys, time
from collections import deque
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

ROOT = "https://www.40daysofholiness.com/"
HOSTS = {"40daysofholiness.com", "www.40daysofholiness.com"}
OUT = Path(__file__).resolve().parent
UA = "40DaysOfHolinessMigrationInventory/1.0 (read-only owner-authorized crawl)"
DOWNLOAD_EXT = re.compile(r"\.(?:pdf|docx?|xlsx?|pptx?|zip|epub|mp3|mp4|m4a)(?:$|[?#])", re.I)
VIMEO = re.compile(r"(?:player\.)?vimeo\.com/(?:video/)?(\d+)", re.I)

def clean_url(value: str, base: str = ROOT) -> str:
    u = urlsplit(urljoin(base, value.strip()))
    host = u.netloc.lower()
    if host == "40daysofholiness.com": host = "www.40daysofholiness.com"
    path = u.path or "/"
    return urlunsplit((u.scheme or "https", host, path, u.query, ""))

def fetch(url: str):
    req = Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xml;q=0.9,*/*;q=0.5"})
    try:
        with urlopen(req, timeout=30) as r:
            return r.status, r.geturl(), r.headers.get("Content-Type", ""), r.read()
    except HTTPError as e:
        return e.code, e.geturl(), e.headers.get("Content-Type", ""), e.read()
    except URLError as e:
        return 0, url, "", str(e.reason).encode()

class PageParser(HTMLParser):
    def __init__(self, base):
        super().__init__(convert_charrefs=True); self.base=base; self.title=""; self._title=False
        self.meta={}; self.links=[]; self.images=[]; self.headings={"h1":[],"h2":[],"h3":[]}
        self._heading=None; self._heading_text=[]; self.text=[]; self.forms=[]; self.buttons=[]
        self.iframes=[]; self.jsonld=[]; self._json=False; self._jsonbuf=[]; self.canonical=""
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); tag=tag.lower()
        if tag=="title": self._title=True
        if tag in self.headings: self._heading=tag; self._heading_text=[]
        if tag=="meta":
            key=(a.get("name") or a.get("property") or a.get("http-equiv") or "").lower()
            if key: self.meta[key]=a.get("content","")
        if tag=="link" and "canonical" in (a.get("rel") or "").lower(): self.canonical=clean_url(a.get("href",""),self.base)
        if tag=="a" and a.get("href"): self.links.append({"url":clean_url(a["href"],self.base),"text":"","rel":a.get("rel","")})
        if tag=="img" and (a.get("src") or a.get("data-src")):
            self.images.append({"url":clean_url(a.get("src") or a.get("data-src"),self.base),"alt":a.get("alt","")})
        if tag=="iframe" and a.get("src"): self.iframes.append(clean_url(a["src"],self.base))
        if tag=="form": self.forms.append({"action":clean_url(a.get("action",self.base),self.base),"method":a.get("method","get").upper()})
        if tag in ("button","input") and (tag=="button" or a.get("type","").lower() in ("submit","button")): self.buttons.append(a.get("value") or a.get("aria-label") or "")
        if tag=="script" and a.get("type","").lower()=="application/ld+json": self._json=True; self._jsonbuf=[]
    def handle_endtag(self, tag):
        tag=tag.lower()
        if tag=="title": self._title=False
        if self._heading==tag:
            val=" ".join(" ".join(self._heading_text).split()); self.headings[tag].append(val); self._heading=None
        if tag=="script" and self._json:
            raw="".join(self._jsonbuf).strip()
            if raw: self.jsonld.append(raw)
            self._json=False
    def handle_data(self,data):
        s=" ".join(data.split())
        if self._title: self.title += data
        if self._heading: self._heading_text.append(data)
        if self._json: self._jsonbuf.append(data)
        elif s: self.text.append(s)
        if self.links and s: self.links[-1]["text"]=(self.links[-1]["text"]+" "+s).strip()

def sitemap_urls():
    pending=deque([urljoin(ROOT,"sitemap.xml")]); pages=set(); seen=set(); saved=[]
    while pending:
        u=pending.popleft()
        if u in seen: continue
        seen.add(u); status,final,ctype,data=fetch(u)
        saved.append((u,status,final,data))
        if status!=200: continue
        try: root=ET.fromstring(data)
        except ET.ParseError: continue
        locs=[(n.text or "").strip() for n in root.findall(".//{*}loc")]
        if root.tag.endswith("sitemapindex"): pending.extend(locs)
        else: pages.update(clean_url(x) for x in locs)
    for i,(u,status,final,data) in enumerate(saved):
        name="sitemap-source.xml" if i==0 else f"sitemap-{i:02d}.xml"
        (OUT/name).write_bytes(data)
    return pages, seen

def join(values): return " | ".join(dict.fromkeys(v for v in values if v))
def write_csv(name, fields, rows):
    with (OUT/name).open("w",newline="",encoding="utf-8-sig") as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore"); w.writeheader(); w.writerows(rows)

def main():
    seeds,sitemaps=sitemap_urls(); queue=deque(sorted(seeds|{ROOT})); seen=set()
    page_rows=[]; link_rows=[]; video_rows=[]; asset_rows=[]; seo_rows=[]; redirect_rows=[]
    while queue:
        url=queue.popleft()
        if url in seen or len(seen)>=1000: continue
        seen.add(url); status,final,ctype,data=fetch(url); final=clean_url(final)
        if final!=url: redirect_rows.append({"old_url":url,"destination_url":final,"http_status":status,"source":"PUBLIC_HTTP","owner_decision_status":"PENDING_OWNER_REVIEW","notes":"Observed during crawl; Wix export still required."})
        if "text/html" not in ctype.lower() and not data.lstrip().lower().startswith(b"<!doctype html"):
            continue
        html=data.decode("utf-8","replace"); p=PageParser(final); p.feed(html)
        internal=[]; outbound=[]; downloads=[]
        for l in p.links:
            dest=l["url"]; host=urlsplit(dest).hostname or ""; kind="internal" if host.lower() in HOSTS else "outbound"
            if kind=="internal":
                internal.append(dest)
                if not DOWNLOAD_EXT.search(dest) and dest.startswith("http"): queue.append(dest)
            else: outbound.append(dest)
            if DOWNLOAD_EXT.search(dest): downloads.append(dest)
            link_rows.append({"source_url":url,"destination_url":dest,"link_type":kind,"anchor_text":l["text"][:500],"rel":l["rel"],"is_download":"YES" if DOWNLOAD_EXT.search(dest) else "NO","qa_status":"NOT_TESTED","notes":""})
        vids=[]
        for candidate in p.iframes+[l["url"] for l in p.links]:
            m=VIMEO.search(candidate)
            if m: vids.append((m.group(1),candidate))
        for vid,embed in dict.fromkeys(vids): video_rows.append({"page_url":url,"provider":"VIMEO","video_id":vid,"embed_url":embed,"title":"","transcript_status":"NOT_AUTHORIZED","migration_stage":"VIDEO_IDENTIFIED","qa_status":"NOT_TESTED","owner_decision_status":"PENDING_OWNER_REVIEW","notes":"ID discovered from public embed; no Vimeo API call made."})
        for img in p.images: asset_rows.append({"page_url":url,"asset_type":"IMAGE","source_url":img["url"],"alt_text":img["alt"],"local_path":"","http_status":"NOT_CHECKED","migration_stage":"DISCOVERED","qa_status":"NOT_TESTED","owner_decision_status":"PENDING_OWNER_REVIEW","notes":""})
        desc=p.meta.get("description",""); robots=p.meta.get("robots","")
        og=json.dumps({k:v for k,v in p.meta.items() if k.startswith("og:")},ensure_ascii=False)
        social=json.dumps({k:v for k,v in p.meta.items() if k.startswith("twitter:")},ensure_ascii=False)
        summary=" ".join(p.text)[:1200]
        stage="VIDEO_IDENTIFIED" if vids else "BASELINE_CAPTURED"
        page_rows.append({"existing_url":url,"slug":urlsplit(url).path or "/","http_status":status,"final_url":final,"title":" ".join(p.title.split()),"meta_description":desc,"canonical_url":p.canonical,"h1":join(p.headings["h1"]),"h2_headings":join(p.headings["h2"]),"h3_headings":join(p.headings["h3"]),"body_summary":summary,"internal_links":join(internal),"outbound_links":join(outbound),"images_and_alt_text":json.dumps(p.images,ensure_ascii=False),"video_embeds":join(x[1] for x in vids),"forms":json.dumps(p.forms,ensure_ascii=False),"ctas_and_buttons":join(p.buttons+[l["text"] for l in p.links if l["text"]]),"downloadable_files":join(downloads),"open_graph_metadata":og,"social_metadata":social,"robots_directives":robots,"structured_data":join(p.jsonld),"special_functionality":join(p.iframes),"discovery_sources":"SITEMAP_OR_INTERNAL_CRAWL","migration_stage":stage,"qa_status":"NOT_TESTED","owner_decision_status":"PENDING_OWNER_REVIEW","slug_change_proposal":"","notes":"Server-rendered public HTML baseline."})
        seo_rows.append({"url":url,"http_status":status,"title":" ".join(p.title.split()),"meta_description":desc,"canonical_url":p.canonical,"h1":join(p.headings["h1"]),"robots_directives":robots,"open_graph_metadata":og,"social_metadata":social,"structured_data":join(p.jsonld),"captured_at_utc":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"qa_status":"NOT_TESTED","notes":""})
        print(status,url,file=sys.stderr)
    write_csv("pages.csv",list(page_rows[0].keys()) if page_rows else ["existing_url"],page_rows)
    write_csv("links.csv",["source_url","destination_url","link_type","anchor_text","rel","is_download","qa_status","notes"],link_rows)
    write_csv("videos.csv",["page_url","provider","video_id","embed_url","title","transcript_status","migration_stage","qa_status","owner_decision_status","notes"],video_rows)
    write_csv("assets.csv",["page_url","asset_type","source_url","alt_text","local_path","http_status","migration_stage","qa_status","owner_decision_status","notes"],asset_rows)
    write_csv("seo-baseline.csv",list(seo_rows[0].keys()) if seo_rows else ["url"],seo_rows)
    write_csv("redirects.csv",["old_url","destination_url","http_status","source","external_dependency","url_priority","proposed_url","reason","seo_rationale","dependencies","risk","required_direct_301","owner_decision_status","notes"],[{**{"external_dependency":"UNKNOWN","url_priority":"NORMAL","proposed_url":"","reason":"","seo_rationale":"","dependencies":"","risk":"","required_direct_301":"YES"},**r} for r in redirect_rows])
    (OUT/"crawl-summary.json").write_text(json.dumps({"root":ROOT,"pages":len(page_rows),"links":len(link_rows),"videos":len(video_rows),"assets":len(asset_rows),"redirects_observed":len(redirect_rows),"sitemaps":sorted(sitemaps),"limitations":["Public crawl cannot discover unlinked Wix redirects.","Owner URL lists, Wix redirect export, Search Console, analytics, backlinks, books, workbooks, QR codes, emails, and ads remain external inputs.","Rendered client-only interactions may require later visual/browser QA."]},indent=2),encoding="utf-8")

if __name__=="__main__": main()
