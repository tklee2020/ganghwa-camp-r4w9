/* 여행 중 "순간"마다 헤더(D-day·지금/다음)와 일정 강조가 맞는지 */
const M = [
  ['before', '2026-10-06T21:00:00+09:00'],
  ['dday-morning', '2026-10-10T07:00:00+09:00'],
  ['brunch', '2026-10-10T10:40:00+09:00'],
  ['bbq', '2026-10-10T18:20:00+09:00'],
  ['midnight', '2026-10-11T00:30:00+09:00'],
  ['checkout', '2026-10-11T11:05:00+09:00'],
  ['after', '2026-10-12T09:00:00+09:00']
];
module.exports = { parallel: 1, scenarios: M.map(([n, now]) => ({
  name: n, now, w: 390, h: 844,
  steps: [{ wait: 900, eval: `document.querySelector('#ddayPill').textContent + ' | ' + document.querySelector('#ticker').innerText.split(String.fromCharCode(10)).join(' / ') + ' | now=' + ((document.querySelector('.is-now .ev-tt')||{}).textContent||'-') + ' | overflow=' + (document.documentElement.scrollWidth - innerWidth)` },
          { shot: `m-${n}.png` }]
})) };
