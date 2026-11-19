/* ============ МАЪЛУМОТЛАР: фақат шу блокни ўзгартиринг ============ */
const CONFIG = window.SITE;



const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ic = (n, c = 'i') => `<svg class="${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const imgCache = {};
const imgSrc = p => imgCache[p] || p;
const imgTag = (p, alt) => `<img src="${imgSrc(p)}" alt="${(alt || '').replace(/"/g, '&quot;')}" loading="lazy">`;
const initials = s => s.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

/* ---------- овоз ---------- */
let soundOn = false, actx = null;
function blip(f = 520, d = .07, v = .035) {
  if (!soundOn) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d);
  } catch (e) {}
}
$('#sound').addEventListener('click', () => {
  soundOn = !soundOn;
  $('#sound').setAttribute('aria-pressed', soundOn);
  $('#sound').setAttribute('aria-label', soundOn ? 'Овозни ўчириш' : 'Овозни ёқиш');
  $('#soundIc').innerHTML = `<use href="#i-${soundOn ? 'vol' : 'mute'}"/>`;
  blip(660, .12);
});
document.addEventListener('pointerover', e => { if (e.target.closest('.btn,.tab,.tile,.link,#nav a')) blip(880, .035, .02); });

/* ---------- прелоадер ---------- */
(function () {
  const loader = $('#loader'), num = $('#loaderNum'), bar = $('#loaderBar');
  let done = false;
  const finish = () => { if (done) return; done = true; num.textContent = 100; bar.style.transform = 'scaleX(1)'; loader.classList.add('done'); setTimeout(() => loader.remove(), 800); };
  const t0 = performance.now(), dur = reduce ? 150 : 1500;
  (function tick(now) {
    if (done) return;
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 2.2);
    num.textContent = Math.round(e * 100); bar.style.transform = `scaleX(${e})`;
    p < 1 ? requestAnimationFrame(tick) : finish();
  })(t0);
  setTimeout(finish, dur + 1500);
})();

