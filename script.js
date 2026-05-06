/* ============================================
   FARMA ORIGEN — Frontend interactions
   ============================================ */

/* ---------- AUTO-SWAP DE IMAGENS DE PRODUTO + LINK PARA PRODUTO ----------
   Se você jogar uma imagem com o nome do SKU em
   /assets/products/{sku}.jpg (ou .png/.webp) ela
   substitui automaticamente o stock no card.
   Também faz a imagem e o nome do card abrirem producto.html?sku=xxx.
*/
(function autoSwapProductImages() {
  const exts = ['jpg', 'jpeg', 'png', 'webp'];
  document.querySelectorAll('.product').forEach(card => {
    const btn = card.querySelector('[data-sku]');
    const img = card.querySelector('.prod-img img');
    if (!btn || !img) return;
    const sku = btn.dataset.sku.toLowerCase();

    let i = 0;
    const tryNext = () => {
      if (i >= exts.length) return;
      const url = `assets/products/${sku}.${exts[i++]}`;
      const test = new Image();
      test.onload = () => { img.src = url; };
      test.onerror = tryNext;
      test.src = url;
    };
    tryNext();

    // Ao clicar na imagem ou no nome, abre a página de produto
    const openProduct = e => {
      if (e.target.closest('button, .badge-fav, .kit-btn, .kit-toggle')) return;
      location.href = `producto.html?sku=${sku}`;
    };
    card.querySelector('.prod-img')?.addEventListener('click', openProduct);
    card.querySelector('.prod-name')?.addEventListener('click', openProduct);
  });
})();

/* ---------- KITS (3x2 / 5x3) — INJECTOR ----------
   Para cada card, injeta dois botões extras:
   - Lleva 3 paga 2  (preço = price * 2, qty = 3)
   - Lleva 5 paga 3  (preço = price * 3, qty = 5)
*/
(function injectKitOptions() {
  const fmt = n => '$' + n.toLocaleString('es-CL');

  document.querySelectorAll('.product').forEach(card => {
    const btn = card.querySelector('.btn-add[data-action="checkout"]');
    if (!btn) return;
    const sku   = btn.dataset.sku;
    const name  = btn.dataset.name;
    const price = parseInt(btn.dataset.price, 10) || 0;
    if (!price) return;

    const kit3 = price * 2;  // leva 3, paga 2
    const kit5 = price * 3;  // leva 5, paga 3
    const save3 = price * 1; // economia
    const save5 = price * 2;

    const wrap = document.createElement('div');
    wrap.className = 'kits';
    wrap.innerHTML = `
      <button type="button" class="kit-toggle" aria-expanded="false">
        <span>Ver kits con descuento</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="kit-options" hidden>
        <button class="kit-btn" data-action="checkout"
          data-sku="${sku}-kit3x2"
          data-name="${name} · Kit Lleva 3 Paga 2"
          data-price="${kit3}">
          <span class="kit-tag">Lleva 3 · Paga 2</span>
          <span class="kit-price">
            <strong>${fmt(kit3)}</strong>
            <small>Ahorra ${fmt(save3)}</small>
          </span>
        </button>
        <button class="kit-btn" data-action="checkout"
          data-sku="${sku}-kit5x3"
          data-name="${name} · Kit Lleva 5 Paga 3"
          data-price="${kit5}">
          <span class="kit-tag hot">Lleva 5 · Paga 3</span>
          <span class="kit-price">
            <strong>${fmt(kit5)}</strong>
            <small>Ahorra ${fmt(save5)}</small>
          </span>
        </button>
      </div>
    `;
    btn.insertAdjacentElement('afterend', wrap);

    const toggle = wrap.querySelector('.kit-toggle');
    const opts   = wrap.querySelector('.kit-options');
    toggle.addEventListener('click', () => {
      const open = !opts.hasAttribute('hidden') ? false : true;
      if (open) {
        opts.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.classList.add('open');
      } else {
        opts.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.classList.remove('open');
      }
    });
  });
})();

