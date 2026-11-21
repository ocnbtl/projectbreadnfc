import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { collectionAllowed, isLegacyDecline, isPrivacySignal, parseChoices, privacyKey, privacyFeatures } from "../lib/privacy.ts";

const origin = process.argv[2] || "http://127.0.0.1:3167";
const output = "output/playwright/privacy";
await mkdir(output, { recursive: true });
const checks = [];
const check = (name, condition) => { assert.ok(condition, name); checks.push(name); };
const baseline = { pathname: "/", signal: false, choices: {}, legacyDecline: false,
  configured: true, maskingVerified: true, jurisdiction: "default-on-permitted" };
for (const feature of privacyFeatures) {
  check(`${feature}: eligible verified default-on policy`, collectionAllowed(feature, baseline));
  for (const route of ["/dashboard", "/demo", "/pilot", "/review", "/login", "/auth/callback", "/app", "/control", "/checkout", "/contact", "/uploads", "/products/private", "/api/anything", "/privacy", "/products/"]) {
    check(`${feature}: excluded ${route}`, !collectionAllowed(feature, { ...baseline, pathname: route }));
  }
  check(`${feature}: exact products permitted`, collectionAllowed(feature, { ...baseline, pathname: "/products" }));
  for (const override of [{signal:true}, {configured:false}, {maskingVerified:false}, {legacyDecline:true}, {jurisdiction:"unknown"}, {jurisdiction:"prior-consent"}, {choices:{[feature]:false}}]) {
    check(`${feature}: deny ${JSON.stringify(override)}`, !collectionAllowed(feature, {...baseline,...override}));
  }
  check(`${feature}: explicit consent with prior-consent policy`, collectionAllowed(feature, {...baseline,jurisdiction:"prior-consent",choices:{[feature]:true}}));
}
check("GPC honored", isPrivacySignal({globalPrivacyControl:true}));
check("DNT honored", isPrivacySignal({doNotTrack:"1"}));
check("malformed stored consent cannot grant", Object.keys(parseChoices('{"analytics":"true"}')).length === 0);
check("legacy decline honored", isLegacyDecline('{"analytics":false}'));

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const receipts = [];
try {
  for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
    const context = await browser.newContext({ viewport });
    const requests = [];
    const errors = [];
    context.on("request", req => requests.push({url:req.url(),method:req.method(),body:req.postData()}));
    const page = await context.newPage();
    page.on("pageerror", e=>errors.push(e.message));
    await page.goto(origin, {waitUntil:"networkidle"});
    const link = page.getByRole("link", {name:"Your Privacy Choices",exact:true});
    await link.scrollIntoViewIfNeeded();
    check(`footer target ${viewport.width}`, await link.getAttribute("href") === "/privacy#privacy-choices");
    const box = await link.boundingBox();
    check(`footer touch target ${viewport.width}`, box.height >= 44);
    await page.screenshot({path:`${output}/footer-${viewport.width}.png`});
    await link.click();
    await page.waitForURL("**/privacy#privacy-choices");
    const controls = privacyFeatures.map((feature,i)=>page.getByRole("checkbox").nth(i));
    await controls[0].waitFor();
    check(`no popup ${viewport.width}`, await page.getByRole("dialog").count() === 0);
    for (const control of controls) check(`initial unconfigured off ${viewport.width}`, !await control.isChecked());
    for (const control of controls) await control.check();
    await controls[1].uncheck();
    let stored = await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),privacyKey);
    check(`independent choice ${viewport.width}`, stored.analytics === true && stored.heatmaps === false && stored.replay === true);
    await page.reload({waitUntil:"networkidle"});
    check(`saved allow ${viewport.width}`, await controls[0].isChecked());
    check(`saved decline ${viewport.width}`, !await controls[1].isChecked());
    for (const control of controls) await control.uncheck();
    await page.goto(`${origin}/products?email=synthetic-canary%40example.invalid#synthetic-canary`, {waitUntil:"networkidle"});
    await page.getByRole("link",{name:"Your Privacy Choices",exact:true}).click();
    await page.waitForURL("**/privacy#privacy-choices");
    await page.waitForLoadState("networkidle");
    const heading = page.getByRole("heading", {name:"Your Privacy Choices", exact:true});
    const targetBox = await heading.boundingBox();
    check(`direct link scrolls to controls ${viewport.width}`, targetBox.y >= 0 && targetBox.y < viewport.height);
    for (const control of controls) check(`decline after navigation ${viewport.width}`, !await control.isChecked());
    check(`no horizontal overflow ${viewport.width}`, await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({path:`${output}/choices-${viewport.width}.png`});
    await page.evaluate(()=>{
      const input=document.createElement("input"); input.type="text"; input.value="PRIVATE_SYNTHETIC_CANARY"; document.body.append(input);
      const text=document.createElement("p"); text.textContent="PRIVATE_TEXT_CANARY"; document.body.append(text);
    });
    for (const path of ["/dashboard", "/pilot", "/login", "/app", "/control", "/privacy"]) await page.goto(origin+path,{waitUntil:"networkidle"});
    const external = requests.filter(req=>!req.url.startsWith(origin+"/") && !req.url.startsWith("data:"));
    check(`no external collectors or CDN analytics ${viewport.width}`, external.length === 0);
    check(`canary absent from outgoing bodies ${viewport.width}`, requests.every(req=>!/(PRIVATE_SYNTHETIC_CANARY|PRIVATE_TEXT_CANARY)/.test(req.body||"")));
    check(`no client errors ${viewport.width}`, errors.length === 0);
    receipts.push({viewport,requests,external,errors});
    await context.close();
  }
  for(const signal of ["gpc","dnt","legacy","storage-blocked"]) {
    const context=await browser.newContext();
    await context.addInitScript(({signal})=>{
      if(signal==="gpc") Object.defineProperty(navigator,"globalPrivacyControl",{value:true});
      if(signal==="dnt") Object.defineProperty(navigator,"doNotTrack",{value:"1"});
      if(signal==="legacy") localStorage.setItem("cookie-consent","declined");
      if(signal==="storage-blocked") {
        Object.defineProperty(window,"localStorage",{get(){throw new Error("blocked")}});
        Object.defineProperty(document,"cookie",{get(){return ""},set(){}});
      }
    },{signal,key:privacyKey});
    const page=await context.newPage();
    await page.goto(origin+"/privacy#privacy-choices",{waitUntil:"networkidle"});
    if(signal==="gpc"||signal==="dnt") check(`${signal}: UI locks all categories`, await page.getByRole("checkbox").first().isDisabled());
    if(signal==="legacy") check("legacy: disclosure visible", await page.getByText(/A previous decline is being honored/).isVisible());
    if(signal==="storage-blocked") {
      await page.getByRole("checkbox").first().check();
      check("storage failure disclosed", await page.getByText(/could not be saved for future visits/).isVisible());
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(`${output}/results.json`, JSON.stringify({origin,checks,receipts,vendorException:"No vendors configured; no replay payload exists to validate. Policy tests are not vendor masking evidence."},null,2));
console.log(`Passed ${checks.length} privacy assertions. No vendor activation or replay masking claim.`);
