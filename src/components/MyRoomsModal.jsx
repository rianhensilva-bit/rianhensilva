import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users } from 'lucide-react';

export default function MyRoomsModal({ isOpen, onClose }) {
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => base44.entities.Room.list()
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold elegant-font">
            Minhas Salas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {rooms.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">Você ainda não é membro de nenhuma sala.</p>
          ) : (
            rooms.slice(0, 5).map((room) => {
              const roomData = room.data || room;
              return (
                <div
                  key={room.id}
                  className="p-4 border rounded-lg hover:border-[#D4AF37] transition-all cursor-pointer"
                  onClick={() => window.location.href = `/ManagerDashboard?roomId=${room.id}`}
                >
                  <div className="flex items-center gap-3">
                    {roomData.room_image && (
                      <img
                        src={roomData.room_image}
                        alt={roomData.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{roomData.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span>{roomData.country_flag} {roomData.secondary_label}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {roomData.member_count || 0} membros
                        </span>
                      </div>
                    </div>
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