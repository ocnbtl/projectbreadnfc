"use client";

import {
  ChartNoAxesCombined,
  Link2,
  MapPin,
  MessageSquareText,
  Radio,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const destinations = [
  { href: "/app", label: "Overview", icon: ChartNoAxesCombined, exact: true },
  { href: "/app/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/app/locations", label: "Locations", icon: MapPin },
  { href: "/app/devices", label: "Devices", icon: Radio },
  { href: "/app/team", label: "Team", icon: Users },
  { href: "/app/integrations", label: "Integrations", icon: Link2 },
  { href: "/app/settings", label: "Rules", icon: Settings },
];

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Workspace navigation" className="product-nav">
      {destinations.map((destination) => {
        const active = destination.exact
          ? pathname === destination.href
          : pathname.startsWith(destination.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            aria-label={destination.label}
            href={destination.href}
            key={destination.href}
            title={destination.label}
          >
            <destination.icon aria-hidden="true" size={18} />
            <span>{destination.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
