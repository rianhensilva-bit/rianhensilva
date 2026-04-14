import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Copy, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function PixWalletModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('wallet'); // wallet | deposit | withdraw
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositResult, setDepositResult] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('CPF');
  const [copied, setCopied] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState(null);

  useEffect(() => {
    if (isOpen) fetchWallet();
  }, [isOpen]);

  const fetchWallet = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('getWallet', {});
    setWalletData(res.data);
    setLoading(false);
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 5) return alert('Valor mínimo: R$ 5,00');
    setLoading(true);
    const res = await base44.functions.invoke('pixDeposit', { amount });
    setDepositResult(res.data);
    setLoading(false);
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 10) return alert('Valor mínimo: R$ 10,00');
    if (!pixKey) return alert('Informe a chave Pix');
    setLoading(true);
    const res = await base44.functions.invoke('pixWithdraw', { amount, pix_key: pixKey, pix_key_type: pixKeyType });
    setWithdrawResult(res.data);
    if (res.data?.success) fetchWallet();
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusIcon = (status) => {
    if (status === 'confirmed') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'pending') return <Clock className="h-4 w-4 text-yellow-500" />;
    if (status === 'failed' || status === 'cancelled') return <XCircle className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-[#D4AF37]" />
            Carteira Pix
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
          {[
            { key: 'wallet', label: 'Extrato' },
            { key: 'deposit', label: 'Depositar' },
            { key: 'withdraw', label: 'Sacar' }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setDepositResult(null); setWithdrawResult(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${tab === t.key ? 'bg-white dark:bg-zinc-700 shadow text-[#D4AF37]' : 'text-zinc-500'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-6 text-zinc-500">Carregando...</div>}

        {/* Wallet Tab */}
        {!loading && tab === 'wallet' && walletData && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-xl p-6 text-center">
              <p className="text-sm text-zinc-500 mb-1">Saldo disponível</p>
              <p className="text-4xl font-bold text-[#D4AF37]">R$ {(walletData.wallet?.balance || 0).toFixed(2)}</p>
              <div className="flex justify-around mt-4 text-sm text-zinc-500">
                <div>
                  <p className="font-medium text-green-600">+ R$ {(walletData.wallet?.total_deposited || 0).toFixed(2)}</p>
                  <p>Depositado</p>
                </div>
                <div>
                  <p className="font-medium text-red-500">- R$ {(walletData.wallet?.total_withdrawn || 0).toFixed(2)}</p>
                  <p>Sacado</p>
                </div>
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2">Últimas transações</p>
              {walletData.transactions?.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-4">Nenhuma transação ainda.</p>
              )}
              <div className="space-y-2">
                {walletData.transactions?.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      {tx.type === 'deposit'
                        ? <ArrowDownCircle className="h-4 w-4 text-green-500" />
                        : <ArrowUpCircle className="h-4 w-4 text-red-500" />}
                      <div>
                        <p className="text-sm font-medium">{tx.description || (tx.type === 'deposit' ? 'Depósito' : 'Saque')}</p>
                        <p className="text-xs text-zinc-500">{new Date(tx.created_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusIcon(tx.status)}
                      <span className={`font-bold text-sm ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.type === 'deposit' ? '+' : '-'} R$ {(tx.amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Deposit Tab */}
        {!loading && tab === 'deposit' && (
          <div className="space-y-4">
            {!depositResult ? (
              <>
                <div>
                  <Label>Valor do depósito (mín. R$ 5,00)</Label>
                  <Input
                    type="number"
                    min="5"
                    step="0.01"
                    placeholder="Ex: 50.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleDeposit}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold"
                  disabled={loading}
                >
                  <ArrowDownCircle className="h-4 w-4 mr-2" />
                  Gerar QR Code Pix
                </Button>
              </>
            ) : (
              <div className="space-y-4 text-center">
                <p className="font-semibold text-green-600">QR Code gerado! Pague em até 30 minutos.</p>
                {depositResult.pix_qr_code && (
                  <img
                    src={`data:image/png;base64,${depositResult.pix_qr_code}`}
                    alt="QR Code Pix"
                    className="mx-auto w-48 h-48 border rounded-lg"
                  />
                )}
                <div>
                  <p className="text-sm text-zinc-500 mb-2">Copia e Cola:</p>
                  <div className="flex gap-2">
                    <Input value={depositResult.pix_copy_paste || ''} readOnly className="text-xs" />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(depositResult.pix_copy_paste)}
                    >
                      {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-zinc-500">Valor: <strong>R$ {depositResult.amount?.toFixed(2)}</strong></p>
                <p className="text-xs text-zinc-400">O saldo será creditado automaticamente após confirmação do pagamento.</p>
                <Button variant="outline" onClick={() => { setDepositResult(null); setDepositAmount(''); }}>
                  Novo Depósito
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Withdraw Tab */}
        {!loading && tab === 'withdraw' && (
          <div className="space-y-4">
            {!withdrawResult ? (
              <>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-sm text-zinc-500">Saldo disponível</p>
                  <p className="text-xl font-bold text-[#D4AF37]">R$ {(walletData?.wallet?.balance || 0).toFixed(2)}</p>
                </div>
                <div>
                  <Label>Valor do saque (mín. R$ 10,00)</Label>
                  <Input
                    type="number"
                    min="10"
                    step="0.01"
                    placeholder="Ex: 100.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Tipo de Chave Pix</Label>
                  <Select value={pixKeyType} onValueChange={setPixKeyType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP'].map(t => (
                        <SelectItem key={t} value={t}>{t === 'EVP' ? 'Chave Aleatória' : t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Chave Pix</Label>
                  <Input
                    placeholder={pixKeyType === 'CPF' ? '000.000.000-00' : pixKeyType === 'EMAIL' ? 'email@exemplo.com' : 'Sua chave Pix'}
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleWithdraw}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold"
                  disabled={loading}
                >
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Solicitar Saque
                </Button>
              </>
            ) : (
              <div className="text-center space-y-4">
                {withdrawResult.success ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <p className="font-bold text-green-600">Saque solicitado com sucesso!</p>
                    <p className="text-sm text-zinc-500">O valor será transferido em breve para sua chave Pix.</p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <p className="font-bold text-red-500">Erro ao processar saque</p>
                    <p className="text-sm text-zinc-500">{withdrawResult.error}</p>
                  </>
                )}
                <Button variant="outline" onClick={() => { setWithdrawResult(null); setWithdrawAmount(''); setPixKey(''); }}>
                  Voltar
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}