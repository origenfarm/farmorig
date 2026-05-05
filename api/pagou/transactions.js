/* ============================================
   Vercel Serverless Function · /api/pagou/transactions
   ============================================
   Recebe o payload tokenizado do frontend (checkout.js)
   e chama POST https://api.pagou.ai/v2/transactions
   com a SECRET key Bearer (nunca exposta ao browser).

   ENV VARS necessárias no painel da Vercel:
     PAGOU_SECRET_KEY  →  sk_sandbox_xxx ou sk_live_xxx
     PAGOU_ENV         →  "sandbox" (default) ou "production"
============================================ */

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const secret = process.env.PAGOU_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ error: 'missing_pagou_secret' });
  }

  // Pega IP real (Vercel inclui x-forwarded-for)
  const ip = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '')
    .toString().split(',')[0].trim();

  const payload = {
    ...req.body,
    ip_address: ip || req.body.ip_address,
  };

  // Validação mínima
  if (!payload.amount || !payload.currency || !payload.token || !payload.buyer || !payload.products) {
    return res.status(400).json({ error: 'invalid_payload' });
  }

  try {
    const r = await fetch('https://api.pagou.ai/v2/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await r.json().catch(() => ({}));

    if (!r.ok) {
      console.error('[pagou] erro', r.status, json);
      return res.status(r.status).json(json);
    }

    return res.status(200).json(json);
  } catch (err) {
    console.error('[pagou] fetch falhou', err);
    return res.status(502).json({ error: 'pagou_unreachable', detail: String(err) });
  }
}
