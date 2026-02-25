import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import toast from 'react-hot-toast';
import { TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function RealtimeNotifications({ roomId, userType = 'player', userId }) {
  useEffect(() => {
    if (!roomId) return;

    // Verificar se o usuário está seguindo a sala (para players)
    const checkFollowing = async () => {
      if (userType === 'player' && userId) {
        const follows = await base44.entities.Follow.filter({ user_id: userId, room_id: roomId });
        return follows.length > 0;
      }
      return true; // Gerentes sempre recebem notificações
    };

    // Subscrever a mudanças em previsões
    const unsubscribe = base44.entities.Prediction.subscribe(async (event) => {
      const prediction = event.data;
      
      // Filtrar apenas previsões da sala atual
      if (prediction?.room_id !== roomId) return;

      // Para players, verificar se está seguindo a sala
      const isFollowing = await checkFollowing();
      if (!isFollowing) return;

      // Notificar baseado no tipo de evento
      if (event.type === 'create') {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-zinc-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <TrendingUp className="h-10 w-10 text-[#D4AF37]" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Nova Previsão Disponível!
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {prediction.title}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[#D4AF37] hover:text-[#B8941F]"
              >
                OK
              </button>
            </div>
          </div>
        ), {
          duration: 5000,
          position: 'top-right',
        });
      } else if (event.type === 'update') {
        const oldData = event.old_data || {};
        const newStatus = prediction.status;
        const oldStatus = oldData.status;

        // Notificar mudança de status
        if (newStatus !== oldStatus) {
          if (newStatus === 'closed') {
            toast.custom((t) => (
              <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-zinc-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <Clock className="h-10 w-10 text-orange-500" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Previsão Encerrada
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {prediction.title}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-orange-500"
                  >
                    OK
                  </button>
                </div>
              </div>
            ), {
              duration: 5000,
              position: 'top-right',
            });
          } else if (newStatus === 'resolved') {
            const resultIcon = prediction.result === 'yes' ? CheckCircle : XCircle;
            const resultColor = prediction.result === 'yes' ? 'text-green-500' : 'text-red-500';
            const ResultIcon = resultIcon;
            
            toast.custom((t) => (
              <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-zinc-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <ResultIcon className={`h-10 w-10 ${resultColor}`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Resultado Definido!
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {prediction.title}
                      </p>
                      <p className="mt-1 text-xs font-bold uppercase text-gray-900 dark:text-white">
                        Resultado: {prediction.result === 'yes' ? 'SIM' : prediction.result === 'no' ? 'NÃO' : prediction.result}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className={`w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium ${resultColor}`}
                  >
                    OK
                  </button>
                </div>
              </div>
            ), {
              duration: 7000,
              position: 'top-right',
            });
          }
        }
      }
    });

    // Cleanup ao desmontar
    return () => {
      unsubscribe();
    };
  }, [roomId, userType, userId]);

  return null; // Componente não renderiza nada visualmente
}