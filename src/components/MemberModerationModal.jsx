import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Trash2, Search, AlertTriangle, Users, TrendingUp, Crown, ChevronDown, ChevronUp } from 'lucide-react';
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

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RoomMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['moderation-members', roomId]);
      queryClient.invalidateQueries(['members', roomId]);
      toast.success('Membro atualizado com sucesso');
    },
    onError: () => toast.error('Erro ao atualizar membro')
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) => base44.entities.RoomMember.delete(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries(['moderation-members', roomId]);
      queryClient.invalidateQueries(['members', roomId]);
      toast.success('Membro removido com sucesso');
      setSelectedMember(null);
    },
    onError: () => toast.error('Erro ao remover membro')
  });

  const getMemberStats = (memberId) => {
    const memberBets = bets.filter(b => (b.data || b).user_id === memberId);
    const totalVolume = memberBets.reduce((sum, bet) => sum + ((bet.data || bet).amount || 0), 0);
    const wonBets = memberBets.filter(b => (b.data || b).status === 'won').length;
    const lostBets = memberBets.filter(b => (b.data || b).status === 'lost').length;
    const winRate = (wonBets + lostBets) > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0;
    return { totalBets: memberBets.length, totalVolume, wonBets, lostBets, winRate };
  };

  const handlePromote = (member) => {
    const memberData = member.data || member;
    const isAlreadyMod = memberData.role === 'manager';
    const action = isAlreadyMod ? 'rebaixar este moderador a membro' : 'promover este membro a moderador';
    if (confirm(`Tem certeza que deseja ${action}?`)) {
      updateMemberMutation.mutate({ id: member.id, data: { role: isAlreadyMod ? 'member' : 'manager' } });
    }
  };

  const handleRemove = (member) => {
    const memberData = member.data || member;
    if (confirm(`Tem certeza que deseja remover ${memberData.username} da sala?`)) {
      removeMemberMutation.mutate(member.id);
    }
  };

  const filteredMembers = members.filter(m => {
    const d = m.data || m;
    return (d.username || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const managers = filteredMembers.filter(m => (m.data || m).role === 'manager');
  const regularMembers = filteredMembers.filter(m => (m.data || m).role !== 'manager');

  const MemberCard = ({ member }) => {
    const d = member.data || member;
    const stats = getMemberStats(member.id);
    const isExpanded = selectedMember === member.id;
    const isMod = d.role === 'manager';

    return (
      <Card className={`transition-colors ${isMod ? 'border-[#D4AF37]/40' : 'hover:border-zinc-400'}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-bold">{d.username || 'Usuário'}</span>
                {isMod && <Badge className="bg-[#D4AF37] text-black text-xs">Moderador</Badge>}
                {stats.totalBets === 0 && <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">Inativo</Badge>}
              </div>
              <p className="text-xs text-zinc-500">Desde {new Date(member.created_date).toLocaleDateString('pt-BR')}</p>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div><p className="text-zinc-400">Apostas</p><p className="font-bold">{stats.totalBets}</p></div>
                <div><p className="text-zinc-400">Volume</p><p className="font-bold text-green-500">R$ {stats.totalVolume.toFixed(0)}</p></div>
                <div><p className="text-zinc-400">Acerto</p><p className="font-bold text-blue-500">{stats.winRate.toFixed(0)}%</p></div>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setSelectedMember(isExpanded ? null : member.id)} className="text-xs h-7">
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePromote(member)}
                className={`text-xs h-7 ${isMod ? 'border-orange-400 text-orange-500 hover:bg-orange-50' : 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}
                title={isMod ? 'Remover moderador' : 'Promover a moderador'}
              >
                <Crown className="h-3 w-3" />
              </Button>
              {!isMod && (
                <Button variant="destructive" size="sm" onClick={() => handleRemove(member)} className="h-7" disabled={removeMemberMutation.isPending}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-3 border-t space-y-2">
              <p className="font-semibold text-sm">Últimas apostas</p>
              {bets.filter(b => (b.data || b).user_id === member.id).slice(0, 5).map(bet => {
                const betData = bet.data || bet;
                return (
                  <div key={bet.id} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 rounded text-xs">
                    <div>
                      <p className="font-medium">{new Date(bet.created_date).toLocaleDateString('pt-BR')}</p>
                      <p className="text-zinc-500 uppercase">{betData.selected_option}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {betData.amount?.toFixed(2)}</p>
                      <Badge className={`text-xs ${betData.status === 'won' ? 'bg-green-100 text-green-800' : betData.status === 'lost' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {betData.status === 'won' ? 'Ganhou' : betData.status === 'lost' ? 'Perdeu' : 'Ativa'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {bets.filter(b => (b.data || b).user_id === member.id).length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-2">Nenhuma aposta</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#D4AF37]" />
            Moderação de Membros
          </DialogTitle>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Users className="h-4 w-4 text-blue-500" />, value: members.length, label: 'Total' },
            { icon: <Crown className="h-4 w-4 text-[#D4AF37]" />, value: managers.length, label: 'Moderadores' },
            { icon: <TrendingUp className="h-4 w-4 text-green-500" />, value: bets.length, label: 'Apostas' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  {s.icon}
                  <div>
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="text-xs text-zinc-500">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input placeholder="Buscar por nome..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="todos">
          <TabsList className="w-full">
            <TabsTrigger value="todos" className="flex-1">Todos ({filteredMembers.length})</TabsTrigger>
            <TabsTrigger value="moderadores" className="flex-1">Moderadores ({managers.length})</TabsTrigger>
            <TabsTrigger value="membros" className="flex-1">Membros ({regularMembers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="space-y-3 mt-4">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-zinc-500 py-8">Nenhum membro encontrado</p>
            ) : filteredMembers.map(m => <MemberCard key={m.id} member={m} />)}
          </TabsContent>

          <TabsContent value="moderadores" className="space-y-3 mt-4">
            {managers.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <Crown className="h-10 w-10 mx-auto mb-2 text-zinc-300" />
                <p>Nenhum moderador ainda.</p>
                <p className="text-sm mt-1">Promova membros usando o ícone 👑 em cada card.</p>
              </div>
            ) : managers.map(m => <MemberCard key={m.id} member={m} />)}
          </TabsContent>

          <TabsContent value="membros" className="space-y-3 mt-4">
            {regularMembers.length === 0 ? (
              <p className="text-center text-zinc-500 py-8">Nenhum membro encontrado</p>
            ) : regularMembers.map(m => <MemberCard key={m.id} member={m} />)}
          </TabsContent>
        </Tabs>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <div className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Moderadores têm acesso ao dashboard e podem gerenciar previsões. A remoção de membros é permanente.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}