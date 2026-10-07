/* 장소 탭 추천 구역·오늘 탭을 잘라서 캡처 (육안 확인용) — 서버: python -m http.server 8765 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await p.goto(process.env.QA_URL || 'http://localhost:8765/', { waitUntil: 'networkidle0' });
  await p.evaluate(() => { var t = document.querySelector('[data-tab="places"], [data-go="places"], #tab-places'); if (t) t.click(); });
  await new Promise(r => setTimeout(r, 500));
  const info = await p.evaluate(() => {
    var tiles = Array.from(document.querySelectorAll('#placeList .tile'));
    return tiles.map(t => (t.querySelector('h2,h3,.th') || t).textContent.trim().slice(0, 40));
  });
  console.log(info);
  const tiles = await p.$$('#placeList .tile');
  if (tiles[1]) {
    const box = await tiles[1].boundingBox();
    await tiles[1].scrollIntoView();
    // 타일이 길어서 앞 2200px 을 두 장으로
    const pg = await tiles[1].evaluate(el => { var r = el.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; });
    for (let i = 0; i < 3; i++) {
      await p.screenshot({ path: `out/rec-${i}.png`, clip: { x: 0, y: pg.top + i * 1500, width: 390, height: Math.min(1500, Math.max(100, pg.h - i * 1500)) }, captureBeyondViewport: true });
    }
    console.log('rec tile height', pg.h);
  }
  await b.close();
})();
