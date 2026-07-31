import { ExternalLink, MessageSquareText, Radio, Star } from "lucide-react";

const steps = [
  { icon: Radio, label: "NFC interactions", value: "186" },
  { icon: ExternalLink, label: "Google opens", value: "121" },
  { icon: Star, label: "New reviews", value: "34" },
  { icon: MessageSquareText, label: "Replies sent", value: "29" },
];

export function SignalLedger({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`signal-ledger ${compact ? "is-compact" : ""}`}>
      {steps.map((step, index) => (
        <div className="signal-step-wrap" key={step.label}>
          <div className="signal-step">
            <span className="signal-icon">
              <step.icon size={18} strokeWidth={1.8} />
            </span>
            <div>
              <strong>{step.value}</strong>
              <span>{step.label}</span>
            </div>
          </div>
          {index < steps.length - 1 && (
            <span className="signal-connector" aria-hidden="true">
              <span />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
