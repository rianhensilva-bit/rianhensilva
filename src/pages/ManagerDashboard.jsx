import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Calendar, Crown, Edit, CheckCircle, XCircle, ArrowLeft, Settings, BookOpen, Sun, Moon, BarChart3, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RoomSettingsModal from '@/components/RoomSettingsModal';
import MembersListModal from '@/components/MembersListModal';
import ActivePredictionsModal from '@/components/ActivePredictionsModal';
import AllPredictionsModal from '@/components/AllPredictionsModal';
import UserManualModal from '@/components/UserManualModal';
import RoomAnalytics from '@/components/RoomAnalytics';
import MemberModerationModal from '@/components/MemberModerationModal';
import RealtimeNotifications from '@/components/RealtimeNotifications';
import { Toaster } from 'react-hot-toast';

export default function ManagerDashboard() {
  const queryClient = useQueryClient();
  const [darkMode, setDarkMode] = useState(true);
  const [showCreatePrediction, setShowCreatePrediction] = useState(false);
  const [editingPrediction, setEditingPrediction] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showActivePredictions, setShowActivePredictions] = useState(false);
  const [showAllPredictions, setShowAllPredictions] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const [newPrediction, setNewPrediction] = useState({
    title: '',
    description: '',
    category: '',
    bet_type: 'yes_no',
    end_date: '',
    rules: '',
    options: [],
    label_color: '#D4AF37'
  });

  const BORDER_COLORS = ['#D4AF37', '#DC2626', '#2563EB', '#9333EA', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#14B8A6', '#6366F1'];

  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

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
    mutationFn: (data) => {
      const predictionData = {
        ...data,
        room_id: roomId,
        status: 'active',
        total_volume: 0,
        chart_history: []
      };

      // Inicializar percentuais baseado no tipo
      if (data.bet_type === 'yes_no') {
        predictionData.yes_percentage = 50;
        predictionData.no_percentage = 50;
      } else if (data.bet_type === 'multiple_choice' && data.options) {
        // Distribuir percentuais igualmente e cores se não tiver
        const percentage = 100 / data.options.length;
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        predictionData.options = data.options.map((opt, idx) => ({
          ...opt,
          percentage: percentage,
          color: opt.color || colors[idx % colors.length]
        }));
      }

      return base44.entities.Prediction.create(predictionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['predictions', roomId]);
      setShowCreatePrediction(false);
      setNewPrediction({ title: '', description: '', category: '', bet_type: 'yes_no', end_date: '', rules: '', options: [], label_color: '#D4AF37' });
    }
  });

  const updatePredictionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Prediction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['predictions', roomId]);
      setEditingPrediction(null);
    }
  });

  const handleCreatePrediction = (e) => {
    e.preventDefault();
    createPredictionMutation.mutate(newPrediction);
  };

  const handleEditPrediction = (prediction) => {
    const predData = prediction.data || prediction;
    setEditingPrediction({
      id: prediction.id,
      end_date: predData.end_date || ''
    });
  };

  const handleUpdateEndDate = () => {
    if (editingPrediction) {
      updatePredictionMutation.mutate({
        id: editingPrediction.id,
        data: { end_date: editingPrediction.end_date }
      });
    }
  };

  const handleClosePrediction = (prediction) => {
    if (confirm('Tem certeza que deseja fechar esta previsão?')) {
      updatePredictionMutation.mutate({
        id: prediction.id,
        data: { status: 'closed' }
      });
    }
  };

  const handleResolvePrediction = (prediction) => {
    const predData = prediction.data || prediction;
    let result = null;

    if (predData.bet_type === 'yes_no') {
      const choice = confirm('A previsão se concretizou?\n\nOK = Sim\nCancelar = Não');
      result = choice ? 'yes' : 'no';
    } else if (predData.bet_type === 'multiple_choice') {
      const options = predData.options?.map(opt => opt.label).join('\n') || '';
      result = prompt(`Qual opção venceu?\n\n${options}\n\nDigite exatamente como mostrado acima:`);
      if (!result) return;
    }

    if (confirm(`Resolver previsão como "${result}"?`)) {
      updatePredictionMutation.mutate({
        id: prediction.id,
        data: { status: 'resolved', result }
      });
    }
  };

  const roomData = room?.data || room;

  return (
    <div className="min-h-screen bg-background">
      <RealtimeNotifications roomId={roomId} userType="manager" />
      <Toaster />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar para Home
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAnalytics(true)}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Análise
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowModeration(true)}
                className="gap-2"
              >
                <Shield className="h-4 w-4" />
                Moderação
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowManual(true)}
                className="gap-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
              >
                <BookOpen className="h-4 w-4" />
                Manual
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Crown className="h-10 w-10 text-[#D4AF37]" />
            <div>
              <h1 className="text-4xl font-bold elegant-font">
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
          <Card className="cursor-pointer hover:border-[#D4AF37] transition-all" onClick={() => setShowMembers(true)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Total de Membros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#D4AF37]">{roomData?.member_count || 0}</p>
              <p className="text-xs text-zinc-500 mt-1">Clique para ver lista</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-[#D4AF37] transition-all" onClick={() => setShowActivePredictions(true)}>
            <CardHeader>
              <CardTitle>Previsões Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {predictions.filter(p => (p.data || p).status === 'active').length}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Clique para ver detalhes</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-[#D4AF37] transition-all" onClick={() => setShowAllPredictions(true)}>
            <CardHeader>
              <CardTitle>Total de Previsões</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{predictions.length}</p>
              <p className="text-xs text-zinc-500 mt-1">Clique para ver todas</p>
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
                  const isEditing = editingPrediction?.id === prediction.id;
                  return (
                    <div key={prediction.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{predData.title}</h3>
                          <p className="text-sm text-zinc-500">{predData.category}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          predData.status === 'active' ? 'bg-green-100 text-green-800' : 
                          predData.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {predData.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-600 mb-3">
                        <span>Volume: R$ {predData.total_volume || 0}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {predData.end_date ? new Date(predData.end_date).toLocaleDateString('pt-BR') : 'Sem data'}
                        </span>
                      </div>
                      
                      {isEditing ? (
                        <div className="flex gap-2 items-center mt-3 pt-3 border-t">
                          <Input
                            type="date"
                            value={editingPrediction.end_date}
                            onChange={(e) => setEditingPrediction({ ...editingPrediction, end_date: e.target.value })}
                            className="flex-1"
                          />
                          <Button onClick={handleUpdateEndDate} size="sm" className="bg-green-600 hover:bg-green-700">
                            Salvar
                          </Button>
                          <Button onClick={() => setEditingPrediction(null)} size="sm" variant="outline">
                            Cancelar
                          </Button>
                        </div>
                      ) : predData.status === 'active' && (
                       <div className="flex gap-2 mt-3 pt-3 border-t">
                         <Button onClick={() => handleEditPrediction(prediction)} size="sm" variant="outline">
                           <Edit className="h-4 w-4 mr-1" />
                           Editar Data
                         </Button>
                         <Button onClick={() => handleClosePrediction(prediction)} size="sm" variant="outline">
                           <XCircle className="h-4 w-4 mr-1" />
                           Fechar
                         </Button>
                         <Button onClick={() => handleResolvePrediction(prediction)} size="sm" className="bg-green-600 hover:bg-green-700">
                           <CheckCircle className="h-4 w-4 mr-1" />
                           Resolver
                         </Button>
                       </div>
                      )}
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
                placeholder="Ex: Vai chover em São Paulo amanhã?"
                value={newPrediction.title}
                onChange={(e) => setNewPrediction({ ...newPrediction, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                placeholder="Adicione detalhes sobre a previsão..."
                value={newPrediction.description}
                onChange={(e) => setNewPrediction({ ...newPrediction, description: e.target.value })}
              />
            </div>

            <div>
              <Label>Tipo de Previsão *</Label>
              <Select
                value={newPrediction.bet_type}
                onValueChange={(value) => {
                  setNewPrediction({ 
                    ...newPrediction, 
                    bet_type: value,
                    options: value === 'multiple_choice' ? [{ label: '', percentage: 0 }, { label: '', percentage: 0 }] : undefined
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_no">Sim vs Não</SelectItem>
                  <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newPrediction.bet_type === 'multiple_choice' && (
              <div>
                <Label>Opções (mínimo 2) *</Label>
                <div className="space-y-2">
                  {newPrediction.options?.map((option, index) => {
                    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                    return (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={option.color || colors[index % colors.length]}
                          onChange={(e) => {
                            const newOptions = [...newPrediction.options];
                            newOptions[index] = { ...newOptions[index], color: e.target.value };
                            setNewPrediction({ ...newPrediction, options: newOptions });
                          }}
                          className="w-16 h-10"
                        />
                        <Input
                          placeholder={`Opção ${index + 1} (ex: Barcelona, Real Madrid)`}
                          value={option.label}
                          onChange={(e) => {
                            const newOptions = [...newPrediction.options];
                            newOptions[index] = { ...newOptions[index], label: e.target.value };
                            setNewPrediction({ ...newPrediction, options: newOptions });
                          }}
                          className="flex-1"
                        />
                      </div>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                      setNewPrediction({
                        ...newPrediction,
                        options: [...(newPrediction.options || []), { 
                          label: '', 
                          percentage: 0, 
                          color: colors[newPrediction.options.length % colors.length] 
                        }]
                      });
                    }}
                  >
                    + Adicionar Opção
                  </Button>
                </div>
              </div>
            )}

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

            <div>
              <Label>Cor da Borda do Card</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {BORDER_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewPrediction({ ...newPrediction, label_color: color })}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${newPrediction.label_color === color ? 'border-black dark:border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Regras e Critérios de Finalização</Label>
              <Textarea
                placeholder="Descreva os critérios que determinarão o resultado da aposta..."
                value={newPrediction.rules}
                onChange={(e) => setNewPrediction({ ...newPrediction, rules: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-zinc-500 mt-1">
                Exemplo: "A aposta será resolvida como SIM se o evento ocorrer até a data especificada, conforme confirmado por fontes oficiais."
              </p>
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

      <RoomSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} room={room} />
      <MembersListModal isOpen={showMembers} onClose={() => setShowMembers(false)} roomId={roomId} />
      <ActivePredictionsModal isOpen={showActivePredictions} onClose={() => setShowActivePredictions(false)} predictions={predictions} />
      <AllPredictionsModal isOpen={showAllPredictions} onClose={() => setShowAllPredictions(false)} predictions={predictions} />
      <UserManualModal isOpen={showManual} onClose={() => setShowManual(false)} />
      <RoomAnalytics isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} roomId={roomId} />
      <MemberModerationModal isOpen={showModeration} onClose={() => setShowModeration(false)} roomId={roomId} />
    </div>
  );
}