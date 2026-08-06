import { Building2, Check, MapPin } from "lucide-react";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { MessageBanner } from "@/components/product/product-ui";
import { createOrganizationAction } from "../actions";
import { loadMemberships } from "@/lib/workspace";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { memberships } = await loadMemberships();
  if (memberships.length > 0) redirect("/app");
  const params = await searchParams;

  return (
    <div className="onboarding-page">
      <div className="onboarding-brand"><BrandMark /></div>
      <section className="onboarding-copy">
        <span>Set up your first workspace</span>
        <h1>Start with the way your business is actually organized.</h1>
        <p>Create the organization first, then Scantap will add a starting location. You can invite people and narrow their access afterward.</p>
        <ul>
          <li><Check size={16} /> Organization-wide roles</li>
          <li><Check size={16} /> Location-specific assignments</li>
          <li><Check size={16} /> Review and integration permissions</li>
        </ul>
      </section>
      <form action={createOrganizationAction} className="onboarding-form">
        <div className="onboarding-form-heading"><Building2 size={21} /><div><h2>Create your organization</h2><p>You will begin as the owner.</p></div></div>
        <MessageBanner error={params.error} />
        <label htmlFor="organization-name">Organization name</label>
        <input autoFocus id="organization-name" name="name" placeholder="Northstar Coffee Group" required />
        <label htmlFor="first-location">First location</label>
        <div className="input-with-icon"><MapPin size={16} /><input id="first-location" name="first_location" placeholder="Main Street" required /></div>
        <button className="product-button primary" type="submit">Create workspace</button>
        <small>You can change organization rules and add more locations after setup.</small>
      </form>
    </div>
  );
}
