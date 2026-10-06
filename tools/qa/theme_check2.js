// 배포본 테마 토글을 폰에 가깝게 점검: 터치 탭 + 서비스워커 + (선택) 크롬 강제 다크.
// 사용: QA_URL=https://tklee2020.github.io/ganghwa-camp-r4w9/ node theme_check2.js [force]
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const chrome = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
const URL0 = process.env.QA_URL || 'http://localhost:8765/';
const force = process.argv[2] === 'force';
const lum = rgb => { const m = rgb.match(/\d+/g).map(Number); return Math.round(0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]); };
(async () => {
  const args = ['--no-sandbox'];
  if (force) args.push('--enable-features=WebContentsForceDark', '--force-dark-mode');
  const b = await puppeteer.launch({ executablePath: chrome, headless: 'new', args });
  for (const scheme of ['dark', 'light']) {
    const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
    await p.setUserAgent('Mozilla/5.0 (Linux; Android 15; SM-S937N) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36');
    await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
    await p.goto(URL0, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    await p.reload({ waitUntil: 'networkidle2' });        // 두 번째 로드부터 서비스워커가 잡는다
    await new Promise(r => setTimeout(r, 1500));
    const snap = () => p.evaluate(() => ({ build: (document.querySelector('.foot') || {}).innerText, attr: document.documentElement.getAttribute('data-theme'), saved: localStorage.getItem('ghcamp26:theme'), bg: getComputedStyle(document.body).backgroundColor, toast: (document.querySelector('.toast, #toast') || {}).innerText }));
    const rows = [['시작', await snap()]];
    for (let i = 1; i <= 4; i++) {
      await p.tap('#themeBtn');
      await new Promise(r => setTimeout(r, 500));
      rows.push(['탭 ' + i, await snap()]);
    }
    console.log('== 폰 ' + scheme + (force ? ' + 강제다크' : ''));
    rows.forEach(([k, v]) => console.log('  ' + k + ': data-theme=' + v.attr + ' saved=' + v.saved + ' 배경밝기=' + lum(v.bg) + ' toast=' + JSON.stringify(v.toast)));
    await ctx.close();
  }
  await b.close();
})();
