import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const tracked = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
  },
)
  .split("\0")
  .filter(Boolean);

const ignoredExtensions = new Set([
  ".avif", ".gif", ".ico", ".jpeg", ".jpg", ".lock", ".pdf", ".png",
  ".webm", ".woff", ".woff2", ".zip",
]);

const findings = [];
const assignmentNames = [
  "AWS_SECRET_ACCESS_KEY",
  "CRON_SECRET",
  "GOOGLE_CLIENT_SECRET",
  "INTEGRATION_ENCRYPTION_KEY",
  "POSTGRES_PASSWORD",
  "SMTP_PASS",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const assignmentPattern = new RegExp(
  "^\\s*(" + assignmentNames.join("|") + ")\\s*=\\s*(.*?)\\s*$",
);

const credentialPatterns = [
  ["private-key", /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/],
  ["github-token", /\bgh(?:p|o|u|s|r)_[A-Za-z0-9]{36,}\b/],
  ["google-api-key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["aws-access-key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ["slack-token", /\bxox[baprs]-[0-9A-Za-z-]{20,}\b/],
  ["stripe-live-secret", /\bsk_live_[0-9A-Za-z]{20,}\b/],
  ["credentialed-database-url", /\bpostgres(?:ql)?:\/\/[^\s/:]+:[^\s/@]+@/i],
];

function isPlaceholder(value) {
  const normalized = value.trim().replace(/^['"]|['"]$/g, "");
  return (
    normalized === "" ||
    /^(?:changeme|example|placeholder|replace|todo|your[-_])/i.test(normalized) ||
    normalized.includes("<") ||
    normalized.includes("${") ||
    normalized.includes("process.env") ||
    normalized.startsWith("env(")
  );
}

function inspectJwt(value, file, lineNumber) {
  for (const match of value.matchAll(/\beyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+\b/g)) {
    try {
      const payload = JSON.parse(Buffer.from(match[1], "base64url").toString("utf8"));
      if (payload?.role === "service_role") {
        findings.push({ category: "supabase-service-role-jwt", file, lineNumber });
      }
    } catch {
      // A JWT-like string that is not decodable is not a high-confidence secret finding.
    }
  }
}

for (const file of tracked) {
  const normalized = file.replaceAll("\\", "/");
  if (
    /(^|\/)\.env(?:\.|$)/.test(normalized) &&
    !normalized.endsWith(".example") &&
    normalized !== ".env.example"
  ) {
    findings.push({ category: "tracked-environment-file", file, lineNumber: 1 });
  }

  if (ignoredExtensions.has(path.extname(file).toLowerCase())) continue;

  let contents;
  try {
    contents = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (contents.includes("\u0000")) continue;

  const lines = contents.split(/\r?\n/);
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    for (const [category, pattern] of credentialPatterns) {
      if (pattern.test(line)) findings.push({ category, file, lineNumber });
    }

    const assignment = line.match(assignmentPattern);
    if (assignment && !isPlaceholder(assignment[2])) {
      findings.push({
        category: "nonempty-server-secret-assignment",
        file,
        lineNumber,
      });
    }

    inspectJwt(line, file, lineNumber);
  });
}

const unique = [
  ...new Map(
    findings.map((finding) => [
      `${finding.category}:${finding.file}:${finding.lineNumber}`,
      finding,
    ]),
  ).values(),
];

if (unique.length > 0) {
  console.error("High-confidence credential patterns were detected. Values are intentionally omitted.");
  for (const finding of unique) {
    console.error(`- ${finding.category}: ${finding.file}:${finding.lineNumber}`);
  }
  process.exit(1);
}

console.log(`Secret scan passed for ${tracked.length} repository source files.`);
