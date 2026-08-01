import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard-app";

export const metadata: Metadata = {
  title: "Interactive reputation dashboard",
  description: "Try the Scantap public dashboard demo for review activity, replies, locations, and NFC device health.",
};

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-intro section-shell">
        <div>
          <h1>See the reviews, replies, and devices that need your attention.</h1>
          <p>
            This public demo uses sample data. Change the filters, open a review,
            write a reply, compare locations, and run a device check to see how
            the customer dashboard will work.
          </p>
        </div>
        <span>Interactive demo · Sample data only</span>
      </div>
      <DashboardApp />
    </div>
  );
}
