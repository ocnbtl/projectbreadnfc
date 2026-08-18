import { readFileSync } from "node:fs";

const targets = JSON.parse(readFileSync("config/production-targets.json", "utf8"));
const full = process.argv.includes("--full");
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== "--full");
if (unknownArguments.length > 0) {
  throw new Error(`Unknown argument(s): ${unknownArguments.join(", ")}`);
}

function originFrom(value, name) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`);
  }
  const local = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  if (parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")) {
    throw new Error(`${name} must use HTTPS unless it targets localhost.`);
  }
  parsed.pathname = "/";
  parsed.search = "";
  parsed.hash = "";
  return parsed.origin;
}

const appOrigin = originFrom(
  process.env.SCANTAP_VERIFY_APP_URL || targets.siteOrigin,
  "SCANTAP_VERIFY_APP_URL",
);
const apiValue = process.env.SCANTAP_VERIFY_API_URL || (full ? targets.apiOrigin : "");
const apiOrigin = apiValue ? originFrom(apiValue, "SCANTAP_VERIFY_API_URL") : null;
const statusValue = process.env.SCANTAP_VERIFY_STATUS_URL || "";
const statusOrigin = statusValue ? originFrom(statusValue, "SCANTAP_VERIFY_STATUS_URL") : null;

if (full && !apiOrigin) {
  throw new Error("--full requires SCANTAP_VERIFY_API_URL or the configured production API origin.");
}

const checks = [];
function record(name, passed, detail) {
  checks.push({ name, passed: Boolean(passed), detail });
}

async function request(origin, pathname, options = {}) {
  const response = await fetch(new URL(pathname, origin), {
    redirect: "manual",
    signal: AbortSignal.timeout(12_000),
    ...options,
  });
  return response;
}

async function verifyApp() {
  const home = await request(appOrigin, "/");
  record("app homepage", home.status === 200, `HTTP ${home.status}`);

  const expectedHeaders = new Map([
    ["x-content-type-options", "nosniff"],
    ["x-frame-options", "DENY"],
    ["referrer-policy", "strict-origin-when-cross-origin"],
  ]);
  for (const [header, expected] of expectedHeaders) {
    const actual = home.headers.get(header);
    record(`header ${header}`, actual?.toLowerCase() === expected.toLowerCase(), actual || "missing");
  }
  record("header permissions-policy", Boolean(home.headers.get("permissions-policy")), home.headers.get("permissions-policy") || "missing");

  if (full) {
    const csp = home.headers.get("content-security-policy");
    record("header content-security-policy", Boolean(csp), csp ? "present" : "missing");
    record("CSP blocks plugins", csp?.includes("object-src 'none'"), csp ? "object-src checked" : "missing CSP");
    record("CSP blocks framing", csp?.includes("frame-ancestors 'none'"), csp ? "frame-ancestors checked" : "missing CSP");
    record("CSP excludes unsafe eval", !csp?.includes("'unsafe-eval'"), csp ? "script policy checked" : "missing CSP");
    record("header strict-transport-security", Boolean(home.headers.get("strict-transport-security")), home.headers.get("strict-transport-security") || "missing");
  }

  const login = await request(appOrigin, "/login");
  record("app route /login", login.status === 200, `HTTP ${login.status}`);
  const loginCsp = login.headers.get("content-security-policy");
  record("login CSP has nonce", /'nonce-[^']+'/.test(loginCsp || ""), loginCsp ? "nonce checked" : "missing CSP");
  record("login CSP is strict-dynamic", loginCsp?.includes("'strict-dynamic'"), loginCsp ? "script policy checked" : "missing CSP");
  record("login CSP excludes unsafe eval", !loginCsp?.includes("'unsafe-eval'"), loginCsp ? "script policy checked" : "missing CSP");

  const dashboard = await request(appOrigin, "/dashboard");
  record("app route /dashboard", dashboard.status === 200, `HTTP ${dashboard.status}`);

  const protectedResponse = await request(appOrigin, "/app");
  if (protectedResponse.status >= 300 && protectedResponse.status < 400) {
    const location = protectedResponse.headers.get("location");
    let validRedirect = false;
    if (location) {
      const redirect = new URL(location, appOrigin);
      validRedirect = redirect.origin === appOrigin && redirect.pathname === "/login";
    }
    record("protected route denial", validRedirect, `HTTP ${protectedResponse.status} to ${location ? new URL(location, appOrigin).pathname : "missing location"}`);
  } else {
    record("protected route response", protectedResponse.status === 200, `HTTP ${protectedResponse.status}`);
  }
}

async function verifyApi() {
  if (!apiOrigin) return;

  const health = await request(apiOrigin, "/auth/v1/health");
  record("Supabase Auth health", health.status === 200, `HTTP ${health.status}`);

  const authRoot = await request(apiOrigin, "/auth/v1/", { method: "HEAD" });
  record("Supabase Auth unauthenticated boundary", authRoot.status === 401, `HTTP ${authRoot.status}`);

  const restRoot = await request(apiOrigin, "/rest/v1/");
  record("Supabase REST unauthenticated boundary", restRoot.status === 401, `HTTP ${restRoot.status}`);
}

async function verifyStatus() {
  if (!statusOrigin) return;
  const response = await request(statusOrigin, "/");
  record("external status page", response.status === 200, `HTTP ${response.status}`);
}

try {
  await verifyApp();
  await verifyApi();
  await verifyStatus();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  record("network execution", false, message);
}

for (const item of checks) {
  console.log(`${item.passed ? "PASS" : "FAIL"} ${item.name}: ${item.detail}`);
}

const failed = checks.filter((item) => !item.passed);
if (failed.length > 0) {
  console.error(`${failed.length} of ${checks.length} deployment checks failed.`);
  process.exit(1);
}

console.log(`Deployment verification passed: ${checks.length} checks.`);
