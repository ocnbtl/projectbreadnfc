import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PageHero({
  title,
  description,
  primary = { label: "See the dashboard", href: "/dashboard" },
  secondary,
  children,
}: {
  title: string;
  description: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  children?: React.ReactNode;
}) {
  return (
    <section className="page-hero section-shell">
      <div className="page-hero-copy">
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="button-row">
          <Link className="button button-primary" href={primary.href}>
            {primary.label} <ArrowRight size={17} />
          </Link>
          {secondary && (
            <Link className="button button-secondary" href={secondary.href}>
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
      {children && <div className="page-hero-visual">{children}</div>}
    </section>
  );
}
