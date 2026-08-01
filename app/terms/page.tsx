import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Scantap website and demo terms.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="legal-page section-shell">
      <h1>Website and demo terms</h1>
      <p className="legal-updated">Last updated July 31, 2026</p>
      <section>
        <h2>Informational website</h2>
        <p>
          This website describes the planned Scantap product and pilot. It is
          not currently an online store, a binding quote, or a guarantee that a
          particular hardware format, integration, delivery date, or price is
          available.
        </p>
      </section>
      <section>
        <h2>Interactive dashboard</h2>
        <p>
          The dashboard is a product demonstration using fictional data. Its
          filters, drafts, exports, device checks, and settings are provided for
          evaluation and do not publish replies, contact customers, or update a
          real business profile.
        </p>
      </section>
      <section>
        <h2>Third-party destinations</h2>
        <p>
          Google, Google Business Profile, and other third-party services are
          governed by their own terms and policies. Scantap is not affiliated
          with or endorsed by Google.
        </p>
      </section>
      <section>
        <h2>Before a paid pilot</h2>
        <p>
          Any paid pilot will require separate written details covering
          hardware, activation, pricing, taxes, delivery, refunds or warranty,
          support, data handling, and the responsibilities of both parties.
        </p>
      </section>
    </article>
  );
}
