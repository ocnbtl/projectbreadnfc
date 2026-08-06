import { mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.SCANTAP_DEMO_URL || "http://127.0.0.1:3017";
const outputDirectory = path.resolve("public", "demo");
const recordingDirectory = path.resolve(".recordings", "scantap-demo");

await mkdir(outputDirectory, { recursive: true });
await rm(recordingDirectory, { recursive: true, force: true });
await mkdir(recordingDirectory, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: {
    dir: recordingDirectory,
    size: { width: 1440, height: 900 },
  },
});
const page = await context.newPage();
const video = page.video();

await page.goto(`${baseUrl}/dashboard`, { waitUntil: "networkidle" });
await page.screenshot({
  path: path.join(outputDirectory, "scantap-product-walkthrough-poster.png"),
  fullPage: false,
});
await page.waitForTimeout(1800);

await page.getByRole("button", { name: "Reviews", exact: true }).click();
await page.waitForTimeout(1100);
const reply = page.getByRole("textbox", { name: /Reply to Alex Morgan/ });
await reply.fill("Thanks, Alex. We appreciate you choosing us and sharing the experience.");
await page.waitForTimeout(850);
await page.getByRole("button", { name: "Send reply" }).click();
await page.waitForTimeout(1200);

await page.getByRole("button", { name: "Devices", exact: true }).click();
await page.waitForTimeout(1200);
const connectionCheck = page.getByRole("button", { name: /Check connection/i }).last();
if (await connectionCheck.isVisible()) {
  await connectionCheck.click();
  await page.waitForTimeout(1500);
}

await page.getByRole("button", { name: "Locations", exact: true }).click();
await page.waitForTimeout(1300);
await page.getByRole("button", { name: "Overview", exact: true }).click();
await page.waitForTimeout(1800);

await page.close();
await context.close();
await browser.close();

if (!video) throw new Error("Playwright did not create a video recording.");
const recordedPath = await video.path();
const finalPath = path.join(outputDirectory, "scantap-product-walkthrough.webm");
await rm(finalPath, { force: true });
await rename(recordedPath, finalPath);
await rm(recordingDirectory, { recursive: true, force: true });

console.log(`Recorded product walkthrough: ${finalPath}`);
