import React from 'react';
import { TrendingUp, Award, Clock, BarChart3 } from 'lucide-react';

const FILTERS = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'most_bet', label: 'Mais Apostados', icon: Award },
  { id: 'recent', label: 'Recém Criados', icon: Clock },
  { id: 'volume', label: 'Maiores Volumes', icon: BarChart3 }
];

export default function Sidebar({ selectedFilter, setSelectedFilter, predictions }) {
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
    <aside className="w-80 border-l bg-background/50 backdrop-blur p-6 space-y-4">
      <h2 className="text-sm font-bold text-muted-foreground mb-6 px-3">FILTROS</h2>
      {FILTERS.map((filter) => {
        const Icon = filter.icon;
        const topPredictions = getTopPredictionsForFilter(filter.id);
        
        return (
          <div key={filter.id} className="mb-6">
            <button
              onClick={() => setSelectedFilter(filter.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base transition-all
                ${selectedFilter === filter.id 
                  ? 'bg-foreground text-background shadow-md' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{filter.label}</span>
            </button>
            
            {/* Top 3 predictions for this filter */}
            <div className="mt-3 space-y-2 px-2">
              {topPredictions.map((pred, idx) => (
                <div 
                  key={pred.id} 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-2 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-amber-500 mt-0.5">{idx + 1}.</span>
                    <span className="line-clamp-2 leading-tight">{pred.title}</span>
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