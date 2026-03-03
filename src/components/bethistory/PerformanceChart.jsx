import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function buildChartData(bets) {
  if (!bets.length) return [];

  const sorted = [...bets]
    .filter(b => (b.data || b).status !== 'active')
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  let cumulative = 0;
  return sorted.map((bet) => {
    const d = bet.data || bet;
    const result = d.status === 'won' ? (d.result_amount || 0) - (d.amount || 0) : -(d.amount || 0);
    cumulative += result;
    return {
      date: format(new Date(bet.created_date), 'dd/MM', { locale: ptBR }),
      resultado: parseFloat(result.toFixed(2)),
      acumulado: parseFloat(cumulative.toFixed(2)),
    };
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
          {p.name}: R$ {p.value?.toFixed(2)}
        </p>
      ))}
    </div>
  );
};

export default function PerformanceChart({ bets }) {
  const data = buildChartData(bets);

  if (data.length < 2) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-[#D4AF37]" />
            Desempenho ao Longo do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 text-zinc-500 text-sm">
          Dados insuficientes para exibir o gráfico (mín. 2 apostas encerradas).
        </CardContent>
      </Card>
    );
  }

  const maxAbs = Math.max(...data.map(d => Math.abs(d.acumulado)), 1);
  const isPositive = data[data.length - 1].acumulado >= 0;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-[#D4AF37]" />
          Desempenho Acumulado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradNeg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${v}`}
              domain={[-maxAbs * 1.2, maxAbs * 1.2]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="acumulado"
              name="Acumulado"
              stroke={isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth={2}
              fill={isPositive ? 'url(#gradPos)' : 'url(#gradNeg)'}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}