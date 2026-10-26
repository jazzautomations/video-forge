#!/usr/bin/env node
// Record a public web page as product footage and learn where each target sits on screen.
// Usage: node record-page.mjs URL targets.json [output-dir]
// targets.json: [{"name":"hero","text":"visible text to find","hold":2.2},
//                {"name":"install","text":"curl -fsSL","offset":300,"hold":2.6,"zoom":1.6}]
// The first target is shown without scrolling; each later one is reached with a smooth scroll
// (offset = target top in px from the viewport top). marks.json records the time, scroll and
// viewport box of every target, plus a ready camera key (cx,cy clamped for its zoom) in the
// recording's own coordinates, so a storyboard "screen" scene can be written without guessing.
// Run from a project with Playwright installed. Fresh context: no accounts, no user profile.
import {createRequire} from 'node:module';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(path.join(process.cwd(), 'package.json'));
const {chromium} = require('playwright');
const [url, targetsPath, outDir = 'capture'] = process.argv.slice(2);
if (!url || !targetsPath) throw new Error('Usage: node record-page.mjs URL targets.json [output-dir]');
const targets = JSON.parse(await readFile(targetsPath, 'utf8'));
if (!Array.isArray(targets) || !targets.length) throw new Error('targets.json: expected a nonempty array');
const W = 1920, H = 1080, SCROLL_MS = 1400;
await mkdir(outDir, {recursive: true});
const browser = await chromium.launch({headless: true, ...(process.env.VF_BROWSER_PATH ? {executablePath: process.env.VF_BROWSER_PATH} : {})});
const context = await browser.newContext({viewport: {width: W, height: H}, deviceScaleFactor: 1, locale: process.env.VF_LOCALE || 'pt-BR', recordVideo: {dir: outDir, size: {width: W, height: H}}});
const page = await context.newPage();
const t0 = performance.now();
const marks = [];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const cameraKey = (box, zoom) => {
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  return {zoom, cx: Math.round(clamp(cx, W / (2 * zoom), W - W / (2 * zoom))), cy: Math.round(clamp(cy, H / (2 * zoom), H - H / (2 * zoom)))};
};
try {
  await page.goto(url, {waitUntil: 'networkidle'});
  await page.waitForTimeout(600);
  marks.push({name: 'page-ready', timeMs: Math.round(performance.now() - t0)});
  for (const [i, t] of targets.entries()) {
    const locator = page.getByText(t.text, {exact: false}).first();
    if (!(await locator.count())) throw new Error(`Target "${t.name}": text not found: ${t.text}`);
    const begin = Math.round(performance.now() - t0);
    if (i > 0) {
      await locator.evaluate((el, off) => { window.scrollTo({top: window.scrollY + el.getBoundingClientRect().top - off, behavior: 'smooth'}); }, t.offset ?? 240);
      await page.waitForTimeout(SCROLL_MS);
    }
    const box = await locator.boundingBox();
    const zoom = t.zoom ?? 1.6;
    marks.push({name: t.name, scrollBeginMs: i > 0 ? begin : null, timeMs: Math.round(performance.now() - t0), scrollY: await page.evaluate(() => window.scrollY), box, cameraKey: box ? cameraKey(box, zoom) : null});
    await page.waitForTimeout(Math.round((t.hold ?? 2.5) * 1000));
  }
  marks.push({name: 'end', timeMs: Math.round(performance.now() - t0)});
  await page.screenshot({path: path.join(outDir, 'final.png')});
  const video = page.video();
  await context.close();
  await video.saveAs(path.join(outDir, 'page.webm'));
  await writeFile(path.join(outDir, 'marks.json'), JSON.stringify({width: W, height: H, note: 'timeMs is host time from page creation; cut the recording at page-ready before editorial use. cameraKey is in recording coordinates.', marks}, null, 2));
  console.log(JSON.stringify({video: path.resolve(outDir, 'page.webm'), marks: path.resolve(outDir, 'marks.json'), targets: marks.filter(m => m.cameraKey).map(m => ({name: m.name, atMs: m.timeMs, cameraKey: m.cameraKey}))}));
} finally { await browser.close(); }
