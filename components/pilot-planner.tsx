"use client";

import { Check, Clipboard, Download, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";

const formats = ["Counter stand", "Adhesive plate", "Staff card"];
const priorities = [
  "Get a consistent review prompt in place",
  "Keep up with review replies",
  "See activity across placements",
  "Monitor more than one location",
];

export function PilotPlanner() {
  const [selectedFormats, setSelectedFormats] = useState<string[]>([
    "Counter stand",
  ]);
  const [priority, setPriority] = useState(priorities[0]);
  const [locationCount, setLocationCount] = useState(1);
  const [customBranding, setCustomBranding] = useState(false);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      [
        "Scantap pilot outline",
        `Locations: ${locationCount}`,
        `Hardware: ${selectedFormats.join(", ") || "Not selected"}`,
        `Primary goal: ${priority}`,
        `Branding: ${
          customBranding
            ? "Custom-branded run (separate proofing and lead time)"
            : "Standard Scantap hardware"
        }`,
        "",
        "Next step: confirm placement, Google review links, hardware quantity, final supplier lead time, and support contact before launch.",
      ].join("\n"),
    [customBranding, locationCount, priority, selectedFormats],
  );

  function toggleFormat(format: string) {
    setSelectedFormats((current) =>
      current.includes(format)
        ? current.filter((item) => item !== format)
        : [...current, format],
    );
  }

  async function copyPlan() {
    await navigator.clipboard.writeText(plan);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadPlan() {
    const blob = new Blob([plan], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "scantap-pilot-outline.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="pilot-planner">
      <div className="planner-controls">
        <fieldset>
          <legend>Where would you start?</legend>
          <div className="choice-grid">
            {formats.map((format) => (
              <button
                aria-pressed={selectedFormats.includes(format)}
                className={selectedFormats.includes(format) ? "selected" : ""}
                key={format}
                onClick={() => toggleFormat(format)}
                type="button"
              >
                <span>{format}</span>
                {selectedFormats.includes(format) && <Check size={16} />}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>What matters first?</legend>
          <div className="radio-list">
            {priorities.map((item) => (
              <label key={item}>
                <input
                  checked={priority === item}
                  name="priority"
                  onChange={() => setPriority(item)}
                  type="radio"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="planner-row">
          <div>
            <strong>Locations</strong>
            <p>Keep the first pilot small enough to learn from.</p>
          </div>
          <div className="quantity-control">
            <button
              aria-label="Decrease locations"
              disabled={locationCount === 1}
              onClick={() => setLocationCount((count) => Math.max(1, count - 1))}
              type="button"
            >
              <Minus size={16} />
            </button>
            <span>{locationCount}</span>
            <button
              aria-label="Increase locations"
              disabled={locationCount === 5}
              onClick={() => setLocationCount((count) => Math.min(5, count + 1))}
              type="button"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <label className="toggle-row">
          <span>
            <strong>Custom-branded hardware</strong>
            <small>Requires a separate proof and supplier lead time.</small>
          </span>
          <input
            checked={customBranding}
            onChange={(event) => setCustomBranding(event.target.checked)}
            type="checkbox"
          />
          <span className="toggle-control" aria-hidden="true" />
        </label>
      </div>
      <aside className="planner-summary">
        <h2>Your starting outline</h2>
        <p>
          This planner prepares a brief on your device. It does not submit your
          information or create an order.
        </p>
        <pre>{plan}</pre>
        <div className="planner-actions">
          <button className="button button-primary" onClick={copyPlan} type="button">
            {copied ? <Check size={17} /> : <Clipboard size={17} />}
            {copied ? "Copied" : "Copy outline"}
          </button>
          <button className="button button-secondary" onClick={downloadPlan} type="button">
            <Download size={17} /> Download
          </button>
        </div>
      </aside>
    </div>
  );
}
