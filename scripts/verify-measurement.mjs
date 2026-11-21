import { regionPolicy } from "../lib/privacy-region.ts";
import { collectionAllowed } from "../lib/privacy.ts";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { chromium } from "playwright";
const origin = process.argv[2] || "http://127.0.0.1:3167";
const token = "phc_texwKYJWdNJ9D7uvte6R5unvmKhGSnA3WdoMT3oGX2UK";
const provider = await fetch("https://us.i.posthog.com/array/"+token+"/config", {headers:{Origin:"https://projectbreadnfc.vercel.app"}}).then(r=>{assert.equal(r.status,200);return r.json()});
const out="output/playwright/measurement"; await mkdir(out,{recursive:true});
const results=[], receipts=[];
const check=(name,condition)=>{assert.ok(condition,name);results.push(name)};
function unpack(value) {
  if (Array.isArray(value)) return value.map(unpack);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,unpack(v)]));
  if (typeof value === "string" && value.charCodeAt(0)===31 && value.charCodeAt(1)===139) return unpack(JSON.parse(gunzipSync(Buffer.from(value,"latin1")).toString()));
  return value;
}
function events(requests) {return requests.filter(r=>r.body).flatMap(r=>{const p=JSON.parse(r.body);return Array.isArray(p)?p:p.batch||[]}).map(unpack)}
const browser=await chromium.launch({channel:"chrome",headless:true,args:["--disable-blink-features=AutomationControlled"]});
async function session(viewport,{choices,signal=false,legacy=false,internal=false,authenticated=false,failed=false,replayRequiresConsent=false,blocked=false,jurisdiction="default-on-permitted"}={}){
  const context=await browser.newContext({viewport,userAgent:"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36"});
  const requests=[],errors=[];
  await context.addInitScript(({choices,signal,legacy,internal,authenticated})=>{
    if(choices && !localStorage.getItem("scantap-privacy-choices:v2"))localStorage.setItem("scantap-privacy-choices:v2",JSON.stringify(choices));
    if(internal)localStorage.setItem("scantap-internal","1");
    if(authenticated)localStorage.setItem("sb-test-auth-token","synthetic-exclusion-marker");
    if(legacy)localStorage.setItem("cookieConsent","declined");
    if(signal)Object.defineProperty(navigator,"globalPrivacyControl",{get:()=>true});
    addEventListener("DOMContentLoaded",()=>{const p=document.createElement("p");p.textContent="TestCanaryText";p.setAttribute("data-secret","TestCanaryAttribute");document.body.append(p);const i=document.createElement("input");i.value="TestCanaryInput";document.body.append(i);});
  },{choices,signal,legacy,internal,authenticated});
  await context.route("**/*",async route=>{
    const r=route.request(),u=new URL(r.url());
    if(u.origin===new URL(origin).origin){
      if(/^\/_vercel\/(insights|speed-insights|analytics)/.test(u.pathname)||!["GET","HEAD"].includes(r.method())){errors.push("Unexpected host collection or mutation: "+r.url());return route.abort()}
      if(u.pathname==="/api/privacy-context")return route.fulfill({status:failed?503:200,json:{jurisdiction,signal,replayRequiresConsent,blocked}});
      return route.continue();
    }
    if(u.hostname.endsWith("posthog.com")){
      requests.push({url:r.url(),body:r.postData(),headers:await r.allHeaders(),at:Date.now()});
      if(u.pathname.includes("/config")||u.pathname.includes("/flags"))return route.fulfill({json:provider,headers:{"access-control-allow-origin":"*"}});
      return route.fulfill({json:{status:1},headers:{"access-control-allow-origin":"*"}});
    }
    if(r.method()==="GET"&&r.url()==="https://vercel.live/_next-live/feedback/feedback.js"&&!r.postData())return route.abort();
    errors.push("Unexpected external request: "+r.url());return route.abort();
  });
  const page=await context.newPage();page.on("pageerror",e=>errors.push(e.message));
  return {context,page,requests,errors};
}
async function stimulate(page){await page.locator("h1").first().waitFor();await page.waitForTimeout(1500);await page.locator("h1").first().click({force:true});await page.mouse.move(350,330);await page.evaluate(()=>{const p=document.createElement("p");p.textContent="TestCanaryMutation";p.title="TestCanaryTitle";document.body.append(p)});await page.waitForTimeout(11500)}
const base={pathname:"/",signal:false,choices:{},legacyDecline:false,configured:true,maskingVerified:true};
for(const [country,region] of [["US","OH"],["AU","NSW"],["NZ",null]]){const p=regionPolicy(true,country,region);for(const f of ["posthog","heatmaps","replay"])check(country+" default "+f,collectionAllowed(f,{...base,...p}))}
for(const country of ["DE","GB","CH","AX","GF","GP","MF","MQ","RE","YT","BR","TR"]){const p=regionPolicy(true,country,null);check(country+" prior choice",!collectionAllowed("analytics",{...base,...p}));check(country+" explicit choice",collectionAllowed("analytics",{...base,...p,choices:{analytics:true}}))}
for(const state of "CA CT DE FL IL MD MA MI MT NV NH PA WA".split(" ")){const p=regionPolicy(true,"US",state);check(state+" basic default",collectionAllowed("analytics",{...base,...p}));check(state+" replay waits",!collectionAllowed("replay",{...base,...p}));check(state+" explicit replay",collectionAllowed("replay",{...base,...p,choices:{replay:true}}))}
for(const [country,state,trusted] of [[null,null,true],["XX",null,true],["US",null,true],["CA",null,true],["US","OH",false],["CN",null,true]]){check("blocked context "+country+":"+state+":"+trusted,!collectionAllowed("analytics",{...base,...regionPolicy(trusted,country,state),choices:{analytics:true}}))}
try{
for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const label=String(viewport.width);
  const s=await session(viewport);
  await s.page.goto(origin+"/?email=TestCanaryQuery#TestCanaryHash");await stimulate(s.page);
  let e=events(s.requests);
  for(const name of ["$pageview","$$heatmap","$snapshot"])check(label+" positive native "+name,e.some(x=>x.event===name));
  check(label+" project binding",e.every(x=>x.properties.token===token));
  check(label+" eligible pinned SDK",e.every(x=>x.properties.$lib_version==="1.453.0"));
  check(label+" reviewed public replay text retained",JSON.stringify(e.filter(x=>x.event==="$snapshot")).includes("Built for local shops"));
  check(label+" canaries absent",!JSON.stringify(e).includes("TestCanary"));
  check(label+" no referrer or source credentials",s.requests.every(x=>!x.headers.cookie&&!x.headers.authorization&&!String(x.headers.referer).includes("TestCanary")));
  const snapshots=e.filter(x=>x.event==="$snapshot").flatMap(x=>x.properties.$snapshot_data||[]);
  check(label+" real full DOM snapshot",snapshots.some(x=>x.type===2));
  check(label+" real replay mutations",snapshots.some(x=>x.type===3));
  check(label+" no script errors",s.errors.length===0);
  await s.page.locator('a[href="/dashboard"]:visible').first().click();await s.page.waitForURL("**/dashboard");await s.page.waitForTimeout(1000);
  check(label+" CTA sent before navigation",events(s.requests).some(x=>x.event==="public_cta"&&x.properties.target==="dashboard"));
  const excludedBoundary=Date.now();await s.page.waitForTimeout(6000);check(label+" navigation suppresses queued/retry sends",s.requests.filter(r=>r.at>excludedBoundary).length===0);
  const privacy=await s.context.newPage();await privacy.goto(origin+"/privacy#privacy-choices");
  await privacy.getByRole("checkbox").first().waitFor();
  await privacy.waitForFunction(()=>!document.querySelector("fieldset")?.disabled && [...document.querySelectorAll("fieldset input[type=checkbox]")].every(input=>input.checked));
  for(const control of await privacy.getByRole("checkbox").all())await control.uncheck();
  check(label+" all declines stored",await privacy.evaluate(()=>Object.values(JSON.parse(localStorage.getItem("scantap-privacy-choices:v2"))).every(value=>value===false)));
  const boundary=Date.now();await s.page.goto(origin+"/products?private=TestCanaryNavigation");await stimulate(s.page);
  check(label+" withdrawal across tabs stops all sends",s.requests.filter(r=>r.at>boundary).length===0);
  await privacy.reload();check(label+" opt-out survives reload",await privacy.getByRole("checkbox",{checked:true}).count()===0);
  await privacy.screenshot({path:out+"/choices-"+label+".png",fullPage:true});
  receipts.push({label,requests:s.requests,errors:s.errors});await s.context.close();
  for(const options of [{signal:true},{legacy:true},{internal:true},{authenticated:true},{failed:true,choices:{analytics:true,posthog:true,heatmaps:true,replay:true}},{jurisdiction:"unknown",choices:{analytics:true,heatmaps:true,replay:true}},{jurisdiction:"prior-consent"}]){
    const s=await session(viewport,options);await s.page.goto(origin+"/products");await s.page.waitForTimeout(2500);
    check(label+" no optional egress "+JSON.stringify(options),s.requests.length===0);await s.context.close();
  }
}
for(const feature of ["posthog","heatmaps","replay"]){
  const choices={analytics:false,posthog:false,heatmaps:false,replay:false,[feature]:true};
  const s=await session({width:1440,height:1000},{choices,jurisdiction:"prior-consent"});await s.page.goto(origin+"/products?private=TestCanaryQuery");await stimulate(s.page);
  const e=events(s.requests);const expected={posthog:"$pageview",heatmaps:"$$heatmap",replay:"$snapshot"}[feature];
  check(feature+" independent positive",e.some(x=>x.event===expected));
  check(feature+" independent exclusion",e.every(x=>x.event===expected));
  check(feature+" canaries absent",!JSON.stringify(e).includes("TestCanary"));
  receipts.push({feature,requests:s.requests,errors:s.errors});await s.context.close();
}
const denied=await session({width:390,height:844},{choices:{analytics:true,heatmaps:true,replay:true}});
for(const path of ["/dashboard","/pilot","/privacy","/login","/app","/control","/auth/callback","/invite/private","/review/private","/products/private","/api/privacy-context"]){await denied.page.goto(origin+path);await denied.page.waitForTimeout(500);check("excluded route "+path,denied.requests.length===0)}
await denied.context.close();
await writeFile(out+"/results.json",JSON.stringify({origin,passed:results.length,results,receipts},null,2));console.log(JSON.stringify({passed:results.length,origin}));
}finally{await browser.close()}

