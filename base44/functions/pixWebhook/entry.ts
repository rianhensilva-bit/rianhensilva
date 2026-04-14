import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Asaas envia evento de pagamento confirmado
    const event = body.event;
    const payment = body.payment;

    if (!payment || !payment.id) {
      return Response.json({ received: true });
    }

    // Busca a transação pelo asaas_id
    const transactions = await base44.asServiceRole.entities.Transaction.filter({ asaas_id: payment.id });
    if (!transactions || transactions.length === 0) {
      return Response.json({ received: true });
    }

    const transaction = transactions[0];

    // Evento de pagamento confirmado
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      // Atualiza status da transação
      await base44.asServiceRole.entities.Transaction.update(transaction.id, { status: 'confirmed' });

      // Atualiza saldo da carteira
      const wallets = await base44.asServiceRole.entities.Wallet.filter({ user_id: transaction.user_id });

      if (wallets.length > 0) {
        const wallet = wallets[0];
        await base44.asServiceRole.entities.Wallet.update(wallet.id, {
          balance: (wallet.balance || 0) + transaction.amount,
          total_deposited: (wallet.total_deposited || 0) + transaction.amount
        });
      } else {
        // Cria carteira se não existir
        await base44.asServiceRole.entities.Wallet.create({
          user_id: transaction.user_id,
          balance: transaction.amount,
          total_deposited: transaction.amount,
          total_withdrawn: 0
        });
      }
    }

    if (event === 'PAYMENT_OVERDUE' || event === 'PAYMENT_DELETED') {
      await base44.asServiceRole.entities.Transaction.update(transaction.id, { status: 'cancelled' });
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});