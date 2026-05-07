/* ============================================
   Vercel Serverless Function · /api/producto/[sku]
   ============================================
   Renderiza producto.html com meta tags injetadas server-side
   (Open Graph + Twitter Card) baseado no SKU. Faz com que links
   compartilhados em WhatsApp/Telegram/Twitter mostrem nome, marca,
   preço e imagem do produto correto em vez do título genérico.

   Roteamento: /productos/:sku → /api/producto/[sku] (via vercel.json)
============================================ */

import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://www.farmaorigen.com';

let _productsCache = null;
function loadProducts() {
  if (_productsCache) return _productsCache;
  try {
    const text = fs.readFileSync(path.join(process.cwd(), 'products-data.js'), 'utf8');
    const m = text.match(/window\.FO_PRODUCTS\s*=\s*(\[[\s\S]*?\]);?\s*$/);
    if (!m) return [];
    _productsCache = JSON.parse(m[1]);
    return _productsCache;
  } catch (e) {
    console.error('[producto-ssr] failed loading products', e);
    return [];
  }
}

function findProduct(sku) {
  const products = loadProducts();
  return products.find(p => p.sku === sku);
}

function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function imageUrl(sku) {
  // Tenta webp primeiro (mais comum nas pastas), com fallback pra jpg.
  // Browsers/crawlers respeitam <meta property=og:image> com qualquer extensão.
  const exts = ['webp', 'jpg', 'jpeg', 'png'];
  for (const ext of exts) {
    const file = path.join(process.cwd(), 'assets', 'products', `${sku}.${ext}`);
    try {
      if (fs.existsSync(file)) return `${SITE_URL}/assets/products/${sku}.${ext}`;
    } catch {}
  }
  // Fallback placeholder
  return `https://placehold.co/1200x630/1F4D3D/F4EFE6?text=${encodeURIComponent(sku)}&font=raleway`;
}

export default function handler(req, res) {
  const sku = req.query.sku;
  if (!sku || typeof sku !== 'string') {
    return res.status(400).send('Missing sku');
  }

  const product = findProduct(sku);

  let templatePath = path.join(process.cwd(), 'producto.html');
  let html;
  try {
    html = fs.readFileSync(templatePath, 'utf8');
  } catch (e) {
    return res.status(500).send('Template not found');
  }

  // Se SKU não existe, ainda assim renderiza o template (JS dará 404 amigável)
  // mas com tags genéricas.
  const title = product
    ? `${product.fullName} — Farma Origen`
    : 'Producto — Farma Origen';
  const desc = product
    ? `${product.fullName}${product.brand ? ' de ' + product.brand : ''} · Disponible en Farma Origen con despacho a todo Chile.`
    : 'Detalle de producto en Farma Origen. Despacho a todo Chile.';
  const img = product ? imageUrl(product.sku) : `${SITE_URL}/assets/logofarmaorigen.jpeg`;
  const url = `${SITE_URL}/productos/${sku}`;
  const price = product ? product.price : null;

  // Substitui <title> e <meta description> existentes
  html = html.replace(
    /<title>[^<]*<\/title>/i,
    `<title>${escHtml(title)}</title>`
  );
  html = html.replace(
    /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="description" content="${escHtml(desc)}" />`
  );

  // Bloco OG / Twitter / Schema injetado antes do </head>
  const ogBlock = `
  <link rel="canonical" href="${escHtml(url)}" />
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="Farma Origen" />
  <meta property="og:title" content="${escHtml(title)}" />
  <meta property="og:description" content="${escHtml(desc)}" />
  <meta property="og:image" content="${escHtml(img)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="1200" />
  <meta property="og:url" content="${escHtml(url)}" />
  <meta property="og:locale" content="es_CL" />
  ${price ? `<meta property="product:price:amount" content="${price}" />
  <meta property="product:price:currency" content="CLP" />
  <meta property="product:availability" content="instock" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escHtml(title)}" />
  <meta name="twitter:description" content="${escHtml(desc)}" />
  <meta name="twitter:image" content="${escHtml(img)}" />
  `;
  html = html.replace('</head>', ogBlock + '</head>');

  // Cache 1h no edge, revalida 24h em background — preview rápido sem
  // ficar stale por muito tempo.
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(product ? 200 : 200).send(html);
}