/* ---------- HERO CAROUSEL ---------- */
(function heroCarousel() {
  const track = document.getElementById('heroTrack');
  const prev  = document.getElementById('heroPrev');
  const next  = document.getElementById('heroNext');
  const dots  = document.getElementById('heroDots');
  if (!track) return;

  const slides = track.children;
  const total = slides.length;
  let idx = 0;
  let timer;

  // Build dots
  for (let i = 0; i < total; i++) {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Ir al slide ${i + 1}`);
    b.addEventListener('click', () => goTo(i));
    dots.appendChild(b);
  }

  function goTo(i) {
    idx = (i + total) % total;
    track.style.transform = `translateX(-${idx * 100}%)`;
    [...dots.children].forEach((d, k) => d.classList.toggle('active', k === idx));
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(idx + 1), 6000);
  }

  prev.addEventListener('click', () => goTo(idx - 1));
  next.addEventListener('click', () => goTo(idx + 1));

  // Touch swipe
  let startX = 0;
  track.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 50) goTo(idx + (diff < 0 ? 1 : -1));
  });

  // Init
  goTo(0);
})();

/* ---------- CART STATE ---------- */
const cart = {
  items: [],
  load() {
    try { this.items = JSON.parse(localStorage.getItem('fo_cart') || '[]'); }
    catch { this.items = []; }
  },
  save() { localStorage.setItem('fo_cart', JSON.stringify(this.items)); },
  add(item) {
    const found = this.items.find(i => i.sku === item.sku);
    if (found) found.qty += 1;
    else this.items.push({ ...item, qty: 1 });
    this.save();
    this.refresh();
  },
  count() { return this.items.reduce((s, i) => s + i.qty, 0); },
  total() { return this.items.reduce((s, i) => s + i.price * i.qty, 0); },
  refresh() {
    const el = document.getElementById('cartCount');
    if (!el) return;
    const n = this.count();
    el.textContent = n > 99 ? '99+' : String(n);
    if (n === 0) el.setAttribute('hidden', ''); else el.removeAttribute('hidden');
  }
};
cart.load();
cart.refresh();

/* ---------- ADD-TO-CART / CHECKOUT HOOK ---------- */
/*
  Quando vier a documentação da API do gateway,
  a única função que precisa mudar é `triggerCheckout()`.
  Tudo o mais permanece igual.
*/
function triggerCheckout() {
  // Cart já está em localStorage. checkout.html lê e processa via Pagou.ai.
  window.location.href = 'checkout.html';
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="checkout"]');
  if (!btn) return;
  e.preventDefault();

  const item = {
    sku: btn.dataset.sku,
    name: btn.dataset.name,
    price: parseInt(btn.dataset.price, 10) || 0
  };
  cart.add(item);

  // micro feedback
  const original = btn.innerHTML;
  btn.innerHTML = '✓ Agregado';
  btn.classList.add('added');
  setTimeout(() => {
    btn.innerHTML = original;
    btn.classList.remove('added');
  }, 1400);
});

/* Botão do header → abre checkout com tudo */
document.getElementById('cartButton')?.addEventListener('click', (e) => {
  if (cart.items.length === 0) return; // deixa rolar pro link
  e.preventDefault();
  triggerCheckout();
});

/* ---------- FAVORITOS (toggle visual) ---------- */
document.addEventListener('click', (e) => {
  const fav = e.target.closest('.badge-fav');
  if (!fav) return;
  fav.classList.toggle('on');
  fav.textContent = fav.classList.contains('on') ? '♥' : '♡';
});

/* ---------- MEGA MENU MOBILE TOGGLE (drawer lateral) ---------- */
(function mobileMenuDrawer() {
  const menu = document.querySelector('.menu');
  const trigger = document.querySelector('.menu-all');
  if (!menu || !trigger) return;

  // Backdrop e botão de fechar — adicionados via JS pra não tocar em todas as páginas
  const backdrop = document.createElement('div');
  backdrop.className = 'menu-backdrop';
  document.body.appendChild(backdrop);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'menu-close';
  closeBtn.setAttribute('aria-label', 'Cerrar menú');
  closeBtn.innerHTML = '&times;';
  menu.prepend(closeBtn);

  function open() {
    menu.classList.add('open');
    backdrop.classList.add('show');
    document.body.classList.add('menu-open');
  }
  function close() {
    menu.classList.remove('open');
    backdrop.classList.remove('show');
    document.body.classList.remove('menu-open');
  }

  trigger.addEventListener('click', () => {
    menu.classList.contains('open') ? close() : open();
  });
  backdrop.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  // fechar ao clicar num link do menu
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  // ESC
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ---------- SCROLL HEADER SHADOW ---------- */
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });
