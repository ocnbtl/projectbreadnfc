import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function DirectoryCard({
  href,
  title,
  description,
  meta,
}: {
  href: string;
  title: string;
  description: string;
  meta?: string;
}) {
  return (
    <Link className="directory-card" href={href}>
      {meta && <span>{meta}</span>}
      <h2>{title}</h2>
      <p>{description}</p>
      <span className="directory-card-link">
        Explore <ArrowRight size={16} />
      </span>
    </Link>
  );
}
