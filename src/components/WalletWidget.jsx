import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import PixDepositModal from './PixDepositModal';
import PixWithdrawModal from './PixWithdrawModal';

export default function WalletWidget() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const fetchWallet = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('getWallet', {});
    setWallet(res.data?.wallet);
    setLoading(false);
  };

  useEffect(() => { fetchWallet(); }, []);

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-[#D4AF37]" />
          <span className="font-semibold text-sm">Minha Carteira</span>
        </div>
        <button onClick={fetchWallet} className="text-zinc-400 hover:text-white transition-colors">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-xs text-zinc-500">Saldo disponível</p>
        <p className="text-2xl font-bold text-[#D4AF37]">
          {loading ? '...' : `R$ ${(wallet?.balance || 0).toFixed(2)}`}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => setShowDeposit(true)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
        >
          <ArrowDownLeft className="h-3 w-3 mr-1" />
          Depositar
        </Button>
        <Button
          size="sm"
          onClick={() => setShowWithdraw(true)}
          variant="outline"
          className="flex-1 text-xs border-zinc-600"
        >
          <ArrowUpRight className="h-3 w-3 mr-1" />
          Sacar
        </Button>
      </div>

      <PixDepositModal
        isOpen={showDeposit}
        onClose={() => { setShowDeposit(false); fetchWallet(); }}
      />
      <PixWithdrawModal
        isOpen={showWithdraw}
        onClose={() => { setShowWithdraw(false); fetchWallet(); }}
        balance={wallet?.balance || 0}
      />
    </div>
  );
}