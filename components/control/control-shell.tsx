/**
 * THESIS: The owner sees platform intervention work, not a duplicate customer task list.
 * OWN-WORLD: Graphite rail, cobalt actions, white ledger, cool steel canvas.
 * STORY: Read the pulse, resolve an issue, inspect an organization, take action.
 * FIRST VIEWPORT: Portfolio pulse, action ledger, and account health.
 * FORM: Operations control deck; grounded candidate 3, surface seed 1fda6e71.
 */
import {
  BarChart3,
  Building2,
  CircleHelp,
  Film,
  Gauge,
  LogOut,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { signOutAction } from "@/app/control/actions";
import { platformRoleLabel, type PlatformStaff } from "@/lib/control";

const destinations = [
  { href: "#pulse", label: "Pulse", icon: Gauge },
  { href: "#accounts", label: "Accounts", icon: Building2 },
  { href: "#staff", label: "Staff", icon: UserCog },
  { href: "#activity", label: "Activity", icon: BarChart3 },
  { href: "#walkthrough", label: "Walkthrough", icon: Film },
];

export function ControlShell({
  children,
  email,
  staff,
}: {
  children: React.ReactNode;
  email: string;
  staff: PlatformStaff;
}) {
  const displayName = staff.display_name || email.split("@")[0] || "Operator";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="control-app">
      <aside className="control-rail">
        <div className="control-brand"><BrandMark compact /></div>
        <div className="control-mode"><ShieldCheck size={15} /> Platform operations</div>
        <nav aria-label="Control center navigation" className="control-nav">
          {destinations.map((destination) => (
            <a aria-label={destination.label} href={destination.href} key={destination.href}>
              <destination.icon aria-hidden="true" size={18} />
              <span>{destination.label}</span>
            </a>
          ))}
        </nav>
        <Link className="control-support" href="/">
          <CircleHelp size={17} /><span>Public website</span>
        </Link>
        <div className="control-identity">
          <span className="control-avatar" aria-hidden="true">{initials}</span>
          <div><strong>{displayName}</strong><small>{platformRoleLabel(staff.role)}</small></div>
          <form action={signOutAction}>
            <button aria-label="Log out" title="Log out" type="submit"><LogOut size={17} /></button>
          </form>
        </div>
      </aside>
      <div className="control-stage">
        <header className="control-topbar">
          <div><span>Scantap</span><strong>Business control center</strong></div>
          <div className="control-topbar-actions"><div className="control-live"><span /> Current system snapshot</div><form action={signOutAction} className="control-topbar-signout"><button aria-label="Log out" title="Log out" type="submit"><LogOut size={17} /></button></form></div>
        </header>
        <div className="control-canvas">{children}</div>
      </div>
    </div>
  );
}
