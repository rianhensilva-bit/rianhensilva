import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

    const wallets = await base44.entities.Wallet.filter({ user_id: user.id });
    let wallet = wallets[0];

    if (!wallet) {
      wallet = await base44.entities.Wallet.create({
        user_id: user.id,
        balance: 0,
        total_deposited: 0,
        total_withdrawn: 0
      });
    }

    const transactions = await base44.entities.Transaction.filter({ user_id: user.id });

    return Response.json({
      wallet: {
        balance: wallet.balance || 0,
        total_deposited: wallet.total_deposited || 0,
        total_withdrawn: wallet.total_withdrawn || 0
      },
      transactions: transactions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 20)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});