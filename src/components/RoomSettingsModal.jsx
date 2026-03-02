import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Upload, Plus, X, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const SECONDARY_LABELS = ['Política', 'Esporte', 'Cultura', 'Crypto', 'Clima', 'Economia', 'Menções', 'Companhias', 'Finanças', 'Tecnologia & Ciência'];
const COLORS = ['#D4AF37', '#DC2626', '#2563EB', '#9333EA', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#14B8A6'];

export default function RoomSettingsModal({ isOpen, onClose, room }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const roomData = room?.data || room;

  const [formData, setFormData] = useState({
    bio: '',
    secondary_label: '',
    room_image: '',
    theme_description: '',
    label_color: '#D4AF37',
    participation_rules: [],
  });
  const [newRule, setNewRule] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (roomData) {
      let rules = [];
      if (roomData.participation_rules) {
        try { rules = JSON.parse(roomData.participation_rules); } catch { rules = []; }
      }
      setFormData({
        bio: roomData.bio || '',
        secondary_label: roomData.secondary_label || '',
        room_image: roomData.room_image || '',
        theme_description: roomData.theme_description || '',
        label_color: roomData.label_color || '#D4AF37',
        participation_rules: rules,
      });
      setImagePreview(roomData.room_image || '');
    }
  }, [room]);

  const updateRoomMutation = useMutation({
    mutationFn: async (data) => {
      let room_image = data.room_image;
      if (imageFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
        room_image = file_url;
      }
      return base44.entities.Room.update(room.id, {
        ...data,
        room_image,
        participation_rules: JSON.stringify(data.participation_rules || []),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['room']);
      toast.success('Configurações salvas!');
      onClose();
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addRule = () => {
    if (!newRule.trim()) return;
    setFormData(prev => ({ ...prev, participation_rules: [...prev.participation_rules, newRule.trim()] }));
    setNewRule('');
  };

  const removeRule = (idx) => {
    setFormData(prev => ({ ...prev, participation_rules: prev.participation_rules.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateRoomMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-[#D4AF37]" />
            Configurações da Sala
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="identidade" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="identidade">Identidade</TabsTrigger>
              <TabsTrigger value="tema">Tema & Bio</TabsTrigger>
              <TabsTrigger value="regras">Regras</TabsTrigger>
            </TabsList>

            <TabsContent value="identidade" className="space-y-4">
              <div>
                <Label>Foto da Sala</Label>
                <div className="flex items-center gap-4 mt-2">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-20 h-20 rounded-lg object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-600">
                      <Upload className="h-6 w-6 text-zinc-400" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Alterar Foto
                    </Button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    {formData.room_image && !imageFile && (
                      <Input
                        value={formData.room_image}
                        onChange={(e) => { setFormData({ ...formData, room_image: e.target.value }); setImagePreview(e.target.value); }}
                        placeholder="Ou cole uma URL"
                        className="text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label>Rótulo Secundário / Tema</Label>
                <Select value={formData.secondary_label} onValueChange={(v) => setFormData({ ...formData, secondary_label: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{SECONDARY_LABELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cor do Rótulo</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setFormData({ ...formData, label_color: color })}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${formData.label_color === color ? 'border-black dark:border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tema" className="space-y-4">
              <div>
                <Label>Bio da Sala</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Descreva o propósito e foco desta sala..."
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div>
                <Label>Descrição Detalhada do Tema</Label>
                <Textarea
                  value={formData.theme_description}
                  onChange={(e) => setFormData({ ...formData, theme_description: e.target.value })}
                  placeholder="Detalhe o tema específico, quais assuntos são discutidos, quem é o público-alvo..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="regras" className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Regras de Participação</Label>
                <p className="text-sm text-zinc-500 mb-3">Defina regras claras para os membros da sala.</p>
                <div className="flex gap-2">
                  <Input
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Ex: Apenas discussões sobre o tema da sala"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                  />
                  <Button type="button" onClick={addRule} size="sm" className="bg-[#D4AF37] text-black hover:bg-amber-500 shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {formData.participation_rules.length > 0 ? (
                <div className="space-y-2">
                  {formData.participation_rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                      <span className="text-[#D4AF37] font-bold text-sm shrink-0">{idx + 1}.</span>
                      <span className="flex-1 text-sm">{rule}</span>
                      <button type="button" onClick={() => removeRule(idx)} className="text-zinc-400 hover:text-red-500 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-400 text-center py-6 border border-dashed rounded-lg">
                  Nenhuma regra definida ainda.
                </p>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 pt-6 mt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={updateRoomMutation.isPending} className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold">
              {updateRoomMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}