import type { Metadata } from "next";
import { PilotPlanner } from "@/components/pilot-planner";

export const metadata: Metadata = {
  title: "Plan your Scantap setup",
  description:
    "Build a small, practical Scantap pilot outline without submitting business information.",
  alternates: { canonical: "/pilot" },
};

export default function PilotPage() {
  return (
    <section className="pilot-page section-shell">
      <div className="pilot-intro">
        <h1>Tell us how your business works. We will map the first setup.</h1>
        <p>
          Choose the product, the first dashboard job, and the number of
          locations. You can copy or download a starting outline when you finish.
        </p>
      </div>
      <PilotPlanner />
      <div className="pilot-note">
        <h2>What we confirm before anything goes live</h2>
        <div>
          <p>
            Scantap still needs to confirm the business&apos;s Google review
            destination, final hardware quantity, supplier lead time, device
            testing, and a working support contact. This page intentionally
            does not pretend an order or message was submitted.
          </p>
        </div>
      </div>
    </section>
  );
}
