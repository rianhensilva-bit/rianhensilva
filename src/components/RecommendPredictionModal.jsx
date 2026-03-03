import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Política', 'Esporte', 'Cultura', 'Crypto', 'Clima', 'Economia', 'Menções', 'Companhias', 'Finanças', 'Tecnologia & Ciência'];

export default function RecommendPredictionModal({ isOpen, onClose, roomId, userId, username }) {
  const [form, setForm] = useState({ title: '', description: '', category: '', bet_type: 'yes_no' });
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => base44.entities.PredictionRecommendation.create({
      room_id: roomId,
      user_id: userId || 'anonymous',
      username: username || 'Membro',
      title: form.title,
      description: form.description,
      category: form.category || undefined,
      bet_type: form.bet_type,
      status: 'pending',
    }),
    onSuccess: () => {
      toast.success('Recomendação enviada ao gerente!');
      queryClient.invalidateQueries({ queryKey: ['recommendations', roomId] });
      setForm({ title: '', description: '', category: '', bet_type: 'yes_no' });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#D4AF37]" />
            Recomendar Previsão ao Gerente
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label>Título da Previsão *</Label>
            <Input
              placeholder="Ex: O Brasil vai ganhar a Copa em 2026?"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Descrição / Contexto</Label>
            <Textarea
              placeholder="Explique o motivo da sugestão ou adicione mais contexto..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="mt-1 h-24 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Aposta</Label>
              <Select value={form.bet_type} onValueChange={v => setForm(f => ({ ...f, bet_type: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_no">Sim / Não</SelectItem>
                  <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={!form.title.trim() || isPending} className="bg-[#D4AF37] text-black hover:bg-[#c49b2e]">
              {isPending ? 'Enviando...' : 'Enviar Recomendação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}