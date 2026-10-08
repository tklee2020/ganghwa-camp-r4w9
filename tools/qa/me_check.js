/* ?me 플래그 확인: 배포 주소에서 ?me 로 열고 → 쿼리 없이 다시 열었을 때 할 일·코스트코가 보이는지 */
const puppeteer = require('puppeteer-core');
const BASE = process.env.QA_URL || 'https://tklee2020.github.io/ganghwa-camp-r4w9/';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844 });
  const probe = () => p.evaluate(() => [location.href, localStorage.getItem('ghcamp26:me'),
    Array.prototype.map.call(document.querySelectorAll('#shopLists [data-list]'), function(s){ return s.getAttribute('data-list'); }).join(','),
    (document.querySelector('#shopTile [data-mini-list]') || {}).getAttribute ? document.querySelector('#shopTile [data-mini-list]').getAttribute('data-mini-list') : '-'].join(' | '));
  await p.goto(BASE, { waitUntil: 'networkidle2' });
  console.log('plain   :', await probe());
  await p.goto(BASE + '?me', { waitUntil: 'networkidle2' });
  console.log('?me     :', await probe());
  await p.goto(BASE, { waitUntil: 'networkidle2' });
  console.log('reopen  :', await probe());
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
