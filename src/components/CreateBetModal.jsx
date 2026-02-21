import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Política', 'Esporte', 'Cultura', 'Crypto', 'Clima', 'Economia', 
  'Menções', 'Companhias', 'Finanças', 'Tecnologia & Ciência',
  'Guerras', 'Mortes', 'Escândalos', 'Improváveis'
];

export default function CreateBetModal({ isOpen, onClose, language }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [endDate, setEndDate] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Prediction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      setTitle('');
      setDescription('');
      setCategory('');
      setEndDate('');
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      title,
      description,
      category,
      yes_percentage: 0,
      no_percentage: 0,
      total_volume: 0,
      end_date: endDate,
      status: 'active'
    });
  };

  const translations = {
    pt: { 
      title: 'Criar Nova Aposta', 
      betTitle: 'Título da Aposta',
      desc: 'Descrição (opcional)',
      selectCat: 'Selecionar Categoria',
      endDate: 'Data de Encerramento',
      create: 'Criar Aposta',
      cancel: 'Cancelar'
    },
    en: { 
      title: 'Create New Bet', 
      betTitle: 'Bet Title',
      desc: 'Description (optional)',
      selectCat: 'Select Category',
      endDate: 'End Date',
      create: 'Create Bet',
      cancel: 'Cancel'
    },
    es: { 
      title: 'Crear Nueva Apuesta', 
      betTitle: 'Título de la Apuesta',
      desc: 'Descripción (opcional)',
      selectCat: 'Seleccionar Categoría',
      endDate: 'Fecha de Cierre',
      create: 'Crear Apuesta',
      cancel: 'Cancelar'
    }
  };

  const t = translations[language] || translations.pt;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">{t.title}</DialogTitle>
        </DialogHeader>

        {/* Warning Banner */}
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-bold text-amber-600 dark:text-amber-400">
                5% de comissão por criação de apostas
              </p>
              <p className="text-muted-foreground">
                Lembre-se de sempre criar apostas realistas pois essas são analisadas pela equipe da GUANXI antes de serem liberadas aos usuários da plataforma
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">{t.betTitle}</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Brasil vai ganhar a Copa 2026?"
              required
              className="h-11"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">{t.desc}</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione detalhes sobre sua aposta..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Categoria</label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="h-11">
                <SelectValue placeholder={t.selectCat} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">{t.endDate}</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t.cancel}
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              className="flex-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-700 text-black font-bold"
            >
              {createMutation.isPending ? 'Criando...' : t.create}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}