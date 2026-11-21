import { headers } from "next/headers";
import { regionPolicy } from "@/lib/privacy-region";
export const dynamic = "force-dynamic";
export async function GET() {
  const h = await headers();
  // Vercel supplies these headers; location claims from query parameters or cookies are ignored.
  const country = process.env.VERCEL === "1" ? h.get("x-vercel-ip-country") : null;
  const region = process.env.VERCEL === "1" ? h.get("x-vercel-ip-country-region") : null;
  const policy = regionPolicy(process.env.VERCEL === "1", country, region);
  const authenticated = (h.get("cookie") ?? "").split(";").some(cookie => /^\s*sb-[^=]+-auth-token(?:\.\d+)?=/.test(cookie));
  return Response.json({ ...policy, blocked: policy.blocked || authenticated, signal: h.get("sec-gpc") === "1" || h.get("dnt") === "1" }, {
    headers: { "Cache-Control": "private, no-store, max-age=0", "Vary": "Sec-GPC, DNT", "X-Content-Type-Options": "nosniff" },
  });
}
