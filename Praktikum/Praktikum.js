/* ================================================================
   PRAKTIKUM.JS - logika laboratorium: drag & drop, fisika, quest, reaksi (praktikum.html)
   ================================================================ */

/* ================= KONFIGURASI GAMBAR & VIDEO (edit path di sini) ================= */
// ok:1 = alat/bahan benar. img = path gambar item (e = emoji sementara sebelum gambar ada)
const ITEMS = [
    { id: 'hati', n: 'Hati Ayam', e: '🍖', ok: 1, img: 'assets/items/hati.png' },
    { id: 'air', n: 'Air 100 ml', e: '💧', ok: 1, img: 'assets/items/air.png' },
    { id: 'es', n: 'Mangkuk Es Batu', e: '🧊', ok: 1, img: 'assets/items/mangkuk-es.png' },
    { id: 'h2o2', n: 'H₂O₂', e: '🧪', ok: 1, img: 'assets/items/h2o2.png' },
    { id: 'hcl', n: 'HCl', e: '⚗️', ok: 1, img: 'assets/items/hcl.png' },
    { id: 'naoh', n: 'NaOH', e: '⚗️', ok: 1, img: 'assets/items/naoh.png' },
    { id: 'mortal', n: 'Mortal & Alu', e: '🥣', ok: 1, img: 'assets/items/mortal.png' },
    { id: 'lidi', n: 'Lidi', e: '🥢', ok: 1, img: 'assets/items/lidi.png' },
    { id: 'korek', n: 'Korek Api', e: '🔥', ok: 1, img: 'assets/items/korek.png' },
    { id: 'spiritus', n: 'Pembakar Spiritus', e: '🪔', ok: 1, img: 'assets/items/spiritus.png' },
    { id: 'gula', n: 'Gula Pasir', e: '🍬', img: 'assets/items/gula.png' },
    { id: 'minyak', n: 'Minyak Goreng', e: '🛢️', img: 'assets/items/minyak.png' },
    { id: 'iodin', n: 'Larutan Iodin', e: '🟤', img: 'assets/items/iodin.png' },
    { id: 'mikro', n: 'Mikroskop', e: '🔬', img: 'assets/items/mikroskop.png' }
];
// Video/gambar reaksi: muncul LANGSUNG di atas alatnya (mortal, tabung, mangkuk es, pembakar)
const MEDIA = {
    grind: { video: 'assets/video/gerus.mp4' },
    extract: { img: 'assets/img/ekstrak.png' },
    fill: { img: 'assets/img/tuang-ekstrak.png' },
    hcl: { img: 'assets/img/tetes-hcl.png' },
    naoh: { img: 'assets/img/tetes-naoh.png' },
    es: { video: 'assets/video/tabung-dalam-es.mp4' },
    ignite: { video: 'assets/video/nyalakan-spiritus.mp4' },
    heat: { video: 'assets/video/panaskan-tabung.mp4' },
    light: { video: 'assets/video/lidi-dibakar.mp4' }
};
'ABCDE'.split('').forEach(L => {
    MEDIA[L + '_react'] = { video: `assets/video/${L}-gelembung.mp4`};
    MEDIA[L + '_test'] = { video: `assets/video/${L}-uji-bara.mp4`}
});
// Hasil pengamatan tiap tabung (n = jumlah gelembung animasi cadangan)
const R = {
    A: {
        n: 14,
        react: 'Gelembung gas O₂ banyak dan cepat → katalase bekerja optimal.',
        test: 'Bara lidi menyala lebih terang → gas yang terbentuk adalah O₂.'
    },
    B: {
        n: 3,
        react: 'Gelembung sangat sedikit → suasana asam mengubah struktur enzim, aktivitas turun.',
        test: 'Bara lidi hanya menyala redup/padam → O₂ yang terbentuk sedikit.'
    },
    C: {
        n: 3,
        react: 'Gelembung sangat sedikit → suasana basa menurunkan aktivitas enzim.',
        test: 'Bara lidi hanya menyala redup/padam → O₂ yang terbentuk sedikit.'
    },
    D: {
        n: 4,
        react: 'Gelembung sedikit → suhu dingin membuat enzim pasif (tidak rusak permanen).',
        test: 'Bara lidi menyala sedikit lebih terang → O₂ terbentuk perlahan.'
    },
    E: { n: 0, react: 'Hampir tidak ada gelembung → suhu tinggi menyebabkan denaturasi enzim.' }
};

