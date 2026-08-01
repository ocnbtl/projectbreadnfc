"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "./brand-mark";

const primaryLinks = [
  { href: "/products", label: "Products" },
  { href: "/dashboard", label: "Dashboard" },
];

const resourceLinks = [
  { href: "/industries", label: "Industries", description: "Ideas for the way your business serves customers" },
  { href: "/locations", label: "Locations", description: "Local guidance for Greater Cincinnati" },
  { href: "/resources", label: "Blog", description: "Practical review and reputation guides" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const resourcesActive = resourceLinks.some((item) => pathname.startsWith(item.href));

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <BrandMark />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {primaryLinks.map((item) => (
            <Link className={pathname.startsWith(item.href) ? "is-active" : ""} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <details className={`resources-menu ${resourcesActive ? "is-active" : ""}`}>
            <summary>Resources <ChevronDown aria-hidden="true" size={14} /></summary>
            <div className="resources-popover">
              {resourceLinks.map((item) => (
                <Link href={item.href} key={item.href}>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </Link>
              ))}
            </div>
          </details>
          <Link className={pathname.startsWith("/about") ? "is-active" : ""} href="/about">
            About
          </Link>
        </nav>
        <div className="header-actions">
          <Link className="button button-quiet desktop-action" href="/#how-it-works">
            See how it works
          </Link>
          <Link className="button button-primary desktop-action" href="/login">
            Log in
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
          {primaryLinks.map((item) => (
            <Link href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
          <details className="mobile-resources-menu">
            <summary>Resources <ChevronDown aria-hidden="true" size={15} /></summary>
            <div>
              {resourceLinks.map((item) => (
                <Link href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
              ))}
            </div>
          </details>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          <Link className="button button-quiet" href="/#how-it-works" onClick={() => setOpen(false)}>See how it works</Link>
          <Link className="button button-primary" href="/login" onClick={() => setOpen(false)}>Log in</Link>
        </nav>
      )}
    </header>
  );
}
