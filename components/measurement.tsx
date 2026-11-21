"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
export function Measurement() {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (pathname !== "/" && pathname !== "/products") return;
    let dispose: (() => void) | undefined; let ended = false;
    void import("@/lib/measurement-runtime").then(({startMeasurement}) => { if (!ended) dispose = startMeasurement(href => router.push(href)); });
    return () => { ended = true; dispose?.(); };
  }, [pathname, router]);
  return null;
}