/* ================= POP-UP, TOAST & PANEL QUEST ================= */

function popup(t, p) {
    const o = $('#popup');
    if (!t) {
        o.classList.remove('show');
        return
    }
    $('#pt').textContent = t;
    $('#pp').innerHTML = p;
    o.classList.add('show')
}

function toast(t) {
    const o = $('#toast');
    o.textContent = t;
    o.classList.add('show');
    clearTimeout(o.tm);
    o.tm = setTimeout(() => o.classList.remove('show'), 6500)
}
$('#qtoggle').onclick = () => $('#lab').classList.toggle('qopen');

/* ================= DAFTAR QUEST ================= */
const S = [
    { t: 'Ambil semua alat & bahan yang benar dari rak atas. Lepaskan, biarkan jatuh ke meja (menempel otomatis).' },
    {
        t: 'Seret <b>Hati Ayam</b> ke <b>Mortal & Alu</b> untuk digerus.',
        item: 'hati',
        target: 'mortal',
        fx: 'grind'
    },
    {
        t: 'Seret <b>Air 100 ml</b> ke mortal, lalu pisahkan endapan.',
        item: 'air',
        target: 'mortal',
        fx: 'extract'
    }
];
'ABCDE'.split('').forEach(L => S.push({ t: `Seret <b>Mortal & Alu</b> untuk memasukkan ekstrak hati ayam ke tabung <b>${L}</b>.`, item: 'mortal', target: 'tube' + L, fx: 'fill', L }));
S.push({ t: 'Nyalakan <b>Pembakar Spiritus</b> dengan <b>Korek Api</b>.', item: 'korek', target: 'spiritus', fx: 'ignite' });
'ABCDE'.split('').forEach(L => {
    const T = 'tube' + L;
    if (L === 'B') S.push({ t: 'Tabung B: seret <b>HCl</b> ke tabung B (5 tetes).', item: 'hcl', target: T, fx: 'hcl', L });
    if (L === 'C') S.push({ t: 'Tabung C: seret <b>NaOH</b> ke tabung C (5 tetes).', item: 'naoh', target: T, fx: 'naoh', L });
    if (L === 'D') S.push({ t: 'Tabung D: seret <b>tabung D</b> ke dalam <b>Mangkuk Es Batu</b> untuk didinginkan.', item: T, target: 'es', fx: 'es', L });
    if (L === 'E') S.push({ t: 'Tabung E: tahan <b>tabung E</b> di atas api pembakar spiritus selama <b>5 detik</b>, lalu lepaskan (kembali ke rak).', item: T, target: 'spiritus', hold: 5000, fx: 'heat', L });
    S.push({ t: `Tabung ${L}: seret <b>H₂O₂</b> ke tabung ${L}, amati gelembung.`, item: 'h2o2', target: T, fx: 'h2o2', L });
    if (L !== 'E') {
        S.push({ t: 'Dekatkan <b>Lidi</b> ke api pembakar spiritus (tahan 2 detik) hingga membara.', item: 'lidi', target: 'spiritus', hold: 2000, fx: 'light', L });
        S.push({ t: `Tabung ${L}: masukkan lidi berbara ke tabung ${L}.`, item: 'lidi', target: T, fx: 'test', L })
    }
});
let cur = 0, p1 = false;

function renderQ() {
    $('#qlist').innerHTML = S.slice(0, cur + 1).map((s, i) => `<div class="q ${i < cur ? 'ok' : 'now'}">${i < cur ? '✔ ' : ''}${s.t}</div>`).join('');
    $('#quest').scrollTop = 1e5
}

function done() {
    cur++;
    renderQ();
    if (cur >= S.length) {
        $('#next').style.display = 'block';
        popup('Praktikum selesai!', 'Semua langkah telah dilakukan. Tekan panah ➜ di pojok kanan bawah untuk ke Evaluasi.')
    }
}

/* ================= EFEK REAKSI ================= */

