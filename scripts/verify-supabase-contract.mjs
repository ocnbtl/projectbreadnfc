import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const migrationsDirectory = path.join(repositoryRoot, "supabase", "migrations");

const failures = [];
let checkCount = 0;

function check(condition, message) {
  checkCount += 1;
  if (!condition) failures.push(message);
}

function escapeRegex(value) {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

const migrationNames = (await readdir(migrationsDirectory))
  .filter((name) => name.endsWith(".sql"))
  .sort((left, right) => left.localeCompare(right));

check(migrationNames.length > 0, "No Supabase migrations were found.");
check(
  migrationNames.every((name) => /^\d{14}_[a-z0-9_]+\.sql$/.test(name)),
  "Every migration must use a 14-digit timestamp and snake_case name.",
);
check(
  migrationNames.every((name, index) => index === 0 || name > migrationNames[index - 1]),
  "Migration filenames are not strictly increasing.",
);

const migrationEntries = await Promise.all(
  migrationNames.map(async (name) => ({
    name,
    sql: await readFile(path.join(migrationsDirectory, name), "utf8"),
  })),
);
const sql = migrationEntries.map((entry) => entry.sql).join("\n").toLowerCase();

check(!/auth\.role\s*\(/i.test(sql), "Do not use auth.role() as an application authorization boundary.");
check(
  /revoke\s+create\s+on\s+schema\s+public\s+from\s+public,\s*anon,\s*authenticated\s*;/i.test(sql),
  "The public schema must deny CREATE to browser roles.",
);
check(
  /alter\s+default\s+privileges\s+in\s+schema\s+public\s+revoke\s+execute\s+on\s+functions\s+from\s+public\s*;/i.test(sql),
  "Public functions need a deny-by-default EXECUTE posture.",
);
check(
  /alter\s+default\s+privileges\s+in\s+schema\s+private\s+revoke\s+execute\s+on\s+functions\s+from\s+public\s*;/i.test(sql),
  "Private functions need a deny-by-default EXECUTE posture.",
);

const tables = [
  ...sql.matchAll(/create\s+table\s+public\.([a-z0-9_]+)/gi),
].map((match) => match[1]);
check(tables.length > 0, "No public tables were detected.");

for (const table of new Set(tables)) {
  check(
    new RegExp(
      "alter\\s+table\\s+public\\." + escapeRegex(table) +
        "\\s+enable\\s+row\\s+level\\s+security\\s*;",
      "i",
    ).test(sql),
    "Table public." + table + " does not enable Row Level Security.",
  );
}

const views = [
  ...sql.matchAll(/create\s+view\s+public\.([a-z0-9_]+)/gi),
].map((match) => match[1]);

for (const view of new Set(views)) {
  check(
    new RegExp(
      "create\\s+view\\s+public\\." + escapeRegex(view) +
        "\\s+with\\s*\\(\\s*security_invoker\\s*=\\s*true\\s*\\)",
      "i",
    ).test(sql),
    "View public." + view + " is not explicitly security_invoker=true.",
  );
}

const functionStatements = [
  ...sql.matchAll(
    /create\s+or\s+replace\s+function\s+((?:public|private)\.[a-z0-9_]+)[\s\S]*?\n\$\$;/gi,
  ),
];

for (const match of functionStatements) {
  const statement = match[0];
  const functionName = match[1];
  if (!/security\s+definer/i.test(statement)) continue;

  check(
    /set\s+search_path\s*=\s*''/i.test(statement),
    "SECURITY DEFINER function " + functionName + " does not set an empty search_path.",
  );

  if (functionName.startsWith("public.")) {
    check(
      new RegExp(
        "revoke\\s+all\\s+on\\s+function\\s+" + escapeRegex(functionName) +
          "\\s*\\([\\s\\S]*?from\\s+public,\\s*anon\\s*;",
        "i",
      ).test(sql),
      "SECURITY DEFINER function " + functionName +
        " is not revoked from public and anon.",
    );
  }
}

for (const table of [
  "integration_credentials",
  "customer_accounts",
  "platform_tasks",
  "platform_events",
]) {
  check(
    new RegExp(
      "revoke\\s+all\\s+on\\s+public\\." + table +
        "\\s+from\\s+anon,\\s*authenticated\\s*;",
      "i",
    ).test(sql),
    "Server-only table public." + table + " is not revoked from browser roles.",
  );
}

for (const view of ["platform_customer_summaries", "platform_portfolio_pulse"]) {
  check(
    new RegExp(
      "revoke\\s+all\\s+on\\s+public\\." + view +
        "\\s+from\\s+anon,\\s*authenticated\\s*;",
      "i",
    ).test(sql),
    "Server-only view public." + view + " is not revoked from browser roles.",
  );
  check(
    new RegExp(
      "grant\\s+select\\s+on\\s+public\\." + view +
        "\\s+to\\s+service_role\\s*;",
      "i",
    ).test(sql),
    "Server-only view public." + view + " is not explicitly granted to service_role.",
  );
}

check(
  /drop\s+policy\s+if\s+exists\s+reply_drafts_update_responders\s+on\s+public\.reply_drafts\s*;/i.test(sql),
  "The permissive reply draft update policy has not been removed.",
);
check(
  /revoke\s+update\s+on\s+public\.reply_drafts\s+from\s+authenticated\s*;/i.test(sql),
  "Authenticated clients must not transition reply draft state directly.",
);
check(
  /revoke\s+insert\s+on\s+public\.reply_drafts\s+from\s+authenticated\s*;/i.test(sql),
  "Reply draft insert privileges must be narrowed before column grants are applied.",
);
check(
  /grant\s+insert\s*\([\s\S]*?organization_id[\s\S]*?location_id[\s\S]*?review_id[\s\S]*?body[\s\S]*?state[\s\S]*?created_by[\s\S]*?\)\s+on\s+public\.reply_drafts\s+to\s+authenticated\s*;/i.test(sql),
  "Authenticated reply draft inserts must use the approved column allowlist.",
);

const envExample = await readFile(path.join(repositoryRoot, ".env.example"), "utf8");
check(
  !/^NEXT_PUBLIC_.*(?:SECRET|PRIVATE|PASSWORD|SERVICE_ROLE)/im.test(envExample),
  "A secret-looking environment variable is marked NEXT_PUBLIC_.",
);

const gitignore = await readFile(path.join(repositoryRoot, ".gitignore"), "utf8");
check(/^\.env\*$/m.test(gitignore), ".gitignore must exclude local .env files.");
check(/^!\.env\.example$/m.test(gitignore), ".gitignore must keep only .env.example trackable.");

if (failures.length > 0) {
  console.error(
    "Supabase contract verification failed with " + failures.length + " issue(s):",
  );
  failures.forEach((failure) => console.error("- " + failure));
  process.exitCode = 1;
} else {
  console.log(
    "Supabase contract verification passed: " + checkCount + " checks across " +
      migrationNames.length + " migrations.",
  );
}
