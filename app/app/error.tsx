"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function ApplicationError({ reset }: { reset: () => void }) {
  return (
    <section className="product-state product-state-error">
      <AlertCircle aria-hidden="true" size={24} />
      <h1>This workspace did not load.</h1>
      <p>Your data was not changed. Try the request again; if it keeps failing, the connection may need attention.</p>
      <button className="product-button primary" onClick={reset} type="button"><RefreshCw size={16} /> Try again</button>
    </section>
  );
}
