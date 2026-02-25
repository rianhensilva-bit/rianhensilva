import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, CreditCard, Smartphone, Building } from 'lucide-react';

export default function BetModal({ isOpen, onClose, prediction, selectedOption, language }) {
  const [amount, setAmount] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');

  if (!prediction) {
    return null;
  }

  const predictionData = prediction.data || prediction;

  const translations = {
    pt: { 
      title: 'Fazer Aposta', 
      betting: 'Apostando em',
      yes: 'SIM',
      no: 'NÃO',
      amount: 'Valor da Aposta',
      potential: 'Lucro Potencial',
      payment: 'Forma de Pagamento',
      card: 'Cartão de Crédito',
      pix: 'PIX',
      bank: 'Transferência Bancária',
      confirm: 'Confirmar Aposta',
      signup: 'Inscrever-se',
      needSignup: 'Você precisa se inscrever para fazer apostas'
    },
    en: { 
      title: 'Place Bet', 
      betting: 'Betting on',
      yes: 'YES',
      no: 'NO',
      amount: 'Bet Amount',
      potential: 'Potential Profit',
      payment: 'Payment Method',
      card: 'Credit Card',
      pix: 'PIX',
      bank: 'Bank Transfer',
      confirm: 'Confirm Bet',
      signup: 'Sign Up',
      needSignup: 'You need to sign up to place bets'
    },
    es: {
      title: 'Hacer Apuesta',
      betting: 'Apostando en',
      yes: 'SÍ',
      no: 'NO',
      amount: 'Monto de la Apuesta',
      potential: 'Ganancia Potencial',
      payment: 'Método de Pago',
      card: 'Tarjeta de Crédito',
      pix: 'PIX',
      bank: 'Transferencia Bancaria',
      confirm: 'Confirmar Apuesta',
      signup: 'Registrarse',
      needSignup: 'Necesitas registrarte para hacer apuestas'
    }
  };

  const t = translations[language] || translations.pt;

  const calculateProfit = () => {
    if (!amount || isNaN(amount)) return 0;
    const percentage = selectedOption === 'yes' ? predictionData.yes_percentage : predictionData.no_percentage;
    const multiplier = 100 / percentage;
    return (parseFloat(amount) * multiplier - parseFloat(amount)).toFixed(2);
  };

  const paymentMethods = [
    { id: 'card', label: t.card, icon: CreditCard },
    { id: 'pix', label: t.pix, icon: Smartphone },
    { id: 'bank', label: t.bank, icon: Building }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">{t.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Bet Info */}
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-2">{t.betting}:</p>
            <h3 className="font-bold text-lg mb-3">{predictionData.title}</h3>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-lg font-bold text-white ${selectedOption === 'yes' ? 'bg-green-500' : 'bg-red-500'}`}>
                {selectedOption === 'yes' ? t.yes : t.no}
              </span>
              <span className="text-2xl font-bold">
                {selectedOption === 'yes' ? predictionData.yes_percentage : predictionData.no_percentage}%
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-semibold mb-2 block">{t.amount}</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>

          {/* Potential Profit */}
          {amount && (
            <div className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  {t.potential}
                </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${calculateProfit()}
                </span>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div>
            <label className="text-sm font-semibold mb-3 block">{t.payment}</label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedPayment === method.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-border hover:border-amber-500/50'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-medium text-center">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Not Signed Up Notice */}
          <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-4">
            <p className="text-sm text-center text-muted-foreground mb-3">
              {t.needSignup}
            </p>
            <Button className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-700 text-black font-bold">
              {t.signup}
            </Button>
          </div>

          {/* Confirm Button */}
          <Button 
            disabled={!amount || !selectedPayment}
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-bold text-base"
          >
            {t.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}