import React from 'react';
import { TrendingUp, Clock, Flame } from 'lucide-react';

export default function RoomSidebar({ rooms, onRoomClick }) {
  const mostUsedRooms = rooms.slice(0, 8);
  const trendingRooms = rooms.slice(3, 11);
  const newRooms = rooms.slice(-8);

  const SidebarSection = ({ title, icon: Icon, rooms }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-[#D4AF37]" />
        <h3 className="font-bold text-sm uppercase text-zinc-900 dark:text-zinc-50">
          {title}
        </h3>
      </div>
      <div className="space-y-2">
        {rooms.map((room) => {
          const roomData = room.data || room;
          return (
            <div
              key={room.id}
              onClick={() => onRoomClick(room)}
              className="p-3 rounded-lg bg-background border hover:border-[#D4AF37] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {roomData.room_image && (
                  <img
                    src={roomData.room_image}
                    alt={roomData.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                    {roomData.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {roomData.country_flag} {roomData.secondary_label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-80 p-6 bg-background/50 border-l sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide">
      <SidebarSection title="Salas Mais Usadas" icon={Flame} rooms={mostUsedRooms} />
      <SidebarSection title="Trending" icon={TrendingUp} rooms={trendingRooms} />
      <SidebarSection title="Novidades" icon={Clock} rooms={newRooms} />
    </div>
  );
}