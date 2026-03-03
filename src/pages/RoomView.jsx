import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Moon, Sun, Search, History, Lightbulb } from 'lucide-react';
import RecommendPredictionModal from '@/components/RecommendPredictionModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BetModal from '@/components/BetModal';
import RealtimeNotifications from '@/components/RealtimeNotifications';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { CATEGORIES } from '@/components/CategoryTabs';
import RoomChat from '@/components/RoomChat';
import RoomPredictionCard from '@/components/RoomPredictionCard';

export default function RoomView() {
  const queryClient = useQueryClient();
  const [darkMode, setDarkMode] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  const [showRecommend, setShowRecommend] = useState(false);
  const roomId = new URLSearchParams(window.location.search).get('roomId');
  const userId = 'current-user-id';

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
      if (follows[0]) await base44.entities.Follow.delete(follows[0].id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['follow', roomId, userId]);
      toast.success('Sala deixada de seguir.');
    }
  });

  const roomData = room?.data || room;

  const filteredPredictions = useMemo(() => predictions
    .filter(pred => {
      const predData = pred.data || pred;
      const matchesSearch = predData.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || predData.category === categoryFilter;
      const matchesSubcategory = subcategoryFilter === 'all' || predData.subcategory === subcategoryFilter;
      return matchesSearch && matchesCategory && matchesSubcategory;
    })
    .sort((a, b) => {
      const aData = a.data || a;
      const bData = b.data || b;
      if (sortBy === 'date') return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'volume') return (bData.total_volume || 0) - (aData.total_volume || 0);
      return 0;
    }), [predictions, searchQuery, categoryFilter, subcategoryFilter, sortBy]);

  const selectedCategoryData = CATEGORIES.find(c => c.name === categoryFilter);
  const subcategories = selectedCategoryData?.subcategories || [];

  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

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
      
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => window.location.href = '/'} className="gap-2">
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </Button>
            <h1 className="text-2xl font-black elegant-font" style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.4))' }}>GUANXI</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => window.location.href = '/BetHistory'} className="rounded-full">
                <History className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full">
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-6 py-6 md:py-8 max-w-6xl">
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
              variant="outline"
              onClick={() => setShowRecommend(true)}
              className="gap-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
            >
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Recomendar Previsão</span>
              <span className="sm:hidden">Recomendar</span>
            </Button>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex gap-3 md:gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[150px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input
                placeholder="Buscar previsões..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setSubcategoryFilter('all'); }}>
              <SelectTrigger className="w-[140px] md:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categoryFilter !== 'all' && subcategories.length > 0 && (
              <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
                <SelectTrigger className="w-[140px] md:w-48">
                  <SelectValue placeholder="Subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Subcategorias</SelectItem>
                  {subcategories.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] md:w-48">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {filteredPredictions.map((prediction) => (
              <RoomPredictionCard key={prediction.id} prediction={prediction} onBet={handleBet} />
            ))}
          </div>
        )}
      </div>

      <BetModal isOpen={showBetModal} onClose={() => setShowBetModal(false)} prediction={selectedPrediction} />
      <RoomChat roomId={roomId} username="Visitante" userId={userId} />
    </div>
  );
}