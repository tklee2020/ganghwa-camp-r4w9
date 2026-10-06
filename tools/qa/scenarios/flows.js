/* 기능 흐름: 체크 저장·배지, 정산 계산·복사 텍스트, 몰래 미션 겹침 없음, 라이어 한 판, 팀 뽑기(부부 갈라놓기) */
module.exports = { parallel: 1, scenarios: [
  { name: 'shop', now: '2026-10-06T21:00:00+09:00', steps: [
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
  { name: 'games', steps: [
    { wait: 600, eval: `document.querySelector('#dock [data-view=play]').click(); (function(){ var seen={}, out=[]; document.querySelectorAll('[data-mis]').forEach(function(b){ b.click(); var t=document.querySelector('#misOut b').textContent; out.push(t); seen[t]=1; b.click(); }); return 'missions unique=' + (Object.keys(seen).length===out.length) + ' n=' + out.length; })()` },
    { eval: `(function(){ document.querySelector('#liarStart').click(); var liars=0, words={}; for (var i=0;i<6;i++){ document.querySelector('#liarNext').click(); var t=document.querySelector('#liarOut').innerText; if (/라이어/.test(t)) liars++; else words[t.split(String.fromCharCode(10))[0]]=1; document.querySelector('#liarNext').click(); } return 'liars=' + liars + ' words=' + Object.keys(words).length + ' revealShown=' + !document.querySelector('#liarReveal').hidden; })()` },
    { eval: `(function(){ document.querySelector('#teamBtn').click(); return document.querySelector('#teams').innerText.replace(/\n/g,' '); })()` },
    { eval: `document.querySelector('#telBtn').click(); document.querySelector('#penBtn').click(); document.querySelector('#telOut').textContent + ' | ' + document.querySelector('#penOut').textContent` },
    { shot: 'f-games.png', full: true }
  ] }
] };
