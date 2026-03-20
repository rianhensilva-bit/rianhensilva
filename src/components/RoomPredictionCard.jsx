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
      className="relative bg-background border-2 rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col"
      style={{ borderColor, minHeight: '220px', padding: '20px 24px' }}
    >
      {/* Header */}
      <div className="mb-4 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className="px-3 py-1 rounded-full text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: CATEGORY_COLORS[predData.category] || '#6B7280' }}
          >
            {predData.category || 'Geral'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 shrink-0">
            ATIVA
          </span>
        </div>

        <h3 className="font-bold text-lg leading-snug text-zinc-900 dark:text-zinc-50 line-clamp-3 mb-3">
          {predData.title}
        </h3>

        {predData.description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
            {predData.description}
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            R$ {predData.total_volume || 0}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {predData.end_date ? new Date(predData.end_date).toLocaleDateString('pt-BR') : '—'}
          </span>
        </div>
      </div>

      {/* Bet buttons */}
      <div className="mt-auto pt-3 border-t border-zinc-200 dark:border-zinc-700">
        {predData.bet_type === 'yes_no' ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onBet(prediction)}
              className="flex flex-col items-center justify-center py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors"
            >
              SIM
              <span className="text-xs font-normal opacity-90">{predData.yes_percentage || 50}%</span>
            </button>
            <button
              onClick={() => onBet(prediction)}
              className="flex flex-col items-center justify-center py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors"
            >
              NÃO
              <span className="text-xs font-normal opacity-90">{predData.no_percentage || 50}%</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {predData.options?.slice(0, 3).map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex-1 text-base font-bold text-zinc-900 dark:text-zinc-50 truncate">
                  {option.label}
                </span>
                <button
                  onClick={() => onBet(prediction)}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-white text-sm font-bold transition-opacity hover:opacity-80"
                  style={{ backgroundColor: option.color || borderColor }}
                >
                  {Math.round(option.percentage || 0)}%
                </button>
              </div>
            ))}
            {predData.options?.length > 3 && (
              <button
                onClick={() => onBet(prediction)}
                className="text-sm text-zinc-400 text-center pt-1 hover:text-zinc-600 transition-colors"
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