function fxm(host, key, keep) {
    const m = MEDIA[key] || {};
    host.querySelectorAll('.fx').forEach(x => x.remove());
    const d = document.createElement('div');
    d.className = 'fx';
    d.innerHTML = `<span>${m.video ? '🎬' : '🖼️'} ${(m.video || m.img || key).split('/').pop()}</span>` + (m.video ? `<video src="${m.video}" autoplay loop muted playsinline onerror="this.remove()"></video>` : m.img ? `<img src="${m.img}" alt="" onerror="this.remove()">` : '');
    host.appendChild(d);
    if (!keep) setTimeout(() => d.remove(), 4500)
}

function bubbles(t, n) {
    t.tb.querySelectorAll('.bub').forEach(b => b.remove());
    for (let i = 0; i < n; i++) t.tb.insertAdjacentHTML('beforeend', `<span class="bub" style="left:${10 + Math.random() * 65}%;animation-delay:${Math.random() * 1.4}s"></span>`)
}

function fx(s) {
    const L = s.L, t = items['tube' + L];
    switch (s.fx) {
        case 'grind':
            fxm(items.mortal.el, 'grind');
            toast('Hati digerus hingga halus di mortal.');
            break;
        case 'extract':
            fxm(items.mortal.el, 'extract');
            toast('Air 100 ml ditambahkan, endapan dipisahkan → ekstrak hati (sumber katalase).');
            break;
        case 'fill':
            t.liq.style.height = '30%';
            t.liq.style.background = '#d98a7a';
            fxm(t.tb, 'fill');
            break;
        case 'hcl':
            t.liq.style.background = '#e6a23c';
            fxm(t.tb, 'hcl');
            toast('5 tetes HCl → suasana asam.');
            break;
        case 'naoh':
            t.liq.style.background = '#8e7cc3';
            fxm(t.tb, 'naoh');
            toast('5 tetes NaOH → suasana basa.');
            break;
        case 'ignite':
            items.spiritus.el.classList.add('fire');
            fxm(items.spiritus.el, 'ignite');
            toast('Pembakar spiritus menyala');
            break;
        case 'es':
            t.el.classList.add('cold');
            fxm(items.es.el, 'es');
            toast('Tabung D didinginkan dalam es batu.');
            break;
        case 'heat':
            t.el.classList.add('hot');
            fxm(t.tb, 'heat');
            toast('Ekstrak dipanaskan → suhu tinggi. Lepaskan tabung agar kembali ke rak.');
            break;
        case 'h2o2':
            t.liq.style.height = '60%';
            bubbles(t, R[L].n);
            fxm(t.tb, L + '_react', 1);
            toast(`Pengamatan tabung ${L}: ${R[L].react}`);
            break;
        case 'light':
            items.lidi.el.classList.add('lit');
            fxm(items.spiritus.el, 'light');
            toast('Ujung lidi membara. Segera masukkan ke tabung uji.');
            break;
        case 'test':
            items.lidi.el.classList.remove('lit');
            fxm(t.tb, L + '_test');
            toast(`Uji bara tabung ${L}: ${R[L].test}`);
            break;
    }
}

function attempt(it, tg) {
    const s = S[cur];
    if (s && s.item === it.id && s.target === tg && !s.hold) {
        fx(s);
        done();
        return
    }
    popup('Langkah belum tepat ⚠️', 'Coba lagi. Langkah saat ini:<br><br>' + (s ? s.t : '-'))
}
const hit = (x, y, id) => {
    const e = document.elementsFromPoint(x, y).map(n => n.closest('[data-target]')).find(n => n && n.dataset.target !== id);
    return e && e.dataset.target
};

