import React from 'react';
import { Filter, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const DATE_OPTIONS = [
  { value: 'all', label: 'Todo período' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 3 meses' },
];

const BET_TYPES = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'yes_no', label: 'Sim / Não' },
  { value: 'multiple_choice', label: 'Múltipla Escolha' },
];

export default function BetFilters({ filters, onChange, rooms }) {
  const hasActive = filters.status !== 'all' || filters.dateRange !== 'all' || filters.betType !== 'all' || filters.roomId !== 'all';

  const set = (key, value) => onChange({ ...filters, [key]: value });

  const reset = () => onChange({ status: 'all', dateRange: 'all', betType: 'all', roomId: 'all' });

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <div className="flex items-center gap-1 text-zinc-500 text-sm font-medium mr-1">
        <Filter className="h-4 w-4" />
        Filtros
      </div>

      <Select value={filters.status} onValueChange={(v) => set('status', v)}>
        <SelectTrigger className="h-8 text-xs w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos status</SelectItem>
          <SelectItem value="active">Ativas</SelectItem>
          <SelectItem value="won">Ganhas</SelectItem>
          <SelectItem value="lost">Perdidas</SelectItem>
          <SelectItem value="refunded">Reembolsadas</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.dateRange} onValueChange={(v) => set('dateRange', v)}>
        <SelectTrigger className="h-8 text-xs w-[150px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          {DATE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.betType} onValueChange={(v) => set('betType', v)}>
        <SelectTrigger className="h-8 text-xs w-[160px]">
          <SelectValue placeholder="Tipo de aposta" />
        </SelectTrigger>
        <SelectContent>
          {BET_TYPES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>

      {rooms.length > 0 && (
        <Select value={filters.roomId} onValueChange={(v) => set('roomId', v)}>
          <SelectTrigger className="h-8 text-xs w-[160px]">
            <SelectValue placeholder="Sala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as salas</SelectItem>
            {rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={reset} className="h-8 text-xs gap-1 text-zinc-400">
          <X className="h-3 w-3" /> Limpar
        </Button>
      )}
    </div>
  );
}