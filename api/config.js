/* ============================================
   Vercel Serverless Function · /api/config
   ============================================
   Devolve para o frontend somente os valores PÚBLICOS de configuração
   (chave pública do Pagou + ambiente). Mantém TUDO fora do código-fonte.

   ENV VARS:
     PAGOU_PUBLIC_KEY → pk_sandbox_xxx ou pk_live_xxx
     PAGOU_ENV        → "sandbox" (default) ou "production"
============================================ */

export default function handler(req, res) {
  // cache leve no edge — config muda raramente
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    pagouPublicKey: process.env.PAGOU_PUBLIC_KEY || '',
    pagouEnv: process.env.PAGOU_ENV || 'sandbox',
    googleAdsId: process.env.GOOGLE_ADS_ID || '',
    googleAdsConversionLabel: process.env.GOOGLE_ADS_CONVERSION_LABEL || '',
    metaPixelId: process.env.META_PIXEL_ID || '',
    clarityProjectId: process.env.CLARITY_PROJECT_ID || '',
  });
}
