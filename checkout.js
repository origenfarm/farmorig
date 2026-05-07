/* ============================================
   FARMA ORIGEN — Checkout (Pagou.ai integration)
   ============================================
   Lê o cart de localStorage (gerenciado por script.js),
   monta o resumo, integra com o Payment Element do Pagou.ai
   pra tokenizar a tarjeta e envia ao backend pra criar a transação.

   ✅ Toda a configuração (pública e secreta) vem de ENV VARS na Vercel:
       PAGOU_PUBLIC_KEY  → exposto via /api/config
       PAGOU_SECRET_KEY  → usado só no /api/pagou/transactions
       PAGOU_ENV         → "sandbox" / "production"
       PAGOU_WEBHOOK_SECRET (opcional) → /api/pagou/webhook
   Nada de chaves no código.
============================================ */

const BACKEND_URL        = '/api/pagou/transactions';
const CONFIG_URL         = '/api/config';
const SHIPPING_THRESHOLD = 30000;
const SHIPPING_FEE       = 3990;

(function checkout() {
  const fmt = n => '$' + n.toLocaleString('es-CL');
  const $   = id => document.getElementById(id);

  /* ---------- 1. CART RESUMO ---------- */
  cart.load();
  if (!cart.items.length) {
    document.querySelector('.ck-grid').innerHTML = `
      <div class="ck-empty">
        <h2>Tu carro está vacío</h2>
        <p>Agrega productos antes de finalizar la compra.</p>
        <a href="index.html" class="ck-pay-btn">Ver productos</a>
      </div>`;
    return;
  }

  const itemsEl = $('ckItems');
  itemsEl.innerHTML = cart.items.map(it => `
    <li class="ck-item">
      <div class="ck-item-img">
        <img src="assets/products/${slug(it.sku)}.jpg" onerror="this.src='https://placehold.co/120x120/1F4D3D/F4EFE6?text=${encodeURIComponent(it.name)}&font=raleway'" alt="${it.name}" />
        <span class="ck-item-qty">${it.qty}</span>
      </div>
      <div class="ck-item-info">
        <strong>${it.name}</strong>
        <small>${fmt(it.price)} c/u</small>
      </div>
      <span class="ck-item-total">${fmt(it.price * it.qty)}</span>
    </li>
  `).join('');

  function slug(s){ return String(s).toLowerCase().replace(/-kit\d+x\d+$/,''); }

  /* ---------- 2. TOTAIS ---------- */
  let subtotal = cart.total();
  let shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  let discount = 0;

  function refreshTotals() {
    subtotal = cart.total();
    shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = Math.max(0, subtotal + shipping - discount);
    $('ckSubtotal').textContent = fmt(subtotal);
    $('ckShipping').textContent = shipping === 0 ? 'Gratis' : fmt(shipping);
    $('ckTotal').textContent = fmt(total);
    $('ckPayAmount').textContent = fmt(total);
    return total;
  }
  refreshTotals();

  /* Cupom (placeholder: 10% off com FARMA10) */
  $('ckCouponBtn').addEventListener('click', () => {
    const code = $('ckCoupon').value.trim().toUpperCase();
    if (code === 'FARMA10') {
      discount = Math.round(subtotal * 0.10);
      refreshTotals();
      flashCoupon('Cupón aplicado: 10% off ✓', 'ok');
    } else if (!code) {
      flashCoupon('Ingresa un código', 'error');
    } else {
      discount = 0;
      refreshTotals();
      flashCoupon('Cupón inválido', 'error');
    }
  });
  function flashCoupon(msg, kind) {
    const el = document.querySelector('.ck-coupon');
    let f = el.querySelector('.ck-coupon-feedback');
    if (!f) { f = document.createElement('span'); f.className = 'ck-coupon-feedback'; el.appendChild(f); }
    f.textContent = msg;
    f.dataset.kind = kind;
  }

  /* ---------- 3. PRE-FILL DE LOCALSTORAGE ---------- */
  const region = JSON.parse(localStorage.getItem('fo_region') || 'null');
  if (region?.cep)    $('ckCep').value = region.cep;
  if (region?.region) $('ckRegion').value = region.region;
  if (region?.comuna) $('ckComuna').value = region.comuna;

  /* ---------- 4. RUT mask + validation ---------- */
  $('ckRut').addEventListener('input', e => {
    let v = e.target.value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (v.length > 9) v = v.slice(0, 9);
    if (v.length > 1) v = v.slice(0, -1) + '-' + v.slice(-1);
    if (v.length > 5) v = v.slice(0, -5) + '.' + v.slice(-5);
    if (v.length > 9) v = v.slice(0, -9) + '.' + v.slice(-9);
    e.target.value = v;
  });

  /* ---------- 5. PAGOU PAYMENT ELEMENT (cartão — único método disponível) ---------- */
  let elements, card;
  let pagouReady = false;

  initPagou();

  async function initPagou() {
    if (typeof Pagou === 'undefined') {
      mountFallback('SDK de pago no disponible. Verifica tu conexión.');
      return;
    }
    let cfg = { pagouPublicKey: '', pagouEnv: 'sandbox' };
    try {
      const r = await fetch(CONFIG_URL, { cache: 'no-store' });
      if (r.ok) cfg = await r.json();
    } catch (e) {
      console.warn('[Pagou] /api/config indisponível, modo demo');
    }

    if (!cfg.pagouPublicKey) {
      mountFallback('Configuración de pago pendiente. Configura PAGOU_PUBLIC_KEY en el panel de Vercel.');
      return;
    }

    try {
      Pagou.setEnvironment(cfg.pagouEnv);
      elements = Pagou.elements({
        publicKey: cfg.pagouPublicKey,
        locale: 'es',
        origin: window.location.origin,
      });
      card = elements.create('card', { theme: 'default' });
      card.mount('#ck-card-element');
      pagouReady = true;
      // Mostra cartões de teste quando em sandbox
      if (cfg.pagouEnv === 'sandbox') {
        const tc = document.getElementById('ckTestCards');
        if (tc) tc.hidden = false;
      }
    } catch (err) {
      console.error('[Pagou] init falhou:', err);
      mountFallback('No fue posible cargar el formulario de pago. Intenta más tarde.');
    }
  }

  function mountFallback(msg) {
    document.getElementById('ck-card-element').innerHTML =
      `<div class="ck-card-fallback">⚠️ ${msg}</div>`;
  }

  /* ---------- 6. FORM VALIDATION ---------- */
  function validateForm() {
    const required = ['ckName','ckRut','ckPhone','ckEmail','ckCep','ckRegion','ckComuna','ckStreet','ckNumber'];
    for (const id of required) {
      const el = $(id);
      if (!el.value.trim()) { el.focus(); return `Completa el campo: ${el.previousElementSibling?.textContent || id}`; }
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test($('ckEmail').value)) return 'Email inválido';
    if ($('ckCep').value.replace(/\D/g,'').length < 7) return 'Código postal inválido';
    return null;
  }

  /* ---------- 7. SUBMIT ---------- */
  const payBtn = $('ckPayBtn');
  payBtn.addEventListener('click', async () => {
    const err = validateForm();
    if (err) { showPayError(err); return; }
    showPayError(null);

    payBtn.disabled = true;
    payBtn.querySelector('.ck-pay-label').hidden = true;
    payBtn.querySelector('.ck-pay-loading').hidden = false;

    const total = refreshTotals();
    const orderId = 'FO-' + Date.now() + '-' + Math.random().toString(36).slice(2,7);

    try {
      if (!pagouReady) throw new Error('SDK do gateway não inicializado.');
      // elements.submit() tokeniza o cartão e chama createTransaction
      const result = await elements.submit({
        createTransaction: async (tokenData) => {
          const body = buildTransactionBody({
            method: 'credit_card',
            token: tokenData.token,
            orderId,
            total,
            installments: parseInt($('ckInstall').value, 10) || 1
          });
          return await postBackend(body);
        }
      });

      handleResult(result, orderId, total);
    } catch (e) {
      console.error('[checkout] erro:', e);
      // Tenta extrair mensagem real do gateway pra mostrar no modal
      let detail = e?.message || String(e);
      if (e?.response) {
        try { detail = JSON.stringify(e.response).slice(0, 300); } catch {}
      } else if (e?.data) {
        try { detail = JSON.stringify(e.data).slice(0, 300); } catch {}
      } else if (e?.gatewayError) {
        detail = e.gatewayError;
      }
      openResult({
        ok: false,
        title: 'Pago no aprobado',
        msg: `Mensaje del gateway: ${detail}`
      });
    } finally {
      payBtn.disabled = false;
      payBtn.querySelector('.ck-pay-label').hidden = false;
      payBtn.querySelector('.ck-pay-loading').hidden = true;
    }
  });

  /* Conforme exemplo enviado pelo suporte do Pagou para Chile:
     - currency: 'BRL' (Pagou converte CLP→BRL no lado deles)
     - amount em centavos de BRL
     - buyer.document NÃO é enviado (undefined)
     - RUT guardado em metadata.user_identification_number
     - phone: '56XXXXXXXXX' (DDI Chile + 9 dígitos = 11 total)
     - address.state: código ISO 2 letras (sem prefixo CL-)
     - shipping.address separado do buyer.address
  */
  const CLP_TO_BRL = 0.0058; // taxa aproximada — ajustar conforme câmbio
  const REGION_TO_ISO = {
    'XV':'AP','I':'TA','II':'AN','III':'AT','IV':'CO',
    'V':'VS','RM':'RM','VI':'LI','VII':'ML','XVI':'NB',
    'VIII':'BI','IX':'AR','XIV':'LR','X':'LL','XI':'AY','XII':'MA'
  };

  function buildTransactionBody({ method, token, orderId, total, installments }) {
    const rut = $('ckRut').value.replace(/[^0-9kK]/g, '').toUpperCase();
    let phoneDigits = $('ckPhone').value.replace(/\D/g, '');
    if (!phoneDigits.startsWith('56')) phoneDigits = '56' + phoneDigits;
    phoneDigits = phoneDigits.slice(0, 11).padEnd(11, '0');
    const amountBRL = Math.max(100, Math.round(total * CLP_TO_BRL * 100));
    const stateIso = REGION_TO_ISO[$('ckRegion').value] || 'RM';

    const address = {
      street: $('ckStreet').value.trim(),
      number: $('ckNumber').value.trim() || '0',
      complement: $('ckExtra').value.trim() || null,
      city: $('ckComuna').value.trim() || 'Santiago',
      state: stateIso,
      zipCode: $('ckCep').value.replace(/\D/g, '').padStart(8, '0'),
      country: 'CL',
      neighborhood: undefined
    };

    const body = {
      method, // 'credit_card' ou 'boleto'
      amount: amountBRL,
      currency: 'BRL',
      notify_url: `${window.location.origin}/api/pagou/webhook`,
      buyer: {
        name: $('ckName').value.trim(),
        email: $('ckEmail').value.trim(),
        phone: phoneDigits,
        docNumber: undefined,
        document: undefined,
        address
      },
      products: cart.items.map(i => ({
        name: i.name,
        price: Math.round(i.price * CLP_TO_BRL * 100)
      })),
      metadata: JSON.stringify({
        provider: 'Checkout Farma Origen',
        order_id: orderId,
        original_amount_clp: total,
        original_currency: 'CLP',
        user_email: $('ckEmail').value.trim(),
        user_identification_number: rut
      }),
      shipping: { address },
      external_ref: orderId,
      traceable: true
    };

    if (method === 'credit_card') {
      body.token = token;
      body.installments = installments;
    }
    // boleto: sem token, sem installments

    return body;
  }

  async function postBackend(body) {
    const r = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = json?.message || json?.error || JSON.stringify(json) || ('HTTP ' + r.status);
      const err = new Error('gateway_error');
      err.gatewayError = msg;
      err.gatewayStatus = r.status;
      err.data = json;
      throw err;
    }
    return json.data || json;
  }

  function handleResult(res, orderId, total) {
    const status = res?.status || res?.data?.status;
    const next   = res?.next_action || res?.data?.next_action;

    // 3DS in-flight
    if (next?.type === 'three_ds_challenge') {
      openResult({
        ok: true,
        title: 'Verificación en curso',
        msg: 'Tu banco solicita una validación adicional. Sigue las instrucciones del SDK 3D Secure.'
      });
      return;
    }

    if (status === 'authorized' || status === 'captured' || status === 'paid') {
      cart.items = []; cart.save(); cart.refresh();
      openResult({
        ok: true,
        title: '¡Pago aprobado!',
        msg: `Tu orden #${orderId} por ${fmt(total)} fue confirmada. Recibirás el seguimiento en tu email.`
      });
    } else if (status === 'pending' || status === 'processing') {
      openResult({
        ok: true,
        title: 'Procesando tu pago',
        msg: `Tu orden #${orderId} está en revisión. Te avisaremos por email apenas se confirme.`
      });
    } else {
      openResult({
        ok: false,
        title: 'Pago no aprobado',
        msg: 'No pudimos procesar tu tarjeta. Verifica los datos o usa otro medio de pago.'
      });
    }
  }


  /* ---------- 8. UI HELPERS ---------- */
  function showPayError(msg) {
    const el = $('ckPayError');
    if (!msg) { el.hidden = true; el.textContent = ''; return; }
    el.hidden = false;
    el.textContent = msg;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function openResult({ ok, title, msg }) {
    $('ckResultTitle').textContent = title;
    $('ckResultMsg').textContent = msg;
    $('ckResultIcon').innerHTML = ok
      ? '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
      : '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    $('ckResultIcon').className = 'ck-modal-icon ' + (ok ? 'ok' : 'error');
    $('ckResult').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  $('ckResult').addEventListener('click', e => {
    if (e.target.id === 'ckResult') {
      $('ckResult').hidden = true; document.body.style.overflow = '';
    }
  });
})();
