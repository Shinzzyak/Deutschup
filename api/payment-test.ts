import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BAYAR_GG_API_KEY = process.env.BAYAR_GG_API_KEY || '';
  const APP_URL = process.env.APP_URL || 'http://localhost:3000';
  const TEST_PAYMENT_MODE = process.env.TEST_PAYMENT_MODE === 'true';

  console.log('[PAYMENT-DEBUG] BAYAR_GG_API_KEY_LENGTH:', BAYAR_GG_API_KEY.length);
  console.log('[PAYMENT-DEBUG] APP_URL:', APP_URL);
  console.log('[PAYMENT-DEBUG] TEST_PAYMENT_MODE:', TEST_PAYMENT_MODE);

  if (BAYAR_GG_API_KEY.length < 10) {
    console.error('[PAYMENT-DEBUG] API key too short or missing');
    return res.status(500).json({
      error: 'Payment configuration error',
      diagnostic: {
        apiKeyPresent: BAYAR_GG_API_KEY.length > 0,
        apiKeyLength: BAYAR_GG_API_KEY.length,
        appUrl: APP_URL,
      },
    });
  }

  const payload = {
    amount: TEST_PAYMENT_MODE ? 1000 : 49000,
    description: 'DeutschUp PRO Subscription (Test)',
    customer_name: 'Test User',
    customer_email: 'test@example.com',
    callback_url: `${APP_URL}/api/payment?action=callback`,
    redirect_url: `${APP_URL}/dashboard?payment=success`,
    payment_method: 'qris',
  };

  console.log('[PAYMENT-DEBUG] REQUEST:', JSON.stringify(payload, null, 2));

  try {
    const bayarRes = await fetch('https://www.bayar.gg/api/create-payment.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': BAYAR_GG_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    console.log('[PAYMENT-DEBUG] STATUS:', bayarRes.status);
    console.log('[PAYMENT-DEBUG] CONTENT_TYPE:', bayarRes.headers.get('content-type'));

    const raw = await bayarRes.text();
    console.log('[PAYMENT-DEBUG] RAW_RESPONSE:', raw.slice(0, 2000));

    let bayarData: any;
    try {
      bayarData = JSON.parse(raw);
    } catch (parseErr) {
      return res.status(502).json({
        error: 'Payment gateway returned non-JSON',
        status: bayarRes.status,
        contentType: bayarRes.headers.get('content-type'),
        rawFirst500: raw.slice(0, 500),
      });
    }

    console.log('[PAYMENT-DEBUG] PARSED:', JSON.stringify(bayarData, null, 2));

    if (bayarData.success && bayarData.data?.invoice_id) {
      return res.json({
        success: true,
        message: 'Payment gateway connection successful',
        invoice_id: bayarData.data.invoice_id,
        payment_url: bayarData.data.payment_url,
        amount: payload.amount,
        testMode: TEST_PAYMENT_MODE,
      });
    } else {
      return res.status(400).json({
        error: 'Payment gateway rejected request',
        gateway_response: bayarData,
        apiKeyLength: BAYAR_GG_API_KEY.length,
      });
    }
  } catch (error: any) {
    console.error('[PAYMENT-DEBUG] FETCH_ERROR:', error.message);
    return res.status(502).json({
      error: 'Failed to connect to payment gateway',
      message: error.message,
    });
  }
}
