/* 기능 흐름: 체크 저장·배지, 정산 계산·복사 텍스트, 비밀 게임 잠금·자동 오픈, 몰래 미션 겹침 없음, 라이어 한 판, 팀 뽑기(부부 갈라놓기) */
module.exports = { parallel: 1, scenarios: [
  { name: 'shop-others', now: '2026-10-08T21:00:00+09:00', steps: [
    { wait: 600, eval: `[!!document.querySelector('[data-list=todo]'), !!document.querySelector('[data-list=costco]'), document.querySelector('#shopTile [data-mini-list]').getAttribute('data-mini-list'), document.querySelector('#hero .btn--pri').textContent, document.querySelector('#dockShop').textContent].join(' | ')` },
    { shot: 'f-shop-others.png' }
  ] },
  { name: 'shop-me-link', url: (process.env.QA_URL || 'http://localhost:8765/') + '?me', now: '2026-10-08T21:00:00+09:00', steps: [
    { wait: 600, eval: `[location.search, localStorage.getItem('ghcamp26:me'), !!document.querySelector('[data-list=todo]'), !!document.querySelector('[data-list=costco]'), document.querySelector('#shopTile [data-mini-list]').getAttribute('data-mini-list')].join(' | ')` }
  ] },
  { name: 'shop-ver-tap', now: '2026-10-09T08:00:00+09:00', steps: [
    { wait: 600, eval: `for (var i = 0; i < 5; i++) document.querySelector('#ver1').click(); [localStorage.getItem('ghcamp26:me'), !!document.querySelector('[data-list=costco]'), document.querySelector('#shopTile [data-mini-list]').getAttribute('data-mini-list'), document.querySelector('#toast').textContent].join(' | ')` },
    { eval: `for (var i = 0; i < 5; i++) document.querySelector('#ver1').click(); [localStorage.getItem('ghcamp26:me'), !!document.querySelector('[data-list=costco]')].join(' | ')` }
  ] },
  { name: 'shop', ls: { 'ghcamp26:me': 'true' }, now: '2026-10-06T21:00:00+09:00', steps: [
    { wait: 600, eval: `document.querySelector('#dock [data-view=shop]').click(); document.querySelector('#dockShop').textContent` },
    { eval: `document.querySelector('input[data-ck=t1]').click(); document.querySelector('input[data-ck=c1]').click(); [document.querySelector('#dockShop').textContent, document.querySelector('[data-list=costco] .ck__n').textContent, document.querySelector('#ticker').innerText.split(String.fromCharCode(10)).join(' / ')].join(' | ')` },
    { reload: true, wait: 800, eval: `[document.querySelector('input[data-ck=c1]').checked, localStorage.getItem('ghcamp26:shop')].join(' | ')` },
    { shot: 'f-shop.png', full: true }
  ] },
  { name: 'split', steps: [
    { wait: 600, eval: `document.querySelector('#dock [data-view=split]').click(); 'ok'` },
    { eval: `(function(){ function add(f,w,a){ document.querySelector('[data-payer='+f+']').click(); document.querySelector('#sWhat').value=w; document.querySelector('#sAmt').value=a; document.querySelector('#splitForm').dispatchEvent(new Event('submit',{cancelable:true})); }
      add('yj','코스트코','412,350'); add('yj','숙소비','480000'); add('wj','아점','126000'); add('dh','카페','58000'); add('yj','바베큐 사용료','20000');
      return document.querySelector('#result').innerText.split(String.fromCharCode(10)).join(' / '); })()` },
    { shot: 'f-split.png', full: true }
  ] },
  /* 비밀 게임 잠금(TRIP.games.openISO 10/10 20:00): 전엔 자물쇠만, 1분 타이머가 열어 주고, 자물쇠를 눌러도 열려요 */
  { name: 'games-locked', now: '2026-10-10T19:58:30+09:00', steps: [
    { wait: 600, eval: `document.querySelector('#dock [data-view=play]').click(); (function(){ var q=function(s){ return document.querySelectorAll(s).length; }; return 'lock=' + q('.lockbox') + ' mis=' + q('[data-mis]') + ' tel=' + q('#telBtn') + ' liar=' + q('#liarStart') + ' pen=' + q('#penBtn') + ' team=' + q('#teamBtn') + ' | ' + document.querySelector('.lockbox').innerText.split(String.fromCharCode(10)).join(' ') + ' | home: ' + document.querySelector('.play-k').textContent; })()` },
    { eval: `document.querySelector('.lockbox').click(); 'tap-before: lock=' + document.querySelectorAll('.lockbox').length + ' toast=' + document.querySelector('#toast').textContent` },
    { shot: 'f-games-locked.png', full: true },
    { eval: `(function(){ var D0 = Date; window.Date = class extends D0 { constructor(...a){ super(...(a.length ? a : [D0.now() + 120000])); } static now(){ return D0.now() + 120000; } }; return 'clock +2min'; })()` },
    { wait: 61000 },
    { eval: `'auto-open: lock=' + document.querySelectorAll('.lockbox').length + ' mis=' + document.querySelectorAll('[data-mis]').length + ' liar=' + document.querySelectorAll('#liarStart').length + ' | home: ' + document.querySelector('.play-k').textContent` }
  ] },
  { name: 'games-tap', now: '2026-10-10T19:59:50+09:00', steps: [
    { wait: 600, eval: `document.querySelector('#dock [data-view=play]').click(); (function(){ var D0 = Date; window.Date = class extends D0 { constructor(...a){ super(...(a.length ? a : [D0.now() + 20000])); } static now(){ return D0.now() + 20000; } }; document.querySelector('.lockbox').click(); return 'tap-after: lock=' + document.querySelectorAll('.lockbox').length + ' mis=' + document.querySelectorAll('[data-mis]').length + ' tel=' + document.querySelectorAll('#telBtn').length; })()` }
  ] },
  { name: 'games', now: '2026-10-10T21:00:00+09:00', steps: [
    { wait: 600, eval: `document.querySelector('#dock [data-view=play]').click(); (function(){ var seen={}, out=[]; document.querySelectorAll('[data-mis]').forEach(function(b){ b.click(); var t=document.querySelector('#misOut b').textContent; out.push(t); seen[t]=1; b.click(); }); return 'missions unique=' + (Object.keys(seen).length===out.length) + ' n=' + out.length; })()` },
    { eval: `(function(){ document.querySelector('#liarStart').click(); var liars=0, words={}; for (var i=0;i<6;i++){ document.querySelector('#liarNext').click(); var t=document.querySelector('#liarOut').innerText; if (/라이어/.test(t)) liars++; else words[t.split(String.fromCharCode(10))[0]]=1; document.querySelector('#liarNext').click(); } return 'liars=' + liars + ' words=' + Object.keys(words).length + ' revealShown=' + !document.querySelector('#liarReveal').hidden; })()` },
    { eval: `(function(){ document.querySelector('#teamBtn').click(); return document.querySelector('#teams').innerText.split(String.fromCharCode(10)).join(' '); })()` },
    { eval: `document.querySelector('#telBtn').click(); document.querySelector('#penBtn').click(); document.querySelector('#telOut').textContent + ' | ' + document.querySelector('#penOut').textContent` },
    { shot: 'f-games.png', full: true }
  ] }
] };
