import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Activity, Target, Moon, Sun, Trophy } from 'lucide-react';
import PerformanceChart from '@/components/bethistory/PerformanceChart';
import BetFilters from '@/components/bethistory/BetFilters';
import BetCard from '@/components/bethistory/BetCard';
import { subDays } from 'date-fns';

const userId = 'current-user-id';

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-xs text-zinc-500">{label}</p>
          <p className="text-xl font-bold leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BetHistory() {
  const [darkMode, setDarkMode] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', dateRange: 'all', betType: 'all', roomId: 'all' });

  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const { data: allBets = [], isLoading } = useQuery({
    queryKey: ['bets', userId],
    queryFn: () => base44.entities.Bet.filter({ user_id: userId }),
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions-all'],
    queryFn: () => base44.entities.Prediction.list(),
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms-all'],
    queryFn: () => base44.entities.Room.list(),
  });

  const predMap = useMemo(() => {
    const m = {};
    predictions.forEach(p => { m[p.id] = p; });
    return m;
  }, [predictions]);

  const roomMap = useMemo(() => {
    const m = {};
    rooms.forEach(r => { m[r.id] = r; });
    return m;
  }, [rooms]);

  // Rooms that appear in user bets (for filter dropdown)
  const bettedRooms = useMemo(() => {
    const ids = new Set(allBets.map(b => (b.data || b).room_id).filter(Boolean));
    return rooms.filter(r => ids.has(r.id)).map(r => ({ id: r.id, name: (r.data || r).name }));
  }, [allBets, rooms]);

  const filteredBets = useMemo(() => {
    const cutoff = filters.dateRange === '7d' ? subDays(new Date(), 7)
      : filters.dateRange === '30d' ? subDays(new Date(), 30)
      : filters.dateRange === '90d' ? subDays(new Date(), 90)
      : null;

    return allBets.filter(bet => {
      const d = bet.data || bet;
      const p = predMap[d.prediction_id];
      const pd = p ? (p.data || p) : null;

      if (filters.status !== 'all' && d.status !== filters.status) return false;
      if (cutoff && new Date(bet.created_date) < cutoff) return false;
      if (filters.betType !== 'all' && pd?.bet_type !== filters.betType) return false;
      if (filters.roomId !== 'all' && d.room_id !== filters.roomId) return false;
      return true;
    }).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [allBets, filters, predMap]);

  const stats = useMemo(() => {
    const won = allBets.filter(b => (b.data || b).status === 'won');
    const lost = allBets.filter(b => (b.data || b).status === 'lost');
    const resolved = won.length + lost.length;
    const totalInvested = allBets.reduce((s, b) => s + ((b.data || b).amount || 0), 0);
    const totalReturn = won.reduce((s, b) => s + ((b.data || b).result_amount || 0), 0);
    const netPnL = totalReturn - allBets.filter(b => (b.data || b).status !== 'active' && (b.data || b).status !== 'refunded').reduce((s, b) => s + ((b.data || b).amount || 0), 0);
    const winRate = resolved > 0 ? ((won.length / resolved) * 100).toFixed(0) : '—';
    return {
      total: allBets.length,
      active: allBets.filter(b => (b.data || b).status === 'active').length,
      won: won.length,
      lost: lost.length,
      totalInvested,
      netPnL,
      winRate,
    };
  }, [allBets]);

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
            <h1 className="text-2xl font-black elegant-font" style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.4))' }}>GUANXI</h1>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-6 max-w-5xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Histórico de Apostas</h2>
          <p className="text-zinc-500 text-sm">{allBets.length} aposta{allBets.length !== 1 ? 's' : ''} no total</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatCard label="Total" value={stats.total} color="bg-zinc-600" icon={Activity} />
          <StatCard label="Ativas" value={stats.active} color="bg-blue-600" icon={Target} />
          <StatCard label="Ganhas" value={stats.won} color="bg-green-600" icon={Trophy} />
          <StatCard label="Perdidas" value={stats.lost} color="bg-red-600" icon={TrendingDown} />
          <StatCard label="Taxa de Vitória" value={`${stats.winRate}%`} color="bg-[#D4AF37]" icon={TrendingUp} />
          <StatCard
            label="Lucro Líquido"
            value={`${stats.netPnL >= 0 ? '+' : ''}R$ ${stats.netPnL.toFixed(0)}`}
            color={stats.netPnL >= 0 ? 'bg-green-600' : 'bg-red-600'}
            icon={DollarSign}
          />
        </div>

        {/* Performance Chart */}
        <PerformanceChart bets={allBets} />

        {/* Filters */}
        <BetFilters filters={filters} onChange={setFilters} rooms={bettedRooms} />

        {/* Bet list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}><CardContent className="p-4 h-24 animate-pulse bg-zinc-800/30" /></Card>
            ))}
          </div>
        ) : filteredBets.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-zinc-500">Nenhuma aposta encontrada com esses filtros.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredBets.map(bet => {
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