import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, Plus, X, Upload } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import toast from 'react-hot-toast';

const PRIMARY_LABELS = ['GLOBAL', 'NACIONAL', 'EUROPEU', 'ESTADUAL', 'MUNICIPAL'];
const SECONDARY_LABELS = ['Política', 'Esporte', 'Cultura', 'Crypto', 'Clima', 'Economia', 'Menções', 'Companhias', 'Tecnologia & Ciência'];
const COLORS = ['#D4AF37', '#DC2626', '#2563EB', '#9333EA', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#14B8A6'];
const COUNTRIES = [
  { name: 'Brasil', flag: '🇧🇷' },
  { name: 'EUA', flag: '🇺🇸' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Global', flag: '🌍' },
];

const STEPS = ['Identidade', 'Tema & Bio', 'Regras', 'Contato'];

export default function CreateRoomModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [newRule, setNewRule] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    primary_label: '',
    secondary_label: '',
    country: 'Brasil',
    country_flag: '🇧🇷',
    label_color: '#D4AF37',
    manager_contact_method: 'whatsapp',
    manager_contact: '',
    bio: '',
    room_image: '',
    participation_rules: [],
    theme_description: '',
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addRule = () => {
    if (!newRule.trim()) return;
    setFormData(prev => ({ ...prev, participation_rules: [...(prev.participation_rules || []), newRule.trim()] }));
    setNewRule('');
  };

  const removeRule = (idx) => {
    setFormData(prev => ({ ...prev, participation_rules: prev.participation_rules.filter((_, i) => i !== idx) }));
  };

  const createRoomMutation = useMutation({
    mutationFn: async (data) => {
      let room_image = data.room_image;
      if (imageFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
        room_image = file_url;
      }
      const user = await base44.auth.me();
      return base44.entities.Room.create({
        ...data,
        room_image,
        manager_id: user.id,
        master_key: Math.random().toString(36).slice(2, 8).toUpperCase(),
        participation_rules: JSON.stringify(data.participation_rules || []),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Sala criada com sucesso!');
      setStep(0);
      setFormData({ name: '', primary_label: '', secondary_label: '', country: 'Brasil', country_flag: '🇧🇷', label_color: '#D4AF37', manager_contact_method: 'whatsapp', manager_contact: '', bio: '', room_image: '', participation_rules: [], theme_description: '' });
      setImageFile(null);
      setImagePreview('');
      onClose();
    }
  });

  const handleSubmit = () => createRoomMutation.mutate(formData);

  const isStepValid = () => {
    if (step === 0) return formData.name && formData.primary_label && formData.secondary_label;
    if (step === 3) return formData.manager_contact;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold elegant-font flex items-center gap-2">
            <Home className="h-6 w-6 text-[#D4AF37]" />
            Criar Nova Sala
          </DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex-1 text-center text-xs font-semibold py-1 rounded ${i === step ? 'bg-[#D4AF37] text-black' : i < step ? 'bg-green-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>
                {s}
              </div>
              {i < STEPS.length - 1 && <div className="w-2 h-px bg-zinc-300 dark:bg-zinc-600" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 0: Identidade */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label>Nome da Sala *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Política Brasil 2026" />
            </div>
            <div>
              <Label>Rótulo Principal *</Label>
              <Select value={formData.primary_label} onValueChange={(v) => setFormData({ ...formData, primary_label: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{PRIMARY_LABELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tema / Categoria *</Label>
              <Select value={formData.secondary_label} onValueChange={(v) => setFormData({ ...formData, secondary_label: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o tema" /></SelectTrigger>
                <SelectContent>{SECONDARY_LABELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>País</Label>
              <Select value={formData.country} onValueChange={(v) => {
                const c = COUNTRIES.find(c => c.name === v);
                setFormData({ ...formData, country: v, country_flag: c?.flag || '🌍' });
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COUNTRIES.map(c => <SelectItem key={c.name} value={c.name}>{c.flag} {c.name}</SelectItem>)}</SelectContent>
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
          </div>
        )}

        {/* Step 1: Tema & Bio */}
        {step === 1 && (
          <div className="space-y-4">
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
                <label className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" onClick={() => {}}>
                    <Upload className="h-4 w-4 mr-2" /> Upload
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
            </div>
            <div>
              <Label>Bio / Descrição da Sala</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Descreva sobre o que é essa sala, seu foco e propósito..."
                rows={4}
                className="resize-none"
              />
            </div>
            <div>
              <Label>Descrição do Tema</Label>
              <Textarea
                value={formData.theme_description}
                onChange={(e) => setFormData({ ...formData, theme_description: e.target.value })}
                placeholder="Detalhe o tema específico da sala. Ex: Foco em eleições municipais de São Paulo 2026, análise de candidatos e pesquisas..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Regras */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Regras de Participação</Label>
              <p className="text-sm text-zinc-500 mb-3">Defina as regras que os membros devem seguir nesta sala.</p>
              <div className="flex gap-2">
                <Input
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="Ex: Respeite todos os membros"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                />
                <Button type="button" onClick={addRule} size="sm" className="bg-[#D4AF37] text-black hover:bg-amber-500 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {formData.participation_rules?.length > 0 ? (
              <div className="space-y-2">
                {formData.participation_rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                    <span className="text-[#D4AF37] font-bold text-sm">{idx + 1}.</span>
                    <span className="flex-1 text-sm">{rule}</span>
                    <button onClick={() => removeRule(idx)} className="text-zinc-400 hover:text-red-500 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400 text-center py-4 border border-dashed rounded-lg">
                Nenhuma regra adicionada ainda. Adicione regras para orientar os membros.
              </p>
            )}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-200">
              💡 Regras claras ajudam a manter a comunidade saudável e engajada.
            </div>
          </div>
        )}

        {/* Step 3: Contato */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Canal de Recebimento de Solicitações de Chave</Label>
              <Select value={formData.manager_contact_method} onValueChange={(v) => setFormData({ ...formData, manager_contact_method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{formData.manager_contact_method === 'whatsapp' ? 'Número de WhatsApp *' : 'E-mail de Contato *'}</Label>
              <Input
                required
                placeholder={formData.manager_contact_method === 'whatsapp' ? '(00) 00000-0000' : 'seu@email.com'}
                value={formData.manager_contact}
                onChange={(e) => setFormData({ ...formData, manager_contact: e.target.value })}
              />
            </div>
            {/* Resumo */}
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-bold mb-3 text-base">Resumo da Sala</p>
              <p><span className="text-zinc-500">Nome:</span> {formData.name}</p>
              <p><span className="text-zinc-500">Tema:</span> {formData.secondary_label} • {formData.primary_label}</p>
              <p><span className="text-zinc-500">País:</span> {formData.country_flag} {formData.country}</p>
              {formData.bio && <p><span className="text-zinc-500">Bio:</span> {formData.bio.slice(0, 80)}{formData.bio.length > 80 ? '...' : ''}</p>}
              <p><span className="text-zinc-500">Regras:</span> {formData.participation_rules?.length || 0} definidas</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Anterior
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!isStepValid()}
              className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold disabled:opacity-50"
            >
              Próximo
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!isStepValid() || createRoomMutation.isPending}
              className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold"
            >
              {createRoomMutation.isPending ? 'Criando...' : 'Criar Sala'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}