import React, { useState } from 'react';
import { Crown, X, Tag, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CreateRoomModal from './CreateRoomModal';

const TAGS_PRIMARY = ['GLOBAL', 'NACIONAL', 'EUROPEU', 'ESTADUAL', 'MUNICIPAL'];
const TAGS_SECONDARY = ['Política', 'Esporte', 'Cultura', 'Crypto', 'Clima', 'Economia', 'Menções', 'Companhias', 'Finanças', 'Tecnologia & Ciência'];
const BORDER_COLORS = [
  { hex: '#D4AF37', label: 'Dourado' },
  { hex: '#DC2626', label: 'Vermelho' },
  { hex: '#2563EB', label: 'Azul' },
  { hex: '#9333EA', label: 'Roxo' },
  { hex: '#10B981', label: 'Verde' },
  { hex: '#F59E0B', label: 'Âmbar' },
  { hex: '#EC4899', label: 'Rosa' },
  { hex: '#14B8A6', label: 'Teal' },
  { hex: '#6366F1', label: 'Índigo' },
  { hex: '#FFFFFF', label: 'Branco' },
];

export default function FirstRoomWelcome({ onDismiss }) {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPrimary, setSelectedPrimary] = useState(null);
  const [selectedSecondary, setSelectedSecondary] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#D4AF37');
  const [roomName, setRoomName] = useState('');

  const handleCreateClick = () => {
    setShowCreate(true);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border-2 border-[#D4AF37] rounded-2xl shadow-2xl w-full max-w-lg relative overflow-y-auto max-h-[90vh]">
          
          {/* Close */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="text-center pt-8 pb-4 px-8 border-b border-zinc-800">
            <div className="flex justify-center mb-3">
              <Crown className="h-14 w-14 text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl font-black elegant-font" style={{
              background: 'linear-gradient(135deg, #F59E0B, #FBBF24, #F59E0B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Crie Sua Primeira Sala Privada
            </h2>
            <p className="text-zinc-400 text-sm mt-2">
              Configure sua sala e comece a construir sua comunidade de previsões
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">

            {/* Nome da sala */}
            <div>
              <Label className="text-zinc-200 font-semibold mb-2 flex items-center gap-2">
                Nome da Sala
              </Label>
              <Input
                placeholder="Ex: Arena Brasileira de Futebol"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            {/* Tags */}
            <div>
              <Label className="text-zinc-200 font-semibold mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#D4AF37]" />
                Tags da Sala
              </Label>
              <div className="space-y-3">
                {/* Tag Primária */}
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Abrangência</p>
                  <div className="flex flex-wrap gap-2">
                    {TAGS_PRIMARY.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedPrimary(selectedPrimary === tag ? null : tag)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          selectedPrimary === tag
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-black'
                            : 'border-zinc-600 text-zinc-300 hover:border-[#D4AF37]'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tag Secundária */}
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Tema</p>
                  <div className="flex flex-wrap gap-2">
                    {TAGS_SECONDARY.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedSecondary(selectedSecondary === tag ? null : tag)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          selectedSecondary === tag
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-black'
                            : 'border-zinc-600 text-zinc-300 hover:border-[#D4AF37]'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cor da sala */}
            <div>
              <Label className="text-zinc-200 font-semibold mb-2 flex items-center gap-2">
                <Palette className="h-4 w-4 text-[#D4AF37]" />
                Cor da Sala
              </Label>
              <div className="flex flex-wrap gap-3">
                {BORDER_COLORS.map(({ hex, label }) => (
                  <button
                    key={hex}
                    title={label}
                    onClick={() => setSelectedColor(hex)}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                      selectedColor === hex
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: hex, boxShadow: selectedColor === hex ? `0 0 10px ${hex}88` : undefined }}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Cor selecionada: <span style={{ color: selectedColor }} className="font-bold">{BORDER_COLORS.find(c => c.hex === selectedColor)?.label}</span>
              </p>
            </div>

            {/* Preview da sala */}
            {(roomName || selectedPrimary || selectedSecondary) && (
              <div className="rounded-xl border-2 p-4 bg-zinc-800/50" style={{ borderColor: selectedColor }}>
                <p className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">Pré-visualização</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-black text-lg" style={{ backgroundColor: selectedColor }}>
                    {roomName ? roomName[0].toUpperCase() : '?'}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-100">{roomName || 'Nome da Sala'}</p>
                    <div className="flex gap-1 mt-1">
                      {selectedPrimary && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300">{selectedPrimary}</span>
                      )}
                      {selectedSecondary && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300">{selectedSecondary}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 space-y-3">
            <Button
              onClick={handleCreateClick}
              className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-black text-base py-5"
            >
              Criar Sala Completa
            </Button>
            <button
              onClick={onDismiss}
              className="w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-1"
            >
              Fazer isso depois
            </button>
          </div>
        </div>
      </div>

      <CreateRoomModal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); onDismiss(); }}
        initialData={{ name: roomName, primary_label: selectedPrimary, secondary_label: selectedSecondary, label_color: selectedColor }}
      />
    </>
  );
}