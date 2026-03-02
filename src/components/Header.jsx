import React, { useState } from 'react';
import { Search, Sun, Moon, Globe, Bell } from 'lucide-react';
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
import LanguageSelector from './LanguageSelector';
import MyRoomsModal from './MyRoomsModal';

export default function Header({ darkMode, toggleDarkMode, searchQuery, setSearchQuery, language, setLanguage, onLogoClick }) {
  const [showSocial, setShowSocial] = useState(false);
  const [showCreateBet, setShowCreateBet] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [isHoveringCreate, setIsHoveringCreate] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'manager', 'player', or null
  const [showMyRooms, setShowMyRooms] = useState(false);

  const translations = {
    pt: { search: 'Buscar salas de comunidades', enter: 'Entrar', signup: 'Inscrever-se', becomeManager: 'Tornar-se Gerente', manageRoom: 'Gerenciar Minha Sala', myRooms: 'Acessar Minhas Salas', createBet: 'Criar Aposta', earnCommission: 'Ganhe Comissão', subtitle: 'SUAS PREVISÕES VALEM OURO', market: 'MERCADO DE PREVISÕES', social: 'SOCIAIS' },
    en: { search: 'Search markets and predictions...', enter: 'Sign In', signup: 'Sign Up', becomeManager: 'Become Manager', createBet: 'Create Bet', earnCommission: 'Earn Commission', subtitle: 'EARN BY PREDICTING THE FUTURE', market: 'PREDICTION MARKET', social: 'Social Media' },
    es: { search: 'Buscar mercados y predicciones...', enter: 'Entrar', signup: 'Registrarse', createBet: 'Crear Apuesta', earnCommission: 'Gana Comisión', subtitle: '¡GANA PREDICIENDO EL FUTURO!', market: 'MERCADO DE PREDICCIONES', social: 'Redes Sociales' },
    hi: { search: 'बाज़ार और भविष्यवाणियाँ खोजें...', enter: 'प्रवेश', signup: 'साइन अप', createBet: 'बेट बनाएं', earnCommission: 'कमीशन कमाएं', subtitle: 'भविष्य की भविष्यवाणी करके कमाएं!', market: 'भविष्यवाणी बाज़ार', social: 'सोशल मीडिया' },
    ar: { search: '...ابحث عن الأسواق والتوقعات', enter: 'دخول', signup: 'تسجيل', createBet: 'إنشاء رهان', earnCommission: 'اربح عمولة', subtitle: '!اربح من خلال التنبؤ بالمستقبل', market: 'سوق التوقعات', social: 'وسائل التواصل' },
    zh: { search: '搜索市场和预测...', enter: '登录', signup: '注册', createBet: '创建投注', earnCommission: '赚取佣金', subtitle: '通过预测未来赚钱！', market: '预测市场', social: '社交媒体' },
    fr: { search: 'Rechercher des marchés...', enter: 'Connexion', signup: 'S\'inscrire', createBet: 'Créer un Pari', earnCommission: 'Gagner une Commission', subtitle: 'gagnez en prédisant l\'avenir!', market: 'MARCHÉ DE PRÉDICTIONS', social: 'Réseaux Sociaux' },
    ru: { search: 'Поиск рынков и прогнозов...', enter: 'Войти', signup: 'Регистрация', createBet: 'Создать Ставку', earnCommission: 'Заработать Комиссию', subtitle: 'зарабатывайте, предсказывая будущее!', market: 'РЫНОК ПРОГНОЗОВ', social: 'Социальные сети' },
    de: { search: 'Märkte durchsuchen...', enter: 'Anmelden', signup: 'Registrieren', createBet: 'Wette Erstellen', earnCommission: 'Provision Verdienen', subtitle: 'verdienen Sie, indem Sie die Zukunft vorhersagen!', market: 'VORHERSAGEMARKT', social: 'Soziale Medien' },
    ja: { search: '市場と予測を検索...', enter: 'ログイン', signup: 'サインアップ', createBet: 'ベットを作成', earnCommission: '手数料を獲得', subtitle: '未来を予測して稼ごう！', market: '予測市場', social: 'ソーシャルメディア' }
  };

  const t = translations[language] || translations.pt;

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
                    GUANXI
                  </button>
                  <span className="hidden md:block text-base font-bold elegant-font text-zinc-800 dark:text-zinc-100">
                    {t.market}
                  </span>
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
                    className="rounded-full border-2 border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 font-semibold px-3 md:px-5 h-8 md:h-9 text-xs md:text-sm"
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