import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Scantap website privacy information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="legal-page section-shell">
      <h1>Privacy</h1>
      <p className="legal-updated">Last updated July 31, 2026</p>
      <section>
        <h2>What this website currently collects</h2>
        <p>
          The current Scantap website does not provide account registration,
          payment, or a connected contact form. The pilot planner runs in your
          browser and does not submit its answers to Scantap.
        </p>
      </section>
      <section>
        <h2>Demo dashboard data</h2>
        <p>
          Names, reviews, locations, metrics, and device identifiers shown in
          the dashboard are fictional sample data. Changes made in the demo are
          temporary and are not a connection to a Google Business Profile.
        </p>
      </section>
      <section>
        <h2>Hosting and technical logs</h2>
        <p>
          The hosting provider may process standard request information such as
          IP address, browser type, requested page, and timestamps to deliver
          and secure the site. Scantap will update this notice before adding
          analytics, lead forms, accounts, or customer integrations.
        </p>
      </section>
      <section>
        <h2>Customer data before launch</h2>
        <p>
          A production dashboard will require a separate, more detailed privacy
          notice covering connected review sources, business users, retention,
          security, and service providers. The demo does not make that future
          system live.
        </p>
      </section>
    </article>
  );
}
