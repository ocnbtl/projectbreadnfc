import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Scantap website, demo, and connected workspace terms.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="legal-page section-shell">
      <h1>Website and workspace terms</h1>
      <p className="legal-updated">Last updated August 5, 2026</p>
      <section>
        <h2>Informational website</h2>
        <p>
          This website describes Scantap products and pilots. It is not currently an online
          store, a binding quote, or a guarantee that a particular hardware format, integration,
          delivery date, or price is available.
        </p>
      </section>
      <section>
        <h2>Customer workspace</h2>
        <p>
          Organization owners control membership, roles, location access, and review rules.
          Customers are responsible for keeping access current and for ensuring that people who
          publish replies are authorized to represent the business.
        </p>
      </section>
      <section>
        <h2>Public dashboard demo</h2>
        <p>
          The dashboard at /dashboard uses fictional data. Its filters, drafts, exports, device
          checks, and settings are provided for evaluation and do not update a real business profile.
        </p>
      </section>
      <section>
        <h2>Third-party services</h2>
        <p>
          Google, Google Business Profile, and other services are governed by their own terms and
          policies. Scantap is not affiliated with or endorsed by Google. Provider access can change,
          and provider moderation determines whether a submitted reply becomes public.
        </p>
      </section>
      <section>
        <h2>Before a paid pilot</h2>
        <p>
          Any paid pilot will require separate written details covering hardware, activation,
          pricing, taxes, delivery, refunds or warranty, support, data handling, and the
          responsibilities of both parties.
        </p>
      </section>
    </article>
  );
}
