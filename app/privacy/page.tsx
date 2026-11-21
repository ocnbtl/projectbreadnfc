import type { Metadata } from "next";
import { PrivacyChoicesPanel } from "@/components/privacy-choices";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Scantap handles website, account, and connected review data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="legal-page section-shell">
      <h1>Privacy</h1>
      <p className="legal-updated">Last updated November 20, 2026</p>
      <PrivacyChoicesPanel />
      <section>
        <h2>Optional website measurement</h2>
        <p>
          Measurement uses public page paths, selected link categories, short-lived reporting
          identifiers, and the heatmap or masked replay data you allow. Providers also receive
          normal connection information, such as IP address and browser type. Account details,
          form inputs, private page content, page-address queries, and referrers are excluded
          from our measurement payloads. PostHog is configured to use US hosting.
        </p>
        <p>
          Your choices apply to this browser. Read the{" "}
          <a href="https://policies.google.com/privacy" rel="noreferrer">Google privacy policy</a>{" "}
          and <a href="https://posthog.com/privacy" rel="noreferrer">PostHog privacy policy</a>{" "}
          for the providers’ own data-handling details.
        </p>
      </section>
      <section>
        <h2>Public website</h2>
        <p>
          The pilot planner runs in your browser and does not submit its answers to Scantap.
          The hosting provider may process standard request information such as IP address,
          browser type, requested page, and timestamps to deliver and secure the site.
        </p>
      </section>
      <section>
        <h2>Customer accounts</h2>
        <p>
          When account services are enabled, Scantap processes account email addresses,
          organization and location memberships, roles, rules, invitations, device records,
          and an audit history of administrative changes. Authentication and application data
          are stored through Supabase. Access is restricted by organization, location, and role.
        </p>
      </section>
      <section>
        <h2>Connected review sources</h2>
        <p>
          A business administrator must explicitly connect a supported provider. Google OAuth
          tokens are encrypted before server-side storage and are never sent to the browser.
          Google review content is cached only to operate the connected workspace and expires
          within 30 calendar days. Disconnecting an integration removes its stored credentials.
        </p>
      </section>
      <section>
        <h2>Replies and approvals</h2>
        <p>
          Scantap stores drafts, approval state, and provider receipts so authorized team members
          can coordinate a response. A reply is sent to Google only after an authorized person
          selects the publish action. Scantap does not claim a reply is public until the provider
          confirms its state.
        </p>
      </section>
      <section>
        <h2>Public demo</h2>
        <p>
          Names, reviews, locations, metrics, and device identifiers shown at /dashboard are
          fictional sample data. Demo changes are temporary and do not affect a business profile.
        </p>
      </section>
      <section>
        <h2>Current availability</h2>
        <p>
          The repository contains the customer application, but live account and Google provider
          services remain unavailable until the production database, credentials, and provider
          approvals are configured. This notice applies when those services are enabled.
        </p>
      </section>
    </article>
  );
}
