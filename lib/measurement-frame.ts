const canonical = "https://projectbreadnfc.vercel.app";
export function measurementFrameContext() {
  const deployment = process.env.VERCEL_URL ?? "";
  const branch = process.env.VERCEL_BRANCH_URL ?? "";
  if (process.env.VERCEL === "1" && /^projectbreadnfc-[a-z0-9]+-unigentamos\.vercel\.app$/.test(deployment)) {
    const parents = [canonical];
    if (process.env.VERCEL_ENV === "preview" && /^projectbreadnfc-git-[a-z0-9-]+-unigentamos\.vercel\.app$/.test(branch)) parents.push("https://" + branch);
    return { origin: "https://" + deployment, parents };
  }
  // Two loopback origins are used only by the isolated development fixture.
  if (process.env.NODE_ENV === "development") return {origin:"http://localhost:3168",parents:["http://127.0.0.1:3167"]};
  return null;
}
