// Native Google code generates receipts inside a credentialless, distinct-origin frame.
export const googleReceiverHtml = String.raw`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>Website measurement</title></head><body><script>const PUBLIC_PATHS=["/","/products"];const CONFIG=__CONFIG__;
'use strict';
addEventListener('message',function attach(e){
 if(window.credentialless!==true||location.origin!==CONFIG.origin||!CONFIG.parents.includes(e.origin)||e.source!==parent||e.data?.type!=='init'||e.data.id!==CONFIG.id||!/^\d{1,20}\.\d{1,20}$/.test(e.data.client)||e.ports.length!==1)return;
 removeEventListener('message',attach);
 const port=e.ports[0],id=e.data.id,waiting=new Map();
 const events=new Set(['page_view','public_cta']);
 const jar=new Map();
 Object.defineProperty(document,'cookie',{get:()=>Array.from(jar,([k,v])=>k+'='+v).join('; '),set:value=>{const pair=String(value).split(';')[0],at=pair.indexOf('=');if(at>0)jar.set(pair.slice(0,at),pair.slice(at+1));}});
 for(const key of ['localStorage','sessionStorage']){const values=new Map();Object.defineProperty(window,key,{value:{get length(){return values.size},key:i=>Array.from(values.keys())[i]??null,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(String(k),String(v)),removeItem:k=>values.delete(k),clear:()=>values.clear()}});}
 function inspect(raw,body){
  let url;try{url=new URL(raw,location.href);}catch{return;}
  if(!['https://www.google-analytics.com','https://region1.google-analytics.com'].includes(url.origin)||url.pathname!=='/g/collect')return;
  for(const line of String(body||'').split(/\r?\n/)){
   const p=new URLSearchParams(url.search);for(const [k,v]of new URLSearchParams(line))p.set(k,v);
   const nonce=p.get('ep.scantap_receipt'),expected=waiting.get(nonce);
   if(p.get('tid')!==id||!expected||p.get('en')!==expected)continue;waiting.delete(nonce);
   const fields={};for(const key of ['gcs','gcd','_p','_s','_ss','_fv','sct','seg']){const value=p.get(key);if(value&&/^[0-9A-Za-z.-]{1,40}$/.test(value))fields[key]=value;}port.postMessage({nonce,fields});
  }
 }
 async function intercept(raw,body){inspect(raw,'');if(body instanceof Blob)body=await body.text();if(body instanceof ArrayBuffer)body=new TextDecoder().decode(body);inspect(raw,body);}
 window.fetch=async(input,init)=>{const req=input instanceof Request?input:null;await intercept(req?req.url:String(input),init?.body??(req?await req.text():''));return new Response(null,{status:204});};
 Object.defineProperty(navigator,'sendBeacon',{configurable:true,value:(url,body)=>{void intercept(String(url),body);return true;}});
 const src=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');if(src)Object.defineProperty(HTMLImageElement.prototype,'src',{...src,set(value){inspect(String(value),'');}});
 window.dataLayer=[];function gtag(){dataLayer.push(arguments);}
 gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 gtag('js',new Date());gtag('config',id,{send_page_view:false,client_id:e.data.client,allow_google_signals:false,allow_ad_personalization_signals:false,page_referrer:'about:blank',ignore_referrer:true});
 port.onmessage=message=>{
  const {nonce,event,path,location:publicUrl}=message.data||{};
  if(typeof nonce!=='string'||!/^r[0-9a-f-]{36}$/.test(nonce)||!events.has(event)||typeof path!=='string'||!PUBLIC_PATHS.includes(path)||publicUrl!=='https://projectbreadnfc.vercel.app'+path||waiting.size>=30)return;
  waiting.set(nonce,event);gtag('event',event,{send_to:id,page_location:publicUrl,page_title:path,page_referrer:'about:blank',scantap_receipt:nonce,client_id:e.data.client,event_callback:function(){},event_timeout:100,transport_type:'beacon'});
  // A real receiver unload flushes Google's native batch before the bounded source navigation.
  if(event==='public_cta')setTimeout(()=>location.reload(),0);
 };
 const script=document.createElement('script');script.referrerPolicy='no-referrer';script.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.append(script);
});
</script></body></html>
`;
