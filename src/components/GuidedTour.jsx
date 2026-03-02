import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft, Sparkles, Building2, TrendingUp, Bell } from 'lucide-react';

const TOUR_KEY = 'guanxi_tour_completed';

const STEPS = [
  {
    id: 'welcome',
    icon: <Sparkles className="h-8 w-8 text-[#D4AF37]" />,
    title: 'Bem-vindo ao GUANXI!',
    description: 'O mercado de previsões onde suas opiniões valem ouro. Vamos te mostrar como funciona em menos de 1 minuto.',
    target: null,
  },
  {
    id: 'rooms',
    icon: <Building2 className="h-8 w-8 text-blue-400" />,
    title: 'Salas de Comunidade',
    description: 'Explore salas temáticas criadas por gerentes verificados. Cada sala tem previsões sobre um tema específico — política, esportes, crypto e muito mais!',
    target: null,
  },
  {
    id: 'predictions',
    icon: <TrendingUp className="h-8 w-8 text-green-400" />,
    title: 'Participe de Previsões',
    description: 'Dentro de cada sala, você encontra previsões ativas. Aposte Sim ou Não, escolha uma opção e acompanhe os resultados em tempo real.',
    target: null,
  },
  {
    id: 'notifications',
    icon: <Bell className="h-8 w-8 text-orange-400" />,
    title: 'Notificações Inteligentes',
    description: 'Configure alertas para novas previsões, enceramentos e resultados. Clique no sino 🔔 no topo da tela a qualquer momento.',
    target: null,
  },
  {
    id: 'chat',
    icon: <Sparkles className="h-8 w-8 text-purple-400" />,
    title: 'Chat nas Salas',
    description: 'Converse com outros participantes diretamente dentro de cada sala! Troque análises, dicas e comemore resultados juntos.',
    target: null,
  },
];

export default function GuidedTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleClose = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm mx-4 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-1 bg-[#D4AF37] transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
              {current.icon}
            </div>
          </div>
          <h2 className="text-xl font-bold mb-3 elegant-font">{current.title}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Steps dots */}
        <div className="flex justify-center gap-2 pb-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-[#D4AF37] w-5' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          {step > 0 && (
            <Button variant="outline" onClick={handlePrev} className="flex-1 gap-1">
              <ArrowLeft className="h-4 w-4" /> Anterior
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold gap-1"
          >
            {step < STEPS.length - 1 ? (
              <>Próximo <ArrowRight className="h-4 w-4" /></>
            ) : (
              'Começar!'
            )}
          </Button>
        </div>

        {step === 0 && (
          <button
            onClick={handleClose}
            className="block text-center w-full text-xs text-zinc-400 hover:text-zinc-600 pb-4 -mt-2"
          >
            Pular tour
          </button>
        )}
      </div>
    </div>
  );
}