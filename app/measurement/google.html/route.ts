import { measurementFrameContext } from "@/lib/measurement-frame";
import { googleReceiverHtml } from "@/lib/google-receiver";
import { gaId } from "@/lib/measurement-config";
export const dynamic = "force-dynamic";
export function GET() {
  const context = measurementFrameContext();
  if (!context || !gaId) return new Response(null,{status:404});
  const config = JSON.stringify({...context,id:gaId}).replaceAll("<","\\u003c");
  const csp = "default-src 'none'; script-src 'unsafe-inline' https://www.googletagmanager.com; connect-src 'none'; img-src 'none'; frame-src 'none'; frame-ancestors " + context.parents.join(" ") + "; base-uri 'none'; form-action 'none'";
  return new Response(googleReceiverHtml.replace("__CONFIG__",config),{headers:{
    "Content-Type":"text/html; charset=utf-8", "Cache-Control":"private, no-store, max-age=0",
    "Content-Security-Policy":csp, "Referrer-Policy":"no-referrer", "X-Content-Type-Options":"nosniff", "X-Robots-Tag":"noindex, nofollow",
    "Permissions-Policy":"camera=(), microphone=(), geolocation=()",
  }});
}
