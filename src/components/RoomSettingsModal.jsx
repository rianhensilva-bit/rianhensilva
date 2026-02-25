import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const SECONDARY_LABELS = ['Política', 'Esporte', 'Cultura', 'Crypto', 'Clima', 'Economia', 'Menções', 'Companhias', 'Finanças', 'Tecnologia & Ciência'];

export default function RoomSettingsModal({ isOpen, onClose, room }) {
  const queryClient = useQueryClient();
  const roomData = room?.data || room;
  
  const [formData, setFormData] = useState({
    bio: roomData?.bio || '',
    secondary_label: roomData?.secondary_label || '',
    room_image: roomData?.room_image || ''
  });

  const updateRoomMutation = useMutation({
    mutationFn: (data) => base44.entities.Room.update(room.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['room']);
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateRoomMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Configurações da Sala</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Bio da Sala</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Descreva sobre o que é sua sala..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label>Rótulo Secundário</Label>
            <Select
              value={formData.secondary_label}
              onValueChange={(value) => setFormData({ ...formData, secondary_label: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {SECONDARY_LABELS.map(label => (
                  <SelectItem key={label} value={label}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>URL da Foto de Perfil</Label>
            <Input
              value={formData.room_image}
              onChange={(e) => setFormData({ ...formData, room_image: e.target.value })}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {formData.room_image && (
              <img src={formData.room_image} alt="Preview" className="mt-2 w-20 h-20 rounded object-cover" />
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}