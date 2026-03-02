import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { TrendingUp, DollarSign, Users, Activity, Award, Zap, Target, ArrowUp, ArrowDown } from 'lucide-react';

const COLORS_PIE = ['#10b981', '#6b7280', '#3b82f6', '#ef4444'];

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

  const stats = useMemo(() => {
    const totalVolume = bets.reduce((sum, b) => sum + ((b.data || b).amount || 0), 0);
    const avgBetSize = bets.length > 0 ? totalVolume / bets.length : 0;
    const activePredictions = predictions.filter(p => (p.data || p).status === 'active').length;
    const resolvedPredictions = predictions.filter(p => (p.data || p).status === 'resolved').length;
    const uniqueBettors = new Set(bets.map(b => (b.data || b).user_id)).size;
    const engagementRate = members.length > 0 ? ((uniqueBettors / members.length) * 100).toFixed(0) : 0;
    const betsPerMember = members.length > 0 ? (bets.length / members.length).toFixed(1) : 0;
    return { totalVolume, avgBetSize, activePredictions, resolvedPredictions, uniqueBettors, engagementRate, betsPerMember };
  }, [bets, predictions, members]);

  // Volume por categoria
  const categoryData = useMemo(() => {
    const acc = {};
    predictions.forEach(pred => {
      const pd = pred.data || pred;
      const cat = pd.category || 'Outros';
      const predBets = bets.filter(b => (b.data || b).prediction_id === pred.id);
      const volume = predBets.reduce((sum, b) => sum + ((b.data || b).amount || 0), 0);
      if (!acc[cat]) acc[cat] = { name: cat, volume: 0, bets: 0 };
      acc[cat].volume += volume;
      acc[cat].bets += predBets.length;
    });
    return Object.values(acc).sort((a, b) => b.volume - a.volume);
  }, [predictions, bets]);

  // Atividade últimos 14 dias
  const activityData = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayBets = bets.filter(b => new Date(b.created_date).toISOString().split('T')[0] === dateStr);
      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        apostas: dayBets.length,
        volume: dayBets.reduce((sum, b) => sum + ((b.data || b).amount || 0), 0)
      };
    });
  }, [bets]);

  // Status das previsões
  const statusData = [
    { name: 'Ativas', value: predictions.filter(p => (p.data || p).status === 'active').length, color: '#10b981' },
    { name: 'Fechadas', value: predictions.filter(p => (p.data || p).status === 'closed').length, color: '#6b7280' },
    { name: 'Resolvidas', value: predictions.filter(p => (p.data || p).status === 'resolved').length, color: '#3b82f6' },
    { name: 'Disputadas', value: predictions.filter(p => (p.data || p).status === 'disputed').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Top membros
  const topMembers = useMemo(() => members.map(m => {
    const md = m.data || m;
    const memberBets = bets.filter(b => (b.data || b).user_id === m.id);
    return {
      username: md.username || 'Anônimo',
      bets: memberBets.length,
      volume: memberBets.reduce((sum, b) => sum + ((b.data || b).amount || 0), 0)
    };
  }).sort((a, b) => b.volume - a.volume).slice(0, 5), [members, bets]);

  // Top previsões
  const topPredictions = useMemo(() => predictions.map(pred => {
    const pd = pred.data || pred;
    const predBets = bets.filter(b => (b.data || b).prediction_id === pred.id);
    return {
      title: pd.title?.slice(0, 30) + (pd.title?.length > 30 ? '...' : ''),
      bets: predBets.length,
      volume: predBets.reduce((sum, b) => sum + ((b.data || b).amount || 0), 0),
      status: pd.status
    };
  }).sort((a, b) => b.bets - a.bets).slice(0, 5), [predictions, bets]);

  const kpis = [
    { label: 'Volume Total', value: `R$ ${stats.totalVolume.toFixed(0)}`, icon: <DollarSign className="h-4 w-4 text-green-500" />, color: 'text-green-500' },
    { label: 'Aposta Média', value: `R$ ${stats.avgBetSize.toFixed(0)}`, icon: <TrendingUp className="h-4 w-4 text-blue-500" />, color: 'text-blue-500' },
    { label: 'Total Apostas', value: bets.length, icon: <Activity className="h-4 w-4 text-purple-500" />, color: 'text-purple-500' },
    { label: 'Membros', value: members.length, icon: <Users className="h-4 w-4 text-orange-500" />, color: 'text-orange-500' },
    { label: 'Engajamento', value: `${stats.engagementRate}%`, icon: <Zap className="h-4 w-4 text-[#D4AF37]" />, color: 'text-[#D4AF37]' },
    { label: 'Apostas/Membro', value: stats.betsPerMember, icon: <Target className="h-4 w-4 text-red-500" />, color: 'text-red-500' },
    { label: 'Previsões Ativas', value: stats.activePredictions, icon: <Award className="h-4 w-4 text-emerald-500" />, color: 'text-emerald-500' },
    { label: 'Apostadores Únicos', value: stats.uniqueBettors, icon: <Users className="h-4 w-4 text-cyan-500" />, color: 'text-cyan-500' },
  ];

  // Insights automáticos
  const insights = [];
  if (stats.activePredictions === 0) insights.push({ type: 'warn', text: 'Nenhuma previsão ativa. Crie novas para manter o engajamento.' });
  if (Number(stats.engagementRate) < 30 && members.length > 0) insights.push({ type: 'warn', text: `Apenas ${stats.engagementRate}% dos membros apostaram. Promova a sala para aumentar o engajamento.` });
  if (categoryData.length > 0) insights.push({ type: 'tip', text: `Categoria mais popular: "${categoryData[0].name}" com R$ ${categoryData[0].volume.toFixed(0)} em volume.` });
  if (stats.avgBetSize > 50) insights.push({ type: 'good', text: `Aposta média alta (R$ ${stats.avgBetSize.toFixed(0)}), indica membros muito engajados!` });
  if (stats.resolvedPredictions > 0) insights.push({ type: 'good', text: `${stats.resolvedPredictions} previsões já resolvidas — mantenha esse ritmo de gestão!` });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-[#D4AF37]" />
            Métricas de Engajamento
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="atividade">Atividade</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {kpis.map(kpi => (
                <Card key={kpi.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">{kpi.icon}<p className="text-xs text-zinc-500">{kpi.label}</p></div>
                    <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Volume por Categoria</CardTitle></CardHeader>
                <CardContent>
                  {categoryData.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-8">Sem dados ainda</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={categoryData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v, n) => [n === 'volume' ? `R$ ${v}` : v, n === 'volume' ? 'Volume' : 'Apostas']} />
                        <Bar dataKey="volume" fill="#D4AF37" name="volume" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">Status das Previsões</CardTitle></CardHeader>
                <CardContent>
                  {statusData.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-8">Sem dados ainda</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false} dataKey="value">
                          {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <Card className="border-[#D4AF37]/30 bg-[#D4AF37]/5">
                <CardHeader><CardTitle className="text-sm">💡 Insights Automáticos</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span>{ins.type === 'good' ? '✅' : ins.type === 'warn' ? '⚠️' : '💡'}</span>
                        <span>{ins.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Atividade */}
          <TabsContent value="atividade" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Apostas nos Últimos 14 Dias</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="apostas" stroke="#8b5cf6" fill="#8b5cf620" name="Apostas" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="volume" stroke="#10b981" fill="#10b98120" name="Volume (R$)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Métricas de engajamento em detalhe */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Taxa de Engajamento', value: `${stats.engagementRate}%`, desc: 'membros que já apostaram', good: Number(stats.engagementRate) >= 50 },
                { label: 'Média Apostas/Membro', value: stats.betsPerMember, desc: 'apostas por membro', good: Number(stats.betsPerMember) >= 3 },
                { label: 'Apostadores Únicos', value: stats.uniqueBettors, desc: `de ${members.length} membros`, good: stats.uniqueBettors > 0 }
              ].map(m => (
                <Card key={m.label} className={m.good ? 'border-green-500/30' : 'border-orange-500/30'}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1 mb-1">
                      {m.good ? <ArrowUp className="h-3 w-3 text-green-500" /> : <ArrowDown className="h-3 w-3 text-orange-500" />}
                      <p className="text-xs text-zinc-500">{m.label}</p>
                    </div>
                    <p className={`text-3xl font-bold ${m.good ? 'text-green-500' : 'text-orange-500'}`}>{m.value}</p>
                    <p className="text-xs text-zinc-400 mt-1">{m.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Rankings */}
          <TabsContent value="rankings" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">🏆 Top 5 Membros Mais Ativos</CardTitle></CardHeader>
                <CardContent>
                  {topMembers.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-6">Sem atividade ainda</p>
                  ) : (
                    <div className="space-y-3">
                      {topMembers.map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`font-bold text-lg ${i === 0 ? 'text-[#D4AF37]' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-amber-600' : 'text-zinc-500'}`}>#{i + 1}</span>
                            <div>
                              <p className="font-semibold text-sm">{m.username}</p>
                              <p className="text-xs text-zinc-500">{m.bets} apostas</p>
                            </div>
                          </div>
                          <span className="font-bold text-green-500 text-sm">R$ {m.volume.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">🔥 Top 5 Previsões Mais Populares</CardTitle></CardHeader>
                <CardContent>
                  {topPredictions.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-6">Sem previsões ainda</p>
                  ) : (
                    <div className="space-y-3">
                      {topPredictions.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`font-bold text-sm shrink-0 ${i === 0 ? 'text-[#D4AF37]' : 'text-zinc-500'}`}>#{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs truncate">{p.title}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <p className="text-xs text-zinc-500">{p.bets} apostas</p>
                                <Badge className={`text-xs ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>{p.status}</Badge>
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-blue-500 text-xs shrink-0">R$ {p.volume.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}