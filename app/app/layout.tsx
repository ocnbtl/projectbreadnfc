import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ProductAppShell } from "@/components/product/app-shell";
import { loadMemberships } from "@/lib/workspace";

export const metadata: Metadata = {
  title: { default: "Workspace", template: "%s | Scantap" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ApplicationLayout({ children }: { children: React.ReactNode }) {
  const { user, memberships } = await loadMemberships();
  if (memberships.length === 0) {
    return <div className="product-onboarding-frame">{children}</div>;
  }

  const cookieStore = await cookies();
  const selectedId = cookieStore.get("scantap-organization")?.value;
  const selected = memberships.find((item) => item.organizationId === selectedId) ?? memberships[0];

  return (
    <ProductAppShell email={user.email ?? "Account"} memberships={memberships} selected={selected}>
      {children}
    </ProductAppShell>
  );
}
