// 테마 버튼 점검: 폰이 밝은/어두운 모드일 때 버튼을 연달아 눌러 실제로 배경색이 바뀌는지 본다.
// 사용: node theme_check.js  (localhost:8765 서버 필요, QA_URL 로 바꿀 수 있음)
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const chrome = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
const URL0 = process.env.QA_URL || 'http://localhost:8765/';
(async () => {
  const b = await puppeteer.launch({ executablePath: chrome, headless: 'new' });
  for (const scheme of ['light', 'dark']) {
    const ctx = await b.createBrowserContext(); const p = await ctx.newPage();   // 폰 모드마다 저장소를 새로
    await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
    await p.setViewport({ width: 390, height: 800 });
    await p.goto(URL0, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 600));
    const snap = () => p.evaluate(() => ({ attr: document.documentElement.getAttribute('data-theme'), bg: getComputedStyle(document.body).backgroundColor }));
    const rows = [['시작', await snap()]];
    for (let i = 1; i <= 4; i++) {
      await p.click('#themeBtn');
      await new Promise(r => setTimeout(r, 300));
      rows.push(['누름 ' + i, await snap()]);
    }
    console.log('== 폰 ' + scheme);
    rows.forEach(([k, v]) => console.log('  ' + k + ': data-theme=' + v.attr + ' bg=' + v.bg));
    await ctx.close();
  }
  await b.close();
})();
