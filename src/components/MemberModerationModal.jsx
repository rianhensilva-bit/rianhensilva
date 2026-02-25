import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Ban, Trash2, Search, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MemberModerationModal({ isOpen, onClose, roomId }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  const { data: members = [] } = useQuery({
    queryKey: ['moderation-members', roomId],
    queryFn: () => base44.entities.RoomMember.filter({ room_id: roomId }),
    enabled: !!roomId && isOpen
  });

  const { data: bets = [] } = useQuery({
    queryKey: ['moderation-bets', roomId],
    queryFn: () => base44.entities.Bet.filter({ room_id: roomId }),
    enabled: !!roomId && isOpen
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) => base44.entities.RoomMember.delete(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries(['moderation-members', roomId]);
      queryClient.invalidateQueries(['members', roomId]);
      toast.success('Membro removido com sucesso');
      setSelectedMember(null);
    },
    onError: () => {
      toast.error('Erro ao remover membro');
    }
  });

  const getMemberStats = (memberId) => {
    const memberBets = bets.filter(b => (b.data || b).user_id === memberId);
    const totalVolume = memberBets.reduce((sum, bet) => sum + ((bet.data || bet).amount || 0), 0);
    const wonBets = memberBets.filter(b => (b.data || b).status === 'won').length;
    const lostBets = memberBets.filter(b => (b.data || b).status === 'lost').length;
    const winRate = memberBets.length > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0;

    return {
      totalBets: memberBets.length,
      totalVolume,
      wonBets,
      lostBets,
      winRate: isNaN(winRate) ? 0 : winRate
    };
  };

  const filteredMembers = members.filter(member => {
    const memberData = member.data || member;
    const username = memberData.username || '';
    return username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleRemoveMember = (member) => {
    const memberData = member.data || member;
    if (confirm(`Tem certeza que deseja remover ${memberData.username} da sala?`)) {
      removeMemberMutation.mutate(member.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#D4AF37]" />
            Moderação de Membros
          </DialogTitle>
        </DialogHeader>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Buscar membro por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{members.length}</p>
                  <p className="text-xs text-zinc-500">Total de Membros</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{bets.length}</p>
                  <p className="text-xs text-zinc-500">Total de Apostas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {members.filter(m => {
                      const stats = getMemberStats(m.id);
                      return stats.totalBets === 0;
                    }).length}
                  </p>
                  <p className="text-xs text-zinc-500">Membros Inativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Membros */}
        <div className="space-y-3">
          {filteredMembers.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">Nenhum membro encontrado</p>
          ) : (
            filteredMembers.map(member => {
              const memberData = member.data || member;
              const stats = getMemberStats(member.id);
              const isExpanded = selectedMember === member.id;

              return (
                <Card key={member.id} className="hover:border-[#D4AF37] transition-colors">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Cabeçalho do membro */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">{memberData.username || 'Usuário'}</h3>
                            {memberData.role === 'manager' && (
                              <Badge variant="secondary" className="bg-[#D4AF37] text-black">
                                Gerente
                              </Badge>
                            )}
                            {stats.totalBets === 0 && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                Inativo
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-zinc-500">
                            Membro desde {new Date(member.created_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedMember(isExpanded ? null : member.id)}
                          >
                            {isExpanded ? 'Ocultar' : 'Ver'} Detalhes
                          </Button>
                          {memberData.role !== 'manager' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveMember(member)}
                              disabled={removeMemberMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Estatísticas rápidas */}
                      <div className="grid grid-cols-4 gap-4 py-3 border-t">
                        <div>
                          <p className="text-xs text-zinc-500">Total Apostado</p>
                          <p className="text-lg font-bold text-green-600">R$ {stats.totalVolume.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Apostas</p>
                          <p className="text-lg font-bold">{stats.totalBets}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Vitórias</p>
                          <p className="text-lg font-bold text-green-600">{stats.wonBets}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Taxa de Acerto</p>
                          <p className="text-lg font-bold text-blue-600">{stats.winRate.toFixed(0)}%</p>
                        </div>
                      </div>

                      {/* Detalhes expandidos */}
                      {isExpanded && (
                        <div className="space-y-3 pt-3 border-t">
                          <h4 className="font-semibold">Histórico de Apostas Recentes</h4>
                          {bets
                            .filter(b => (b.data || b).user_id === member.id)
                            .slice(0, 5)
                            .map(bet => {
                              const betData = bet.data || bet;
                              return (
                                <div key={bet.id} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 rounded">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">Previsão ID: {betData.prediction_id?.slice(0, 8)}...</p>
                                    <p className="text-xs text-zinc-500">
                                      {new Date(bet.created_date).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold">R$ {betData.amount?.toFixed(2)}</p>
                                    <Badge
                                      variant="secondary"
                                      className={`text-xs ${
                                        betData.status === 'won' ? 'bg-green-100 text-green-800' :
                                        betData.status === 'lost' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                      }`}
                                    >
                                      {betData.status || 'active'}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          {bets.filter(b => (b.data || b).user_id === member.id).length === 0 && (
                            <p className="text-sm text-zinc-500 text-center py-4">Nenhuma aposta realizada</p>
                          )}
                        </div>
                      )}

                      {/* Ações de moderação */}
                      {memberData.role !== 'manager' && (
                        <div className="flex gap-2 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => toast.info('Função de aviso em desenvolvimento')}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Enviar Aviso
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm(`Banir ${memberData.username} permanentemente?`)) {
                                toast.info('Função de banimento em desenvolvimento');
                              }
                            }}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Banir Membro
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Aviso */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-semibold mb-1">Atenção ao moderar</p>
              <p>
                A remoção de membros é permanente e não pode ser desfeita. Certifique-se de revisar o histórico antes de tomar ações.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}