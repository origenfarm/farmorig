/* ============================================
   Resend email helper + templates
   ============================================
   ENV VARS na Vercel:
     RESEND_API_KEY   → re_xxxxxxxxx (obrigatório pra enviar)
     EMAIL_FROM       → "Farma Origen <pedidos@farmaorigen.com>" ou onboarding@resend.dev
     EMAIL_REPLY_TO   → contacto@farmaorigen.com (responder vai pra cá)
     EMAIL_BCC        → contacto@farmaorigen.com (cópia oculta de TODO email)
     ADMIN_EMAIL      → contacto@farmaorigen.com (notificação dedicada de nova ordem)
                        (opcional — BCC já cobre se preferires)

   USO:
     import { sendOrderReceived, sendOrderConfirmed } from '../_email.js';
     await sendOrderReceived({ orderId, total, items, buyer });
============================================ */

const RESEND_URL = 'https://api.resend.com/emails';
const FROM = () => process.env.EMAIL_FROM || 'onboarding@resend.dev';
const REPLY_TO = () => process.env.EMAIL_REPLY_TO || 'contacto@farmaorigen.com';
const BCC = () => process.env.EMAIL_BCC || null;

const fmt = n => '$' + Number(n).toLocaleString('es-CL');

function baseLayout(title, bodyHtml, accent) {
  const accentBar = accent || '#1F4D3D';
  return `<!doctype html>
<html><head><meta charset="utf-8"/><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F4EFE6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#2A2A2A;">
  <div style="display:none;max-height:0;overflow:hidden;">${title} · Farma Origen</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4EFE6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(20,50,41,.10);">
        <!-- Top color stripe -->
        <tr><td style="background:${accentBar};height:6px;line-height:6px;font-size:0;">&nbsp;</td></tr>
        <!-- Header -->
        <tr><td style="background:#143229;padding:32px 36px;text-align:center;">
          <div style="font-size:1.6rem;font-weight:900;color:#E8C66B;letter-spacing:0.06em;margin-bottom:4px;">FARMA ORIGEN</div>
          <div style="color:rgba(244,239,230,.7);font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;">Origen natural · cuidado real</div>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px 36px;">
          ${bodyHtml}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#143229;padding:28px 36px;color:rgba(244,239,230,0.7);font-size:0.78rem;text-align:center;line-height:1.6;">
          <div style="margin-bottom:8px;">¿Necesitas ayuda? Escríbenos a <a href="mailto:contacto@farmaorigen.com" style="color:#E8C66B;text-decoration:none;font-weight:700;">contacto@farmaorigen.com</a></div>
          <div style="font-size:0.7rem;opacity:0.7;">© Farma Origen · <a href="https://farmaorigen.com" style="color:rgba(244,239,230,0.8);text-decoration:none;">farmaorigen.com</a></div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function itemsTable(items) {
  if (!items || !items.length) return '';
  const rows = items.map(i => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;">${i.name}${i.qty>1?` × ${i.qty}`:''}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:#143229;">${fmt(i.price * (i.qty || 1))}</td>
    </tr>`).join('');
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:.92rem;">${rows}</table>`;
}

/* ---------- Templates ---------- */

function tplOrderReceived({ orderId, total, items, buyerName }) {
  return baseLayout('Recibimos tu pedido', `
    <h2 style="color:#143229;margin:0 0 8px;">¡Hola${buyerName ? ', ' + buyerName : ''}!</h2>
    <p style="color:#2A2A2A;line-height:1.6;margin:0 0 16px;">
      Recibimos tu pedido <strong>#${orderId}</strong> y estamos confirmando el pago.
      Apenas se acredite, te avisamos por aquí y empezamos a preparar tu envío.
    </p>
    ${itemsTable(items)}
    <table width="100%" style="margin-top:8px;border-top:2px solid #143229;padding-top:12px;">
      <tr>
        <td style="font-weight:800;color:#143229;font-size:1.05rem;">Total</td>
        <td style="font-weight:900;color:#1F4D3D;font-size:1.3rem;text-align:right;">${fmt(total)}</td>
      </tr>
    </table>
    <p style="color:#5A5A5A;font-size:.85rem;line-height:1.55;margin-top:18px;">
      Despacho gratis en compras sobre $30.000. El plazo de entrega es de 24 a 72 horas hábiles
      según tu región (RM, V y VIII más rápido).
    </p>`);
}

function tplOrderConfirmed({ orderId, total, buyerName }) {
  return baseLayout('Pago confirmado', `
    <div style="background:#E8F5E9;border-radius:10px;padding:14px 16px;margin-bottom:16px;border-left:3px solid #6B8E5A;">
      <strong style="color:#1F4D3D;">✓ Pago aprobado</strong>
    </div>
    <h2 style="color:#143229;margin:0 0 8px;">¡Listo${buyerName ? ', ' + buyerName : ''}!</h2>
    <p style="color:#2A2A2A;line-height:1.6;margin:0 0 16px;">
      Confirmamos el pago de tu pedido <strong>#${orderId}</strong> por <strong>${fmt(total)}</strong>.
      Lo estamos preparando y vamos a despacharlo en las próximas horas hábiles.
    </p>
    <p style="color:#2A2A2A;line-height:1.6;margin:0 0 16px;">
      Te enviaremos otro email con el código de seguimiento del courier
      (Chilexpress, Starken o Blue Express, según destino).
    </p>`);
}

