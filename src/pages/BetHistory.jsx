import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Moon, Sun } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BetHistory() {
  const [darkMode, setDarkMode] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Obter usuário atual (simulado - em produção viria do auth)
  const userId = 'current-user-id';

  const { data: bets = [], isLoading } = useQuery({
    queryKey: ['bets', userId, statusFilter],
    queryFn: async () => {
      const allBets = await base44.entities.Bet.filter({ user_id: userId });
      if (statusFilter === 'all') return allBets;
      return allBets.filter(bet => (bet.data || bet).status === statusFilter);
    }
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions-for-bets'],
    queryFn: () => base44.entities.Prediction.list()
  });

  const getPredictionTitle = (predictionId) => {
    const pred = predictions.find(p => p.id === predictionId);
    return pred ? (pred.data || pred).title : 'Carregando...';
  };

  const stats = {
    total: bets.length,
    active: bets.filter(b => (b.data || b).status === 'active').length,
    won: bets.filter(b => (b.data || b).status === 'won').length,
    lost: bets.filter(b => (b.data || b).status === 'lost').length,
    totalInvested: bets.reduce((sum, b) => sum + ((b.data || b).amount || 0), 0),
    totalProfit: bets.filter(b => (b.data || b).status === 'won').reduce((sum, b) => sum + ((b.data || b).result_amount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-background">
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
            <h1 className="text-2xl font-black elegant-font" style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.4))' }}>GUANXI</h1>
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
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-500">Total Apostas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-500">Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-500">Ganhas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.won}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-500">Perdidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{stats.lost}</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                Total Investido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">R$ {stats.totalInvested.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#D4AF37]">
                <DollarSign className="h-5 w-5" />
                Lucro Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">R$ {stats.totalProfit.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4 mb-6">
          <Filter className="h-5 w-5 text-zinc-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="won">Ganhas</SelectItem>
              <SelectItem value="lost">Perdidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Apostas */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-zinc-500">Carregando...</p>
            </CardContent>
          </Card>
        ) : bets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-zinc-500">Você ainda não fez nenhuma aposta.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bets.map((bet) => {
              const betData = bet.data || bet;
              return (
                <Card key={bet.id} className="hover:border-[#D4AF37] transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{getPredictionTitle(betData.prediction_id)}</h3>
                        <p className="text-sm text-zinc-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(bet.created_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        betData.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                        betData.status === 'won' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                        betData.status === 'lost' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {betData.status === 'active' ? 'ATIVA' : betData.status === 'won' ? 'GANHOU' : betData.status === 'lost' ? 'PERDEU' : 'REEMBOLSADA'}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <p className="text-zinc-500">Aposta</p>
                        <p className="font-bold text-lg">R$ {betData.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Opção</p>
                        <p className="font-bold uppercase">{betData.selected_option}</p>
                      </div>
                      {betData.status === 'won' && (
                        <div>
                          <p className="text-zinc-500">Ganho</p>
                          <p className="font-bold text-lg text-green-600 flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            R$ {betData.result_amount?.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {betData.status === 'lost' && (
                        <div>
                          <p className="text-zinc-500">Perda</p>
                          <p className="font-bold text-lg text-red-600 flex items-center gap-1">
                            <TrendingDown className="h-4 w-4" />
                            R$ {betData.amount.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {betData.status === 'active' && (
                        <div>
                          <p className="text-zinc-500">Potencial</p>
                          <p className="font-bold text-lg text-[#D4AF37]">R$ {betData.potential_profit?.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}