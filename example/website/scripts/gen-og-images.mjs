// Renders the social preview images in public/og/ (1200 x 630) from the scene posters.
// Run from the repository root after adding or re-recording a scene:
//   node example/website/scripts/gen-og-images.mjs
// It uses the root workspace's Playwright (set CHROMIUM_PATH to use another Chromium) and
// the Inter typeface installed on the machine.
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { chromium } from "playwright";

const websiteDir = fileURLToPath(new URL("..", import.meta.url));
const publicDir = path.join(websiteDir, "public");
const outputDir = path.join(publicDir, "og");
const scenesData = JSON.parse(
  await readFile(path.join(websiteDir, "components/scenes/scenes.json"), "utf8")
);
const tagLabels = new Map(scenesData.tags.map(({ k, label }) => [k, label]));
const asset = (relativePath) => pathToFileURL(path.join(publicDir, relativePath)).href;

// iPhone 17 Pro, the same geometry as components/scenes/PhoneFrame.tsx (points).
const DEVICE = { width: 434, height: 906, radius: 78, border: 16 };

const statusBar = `
  <div class="status">
    <div class="time">9:41</div>
    <div class="icons">
      <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor"><rect x="0" y="7.5" width="3.2" height="4.5" rx="1"/><rect x="5.1" y="5" width="3.2" height="7" rx="1"/><rect x="10.2" y="2.5" width="3.2" height="9.5" rx="1"/><rect x="15.3" y="0" width="3.2" height="12" rx="1"/></svg>
      <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><path d="M8.5 2.6c2.4 0 4.6.9 6.3 2.4.2.2.5.2.7 0l1.1-1.1c.2-.2.2-.5 0-.7C14.5 1.2 11.6 0 8.5 0S2.5 1.2.4 3.2c-.2.2-.2.5 0 .7l1.1 1.1c.2.2.5.2.7 0C3.9 3.5 6.1 2.6 8.5 2.6Z"/><path d="M8.5 6.4c1.3 0 2.5.5 3.5 1.3.2.2.5.2.7 0l1.1-1.1c.2-.2.2-.5 0-.7-1.4-1.2-3.3-2-5.3-2s-3.9.8-5.3 2c-.2.2-.2.5 0 .7l1.1 1.1c.2.2.5.2.7 0 1-.8 2.2-1.3 3.5-1.3Z"/><path d="M10.7 9.6c.2-.2.2-.5 0-.7-.6-.5-1.4-.8-2.2-.8s-1.6.3-2.2.8c-.2.2-.2.5 0 .7l1.9 1.9c.2.2.5.2.7 0l1.8-1.9Z"/></svg>
      <svg width="28" height="13" viewBox="0 0 28 13"><rect x="0.5" y="0.5" width="24" height="12" rx="3.8" fill="none" stroke="currentColor" stroke-opacity=".35"/><rect x="2" y="2" width="21" height="9" rx="2.5" fill="currentColor"/><path d="M26 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" fill-opacity=".4"/></svg>
    </div>
  </div>`;

function phone(scene, width, style = "") {
  const scale = width / DEVICE.width;
  const bar = scene.statusBar === "light" ? "#fff" : "#000";
  return `
    <div class="phone" style="width:${width}px;height:${DEVICE.height * scale}px;${style}">
      <div class="device" style="transform:scale(${scale})">
        <div class="bezel"></div>
        <div class="screen" style="--bar:${bar}">
          <img src="${asset(`scenes/${scene.slug}.jpg`)}" alt="">
          ${statusBar}
          <div class="island"></div>
          <div class="home"></div>
        </div>
      </div>
    </div>`;
}

