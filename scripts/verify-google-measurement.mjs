import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
import http from "node:http";
import { chromium } from "playwright";
const origin=process.argv[2]||"http://127.0.0.1:3167", local=new URL(origin).hostname==="127.0.0.1";
const key="scantap-privacy-choices:v2", sessionKey="scantap-google-session:v1", id="G-1MBW4RLL1E";
const out="output/playwright/google";await mkdir(out,{recursive:true});
const metadata=await fetch(origin+"/api/privacy-context").then(r=>r.json());assert.ok(metadata.googleFrame?.origin,"Actual frame metadata must be available");assert.notEqual(new URL(origin).origin,metadata.googleFrame.origin,"Use the preview branch alias, or canonical production host, for a distinct receiver origin");assert.ok(metadata.googleFrame.parents.includes(new URL(origin).origin),"This source must be an exact approved parent");
const rawTag=await fetch("https://www.googletagmanager.com/gtag/js?id="+id).then(r=>r.text());
const tag=rawTag;
const provider=await fetch("https://us.i.posthog.com/array/phc_texwKYJWdNJ9D7uvte6R5unvmKhGSnA3WdoMT3oGX2UK/config").then(r=>r.json());
let current="",emptyTag=false,activeSession;const frameRequests=[],tagRequests=[],results=[],receipts=[];
const check=(label,value)=>{assert.ok(value,label);results.push(label)};
const proxy=local?http.createServer(async(req,res)=>{frameRequests.push({case:current,url:req.url,headers:req.headers});const r=await fetch(origin+req.url,{redirect:"manual"});res.statusCode=r.status;for(const [k,v]of r.headers)if(!["content-encoding","content-length","transfer-encoding","connection"].includes(k))res.setHeader(k,v);res.end(Buffer.from(await r.arrayBuffer()))}):null;
if(proxy)await new Promise(r=>proxy.listen(3168,r));
const browser=await chromium.launch({channel:"chrome",headless:true,args:["--disable-blink-features=AutomationControlled"]});
async function open(label,choices,{signal=false,jurisdiction="default-on-permitted",failed=false,oldDecline=false,dnt=false,unsupported=false,slowCollector=false,googleDisabled=false}={}){
 current=label;const context=await browser.newContext({viewport:label.includes("390")?{width:390,height:844}:{width:1440,height:1000},userAgent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36"});const requests=[],errors=[];
 await context.addCookies([{name:"source_private",value:"TestCanaryCookie",url:origin},{name:"receiver_private",value:"TestCanaryReceiverCookie",url:metadata.googleFrame.origin}]);
 await context.addInitScript(({key,choices,signal,oldDecline,dnt,unsupported,googleDisabled})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(choices));if(googleDisabled)window["ga-disable-G-1MBW4RLL1E"]=true;if(dnt)Object.defineProperty(navigator,"doNotTrack",{get:()=>"1"});if(unsupported)delete HTMLIFrameElement.prototype.credentialless;if(signal)Object.defineProperty(navigator,"globalPrivacyControl",{get:()=>true});if(oldDecline){localStorage.removeItem(key);localStorage.setItem("scantap-privacy-choices:v1",'{"analytics":false}')}},{key,choices,signal,oldDecline,dnt,unsupported,googleDisabled});
 await context.route("**/*",async route=>{const r=route.request(),url=new URL(r.url());
  if(url.origin===new URL(origin).origin){if(url.pathname==="/api/privacy-context")return route.fulfill({status:failed?503:200,json:{jurisdiction,signal,replayRequiresConsent:false,blocked:false,googleFrame:metadata.googleFrame}});return route.continue()}
  if(url.origin===metadata.googleFrame.origin)return route.continue();
  requests.push({url:r.url(),body:r.postData(),headers:await r.allHeaders(),at:Date.now()});
  if(url.hostname==="www.googletagmanager.com" && url.pathname==="/gtag/js" && url.searchParams.get("id")===id){tagRequests.push({case:current,url:r.url(),headers:await r.allHeaders(),body:r.postData()});return route.fulfill({contentType:"application/javascript",body:emptyTag?"":tag})}
  if(url.hostname.endsWith("posthog.com"))return route.fulfill({json:url.pathname.includes("/config")||url.pathname.includes("/flags")?provider:{status:1}});
  if(url.hostname==="www.google-analytics.com"){if(slowCollector)await new Promise(r=>setTimeout(r,3000));try{return await route.fulfill({status:204})}catch{return}}
  if(r.url()==="https://vercel.live/_next-live/feedback/feedback.js"&&r.method()==="GET")return route.abort();
  errors.push(r.url());return route.abort();
 });
 const page=await context.newPage();page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});activeSession={context,page,requests,errors};return activeSession;
}
function google(requests){return requests.filter(r=>new URL(r.url).hostname==="www.google-analytics.com").map(r=>({request:r,params:Object.fromEntries(new URL(r.url).searchParams)}))}
async function waitFor(test){for(let i=0;i<150;i++){if(test())return;await new Promise(r=>setTimeout(r,100))}assert.ok(test(),"Expected native request did not arrive")}
try{
for(const width of [1440,390]){
 const label=String(width)+" Google-only",s=await open(label,{analytics:true,posthog:false,heatmaps:false,replay:false});
 await s.page.goto(origin+"/?email=TestCanaryQuery#TestCanaryHash");await waitFor(()=>google(s.requests).some(r=>r.params.en==="page_view"));
 const first=google(s.requests)[0];check(label+" correct native stream",first.params.tid===id);check(label+" clean logical page",first.params.dl==="https://projectbreadnfc.vercel.app/");
 check(label+" no PostHog traffic",s.requests.every(r=>!r.url.includes("posthog.com")));
 check(label+" no source credentials",google(s.requests).every(r=>!r.request.headers.cookie&&!r.request.headers.authorization&&!r.request.headers.referer));
 check(label+" no canaries",!JSON.stringify(s.requests).includes("TestCanary"));
 const frame=s.page.frames().find(f=>f.url().includes("/measurement/google.html"));assert.ok(frame);
 check(label+" cross-origin parent isolation",await frame.evaluate(()=>{try{void parent.document.body;return false}catch{return window.credentialless===true}}));
 await s.page.locator('a[href="/products"]:visible').first().click();await s.page.waitForURL("**/products");await waitFor(()=>google(s.requests).filter(r=>r.params.en==="page_view").length>=2);
 const list=google(s.requests);check(label+" real CTA",list.some(r=>r.params.en==="public_cta"&&r.params["ep.target"]==="products"&&r.params.dl==="https://projectbreadnfc.vercel.app/"));
 check(label+" short session correlation",list.every(r=>r.params.cid===first.params.cid&&r.params.sid===first.params.sid));
 await s.page.locator('a[href="/products"]:visible').first().click();await s.page.waitForFunction(()=>document.querySelector('iframe[src$="/measurement/google.html"]'));check(label+" same-page links keep measurement available",s.page.frames().some(f=>f.url().includes('/measurement/google.html')));
 const [newTab]=await Promise.all([s.context.waitForEvent("page"),s.page.locator('a[href="/pilot"]:visible').first().click({modifiers:["Control"]})]);await newTab.waitForLoadState("domcontentloaded");check(label+" new-tab clicks keep source measurement available",s.page.frames().some(f=>f.url().includes('/measurement/google.html')));await newTab.close();
 const privacy=await s.context.newPage();await privacy.goto(origin+"/privacy#privacy-choices");await privacy.waitForFunction(()=>!document.querySelector("fieldset")?.disabled);await privacy.getByRole("checkbox",{name:"Allow Google Analytics (GA4)",exact:true}).uncheck();await s.page.waitForTimeout(400);
 check(label+" identity cleared on withdrawal",await s.page.evaluate(key=>sessionStorage.getItem(key)===null,sessionKey));const boundary=Date.now();await s.page.goto(origin+"/products?private=TestCanaryAfterDecline");await s.page.waitForTimeout(3500);check(label+" cross-tab withdrawal persists",s.requests.every(r=>r.at<=boundary));
 check(label+" no browser errors",s.errors.length===0);receipts.push({label,requests:s.requests});await s.context.close();
}
const ph=await open("PostHog-only",{analytics:false,posthog:true,heatmaps:false,replay:false});await ph.page.goto(origin+"/products");await waitFor(()=>ph.requests.some(r=>r.body?.includes('$pageview')));check("PostHog-only no Google wire",google(ph.requests).length===0);check("PostHog-only no Google frame",!ph.page.frames().some(f=>f.url().includes('/measurement/google.html')));await ph.context.close();
for(const options of [{signal:true},{googleDisabled:true},{dnt:true},{failed:true},{jurisdiction:"unknown"},{oldDecline:true}]){const label="Google denied "+JSON.stringify(options),s=await open(label,{analytics:true,posthog:false,heatmaps:false,replay:false},options);await s.page.goto(origin+"/");await s.page.waitForTimeout(options.oldDecline?4000:2000);if(options.oldDecline)check("Older shared traffic decline also suppresses PostHog traffic",!s.requests.some(r=>r.body?.includes("$pageview")));check(label,google(s.requests).length===0&&!tagRequests.some(r=>r.case===label));await s.context.close()}
const unsupported=await open("Unsupported isolation",{analytics:true,posthog:true,heatmaps:false,replay:false},{unsupported:true});await unsupported.page.goto(origin+"/");await waitFor(()=>unsupported.requests.some(r=>r.body?.includes('$pageview')));check("Unsupported Google isolation leaves Google off",google(unsupported.requests).length===0&&!unsupported.page.frames().some(f=>f.url().includes('/measurement/google.html')));await unsupported.context.close();
const slow=await open("Slow collector",{analytics:true,posthog:false,heatmaps:false,replay:false},{slowCollector:true});await slow.page.goto(origin+"/");await waitFor(()=>google(slow.requests).some(r=>r.params.en==="page_view"));const slowLink=slow.page.locator('a[href="/products"]:visible').first();await slowLink.scrollIntoViewIfNeeded();const slowStart=Date.now();await slowLink.click();await slow.page.waitForURL("**/products");check("Slow collector does not delay navigation",Date.now()-slowStart<1500);await slow.context.close();
emptyTag=true;const noTag=await open("No native receipt",{analytics:true,posthog:false,heatmaps:false,replay:false});await noTag.page.goto(origin+"/");await noTag.page.waitForTimeout(4000);check("No fabricated Google collection without real tag",google(noTag.requests).length===0);
for(const target of ["products","pilot","dashboard","privacy"]){await noTag.page.goto(origin+"/");await noTag.page.waitForTimeout(500);const link=noTag.page.locator('a[href="/'+target+'"]:visible').first();await link.scrollIntoViewIfNeeded();const started=Date.now();await link.click();await noTag.page.waitForURL("**/"+target);check("Offline Google keeps "+target+" navigation prompt",Date.now()-started<1500)}
check("Offline tag never fabricates a click request",google(noTag.requests).length===0);await noTag.context.close();emptyTag=false;
check("Real Google script was inspected",tagRequests.some(r=>r.case==="1440 Google-only"));
check("Credentialless script requests omit cookie/referrer",tagRequests.every(r=>!r.headers.cookie&&!r.headers.referer));
check("Receiver source requests omit auth/cookies",frameRequests.every(r=>!r.headers.cookie&&!r.headers.authorization&&!r.headers.referer));
const helper=await fetch(origin+"/measurement/google.html");check("Receiver frame-ancestors exception scoped",helper.headers.get("content-security-policy").includes("frame-ancestors "+metadata.googleFrame.parents[0])&&!helper.headers.get("x-frame-options"));const main=await fetch(origin+"/");check("Public page still denies framing",main.headers.get("x-frame-options")==="DENY"&&main.headers.get("content-security-policy").includes("frame-ancestors 'none'"));
await writeFile(out+"/results.json",JSON.stringify({origin,passed:results.length,results,receipts,frameRequests,tagRequests},null,2));console.log(JSON.stringify({passed:results.length,origin}));
}catch(error){await writeFile(out+"/failure.json",JSON.stringify({error:String(error),current,frameRequests,tagRequests,requests:activeSession?.requests,errors:activeSession?.errors,frames:await Promise.all((activeSession?.page.frames()??[]).map(async f=>({url:f.url(),state:await f.evaluate(()=>({html:document.documentElement.outerHTML,data:window.dataLayer,credentialless:window.credentialless,wires:window.__testWires})).catch(e=>String(e))})))},null,2));throw error}finally{await browser.close();if(proxy)await new Promise(r=>proxy.close(r))}
