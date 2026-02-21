import React, { useState } from 'react';
import { Search, Sun, Moon, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SocialMediaModal from './SocialMediaModal';
import CreateBetModal from './CreateBetModal';
import LanguageSelector from './LanguageSelector';

export default function Header({ darkMode, toggleDarkMode, searchQuery, setSearchQuery, language, setLanguage, onLogoClick }) {
  const [showSocial, setShowSocial] = useState(false);
  const [showCreateBet, setShowCreateBet] = useState(false);
  const [isHoveringCreate, setIsHoveringCreate] = useState(false);

  const translations = {
    pt: { search: 'Buscar mercados e previsões...', enter: 'Entrar', signup: 'Inscrever-se', createBet: 'Criar Aposta', earnCommission: 'Ganhe Comissão', subtitle: 'ganhe prevendo o futuro!', market: 'MERCADO DE PREVISÕES', social: 'Redes Sociais' },
    en: { search: 'Search markets and predictions...', enter: 'Sign In', signup: 'Sign Up', createBet: 'Create Bet', earnCommission: 'Earn Commission', subtitle: 'earn by predicting the future!', market: 'PREDICTION MARKET', social: 'Social Media' },
    es: { search: 'Buscar mercados y predicciones...', enter: 'Entrar', signup: 'Registrarse', createBet: 'Crear Apuesta', earnCommission: 'Gana Comisión', subtitle: '¡gana prediciendo el futuro!', market: 'MERCADO DE PREDICCIONES', social: 'Redes Sociales' },
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
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Social Media Button */}
            <button
              onClick={() => setShowSocial(true)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.social}
            </button>

            {/* Logo and Tagline */}
            <div className="flex items-center gap-4 ml-8">
              <div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={onLogoClick}
                    className="text-5xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent drop-shadow-lg elegant-font hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    GUANXI
                  </button>
                  <span className="text-base font-semibold text-muted-foreground elegant-font">
                    {t.market}
                  </span>
                </div>
                <p className="text-base text-muted-foreground mt-1 ml-1">
                  {t.subtitle}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl relative">
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
            <div className="flex items-center gap-2">
              <LanguageSelector language={language} setLanguage={setLanguage} />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full h-11 w-11"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-2 border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 font-semibold px-5 h-9 text-sm"
              >
                {t.enter}
              </Button>
              <Button
                onMouseEnter={() => setIsHoveringCreate(true)}
                onMouseLeave={() => setIsHoveringCreate(false)}
                onClick={() => setShowCreateBet(true)}
                className="rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-700 text-black font-bold px-5 shadow-lg h-9 text-sm transition-all"
              >
                {isHoveringCreate ? t.earnCommission : t.createBet}
              </Button>
              <Button
                className="rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-700 text-black font-bold px-5 shadow-lg h-9 text-sm"
              >
                {t.signup}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <SocialMediaModal isOpen={showSocial} onClose={() => setShowSocial(false)} language={language} />
      <CreateBetModal isOpen={showCreateBet} onClose={() => setShowCreateBet(false)} language={language} />
    </>
  );
}