import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import toast from 'react-hot-toast';
import { TrendingUp, CheckCircle, XCircle, Clock, Trophy, AtSign } from 'lucide-react';
import { getNotificationPrefs } from './NotificationSettingsModal';
import { addNotification } from './NotificationCenter';

function sendPushNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

function showToast(icon, title, body, color = 'text-[#D4AF37]') {
  toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-zinc-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-0.5">{icon}</div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{title}</p>
            {body && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{body}</p>}
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200 dark:border-gray-700">
        <button onClick={() => toast.dismiss(t.id)} className={`w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium ${color}`}>
          OK
        </button>
      </div>
    </div>
  ), { duration: 5000, position: 'top-right' });
}

export default function RealtimeNotifications({ roomId, userType = 'player', userId, username }) {
  useEffect(() => {
    if (!roomId) return;

    // Watch predictions
    const unsubPrediction = base44.entities.Prediction.subscribe(async (event) => {
      const prediction = event.data;
      if (prediction?.room_id !== roomId) return;

      const prefs = getNotificationPrefs();

      if (event.type === 'create' && prefs.new_predictions) {
        const title = 'Nova Previsão Disponível!';
        sendPushNotification(title, prediction.title);
        addNotification({ type: 'new_prediction', title, body: prediction.title });
        showToast(<TrendingUp className="h-10 w-10 text-[#D4AF37]" />, title, prediction.title);
      }

      if (event.type === 'update') {
        const newStatus = prediction.status;
        const oldStatus = (event.old_data || {}).status;
        if (newStatus === oldStatus) return;

        if (newStatus === 'closed' && prefs.closed_predictions) {
          const title = 'Previsão Encerrada';
          sendPushNotification(title, prediction.title);
          addNotification({ type: 'prediction_closed', title, body: prediction.title });
          showToast(<Clock className="h-10 w-10 text-orange-500" />, title, prediction.title, 'text-orange-500');
        }

        if (newStatus === 'resolved' && prefs.resolved_predictions) {
          const resultLabel = prediction.result === 'yes' ? 'SIM' : prediction.result === 'no' ? 'NÃO' : prediction.result;
          const title = 'Resultado Definido!';
          const body = `${prediction.title} → ${resultLabel}`;
          sendPushNotification(title, body);
          addNotification({ type: 'prediction_resolved', title, body });
          const Icon = prediction.result === 'yes' ? CheckCircle : XCircle;
          const color = prediction.result === 'yes' ? 'text-green-500' : 'text-red-500';
          showToast(<Icon className={`h-10 w-10 ${color}`} />, title, body, color);
        }
      }
    });

    // Watch bets (bet status changes for this user)
    const unsubBet = base44.entities.Bet.subscribe(async (event) => {
      if (event.type !== 'update') return;
      const bet = event.data;
      const oldBet = event.old_data || {};
      if (bet?.room_id !== roomId) return;
      if (userId && bet.user_id !== userId) return;

      const prefs = getNotificationPrefs();
      if (!prefs.bet_updates) return;

      if (bet.status !== oldBet.status) {
        if (bet.status === 'won') {
          const title = '🏆 Você ganhou!';
          const body = `Aposta de R$ ${bet.amount} resolvida com ganho de R$ ${bet.result_amount?.toFixed(2)}`;
          sendPushNotification(title, body);
          addNotification({ type: 'bet_won', title, body });
          showToast(<Trophy className="h-10 w-10 text-green-500" />, title, body, 'text-green-500');
        } else if (bet.status === 'lost') {
          const title = 'Aposta perdida';
          const body = `Sua aposta de R$ ${bet.amount} não foi vencedora.`;
          sendPushNotification(title, body);
          addNotification({ type: 'bet_lost', title, body });
          showToast(<XCircle className="h-10 w-10 text-red-500" />, title, body, 'text-red-500');
        }
      }
    });

    // Watch chat mentions
    const unsubChat = base44.entities.ChatMessage.subscribe((event) => {
      if (event.type !== 'create') return;
      const msg = event.data;
      if (msg?.room_id !== roomId) return;
      if (!username) return;

      const prefs = getNotificationPrefs();
      if (!prefs.mentions) return;

      const mentioned = msg.content?.toLowerCase().includes(`@${username.toLowerCase()}`);
      if (mentioned && msg.username !== username) {
        const title = `@${msg.username} mencionou você`;
        const body = msg.content;
        sendPushNotification(title, body);
        addNotification({ type: 'mention', title, body });
        showToast(<AtSign className="h-10 w-10 text-purple-500" />, title, body, 'text-purple-500');
      }
    });

    return () => {
      unsubPrediction();
      unsubBet();
      unsubChat();
    };
  }, [roomId, userType, userId, username]);

  return null;
}