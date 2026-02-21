import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar } from 'lucide-react';
import BetModal from './BetModal';
import { CATEGORIES } from './CategoryTabs';

export default function PredictionCard({ prediction, language }) {
  const categoryData = CATEGORIES.find(c => c.name === prediction.category);
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

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
        className="backdrop-blur p-7 hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden"
        style={{ 
          width: '480px', 
          minHeight: '240px',
          borderRadius: '24px',
          background: 'var(--background)',
          boxShadow: '0 0 0 3px transparent',
          backgroundImage: 'linear-gradient(var(--background), var(--background)), linear-gradient(135deg, #F59E0B, #FBBF24, #F59E0B)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          border: '3px solid transparent'
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
        <h3 className="font-bold text-xl leading-tight mb-5 line-clamp-2 text-zinc-900 dark:text-zinc-50">
          {prediction.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-5 mb-6 text-base text-zinc-600 dark:text-zinc-300">
          {prediction.total_volume && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-5 w-5" />
              <span className="font-semibold">{prediction.total_volume.toLocaleString()}</span>
            </div>
          )}
          {prediction.end_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">{new Date(prediction.end_date).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
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
      </div>

      <BetModal 
        isOpen={showBetModal} 
        onClose={() => setShowBetModal(false)} 
        prediction={prediction}
        selectedOption={selectedOption}
        language={language}
      />
    </>
  );
}