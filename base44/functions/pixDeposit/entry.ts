import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ASAAS_API_URL = 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');

async function getOrCreateAsaasCustomer(user) {
  // Busca cliente existente pelo email
  const searchRes = await fetch(`${ASAAS_API_URL}/customers?email=${encodeURIComponent(user.email)}`, {
    headers: { 'access_token': ASAAS_API_KEY }
  });
  const searchData = await searchRes.json();

  if (searchData.data && searchData.data.length > 0) {
    return searchData.data[0].id;
  }

  // Cria novo cliente
  const createRes = await fetch(`${ASAAS_API_URL}/customers`, {
    method: 'POST',
    headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: user.full_name || user.email,
      email: user.email,
      externalReference: user.id
    })
  });
  const customer = await createRes.json();
  return customer.id;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

    const { amount } = await req.json();
    if (!amount || amount < 5) return Response.json({ error: 'Valor mínimo de depósito é R$ 5,00' }, { status: 400 });

    // Obtém ou cria cliente no Asaas
    const customerId = await getOrCreateAsaasCustomer(user);

    // Cria cobrança Pix
    const chargeRes = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'PIX',
        value: amount,
        dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString().split('T')[0],
        description: `Depósito GALORE - ${user.full_name || user.email}`,
        externalReference: user.id
      })
    });
    const charge = await chargeRes.json();

    if (!charge.id) return Response.json({ error: 'Erro ao criar cobrança', details: charge }, { status: 500 });

    // Busca QR Code Pix
    const pixRes = await fetch(`${ASAAS_API_URL}/payments/${charge.id}/pixQrCode`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });
    const pixData = await pixRes.json();

    // Salva transação no banco
    const transaction = await base44.entities.Transaction.create({
      user_id: user.id,
      type: 'deposit',
      amount,
      status: 'pending',
      asaas_id: charge.id,
      pix_copy_paste: pixData.payload,
      pix_qr_code: pixData.encodedImage,
      description: `Depósito via Pix`
    });

    return Response.json({
      transaction_id: transaction.id,
      pix_copy_paste: pixData.payload,
      pix_qr_code: pixData.encodedImage,
      amount,
      expires_in: '30 minutos'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});