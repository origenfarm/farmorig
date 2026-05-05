/* ============================================
   Vercel Serverless Function · /api/pagou/webhook
   ============================================
   Recebe notificações do Pagou.ai sobre mudança de status
   das transações (autorizada, capturada, recusada, etc).

   ENV VAR opcional pra validação:
     PAGOU_WEBHOOK_SECRET → secret de assinatura HMAC (se o Pagou enviar)

   Deduplicação: chave o `id` do evento e ignora repetidos.
   Como não há banco de dados nesta versão, fazemos
   apenas log + 200 OK. Quando você plugar Supabase/Postgres,
   é aqui que a transação é marcada como paga, dispara email,
   etc.
============================================ */

import crypto from 'node:crypto';

// Pequeno cache em memória pra dedupe (válido enquanto a função estiver "warm").
// Pra produção robusta, troque por Redis/KV/DB.
const seen = new Set();
function rememberEvent(id) {
  if (!id) return false;
  if (seen.has(id)) return true;
  seen.add(id);
  if (seen.size > 500) seen.clear(); // evita vazamento de memória
  return false;
}

function verifySignature(rawBody, header, secret) {
  if (!secret || !header) return true; // se não há secret configurado, aceita
  try {
    const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    // o header pode vir como "sha256=..." ou só hex
    const provided = String(header).replace(/^sha256=/, '');
    return crypto.timingSafeEqual(
      Buffer.from(computed, 'hex'),
      Buffer.from(provided, 'hex')
    );
  } catch {
    return false;
  }
}

export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const raw = await readRawBody(req);

  // Validação opcional de assinatura
  const sigHeader = req.headers['x-pagou-signature'] || req.headers['x-signature'];
  if (process.env.PAGOU_WEBHOOK_SECRET) {
    if (!verifySignature(raw, sigHeader, process.env.PAGOU_WEBHOOK_SECRET)) {
      console.warn('[webhook] assinatura inválida');
      return res.status(401).json({ error: 'invalid_signature' });
    }
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return res.status(400).json({ error: 'invalid_json' });
  }

  if (rememberEvent(event.id)) {
    return res.status(200).json({ ok: true, deduplicated: true });
  }

  const tx = event.data || event.transaction || event;
  const status = tx.status || event.type;
  const externalRef = tx.external_ref || tx.externalRef;
  const amount = tx.amount;

  // Loga (visível em Vercel → Functions → Logs)
  console.log('[pagou-webhook]', {
    id: event.id,
    type: event.type,
    status,
    externalRef,
    amount,
    txId: tx.id,
  });

  // TODO: quando tiver banco, atualize o pedido externalRef com o status:
  // if (status === 'captured' || status === 'paid') { markOrderPaid(externalRef); }
  // if (status === 'refused' || status === 'failed') { markOrderFailed(externalRef); }

  return res.status(200).json({ ok: true });
}
