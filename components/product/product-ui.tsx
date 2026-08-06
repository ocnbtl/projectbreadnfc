import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle2, Star } from "lucide-react";

export function ProductPageHeader({
  title,
  description,
  context,
  actions,
}: {
  title: string;
  description: string;
  context?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="product-page-header">
      <div>
        {context ? <span className="product-page-context">{context}</span> : null}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="product-page-actions">{actions}</div> : null}
    </header>
  );
}

export function MessageBanner({ error, notice }: { error?: string; notice?: string }) {
  if (!error && !notice) return null;
  const isError = Boolean(error);
  return (
    <div className={`product-app-message ${isError ? "error" : "notice"}`} role={isError ? "alert" : "status"}>
      {isError ? <AlertCircle aria-hidden="true" size={18} /> : <CheckCircle2 aria-hidden="true" size={18} />}
      <span>{error || notice}</span>
    </div>
  );
}

export function ProductEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="product-empty-state">
      <span><Icon aria-hidden="true" size={21} /></span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function RatingStars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} className="product-stars">
      {Array.from({ length: 5 }, (_, index) => (
        <Star aria-hidden="true" fill={index < rating ? "currentColor" : "none"} key={index} size={14} />
      ))}
    </span>
  );
}
