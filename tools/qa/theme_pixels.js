// 테마 토글을 "화면에 실제로 칠해진 밝기"로 점검 — getComputedStyle 은 크롬 강제 다크(사이트에 어두운 테마 적용)를 못 본다.
// 사용: QA_URL=https://tklee2020.github.io/ganghwa-camp-r4w9/ node theme_pixels.js [force]
// force = 안드로이드 크롬 "사이트에 어두운 테마 적용"과 같은 강제 다크(WebContentsForceDark)
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const chrome = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
const URL0 = process.env.QA_URL || 'http://localhost:8765/';
const force = process.argv[2] === 'force';
const OUT = path.join(__dirname, 'out');
(async () => {
  const args = ['--no-sandbox'];
  if (force) args.push('--enable-features=WebContentsForceDark', '--force-dark-mode');
  const b = await puppeteer.launch({ executablePath: chrome, headless: 'new', args });
  for (const scheme of ['dark', 'light']) {
    const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
    await p.setUserAgent('Mozilla/5.0 (Linux; Android 15; SM-S937N) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36');
    await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
    await p.goto(URL0, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));
    /* 화면 전체 평균 밝기 (0=검정, 255=흰색) — 캔버스 없이 스크린샷 PNG 를 페이지 안에서 디코드 */
    const shot = async (tag) => {
      const file = path.join(OUT, `px-${scheme}${force ? '-force' : ''}-${tag}.png`);
      const buf = await p.screenshot({ path: file });
      const lum = await p.evaluate(async (b64) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const g = c.getContext('2d'); g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height).data; let s = 0;
        for (let i = 0; i < d.length; i += 4) s += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        return Math.round(s / (d.length / 4));
      }, Buffer.from(buf).toString('base64'));
      const attr = await p.evaluate(() => document.documentElement.getAttribute('data-theme'));
      return tag + ': data-theme=' + attr + ' 화면밝기=' + lum;
    };
    const rows = [await shot('0')];
    for (let i = 1; i <= 2; i++) { await p.tap('#themeBtn'); await new Promise(r => setTimeout(r, 700)); rows.push(await shot(String(i))); }
    console.log('== 폰 ' + scheme + (force ? ' + 강제다크' : '') + '\n  ' + rows.join('\n  '));
    await ctx.close();
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
