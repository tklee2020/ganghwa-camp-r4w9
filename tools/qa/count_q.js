// 확인 필요({?}) 개수를 센다: node count_q.js <index.html 경로>
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const chrome = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
(async () => {
  const b = await puppeteer.launch({ executablePath: chrome, headless: 'new' });
  const p = await b.newPage();
  await p.goto('file:///' + path.resolve(process.argv[2]).replace(/\\/g, '/'));
  await new Promise(r => setTimeout(r, 800)); const r = await p.evaluate(() => { const q = Array.from(document.querySelectorAll('.qlist li')).map(l => l.textContent); return { n: q.length, list: q }; });
  console.log(r.n);
  r.list.forEach(x => console.log(' -', x));
  await b.close();
})();
