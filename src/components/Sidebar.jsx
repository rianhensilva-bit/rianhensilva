import React from 'react';
import { TrendingUp, Award, Clock, BarChart3 } from 'lucide-react';

const FILTERS = (t) => [
  { id: 'trending', label: t.trending, icon: TrendingUp },
  { id: 'most_bet', label: t.mostBet, icon: Award },
  { id: 'recent', label: t.recent, icon: Clock },
  { id: 'volume', label: t.volume, icon: BarChart3 }
];

export default function Sidebar({ selectedFilter, setSelectedFilter, predictions, language }) {
  
  const translations = {
    pt: { trending: 'Trending', mostBet: 'Mais Apostados', recent: 'Recém Criados', volume: 'Maiores Volumes', filters: 'FILTROS' },
    en: { trending: 'Trending', mostBet: 'Most Bet', recent: 'Recently Created', volume: 'Highest Volume', filters: 'FILTERS' },
    es: { trending: 'Tendencia', mostBet: 'Más Apostados', recent: 'Recién Creados', volume: 'Mayor Volumen', filters: 'FILTROS' },
    hi: { trending: 'ट्रेंडिंग', mostBet: 'सबसे अधिक', recent: 'नए बनाए', volume: 'उच्चतम मात्रा', filters: 'फ़िल्टर' },
    ar: { trending: 'رائج', mostBet: 'الأكثر رهانًا', recent: 'تم إنشاؤه مؤخرًا', volume: 'أعلى حجم', filters: 'مرشحات' },
    zh: { trending: '热门', mostBet: '最多投注', recent: '最近创建', volume: '最大交易量', filters: '筛选' },
    fr: { trending: 'Tendances', mostBet: 'Plus Pariés', recent: 'Récemment Créés', volume: 'Volume le Plus Élevé', filters: 'FILTRES' },
    ru: { trending: 'В тренде', mostBet: 'Самые ставки', recent: 'Недавно созданные', volume: 'Наибольший объем', filters: 'ФИЛЬТРЫ' },
    de: { trending: 'Trending', mostBet: 'Meist Gewettet', recent: 'Kürzlich Erstellt', volume: 'Höchstes Volumen', filters: 'FILTER' },
    ja: { trending: 'トレンド', mostBet: '最も賭けられた', recent: '最近作成された', volume: '最大ボリューム', filters: 'フィルター' }
  };

  const t = translations[language] || translations.pt;
  const getTopPredictionsForFilter = (filterId) => {
    let sorted = [...predictions];

    switch (filterId) {
      case 'trending':
        sorted.sort((a, b) => Math.abs(50 - a.yes_percentage) - Math.abs(50 - b.yes_percentage));
        break;
      case 'most_bet':
        sorted.sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0));
        break;
      case 'recent':
        sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case 'volume':
        sorted.sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0));
        break;
    }

    return sorted.slice(0, 3);
  };

  return (
    <aside className="py-6 space-y-6" style={{ width: '450px', position: 'sticky', top: '120px', marginLeft: '-8rem' }}>
      <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mb-8">{t.filters}</h2>
      {FILTERS(t).map((filter) => {
        const Icon = filter.icon;
        const topPredictions = getTopPredictionsForFilter(filter.id);

        return (
          <div key={filter.id} className="mb-6">
            <button
              onClick={() => setSelectedFilter(filter.id)}
              className={`
                w-full flex items-center gap-5 px-6 py-5 rounded-xl font-black text-2xl transition-all
                ${selectedFilter === filter.id 
                  ? 'bg-foreground text-background shadow-md' 
                  : 'hover:bg-muted text-zinc-900 dark:text-zinc-50 hover:text-foreground'
                }
              `}
            >

              <Icon className="h-9 w-9" />
              <span>{filter.label}</span>
            </button>
            
            {/* Top 3 predictions for this filter */}
            <div className="mt-5 space-y-4 pl-2">
              {topPredictions.map((pred, idx) => (
                <div 
                  key={pred.id} 
                  className="text-xl text-zinc-600 dark:text-zinc-300 hover:text-foreground transition-colors cursor-pointer p-4 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl font-bold mt-0.5" style={{ color: '#F59E0B' }}>{idx + 1}.</span>
                    <span className="line-clamp-2 leading-snug">{pred.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </aside>
  );
}