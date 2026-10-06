/* 강화 베이비 캠프 오프라인 지원 (도쿄 TOKYO QUEST sw.js 에서 지도 타일 부분을 뺀 것)
   - 페이지(index.html): 인터넷이 되면 항상 새 버전, 안 되거나 4초 넘게 걸리면 저장해 둔 버전
   - 아이콘·글꼴(fonts/Pretendard, 설치 때 미리 저장): 한 번 받으면 저장해 두고 씀 (뒤에서 조용히 새로 받기)
   - 날씨 API·지도 앱 링크: 가로채지 않음 (날씨는 페이지가 따로 저장해 둬요) */
const V = 'ghc-v2';   /* 바꾸면 저장해 둔 글꼴·아이콘도 새로 받아요 */
const CORE = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './fonts/PretendardVariable.woff2'];
const PAGE = new URL('./', self.registration.scope).href;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('ghc-') && k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function pageFirst(){
  return caches.open(V).then(c => {
    /* GitHub Pages는 CDN이 10분씩 들고 있어서, 주소에 매번 다른 꼬리를 붙여 원본을 바로 받아요 (저장은 원래 주소로) */
    const net = fetch(PAGE + (PAGE.indexOf('?') < 0 ? '?' : '&') + 'sw=' + Date.now(), { cache: 'no-store' }).then(r => { if (r.ok){ c.put(PAGE, r.clone()); return r; } return c.match(PAGE).then(h => h || r); });
    const late = new Promise(res => setTimeout(res, 4000)).then(() => c.match(PAGE));
    return Promise.race([net, late.then(r => r || net)]).catch(() => c.match(PAGE)).then(r => r || net);
  });
}
function keep(req){
  return caches.open(V).then(c => c.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; });
    if (hit){ net.catch(() => {}); return hit; }
    return net;
  }));
}
const KEEP_HOSTS = /(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com)$/;

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate' && u.origin === location.origin){ e.respondWith(pageFirst()); return; }
  if (u.origin === location.origin){ if (!u.pathname.endsWith('/sw.js')) e.respondWith(keep(r)); return; }
  if (KEEP_HOSTS.test(u.hostname)) e.respondWith(keep(r));
});
