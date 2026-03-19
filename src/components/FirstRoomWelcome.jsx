import React, { useState } from 'react';
import { Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreateRoomModal from './CreateRoomModal';

export default function FirstRoomWelcome({ onDismiss }) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-background border-2 border-[#D4AF37] rounded-2xl shadow-2xl max-w-md w-full p-8 relative text-center">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex justify-center mb-4">
            <Crown className="h-16 w-16 text-[#D4AF37]" />
          </div>

          <h2 className="text-2xl font-black elegant-font mb-2" style={{
            background: 'linear-gradient(135deg, #F59E0B, #FBBF24, #F59E0B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Bem-vindo, Gerente!
          </h2>

          <p className="text-zinc-400 mb-2 text-sm">
            Você acaba de se tornar Gerente GALORE.
          </p>
          <p className="text-zinc-200 font-semibold mb-6">
            Crie agora sua primeira sala privada de previsões e comece a construir sua comunidade.
          </p>

          <Button
            onClick={() => setShowCreate(true)}
            className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-black text-lg py-6"
          >
            Criar Minha Primeira Sala
          </Button>

          <button
            onClick={onDismiss}
            className="mt-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Fazer isso depois
          </button>
        </div>
      </div>

      <CreateRoomModal isOpen={showCreate} onClose={() => { setShowCreate(false); onDismiss(); }} />
    </>
  );
}