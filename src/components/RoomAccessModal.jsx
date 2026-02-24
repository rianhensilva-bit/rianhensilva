import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, LogIn, Mail, MessageCircle } from 'lucide-react';

export default function RoomAccessModal({ room, isOpen, onClose, onAccessGranted }) {
  const [accessKey, setAccessKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFirstAccess, setIsFirstAccess] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccessWithKey = async () => {
    setIsLoading(true);
    const roomData = room?.data || room;
    // Validar chave de acesso
    if (accessKey === roomData?.master_key) {
      setIsFirstAccess(false);
    }
    setIsLoading(false);
  };

  const handleCreateLogin = async () => {
    setIsLoading(true);
    // Criar login e senha para o usuário
    // TODO: Implementar lógica de criação
    onAccessGranted();
    setIsLoading(false);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    // Fazer login
    // TODO: Implementar lógica de login
    onAccessGranted();
    setIsLoading(false);
  };

  const roomData = room?.data || room;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold elegant-font flex items-center gap-2">
            <Lock className="h-6 w-6 text-[#D4AF37]" />
            Acesso à Sala: {roomData?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isFirstAccess ? (
            <>
              <Button
                variant="outline"
                className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 font-bold mb-4"
                onClick={() => {
                  setAccessKey('321');
                  handleAccessWithKey();
                }}
              >
                🔑 ACESSO MESTRE
              </Button>

              <Button
                variant="outline"
                className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold mb-4"
                onClick={() => alert('Solicitar chave via WhatsApp/Email do gerente')}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                SOLICITAR CHAVE DE ACESSO
              </Button>
              
              <div className="border-t pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Chave de Acesso</label>
                  <Input
                    placeholder="Digite a chave fornecida pelo gerente"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleAccessWithKey}
                  disabled={isLoading || !accessKey}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold mt-4"
                >
                  Verificar Chave
                </Button>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">Já possui login?</p>
                <div className="space-y-3">
                  <Input
                    placeholder="Nome de usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    onClick={handleLogin}
                    disabled={isLoading || !username || !password}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Fazer Login
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Primeiro acesso! Crie seu login e senha para acessar esta sala.
              </p>
              <div>
                <label className="text-sm font-medium mb-2 block">Nome de Usuário</label>
                <Input
                  placeholder="Escolha um nome de usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Senha</label>
                <Input
                  type="password"
                  placeholder="Crie uma senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreateLogin}
                disabled={isLoading || !username || !password}
                className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Criar Acesso
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}