import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Calendar, Crown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ManagerDashboard() {
  const queryClient = useQueryClient();
  const [showCreatePrediction, setShowCreatePrediction] = useState(false);
  const [newPrediction, setNewPrediction] = useState({
    title: '',
    description: '',
    category: '',
    bet_type: 'yes_no',
    end_date: ''
  });

  // Pegar informações da sala (simulando - em produção viria da URL ou contexto)
  const roomId = new URLSearchParams(window.location.search).get('roomId');

  const { data: room } = useQuery({
    queryKey: ['room', roomId],
    queryFn: async () => {
      const rooms = await base44.entities.Room.list();
      return rooms.find(r => r.id === roomId);
    },
    enabled: !!roomId
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions', roomId],
    queryFn: () => base44.entities.Prediction.filter({ room_id: roomId }),
    enabled: !!roomId
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', roomId],
    queryFn: () => base44.entities.RoomMember.filter({ room_id: roomId }),
    enabled: !!roomId
  });

  const createPredictionMutation = useMutation({
    mutationFn: (data) => base44.entities.Prediction.create({
      ...data,
      room_id: roomId,
      status: 'active',
      yes_percentage: 50,
      no_percentage: 50,
      total_volume: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['predictions', roomId]);
      setShowCreatePrediction(false);
      setNewPrediction({ title: '', description: '', category: '', bet_type: 'yes_no', end_date: '' });
    }
  });

  const handleCreatePrediction = (e) => {
    e.preventDefault();
    createPredictionMutation.mutate(newPrediction);
  };

  const roomData = room?.data || room;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Crown className="h-10 w-10 text-[#D4AF37]" />
            <div>
              <h1 className="text-4xl font-bold elegant-font text-zinc-900 dark:text-zinc-50">
                Dashboard do Gerente
              </h1>
              <p className="text-xl text-zinc-600 dark:text-zinc-400">
                {roomData?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Total de Membros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#D4AF37]">{roomData?.member_count || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Previsões Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {predictions.filter(p => p.data?.status === 'active').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total de Previsões</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{predictions.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="mb-8">
          <Button
            onClick={() => setShowCreatePrediction(true)}
            className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold"
          >
            <Plus className="mr-2 h-5 w-5" />
            Criar Nova Previsão
          </Button>
        </div>

        {/* Lista de Membros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Membros ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {members.length === 0 ? (
                <p className="text-zinc-500 dark:text-zinc-400">Nenhum membro registrado ainda.</p>
              ) : (
                members.map((member) => {
                  const memberData = member.data || member;
                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold">{memberData.username || 'Usuário'}</p>
                        <p className="text-sm text-zinc-500">{memberData.role || 'member'}</p>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {new Date(member.created_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Previsões */}
        <Card>
          <CardHeader>
            <CardTitle>Previsões da Sala</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.length === 0 ? (
                <p className="text-zinc-500 dark:text-zinc-400">Nenhuma previsão criada ainda.</p>
              ) : (
                predictions.map((prediction) => {
                  const predData = prediction.data || prediction;
                  return (
                    <div key={prediction.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{predData.title}</h3>
                          <p className="text-sm text-zinc-500">{predData.category}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          predData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {predData.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-600">
                        <span>Volume: R$ {predData.total_volume || 0}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {predData.end_date ? new Date(predData.end_date).toLocaleDateString('pt-BR') : 'Sem data'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Criar Previsão */}
      <Dialog open={showCreatePrediction} onOpenChange={setShowCreatePrediction}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Criar Nova Previsão</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePrediction} className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                required
                value={newPrediction.title}
                onChange={(e) => setNewPrediction({ ...newPrediction, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={newPrediction.description}
                onChange={(e) => setNewPrediction({ ...newPrediction, description: e.target.value })}
              />
            </div>

            <div>
              <Label>Categoria *</Label>
              <Select
                value={newPrediction.category}
                onValueChange={(value) => setNewPrediction({ ...newPrediction, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {['Política', 'Esporte', 'Cultura', 'Crypto', 'Clima', 'Economia', 'Menções', 'Companhias', 'Finanças', 'Tecnologia & Ciência'].map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data de Encerramento *</Label>
              <Input
                type="date"
                required
                value={newPrediction.end_date}
                onChange={(e) => setNewPrediction({ ...newPrediction, end_date: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreatePrediction(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold">
                Criar Previsão
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}