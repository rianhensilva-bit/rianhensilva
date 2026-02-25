import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User, TrendingUp } from 'lucide-react';

export default function MembersListModal({ isOpen, onClose, roomId }) {
  const { data: members = [] } = useQuery({
    queryKey: ['members', roomId],
    queryFn: () => base44.entities.RoomMember.filter({ room_id: roomId }),
    enabled: !!roomId && isOpen
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Lista de Membros</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {members.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">Nenhum membro registrado ainda.</p>
          ) : (
            members.map((member) => {
              const memberData = member.data || member;
              return (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center">
                      <User className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <p className="font-bold">{memberData.username || 'Usuário'}</p>
                      <p className="text-sm text-zinc-500">Membro desde {new Date(member.created_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-zinc-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>{Math.floor(Math.random() * 10) + 1} apostas ativas</span>
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