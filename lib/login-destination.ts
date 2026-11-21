// Both password sign-in and email confirmation accept a return path within this site.
export function loginDestination(value: string | null | undefined) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return;
  if (value.includes("\\") || Array.from(value).some(char => char.charCodeAt(0) < 32)) return;
  const base = "https://scantap.invalid";
  const parsed = new URL(value, base);
  if (parsed.origin !== base || parsed.pathname.startsWith("//")) return;
  return parsed.pathname + parsed.search + parsed.hash;
}
