import React from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryColors = {
  'Política': 'blue',
  'Esporte': 'orange',
  'Cultura': 'purple',
  'Crypto': 'amber',
  'Clima': 'cyan',
  'Economia': 'teal',
  'Menções': 'pink',
  'Companhias': 'indigo',
  'Finanças': 'red',
  'Tecnologia & Ciência': 'green'
};

const colorClasses = {
  blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
  cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
  teal: 'from-teal-500/20 to-teal-600/20 border-teal-500/30',
  pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
  indigo: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30',
  red: 'from-red-500/20 to-red-600/20 border-red-500/30',
  green: 'from-green-500/20 to-green-600/20 border-green-500/30'
};

export default function PredictionCard({ prediction }) {
  const color = categoryColors[prediction.category] || 'blue';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`
        rounded-2xl border-2 bg-gradient-to-br backdrop-blur p-6
        hover:shadow-xl transition-all
        ${colorClasses[color]}
      `}
      style={{ minHeight: '160px' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-background/80 text-muted-foreground">
            {prediction.category}
          </span>
          <h3 className="font-bold text-lg mt-2 leading-tight line-clamp-2">
            {prediction.title}
          </h3>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
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
          className="h-14 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-base shadow-md"
        >
          <div className="flex flex-col items-center">
            <span>SIM</span>
            <span className="text-sm font-extrabold">{prediction.yes_percentage}%</span>
          </div>
        </Button>
        <Button
          className="h-14 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-base shadow-md"
        >
          <div className="flex flex-col items-center">
            <span>NÃO</span>
            <span className="text-sm font-extrabold">{prediction.no_percentage}%</span>
          </div>
        </Button>
      </div>
    </motion.div>
  );
}