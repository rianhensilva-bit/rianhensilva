import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Bell, TrendingUp, CheckCircle, XCircle, Clock, AtSign, Trophy, AlertCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationSettingsModal from './NotificationSettingsModal';

const ICONS = {
  new_prediction: <TrendingUp className="h-5 w-5 text-[#D4AF37]" />,
  bet_won: <Trophy className="h-5 w-5 text-green-500" />,
  bet_lost: <XCircle className="h-5 w-5 text-red-500" />,
  bet_active: <Clock className="h-5 w-5 text-blue-500" />,
  prediction_closed: <Clock className="h-5 w-5 text-orange-500" />,
  prediction_resolved: <CheckCircle className="h-5 w-5 text-green-500" />,
  mention: <AtSign className="h-5 w-5 text-purple-500" />,
  default: <AlertCircle className="h-5 w-5 text-zinc-400" />,
};

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

export default function NotificationPanel({ isOpen, onClose, notifications }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col">
          <SheetHeader className="px-4 py-4 border-b flex flex-row items-center justify-between space-y-0">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-[#D4AF37]" />
              Notificações
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} title="Preferências">
              <Settings className="h-4 w-4" />
            </Button>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-500 gap-2">
                <Bell className="h-10 w-10 opacity-30" />
                <p className="text-sm">Nenhuma notificação ainda</p>
              </div>
            ) : (
              <ul className="divide-y">
                {notifications.map((n) => (
                  <li key={n.id} className={`flex items-start gap-3 px-4 py-4 transition-colors ${!n.read ? 'bg-[#D4AF37]/5' : ''}`}>
                    <div className="mt-0.5 flex-shrink-0">
                      {ICONS[n.type] || ICONS.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-snug">{n.title}</p>
                      {n.body && <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-zinc-400 mt-1">{timeAgo(n.timestamp)}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0" />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <NotificationSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}