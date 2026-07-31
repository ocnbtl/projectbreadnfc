import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="not-found section-shell">
      <span>404</span>
      <h1>This page is not part of the signal.</h1>
      <p>The link may have changed, or the page has not been published.</p>
      <Link className="button button-primary" href="/">
        <ArrowLeft size={17} /> Return home
      </Link>
    </section>
  );
}
