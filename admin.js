/* Таҳрирлаш режими. Сайтнинг охирига #admin қўшиб очилади (масалан: https://USERNAME.github.io/#admin).
   Маълумотлар GitHub'даги content.js файлига ёзилади, расмлар assets/ папкасига юкланади.
   Токен фақат шу браузерда туради ва фақат api.github.com'га юборилади. */
(function () {
  'use strict';
  if (window.openAdmin) { window.openAdmin(); return; }
  const App = window.SiteApp, C = window.SITE;
  C.settings = C.settings || {}; C.seo = C.seo || {};
  const LS = 'adm-gh';
  let gh = null, dirty = false, timer = null;

  const $ = (s, r = document) => r.querySelector(s);
  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') e.className = v;
      else if (k === 'value') e.value = v;
      else if (k.startsWith('on')) e[k] = v;
      else if (v === true) e.setAttribute(k, '');
      else if (v !== false && v != null) e.setAttribute(k, v);
    }
    kids.flat().forEach(c => { if (c != null) e.append(c.nodeType ? c : document.createTextNode(c)); });
    return e;
  }

  /* ---------- услублар ---------- */
  document.head.append(h('style', {}, `
  #adm{position:fixed;top:0;right:0;bottom:0;width:min(450px,100vw);z-index:95;background:#080c20;border-left:1px solid rgba(190,210,255,.3);display:flex;flex-direction:column;box-shadow:-20px 0 60px rgba(0,0,0,.55);font-size:14px;color:#eef1ff}
  #adm .hd{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid rgba(160,185,255,.14);flex-wrap:wrap}
  #adm .hd b{font-size:15px}
  #adm .st{flex:1 1 100%;font-size:12px;color:#8e97b8;min-height:1.2em;order:3}
  #adm .st.ok{color:#7fe3a8}#adm .st.err{color:#ff8e9b}
  #adm .bd{overflow:auto;flex:1;padding:12px 14px 40px;display:grid;gap:10px;align-content:start}
  #adm .grp,#adm .it{border:1px solid rgba(160,185,255,.14);border-radius:12px;background:rgba(255,255,255,.02)}
  #adm .grp>summary{padding:12px 14px;font-weight:700;cursor:pointer}
  #adm .gb{padding:4px 12px 14px;display:grid;gap:12px}
  #adm .gn{margin:0;color:#8e97b8;font-size:12.5px;line-height:1.5}
  #adm .it{background:rgba(10,15,40,.7)}
  #adm .it>summary{padding:9px 10px;cursor:pointer;display:flex;align-items:center;gap:6px;list-style:none}
  #adm .it>summary::-webkit-details-marker{display:none}
  #adm .it>summary b{flex:1;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #adm .ib{border:1px solid rgba(160,185,255,.2);background:transparent;color:#c9d0ee;border-radius:7px;width:28px;height:28px;font-size:13px;line-height:1}
  #adm .ib:hover{background:rgba(255,255,255,.08)}
  #adm .ib.del:hover{background:rgba(255,80,100,.2);color:#ff9aa6}
  #adm .ib:disabled{opacity:.3;cursor:default}
  #adm .ic{padding:4px 12px 12px;display:grid;gap:12px}
  #adm .af{display:grid;gap:5px}
  #adm .af>span{font-size:12px;font-weight:600;color:#aeb7d8}
  #adm input[type=text],#adm input[type=number],#adm input[type=url],#adm textarea,#adm select{width:100%;background:#050818;color:#eef1ff;border:1px solid rgba(160,185,255,.2);border-radius:8px;padding:9px 10px;font:inherit;font-size:13px}
  #adm textarea{resize:vertical;min-height:70px}
  #adm input:focus,#adm textarea:focus,#adm select:focus{outline:2px solid #2f6bff;outline-offset:0}
  #adm input[type=color]{width:52px;height:34px;padding:2px;background:#050818;border:1px solid rgba(160,185,255,.2);border-radius:8px}
  #adm .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  #adm .ap{max-width:100%;max-height:120px;border-radius:8px;border:1px solid rgba(160,185,255,.2);object-fit:cover;justify-self:start}
  #adm .pth{font-family:var(--font-mono);font-size:11px;color:#8e97b8;word-break:break-all}
  .ab{border:1px solid rgba(160,185,255,.25);background:rgba(255,255,255,.05);color:#eef1ff;border-radius:9px;padding:8px 12px;font:inherit;font-size:13px;font-weight:600;cursor:pointer}
  .ab:hover{background:rgba(255,255,255,.1)}
  .ab.pri{background:#2f6bff;border-color:transparent}
  .ab.pri:hover{background:#4a80ff}
  .ab.ghost{background:transparent}
  .ab:disabled{opacity:.5;cursor:default}
  #admLogin{position:fixed;inset:0;z-index:96;background:rgba(2,3,11,.82);backdrop-filter:blur(6px);display:grid;place-items:center;padding:16px}
  #admLogin form{width:min(440px,100%);background:#0a1030;border:1px solid rgba(190,210,255,.3);border-radius:16px;padding:22px;display:grid;gap:14px;color:#eef1ff}
  #admLogin h3{margin:0;font-size:20px}
  #admLogin p{margin:0;color:#8e97b8;font-size:13px;line-height:1.55}
  #admLogin label.ck{display:flex;gap:8px;align-items:center;font-size:13px;color:#c9d0ee}
  #admLogin .er{color:#ff8e9b;font-size:13px;min-height:1.2em}
  #admLogin input[type=text],#admLogin input[type=password]{width:100%;background:#050818;color:#eef1ff;border:1px solid rgba(160,185,255,.2);border-radius:8px;padding:10px;font:inherit;font-size:14px}
  `));

  /* ---------- GitHub API ---------- */
  const enc = s => { const b = new TextEncoder().encode(s); let bin = ''; for (let i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(bin); };
  const dec = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), c => c.charCodeAt(0)));
  async function api(path, opts = {}) {
    const r = await fetch('https://api.github.com' + path, {
      ...opts,
      headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + gh.token, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.headers || {}) }
    });
    let j = null; try { j = await r.json(); } catch (e) {}
    if (!r.ok) { const err = new Error((j && j.message) || 'HTTP ' + r.status); err.status = r.status; throw err; }
    return j;
  }
  function errMsg(e) {
    if (e.status === 401) return 'Токен нотўғри ёки муддати тугаган.';
    if (e.status === 403) return 'Рухсат йўқ: токенда Contents → Read and write бўлиши керак.';
    if (e.status === 404) return 'Репозиторий ёки файл топилмади. Номини ва токен рухсатини текширинг.';
    if (e.status === 409 || e.status === 422) return 'Файл бошқа жойда ўзгарган. Саҳифани янгилаб, қайта киринг.';
    if (/fetch|network/i.test(e.message)) return 'Интернет билан алоқа йўқ.';
    return e.message;
  }
  const contentText = () => 'window.SITE = ' + JSON.stringify(C, null, 2) + ';\n';
  function parseContent(txt) { return JSON.parse(txt.slice(txt.indexOf('=') + 1, txt.lastIndexOf(';'))); }
  function guessRepo() {
    const host = location.hostname;
    if (!host.endsWith('.github.io')) return '';
    const p = location.pathname.split('/').filter(Boolean)[0];
    return host.split('.')[0] + '/' + (p && !p.includes('.') ? p : host);
  }

  async function login(repo, branch, token) {
    gh = { repo, branch, token, sha: null };
    const info = await api(`/repos/${repo}`);
    if (info.permissions && info.permissions.push === false) { const e = new Error('Бу репозиторийга ёзиш рухсатингиз йўқ.'); throw e; }
    const j = await api(`/repos/${repo}/contents/content.js?ref=${encodeURIComponent(branch)}`);
    gh.sha = j.sha;
    const data = parseContent(dec(j.content));
    Object.keys(C).forEach(k => delete C[k]);
    Object.assign(C, data);
    C.settings = C.settings || {}; C.seo = C.seo || {};
    App.render();
  }

  /* ---------- расм юклаш ---------- */
  async function uploadImage(file, max) {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
    const cx = cv.getContext('2d'); cx.fillStyle = '#0a1230'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(bmp, 0, 0, cv.width, cv.height);
    const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.86));
    const dataUrl = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
    const path = 'assets/img-' + Date.now().toString(36) + '.jpg';
    await api(`/repos/${gh.repo}/contents/${path}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Расм қўшилди', content: dataUrl.split(',')[1], branch: gh.branch })
    });
    App.imgCache[path] = dataUrl;
    return path;
  }

  /* ---------- шакл элементлари ---------- */
  const hex6 = v => /^#[0-9a-f]{6}$/i.test(v) ? v : /^#[0-9a-f]{3}$/i.test(v) ? '#' + [...v.slice(1)].map(c => c + c).join('') : '#000000';
  function setStatus(msg, cls) { const s = $('#admSt'); if (s) { s.textContent = msg || ''; s.className = 'st ' + (cls || ''); } }
  function change() {
    dirty = true;
    const b = $('#admSave'); if (b) { b.disabled = false; b.textContent = 'Сақлаш •'; }
    setStatus('Сақланмаган ўзгаришлар бор');
    clearTimeout(timer); timer = setTimeout(() => App.render(), 200);
  }

  function fieldEl(obj, d) {
    if (d.t === 'image') return imageField(obj, d);
    const w = h('label', { class: 'af' }, h('span', {}, d.l));
    let el;
    if (d.t === 'area' || d.t === 'lines') {
      el = h('textarea', { rows: d.t === 'area' ? 4 : 3, value: d.t === 'lines' ? (obj[d.k] || []).join('\n') : (obj[d.k] ?? '') });
      el.oninput = () => { obj[d.k] = d.t === 'lines' ? el.value.split('\n').map(s => s.trim()).filter(Boolean) : el.value; change(); };
    } else if (d.t === 'csv') {
      el = h('input', { type: 'text', value: (obj[d.k] || []).join(', ') });
      el.oninput = () => { obj[d.k] = el.value.split(',').map(s => s.trim()).filter(Boolean); change(); };
    } else if (d.t === 'number') {
      el = h('input', { type: 'number', value: obj[d.k] ?? 0 });
      el.oninput = () => { obj[d.k] = +el.value || 0; change(); };
    } else if (d.t === 'select') {
      el = h('select', {}, d.o.map(([v, l]) => h('option', { value: v }, l))); el.value = obj[d.k] ?? d.o[0][0];
      el.onchange = () => { obj[d.k] = el.value; change(); };
    } else if (d.t === 'color') {
      el = h('input', { type: 'color', value: hex6(obj[d.k]) });
      el.oninput = () => { obj[d.k] = el.value; change(); };
    } else {
      el = h('input', { type: 'text', value: obj[d.k] ?? '', autocomplete: 'off' });
      el.oninput = () => { obj[d.k] = el.value; change(); };
    }
    if (d.ph) el.placeholder = d.ph;
    w.append(el); return w;
  }
  function imageField(obj, d) {
    const prev = h('img', { class: 'ap', alt: '' }), path = h('code', { class: 'pth' });
    const sync = () => { const v = obj[d.k]; prev.hidden = !v; if (v) prev.src = App.imgSrc(v); path.textContent = v || 'Расм танланмаган'; };
    const file = h('input', { type: 'file', accept: 'image/*', hidden: true });
    file.onchange = async () => {
      const f = file.files[0]; if (!f) return;
      setStatus('Расм юкланмоқда...');
      try { obj[d.k] = await uploadImage(f, d.max || 1000); sync(); change(); setStatus('Расм юкланди. Энди «Сақлаш» ни босинг.', 'ok'); }
      catch (e) { setStatus(errMsg(e), 'err'); }
      file.value = '';
    };
    const w = h('div', { class: 'af' }, h('span', {}, d.l), prev, path,
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'ab', onclick: () => file.click() }, 'Расм юклаш'),
        h('button', { type: 'button', class: 'ab ghost', onclick: () => { obj[d.k] = ''; sync(); change(); } }, 'Олиб ташлаш')), file);
    sync(); return w;
  }

  /* ---------- бўлимлар схемаси ---------- */
  const ICONS = [['github', 'GitHub'], ['instagram', 'Instagram'], ['send', 'Telegram'], ['youtube', 'YouTube'], ['linkedin', 'LinkedIn'], ['link', 'Бошқа ҳавола']];
  const uid = () => 'p-' + Date.now().toString(36);
  const GROUPS = [
    { t: 'Умумий маълумот', obj: () => C, fields: [
      { k: 'name', l: 'Исм (кирилл)', t: 'text' }, { k: 'nameLatin', l: 'Исм (лотин)', t: 'text' },
      { k: 'brand', l: 'Бренд (футерда)', t: 'text' }, { k: 'email', l: 'Эл. почта', t: 'text' },
      { k: 'photo', l: 'Шахсий расм', t: 'image', max: 900 },
      { k: 'roles', l: 'Касблар (ҳар бири алоҳида қаторда, ёзилиб туради)', t: 'lines' },
      { k: 'lead', l: 'Бош саҳифа матни', t: 'area' },
      { k: 'bio', l: '«Ҳақимда» матни (ҳар қатор алоҳида абзац)', t: 'lines' } ] },
    { t: 'Ижтимоий тармоқлар', list: 'socials', title: x => x.name, make: () => ({ id: 'link', name: '', handle: '', url: 'https://' }), item: [
      { k: 'id', l: 'Тури', t: 'select', o: ICONS }, { k: 'name', l: 'Номи', t: 'text' }, { k: 'handle', l: 'Юзернейм', t: 'text' }, { k: 'url', l: 'Ҳавола', t: 'text' } ] },
    { t: 'Таълим', list: 'education', title: x => x.title, make: () => ({ logo: '', title: '', sub: '', years: '' }), item: [
      { k: 'logo', l: 'Қисқа белги (2–3 ҳарф)', t: 'text' }, { k: 'title', l: 'Ўқув юрти', t: 'text' }, { k: 'sub', l: 'Тавсиф', t: 'text' }, { k: 'years', l: 'Йиллар', t: 'text' } ] },
    { t: 'Тажриба', list: 'experience', title: x => x.title, make: () => ({ logo: '', title: '', sub: '', years: '' }), item: [
      { k: 'logo', l: 'Қисқа белги (2–3 ҳарф)', t: 'text' }, { k: 'title', l: 'Лавозим / иш жойи', t: 'text' }, { k: 'sub', l: 'Тавсиф', t: 'text' }, { k: 'years', l: 'Йиллар', t: 'text' } ] },
    { t: 'Рақамлар', list: 'stats', title: x => x.t, make: () => ({ icon: 'code', n: 0, t: '', s: '' }), item: [
      { k: 'icon', l: 'Белги', t: 'select', o: [['code', 'Код'], ['award', 'Сертификат'], ['trophy', 'Кубок']] },
      { k: 'n', l: 'Сон', t: 'number' }, { k: 't', l: 'Сарлавҳа', t: 'text' }, { k: 's', l: 'Изоҳ', t: 'text' } ] },
    { t: 'Лойиҳалар', list: 'projects', title: x => x.title, make: () => ({ id: uid(), kind: 'dash', title: '', desc: '', tech: [] }), item: [
      { k: 'title', l: 'Номи', t: 'text' }, { k: 'desc', l: 'Тавсиф', t: 'area' },
      { k: 'tech', l: 'Технологиялар (вергул билан)', t: 'csv', ph: 'Python, HTML, CSS' },
      { k: 'image', l: 'Скриншот', t: 'image', max: 1400 },
      { k: 'kind', l: 'Расм бўлмаса, чизма тури', t: 'select', o: [['dash', 'Панел'], ['bot', 'Бот / AI'], ['form', 'Форма']] } ] },
    { t: 'Сертификатлар', list: 'certs', title: x => x.t, make: () => ({ t: '', by: '', y: '' }), item: [
      { k: 't', l: 'Номи', t: 'text' }, { k: 'by', l: 'Ким берган', t: 'text' }, { k: 'y', l: 'Йил', t: 'text' }, { k: 'image', l: 'Сертификат расми', t: 'image', max: 1400 } ] },
    { t: 'Ютуқлар', list: 'awards', title: x => x.t, make: () => ({ t: '', by: '', y: '' }), item: [
      { k: 't', l: 'Номи', t: 'text' }, { k: 'by', l: 'Изоҳ', t: 'text' }, { k: 'y', l: 'Йил', t: 'text' }, { k: 'image', l: 'Расм', t: 'image', max: 1400 } ] },
    { t: 'Технологиялар', list: 'tech', title: x => x.n, make: () => ({ n: '', bg: '#1b2756', fg: '#ffffff', t: '' }), item: [
      { k: 'n', l: 'Номи', t: 'text' }, { k: 't', l: 'Қисқа белги (1–3 ҳарф)', t: 'text' }, { k: 'bg', l: 'Фон ранги', t: 'color' }, { k: 'fg', l: 'Ёзув ранги', t: 'color' } ] },
    { t: 'Мусиқа плеери', list: 'tracks', title: x => x.t, make: () => ({ t: '', a: '', d: 180, c: ['#35d0ba', '#1b3a9e'] }), item: [
      { k: 't', l: 'Трек номи', t: 'text' }, { k: 'a', l: 'Ижрочи', t: 'text' }, { k: 'd', l: 'Давомийлиги (сония)', t: 'number' } ] },
    { t: 'Қидирув (SEO)', obj: () => C.seo, note: 'Бу матн браузер сарлавҳасида ва қидирув натижаларида кўринади. Исмингизни кирилл ва лотинда ёзинг.', fields: [
      { k: 'title', l: 'Сайт сарлавҳаси', t: 'text' }, { k: 'description', l: 'Қисқа тавсиф (150–160 белги)', t: 'area' } ] },
    { t: 'Уланишлар (почта ва изоҳлар)', obj: () => C.settings, note: 'Бу калитлар ошкора бўлиши мумкин, улар учун яратилган. Supabase’нинг «service_role» калитини бу ерга ҚЎЙМАНГ. Қандай олиниши README файлида ёзилган.', fields: [
      { k: 'web3formsKey', l: 'Web3Forms Access Key (алоқа формаси почтангизга келади)', t: 'text' },
      { k: 'supabaseUrl', l: 'Supabase Project URL (изоҳлар учун)', t: 'text', ph: 'https://xxxx.supabase.co' },
      { k: 'supabaseKey', l: 'Supabase anon / publishable калити', t: 'text' } ] }
  ];

  function renderList(g, host) {
    const arr = C[g.key = g.list] = C[g.list] || [];
    host.innerHTML = '';
    arr.forEach((it, i) => {
      const nm = h('b', {}, g.title(it) || '(номсиз)');
      const mv = (dx) => (ev) => { ev.preventDefault(); ev.stopPropagation(); const j = i + dx; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; renderList(g, host); change(); };
      const del = (ev) => { ev.preventDefault(); ev.stopPropagation(); if (!confirm('«' + (g.title(it) || 'номсиз') + '» ўчирилсинми?')) return; arr.splice(i, 1); renderList(g, host); change(); };
      const sum = h('summary', {}, nm,
        h('button', { type: 'button', class: 'ib', title: 'Юқорига', disabled: i === 0, onclick: mv(-1) }, '↑'),
        h('button', { type: 'button', class: 'ib', title: 'Пастга', disabled: i === arr.length - 1, onclick: mv(1) }, '↓'),
        h('button', { type: 'button', class: 'ib del', title: 'Ўчириш', onclick: del }, '✕'));
      const body = h('div', { class: 'ic' });
      g.item.forEach(d => {
        const f = fieldEl(it, d);
        const inp = f.querySelector('input,textarea,select');
        if (inp && !d.t.match(/image/)) { const prev = inp.oninput || inp.onchange; const evt = inp.oninput ? 'oninput' : 'onchange'; inp[evt] = e => { prev(e); nm.textContent = g.title(it) || '(номсиз)'; }; }
        body.append(f);
      });
      host.append(h('details', { class: 'it' }, sum, body));
    });
    host.append(h('button', { type: 'button', class: 'ab', onclick: () => { arr.push(g.make()); renderList(g, host); const ds = host.querySelectorAll('details.it'); const last = ds[ds.length - 1]; last.open = true; last.scrollIntoView({ block: 'nearest' }); change(); } }, '+ Қўшиш'));
  }

  /* ---------- сақлаш ---------- */
  async function save() {
    const b = $('#admSave'); b.disabled = true; setStatus('Сақланмоқда...');
    try {
      const j = await api(`/repos/${gh.repo}/contents/content.js`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Сайт маълумотлари янгиланди', content: enc(contentText()), sha: gh.sha, branch: gh.branch })
      });
      gh.sha = j.content.sha; dirty = false; b.textContent = 'Сақлаш';
      setStatus('Сақланди. Сайт 1–2 дақиқада янгиланади.', 'ok');
    } catch (e) { b.disabled = false; setStatus(errMsg(e), 'err'); }
  }

  function closeAdmin(logout) {
    if (dirty && !confirm('Сақланмаган ўзгаришлар бор. Барибир ёпилсинми?')) return;
    dirty = false; const d = $('#adm'); if (d) d.remove();
    if (logout) { gh = null; try { localStorage.removeItem(LS); } catch (e) {} }
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (location.hash) location.hash = '';
  }

  function buildDrawer() {
    const body = h('div', { class: 'bd' });
    GROUPS.forEach(g => {
      const host = h('div', { class: 'gb' });
      if (g.list) renderList(g, host);
      else { if (g.note) host.append(h('p', { class: 'gn' }, g.note)); g.fields.forEach(f => host.append(fieldEl(g.obj(), f))); }
      body.append(h('details', { class: 'grp' }, h('summary', {}, g.t), host));
    });
    const drawer = h('aside', { id: 'adm', 'aria-label': 'Таҳрирлаш' },
      h('div', { class: 'hd' }, h('b', {}, 'Таҳрирлаш'),
        h('span', { style: 'flex:1' }),
        h('button', { type: 'button', id: 'admSave', class: 'ab pri', disabled: true, onclick: save }, 'Сақлаш'),
        h('button', { type: 'button', class: 'ab', onclick: () => closeAdmin(false) }, 'Ёпиш'),
        h('button', { type: 'button', class: 'ab ghost', title: 'Токенни ўчириб чиқиш', onclick: () => closeAdmin(true) }, 'Чиқиш'),
        h('div', { class: 'st', id: 'admSt' }, 'Ўзгартирган нарсангиз саҳифада дарҳол кўринади. Охирида «Сақлаш» ни босинг.')),
      body);
    document.body.append(drawer);
  }

  function showLogin(msg) {
    let saved = null; try { saved = JSON.parse(localStorage.getItem(LS) || 'null'); } catch (e) {}
    const repo = h('input', { type: 'text', id: 'admRepo', value: (saved && saved.repo) || guessRepo(), placeholder: 'username/username.github.io', autocomplete: 'off' });
    const branch = h('input', { type: 'text', id: 'admBranch', value: (saved && saved.branch) || 'main', autocomplete: 'off' });
    const token = h('input', { type: 'password', id: 'admToken', value: (saved && saved.token) || '', placeholder: 'github_pat_...', autocomplete: 'off' });
    const remember = h('input', { type: 'checkbox', id: 'admRemember' }); remember.checked = !!saved;
    const err = h('div', { class: 'er', id: 'admErr' }, msg || '');
    const go = h('button', { type: 'submit', class: 'ab pri' }, 'Кириш');
    const form = h('form', {},
      h('h3', {}, 'Таҳрирлаш режими'),
      h('p', {}, 'GitHub токенингиз билан киринг. Токен фақат шу браузерда туради ва фақат GitHub’га юборилади. Уни қандай яратиш README файлида ёзилган.'),
      h('label', { class: 'af' }, h('span', {}, 'Репозиторий'), repo),
      h('label', { class: 'af' }, h('span', {}, 'Тармоқ (branch)'), branch),
      h('label', { class: 'af' }, h('span', {}, 'GitHub токени'), token),
      h('label', { class: 'ck' }, remember, 'Шу қурилмада эслаб қол (умумий компьютерда белгиламанг)'),
      err,
      h('div', { class: 'row' }, go, h('button', { type: 'button', class: 'ab ghost', onclick: () => { modal.remove(); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} location.hash = ''; } }, 'Бекор қилиш')));
    const modal = h('div', { id: 'admLogin' }, form);
    form.onsubmit = async ev => {
      ev.preventDefault();
      const r = repo.value.trim(), b = branch.value.trim() || 'main', t = token.value.trim();
      if (!/^[\w.-]+\/[\w.-]+$/.test(r)) { err.textContent = 'Репозиторий номини «username/repo» шаклида ёзинг.'; return; }
      if (!t) { err.textContent = 'Токенни киритинг.'; return; }
      go.disabled = true; err.textContent = 'Текширилмоқда...';
      try {
        await login(r, b, t);
        try { remember.checked ? localStorage.setItem(LS, JSON.stringify({ repo: r, branch: b, token: t })) : localStorage.removeItem(LS); } catch (e) {}
        modal.remove(); buildDrawer();
      } catch (e) { gh = null; err.textContent = errMsg(e); go.disabled = false; }
    };
    document.body.append(modal); repo.value ? token.focus() : repo.focus();
  }

  addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  window.openAdmin = function () { if ($('#adm') || $('#admLogin')) return; gh ? buildDrawer() : showLogin(); };
  window.openAdmin();
})();