const css = `
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    font-family: Inter, sans-serif;
    color: #0b0b0c;
    background: radial-gradient(120% 90% at 85% 10%, #f1f3f7 0%, #ffffff 60%);
    -webkit-font-smoothing: antialiased;
  }
  .page { position: relative; width: 1200px; height: 630px; }
  .brand { position: absolute; left: 72px; top: 64px; display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 26px; letter-spacing: -0.01em; }
  .brand img { width: 34px; height: 34px; filter: invert(1); }
  .copy { position: absolute; left: 72px; top: 150px; width: 560px; }
  .eyebrow { font-size: 18px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280; margin-bottom: 18px; }
  h1 { font-family: "Inter Display", Inter, sans-serif; font-size: 64px; line-height: 1.04; font-weight: 700; letter-spacing: -0.035em; }
  .lede { margin-top: 22px; font-size: 25px; line-height: 1.42; color: #4b5563; }
  .chips { margin-top: 26px; display: flex; flex-wrap: wrap; gap: 10px; }
  .chip { height: 38px; padding: 0 16px; border-radius: 999px; border: 1.5px solid #d1d5db; display: inline-flex; align-items: center; font-size: 18px; font-weight: 500; color: #374151; background: #fff; }
  .url { position: absolute; left: 72px; bottom: 58px; font-size: 21px; font-weight: 500; color: #6b7280; letter-spacing: -0.005em; }
  .phone { position: absolute; }
  .device { position: absolute; left: 0; top: 0; width: 434px; height: 906px; border-radius: 78px; transform-origin: 0 0;
    background: linear-gradient(145deg, #4a4a4f, #1f1f22 40%, #3a3a3e 70%, #18181a);
    box-shadow: inset 0 0 0 1px #0d0d0e, 0 60px 90px -40px rgba(15, 23, 42, 0.45); }
  .bezel { position: absolute; inset: 4px; border-radius: 74px; background: #000; }
  .screen { position: absolute; left: 16px; top: 16px; width: 402px; height: 874px; border-radius: 62px; overflow: hidden; background: #000; color: var(--bar); }
  .screen img { position: absolute; inset: 0; width: 402px; height: 874px; object-fit: cover; }
  .status { position: absolute; left: 0; top: 0; width: 402px; height: 54px; font: 600 17px/1 Inter, sans-serif; letter-spacing: -0.4px; }
  .time { position: absolute; left: 0; top: 21px; width: 146px; text-align: center; }
  .icons { position: absolute; right: 0; top: 23px; width: 146px; display: flex; justify-content: center; align-items: center; gap: 6px; }
  .island { position: absolute; left: 138px; top: 11px; width: 126px; height: 37px; border-radius: 19px; background: #000; }
  .home { position: absolute; left: 134px; bottom: 8px; width: 134px; height: 5px; border-radius: 3px; background: var(--bar); }
`;

const shell = (body) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="page">
    <div class="brand"><img src="${asset("site-icon.png")}" alt="">RNRC</div>
    ${body}
  </div></body></html>`;

const byslug = (slug) => scenesData.scenes.find((scene) => scene.slug === slug);

const pages = [
  {
    file: "default.jpg",
    html: shell(`
      <div class="copy">
        <h1>React Native Reanimated Carousel</h1>
        <p class="lede">A performant, customizable carousel for React Native, powered by Reanimated. Works on iOS, Android and Web.</p>
      </div>
      <div class="url">rn-carousel.dev</div>
      ${phone(byslug("date-wheel"), 250, "left:690px;top:132px;")}
      ${phone(byslug("flavor-switcher"), 270, "left:870px;top:84px;")}`),
  },
  {
    file: "scenes.jpg",
    html: shell(`
      <div class="copy">
        <div class="eyebrow">Scenes</div>
        <h1>${scenesData.scenes.length} app screens built with one carousel</h1>
        <p class="lede">Drag each one live, then copy the full source.</p>
      </div>
      <div class="url">rn-carousel.dev/Examples/scenes</div>
      ${phone(byslug("now-showing"), 236, "left:650px;top:150px;")}
      ${phone(byslug("flavor-switcher"), 250, "left:800px;top:104px;")}
      ${phone(byslug("map-explorer"), 236, "left:946px;top:150px;")}`),
  },
  ...scenesData.scenes.map((scene) => ({
    file: `scenes/${scene.slug}.jpg`,
    html: shell(`
      <div class="copy" style="width:620px">
        <div class="eyebrow">Scene · ${scene.group}</div>
        <h1>${scene.title}</h1>
        <p class="lede">${scene.description.replace(/`([^`]+)`/gu, "$1")}</p>
        <div class="chips">${scene.tags.map((tag) => `<span class="chip">${tagLabels.get(tag) ?? tag}</span>`).join("")}</div>
      </div>
      <div class="url">rn-carousel.dev/Examples/scenes/${scene.slug}</div>
      ${phone(scene, 262, "left:858px;top:44px;")}`),
  })),
];

const workDir = await mkdtemp(path.join(os.tmpdir(), "rnrc-og-"));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

try {
  await mkdir(path.join(outputDir, "scenes"), { recursive: true });
  for (const { file, html } of pages) {
    const htmlPath = path.join(workDir, "og.html");
    await writeFile(htmlPath, html);
    await page.goto(pathToFileURL(htmlPath).href);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((image) => image.complete));
    await page.screenshot({ path: path.join(outputDir, file), type: "jpeg", quality: 86 });
    console.log(`og/${file}`);
  }
} finally {
  await browser.close();
  await rm(workDir, { recursive: true, force: true });
}
