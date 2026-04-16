import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ASAAS_API_URL = 'https://api.asaas.com/v3';
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');

const MANAGER_FEE = 0.07; // 7% para o gerente
const POOL_SHARE = 0.93;  // 93% vai para a pool da aposta

async function getOrCreateAsaasCustomer(user) {
  const searchRes = await fetch(`${ASAAS_API_URL}/customers?email=${encodeURIComponent(user.email)}`, {
    headers: { 'access_token': ASAAS_API_KEY }
  });
  const searchData = await searchRes.json();

  if (searchData.data && searchData.data.length > 0) {
    return searchData.data[0].id;
  }

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

    const { amount, prediction_id, selected_option } = await req.json();

    if (!amount || amount < 1) return Response.json({ error: 'Valor mínimo de R$ 1,00' }, { status: 400 });
    if (!prediction_id) return Response.json({ error: 'Previsão não informada' }, { status: 400 });
    if (!selected_option) return Response.json({ error: 'Opção não selecionada' }, { status: 400 });

    // Busca a previsão para calcular lucro potencial
    const prediction = await base44.entities.Prediction.get(prediction_id);
    if (!prediction) return Response.json({ error: 'Previsão não encontrada' }, { status: 400 });

    const predData = prediction;

    // Calcula percentual da opção escolhida
    let optionPercentage;
    if (predData.bet_type === 'yes_no') {
      optionPercentage = selected_option === 'yes' ? predData.yes_percentage : predData.no_percentage;
    } else {
      const opt = predData.options?.find(o => o.label === selected_option);
      optionPercentage = opt ? opt.percentage : 50;
    }

    // Lucro potencial: apostou X, se ganhar recebe X * (100 / optionPercentage) - X
    // Mas descontando 7% de taxa do gerente da pool
    const poolAmount = amount * POOL_SHARE; // 93% vai para pool
    const multiplier = 100 / optionPercentage;
    const potentialReturn = poolAmount * multiplier;
    const potentialProfit = potentialReturn - amount;

    // Obtém ou cria cliente no Asaas
    const customerId = await getOrCreateAsaasCustomer(user);

    // Cria cobrança Pix para a aposta
    const chargeRes = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'PIX',
        value: amount,
        dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString().split('T')[0],
        description: `Aposta GALORE - ${predData.title} - ${user.full_name || user.email}`,
        externalReference: `bet_${user.id}_${prediction_id}`
      })
    });
    const charge = await chargeRes.json();

    if (!charge.id) return Response.json({ error: 'Erro ao criar cobrança Pix', details: charge }, { status: 500 });

    // Busca QR Code Pix
    const pixRes = await fetch(`${ASAAS_API_URL}/payments/${charge.id}/pixQrCode`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });
    const pixData = await pixRes.json();

    // Salva a aposta como pendente (aguardando pagamento Pix)
    const bet = await base44.entities.Bet.create({
      prediction_id,
      room_id: predData.room_id,
      user_id: user.id,
      amount,
      selected_option,
      potential_profit: parseFloat(potentialProfit.toFixed(2)),
      status: 'active'
    });

    // Salva transação pendente vinculada à aposta
    await base44.entities.Transaction.create({
      user_id: user.id,
      type: 'deposit',
      amount,
      status: 'pending',
      asaas_id: charge.id,
      pix_copy_paste: pixData.payload,
      pix_qr_code: pixData.encodedImage,
      description: `Aposta: ${predData.title} - ${selected_option}`
    });

    return Response.json({
      bet_id: bet.id,
      pix_copy_paste: pixData.payload,
      pix_qr_code: pixData.encodedImage,
      amount,
      pool_amount: parseFloat(poolAmount.toFixed(2)),
      manager_fee: parseFloat((amount * MANAGER_FEE).toFixed(2)),
      potential_profit: parseFloat(potentialProfit.toFixed(2)),
      potential_return: parseFloat(potentialReturn.toFixed(2)),
      expires_in: '30 minutos'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});