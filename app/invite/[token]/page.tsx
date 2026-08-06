import { Check, ShieldCheck, Users } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { MessageBanner } from "@/components/product/product-ui";
import { acceptInvitationAction } from "@/app/app/actions";
import { requireAuthenticatedUser } from "@/lib/workspace";

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ token }, query, { user }] = await Promise.all([
    params,
    searchParams,
    requireAuthenticatedUser(),
  ]);

  return (
    <main className="invitation-page">
      <BrandMark />
      <section>
        <span className="invitation-icon"><Users size={22} /></span>
        <h1>Join this Scantap organization</h1>
        <p>You are signed in as <strong>{user.email}</strong>. Scantap will only accept the invitation if that address matches the one the administrator invited.</p>
        <MessageBanner error={query.error} />
        <ul><li><Check size={16} /> Organization role applied</li><li><Check size={16} /> Location access enforced</li><li><ShieldCheck size={16} /> Acceptance recorded in the audit log</li></ul>
        <form action={acceptInvitationAction}><input name="token" type="hidden" value={token} /><button className="product-button primary" type="submit">Accept invitation</button></form>
      </section>
    </main>
  );
}
