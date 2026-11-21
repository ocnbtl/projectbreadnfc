import reviewed from "@/content/replay-public-values.json";

// Exact public values reviewed from / and /products. Never learn values from a
// visitor's DOM. New or dynamic content stays masked until this list is reviewed.
const text = new Set(reviewed.text);
const attributes = new Set(reviewed.attributes.map(([name, value]) => `${name}\0${value}`));
export function maskPublicText(value: string) {
  return text.has(value.trim()) ? value : value.replace(/\S/g, "*");
}
export function maskPublicAttribute(name: string, value: string) {
  if (name === "href" && /^\/_next\/static\/[a-zA-Z0-9_./-]+\.css(?:\?v=\d+)?$/.test(value)) return value;
  if ((name === "rel" && value === "stylesheet") || (name === "type" && value === "text/css")) return value;
  if (["value", "placeholder", "srcdoc", "data", "rr_dataURL"].includes(name)) return "";
  return attributes.has(`${name}\0${value}`) ? value : "";
}
