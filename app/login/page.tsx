import type { Metadata } from "next";
import { Check } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Customer login",
  description: "Log in to your Scantap customer dashboard or explore the public dashboard demo.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <section className="login-page section-shell">
      <div className="login-copy">
        <h1>Your reviews, replies, locations, and devices—together.</h1>
        <p>
          The customer workspace is being prepared for live accounts. The
          public demo already shows how the main tools will work.
        </p>
        <ul className="check-list">
          <li><Check size={17} /> See recent reviews and response status</li>
          <li><Check size={17} /> Compare locations and customer themes</li>
          <li><Check size={17} /> Monitor Scantap device activity</li>
        </ul>
      </div>
      <LoginForm />
    </section>
  );
}
