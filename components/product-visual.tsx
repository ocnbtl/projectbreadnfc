import { Radio, QrCode } from "lucide-react";

export function ProductVisual({
  type,
  dark = false,
}: {
  type: "stand" | "plate" | "card";
  dark?: boolean;
}) {
  return (
    <div className={`product-stage product-stage-${type}`}>
      <div className={`product-object product-${type} ${dark ? "is-dark" : ""}`}>
        <span className="product-mini-brand">scantap</span>
        <span className="product-message">Tap to review us on Google</span>
        <span className="product-icons" aria-hidden="true">
          <Radio size={18} />
          <QrCode size={18} />
        </span>
      </div>
      {type === "stand" && <span className="stand-base" aria-hidden="true" />}
    </div>
  );
}
