import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const apply = process.argv.includes("--apply");
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== "--apply");

if (unknownArguments.length > 0) {
  throw new Error("Unknown argument(s): " + unknownArguments.join(", "));
}

const urlValue = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const secretKey = (
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
)?.trim();
const ownerEmail = process.env.SCANTAP_OWNER_EMAIL?.trim().toLowerCase();
const displayName = process.env.SCANTAP_OWNER_DISPLAY_NAME?.trim();

if (!urlValue || !secretKey || !ownerEmail || !displayName) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, SCANTAP_OWNER_EMAIL, and SCANTAP_OWNER_DISPLAY_NAME are required.",
  );
}
if (displayName.length < 2 || displayName.length > 120) {
  throw new Error("SCANTAP_OWNER_DISPLAY_NAME must contain 2 to 120 characters.");
}

const target = new URL(urlValue);
const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
if (target.protocol !== "https:" && !localHosts.has(target.hostname)) {
  throw new Error("Owner bootstrap refuses a non-HTTPS remote Supabase URL.");
}
if (apply && process.env.SCANTAP_OWNER_BOOTSTRAP_CONFIRM !== "YES") {
  throw new Error(
    "Apply mode also requires SCANTAP_OWNER_BOOTSTRAP_CONFIRM=YES. Run without --apply first.",
  );
}

const supabase = createClient(target.origin, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const matches = [];
const perPage = 200;
for (let page = 1; page <= 50; page += 1) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
  if (error) throw new Error("Auth lookup failed: " + error.message);

  for (const user of data.users) {
    if (user.email?.trim().toLowerCase() === ownerEmail) matches.push(user);
  }

  if (data.users.length < perPage) break;
  if (page === 50) {
    throw new Error("Auth lookup exceeded the bounded pagination limit.");
  }
}

if (matches.length !== 1) {
  throw new Error(
    matches.length === 0
      ? "No existing Auth user matched SCANTAP_OWNER_EMAIL."
      : "More than one Auth user matched SCANTAP_OWNER_EMAIL.",
  );
}

const userId = matches[0].id;
const { data: existing, error: existingError } = await supabase
  .from("platform_staff")
  .select("user_id, role, display_name, active")
  .eq("user_id", userId)
  .maybeSingle();

if (existingError) {
  throw new Error("Platform staff lookup failed: " + existingError.message);
}

const alreadyCorrect =
  existing?.role === "owner" &&
  existing?.display_name === displayName &&
  existing?.active === true;

if (alreadyCorrect) {
  console.log("Owner bootstrap is already in the requested state; no change is required.");
  process.exit(0);
}

if (!apply) {
  console.log(
    existing
      ? "Dry run: one Auth user matched. The existing platform role is " +
          existing.role + " and would be set to active owner."
      : "Dry run: one Auth user matched. A new active platform owner row would be created.",
  );
  console.log("Re-run with --apply and SCANTAP_OWNER_BOOTSTRAP_CONFIRM=YES to apply.");
  process.exit(0);
}

const { error: upsertError } = await supabase.from("platform_staff").upsert(
  {
    user_id: userId,
    role: "owner",
    display_name: displayName,
    active: true,
  },
  { onConflict: "user_id" },
);

if (upsertError) {
  throw new Error("Owner bootstrap failed: " + upsertError.message);
}

console.log("Owner bootstrap applied successfully. No credentials or user identifiers were printed.");
