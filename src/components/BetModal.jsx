import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Smartphone, Copy, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const MANAGER_FEE_PCT = 7;
const POOL_PCT = 93;

export default function BetModal({ isOpen, onClose, prediction, selectedOption }) {
  const [amount, setAmount] = useState('');
  const [cpf, setCpf] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'pix'
  const [pixData, setPixData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!prediction) return null;

  const predData = prediction.data || prediction;

  // Calcula o percentual da opção escolhida
  const getOptionPercentage = () => {
    if (predData.bet_type === 'yes_no') {
      return selectedOption === 'yes' ? (predData.yes_percentage || 50) : (predData.no_percentage || 50);
    }
    const opt = predData.options?.find(o => o.label === selectedOption);
    return opt ? (opt.percentage || 50) : 50;
  };

  const optionPct = getOptionPercentage();
  const amountNum = parseFloat(amount) || 0;
  // Mesmo cálculo do backend:
  // Se ganhar, recebo minha parte proporcional de toda a pool (93% de TODOS apostadores)
  // multiplier = POOL_PCT/100 * (100 / optionPct)
  const multiplier = (POOL_PCT / 100) * (100 / optionPct);
  const potentialReturn = amountNum * multiplier;
  const potentialProfit = potentialReturn - amountNum;
  const poolAmount = amountNum * (POOL_PCT / 100);
  const managerFee = amountNum * (MANAGER_FEE_PCT / 100);

  const getOptionLabel = () => {
    if (predData.bet_type === 'yes_no') return selectedOption === 'yes' ? 'SIM' : 'NÃO';
    return selectedOption;
  };

  const getOptionColor = () => {
    if (predData.bet_type === 'yes_no') return selectedOption === 'yes' ? 'bg-green-500' : 'bg-red-500';
    const opt = predData.options?.find(o => o.label === selectedOption);
    return opt?.color ? '' : 'bg-blue-500';
  };

  const handleGeneratePix = async () => {
    if (!amountNum || amountNum < 1) {
      setError('Valor mínimo de R$ 1,00');
      return;
    }
    const cpfClean = cpf.replace(/\D/g, '');
    if (!cpfClean || cpfClean.length !== 11) {
      setError('CPF inválido. Digite os 11 dígitos.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('placeBet', {
        amount: amountNum,
        prediction_id: prediction.id,
        selected_option: selectedOption,
        cpf: cpfClean
      });
      setPixData(res.data);
      setStep('pix');
    } catch (err) {
      setError(err.message || 'Erro ao gerar QR Code. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (pixData?.pix_copy_paste) {
      navigator.clipboard.writeText(pixData.pix_copy_paste);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleClose = () => {
    setStep('form');
    setAmount('');
    setCpf('');
    setPixData(null);
    setError('');
    setCopied(false);
    onClose();
  };

  const handleBack = () => {
    setStep('form');
    setPixData(null);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            {step === 'pix' && (
              <button onClick={handleBack} className="absolute left-4 top-4 p-1 rounded hover:bg-muted">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            {step === 'form' ? 'Fazer Aposta' : 'Pagar com Pix'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-5 py-2">
            {/* Info da aposta */}
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Apostando em:</p>
              <h3 className="font-bold mb-2 text-sm leading-snug">{predData.title}</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-lg font-bold text-white text-sm ${getOptionColor()}`}
                  style={predData.bet_type !== 'yes_no' && predData.options?.find(o => o.label === selectedOption)?.color
                    ? { backgroundColor: predData.options.find(o => o.label === selectedOption).color }
                    : {}}
                >
                  {getOptionLabel()}
                </span>
                <span className="text-lg font-bold text-muted-foreground">{optionPct.toFixed(1)}%</span>
              </div>
            </div>

            {/* Valor */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Valor da Aposta (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  className="pl-10 h-12 text-lg"
                />
              </div>
              {error && <p className="text-destructive text-xs mt-1">{error}</p>}
            </div>

            {/* CPF */}
            <div>
              <label className="text-sm font-semibold mb-2 block">CPF do Pagador</label>
              <Input
                type="text"
                value={cpf}
                onChange={(e) => {
                  // Máscara CPF: 000.000.000-00
                  let v = e.target.value.replace(/\D/g, '').slice(0, 11);
                  v = v.replace(/(\d{3})(\d)/, '$1.$2');
                  v = v.replace(/(\d{3})(\d)/, '$1.$2');
                  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                  setCpf(v);
                  setError('');
                }}
                placeholder="000.000.000-00"
                className="h-12 text-lg tracking-wider"
                maxLength={14}
              />
            </div>

            {/* Lucro potencial */}
            {amountNum > 0 && (
              <div className="space-y-2">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400">
                      <TrendingUp className="h-4 w-4" />
                      Lucro Potencial
                    </span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      R$ {potentialProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Retorno total se ganhar</span>
                    <span className="font-medium">R$ {potentialReturn.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-3 text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Valor apostado</span>
                    <span>R$ {amountNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa do gerente ({MANAGER_FEE_PCT}%)</span>
                    <span>R$ {managerFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor na pool ({POOL_PCT}%)</span>
                    <span>R$ {poolAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground border-t border-border pt-1 mt-1">
                    <span>Multiplicador</span>
                    <span>{multiplier.toFixed(2)}x</span>
                  </div>
                </div>
              </div>
            )}

            {/* Botão gerar QR */}
            <Button
              onClick={handleGeneratePix}
              disabled={loading || !amountNum || amountNum < 1}
              className="w-full h-12 font-bold text-base gap-2 bg-[#D4AF37] hover:bg-[#B8941F] text-black"
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Gerando QR Code...</>
              ) : (
                <><Smartphone className="h-5 w-5" /> Gerar QR Code Pix</>
              )}
            </Button>
          </div>
        )}

        {step === 'pix' && pixData && (
          <div className="space-y-5 py-2">
            {/* Resumo */}
            <div className="bg-muted/40 rounded-xl p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Opção escolhida</span>
                <span className="font-bold">{getOptionLabel()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor apostado</span>
                <span className="font-bold">R$ {pixData.amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Lucro potencial</span>
                <span className="font-bold">R$ {pixData.potential_profit?.toFixed(2)}</span>
              </div>
            </div>

            {/* QR Code */}
            {pixData.pix_qr_code && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm font-semibold text-center text-muted-foreground">Escaneie o QR Code para pagar</p>
                <div className="border-4 border-[#D4AF37] rounded-2xl p-2 bg-white">
                  <img
                    src={`data:image/png;base64,${pixData.pix_qr_code}`}
                    alt="QR Code Pix"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">Expira em {pixData.expires_in}</p>
              </div>
            )}

            {/* Copia e cola */}
            {pixData.pix_copy_paste && (
              <div>
                <p className="text-sm font-semibold mb-2 text-center">Ou use o Pix copia e cola</p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={pixData.pix_copy_paste}
                    className="text-xs flex-1"
                  />
                  <Button onClick={handleCopy} variant="outline" size="icon" className="shrink-0">
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {copied && <p className="text-xs text-green-500 text-center mt-1">Copiado!</p>}
              </div>
            )}

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
              <p className="text-xs text-center text-muted-foreground">
                Após o pagamento, sua aposta será confirmada automaticamente. Aguarde a confirmação do banco.
              </p>
            </div>

            <Button onClick={handleClose} variant="outline" className="w-full">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}