/* ================= ITEM, FISIKA & SNAP ================= */
const items = {};
let drag = null, falling = new Set(), raf = 0;
const mk = (c, p) => {
    const d = document.createElement('div');
    d.className = c;
    p.appendChild(d);
    return d
};
[...ITEMS].sort(() => Math.random() - .5).forEach(d => {
    const it = { ...d, at: 'shelf', x: 0, y: 0, vx: 0, vy: 0 };
    items[d.id] = it;
    it.sslot = mk('slot', $('#shelf'));
    it.el = document.createElement('div');
    it.el.className = 'item';
    it.el.dataset.target = d.id;
    it.el.innerHTML = (d.id === 'spiritus' ? '<i class="flame">🔥</i><span class="hbar"><u></u></span>' : '') + `<div class="asset"><span>${d.e}</span><img src="${d.img}" alt="" onerror="this.remove()"></div><small>${d.n}</small>`;
    $('#lab').appendChild(it.el);
    it.el.addEventListener('pointerdown', e => down(e, it));
});
const tslots = ITEMS.filter(i => i.ok).map((_, i) => mk('tslot', $(i < 5 ? '#tl' : '#tr')));
// tabung reaksi A–E (digambar CSS) di rak tengah meja; muncul setelah persiapan selesai
'ABCDE'.split('').forEach(L => {
    const id = 'tube' + L, it = { id, n: 'Tabung ' + L, at: 'table', x: 0, y: 0, vx: 0, vy: 0 };
    items[id] = it;
    it.tslot = mk('rslot', $('#rack'));
    it.el = document.createElement('div');
    it.el.className = 'item titem hide';
    it.el.dataset.target = id;
    it.el.innerHTML = `<div class="tube"><div class="liq"></div></div><b>${L}</b>`;
    $('#lab').appendChild(it.el);
    it.liq = it.el.querySelector('.liq');
    it.tb = it.el.querySelector('.tube');
    it.el.addEventListener('pointerdown', e => down(e, it))
});
const place = it => {
    it.el.style.left = it.x + 'px';
    it.el.style.top = it.y + 'px'
};

function home(it, anim) {
    const s = it.at === 'shelf' ? it.sslot : it.tslot, r = s.getBoundingClientRect();
    it.x = r.left + (r.width - it.el.offsetWidth) / 2;
    it.y = r.top;
    if (anim) {
        it.el.classList.add('snap');
        setTimeout(() => it.el.classList.remove('snap'), 300)
    }
    place(it)
}

function layout() {
    Object.values(items).forEach(it => {
        if (it !== (drag && drag.it) && !falling.has(it) && it.at !== 'moving') home(it)
    })
}
addEventListener('resize', layout);
setTimeout(layout, 100);
const warn = it => {
    it.el.classList.add('shake');
    setTimeout(() => it.el.classList.remove('shake'), 400);
    popup('Peringatan ⚠️', `<b>${it.n}</b> tidak diperlukan dalam praktikum katalase ini. Pilih alat/bahan lain!`)
};

function down(e, it) {
    if ($('#popup').classList.contains('show')) return;
    if (it.at === 'shelf') {
        if (p1) return;
        if (!it.ok) return warn(it)
    }
    if (!p1 && it.tslot) {
        it.tslot.occ = null;
        it.tslot = null
    }
    if (!p1) it.at = 'moving';
    falling.delete(it);
    it.vx = it.vy = 0;
    e.preventDefault();
    drag = { it, dx: e.clientX - it.x, dy: e.clientY - it.y, t: performance.now(), px: e.clientX, py: e.clientY, hs: 0, hd: 0 };
    drag.iv = setInterval(holdTick, 100);
    it.el.classList.add('drag')
}
// tahan alat di atas api (tabung E 5 detik, lidi 2 detik)

