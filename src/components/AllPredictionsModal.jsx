import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

export default function AllPredictionsModal({ isOpen, onClose, predictions }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Todas as Previsões</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {predictions.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">Nenhuma previsão criada ainda.</p>
          ) : (
            predictions.map((prediction) => {
              const predData = prediction.data || prediction;
              return (
                <div key={prediction.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{predData.title}</h3>
                      <p className="text-sm text-zinc-500">{predData.category}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      predData.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                      predData.status === 'resolved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                    }`}>
                      {predData.status === 'active' ? 'ATIVA' : predData.status === 'resolved' ? 'RESOLVIDA' : 'FECHADA'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Volume: R$ {predData.total_volume || 0}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {predData.end_date ? new Date(predData.end_date).toLocaleDateString('pt-BR') : 'Sem data'}
                    </span>
                    {predData.result && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-bold">
                          {predData.result === 'yes' ? (
                            <><CheckCircle className="h-4 w-4 text-green-600" /> Resultado: SIM</>
                          ) : (
                            <><XCircle className="h-4 w-4 text-red-600" /> Resultado: NÃO</>
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}