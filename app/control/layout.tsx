import type { Metadata } from "next";
import { ControlShell } from "@/components/control/control-shell";
import { requirePlatformStaff } from "@/lib/control";
import "./control.css";

export const metadata: Metadata = {
  title: { default: "Control center", template: "%s | Scantap control" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ControlLayout({ children }: { children: React.ReactNode }) {
  const { user, staff } = await requirePlatformStaff();
  return <ControlShell email={user.email ?? "Scantap operator"} staff={staff}>{children}</ControlShell>;
}
