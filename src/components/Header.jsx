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

export default function Header({ darkMode, toggleDarkMode, searchQuery, setSearchQuery, language, setLanguage, onLogoClick }) {
  const [showSocial, setShowSocial] = useState(false);
  const [showCreateBet, setShowCreateBet] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [userRole, setUserRole] = useState(() => localStorage.getItem('galore_role') || null);
  const [managerRoomId, setManagerRoomId] = useState(() => localStorage.getItem('galore_manager_room_id') || null);
  const [showMyRooms, setShowMyRooms] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showFirstRoom, setShowFirstRoom] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const t = {
    search: 'Buscar salas de comunidades',
    enter: 'Entrar',
    becomeManager: 'Tornar-se Gerente',
    manageRoom: 'Acessar Dashboard',
    myRooms: 'Acessar Minhas Salas',
    subtitle: 'MERCADO DE RATEIO E PREVISÕES PROGNÓSTICAS',
    social: 'SOCIAIS'
  };

  const handleLoginAs = (role) => {
    const isFirstTime = !localStorage.getItem('galore_role');
    localStorage.setItem('galore_role', role);
    setUserRole(role);
    setShowWelcomeBack(true);
    setTimeout(() => setShowWelcomeBack(false), 3000);
    if (role === 'manager' && isFirstTime) {
      setShowFirstRoom(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-3 md:px-6 py-3 md:py-5">
          <div className="flex items-center justify-between gap-2 md:gap-6">
            {/* Social Media Button - Hidden no Mobile */}
            <button
              onClick={() => setShowSocial(true)}
              className="hidden md:block text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-foreground transition-colors"
            >
              {t.social}
            </button>

            {/* Logo and Tagline */}
            <div className="flex items-center gap-2 md:gap-4 md:ml-8">
              <div>
                <div className="flex items-center gap-2 md:gap-4">
                  <button 
                    onClick={onLogoClick}
                    className="text-2xl md:text-5xl font-black tracking-tight elegant-font hover:opacity-90 transition-opacity cursor-pointer dark:border-transparent border-black"
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

                </div>
                <p className="hidden md:block text-base font-semibold text-zinc-800 dark:text-zinc-100 mt-1 ml-1 uppercase">
                  {t.subtitle}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl relative" style={{ marginTop: '4px' }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-lg border-2 bg-background/50 focus:bg-background transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <div className="hidden md:block">
                <LanguageSelector language={language} setLanguage={setLanguage} />
              </div>
              <NotificationCenter />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full h-8 w-8 md:h-11 md:w-11"
              >
                {darkMode ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full border-2 font-bold px-3 md:px-5 h-8 md:h-9 text-xs md:text-sm"
                    style={{ borderColor: '#D4AF37', color: '#D4AF37' }}
                  >
                    {t.enter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => { setShowSignup(true); setUserRole('player'); }}>
                    JOGADOR
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setShowManager(true); setUserRole('manager'); }}>
                    GERENTE
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {userRole === 'manager' ? (
                <Button
                  onClick={() => window.location.href = '/ManagerDashboard?roomId=699e308fcbde9d531c720b2e'}
                  variant="outline"
                  className="hidden md:inline-flex rounded-full border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold px-5 h-9 text-sm"
                >
                  {t.manageRoom}
                </Button>
              ) : userRole === 'player' ? (
                <Button
                  onClick={() => setShowMyRooms(true)}
                  variant="outline"
                  className="hidden md:inline-flex rounded-full border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold px-5 h-9 text-sm"
                >
                  {t.myRooms}
                </Button>
              ) : (
                <Button
                  onClick={() => setShowManager(true)}
                  variant="outline"
                  className="hidden md:inline-flex rounded-full border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold px-5 h-9 text-sm"
                >
                  {t.becomeManager}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <SocialMediaModal isOpen={showSocial} onClose={() => setShowSocial(false)} language={language} />
      <CreateBetModal isOpen={showCreateBet} onClose={() => setShowCreateBet(false)} language={language} />
      <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} language={language} />
      <BecomeManagerModal isOpen={showManager} onClose={() => setShowManager(false)} />
      <MyRoomsModal isOpen={showMyRooms} onClose={() => setShowMyRooms(false)} />

      </>
      );
      }