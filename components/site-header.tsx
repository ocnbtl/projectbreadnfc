"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "./brand-mark";
import { navItems } from "@/lib/site-data";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <BrandMark />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              className={pathname.startsWith(item.href) ? "is-active" : ""}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="button button-quiet desktop-action" href="/pilot">
            Plan a pilot
          </Link>
          <Link className="button button-primary desktop-action" href="/dashboard">
            See the dashboard
          </Link>
          <button
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="mobile-menu-button"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link className="button button-quiet" href="/pilot" onClick={() => setOpen(false)}>
            Plan a pilot
          </Link>
          <Link className="button button-primary" href="/dashboard" onClick={() => setOpen(false)}>
            See the dashboard
          </Link>
        </nav>
      )}
    </header>
  );
}
