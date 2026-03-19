import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, User, Zap } from 'lucide-react';

const BetaBadge = () => (
  <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md tracking-widest select-none" style={{ WebkitTextFillColor: 'white' }}>
    BETA
  </span>
);

export default function SignupModal({ isOpen, onClose, language, onQuickCreate }) {
  const [formData, setFormData] = useState({
    username: '', email: '', state: '', city: '', bio: '', profileImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [quickName, setQuickName] = useState('');
  const [showQuick, setShowQuick] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
  };

  const handleQuickCreate = () => {
    if (!quickName.trim()) return;
    // Salva perfil rápido no localStorage
    localStorage.setItem('galore_quick_profile', JSON.stringify({ username: quickName, password: quickName, role: 'player' }));
    localStorage.setItem('galore_role', 'player');
    if (onQuickCreate) onQuickCreate('player', quickName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Criar Conta — Jogador</DialogTitle>
        </DialogHeader>

        {/* Criação Rápida */}
        <div className="border-2 border-blue-600/40 bg-blue-950/20 rounded-xl p-4 mt-2">
          <button
            type="button"
            onClick={() => setShowQuick(!showQuick)}
            className="w-full flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="font-black text-zinc-100 text-sm">Criação Rápida!</span>
              <BetaBadge />
            </div>
            <span className="text-xs text-zinc-400">{showQuick ? '▲' : '▼'}</span>
          </button>

          {showQuick && (
            <div className="mt-3 space-y-3">
              <div>
                <Label className="text-zinc-200 text-xs">Nome de Perfil</Label>
                <Input
                  placeholder="Ex: CraqueBR"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-100"
                />
                <p className="text-xs text-blue-400 mt-1">⚠️ O nome de perfil e a senha são a mesma coisa</p>
              </div>
              <Button
                type="button"
                onClick={handleQuickCreate}
                disabled={!quickName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Entrar Rapidamente
                <BetaBadge />
              </Button>
            </div>
          )}
        </div>

        <div className="relative flex items-center gap-2 my-2">
          <div className="flex-1 border-t border-zinc-700" />
          <span className="text-xs text-zinc-500">ou cadastro completo</span>
          <div className="flex-1 border-t border-zinc-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-black" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <Upload className="h-5 w-5" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <span className="text-sm text-muted-foreground">Foto de Perfil</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nome de Usuário</Label>
            <Input
              id="username"
              placeholder="Digite seu nome de usuário"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                placeholder="Ex: São Paulo"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                placeholder="Ex: São Paulo"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Sobre Você</Label>
            <Textarea
              id="bio"
              placeholder="Conte um pouco sobre você..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black"
          >
            Criar Conta
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}