import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, TrendingUp, Clock, CheckCircle, Plus } from 'lucide-react';

const STORAGE_KEY = 'guanxi_notification_prefs';

export const defaultPrefs = {
  new_predictions: true,
  closed_predictions: true,
  resolved_predictions: true,
  bet_updates: true,
  mentions: true,
  push_enabled: false,
};

export function getNotificationPrefs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultPrefs, ...JSON.parse(stored) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

export function saveNotificationPrefs(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export default function NotificationSettingsModal({ isOpen, onClose }) {
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [pushStatus, setPushStatus] = useState('default'); // 'default' | 'granted' | 'denied'

  useEffect(() => {
    setPrefs(getNotificationPrefs());
    if ('Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, [isOpen]);

  const handleToggle = (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    saveNotificationPrefs(updated);
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPushStatus(result);
    const updated = { ...prefs, push_enabled: result === 'granted' };
    setPrefs(updated);
    saveNotificationPrefs(updated);
  };

  const items = [
    {
      key: 'new_predictions',
      icon: <Plus className="h-5 w-5 text-[#D4AF37]" />,
      label: 'Novas Previsões',
      desc: 'Quando uma nova previsão for criada na sala',
    },
    {
      key: 'closed_predictions',
      icon: <Clock className="h-5 w-5 text-orange-500" />,
      label: 'Previsões Encerradas',
      desc: 'Quando uma previsão ativa for encerrada',
    },
    {
      key: 'resolved_predictions',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      label: 'Resultados Definidos',
      desc: 'Quando o resultado de uma previsão for revelado',
    },
    {
      key: 'bet_updates',
      icon: <Bell className="h-5 w-5 text-blue-500" />,
      label: 'Minhas Apostas',
      desc: 'Quando sua aposta for ganha ou perdida',
    },
    {
      key: 'mentions',
      icon: <BellOff className="h-5 w-5 text-purple-500" />,
      label: 'Menções no Chat',
      desc: 'Quando alguém mencionar seu @nome no chat',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bell className="h-5 w-5 text-[#D4AF37]" />
            Configurações de Notificações
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Push nativa */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {pushStatus === 'granted' ? (
                  <Bell className="h-5 w-5 text-green-500" />
                ) : (
                  <BellOff className="h-5 w-5 text-zinc-400" />
                )}
                <div>
                  <p className="font-semibold text-sm">Notificações Push</p>
                  <p className="text-xs text-zinc-500">Receba alertas mesmo com o browser em segundo plano</p>
                </div>
              </div>
            </div>
            {pushStatus === 'granted' ? (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Permissão concedida</p>
            ) : pushStatus === 'denied' ? (
              <p className="text-xs text-red-500 font-medium">✗ Permissão negada pelo browser. Habilite nas configurações do browser.</p>
            ) : (
              <Button size="sm" onClick={requestPushPermission} className="bg-[#D4AF37] hover:bg-[#B8941F] text-black text-xs">
                Habilitar notificações push
              </Button>
            )}
          </div>

          {/* Tipos de notificação */}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-zinc-500 mb-3">Tipos de alerta (in-app)</p>
            {items.map(({ key, icon, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  {icon}
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-zinc-500">{desc}</p>
                  </div>
                </div>
                <Switch
                  checked={prefs[key]}
                  onCheckedChange={() => handleToggle(key)}
                />
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full mt-2">
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
}