function holdTick() {
    if (!drag) return;
    const it = drag.it, s = S[cur], sp = items.spiritus, bar = sp.el.querySelector('.hbar');
    if (s && s.hold && s.item === it.id && hit(drag.px, drag.py, it.id) === s.target && sp.el.classList.contains('fire')) {
        if (!drag.hs) drag.hs = performance.now();
        const p = (performance.now() - drag.hs) / s.hold;
        bar.style.display = 'block';
        bar.firstChild.style.width = Math.min(100, p * 100) + '%';
        if (p >= 1) {
            bar.style.display = 'none';
            drag.hs = 0;
            drag.hd = 1;
            fx(s);
            done()
        }
    } else {
        drag.hs = 0;
        bar.style.display = 'none'
    }
}
addEventListener('pointermove', e => {
    if (!drag) return;
    const it = drag.it, nx = e.clientX - drag.dx, ny = e.clientY - drag.dy, now = performance.now(), dt = Math.max(now - drag.t, 8);
    it.vx = (nx - it.x) / dt * 7 + it.vx * .5;
    it.vy = (ny - it.y) / dt * 7 + it.vy * .5;
    it.x = nx;
    it.y = ny;
    drag.t = now;
    drag.px = e.clientX;
    drag.py = e.clientY;
    place(it)
});
addEventListener('pointerup', e => {
    if (!drag) return;
    const d = drag, it = d.it;
    drag = null;
    clearInterval(d.iv);
    items.spiritus.el.querySelector('.hbar').style.display = 'none';
    it.el.classList.remove('drag');
    if (p1 && !d.hd) {
        const tg = hit(e.clientX, e.clientY, it.id), s = S[cur];
        if (tg) {
            if (s && s.hold && s.item === it.id && s.target === tg) toast('Belum cukup lama di atas api. Pastikan pembakar sudah menyala, lalu tahan lebih lama.');
            else attempt(it, tg)
        }
    }
    it.vx = Math.max(-25, Math.min(25, it.vx));
    it.vy = Math.max(-25, Math.min(25, it.vy));
    falling.add(it);
    if (!raf) raf = requestAnimationFrame(tick)
});

function tick() {
    const sr = $('#stage').getBoundingClientRect(), fl = sr.top + sr.height * .925; // lantai = permukaan meja pada gambar
    falling.forEach(it => {
        const W = it.el.offsetWidth, H = it.el.offsetHeight;
        it.vy += .9;
        it.x += it.vx;
        it.y += it.vy;
        if (it.x < 0) {
            it.x = 0;
            it.vx *= -.6
        }
        if (it.x > innerWidth - W) {
            it.x = innerWidth - W;
            it.vx *= -.6
        }
        if (it.y < 0) {
            it.y = 0;
            it.vy = 0
        }
        if (it.y > fl - H) {
            it.y = fl - H;
            it.vy *= -.35;
            it.vx *= .8;
            if (Math.abs(it.vy) < 2.5) {
                place(it);
                falling.delete(it);
                land(it);
                return
            }
        }
        place(it)
    });
    raf = falling.size ? requestAnimationFrame(tick) : 0
}

function land(it) {
    if (p1) {
        home(it, true);
        return
    } // fase 2: alat kembali ke tempat awalnya (tabung → rak)
    if (!it.ok) {
        it.at = 'shelf';
        home(it, true);
        return
    }
    const cx = it.x + it.el.offsetWidth / 2;
    let best = null, bd = 1e9; // magnetic snap ke slot meja terdekat
    tslots.forEach(s => {
        if (s.occ) return;
        const r = s.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - cx);
        if (d < bd) {
            bd = d;
            best = s
        }
    });
    best.occ = it.id;
    it.tslot = best;
    it.at = 'table';
    home(it, true);
    if (ITEMS.filter(i => i.ok).every(i => items[i.id].at === 'table')) {
        p1 = true;
        'ABCDE'.split('').forEach(L => items['tube' + L].el.classList.remove('hide'));
        layout();
        popup('Alat & bahan lengkap ✔', 'Semua benar! Tabung reaksi A–E kini ada di rak tengah meja. Lanjutkan sesuai quest.');
        done()
    }
}
renderQ();


/* ================= PULIHKAN KONDISI SELESAI (jika praktikum sudah pernah diselesaikan) ================= */
function pulihkanSelesai() {
    ITEMS.filter(i => i.ok).forEach((d, i) => {
        const it = items[d.id], s = tslots[i];
        s.occ = it.id;
        it.tslot = s;
        it.at = 'table';
        home(it);
    });
    p1 = true;
    cur = S.length;
    renderQ();
    const warna = { B: '#e6a23c', C: '#8e7cc3' };
    'ABCDE'.split('').forEach(L => {
        const t = items['tube' + L];
        t.el.classList.remove('hide');
        t.liq.style.height = '60%';
        if (warna[L]) t.liq.style.background = warna[L];
        bubbles(t, R[L].n);
    });
    items.tubeD.el.classList.add('cold');
    items.tubeE.el.classList.add('hot');
    items.spiritus.el.classList.add('fire');
    $('#next').style.display = 'block';
}
if (PROGRESS.praktikumDone()) pulihkanSelesai();