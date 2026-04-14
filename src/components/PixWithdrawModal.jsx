import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { ArrowUpRight, CheckCircle } from 'lucide-react';

export default function PixWithdrawModal({ isOpen, onClose, balance }) {
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) < 10) return alert('Valor mínimo: R$ 10,00');
    if (parseFloat(amount) > balance) return alert('Saldo insuficiente');
    if (!pixKey || !pixKeyType) return alert('Informe sua chave Pix');

    setLoading(true);
    const res = await base44.functions.invoke('pixWithdraw', {
      amount: parseFloat(amount),
      pix_key: pixKey,
      pix_key_type: pixKeyType
    });
    setLoading(false);

    if (res.data?.success) {
      setSuccess(true);
    } else {
      alert(res.data?.error || 'Erro ao processar saque');
    }
  };

  const handleClose = () => {
    setAmount('');
    setPixKey('');
    setPixKeyType('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-[#D4AF37]" />
            Sacar via Pix
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <p className="text-xl font-bold">Saque solicitado!</p>
            <p className="text-zinc-500 text-sm">O valor será transferido para sua chave Pix em instantes.</p>
            <Button onClick={handleClose} className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold">Fechar</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-center">
              <p className="text-sm text-zinc-500">Saldo disponível</p>
              <p className="text-2xl font-bold text-[#D4AF37]">R$ {(balance || 0).toFixed(2)}</p>
            </div>

            <div>
              <Label>Valor do Saque (mín. R$ 10,00)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">R$</span>
                <Input
                  type="number"
                  min="10"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Tipo de Chave Pix</Label>
              <Select value={pixKeyType} onValueChange={setPixKeyType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CPF">CPF</SelectItem>
                  <SelectItem value="CNPJ">CNPJ</SelectItem>
                  <SelectItem value="EMAIL">E-mail</SelectItem>
                  <SelectItem value="PHONE">Telefone</SelectItem>
                  <SelectItem value="EVP">Chave aleatória</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Chave Pix</Label>
              <Input
                placeholder="Digite sua chave Pix"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleWithdraw}
              disabled={loading || !amount || !pixKey || !pixKeyType}
              className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold"
            >
              {loading ? 'Processando...' : 'Solicitar Saque'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}