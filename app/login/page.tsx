import type { Metadata } from "next";
import { Check } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Workspace login",
  description: "Log in to your Scantap workspace or explore the public dashboard demo.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return (
    <section className="login-page section-shell">
      <div className="login-copy">
        <h1>Manage your reviews, locations, and team in one place.</h1>
        <p>
          One workspace for the review work that needs attention, with access
          shaped around each organization and location.
        </p>
        <ul className="check-list">
          <li><Check size={17} /> See recent reviews and response status</li>
          <li><Check size={17} /> Keep organization and location access clear</li>
          <li><Check size={17} /> Monitor Scantap device activity</li>
        </ul>
      </div>
      <LoginForm configured={isSupabaseConfigured()} next={params.next} />
    </section>
  );
}
