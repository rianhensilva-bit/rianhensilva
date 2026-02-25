import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Activity, Award } from 'lucide-react';

export default function RoomAnalytics({ isOpen, onClose, roomId }) {
  const { data: predictions = [] } = useQuery({
    queryKey: ['analytics-predictions', roomId],
    queryFn: () => base44.entities.Prediction.filter({ room_id: roomId }),
    enabled: !!roomId && isOpen
  });

  const { data: bets = [] } = useQuery({
    queryKey: ['analytics-bets', roomId],
    queryFn: () => base44.entities.Bet.filter({ room_id: roomId }),
    enabled: !!roomId && isOpen
  });

  const { data: members = [] } = useQuery({
    queryKey: ['analytics-members', roomId],
    queryFn: () => base44.entities.RoomMember.filter({ room_id: roomId }),
    enabled: !!roomId && isOpen
  });

  // Estatísticas gerais
  const totalVolume = bets.reduce((sum, bet) => sum + ((bet.data || bet).amount || 0), 0);
  const avgBetSize = bets.length > 0 ? totalVolume / bets.length : 0;
  const activePredictions = predictions.filter(p => (p.data || p).status === 'active').length;
  const resolvedPredictions = predictions.filter(p => (p.data || p).status === 'resolved').length;
  const totalMembers = members.length;

  // Volume por categoria
  const categoryData = predictions.reduce((acc, pred) => {
    const predData = pred.data || pred;
    const category = predData.category;
    const predBets = bets.filter(b => (b.data || b).prediction_id === pred.id);
    const volume = predBets.reduce((sum, bet) => sum + ((bet.data || bet).amount || 0), 0);
    
    if (!acc[category]) {
      acc[category] = { name: category, volume: 0, bets: 0 };
    }
    acc[category].volume += volume;
    acc[category].bets += predBets.length;
    return acc;
  }, {});

  const categoryChartData = Object.values(categoryData);

  // Atividade ao longo do tempo (últimos 7 dias)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const activityData = getLast7Days().map(date => {
    const dayBets = bets.filter(bet => {
      const betDate = new Date(bet.created_date).toISOString().split('T')[0];
      return betDate === date;
    });
    return {
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      apostas: dayBets.length,
      volume: dayBets.reduce((sum, bet) => sum + ((bet.data || bet).amount || 0), 0)
    };
  });

  // Status das previsões
  const statusData = [
    { name: 'Ativas', value: predictions.filter(p => (p.data || p).status === 'active').length, color: '#10b981' },
    { name: 'Fechadas', value: predictions.filter(p => (p.data || p).status === 'closed').length, color: '#6b7280' },
    { name: 'Resolvidas', value: predictions.filter(p => (p.data || p).status === 'resolved').length, color: '#3b82f6' },
    { name: 'Disputadas', value: predictions.filter(p => (p.data || p).status === 'disputed').length, color: '#ef4444' }
  ];

  // Top 5 membros mais ativos
  const memberActivity = members.map(member => {
    const memberData = member.data || member;
    const memberBets = bets.filter(b => (b.data || b).user_id === member.id);
    return {
      username: memberData.username || 'Anônimo',
      bets: memberBets.length,
      volume: memberBets.reduce((sum, bet) => sum + ((bet.data || bet).amount || 0), 0)
    };
  }).sort((a, b) => b.volume - a.volume).slice(0, 5);

  // Previsões mais populares (por número de apostas)
  const predictionPopularity = predictions.map(pred => {
    const predData = pred.data || pred;
    const predBets = bets.filter(b => (b.data || b).prediction_id === pred.id);
    return {
      title: predData.title,
      bets: predBets.length,
      volume: predBets.reduce((sum, bet) => sum + ((bet.data || bet).amount || 0), 0)
    };
  }).sort((a, b) => b.bets - a.bets).slice(0, 5);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-[#D4AF37]" />
            Análise Detalhada da Sala
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Volume Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-2xl font-bold">R$ {totalVolume.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Aposta Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-2xl font-bold">R$ {avgBetSize.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Total de Apostas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <span className="text-2xl font-bold">{bets.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Membros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="text-2xl font-bold">{totalMembers}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">Taxa Ativa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#D4AF37]" />
                  <span className="text-2xl font-bold">
                    {predictions.length > 0 ? ((activePredictions / predictions.length) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Atividade ao longo do tempo */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade (Últimos 7 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="apostas" stroke="#8b5cf6" name="Apostas" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#10b981" name="Volume (R$)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status das previsões */}
            <Card>
              <CardHeader>
                <CardTitle>Status das Previsões</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Volume por categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Volume por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="volume" fill="#D4AF37" name="Volume (R$)" />
                  <Bar dataKey="bets" fill="#3b82f6" name="Nº de Apostas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Rankings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top membros */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Membros Mais Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {memberActivity.length === 0 ? (
                    <p className="text-zinc-500 text-sm">Nenhuma atividade ainda</p>
                  ) : (
                    memberActivity.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#D4AF37]">#{index + 1}</span>
                          <div>
                            <p className="font-semibold">{member.username}</p>
                            <p className="text-xs text-zinc-500">{member.bets} apostas</p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600">R$ {member.volume.toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Previsões mais populares */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Previsões Mais Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictionPopularity.length === 0 ? (
                    <p className="text-zinc-500 text-sm">Nenhuma previsão ainda</p>
                  ) : (
                    predictionPopularity.map((pred, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="font-bold text-[#D4AF37]">#{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{pred.title}</p>
                            <p className="text-xs text-zinc-500">{pred.bets} apostas</p>
                          </div>
                        </div>
                        <span className="font-bold text-blue-600 ml-2">R$ {pred.volume.toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card className="bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border-[#D4AF37]">
            <CardHeader>
              <CardTitle>Insights e Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {activePredictions === 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#D4AF37]">•</span>
                    <span>Não há previsões ativas. Considere criar novas para manter a sala engajada.</span>
                  </li>
                )}
                {avgBetSize < 10 && bets.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#D4AF37]">•</span>
                    <span>A aposta média é baixa. Considere criar previsões mais atraentes.</span>
                  </li>
                )}
                {categoryChartData.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#D4AF37]">•</span>
                    <span>
                      A categoria mais popular é <strong>{categoryChartData.sort((a, b) => b.bets - a.bets)[0]?.name}</strong>. 
                      Considere criar mais previsões nesta categoria.
                    </span>
                  </li>
                )}
                {totalMembers > 0 && bets.length / totalMembers < 2 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#D4AF37]">•</span>
                    <span>A taxa de engajamento é baixa. Considere criar previsões mais relevantes ou divulgar a sala.</span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}