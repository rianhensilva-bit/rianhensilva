import React, { useState } from 'react';
import { Search, Sun, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SocialMediaModal from './SocialMediaModal';
import CreateBetModal from './CreateBetModal';
import SignupModal from './SignupModal';
import BecomeManagerModal from './BecomeManagerModal';
import MyRoomsModal from './MyRoomsModal';
import NotificationCenter from './NotificationCenter';
import CreateRoomModal from './CreateRoomModal';
import FirstRoomWelcome from './FirstRoomWelcome';

export default function Header({ darkMode, toggleDarkMode, searchQuery, setSearchQuery, onLogoClick }) {
  const [showSocial, setShowSocial] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [userRole, setUserRole] = useState(() => localStorage.getItem('galore_role') || null);
  const [showMyRooms, setShowMyRooms] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showFirstRoom, setShowFirstRoom] = useState(false);

  const handleLoginAs = (role) => {
    const isFirstTime = !localStorage.getItem('galore_role');
    localStorage.setItem('galore_role', role);
    setUserRole(role);
    setShowWelcomeBack(true);
    setTimeout(() => setShowWelcomeBack(false), 3500);
    if (role === 'manager' && isFirstTime) {
      setTimeout(() => setShowFirstRoom(true), 400);
    }
  };

  const handleManagerModalClose = () => {
    setShowManager(false);
    // Após fechar o modal de gerente, considera que ele se cadastrou
    handleLoginAs('manager');
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-3 md:px-6 py-3 md:py-5">
          <div className="flex items-center justify-between gap-2 md:gap-6">
            {/* Social Media Button */}
            <button
              onClick={() => setShowSocial(true)}
              className="hidden md:block text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-foreground transition-colors"
            >
              SOCIAIS
            </button>

            {/* Logo and Tagline */}
            <div className="flex items-center gap-2 md:gap-4 md:ml-8">
              <div>
                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    onClick={onLogoClick}
                    className="text-2xl md:text-5xl font-black tracking-tight elegant-font hover:opacity-90 transition-opacity cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B, #FBBF24, #F59E0B)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))',
                      WebkitTextStroke: '0.5px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    GALORE
                  </button>
                  {/* Beta Badge */}
                  <span className="bg-blue-600 text-white text-[10px] md:text-xs font-black px-1.5 py-0.5 rounded-md tracking-wider select-none">
                    BETA
                  </span>
                </div>
                <p className="hidden md:block text-base font-semibold text-zinc-800 dark:text-zinc-100 mt-1 ml-1 uppercase">
                  MERCADO DE RATEIO E PREVISÕES PROGNÓSTICAS
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl relative" style={{ marginTop: '4px' }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar salas de comunidades"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-lg border-2 bg-background/50 focus:bg-background transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <NotificationCenter />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full h-8 w-8 md:h-11 md:w-11"
              >
                {darkMode ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
              </Button>

              {/* Botão Entrar (dropdown) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full border-2 font-bold px-3 md:px-5 h-8 md:h-9 text-xs md:text-sm"
                    style={{ borderColor: '#D4AF37', color: '#D4AF37' }}
                  >
                    Entrar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => { setShowSignup(true); handleLoginAs('player'); }}>
                    JOGADOR
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setShowManager(true); }}>
                    GERENTE
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Botão contextual por role */}
              {userRole === 'manager' ? (
                <Button
                  onClick={() => window.location.href = '/ManagerDashboard'}
                  variant="outline"
                  className="hidden md:inline-flex rounded-full border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold px-5 h-9 text-sm"
                >
                  Acessar Dashboard
                </Button>
              ) : userRole === 'player' ? (
                <Button
                  onClick={() => setShowMyRooms(true)}
                  variant="outline"
                  className="hidden md:inline-flex rounded-full border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold px-5 h-9 text-sm"
                >
                  Acessar Minhas Salas
                </Button>
              ) : (
                <Button
                  onClick={() => setShowManager(true)}
                  variant="outline"
                  className="hidden md:inline-flex rounded-full border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold px-5 h-9 text-sm"
                >
                  Tornar-se Gerente
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Toast "Bem-vindo de volta" */}
      {showWelcomeBack && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-[#D4AF37] rounded-xl shadow-2xl px-6 py-4 text-center animate-in fade-in slide-in-from-top-4 duration-300">
          <p className="text-[#D4AF37] font-black text-lg elegant-font">Bem-vindo de volta à GALORE</p>
          <p className="text-zinc-400 text-sm mt-1">Boas previsões! 🎯</p>
        </div>
      )}

      <SocialMediaModal isOpen={showSocial} onClose={() => setShowSocial(false)} language="pt" />
      <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} language="pt" />
      <BecomeManagerModal isOpen={showManager} onClose={handleManagerModalClose} />
      <MyRoomsModal isOpen={showMyRooms} onClose={() => setShowMyRooms(false)} />

      {showFirstRoom && (
        <FirstRoomWelcome onDismiss={() => setShowFirstRoom(false)} />
      )}
    </>
  );
}