/* ---------- юлдузли осмон ---------- */
(function () {
  const cv = $('#sky'), cx = cv.getContext('2d');
  let W, H, dpr, stars = [], shoots = [], mx = 0, my = 0, tx = 0, ty = 0;
  function size() {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    const n = Math.round(innerWidth * innerHeight / 7000);
    stars = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.2 + .3) * dpr, z: Math.random() * .8 + .2, p: Math.random() * 6.28, s: Math.random() * 1.5 + .5 }));
  }
  size(); addEventListener('resize', size);
  addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5); });
  let nextShoot = 1500;
  function draw(t) {
    cx.clearRect(0, 0, W, H);
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    for (const s of stars) {
      const a = .35 + .65 * (.5 + .5 * Math.sin(t / 1000 * s.s + s.p)) * s.z;
      const x = ((s.x - mx * 24 * s.z * dpr) % W + W) % W, y = ((s.y - my * 24 * s.z * dpr) % H + H) % H;
      cx.globalAlpha = reduce ? .7 * s.z : a; cx.fillStyle = '#cfe0ff';
      cx.beginPath(); cx.arc(x, y, s.r, 0, 6.283); cx.fill();
    }
    if (!reduce) {
      if (t > nextShoot) { shoots.push({ x: Math.random() * W * .9, y: Math.random() * H * .4, l: 0, v: (9 + Math.random() * 6) * dpr }); nextShoot = t + 2500 + Math.random() * 4000; }
      shoots = shoots.filter(s => s.l < 1);
      for (const s of shoots) {
        s.l += .02; s.x += s.v * .8; s.y += s.v * .5;
        const len = 120 * dpr, g = cx.createLinearGradient(s.x, s.y, s.x - len * .85, s.y - len * .53);
        g.addColorStop(0, 'rgba(190,215,255,' + (1 - s.l) + ')'); g.addColorStop(1, 'rgba(190,215,255,0)');
        cx.globalAlpha = 1; cx.strokeStyle = g; cx.lineWidth = 1.6 * dpr;
        cx.beginPath(); cx.moveTo(s.x, s.y); cx.lineTo(s.x - len * .85, s.y - len * .53); cx.stroke();
      }
    }
    cx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ---------- аватар силуэти ---------- */
function avatar(uid) {
  if (CONFIG.photo) return imgTag(CONFIG.photo, CONFIG.name);
  return `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMax slice" aria-label="Расм ўрни">
    <defs><linearGradient id="sk${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2b394"/><stop offset="1" stop-color="#c58f70"/></linearGradient>
    <linearGradient id="su${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3044"/><stop offset="1" stop-color="#151927"/></linearGradient></defs>
    <path d="M20 400c0-72 52-112 130-112s130 40 130 112z" fill="url(#su${uid})"/>
    <path d="M110 292 150 350 190 292 176 284H124z" fill="#f2f2f5"/>
    <path d="M124 284 150 350 110 292z M176 284 150 350 190 292z" fill="#0f1220"/>
    <rect x="132" y="236" width="36" height="52" rx="14" fill="url(#sk${uid})"/>
    <ellipse cx="150" cy="190" rx="52" ry="62" fill="url(#sk${uid})"/>
    <path d="M96 182c-6-52 28-84 62-82 40 2 58 34 48 84-8-26-20-38-48-40-24-2-50 10-62 38z" fill="#12141c"/>
  </svg>`;
}

/* ---------- Бош саҳифа ---------- */
function renderStatic() {
  $('#heroLead').textContent = CONFIG.lead;
  $('#strapTxt').textContent = CONFIG.nameLatin;
  $('#badgeName').textContent = CONFIG.nameLatin;
  $('#badgePhoto').innerHTML = avatar('b');
  $('#portrait').innerHTML = avatar('p');
  $('#aboutName').textContent = CONFIG.name;
  $('#bio').innerHTML = CONFIG.bio.map(p => `<p>${p}</p>`).join('') + `<a class="btn" href="#portfolio" data-to="portfolio">Лойиҳаларни кўриш ${ic('ext')}</a>`;
  const soc = CONFIG.socials.map(s => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}">${ic(s.id)}</a>`).join('');
  $('#heroSoc').innerHTML = soc; $('#footSoc').innerHTML = soc;
  $('#links').innerHTML = CONFIG.socials.map(s => `<a class="link" href="${s.url}" target="_blank" rel="noopener"><span class="ic">${ic(s.id)}</span><span><b>${s.name}</b><small>${s.handle}</small></span><span class="go">${ic('ext')}</span></a>`).join('');
  $('#mailTxt').textContent = CONFIG.email;
  $('#brand').textContent = CONFIG.brand;
  $('#copy').textContent = `© 2026 ${CONFIG.name}. Барча ҳуқуқлар сақланган.`;
  const row = x => `<div class="glass item"><div class="logo">${x.logo}</div><div><h4>${x.title}</h4><p>${x.sub}</p><div class="yrs">${x.years}</div></div></div>`;
  $('#edu').innerHTML = CONFIG.education.map(row).join('');
  $('#exp').innerHTML = CONFIG.experience.map(row).join('');
  $('#stats').innerHTML = CONFIG.stats.map(s => `<div class="glass stat"><div class="ic">${ic(s.icon)}</div><div class="n" data-n="${s.n}">${s.n}</div><div class="t"><b>${s.t}</b><span>${s.s}</span></div></div>`).join('');
}
renderStatic();

/* ёзилаётган матн */
(function () {
  const el = $('#typed');
  let pi = 0, ci = ((CONFIG.roles || [])[0] || '').length, del = true;
  el.textContent = (CONFIG.roles || [])[0] || '';
  window.__typedReset = () => { pi = 0; ci = ((CONFIG.roles || [])[0] || '').length; del = true; el.textContent = (CONFIG.roles || [])[0] || ''; };
  if (reduce) return;
  (function step() {
    const R = CONFIG.roles || [];
    if (!R.length) return setTimeout(step, 1000);
    pi = pi % R.length;
    const w = R[pi]; ci = Math.min(ci, w.length); el.textContent = w.slice(0, ci); let d = 60;
    if (del) { if (ci > 0) { ci--; d = 32; } else { del = false; pi = (pi + 1) % R.length; d = 280; } }
    else { if (ci < w.length) { ci++; d = 70; } else { del = true; d = 1700; } }
    setTimeout(step, d);
  })();
})();

/* ---------- осилиб турган бейдж ---------- */
(function () {
  const anchor = $('#lanAnchor'), group = $('#lanGroup'), card = $('#lanCard');
  let th = reduce ? 0 : .12, om = 0, drag = false, last = performance.now(), hist = [];
  const K = 13, C = 1.5;
  function frame(t) {
    const dt = Math.min(.033, (t - last) / 1000 || .016); last = t;
    if (!drag) { const f = reduce ? 0 : Math.sin(t / 2300) * .5; om += (-K * th - C * om + f) * dt; th += om * dt; }
    group.style.transform = `rotate(${th}rad)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  const ang = e => { const r = anchor.getBoundingClientRect(); return Math.max(-.75, Math.min(.75, Math.atan2(-(e.clientX - r.left), e.clientY - r.top))); };
  card.addEventListener('pointerdown', e => { drag = true; hist = []; card.setPointerCapture(e.pointerId); blip(300, .08, .05); });
  card.addEventListener('pointermove', e => { if (!drag) return; th = ang(e); hist.push([performance.now(), th]); hist = hist.filter(h => performance.now() - h[0] < 120); });
  const up = () => { if (!drag) return; drag = false; if (hist.length > 1) { const a = hist[0], b = hist[hist.length - 1]; om = Math.max(-8, Math.min(8, (b[1] - a[1]) / Math.max(.016, (b[0] - a[0]) / 1000))); } else om = 0; blip(220, .1, .04); };
  card.addEventListener('pointerup', up); card.addEventListener('pointercancel', up);
})();

/* ---------- навигация ---------- */
function goTo(id) { const el = document.getElementById(id); if (!el) return; closeView(); const y = id === 'home' ? 0 : el.getBoundingClientRect().top + scrollY - 10; scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); blip(600, .08); }
document.addEventListener('click', e => { const a = e.target.closest('[data-to]'); if (a) { e.preventDefault(); goTo(a.dataset.to); } });
const links = $$('#nav a[data-to]');
const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(l => l.classList.toggle('on', l.dataset.to === en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
['home', 'about', 'portfolio', 'contact'].forEach(id => io.observe(document.getElementById(id)));
const io2 = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.remove('glitch'); void en.target.offsetWidth; en.target.classList.add('glitch'); io2.unobserve(en.target); } }), { threshold: .8 });
$$('[data-glitch]').forEach(h => io2.observe(h));
const io3 = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return; io3.unobserve(en.target);
  if (reduce) return; const to = +en.target.dataset.n, t0 = performance.now();
  (function s(t) { const p = Math.min(1, (t - t0) / 1100); en.target.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(s); })(t0);
}), { threshold: .6 });
$$('.stat .n').forEach(n => io3.observe(n));

/* ---------- мусиқа плеер (кўриниш учун, овоз чиқмайди) ---------- */
(function () {
  const T = () => CONFIG.tracks || []; let cur = 0, pos = 0, playing = false, timer = null;
  const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  function paint() {
    if (!T().length) return; if (cur >= T().length) { cur = 0; pos = 0; }
    const t = T()[cur];
    $('#tTitle').textContent = t.t; $('#tArtist').textContent = t.a;
    $('#cover').style.background = `radial-gradient(circle at 30% 30%,${t.c[0]},transparent 60%),linear-gradient(135deg,${t.c[1]},#0a0a12)`;
    $('#tLen').textContent = fmt(t.d); $('#tNow').textContent = fmt(pos);
    $('#barFill').style.width = (pos / t.d * 100) + '%';
    $('#playBtn').innerHTML = ic(playing ? 'pause' : 'play'); $('#playBtn').setAttribute('aria-label', playing ? 'Тўхтатиш' : 'Ўйнатиш');
    $('#player').classList.toggle('playing', playing);
    $('#queue').innerHTML = T().map((x, i) => `<button type="button" data-i="${i}" class="${i === cur ? 'on' : ''}"><span><b>${x.t}</b><small>${x.a}</small></span><span class="d">${fmt(x.d)}</span></button>`).join('');
  }
  function run() { clearInterval(timer); if (!playing) return; timer = setInterval(() => { pos += .25; if (pos >= T()[cur].d) { cur = (cur + 1) % T().length; pos = 0; } paint(); }, 250); }
  $('#playBtn').onclick = () => { playing = !playing; run(); paint(); };
  $('#playlistBtn').onclick = () => { playing = true; run(); paint(); };
  $('#queue').onclick = e => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; pos = 0; playing = true; run(); paint(); };
  $('#bar').onclick = e => { const r = e.currentTarget.getBoundingClientRect(); pos = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * T()[cur].d; paint(); };
  window.__repaintPlayer = paint;
  paint();
})();

/* ---------- расмлар (SVG) ---------- */
function thumb(kind, w = 320, h = 180) {
  const A = '#2f6bff', B = '#6aa9ff';
  let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Лойиҳа расми"><defs><linearGradient id="g${kind}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0c1230"/><stop offset="1" stop-color="#05081a"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g${kind})"/>`;
  if (kind === 'dash') {
    s += `<rect x="12" y="12" width="296" height="14" rx="4" fill="#141c40"/><circle cx="22" cy="19" r="3" fill="#ff5f57"/><circle cx="32" cy="19" r="3" fill="#febc2e"/><circle cx="42" cy="19" r="3" fill="#28c840"/>`;
    [0, 1, 2].forEach(i => s += `<rect x="${14 + i * 99}" y="36" width="90" height="38" rx="6" fill="#111a3d" stroke="#25306a"/><rect x="${22 + i * 99}" y="44" width="34" height="5" rx="2" fill="#3b4a8c"/><rect x="${22 + i * 99}" y="55" width="52" height="9" rx="2" fill="${i == 1 ? '#3ecf8e' : B}"/>`);
    s += `<rect x="14" y="82" width="190" height="86" rx="6" fill="#111a3d" stroke="#25306a"/><polyline points="24,150 52,130 80,138 110,108 140,118 172,96 196,102" fill="none" stroke="${B}" stroke-width="2.5"/><polyline points="24,158 60,150 96,154 130,140 170,142 196,130" fill="none" stroke="#3b4a8c" stroke-width="2"/>`;
    s += `<rect x="212" y="82" width="94" height="86" rx="6" fill="#111a3d" stroke="#25306a"/>` + [0, 1, 2, 3].map(i => `<rect x="222" y="${92 + i * 18}" width="${70 - i * 8}" height="8" rx="3" fill="${i === 0 ? A : '#25306a'}"/>`).join('');
  } else if (kind === 'bot') {
    s += `<rect x="12" y="12" width="296" height="12" rx="4" fill="#0d1535"/><rect x="18" y="16" width="30" height="4" rx="2" fill="${B}"/>`;
    s += `<rect x="60" y="34" width="200" height="62" rx="8" fill="#0f1738" stroke="#25306a"/><circle cx="160" cy="58" r="17" fill="#1b2756" stroke="${B}" stroke-width="2"/><circle cx="160" cy="58" r="8" fill="${A}"/><rect x="128" y="80" width="64" height="6" rx="3" fill="#3b4a8c"/>`;
    s += `<rect x="60" y="104" width="97" height="64" rx="8" fill="#0f1738" stroke="#25306a"/><rect x="103" y="116" width="12" height="12" rx="3" fill="#22d3ee"/><rect x="82" y="138" width="54" height="5" rx="2" fill="#3b4a8c"/><rect x="88" y="152" width="42" height="8" rx="3" fill="none" stroke="#22d3ee"/>`;
    s += `<rect x="163" y="104" width="97" height="64" rx="8" fill="#0f1738" stroke="#25306a"/><rect x="206" y="116" width="12" height="12" rx="3" fill="#3ecf8e"/><rect x="185" y="138" width="54" height="5" rx="2" fill="#3b4a8c"/><rect x="191" y="152" width="42" height="8" rx="3" fill="none" stroke="#3ecf8e"/>`;
  } else {
    s += `<rect x="12" y="12" width="296" height="12" rx="4" fill="#0d1535"/>`;
    s += `<text x="160" y="60" fill="#fff" font-size="15" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">Талабалар базаси</text><text x="160" y="76" fill="${B}" font-size="9" text-anchor="middle" font-family="Inter,sans-serif">11-А синф</text>`;
    s += `<rect x="90" y="92" width="140" height="18" rx="5" fill="#0f1738" stroke="#25306a"/><rect x="98" y="99" width="50" height="4" rx="2" fill="#3b4a8c"/><rect x="90" y="118" width="140" height="18" rx="5" fill="#0f1738" stroke="#25306a"/><rect x="98" y="125" width="70" height="4" rx="2" fill="#3b4a8c"/><rect x="90" y="146" width="140" height="18" rx="5" fill="${A}"/><rect x="140" y="153" width="40" height="4" rx="2" fill="#fff"/>`;
  }
  return s + '</svg>';
}
function certArt(title, id) {
  return `<svg viewBox="0 0 300 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Сертификат"><defs><linearGradient id="c${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e8b4"/><stop offset="1" stop-color="#d9b85f"/></linearGradient></defs>
  <rect width="300" height="210" fill="url(#c${id})"/><rect x="10" y="10" width="280" height="190" fill="none" stroke="#8a6a1f" stroke-width="2"/><rect x="16" y="16" width="268" height="178" fill="none" stroke="#8a6a1f" stroke-width=".8"/>
  <text x="150" y="52" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="#6b4e12" letter-spacing="3">СЕРТИФИКАТ</text>
  <text x="150" y="86" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#6b4e12">${CONFIG.name}</text>
  <rect x="70" y="96" width="160" height="1" fill="#8a6a1f"/>
  <text x="150" y="122" text-anchor="middle" font-family="Georgia,serif" font-size="11" font-weight="700" fill="#4a3508">${title}</text>
  <circle cx="60" cy="168" r="14" fill="none" stroke="#8a6a1f" stroke-width="1.5"/><circle cx="60" cy="168" r="8" fill="#8a6a1f" opacity=".5"/>
  <rect x="200" y="172" width="64" height="1" fill="#8a6a1f"/></svg>`;
}

/* ---------- Портфолио ---------- */
const TABS = [['projects', 'code', 'Лойиҳалар'], ['certs', 'award', 'Сертификатлар'], ['awards', 'trophy', 'Ютуқлар'], ['tech', 'chip', 'Технологиялар']];
let tab = 'projects';
try { const s = sessionStorage.getItem('tab'); if (s && TABS.some(t => t[0] === s)) tab = s; } catch (e) {}
const techColor = { Python: '#ffd43b', HTML: '#e44d26', CSS: '#1572b6', JavaScript: '#f7df1e', 'VS Code': '#3aa0f3', Gemini: '#8ab4ff', Chromium: '#4f8cff', PHP: '#8892bf', MySQL: '#00a2d8', XAMPP: '#fb7a24' };
function renderTabs() {
  $('#tabs').innerHTML = TABS.map(([k, i, t]) => `<button class="tab" role="tab" type="button" data-k="${k}" aria-selected="${k === tab}">${ic(i)} ${t}</button>`).join('');
}
function renderPanel() {
  const p = $('#panel');
  if (tab === 'projects') p.innerHTML = `<div class="grid3">${CONFIG.projects.map(x => `<article class="glass card"><div class="shot">${x.image ? imgTag(x.image, x.title) : thumb(x.kind)}</div><h3>${x.title}</h3><p>${x.desc}</p><a class="btn sm" href="#project-${x.id}">Батафсил ${ic('arrow')}</a></article>`).join('')}</div>`;
  else if (tab === 'certs') p.innerHTML = `<div class="grid3">${CONFIG.certs.map((x, i) => `<article class="glass card cert"><div class="shot">${x.image ? imgTag(x.image, x.t) : certArt(x.t, 'c' + i)}</div><h3>${x.t}</h3><p>${x.by}</p><small>${x.y}</small></article>`).join('')}</div>`;
  else if (tab === 'awards') p.innerHTML = `<div class="grid3">${CONFIG.awards.map((x, i) => `<article class="glass card cert"><div class="shot">${x.image ? imgTag(x.image, x.t) : certArt(x.t, 'a' + i)}</div><h3>${x.t}</h3><p>${x.by}</p><small>${x.y}</small></article>`).join('')}</div>`;
  else p.innerHTML = `<div class="tech">${CONFIG.tech.map(x => `<div class="tile"><i style="background:${x.bg};color:${x.fg}">${x.t}</i>${x.n}</div>`).join('')}</div>`;
}
$('#tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (!b) return; tab = b.dataset.k; try { sessionStorage.setItem('tab', tab); } catch (e) {} renderTabs(); renderPanel(); blip(700, .06); });
renderTabs(); renderPanel();

/* лойиҳа саҳифаси */
const view = $('#view');
function openProject(id) {
  const x = CONFIG.projects.find(p => p.id === id); if (!x) return closeView();
  $('#viewIn').innerHTML = `<div class="crumbs"><a class="btn" href="#" id="back">${ic('back')} Орқага</a><span>Лойиҳалар</span><span>›</span><b>${x.title}</b></div>
    <div class="v-grid"><div><h1>${x.title}</h1><p>${x.desc}</p><h4>${ic('code')} Ишлатилган технологиялар</h4><div class="chips">${x.tech.map(t => `<span class="chip"><i style="background:${techColor[t] || '#6aa9ff'}"></i>${t}</span>`).join('')}</div></div><div class="v-shot">${x.image ? imgTag(x.image, x.title) : thumb(x.kind, 320, 180)}</div></div>`;
  view.hidden = false; view.scrollTop = 0; document.documentElement.style.overflow = 'hidden';
  $('#back').onclick = e => { e.preventDefault(); location.hash = ''; closeView(); };
  $('#back').focus({ preventScroll: true });
}
function closeView() { if (view.hidden) return; view.hidden = true; document.documentElement.style.overflow = ''; }
function loadAdmin() {
  if (window.openAdmin) return window.openAdmin();
  if (document.getElementById('adminJs')) return;
  const s = document.createElement('script'); s.id = 'adminJs'; s.src = 'admin.js'; document.head.appendChild(s);
}
function route() {
  const m = location.hash.match(/^#project-([a-z0-9-]+)$/);
  m ? openProject(m[1]) : closeView();
  if (location.hash === '#admin') loadAdmin();
}
addEventListener('hashchange', route);
addEventListener('keydown', e => { if (e.key === 'Escape' && !view.hidden) { location.hash = ''; closeView(); } });
route();

/* ---------- Алоқа ---------- */
let toastT;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3400); }
const SET = () => CONFIG.settings || {};
const hasMsg = () => !!SET().web3formsKey;
const hasCm = () => !!(SET().supabaseUrl && SET().supabaseKey);

$('#copyMail').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(CONFIG.email); toast('Эл. почта нусхаланди'); }
  catch (e) { const r = document.createRange(); r.selectNodeContents($('#mailTxt')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Манзил белгиланди, нусхалаб олинг'); }
});
function note(el, msg, cls) { el.textContent = msg; el.className = 'note ' + (cls || ''); }
function canSend(key, ms) { try { return Date.now() - (+localStorage.getItem(key) || 0) > ms; } catch (e) { return true; } }
function markSent(key) { try { localStorage.setItem(key, String(Date.now())); } catch (e) {} }

