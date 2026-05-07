/* ============================================
   FARMA ORIGEN — Frontend interactions
   ============================================ */

/* ---------- INFO MODAL (popups do rodapé/topbar) ----------
   Qualquer <a data-info="chave"> abre um modal com conteúdo
   correspondente. Mantém o cliente na página de produto/checkout.
*/
(function infoModal() {
  const CONTENT = {
    contacto: {
      title: 'Contacto',
      body: `
        <p>Estamos disponibles para resolver tus dudas sobre productos, despacho o tu pedido.</p>
        <ul>
          <li><strong>Email:</strong> contacto@farmaorigen.com</li>
          <li><strong>WhatsApp:</strong> +56 9 0000 0000</li>
          <li><strong>Horario:</strong> Lun a Sáb · 9:00 a 21:00 h</li>
        </ul>
        <p>Si prefieres, escríbenos por el formulario y te respondemos en menos de 24 horas hábiles.</p>`
    },
    preguntas: {
      title: 'Preguntas frecuentes',
      body: `
        <h4>¿Cuánto demora el despacho?</h4>
        <p>De 24 a 48 h hábiles para Región Metropolitana, Valparaíso y Biobío. 3 a 5 días para el resto del país.</p>
        <h4>¿Cuál es el costo de envío?</h4>
        <p>Despacho gratis en compras sobre $30.000. Bajo ese valor, el costo es de $3.990 a todo Chile.</p>
        <h4>¿Puedo cancelar o cambiar mi pedido?</h4>
        <p>Sí, mientras no haya sido despachado. Escríbenos por WhatsApp con el número de orden.</p>
        <h4>¿Los productos son originales?</h4>
        <p>100 %. Trabajamos solo con marcas seleccionadas y origen verificado.</p>
        <h4>¿Necesito receta médica?</h4>
        <p>No. Vendemos suplementos alimenticios y artículos de cuidado personal de venta libre.</p>`
    },
    despacho: {
      title: 'Despacho y envíos',
      body: `
        <p>Enviamos a todo Chile a través de Chilexpress, Starken y Blue Express.</p>
        <ul>
          <li><strong>Región Metropolitana, Valparaíso, Biobío:</strong> 24 a 48 h hábiles</li>
          <li><strong>Resto del país:</strong> 3 a 5 días hábiles</li>
          <li><strong>Despacho rápido (mismo día):</strong> $4.990 — solo RM, V y VIII</li>
          <li><strong>Despacho gratis:</strong> en compras sobre $30.000</li>
        </ul>
        <p>El stock se reserva al finalizar la compra. Te enviamos el código de seguimiento por email apenas se despache.</p>`
    },
    cambios: {
      title: 'Cambios y devoluciones',
      body: `
        <p>Tienes hasta <strong>30 días</strong> desde la recepción para solicitar cambio o devolución, siempre que el producto esté sellado y en su empaque original.</p>
        <h4>Cómo solicitar</h4>
        <ol>
          <li>Escríbenos por WhatsApp o email con tu número de orden</li>
          <li>Te enviamos la guía de despacho (cargo nuestro si fue defecto, del cliente si fue cambio de opinión)</li>
          <li>Apenas recibimos el producto en bodega, procesamos el reembolso o el cambio en 5 días hábiles</li>
        </ol>
        <p>No se aceptan cambios ni devoluciones por preferencia personal en suplementos abiertos, por motivos sanitarios.</p>`
    },
    nosotros: {
      title: 'Quiénes somos',
      body: `
        <p>Farma Origen nació con la misión de ofrecer suplementos naturales y dermocosmética con origen verificado, precios honestos y atención cercana en todo Chile.</p>
        <p>Trabajamos con marcas líderes del mercado y fórmulas seleccionadas. Cada producto que vendemos pasa por nuestro filtro de calidad y trazabilidad.</p>
        <p><strong>Origen real, cuidado real.</strong></p>`
    },
    trabaja: {
      title: 'Trabaja con nosotros',
      body: `
        <p>Estamos creciendo y buscando talento en logística, atención al cliente y curaduría de productos.</p>
        <p>Si te interesa formar parte de Farma Origen, envía tu CV a <strong>trabaja@farmaorigen.com</strong> con el asunto del cargo de interés.</p>`
    },
    prensa: {
      title: 'Prensa',
      body: `
        <p>Para entrevistas, materiales de prensa o solicitudes de medios, contacta a <strong>prensa@farmaorigen.com</strong>.</p>`
    },
    blog: {
      title: 'Blog de bienestar',
      body: `<p>Próximamente publicaremos artículos sobre suplementos, hongos medicinales y bienestar integral. ¡Mantente atento!</p>`
    },
    terminos: {
      title: 'Términos y condiciones',
      body: `
        <p>Al usar Farma Origen aceptas estos términos. Resumen rápido:</p>
        <ul>
          <li>Los precios y stock pueden cambiar sin aviso</li>
          <li>Las compras están sujetas a confirmación de pago y stock</li>
          <li>Los productos son suplementos alimenticios y artículos de cuidado personal — no reemplazan tratamiento médico</li>
          <li>El uso del sitio implica aceptación de las políticas de privacidad y cookies</li>
        </ul>
        <p>Versión completa disponible bajo solicitud a contacto@farmaorigen.com.</p>`
    },
    privacidad: {
      title: 'Política de privacidad',
      body: `
        <p>Tomamos en serio la protección de tus datos. Resumen:</p>
        <ul>
          <li>Recolectamos solo lo necesario: nombre, email, teléfono, dirección y datos de pago</li>
          <li>Los datos de pago son procesados directamente por el gateway (Pagou.ai) — no los almacenamos</li>
          <li>Nunca compartimos tu información con terceros sin tu consentimiento</li>
          <li>Puedes solicitar la eliminación de tus datos enviando email a contacto@farmaorigen.com</li>
        </ul>`
    },
    cookies: {
      title: 'Política de cookies',
      body: `
        <p>Usamos cookies para mejorar tu experiencia:</p>
        <ul>
          <li><strong>Esenciales:</strong> sesión, carro de compras, preferencias regionales</li>
          <li><strong>Analíticas:</strong> métricas anónimas de uso del sitio</li>
        </ul>
        <p>Puedes desactivar cookies en la configuración de tu navegador. Algunas funciones (como el carro) no funcionarán sin ellas.</p>`
    },
    libro: {
      title: 'Libro de reclamos',
      body: `
        <p>Si tuviste un problema con tu compra, queremos resolverlo.</p>
        <ol>
          <li>Escríbenos primero a <strong>contacto@farmaorigen.com</strong> o WhatsApp con tu número de orden</li>
          <li>Si no resolvemos en 5 días hábiles, puedes formalizar el reclamo</li>
        </ol>
        <p>Trabajamos para que cada compra sea una experiencia positiva.</p>`
    },
    ayuda: {
      title: 'Ayuda',
      body: `
        <p>¿Necesitas ayuda? Aquí los caminos más rápidos:</p>
        <ul>
          <li><strong>WhatsApp:</strong> +56 9 0000 0000 (respuesta en minutos)</li>
          <li><strong>Email:</strong> contacto@farmaorigen.com</li>
          <li><strong>Preguntas frecuentes:</strong> abre la sección desde el footer</li>
        </ul>`
    },
    cuenta: {
      title: 'Mi cuenta',
      body: `
        <p>Tu cuenta se crea <strong>automáticamente</strong> con tu primera compra, usando el email que ingresas en el checkout.</p>
        <p>Una vez creada, podrás:</p>
        <ul>
          <li>Ver el historial de tus pedidos</li>
          <li>Guardar direcciones de despacho</li>
          <li>Marcar productos favoritos</li>
          <li>Acceder más rápido en próximas compras</li>
        </ul>
        <p>Recibirás los datos de acceso por email después de tu primera orden.</p>`
    },
    favoritos: {
      title: 'Favoritos',
      body: `<p>Puedes marcar productos como favoritos haciendo clic en el corazón ♡ de cada tarjeta. Próximamente sincronizaremos los favoritos con tu cuenta.</p>`
    }
  };

  function ensureModal() {
    if (document.getElementById('foInfoModal')) return;
    const m = document.createElement('div');
    m.id = 'foInfoModal';
    m.className = 'fo-info-modal';
    m.hidden = true;
    m.innerHTML = `
      <div class="fo-info-card" role="dialog" aria-modal="true" aria-labelledby="foInfoTitle">
        <button type="button" class="fo-info-close" aria-label="Cerrar">&times;</button>
        <h2 id="foInfoTitle"></h2>
        <div class="fo-info-body"></div>
      </div>`;
    document.body.appendChild(m);

    m.addEventListener('click', e => {
      if (e.target === m || e.target.closest('.fo-info-close')) close();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });

    function close() {
      m.hidden = true;
      document.body.style.overflow = '';
    }
  }

  function open(key) {
    ensureModal();
    const data = CONTENT[key];
    if (!data) return;
    const m = document.getElementById('foInfoModal');
    m.querySelector('#foInfoTitle').textContent = data.title;
    m.querySelector('.fo-info-body').innerHTML = data.body;
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    m.querySelector('.fo-info-close').focus();
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('[data-info]');
    if (!link) return;
    e.preventDefault();
    open(link.dataset.info);
  });

  // Auto-mapeia links #foo do footer/topbar pra data-info
  const HASH_MAP = {
    '#contacto':'contacto', '#preguntas':'preguntas', '#despacho':'despacho',
    '#cambios':'cambios', '#nosotros':'nosotros', '#trabaja':'trabaja',
    '#prensa':'prensa', '#blog':'blog', '#terminos':'terminos',
    '#privacidad':'privacidad', '#cookies':'cookies', '#libro':'libro',
    '#ayuda':'ayuda', '#cuenta':'cuenta', '#favoritos':'favoritos'
  };
  document.querySelectorAll('a[href^="#"], a[href*="index.html#"]').forEach(a => {
    const href = a.getAttribute('href') || '';
    const hash = href.startsWith('#') ? href : ('#' + href.split('#')[1]);
    if (HASH_MAP[hash]) a.dataset.info = HASH_MAP[hash];
  });
})();


