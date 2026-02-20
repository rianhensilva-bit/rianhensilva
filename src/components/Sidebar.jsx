import React from 'react';
import { TrendingUp, Award, Clock, BarChart3 } from 'lucide-react';

const FILTERS = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'most_bet', label: 'Mais Apostados', icon: Award },
  { id: 'recent', label: 'Recém Criados', icon: Clock },
  { id: 'volume', label: 'Maiores Volumes', icon: BarChart3 }
];

export default function Sidebar({ selectedFilter, setSelectedFilter }) {
  return (
    <aside className="w-64 border-r bg-background/50 backdrop-blur p-6 space-y-2">
      <h2 className="text-sm font-bold text-muted-foreground mb-4 px-3">FILTROS</h2>
      {FILTERS.map((filter) => {
        const Icon = filter.icon;
        return (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all
              ${selectedFilter === filter.id 
                ? 'bg-foreground text-background shadow-md' 
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <Icon className="h-5 w-5" />
            <span>{filter.label}</span>
          </button>
        );
      })}
    </aside>
  );
}