import { randomBytes, randomUUID } from "node:crypto";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const run = process.argv.includes("--run");
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== "--run");
if (unknownArguments.length > 0) {
  throw new Error("Unknown argument(s): " + unknownArguments.join(", "));
}
if (!run) {
  throw new Error(
    "Live RLS tests create and remove temporary records. Re-run with --run after reading the operations runbook.",
  );
}

const urlValue = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publishableKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)?.trim();
const secretKey = (
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
)?.trim();

if (!urlValue || !publishableKey || !secretKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SECRET_KEY are required.",
  );
}

const target = new URL(urlValue);
const expectedOrigin = process.env.SCANTAP_RLS_TEST_EXPECTED_ORIGIN?.trim();
if (expectedOrigin !== target.origin) {
  throw new Error(
    "SCANTAP_RLS_TEST_EXPECTED_ORIGIN must exactly match the Supabase origin.",
  );
}
if (process.env.SCANTAP_RLS_TEST_CONFIRM !== "RUN TEMPORARY RLS TESTS") {
  throw new Error(
    "SCANTAP_RLS_TEST_CONFIRM must equal RUN TEMPORARY RLS TESTS.",
  );
}

const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
if (
  !localHosts.has(target.hostname) &&
  process.env.SCANTAP_RLS_TEST_ALLOW_REMOTE !== "YES"
) {
  throw new Error(
    "Remote RLS testing also requires SCANTAP_RLS_TEST_ALLOW_REMOTE=YES.",
  );
}

const admin = createClient(target.origin, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const clientOptions = {
  auth: { autoRefreshToken: false, persistSession: false },
};

const createdUserIds = [];
const createdOrganizationIds = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function requireData(result, message) {
  if (result.error || result.data === null || result.data === undefined) {
    throw new Error(message + (result.error ? ": " + result.error.message : ""));
  }
  return result.data;
}

async function createTemporaryUser(label, suffix) {
  const email = "scantap-rls-" + label + "-" + suffix + "@example.invalid";
  const password = randomBytes(24).toString("base64url");
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Scantap RLS " + label.toUpperCase() },
  });
  const user = await requireData(created, "Temporary Auth user creation failed");
  createdUserIds.push(user.user.id);

  const client = createClient(target.origin, publishableKey, clientOptions);
  const signedIn = await client.auth.signInWithPassword({ email, password });
  await requireData(signedIn, "Temporary Auth sign-in failed");
  return { client, userId: user.user.id };
}

async function createOrganization(client, label, suffix) {
  const created = await client.rpc("create_organization", {
    organization_name: "RLS " + label.toUpperCase() + " " + suffix,
    organization_slug: "rls-" + label + "-" + suffix,
    first_location_name: "Test location",
  });
  const organizationId = await requireData(
    created,
    "Temporary organization creation failed",
  );
  createdOrganizationIds.push(organizationId);

  const location = await client
    .from("locations")
    .select("id")
    .eq("organization_id", organizationId)
    .single();
  const locationRow = await requireData(location, "Temporary location lookup failed");
  return { organizationId, locationId: locationRow.id };
}

let testFailure;

try {
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const userA = await createTemporaryUser("a", suffix);
  const userB = await createTemporaryUser("b", suffix);
  const tenantA = await createOrganization(userA.client, "a", suffix);
  const tenantB = await createOrganization(userB.client, "b", suffix);

  const crossOrganization = await userA.client
    .from("organizations")
    .select("id")
    .eq("id", tenantB.organizationId)
    .maybeSingle();
  assert(!crossOrganization.error, "Cross-tenant organization query errored unexpectedly.");
  assert(crossOrganization.data === null, "Tenant A could read Tenant B's organization.");

  const crossMembership = await userA.client
    .from("organization_memberships")
    .select("user_id")
    .eq("organization_id", tenantB.organizationId);
  assert(!crossMembership.error, "Cross-tenant membership query errored unexpectedly.");
  assert(
    crossMembership.data.length === 0,
    "Tenant A could read Tenant B's memberships.",
  );

  const device = await admin
    .from("devices")
    .insert({
      organization_id: tenantB.organizationId,
      location_id: tenantB.locationId,
      serial_number: "RLS-" + suffix,
      name: "Isolation device",
      product_type: "counter_stand",
    })
    .select("id")
    .single();
  const deviceRow = await requireData(device, "Temporary device creation failed");

  const crossDevice = await userA.client
    .from("devices")
    .select("id")
    .eq("id", deviceRow.id)
    .maybeSingle();
  assert(!crossDevice.error, "Cross-tenant device query errored unexpectedly.");
  assert(crossDevice.data === null, "Tenant A could read Tenant B's device.");

  const secretRead = await userA.client
    .from("integration_credentials")
    .select("integration_id")
    .limit(1);
  assert(Boolean(secretRead.error), "Browser role could query integration credentials.");

  const platformRead = await userA.client
    .from("customer_accounts")
    .select("organization_id")
    .limit(1);
  assert(Boolean(platformRead.error), "Browser role could query platform customer accounts.");

  const selfPromotion = await userA.client.from("platform_staff").insert({
    user_id: userA.userId,
    role: "owner",
    display_name: "Unauthorized owner",
    active: true,
  });
  assert(Boolean(selfPromotion.error), "Customer account could self-assign platform access.");

  const review = await admin
    .from("reviews")
    .insert({
      organization_id: tenantA.organizationId,
      location_id: tenantA.locationId,
      provider: "google_business_profile",
      external_review_id: "rls-review-" + suffix,
      author_name: "Isolation test",
      rating: 5,
      body: "Temporary RLS verification record.",
      review_created_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  const reviewRow = await requireData(review, "Temporary review creation failed");

  const draft = await userA.client
    .from("reply_drafts")
    .insert({
      organization_id: tenantA.organizationId,
      location_id: tenantA.locationId,
      review_id: reviewRow.id,
      body: "Temporary reply draft.",
      state: "pending_approval",
      created_by: userA.userId,
    })
    .select("id")
    .single();
  const draftRow = await requireData(draft, "Temporary reply draft creation failed");

  const directApproval = await userA.client
    .from("reply_drafts")
    .update({ state: "approved" })
    .eq("id", draftRow.id);
  assert(Boolean(directApproval.error), "Browser role could transition reply draft state.");

  console.log(
    "Live RLS verification passed: tenant isolation, secret tables, platform access, and reply state denial.",
  );
} catch (error) {
  testFailure = error;
} finally {
  for (const organizationId of createdOrganizationIds.reverse()) {
    const result = await admin.from("organizations").delete().eq("id", organizationId);
    if (result.error && !testFailure) {
      testFailure = new Error("Temporary organization cleanup failed.");
    }
  }
  for (const userId of createdUserIds.reverse()) {
    const result = await admin.auth.admin.deleteUser(userId);
    if (result.error && !testFailure) {
      testFailure = new Error("Temporary Auth user cleanup failed.");
    }
  }
}

if (testFailure) throw testFailure;
