import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard-app";

export const metadata: Metadata = {
  title: "Interactive reputation dashboard",
  description:
    "Explore the Scantap demo workspace for review activity, response work, insights, requests, locations, and NFC device health.",
};

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-intro section-shell">
        <div>
          <h1>One place to see what changed and what needs your attention.</h1>
          <p>
            This working demo uses sample data. Try the filters, select a review,
            draft a reply, create a request draft, export the inbox, and run the
            connection check on the offline device.
          </p>
        </div>
        <span>Interactive demo · No customer data</span>
      </div>
      <DashboardApp />
    </div>
  );
}
