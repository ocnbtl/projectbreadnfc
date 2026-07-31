import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand-mark" href="/" aria-label="Scantap home">
      <span className="brand-signal" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {!compact && <span className="brand-word">scantap</span>}
    </Link>
  );
}
