import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Camera, Edit2, Save, X, TrendingUp, TrendingDown, Star, Calendar, DollarSign, Users, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import WalletWidget from '@/components/WalletWidget';

const userId = 'current-user-id';

export default function UserProfile() {
  const queryClient = useQueryClient();
  const [darkMode, setDarkMode] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', bio: '', avatar_url: '' });
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    document.documentElement.classList.add('dark');
    // Carregar dados do perfil do localStorage
    const saved = localStorage.getItem('userProfile');
    if (saved) setProfileData(JSON.parse(saved));
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const { data: bets = [] } = useQuery({
    queryKey: ['bets', userId],
    queryFn: () => base44.entities.Bet.filter({ user_id: userId })
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['all-predictions'],
    queryFn: () => base44.entities.Prediction.list()
  });

  const { data: follows = [] } = useQuery({
    queryKey: ['follows', userId],
    queryFn: () => base44.entities.Follow.filter({ user_id: userId })
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => base44.entities.Room.list()
  });

  const followedRooms = rooms.filter(r => follows.some(f => (f.data || f).room_id === r.id));

  const stats = {
    total: bets.length,
    won: bets.filter(b => (b.data || b).status === 'won').length,
    lost: bets.filter(b => (b.data || b).status === 'lost').length,
    active: bets.filter(b => (b.data || b).status === 'active').length,
    invested: bets.reduce((sum, b) => sum + ((b.data || b).amount || 0), 0),
    profit: bets.filter(b => (b.data || b).status === 'won').reduce((sum, b) => sum + ((b.data || b).result_amount || 0), 0),
  };
  const winRate = stats.total > 0 ? Math.round((stats.won / (stats.won + stats.lost || 1)) * 100) : 0;

  const getPredictionTitle = (id) => {
    const p = predictions.find(p => p.id === id);
    return p ? (p.data || p).title : '...';
  };

  const handleSaveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setEditing(false);
    toast.success('Perfil atualizado!');
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProfileData(prev => ({ ...prev, avatar_url: file_url }));
    toast.success('Foto atualizada!');
  };

  const displayName = profileData.name || 'Usuário Anônimo';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="gap-2">
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold elegant-font">Meu Perfil</h1>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-amber-500/30 via-[#D4AF37]/20 to-amber-600/30" />
          <CardContent className="pt-0 pb-6 px-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-12">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-background overflow-hidden bg-amber-500 flex items-center justify-center">
                  {profileData.avatar_url ? (
                    <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white">{avatarLetter}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors"
                >
                  <Camera className="h-4 w-4 text-black" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>

              <div className="flex-1 mt-4 md:mt-0">
                {editing ? (
                  <div className="space-y-3">
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Seu nome"
                      className="text-lg font-bold max-w-xs"
                    />
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Escreva uma bio sobre você..."
                      className="max-w-md resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} size="sm" className="bg-[#D4AF37] hover:bg-amber-500 text-black font-bold gap-2">
                        <Save className="h-4 w-4" /> Salvar
                      </Button>
                      <Button onClick={() => setEditing(false)} size="sm" variant="outline" className="gap-2">
                        <X className="h-4 w-4" /> Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">{displayName}</h2>
                      <Button onClick={() => setEditing(true)} size="sm" variant="ghost" className="gap-1 text-zinc-400 hover:text-zinc-100">
                        <Edit2 className="h-4 w-4" /> Editar
                      </Button>
                    </div>
                    <p className="text-zinc-400 mt-1 max-w-md">
                      {profileData.bio || 'Adicione uma bio para se apresentar à comunidade.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats rápidos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#D4AF37]">{stats.total}</p>
                <p className="text-xs text-zinc-500 mt-1">Apostas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{winRate}%</p>
                <p className="text-xs text-zinc-500 mt-1">Taxa de acerto</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">R$ {stats.invested.toFixed(0)}</p>
                <p className="text-xs text-zinc-500 mt-1">Total investido</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  R$ {stats.profit.toFixed(0)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Lucro total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carteira Pix */}
        <div className="mb-8">
          <WalletWidget />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bets">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="bets" className="flex-1">Apostas ({stats.total})</TabsTrigger>
            <TabsTrigger value="rooms" className="flex-1">Salas Seguidas ({followedRooms.length})</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Configurações</TabsTrigger>
          </TabsList>

          {/* Apostas */}
          <TabsContent value="bets">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Ativas', value: stats.active, color: 'text-blue-500' },
                { label: 'Ganhas', value: stats.won, color: 'text-green-500' },
                { label: 'Perdidas', value: stats.lost, color: 'text-red-500' },
                { label: 'Lucro', value: `R$ ${stats.profit.toFixed(0)}`, color: stats.profit >= 0 ? 'text-green-500' : 'text-red-500' },
              ].map(s => (
                <Card key={s.label}>
                  <CardContent className="p-4 text-center">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {bets.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-zinc-500">Nenhuma aposta ainda.</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {bets.slice(0, 20).map(bet => {
                  const b = bet.data || bet;
                  return (
                    <Card key={bet.id} className="hover:border-[#D4AF37]/50 transition-all">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{getPredictionTitle(b.prediction_id)}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(bet.created_date).toLocaleDateString('pt-BR')}
                            <span className="uppercase font-bold text-amber-500">• {b.selected_option}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="font-bold">R$ {b.amount?.toFixed(2)}</p>
                            {b.status === 'won' && <p className="text-xs text-green-500">+R$ {b.result_amount?.toFixed(2)}</p>}
                            {b.status === 'lost' && <p className="text-xs text-red-500">-R$ {b.amount?.toFixed(2)}</p>}
                          </div>
                          <Badge className={
                            b.status === 'won' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                            b.status === 'lost' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                          }>
                            {b.status === 'won' ? 'GANHOU' : b.status === 'lost' ? 'PERDEU' : 'ATIVA'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {bets.length > 20 && (
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/BetHistory'}>
                    Ver histórico completo
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Salas Seguidas */}
          <TabsContent value="rooms">
            {followedRooms.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Star className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-500">Você ainda não segue nenhuma sala.</p>
                  <Button onClick={() => window.location.href = '/'} variant="outline" className="mt-4">
                    Explorar salas
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {followedRooms.map(room => {
                  const r = room.data || room;
                  return (
                    <Card key={room.id} className="hover:border-[#D4AF37]/50 transition-all cursor-pointer" onClick={() => window.location.href = `/RoomView?roomId=${room.id}`}>
                      <CardContent className="p-4 flex items-center gap-4">
                        {r.room_image ? (
                          <img src={r.room_image} alt={r.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                            <span className="text-2xl font-bold text-amber-500">{r.name?.charAt(0)}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{r.name}</p>
                          <p className="text-sm text-zinc-500">{r.country_flag} {r.secondary_label}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-zinc-400">
                            <Users className="h-3 w-3" />
                            {r.member_count || 0} membros
                          </div>
                        </div>
                        <Badge variant="outline" className="shrink-0">{r.primary_label}</Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informações da Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-500 mb-1 block">Nome de exibição</label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-500 mb-1 block">Bio</label>
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Fale sobre você..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <Button onClick={handleSaveProfile} className="bg-[#D4AF37] hover:bg-amber-500 text-black font-bold gap-2">
                    <Save className="h-4 w-4" /> Salvar alterações
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notificações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-zinc-500">
                  <p>Gerencie suas notificações nas configurações do cabeçalho (ícone 🔔).</p>
                  <Button variant="outline" onClick={() => window.location.href = '/'} size="sm">
                    Ir para configurações de notificações
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Atividade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-zinc-500">Apostas realizadas</span>
                      <span className="font-bold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-zinc-500">Salas seguidas</span>
                      <span className="font-bold">{followedRooms.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-zinc-500">Taxa de acerto</span>
                      <span className="font-bold text-green-500">{winRate}%</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-zinc-500">Total investido</span>
                      <span className="font-bold">R$ {stats.invested.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}