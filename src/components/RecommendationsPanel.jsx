import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Check, X, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { label: 'Pendente', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  accepted: { label: 'Aceita', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  rejected: { label: 'Recusada', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

function RecommendationItem({ rec }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState('');
  const queryClient = useQueryClient();
  const d = rec.data || rec;

  const { mutate, isPending } = useMutation({
    mutationFn: (status) => base44.entities.PredictionRecommendation.update(rec.id, { status, manager_note: note }),
    onSuccess: (_, status) => {
      toast.success(status === 'accepted' ? 'Recomendação aceita!' : 'Recomendação recusada.');
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      setExpanded(false);
    },
  });

  const status = STATUS_CONFIG[d.status] || STATUS_CONFIG.pending;

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm truncate">{d.title}</span>
            <Badge className={`text-xs ${status.className}`}>{status.label}</Badge>
            {d.category && <Badge variant="outline" className="text-xs">{d.category}</Badge>}
            {d.bet_type && (
              <Badge variant="outline" className="text-xs">
                {d.bet_type === 'yes_no' ? 'Sim/Não' : 'Múltipla'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            por <span className="font-medium text-zinc-400">{d.username}</span>
            {' · '}
            {rec.created_date ? formatDistanceToNow(new Date(rec.created_date), { addSuffix: true, locale: ptBR }) : ''}
          </p>
          {d.description && (
            <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{d.description}</p>
          )}
        </div>
        {d.status === 'pending' && (
          <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} className="shrink-0">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {d.manager_note && (
        <p className="text-xs text-zinc-500 mt-2 italic border-t border-border pt-2">
          Nota: {d.manager_note}
        </p>
      )}

      {expanded && d.status === 'pending' && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          <Textarea
            placeholder="Nota opcional para o membro..."
            value={note}
            onChange={e => setNote(e.target.value)}
            className="h-20 resize-none text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => mutate('accepted')}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 text-white gap-1"
            >
              <Check className="h-3 w-3" /> Aceitar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => mutate('rejected')}
              disabled={isPending}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 gap-1"
            >
              <X className="h-3 w-3" /> Recusar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecommendationsPanel({ roomId }) {
  const [filter, setFilter] = useState('pending');

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', roomId],
    queryFn: () => base44.entities.PredictionRecommendation.filter({ room_id: roomId }),
    enabled: !!roomId,
    refetchInterval: 30000,
  });

  const filtered = recommendations.filter(r => filter === 'all' || (r.data || r).status === filter);
  const pendingCount = recommendations.filter(r => (r.data || r).status === 'pending').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-[#D4AF37]" />
            Recomendações de Previsões
            {pendingCount > 0 && (
              <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 text-xs">{pendingCount} nova{pendingCount !== 1 ? 's' : ''}</Badge>
            )}
          </CardTitle>
          <div className="flex gap-1">
            {['pending', 'accepted', 'rejected', 'all'].map(s => (
              <Button
                key={s}
                size="sm"
                variant={filter === s ? 'default' : 'ghost'}
                onClick={() => setFilter(s)}
                className="text-xs h-7 px-2"
              >
                {s === 'pending' ? 'Pendentes' : s === 'accepted' ? 'Aceitas' : s === 'rejected' ? 'Recusadas' : 'Todas'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-zinc-500 text-center py-4">Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">Nenhuma recomendação {filter !== 'all' ? `com status "${STATUS_CONFIG[filter]?.label}"` : ''}.</p>
          </div>
        ) : (
          filtered.map(rec => <RecommendationItem key={rec.id} rec={rec} />)
        )}
      </CardContent>
    </Card>
  );
}