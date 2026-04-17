import React, { useEffect, useRef } from 'react';
import { X, Calendar, TrendingUp, Lock, MessageCircle, Mail, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORY_COLORS = {
  'Política': '#DC2626',
  'Esporte': '#2563EB',
  'Cultura': '#9333EA',
  'Crypto': '#F59E0B',
  'Clima': '#10B981',
  'Economia': '#059669',
  'Menções': '#EC4899',
  'Companhias': '#8B5CF6',
  'Finanças': '#14B8A6',
  'Tecnologia & Ciência': '#3B82F6',
};

function PreviewPredictionCard({ prediction }) {
  const predData = prediction.data || prediction;
  const borderColor = predData.label_color || CATEGORY_COLORS[predData.category] || '#D4AF37';

  return (
    <div
      className="flex-shrink-0 bg-background border-2 rounded-2xl shadow-md flex flex-col"
      style={{ borderColor, width: '260px', minHeight: '200px', padding: '16px 18px' }}
    >
      <div className="mb-3 flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: CATEGORY_COLORS[predData.category] || '#6B7280' }}
          >
            {predData.category || 'Geral'}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 shrink-0">
            ATIVA
          </span>
        </div>

        <h3 className="font-bold text-sm leading-snug text-zinc-900 dark:text-zinc-50 line-clamp-3 mb-2">
          {predData.title}
        </h3>

        {predData.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-2">
            {predData.description}
          </p>
        )}

        <div className="flex flex-col gap-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            R$ {predData.total_volume || 0}
          </span>
          {predData.end_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              até {new Date(predData.end_date).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto pt-2 border-t border-zinc-200 dark:border-zinc-700">
        {predData.bet_type === 'yes_no' ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center justify-center py-2 rounded-xl bg-green-600 text-white font-bold text-xs">
              SIM
              <span className="text-xs font-normal opacity-90">{predData.yes_percentage || 50}%</span>
            </div>
            <div className="flex flex-col items-center justify-center py-2 rounded-xl bg-red-600 text-white font-bold text-xs">
              NÃO
              <span className="text-xs font-normal opacity-90">{predData.no_percentage || 50}%</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {predData.options?.slice(0, 3).map((option, idx) => {
              const maxPct = Math.max(...(predData.options.map(o => o.percentage || 0)));
              const pct = option.percentage || 0;
              const barWidth = maxPct > 0 ? Math.round((pct / maxPct) * 80) : 0;
              return (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate shrink-0 max-w-[45%]">
                    {option.label}
                  </span>
                  <div className="flex-1 flex items-center">
                    <div className="h-[3px] rounded-full transition-all" style={{ width: `${barWidth}%`, backgroundColor: option.color || borderColor }} />
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-lg text-white text-xs font-bold" style={{ backgroundColor: option.color || borderColor }}>
                    {Math.round(pct)}%
                  </span>
                </div>
              );
            })}
            {predData.options?.length > 3 && (
              <span className="text-xs text-zinc-400 text-center pt-0.5">+{predData.options.length - 3} opções</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CTACard({ room, isAuthenticated, onRequestAccess }) {
  const roomData = room?.data || room;
  const borderColor = roomData?.label_color || '#D4AF37';
  const contactMethod = roomData?.manager_contact_method || 'whatsapp';

  const handleClick = () => {
    if (!isAuthenticated) {
      base44.auth.redirectToLogin();
      return;
    }
    onRequestAccess();
  };

  return (
    <div
      className="flex-shrink-0 border-2 rounded-2xl flex flex-col items-center justify-center text-center p-5 gap-3"
      style={{ borderColor, width: '260px', minHeight: '200px', background: 'transparent' }}
    >
      <Lock className="h-8 w-8" style={{ color: borderColor }} />
      <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-snug">
        {!isAuthenticated ? (
          <>
            Interessado? Gostaria de ver mais? Primeiro crie seu perfil na Galore e depois pode pedir sua chave de acesso gratuitamente ao gerente da sala.
          </>
        ) : (
          <>
            Interessado? Gostaria de ver mais? Peça sua chave de acesso gratuitamente ao gerente da sala.
          </>
        )}
      </p>

      {!isAuthenticated ? (
        <button
          onClick={handleClick}
          className="mt-1 px-4 py-2 rounded-xl font-bold text-sm text-black transition-all hover:opacity-80"
          style={{ backgroundColor: borderColor }}
        >
          <UserPlus className="inline h-4 w-4 mr-1" />
          Criar Perfil
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="mt-1 px-4 py-2 rounded-xl font-bold text-sm text-black transition-all hover:opacity-80 flex items-center gap-2"
          style={{ backgroundColor: borderColor }}
        >
          {contactMethod === 'whatsapp' ? (
            <MessageCircle className="h-4 w-4" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Clique Aqui
        </button>
      )}
    </div>
  );
}

export default function RoomPreviewFeed({ room, predictions, isOpen, onClose, onRequestAccess, isAuthenticated }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const activePredictions = predictions.filter(p => (p.data || p).status === 'active');
  const maxToShow = activePredictions.length <= 5 ? Math.min(activePredictions.length, 5) : Math.min(activePredictions.length, 9);
  const visiblePredictions = activePredictions.slice(0, maxToShow);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative bg-background rounded-2xl shadow-2xl w-full max-w-5xl border border-zinc-200 dark:border-zinc-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold elegant-font text-zinc-900 dark:text-zinc-50">
              Preview de Apostas
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {(room?.data || room)?.name} · {activePredictions.length} previsões ativas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        {/* Scrollable feed — horizontal on desktop, vertical on mobile */}
        <div
          ref={scrollRef}
          className="flex md:flex-row flex-col md:overflow-x-auto overflow-y-auto gap-4 pb-2 md:pb-0"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          {visiblePredictions.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400 text-sm py-8 w-full text-center">
              Nenhuma previsão ativa nesta sala ainda.
            </p>
          ) : (
            <>
              {visiblePredictions.map((prediction) => (
                <PreviewPredictionCard key={prediction.id} prediction={prediction} />
              ))}
              <CTACard
                room={room}
                isAuthenticated={isAuthenticated}
                onRequestAccess={onRequestAccess}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}