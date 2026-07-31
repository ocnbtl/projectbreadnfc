import type { Metadata } from "next";
import { PilotPlanner } from "@/components/pilot-planner";

export const metadata: Metadata = {
  title: "Plan a Scantap pilot",
  description:
    "Build a small, practical Scantap pilot outline without submitting business information.",
};

export default function PilotPage() {
  return (
    <section className="pilot-page section-shell">
      <div className="pilot-intro">
        <h1>Plan the smallest pilot that can teach you something useful.</h1>
        <p>
          Choose the hardware, the first job the dashboard should handle, and
          how many locations to include. You can copy or download the outline
          when you are done.
        </p>
      </div>
      <PilotPlanner />
      <div className="pilot-note">
        <h2>What happens before a real pilot starts</h2>
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
