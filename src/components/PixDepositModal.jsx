import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { Copy, CheckCircle, QrCode } from 'lucide-react';

export default function PixDepositModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 5) return alert('Valor mínimo: R$ 5,00');
    setLoading(true);
    const res = await base44.functions.invoke('pixDeposit', { amount: parseFloat(amount) });
    setPixData(res.data);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pixData.pix_copy_paste);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleClose = () => {
    setPixData(null);
    setAmount('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <QrCode className="h-5 w-5 text-[#D4AF37]" />
            Depositar via Pix
          </DialogTitle>
        </DialogHeader>

        {!pixData ? (
          <div className="space-y-4">
            <div>
              <Label>Valor do Depósito (mín. R$ 5,00)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">R$</span>
                <Input
                  type="number"
                  min="5"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[10, 20, 50, 100].map(v => (
                <Button key={v} variant="outline" size="sm" onClick={() => setAmount(String(v))} className="flex-1">
                  R$ {v}
                </Button>
              ))}
            </div>
            <Button
              onClick={handleDeposit}
              disabled={loading || !amount}
              className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold"
            >
              {loading ? 'Gerando Pix...' : 'Gerar QR Code Pix'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-green-500 font-semibold">QR Code gerado! Pague em até 30 minutos.</p>
            <p className="text-2xl font-bold text-[#D4AF37]">R$ {pixData.amount}</p>

            {pixData.pix_qr_code && (
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${pixData.pix_qr_code}`}
                  alt="QR Code Pix"
                  className="w-48 h-48 border-2 border-zinc-200 rounded-lg"
                />
              </div>
            )}

            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-2">Pix Copia e Cola</p>
              <p className="text-xs font-mono break-all text-left">{pixData.pix_copy_paste}</p>
            </div>

            <Button onClick={handleCopy} className="w-full" variant="outline">
              {copied ? <><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Copiado!</> : <><Copy className="h-4 w-4 mr-2" /> Copiar código Pix</>}
            </Button>

            <p className="text-xs text-zinc-400">Seu saldo será atualizado automaticamente após a confirmação do pagamento.</p>

            <Button variant="ghost" onClick={handleClose} className="w-full">Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}