#!/usr/bin/env node
// Run from a project with Playwright installed. No accounts or existing browser profiles.
import {createRequire} from 'node:module';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(path.join(process.cwd(), 'package.json'));
const {chromium} = require('playwright');
const [url, actionsPath, outDir='capture'] = process.argv.slice(2);
if (!url || !actionsPath) throw new Error('Usage: node record-browser.mjs URL actions.json [output-dir]');
const actions = JSON.parse(await readFile(actionsPath, 'utf8'));
await mkdir(outDir,{recursive:true});
const browser = await chromium.launch({headless:true, ...(process.env.VF_BROWSER_PATH ? {executablePath:process.env.VF_BROWSER_PATH} : {})});
const context = await browser.newContext({viewport:{width:1920,height:1080},recordVideo:{dir:outDir,size:{width:1920,height:1080}}});
const page = await context.newPage();
const started = performance.now(), events=[];
try {
  await page.goto(url,{waitUntil:'networkidle'});
  for (const action of actions) {
    if (action.type === 'wait') await page.waitForTimeout(Math.min(10000,Math.max(0,action.ms)));
    else if (action.type === 'click') {
      const box = await page.locator(action.selector).boundingBox();
      if (!box) throw new Error(`Cannot locate ${action.selector}`);
      const x=box.x+box.width/2,y=box.y+box.height/2;
      await page.mouse.move(x,y,{steps:20});
      events.push({timeMs:performance.now()-started,type:'click',x,y,selector:action.selector});
      await page.locator(action.selector).click();
    } else if (action.type === 'fill') await page.locator(action.selector).fill(action.text);
    else if (action.type === 'scroll') await page.mouse.wheel(action.x??0,action.y??0);
    else throw new Error(`Unknown action type ${action.type}`);
  }
  await page.screenshot({path:path.join(outDir,'final.png')});
  const video=page.video();
  await context.close();
  await video.saveAs(path.join(outDir,'screen.webm'));
  await writeFile(path.join(outDir,'events.json'),JSON.stringify({width:1920,height:1080,timing:'host elapsed from page creation; align capture start before editorial use',events},null,2));
  console.log(JSON.stringify({video:path.resolve(outDir,'screen.webm'),events:path.resolve(outDir,'events.json')}));
} finally { await browser.close(); }
