import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PredictionChart({ prediction, isOpen, onClose }) {
  if (!prediction) return null;

  const predData = prediction.data || prediction;

  // Gerar dados do gráfico (simulado - em produção viria do chart_history)
  const generateChartData = () => {
    const history = predData.chart_history || [];
    
    // Se não tiver histórico, gerar dados simulados
    if (history.length === 0) {
      const days = 7;
      const data = [];
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        if (predData.bet_type === 'yes_no') {
          data.push({
            date: format(date, 'dd/MM', { locale: ptBR }),
            Sim: predData.yes_percentage - Math.random() * 10 + i,
            Não: predData.no_percentage - Math.random() * 10 + (days - i)
          });
        } else {
          const entry = { date: format(date, 'dd/MM', { locale: ptBR }) };
          predData.options?.forEach(opt => {
            entry[opt.label] = opt.percentage - Math.random() * 10 + i;
          });
          data.push(entry);
        }
      }
      
      return data;
    }
    
    // Usar histórico real
    return history.map(h => {
      const entry = {
        date: format(new Date(h.timestamp), 'dd/MM', { locale: ptBR })
      };
      
      if (predData.bet_type === 'yes_no') {
        entry.Sim = h.yes_percentage;
        entry.Não = h.no_percentage;
      } else {
        h.options_percentages?.forEach((pct, idx) => {
          entry[predData.options[idx]?.label] = pct;
        });
      }
      
      return entry;
    });
  };

  const chartData = generateChartData();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{predData.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Volume Total</p>
              <p className="text-2xl font-bold">R$ {predData.total_volume?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Categoria</p>
              <p className="text-lg font-bold">{predData.category}</p>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Encerramento</p>
              <p className="text-lg font-bold">
                {predData.end_date ? new Date(predData.end_date).toLocaleDateString('pt-BR') : 'N/A'}
              </p>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-500">Status</p>
              <p className="text-lg font-bold uppercase">{predData.status}</p>
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border">
            <h3 className="text-lg font-bold mb-4">Evolução da Aposta</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                
                {predData.bet_type === 'yes_no' ? (
                  <>
                    <Line type="monotone" dataKey="Sim" stroke="#22c55e" strokeWidth={3} />
                    <Line type="monotone" dataKey="Não" stroke="#ef4444" strokeWidth={3} />
                  </>
                ) : (
                  predData.options?.map((opt, idx) => (
                    <Line 
                      key={idx} 
                      type="monotone" 
                      dataKey={opt.label} 
                      stroke={opt.color || `hsl(${idx * 60}, 70%, 50%)`} 
                      strokeWidth={3} 
                    />
                  ))
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Percentuais Atuais */}
          <div>
            <h3 className="text-lg font-bold mb-3">Percentuais Atuais</h3>
            {predData.bet_type === 'yes_no' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-green-500 rounded-lg p-4">
                  <p className="text-green-600 font-bold text-lg mb-1">SIM</p>
                  <p className="text-3xl font-bold">{predData.yes_percentage}%</p>
                </div>
                <div className="border-2 border-red-500 rounded-lg p-4">
                  <p className="text-red-600 font-bold text-lg mb-1">NÃO</p>
                  <p className="text-3xl font-bold">{predData.no_percentage}%</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-3">
                {predData.options?.map((opt, idx) => (
                  <div 
                    key={idx} 
                    className="border-2 rounded-lg p-4"
                    style={{ borderColor: opt.color || `hsl(${idx * 60}, 70%, 50%)` }}
                  >
                    <p className="font-bold text-sm mb-1" style={{ color: opt.color || `hsl(${idx * 60}, 70%, 50%)` }}>
                      {opt.label}
                    </p>
                    <p className="text-2xl font-bold">{opt.percentage}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}