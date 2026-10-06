// T맵 링크 점검: node tmap_check.js  (localhost:8765 서버 필요)
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const chrome = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
const URL0 = process.env.QA_URL || 'http://localhost:8765/';
(async () => {
  const b = await puppeteer.launch({ executablePath: chrome, headless: 'new' });
  for (const [label, ua] of [['android', 'Mozilla/5.0 (Linux; Android 15; SM-S937N) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36'], ['desktop', null]]) {
    const p = await b.newPage();
    if (ua) await p.setUserAgent(ua);
    await p.setViewport({ width: 360, height: 800, deviceScaleFactor: 2 });
    await p.goto(URL0, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 800));
    const r = await p.evaluate(() => {
      const all = Array.from(document.querySelectorAll('a')).filter(a => a.textContent.trim() === 'T맵 안내');
      const names = Array.from(document.querySelectorAll('.pl__c h3, .card h3')).length;
      return { n: all.length, first: all[0] && all[0].getAttribute('href'), last: all[all.length - 1] && all[all.length - 1].getAttribute('href') };
    });
    console.log(label, JSON.stringify(r));
    if (label === 'android') {
      await p.evaluate(() => { const b = Array.from(document.querySelectorAll('button,a')).find(x => /장소/.test(x.textContent) && x.closest('nav,.tabs,.tabbar') ); if (b) b.click(); });
      await new Promise(r => setTimeout(r, 500));
      await p.screenshot({ path: 'out/tmap-android-places.png', fullPage: true });
    }
    await p.close();
  }
  await b.close();
})();
