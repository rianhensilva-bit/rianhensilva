import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, TrendingUp, Moon, Sun, Search, Filter, Star, History } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BetModal from '@/components/BetModal';
import RealtimeNotifications from '@/components/RealtimeNotifications';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

export default function RoomView() {
  const queryClient = useQueryClient();
  const [darkMode, setDarkMode] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  const roomId = new URLSearchParams(window.location.search).get('roomId');
  const userId = 'current-user-id'; // Em produção, vem do auth

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
    queryFn: () => base44.entities.Prediction.filter({ room_id: roomId, status: 'active' }),
    enabled: !!roomId
  });

  const { data: isFollowing = false } = useQuery({
    queryKey: ['follow', roomId, userId],
    queryFn: async () => {
      const follows = await base44.entities.Follow.filter({ user_id: userId, room_id: roomId });
      return follows.length > 0;
    },
    enabled: !!roomId && !!userId
  });

  const followMutation = useMutation({
    mutationFn: () => base44.entities.Follow.create({ user_id: userId, room_id: roomId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['follow', roomId, userId]);
      toast.success('Sala seguida! Você receberá notificações.');
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const follows = await base44.entities.Follow.filter({ user_id: userId, room_id: roomId });
      if (follows[0]) {
        await base44.entities.Follow.delete(follows[0].id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['follow', roomId, userId]);
      toast.success('Sala deixada de seguir.');
    }
  });

  const roomData = room?.data || room;

  // Filtrar e ordenar previsões
  const filteredPredictions = predictions
    .filter(pred => {
      const predData = pred.data || pred;
      const matchesSearch = predData.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || predData.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aData = a.data || a;
      const bData = b.data || b;
      if (sortBy === 'date') {
        return new Date(b.created_date) - new Date(a.created_date);
      } else if (sortBy === 'volume') {
        return (bData.total_volume || 0) - (aData.total_volume || 0);
      }
      return 0;
    });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleBet = (prediction) => {
    setSelectedPrediction(prediction);
    setShowBetModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <RealtimeNotifications roomId={roomId} userType="player" userId={userId} />
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
              Voltar
            </Button>
            <h1 className="text-2xl font-bold elegant-font">{roomData?.name}</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = '/BetHistory'}
                className="rounded-full"
              >
                <History className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              {roomData?.room_image && (
                <img src={roomData.room_image} alt={roomData.name} className="w-16 h-16 rounded-lg object-cover" />
              )}
              <div>
                <h2 className="text-3xl font-bold elegant-font">{roomData?.name}</h2>
                <p className="text-zinc-500">{roomData?.country_flag} {roomData?.secondary_label}</p>
              </div>
            </div>
            <Button
              onClick={() => isFollowing ? unfollowMutation.mutate() : followMutation.mutate()}
              variant={isFollowing ? "default" : "outline"}
              className={isFollowing ? "bg-[#D4AF37] hover:bg-[#B8941F] text-black" : ""}
            >
              <Star className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
              {isFollowing ? 'Seguindo' : 'Seguir Sala'}
            </Button>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input
                placeholder="Buscar previsões..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="Política">Política</SelectItem>
                <SelectItem value="Esporte">Esporte</SelectItem>
                <SelectItem value="Cultura">Cultura</SelectItem>
                <SelectItem value="Crypto">Crypto</SelectItem>
                <SelectItem value="Economia">Economia</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Mais Recentes</SelectItem>
                <SelectItem value="volume">Maior Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4">Previsões Disponíveis ({filteredPredictions.length})</h3>

        {filteredPredictions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-zinc-500">
                {predictions.length === 0 ? 'Nenhuma previsão ativa no momento.' : 'Nenhuma previsão encontrada com esses filtros.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPredictions.map((prediction) => {
              const predData = prediction.data || prediction;
              return (
                <Card key={prediction.id} className="hover:border-[#D4AF37] transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{predData.title}</CardTitle>
                        <p className="text-sm text-zinc-500">{predData.description}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        ATIVA
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Volume: R$ {predData.total_volume || 0}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {predData.end_date ? new Date(predData.end_date).toLocaleDateString('pt-BR') : 'Sem data'}
                      </span>
                    </div>

                    {predData.bet_type === 'yes_no' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => handleBet(prediction)}
                          className="h-16 bg-green-600 hover:bg-green-700 text-white font-bold text-lg"
                        >
                          SIM
                          <span className="block text-sm font-normal">{predData.yes_percentage || 50}%</span>
                        </Button>
                        <Button
                          onClick={() => handleBet(prediction)}
                          className="h-16 bg-red-600 hover:bg-red-700 text-white font-bold text-lg"
                        >
                          NÃO
                          <span className="block text-sm font-normal">{predData.no_percentage || 50}%</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {predData.options?.map((option, idx) => (
                          <Button
                            key={idx}
                            onClick={() => handleBet(prediction)}
                            variant="outline"
                            className="w-full h-12 justify-between"
                          >
                            <span>{option.label}</span>
                            <span className="text-sm text-zinc-500">{option.percentage || 0}%</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BetModal
        isOpen={showBetModal}
        onClose={() => setShowBetModal(false)}
        prediction={selectedPrediction}
      />
    </div>
  );
}