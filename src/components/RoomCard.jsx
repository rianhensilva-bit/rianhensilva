import React, { useState } from 'react';
import { Lock, Users, HelpCircle, X } from 'lucide-react';

export default function RoomCard({ room, onRoomClick }) {
  const [showBio, setShowBio] = useState(false);
  const getCategoryColor = (category) => {
    const colors = {
      'Política': '#DC2626',
      'Esporte': '#2563EB',
      'Cultura': '#9333EA',
      'Crypto': '#F59E0B',
      'Clima': '#10B981',
      'Economia': '#059669',
      'Menções': '#EC4899',
      'Companhias': '#8B5CF6',
      'Finanças': '#14B8A6',
      'Tecnologia & Ciência': '#3B82F6'
    };
    return colors[category] || '#6B7280';
  };

  const roomData = room.data || room;
  const memberCount = roomData.member_count || 0;

  return (
    <div className="relative w-full">
      <div
        onClick={() => onRoomClick(room)}
        className="relative bg-background border-2 hover:border-[#D4AF37] transition-all cursor-pointer rounded-2xl p-6 shadow-md hover:shadow-xl w-full"
        style={{ borderColor: roomData.label_color || '#D4AF37' }}
      >
        <div className="flex items-start gap-4 mb-4">
          {roomData.room_image && (
            <div className="flex-shrink-0">
              <img 
                src={roomData.room_image} 
                alt={roomData.name}
                className="w-16 h-16 rounded-xl object-cover border-2"
                style={{ borderColor: roomData.label_color || '#D4AF37' }}
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold elegant-font text-zinc-900 dark:text-zinc-50 mb-2">
              {roomData.name}
            </h3>
            <div className="flex gap-2 flex-wrap items-center justify-center">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1"
                style={{ backgroundColor: roomData.label_color || '#D4AF37' }}
              >
                {roomData.country_flag} {roomData.country}
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: roomData.label_color || '#D4AF37' }}
              >
                {roomData.primary_label}
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: getCategoryColor(roomData.secondary_label) }}
              >
                {roomData.secondary_label}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Lock className="h-5 w-5 text-[#D4AF37]" />
            <button
              onClick={(e) => { e.stopPropagation(); setShowBio(true); }}
              className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              title="Ver descrição da sala"
            >
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">?</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{memberCount} membros</span>
          </div>
          <span className="text-xs">•</span>
          <span>Sala Privada</span>
        </div>
      </div>

      {/* Bio Popup */}
      {showBio && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowBio(false)}
        >
          <div 
            className="bg-background border-2 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            style={{ borderColor: roomData.label_color || '#D4AF37' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-lg elegant-font text-zinc-900 dark:text-zinc-50">{roomData.name}</h3>
              <button onClick={() => setShowBio(false)} className="text-zinc-400 hover:text-zinc-600 ml-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">{roomData.bio || 'Sem descrição disponível para esta sala.'}</p>
          </div>
        </div>
      )}
    </div>
  );
}