import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, Palette } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const PRIMARY_LABELS = ['GLOBAL', 'NACIONAL', 'EUROPEU', 'ESTADUAL', 'MUNICIPAL'];
const SECONDARY_LABELS = ['Política', 'Esporte', 'Cultura', 'Crypto', 'Clima', 'Economia', 'Menções', 'Companhias', 'Finanças', 'Tecnologia & Ciência'];
const COLORS = ['#D4AF37', '#DC2626', '#2563EB', '#9333EA', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#14B8A6'];

export default function CreateRoomModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    primary_label: '',
    secondary_label: '',
    country: 'BRASIL',
    country_flag: '🇧🇷',
    label_color: '#D4AF37',
    manager_contact_method: 'whatsapp',
    manager_contact: ''
  });

  const createRoomMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Room.create({
        ...data,
        manager_id: user.id,
        master_key: '123' // Chave padrão de teste
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createRoomMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold elegant-font flex items-center gap-2">
            <Home className="h-6 w-6 text-[#D4AF37]" />
            Criar Nova Sala
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Sala *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="primary">Rótulo Principal *</Label>
            <Select value={formData.primary_label} onValueChange={(value) => setFormData({ ...formData, primary_label: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {PRIMARY_LABELS.map(label => (
                  <SelectItem key={label} value={label}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="secondary">Rótulo Secundário *</Label>
            <Select value={formData.secondary_label} onValueChange={(value) => setFormData({ ...formData, secondary_label: value })}>
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
            <Label htmlFor="color">Cor do Rótulo</Label>
            <div className="flex gap-2 mt-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, label_color: color })}
                  className={`w-10 h-10 rounded-full border-2 ${formData.label_color === color ? 'border-black dark:border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="contact_method">Escolha por onde deseja receber solicitações de chave</Label>
            <Select value={formData.manager_contact_method} onValueChange={(value) => setFormData({ ...formData, manager_contact_method: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="contact">{formData.manager_contact_method === 'whatsapp' ? 'WhatsApp' : 'E-mail'}</Label>
            <Input
              id="contact"
              required
              placeholder={formData.manager_contact_method === 'whatsapp' ? '(00) 00000-0000' : 'seu@email.com'}
              value={formData.manager_contact}
              onChange={(e) => setFormData({ ...formData, manager_contact: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold">
              Criar Sala
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}