/* почтага юбориш: Web3Forms */
async function web3(payload) {
  const r = await fetch('https://api.web3forms.com/submit', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ access_key: SET().web3formsKey, botcheck: '', ...payload })
  });
  let j = {}; try { j = await r.json(); } catch (e) {}
  if (!r.ok || j.success === false) throw new Error(j.message || 'HTTP ' + r.status);
  return j;
}
/* изоҳлар базаси: Supabase (REST) */
async function sb(query, opts = {}) {
  const k = SET().supabaseKey, base = SET().supabaseUrl.replace(/\/+$/, '') + '/rest/v1/comments';
  const h = { apikey: k, 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (/^eyJ/.test(k)) h.Authorization = 'Bearer ' + k;
  const r = await fetch(base + (query || ''), { ...opts, headers: h });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return opts.method === 'POST' ? null : r.json();
}

$('#msgForm').addEventListener('submit', async e => {
  e.preventDefault();
  const n = $('#mName').value.trim(), m = $('#mMail').value.trim(), t = $('#mText').value.trim(), N = $('#msgNote'), btn = e.submitter || $('#msgForm button');
  if (!n || t.length < 3) return note(N, 'Исм ва хабар матнини ёзинг.', 'err');
  if (!/^\S+@\S+\.\S+$/.test(m)) return note(N, 'Эл. почта манзили нотўғри кўринади.', 'err');
  if ($('#mBot').value) return note(N, 'Хабар юборилди. Раҳмат!', 'ok');
  if (!canSend('lastMsg', 30000)) return note(N, 'Бироз кутинг ва қайта юборинг.', 'err');
  btn.disabled = true; note(N, 'Юборилмоқда...');
  try {
    await web3({ subject: 'Портфолиодан янги хабар: ' + n, from_name: n, name: n, email: m, message: t });
    markSent('lastMsg'); e.target.reset(); note(N, 'Хабарингиз юборилди. Раҳмат!', 'ok');
  } catch (err) { note(N, 'Юбориб бўлмади. Бироздан кейин қайта уриниб кўринг ёки эл. почтага ёзинг.', 'err'); }
  btn.disabled = false;
});

const pad2 = n => String(n).padStart(2, '0');
function fmtDate(s) { const d = new Date(s); return isNaN(d) ? '' : `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`; }
function drawComments(list) {
  const box = $('#comments'); box.innerHTML = '';
  if (!list.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'Ҳали изоҳ йўқ. Биринчи бўлиб ёзинг.'; box.append(p); return; }
  list.forEach(c => {
    const d = document.createElement('div'); d.className = 'cm';
    const a = document.createElement('div'); a.className = 'av'; a.textContent = initials(c.name || '?');
    const b = document.createElement('div'), h = document.createElement('div');
    const bn = document.createElement('b'); bn.textContent = c.name; const sm = document.createElement('small'); sm.textContent = fmtDate(c.created_at);
    h.append(bn, sm); const p = document.createElement('p'); p.textContent = c.text; b.append(h, p); d.append(a, b); box.append(d);
  });
}
let cmKey = '';
async function loadComments() {
  if (!hasCm()) return;
  const key = SET().supabaseUrl + '|' + SET().supabaseKey; if (key === cmKey) return; cmKey = key;
  try { drawComments(await sb('?select=name,text,created_at&approved=eq.true&order=created_at.desc&limit=50')); }
  catch (e) { const box = $('#comments'); box.innerHTML = ''; const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'Изоҳларни юклаб бўлмади.'; box.append(p); }
}
$('#cmForm').addEventListener('submit', async e => {
  e.preventDefault();
  const n = $('#cName').value.trim(), t = $('#cText').value.trim(), N = $('#cmNote'), btn = e.submitter || $('#cmForm button');
  if (!n || !t) return note(N, 'Исм ва изоҳ матнини ёзинг.', 'err');
  if (n.length > 40 || t.length > 400) return note(N, 'Исм 40 тагача, изоҳ 400 тагача белгидан иборат бўлсин.', 'err');
  if ($('#cBot').value) return note(N, 'Изоҳингиз қабул қилинди.', 'ok');
  if (!canSend('lastCm', 60000)) return note(N, 'Бир дақиқадан кейин қайта юборинг.', 'err');
  btn.disabled = true; note(N, 'Юборилмоқда...');
  try {
    await sb('', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ name: n, text: t }) });
    markSent('lastCm'); e.target.reset();
    note(N, 'Изоҳингиз қабул қилинди. Текширувдан кейин саҳифада кўринади.', 'ok');
    if (hasMsg()) web3({ subject: 'Янги изоҳ тасдиқ кутмоқда', from_name: n, name: n, message: t }).catch(() => {});
  } catch (err) { note(N, 'Юбориб бўлмади. Бироздан кейин қайта уриниб кўринг.', 'err'); }
  btn.disabled = false;
});

/* алоқа бўлимини созламаларга қараб кўрсатиш */
function renderContact() {
  const a = hasMsg(), b = hasCm();
  $('#msgBox').hidden = !a; $('#cmPanel').hidden = !b;
  $('#msgTitle').textContent = a ? 'Хабар қолдиринг' : 'Боғланиш';
  $('#contactGrid').classList.toggle('one', !b);
  if (b) loadComments();
}
function applySeo() {
  const s = CONFIG.seo || {};
  if (s.title) { document.title = s.title; const o = document.querySelector('meta[property="og:title"]'); if (o) o.content = s.title; }
  if (s.description) { const d = document.querySelector('meta[name="description"]'); if (d) d.content = s.description; const o = document.querySelector('meta[property="og:description"]'); if (o) o.content = s.description; }
}
function renderAll() {
  renderStatic(); renderTabs(); renderPanel(); renderContact(); applySeo();
  if (window.__repaintPlayer) window.__repaintPlayer();
  if (window.__typedReset) window.__typedReset();
  if (!view.hidden) route();
}
window.SiteApp = { render: renderAll, toast, imgSrc, imgCache };
renderContact(); applySeo();