function tplOrderFailed({ orderId, total, buyerName }) {
  return baseLayout('Pago no aprobado', `
    <div style="background:#FBE9E5;border-radius:10px;padding:14px 16px;margin-bottom:16px;border-left:3px solid #B5634A;">
      <strong style="color:#B5634A;">✗ Pago no aprobado</strong>
    </div>
    <h2 style="color:#143229;margin:0 0 8px;">Hola${buyerName ? ', ' + buyerName : ''}</h2>
    <p style="color:#2A2A2A;line-height:1.6;margin:0 0 16px;">
      No pudimos procesar el pago de tu pedido <strong>#${orderId}</strong> por <strong>${fmt(total)}</strong>.
      Puede haber sido un saldo insuficiente, datos incorrectos o un rechazo del banco.
    </p>
    <p style="color:#2A2A2A;line-height:1.6;margin:0 0 16px;">
      Vuelve a la tienda y prueba con otra tarjeta — el carro sigue guardado.
    </p>
    <p style="text-align:center;margin:24px 0;">
      <a href="https://farmaorigen.com/" style="background:#1F4D3D;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:800;">
        Volver al checkout
      </a>
    </p>`);
}

function tplAdminNew({ orderId, total, items, buyer }) {
  const itemsList = (items || []).map(i =>
    `· ${i.name}${i.qty>1?` × ${i.qty}`:''} — ${fmt(i.price * (i.qty || 1))}`
  ).join('<br/>');
  const addr = buyer?.address || {};
  return baseLayout('Nueva orden', `
    <h2 style="color:#143229;margin:0 0 12px;">Nueva orden recibida</h2>
    <table width="100%" cellpadding="6" cellspacing="0" style="font-size:.92rem;background:#F4EFE6;border-radius:8px;padding:8px;">
      <tr><td><strong>Orden:</strong></td><td>#${orderId}</td></tr>
      <tr><td><strong>Total:</strong></td><td><strong>${fmt(total)}</strong></td></tr>
      <tr><td><strong>Cliente:</strong></td><td>${buyer?.name || '—'}</td></tr>
      <tr><td><strong>Email:</strong></td><td>${buyer?.email || '—'}</td></tr>
      <tr><td><strong>Teléfono:</strong></td><td>${buyer?.phone || '—'}</td></tr>
      <tr><td><strong>RUT/Doc:</strong></td><td>${buyer?.document?.number || '—'}</td></tr>
      <tr><td><strong>Dirección:</strong></td><td>${addr.street || ''} ${addr.number || ''}, ${addr.city || ''} (${addr.state || ''}), ${addr.zipCode || ''}</td></tr>
    </table>
    <h3 style="color:#143229;margin-top:20px;margin-bottom:8px;">Productos</h3>
    <p style="line-height:1.7;font-size:.92rem;">${itemsList}</p>`);
}

/* ---------- Public API ---------- */

async function send({ to, subject, html, replyTo, skipBcc }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — skipping send');
    return { skipped: true };
  }
  if (!to) return { skipped: true, reason: 'no recipient' };

  const payload = {
    from: FROM(),
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    reply_to: replyTo || REPLY_TO()
  };

  // BCC oculto: copia o admin em todos os emails (exceto se a flag skipBcc
  // estiver ligada, ex: pra notificação dedicada do admin que já vai pra ele)
  const bcc = BCC();
  if (bcc && !skipBcc) {
    // Não copia se o destinatário JÁ é o BCC (evita auto-reply)
    const toList = Array.isArray(to) ? to : [to];
    if (!toList.some(t => t.toLowerCase().includes(bcc.toLowerCase()))) {
      payload.bcc = [bcc];
    }
  }

  try {
    const r = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('[email] resend error', r.status, body);
      return { ok: false, status: r.status, body };
    }
    return { ok: true, id: body.id };
  } catch (err) {
    console.error('[email] fetch falhou', err);
    return { ok: false, err: String(err) };
  }
}

export async function sendOrderReceived({ orderId, total, items, buyer }) {
  const html = tplOrderReceived({ orderId, total, items, buyerName: buyer?.name?.split(' ')[0] });
  return send({ to: buyer?.email, subject: `Recibimos tu pedido #${orderId}`, html });
}

export async function sendOrderConfirmed({ orderId, total, buyer }) {
  const html = tplOrderConfirmed({ orderId, total, buyerName: buyer?.name?.split(' ')[0] });
  return send({ to: buyer?.email, subject: `✓ Pago aprobado · pedido #${orderId}`, html });
}

export async function sendOrderFailed({ orderId, total, buyer }) {
  const html = tplOrderFailed({ orderId, total, buyerName: buyer?.name?.split(' ')[0] });
  return send({ to: buyer?.email, subject: `Pago no aprobado · pedido #${orderId}`, html });
}

export async function sendAdminNew({ orderId, total, items, buyer }) {
  const admin = process.env.ADMIN_EMAIL || process.env.EMAIL_BCC || 'contacto@farmaorigen.com';
  const html = tplAdminNew({ orderId, total, items, buyer });
  // skipBcc pra não duplicar (se admin == BCC, manda só uma vez)
  return send({ to: admin, subject: `🟢 Nueva orden #${orderId} — ${fmt(total)}`, html, skipBcc: true });
}
