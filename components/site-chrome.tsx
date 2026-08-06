"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProductApp =
    pathname.startsWith("/app") ||
    pathname.startsWith("/control") ||
    pathname.startsWith("/invite");

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {!isProductApp && <SiteHeader />}
      <main id="main-content">{children}</main>
      {!isProductApp && <SiteFooter />}
    </>
  );
}
