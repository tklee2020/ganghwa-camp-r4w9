/* 진짜 오프라인 — 페이지와 서비스워커 둘 다 네트워크를 끊고 새로고침해도 열리는지.
   사용: node offline.js   (QA_URL·CHROME 환경변수는 harness.js 와 같아요)
   setOfflineMode 만으로는 서비스워커의 fetch 가 그대로 나가서 "오프라인인데 열림"을 증명 못 해요. */
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');
const URL0 = process.env.QA_URL || 'http://localhost:8765/';
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  const logs = [];
  page.on('console', m => { if (['error', 'warn', 'warning'].includes(m.type())) logs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => logs.push('pageerror: ' + e.message));
  const mode = process.argv[2] || '2d';
  await page.evaluateOnNewDocument(mode => {
    
    
  }, mode);
  await page.goto(URL0, { waitUntil: 'networkidle2' });
  await sleep(3000);
  await page.reload({ waitUntil: 'networkidle2' }); await sleep(2000);   /* 두 번째 로드부터 서비스워커가 페이지를 잡아요 */
  const swT = await b.waitForTarget(t => t.type() === 'service_worker' && t.browserContext() === ctx, { timeout: 10000 }).catch(() => null);
  console.log('service worker', !!swT, 'controlled', await page.evaluate(() => !!navigator.serviceWorker.controller));
  if (swT) { const s = await swT.createCDPSession(); await s.send('Network.enable'); await s.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }); }
  await page.setOfflineMode(true);
  await page.reload({ waitUntil: 'domcontentloaded' }).catch(e => logs.push('reload: ' + e.message));
  await sleep(3000);
  const st = await page.evaluate(() => ({
    title: document.title, ticker: (document.querySelector('#ticker') || {}).innerText,
    wxCached: !!localStorage.getItem('ghcamp26:wx'), tl: document.querySelectorAll('#tl .ev').length,
    fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).slice(0, 6)
  })).catch(e => 'eval failed ' + e.message);
  console.log(JSON.stringify(st));
  await page.screenshot({ path: path.join(OUT, 'offline.png') });
  console.log(logs.join('\n') || 'no console errors');
  await b.close();
})();
