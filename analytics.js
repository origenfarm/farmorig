/* ============================================
   FARMA ORIGEN — Analytics & Conversion Tracking
   ============================================
   Carrega Google Ads gtag e (opcional) Meta Pixel a partir das envs
   da Vercel. Expõe foPurchase() pra disparar conversão de compra.

   ENV VARS na Vercel (lidas via /api/config):
     GOOGLE_ADS_ID                  → AW-XXXXXXXXXX
     GOOGLE_ADS_CONVERSION_LABEL    → AbC-D_efGhIjKlMn
     META_PIXEL_ID                  → 123456789012345 (opcional)

   USO em qualquer página:
     <script src="analytics.js" defer></script>
   USO na /gracias:
     window.foPurchase({ orderId, value, currency: 'CLP' });
============================================ */

(async function() {
  let cfg = {};
  try {
    const r = await fetch('/api/config', { cache: 'no-store' });
    if (r.ok) cfg = await r.json();
  } catch (e) {
    // Sem rede / sem backend — analytics simplesmente não carrega
    return;
  }

  /* ---------- Google Ads / GA4 (gtag.js) ---------- */
  if (cfg.googleAdsId) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${cfg.googleAdsId}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', cfg.googleAdsId, { allow_enhanced_conversions: true });

    // Guarda os IDs pra a função de conversão
    window.__FO_GADS_ID = cfg.googleAdsId;
    window.__FO_GADS_LABEL = cfg.googleAdsConversionLabel || '';
  }

  /* ---------- Meta Pixel (Facebook/Instagram) ---------- */
  if (cfg.metaPixelId) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
      n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
      t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', cfg.metaPixelId);
    fbq('track', 'PageView');
    window.__FO_META_PIXEL = cfg.metaPixelId;
  }
})();

/* ---------- API pública ----------
   Chame após uma compra confirmada.
*/
window.foPurchase = function(opts) {
  const { orderId, value, currency = 'CLP', items = [] } = opts || {};

  // Google Ads conversion
  if (window.gtag && window.__FO_GADS_LABEL) {
    window.gtag('event', 'conversion', {
      send_to: `${window.__FO_GADS_ID}/${window.__FO_GADS_LABEL}`,
      value: Number(value) || 0,
      currency,
      transaction_id: orderId || ''
    });
    // GA4 / Enhanced ecommerce
    window.gtag('event', 'purchase', {
      transaction_id: orderId || '',
      value: Number(value) || 0,
      currency,
      items
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: Number(value) || 0,
      currency,
      content_ids: items.map(i => i.id || i.item_id).filter(Boolean),
      content_type: 'product'
    });
  }
};

/* Helper opcional: dispara InitiateCheckout / view_item etc. */
window.foEvent = function(name, params) {
  if (window.gtag) window.gtag('event', name, params || {});
  if (window.fbq) {
    const map = { initiate_checkout: 'InitiateCheckout', view_item: 'ViewContent', add_to_cart: 'AddToCart' };
    const fbName = map[name];
    if (fbName) window.fbq('track', fbName, params || {});
  }
};
