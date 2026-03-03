import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

const CATEGORY_COLORS = {
  'Política': '#DC2626',
  'Esporte': '#2563EB',
  'Cultura': '#9333EA',
  'Crypto': '#F59E0B',
  'Clima': '#10B981',
  'Economia': '#059669',
  'Menções': '#EC4899',
  'Companhias': '#8B5CF6',
  'Finanças': '#14B8A6',
  'Tecnologia & Ciência': '#3B82F6',
};

const BORDER_COLORS = [
  '#D4AF37', '#DC2626', '#2563EB', '#9333EA',
  '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#14B8A6', '#6366F1'
];

export default function RoomPredictionCard({ prediction, onBet }) {
  const predData = prediction.data || prediction;
  const borderColor = predData.label_color || CATEGORY_COLORS[predData.category] || '#D4AF37';

  return (
    <div
      className="relative bg-background border-2 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col h-full"
      style={{ borderColor }}
    >
      {/* Header */}
      <div className="mb-3 flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: CATEGORY_COLORS[predData.category] || '#6B7280' }}
          >
            {predData.category || 'Geral'}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 shrink-0">
            ATIVA
          </span>
        </div>

        <h3 className="font-bold text-sm leading-snug text-zinc-900 dark:text-zinc-50 line-clamp-3 mb-2">
          {predData.title}
        </h3>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            R$ {predData.total_volume || 0}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {predData.end_date ? new Date(predData.end_date).toLocaleDateString('pt-BR') : '—'}
          </span>
        </div>
      </div>

      {/* Bet buttons */}
      <div className="mt-auto">
        {predData.bet_type === 'yes_no' ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onBet(prediction)}
              className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors"
            >
              SIM
              <span className="text-xs font-normal opacity-90">{predData.yes_percentage || 50}%</span>
            </button>
            <button
              onClick={() => onBet(prediction)}
              className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors"
            >
              NÃO
              <span className="text-xs font-normal opacity-90">{predData.no_percentage || 50}%</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {predData.options?.slice(0, 3).map((option, idx) => (
              <button
                key={idx}
                onClick={() => onBet(prediction)}
                className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                style={{ borderColor: option.color || borderColor }}
              >
                <span className="truncate">{option.label}</span>
                <span className="text-zinc-500 ml-2 shrink-0">{option.percentage || 0}%</span>
              </button>
            ))}
            {predData.options?.length > 3 && (
              <button
                onClick={() => onBet(prediction)}
                className="text-xs text-zinc-400 text-center pt-1 hover:text-zinc-600 transition-colors"
              >
                +{predData.options.length - 3} opções
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { BORDER_COLORS };