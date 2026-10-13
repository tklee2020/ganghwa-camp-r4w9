/* 오늘 탭의 정산 반쪽 타일만 잘라 찍기 (fullPage 반복 캡처 회피) — node shot_split_tile.js
   환경변수: QA_URL (기본 http://localhost:8765/), CHROME */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const URL0 = process.env.QA_URL || 'http://localhost:8765/';
const CHROME = process.env.CHROME || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
].find(p => fs.existsSync(p));
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  for (const w of [360, 390]) {
    const page = await b.newPage();
    await page.setViewport({ width: w, height: 800, deviceScaleFactor: 2 });
    await page.goto(URL0, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 900));
    const el = await page.$('#splitTile');
    await el.evaluate(e => e.scrollIntoView({ block: 'center' }));
    await new Promise(r => setTimeout(r, 300));
    await el.screenshot({ path: path.join(__dirname, 'out', `split-tile-${w}.png`) });
    console.log(w, await el.evaluate(e => e.innerText.split(String.fromCharCode(10)).join(' / ')));
    await page.close();
  }
  await b.close();
})();
