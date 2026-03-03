import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Activity, Moon, Sun, Trophy } from 'lucide-react';
import { subDays } from 'date-fns';
import PerformanceChart from '@/components/bethistory/PerformanceChart';
import BetFilters from '@/components/bethistory/BetFilters';
import BetCard from '@/components/bethistory/BetCard';

const DEFAULT_FILTERS = { status: 'all', dateRange: 'all', betType: 'all', roomId: 'all' };

export default function BetHistory() {
  const [darkMode, setDarkMode] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  React.useEffect(() => { document.documentElement.classList.add('dark'); }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const userId = 'current-user-id';

  const { data: bets = [], isLoading } = useQuery({
    queryKey: ['bets', userId],
    queryFn: () => base44.entities.Bet.filter({ user_id: userId }),
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions-for-bets'],
    queryFn: () => base44.entities.Prediction.list(),
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms-for-bets'],
    queryFn: () => base44.entities.Room.list(),
  });

  const predMap = useMemo(() => Object.fromEntries(predictions.map(p => [p.id, p])), [predictions]);
  const roomMap = useMemo(() => Object.fromEntries(rooms.map(r => [r.id, r])), [rooms]);

  // Unique rooms that appear in user bets
  const betRooms = useMemo(() => {
    const ids = [...new Set(bets.map(b => (b.data || b).room_id).filter(Boolean))];
    return ids.map(id => roomMap[id]).filter(Boolean).map(r => ({ id: r.id, name: (r.data || r).name }));
  }, [bets, roomMap]);

  const filteredBets = useMemo(() => {
    const cutoff = filters.dateRange !== 'all'
      ? subDays(new Date(), parseInt(filters.dateRange))
      : null;

    return bets.filter((bet) => {
      const d = bet.data || bet;
      const pred = predMap[d.prediction_id];
      const predData = pred ? (pred.data || pred) : null;

      if (filters.status !== 'all' && d.status !== filters.status) return false;
      if (cutoff && new Date(bet.created_date) < cutoff) return false;
      if (filters.roomId !== 'all' && d.room_id !== filters.roomId) return false;
      if (filters.betType !== 'all' && predData?.bet_type !== filters.betType) return false;
      return true;
    });
  }, [bets, filters, predMap]);

  const stats = useMemo(() => {
    const won = filteredBets.filter(b => (b.data || b).status === 'won');
    const lost = filteredBets.filter(b => (b.data || b).status === 'lost');
    const resolved = won.length + lost.length;
    const totalInvested = filteredBets.reduce((s, b) => s + ((b.data || b).amount || 0), 0);
    const totalReturn = won.reduce((s, b) => s + ((b.data || b).result_amount || 0), 0);
    const netProfit = totalReturn - lost.reduce((s, b) => s + ((b.data || b).amount || 0), 0);
    const winRate = resolved > 0 ? Math.round((won.length / resolved) * 100) : 0;
    return {
      total: filteredBets.length,
      active: filteredBets.filter(b => (b.data || b).status === 'active').length,
      won: won.length,
      lost: lost.length,
      totalInvested,
      netProfit,
      winRate,
    };
  }, [filteredBets]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => window.location.href = '/'} className="gap-2">
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </Button>
            <h1 className="text-2xl font-black elegant-font" style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.4))' }}>
              GUANXI
            </h1>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-6 max-w-5xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Histórico de Apostas</h2>
          <p className="text-zinc-500 text-sm mt-1">{bets.length} apostas no total</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-zinc-500 font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-zinc-500 font-medium">Taxa de Acerto</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-[#D4AF37]">{stats.winRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-zinc-500 font-medium">Ganhas / Perdidas</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold">
                <span className="text-green-500">{stats.won}</span>
                <span className="text-zinc-500 text-lg"> / </span>
                <span className="text-red-500">{stats.lost}</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-zinc-500 font-medium">Resultado Líquido</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className={`text-2xl font-bold flex items-center gap-1 ${stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.netProfit >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                R$ {Math.abs(stats.netProfit).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <PerformanceChart bets={bets} />

        {/* Filters */}
        <BetFilters filters={filters} onChange={setFilters} rooms={betRooms} />

        {/* Bet list */}
        {isLoading ? (
          <Card><CardContent className="py-12 text-center text-zinc-500">Carregando...</CardContent></Card>
        ) : filteredBets.length === 0 ? (
          <Card><CardContent className="py-16 text-center">
            <Trophy className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500">Nenhuma aposta encontrada com esses filtros.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filteredBets
              .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
              .map((bet) => {
                const d = bet.data || bet;
                return (
                  <BetCard
                    key={bet.id}
                    bet={bet}
                    prediction={predMap[d.prediction_id]}
                    room={roomMap[d.room_id]}
                  />
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}