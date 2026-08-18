import { readFileSync } from "node:fs";

const targets = JSON.parse(readFileSync("config/production-targets.json", "utf8"));
const envExample = readFileSync(".env.example", "utf8");
const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
const runbook = readFileSync("docs/operations/ORACLE_SUPABASE_RUNBOOK.md", "utf8");
const capacityChecklist = readFileSync("docs/operations/CAPACITY_DAY_CHECKLIST.md", "utf8");
const backupScript = readFileSync("infra/oracle-supabase/backup.sh", "utf8");
const restoreScript = readFileSync("infra/oracle-supabase/restore-drill.sh", "utf8");
const runtimeOverrides = readFileSync("infra/oracle-supabase/runtime-overrides.env.example", "utf8");
const nextConfig = readFileSync("next.config.ts", "utf8");
const proxy = readFileSync("proxy.ts", "utf8");
const layout = readFileSync("app/layout.tsx", "utf8");
const deploymentVerifier = readFileSync("scripts/verify-deployment.mjs", "utf8");

const checks = [];
function check(condition, message) {
  checks.push({ condition: Boolean(condition), message });
}

for (const key of ["siteOrigin", "apiOrigin", "statusOrigin"]) {
  let parsed;
  try {
    parsed = new URL(targets[key]);
  } catch {
    parsed = null;
  }
  check(parsed?.protocol === "https:", `${key} must be a valid HTTPS origin.`);
  check(parsed?.pathname === "/", `${key} must not contain a path.`);
}

check(targets.siteOrigin === "https://scantapreviews.com", "The canonical site origin drifted.");
check(targets.apiOrigin === "https://api.scantapreviews.com", "The canonical API origin drifted.");
check(targets.statusOrigin === "https://status.scantapreviews.com", "The reserved status origin drifted.");
check(targets.contactEmail === "contact@scantapreviews.com", "The planned contact mailbox drifted.");
check(targets.domainState === "planned-not-purchased", "Domain state must remain explicitly pending until purchase is verified.");
check(targets.mailboxState === "planned-not-configured", "Mailbox state must remain explicitly pending until delivery is verified.");

check(envExample.includes(`NEXT_PUBLIC_SITE_URL=${targets.siteOrigin}`), ".env.example must use the intended canonical site origin.");
check(envExample.includes(`GOOGLE_REDIRECT_URI=${targets.siteOrigin}/api/integrations/google/callback`), ".env.example must use the intended Google callback.");
check(envExample.includes(`# NEXT_PUBLIC_SUPABASE_URL=${targets.apiOrigin}`), ".env.example must document the intended API origin without pretending it is live.");
check(envExample.includes(`# SCANTAP_CONTACT_EMAIL=${targets.contactEmail}`), ".env.example must document the pending contact mailbox.");

for (const command of ["check:secrets", "verify:production", "verify:supabase", "typecheck", "lint", "build"]) {
  check(workflow.includes(command), `CI is missing the ${command} gate.`);
}
check(workflow.includes("pnpm install --frozen-lockfile"), "CI must enforce the pnpm lockfile.");
check(workflow.includes("pnpm audit --prod --audit-level=high"), "CI must block high-severity production dependency advisories.");

check(nextConfig.includes("Content-Security-Policy"), "Public routes must receive a Content Security Policy.");
check(nextConfig.includes("frame-ancestors 'none'"), "The public CSP must prevent framing.");
check(nextConfig.includes('value: "DENY"'), "Legacy framing protection must deny all framing.");
check(proxy.includes("'strict-dynamic'"), "Protected routes must use a strict nonce-based script policy.");
check(proxy.includes('requestHeaders.set("x-nonce", nonce)'), "Protected route nonces must reach Next.js through request headers.");
check(proxy.includes("organizationSchemaJson"), "The protected CSP must authorize the exact JSON-LD payload by hash.");
check(layout.includes("organizationSchemaJson"), "The root layout must render only the hardened shared JSON-LD payload.");
check(deploymentVerifier.includes("login CSP has nonce"), "Deployment verification must prove the login nonce policy at runtime.");
check(deploymentVerifier.includes("CSP excludes unsafe eval"), "Deployment verification must reject unsafe eval in production.");

check(runbook.includes("Envoy"), "The runbook must account for the current Envoy gateway default.");
check(runbook.includes(targets.apiOrigin), "The runbook must name the intended API origin.");
check(runbook.includes(targets.siteOrigin), "The runbook must name the intended site origin.");
check(runbook.includes("domain has not been purchased"), "The runbook must retain the current domain-purchase blocker.");
check(capacityChecklist.includes("Stop here if the domain is still unpurchased"), "The capacity checklist must stop before unowned-domain cutover.");
check(capacityChecklist.includes("apply-migrations.sh --check"), "The capacity checklist must check migrations before applying them.");

check(runtimeOverrides.includes(`SUPABASE_PUBLIC_URL=${targets.apiOrigin}`), "Runtime overrides must use the intended Supabase public origin.");
check(runtimeOverrides.includes(`API_EXTERNAL_URL=${targets.apiOrigin}/auth/v1`), "Runtime overrides must use the current Auth external URL form.");
check(runtimeOverrides.includes(`SITE_URL=${targets.siteOrigin}`), "Runtime overrides must use the intended site origin.");

check(backupScript.includes("SCANTAP_BACKUP_CONFIRM"), "Backups must require an explicit apply confirmation.");
check(backupScript.includes("SCANTAP_BACKUP_AGE_RECIPIENT"), "Backups must be encrypted to an age recipient.");
check(backupScript.includes("SCANTAP_BACKUP_RCLONE_REMOTE"), "Backups must support an off-server destination.");
check(restoreScript.includes("_restore_drill"), "Restore tooling must refuse non-drill databases.");
check(restoreScript.includes("SCANTAP_RESTORE_DRILL_CONFIRM"), "Restore drills must require an explicit destructive confirmation.");

const failed = checks.filter((item) => !item.condition);
if (failed.length > 0) {
  for (const item of failed) console.error(`FAIL: ${item.message}`);
  console.error(`${failed.length} of ${checks.length} production contract checks failed.`);
  process.exit(1);
}

console.log(`Production contract verified: ${checks.length} checks passed.`);
