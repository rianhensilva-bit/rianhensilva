import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES } from '@/components/CategoryTabs';
import RoomPredictionCard from '@/components/RoomPredictionCard';

export default function ManagerRoomPreview({ roomId, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const { data: room } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => base44.entities.Room.get(roomId),
    enabled: !!roomId,
    staleTime: 60 * 1000,
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions', roomId],
    queryFn: () => base44.entities.Prediction.filter({ room_id: roomId, status: 'active' }),
    enabled: !!roomId,
    staleTime: 30 * 1000,
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

  return (
    <div className="min-h-screen bg-background">
      {/* Banner de aviso */}
      <div className="bg-[#D4AF37]/20 border-b border-[#D4AF37]/40 px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-semibold">Visão de Jogador — modo somente visualização</span>
        </div>
        <Button
          onClick={onBack}
          size="sm"
          className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à Dashboard
        </Button>
      </div>

      {/* Header fake igual ao RoomView */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" disabled className="gap-2 opacity-40">
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </Button>
            <h1 className="text-2xl font-black elegant-font" style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.4))' }}>GALORE</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-6 py-6 md:py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {roomData?.room_image && (
              <img src={roomData.room_image} alt={roomData.name} className="w-16 h-16 rounded-lg object-cover" />
            )}
            <div>
              <h2 className="text-3xl font-bold elegant-font">{roomData?.name}</h2>
              <p className="text-zinc-500">{roomData?.country_flag} {roomData?.secondary_label}</p>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {filteredPredictions.map((prediction) => (
              <RoomPredictionCard
                key={prediction.id}
                prediction={prediction}
                onBet={() => {}} // desabilitado na visão do gerente
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}