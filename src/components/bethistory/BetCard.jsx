import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Tag, BarChart2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_STYLE = {
  active: { label: 'ATIVA', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  won: { label: 'GANHOU', cls: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  lost: { label: 'PERDEU', cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  refunded: { label: 'REEMBOLSADA', cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' },
};

function OptionBadge({ option }) {
  const isYes = option === 'yes';
  const isNo = option === 'no';
  const color = isYes ? 'text-green-500' : isNo ? 'text-red-500' : 'text-[#D4AF37]';
  const label = isYes ? 'SIM' : isNo ? 'NÃO' : option?.toUpperCase();
  return <span className={`font-bold text-sm ${color}`}>{label}</span>;
}

export default function BetCard({ bet, prediction, room }) {
  const [expanded, setExpanded] = useState(false);
  const d = bet.data || bet;
  const p = prediction ? (prediction.data || prediction) : null;
  const r = room ? (room.data || room) : null;
  const status = STATUS_STYLE[d.status] || STATUS_STYLE.refunded;

  const netResult = d.status === 'won'
    ? (d.result_amount || 0) - (d.amount || 0)
    : d.status === 'lost' ? -(d.amount || 0) : null;

  const winRate = p && p.total_volume
    ? d.selected_option === 'yes'
      ? p.yes_percentage
      : d.selected_option === 'no'
      ? p.no_percentage
      : null
    : null;

  return (
    <Card className={`transition-all duration-200 hover:border-[#D4AF37]/60 ${d.status === 'won' ? 'border-l-2 border-l-green-500' : d.status === 'lost' ? 'border-l-2 border-l-red-500' : d.status === 'active' ? 'border-l-2 border-l-blue-500' : ''}`}>
      <CardContent className="p-4">
        {/* Row 1: Title + Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base leading-snug line-clamp-2">
              {p?.title || 'Previsão removida'}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {r && (
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  {r.country_flag} {r.name}
                </span>
              )}
              {p?.category && (
                <span className="text-xs bg-zinc-800 text-zinc-400 rounded px-1.5 py-0.5 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> {p.category}
                </span>
              )}
              {p?.end_date && (
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Encerra {format(new Date(p.end_date), 'dd/MM/yy', { locale: ptBR })}
                </span>
              )}
            </div>
          </div>
          <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${status.cls}`}>
            {status.label}
          </span>
        </div>

        {/* Row 2: Key numbers */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Apostado</p>
            <p className="font-bold">R$ {d.amount?.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Opção</p>
            <OptionBadge option={d.selected_option} />
          </div>
          {d.status === 'active' && d.potential_profit != null && (
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Potencial</p>
              <p className="font-bold text-[#D4AF37]">R$ {d.potential_profit?.toFixed(2)}</p>
            </div>
          )}
          {d.status === 'won' && (
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Resultado</p>
              <p className="font-bold text-green-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +R$ {netResult?.toFixed(2)}
              </p>
            </div>
          )}
          {d.status === 'lost' && (
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Resultado</p>
              <p className="font-bold text-red-500 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" /> -R$ {d.amount?.toFixed(2)}
              </p>
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-xs text-zinc-500 mb-0.5">Data</p>
            <p className="text-xs font-medium text-zinc-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(bet.created_date), 'dd/MM/yy', { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Expand toggle */}
        {p && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? 'Menos detalhes' : 'Mais detalhes'}
          </button>
        )}

        {/* Expanded section */}
        {expanded && p && (
          <div className="mt-3 pt-3 border-t border-zinc-800 space-y-3 text-sm">
            {p.description && (
              <p className="text-zinc-400 text-xs leading-relaxed">{p.description}</p>
            )}
            {/* Vote distribution */}
            {p.bet_type === 'yes_no' && p.yes_percentage != null && (
              <div>
                <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><BarChart2 className="h-3 w-3" /> Distribuição dos votos</p>
                <div className="flex rounded-full overflow-hidden h-2 w-full">
                  <div className="bg-green-500 transition-all" style={{ width: `${p.yes_percentage}%` }} />
                  <div className="bg-red-500 transition-all" style={{ width: `${p.no_percentage}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-green-500">SIM {p.yes_percentage?.toFixed(0)}%</span>
                  <span className="text-red-500">NÃO {p.no_percentage?.toFixed(0)}%</span>
                </div>
              </div>
            )}
            {p.bet_type === 'multiple_choice' && p.options?.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><BarChart2 className="h-3 w-3" /> Distribuição dos votos</p>
                {p.options.map((opt, i) => (
                  <div key={i} className="mb-1">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className={d.selected_option === opt.label ? 'text-[#D4AF37] font-bold' : 'text-zinc-400'}>{opt.label}</span>
                      <span className="text-zinc-500">{opt.percentage?.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${opt.percentage}%`, backgroundColor: opt.color || '#D4AF37' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {p.total_volume != null && (
              <p className="text-xs text-zinc-500">Volume total: <span className="text-zinc-300 font-medium">R$ {p.total_volume?.toFixed(2)}</span></p>
            )}
            {p.rules && (
              <details className="text-xs text-zinc-500">
                <summary className="cursor-pointer hover:text-zinc-300">Ver regras da previsão</summary>
                <p className="mt-1 leading-relaxed text-zinc-400">{p.rules}</p>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}