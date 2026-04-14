import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ASAAS_API_URL = 'https://api.asaas.com/v3';
const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

    const { amount, pix_key, pix_key_type } = await req.json();
    if (!amount || amount < 10) return Response.json({ error: 'Valor mínimo de saque é R$ 10,00' }, { status: 400 });
    if (!pix_key || !pix_key_type) return Response.json({ error: 'Chave Pix obrigatória' }, { status: 400 });

    // Verifica saldo
    const wallets = await base44.entities.Wallet.filter({ user_id: user.id });
    const wallet = wallets[0];
    if (!wallet || (wallet.balance || 0) < amount) {
      return Response.json({ error: 'Saldo insuficiente' }, { status: 400 });
    }

    // Realiza transferência Pix via Asaas
    const transferRes = await fetch(`${ASAAS_API_URL}/transfers`, {
      method: 'POST',
      headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value: amount,
        pixAddressKey: pix_key,
        pixAddressKeyType: pix_key_type,
        description: `Saque GALORE - ${user.full_name || user.email}`,
        externalReference: user.id
      })
    });
    const transfer = await transferRes.json();

    if (!transfer.id) return Response.json({ error: 'Erro ao processar saque', details: transfer }, { status: 500 });

    // Debita saldo da carteira
    await base44.entities.Wallet.update(wallet.id, {
      balance: (wallet.balance || 0) - amount,
      total_withdrawn: (wallet.total_withdrawn || 0) + amount
    });

    // Salva transação
    await base44.entities.Transaction.create({
      user_id: user.id,
      type: 'withdrawal',
      amount,
      status: transfer.status === 'DONE' ? 'confirmed' : 'pending',
      asaas_id: transfer.id,
      pix_key,
      pix_key_type,
      description: `Saque via Pix para ${pix_key}`
    });

    return Response.json({ success: true, status: transfer.status, transfer_id: transfer.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});