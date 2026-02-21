import React from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar } from 'lucide-react';

export default function PredictionCard({ prediction }) {
  return (
    <div
      className="rounded-2xl border-2 bg-background backdrop-blur p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
      style={{ width: '420px', minHeight: '220px' }}
    >
      {/* Tag */}
      <div className="mb-3">
        <span className="text-sm font-bold px-4 py-1.5 rounded-full bg-muted text-foreground">
          {prediction.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-xl leading-tight mb-4 line-clamp-2">
        {prediction.title}
      </h3>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-5 text-sm text-muted-foreground">
        {prediction.total_volume && (
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">{prediction.total_volume.toLocaleString()}</span>
          </div>
        )}
        {prediction.end_date && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(prediction.end_date).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>

      {/* Betting Options */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          className="h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm shadow-md"
        >
          <div className="flex flex-col items-center">
            <span>SIM</span>
            <span className="text-xs font-extrabold">{prediction.yes_percentage}%</span>
          </div>
        </Button>
        <Button
          className="h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-md"
        >
          <div className="flex flex-col items-center">
            <span>NÃO</span>
            <span className="text-xs font-extrabold">{prediction.no_percentage}%</span>
          </div>
        </Button>
      </div>
    </div>
  );
}