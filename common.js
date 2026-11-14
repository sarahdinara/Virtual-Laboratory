/* ================================================================
   COMMON.JS - dipakai semua halaman: navigasi, progres & dialog
   ================================================================ */
const $ = s => document.querySelector(s);

// Peta nama halaman -> lokasi file (relatif dari folder halaman mana pun)
const PAGES = {
    menu: '../index.html',
    materi: '../Materi/Materi.html',
    panduan: '../Panduan/Panduan.html',
    lab: '../Praktikum/Praktikum.html',
    quiz: '../Evaluasi/Evaluasi.html',
    profile: '../Profil/Profil.html'
};

// Pindah halaman dengan transisi fade-out
function go(id) {
    const page = document.querySelector('.page');
    if (page) page.classList.remove('active');
    setTimeout(() => { location.href = PAGES[id]; }, 450);
}

document.addEventListener('click', e => {
    const b = e.target.closest('[data-go]');
    if (b) go(b.dataset.go);
});

// Fade-in saat halaman dibuka (juga saat kembali dengan tombol Back)
window.addEventListener('pageshow', () => {
    requestAnimationFrame(() => {
        const page = document.querySelector('.page');
        if (page) page.classList.add('active');
    });
});

/* ================= PROGRES (disimpan di localStorage) ================= */
const PROGRESS = {
    kunciP: 'vl_praktikum_selesai',
    kunciE: 'vl_evaluasi_hasil',
    baca(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    tulis(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    praktikumDone() { return this.baca(this.kunciP) === '1'; },
    setPraktikumDone() { this.tulis(this.kunciP, '1'); },
    evaluasiHasil() { try { return JSON.parse(this.baca(this.kunciE)); } catch (e) { return null; } },
    simpanEvaluasi(jawaban) { this.tulis(this.kunciE, JSON.stringify(jawaban)); },
    semuaSelesai() { return this.praktikumDone() && !!this.evaluasiHasil(); },
    reset() {
        try {
            localStorage.removeItem(this.kunciP);
            localStorage.removeItem(this.kunciE);
        } catch (e) {}
    }
};

/* ================= DIALOG PERINGATAN ================= */
// buttons: [{ label, cls, action }]  (cls 'alt' = tombol putih)
function showDialog(title, text, buttons) {
    closeDialog();
    const ov = document.createElement('div');
    ov.className = 'vl-dialog';
    ov.id = 'vlDialog';
    ov.innerHTML = `<div class="vl-box"><h3>${title}</h3><p>${text}</p><div class="vl-actions"></div></div>`;
    buttons.forEach(b => {
        const el = document.createElement('button');
        el.textContent = b.label;
        el.className = 'vl-btn ' + (b.cls || '');
        el.onclick = () => { closeDialog(); if (b.action) b.action(); };
        ov.querySelector('.vl-actions').appendChild(el);
    });
    document.body.appendChild(ov);
}

function closeDialog() {
    const d = $('#vlDialog');
    if (d) d.remove();
}

// Pindah halaman; jika belum selesai, tampilkan peringatan dulu
function keluar(id, selesai, pesan) {
    if (selesai) return go(id);
    showDialog('Progres akan hilang', pesan + ' Jika kembali sekarang, progresmu akan hilang. Yakin ingin melanjutkan?', [
        { label: 'Tidak, terima kasih', cls: 'alt' },
        { label: 'Iya, lanjutkan', action: () => go(id) }
    ]);
}