/* ---------- FILTRO POR CATEGORIA ----------
   Clique numa cat-card → URL vira #cat=xxx → produtos filtrados.
   Mapping SKU→categoria fica aqui (não precisa tocar no HTML dos cards).
*/
(function categoryFilter() {
  const CATEGORY_MAP = {
    hongos:       ['melena-leon', 'reishi', 'cordyceps'],
    probioticos:  ['alflorex', 'bioflora', 'perenteryl', 'multiflora', 'lactoflora', 'enterogermina'],
    longevidad:   ['nmn', 'nad', 'resveratrol', 'quercetina'],
    dermo:        ['cicaplast-b5', 'dermopure', 'effaclar-duo', 'effaclar-serum',
                   'eucerin-pigment', 'eucerin-hyaluron', 'eucerin-atopicontrol',
                   'hyalu-b5', 'mela-b3', 'retinal-shot', 'mixsoon', 'alopek',
                   'anthelios-uvmune', 'heliocare'],
    ocular:       ['hyabak', 'hylo-comod', 'lagricel', 'systane-complete', 'systane-ultra', 'toptear'],
    energia:      ['ginkgo', 'cromo', 'citracal', 'biozen', 'sambucol', 'neurobionta', 'complejo-b', 'vitafer'],
    bienestar:    ['melatonil', 'bacopa'],
    suplementos:  ['berberina', 'cardo-mariano', 'tribulus', 'shilajit', 'liver-complex', 'kaloba', 'artrisimi']
  };
  const CATEGORY_LABELS = {
    hongos: 'Hongos Medicinales',
    probioticos: 'Probióticos',
    longevidad: 'Antioxidantes & Longevidad',
    dermo: 'Dermocosmética',
    ocular: 'Cuidado Ocular',
    energia: 'Energía & Vitalidad',
    bienestar: 'Bienestar & Sueño',
    suplementos: 'Suplementos Naturales'
  };

  // Tagging dos produtos (na ordem em que existem)
  function tagProducts() {
    document.querySelectorAll('.product').forEach(card => {
      const skuEl = card.querySelector('[data-sku]');
      if (!skuEl) return;
      const sku = skuEl.dataset.sku;
      for (const [cat, skus] of Object.entries(CATEGORY_MAP)) {
        if (skus.includes(sku)) {
          card.dataset.cat = cat;
          break;
        }
      }
    });
  }

  function applyFilter() {
    const m = location.hash.match(/^#cat=(.+)/);
    const cat = m ? m[1] : null;
    const cards = document.querySelectorAll('.products-grid .product');
    let visible = 0;
    cards.forEach(c => {
      const show = !cat || c.dataset.cat === cat;
      c.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    renderChip(cat, visible);
    if (cat) {
      const target = document.getElementById('catalogo') || document.querySelector('.products-grid');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderChip(cat, count) {
    let chip = document.getElementById('foCatChip');
    const catalogo = document.getElementById('catalogo')?.querySelector('.section-head, .container');
    if (!cat) {
      chip?.remove();
      return;
    }
    if (!chip) {
      chip = document.createElement('div');
      chip.id = 'foCatChip';
      chip.className = 'fo-cat-chip';
      catalogo?.prepend(chip);
    }
    chip.innerHTML = `
      <span class="fo-cat-chip-label">Filtro:</span>
      <strong>${CATEGORY_LABELS[cat] || cat}</strong>
      <span class="fo-cat-chip-count">${count} producto${count !== 1 ? 's' : ''}</span>
      <a href="#" class="fo-cat-chip-clear" aria-label="Quitar filtro">×</a>
    `;
    chip.querySelector('.fo-cat-chip-clear').addEventListener('click', e => {
      e.preventDefault();
      history.replaceState(null, '', location.pathname + location.search);
      applyFilter();
    });
  }

  function init() {
    tagProducts();
    applyFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('hashchange', applyFilter);
})();

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
  const triggers = document.querySelectorAll('.menu-all');
  if (!menu || !triggers.length) return;

  // Backdrop e botão de fechar — adicionados via JS pra não tocar em todas as páginas
  const backdrop = document.createElement('div');
  backdrop.className = 'menu-backdrop';
  document.body.appendChild(backdrop);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'menu-close';
  closeBtn.setAttribute('aria-label', 'Cerrar menú');
  closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
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

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      menu.classList.contains('open') ? close() : open();
    });
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
