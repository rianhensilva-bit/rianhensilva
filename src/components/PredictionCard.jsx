import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, TrendingUp, Info } from 'lucide-react';
import BetModal from './BetModal';
import PredictionChart from './PredictionChart';
import CommentSection from './CommentSection';
import { CATEGORIES } from './CategoryTabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PredictionCard({ prediction, language, onTitleClick, userId }) {
  const categoryData = CATEGORIES.find(c => c.name === prediction.category);
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const handleBetClick = (option) => {
    setSelectedOption(option);
    setShowBetModal(true);
  };

  const translations = {
    pt: { yes: 'SIM', no: 'NÃO' },
    en: { yes: 'YES', no: 'NO' },
    es: { yes: 'SÍ', no: 'NO' },
    hi: { yes: 'हाँ', no: 'नहीं' },
    ar: { yes: 'نعم', no: 'لا' },
    zh: { yes: '是', no: '否' },
    fr: { yes: 'OUI', no: 'NON' },
    ru: { yes: 'ДА', no: 'НЕТ' },
    de: { yes: 'JA', no: 'NEIN' },
    ja: { yes: 'はい', no: 'いいえ' }
  };

  const t = translations[language] || translations.pt;

  return (
    <>
      <div
        className="backdrop-blur p-7 hover:shadow-2xl hover:-translate-y-1 transition-all"
        style={{ 
          width: '480px', 
          minHeight: '240px',
          borderRadius: '24px',
          border: '3px solid',
          borderImage: 'linear-gradient(135deg, #F59E0B, #FBBF24, #F59E0B) 1',
          background: 'var(--background)'
        }}
      >
        {/* Tag */}
        <div className="mb-4">
          <span 
            className="text-base font-bold px-5 py-2 rounded-full"
            style={{
              backgroundColor: categoryData ? `${categoryData.color}20` : 'var(--muted)',
              color: categoryData ? categoryData.color : 'var(--foreground)'
            }}
          >
            {prediction.category}
          </span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => setShowChart(true)}
          className="font-bold text-2xl leading-tight mb-5 line-clamp-2 text-zinc-900 dark:text-zinc-50 cursor-pointer hover:opacity-80 transition-opacity"
        >
          {prediction.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-5 mb-6 text-base text-zinc-600 dark:text-zinc-300 flex-wrap">
          {prediction.total_volume && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-5 w-5" />
              <span className="font-semibold">{prediction.total_volume.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-600">Hoje: R$ 0</span>
          </div>
          {prediction.end_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">{new Date(prediction.end_date).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRules(true)}
            className="ml-auto"
          >
            <Info className="h-4 w-4 mr-1" />
            Regras
          </Button>
        </div>

        {/* Betting Options */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleBetClick('yes')}
            className="h-14 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-md flex items-center justify-center gap-2"
          >
            <span>{t.yes}</span>
            <span className="font-extrabold">{prediction.yes_percentage}%</span>
          </Button>
          <Button
            onClick={() => handleBetClick('no')}
            className="h-14 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-lg shadow-md flex items-center justify-center gap-2"
          >
            <span>{t.no}</span>
            <span className="font-extrabold">{prediction.no_percentage}%</span>
          </Button>
        </div>

        {/* Comentários */}
        <div className="mt-4">
          <CommentSection predictionId={prediction.id} userId={userId || 'current-user-id'} />
        </div>
      </div>

      <BetModal 
        isOpen={showBetModal} 
        onClose={() => setShowBetModal(false)} 
        prediction={prediction}
        selectedOption={selectedOption}
        language={language}
      />

      <PredictionChart
        prediction={prediction}
        isOpen={showChart}
        onClose={() => setShowChart(false)}
      />

      {/* Modal de Regras */}
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regras da Aposta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">Critérios de Finalização:</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {prediction.rules || 'A aposta será finalizada quando os critérios estabelecidos pelo gerente forem atendidos ou na data de encerramento especificada.'}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Data de Finalização:</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {prediction.end_date 
                  ? new Date(prediction.end_date).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Data não especificada'}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Após o encerramento, os resultados serão verificados e as apostas vencedoras serão creditadas automaticamente.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}