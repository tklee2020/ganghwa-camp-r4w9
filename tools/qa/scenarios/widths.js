/* 폭 × 테마 × 화면 5개 전수 — 가로 넘침(scrollWidth > innerWidth)과 렌더를 봐요. */
const views = ['plan', 'places', 'shop', 'play', 'split'];
const sizes = [[360, 780, 2], [390, 844, 2], [1280, 860, 1]];
const themes = ['light', 'dark'];
const sc = [];
sizes.forEach(([w, h, dpr]) => themes.forEach(t => sc.push({
  name: `${w}-${t}`, now: '2026-10-10T10:40:00+09:00', w, h, dpr,
  ls: { 'ghcamp26:theme': JSON.stringify(t) },
  steps: [{ wait: 800 }].concat(...views.map(v => [
    { eval: `document.querySelector('#dock [data-view=${v}]').click()` },
    { wait: 300, eval: `'${v} overflow=' + (document.documentElement.scrollWidth - innerWidth)` },
    { shot: `w${w}-${t}-${v}.png`, full: true }
  ]))
})));
module.exports = { parallel: 2, scenarios: sc };
