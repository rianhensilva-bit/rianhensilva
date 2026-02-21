import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  {
    name: 'Política',
    nameEn: 'Politics',
    nameEs: 'Política',
    nameHi: 'राजनीति',
    nameAr: 'سياسة',
    nameZh: '政治',
    nameFr: 'Politique',
    nameRu: 'Политика',
    nameDe: 'Politik',
    nameJa: '政治',
    color: '#3B82F6',
    subcategories: ['Eleições', 'Partidos', 'Corrupção', 'Legislação', 'Governo']
  },
  {
    name: 'Esporte',
    nameEn: 'Sports',
    nameEs: 'Deportes',
    nameHi: 'खेल',
    nameAr: 'رياضة',
    nameZh: '体育',
    nameFr: 'Sports',
    nameRu: 'Спорт',
    nameDe: 'Sport',
    nameJa: 'スポーツ',
    color: '#F97316',
    subcategories: ['Times', 'Campeonatos', 'Copa do Mundo', 'Olimpíadas', 'Transferências']
  },
  {
    name: 'Cultura',
    nameEn: 'Culture',
    nameEs: 'Cultura',
    nameHi: 'संस्कृति',
    nameAr: 'ثقافة',
    nameZh: '文化',
    nameFr: 'Culture',
    nameRu: 'Культура',
    nameDe: 'Kultur',
    nameJa: '文化',
    color: '#A855F7',
    subcategories: ['Cinema', 'Música', 'Literatura', 'Arte', 'Entretenimento']
  },
  {
    name: 'Crypto',
    nameEn: 'Crypto',
    nameEs: 'Cripto',
    nameHi: 'क्रिप्टो',
    nameAr: 'عملات رقمية',
    nameZh: '加密货币',
    nameFr: 'Crypto',
    nameRu: 'Крипто',
    nameDe: 'Krypto',
    nameJa: '暗号通貨',
    color: '#EAB308',
    subcategories: ['Bitcoin', 'Ethereum', 'NFTs', 'DeFi', 'Regulação']
  },
  {
    name: 'Clima',
    nameEn: 'Climate',
    nameEs: 'Clima',
    nameHi: 'जलवायु',
    nameAr: 'مناخ',
    nameZh: '气候',
    nameFr: 'Climat',
    nameRu: 'Климат',
    nameDe: 'Klima',
    nameJa: '気候',
    color: '#14B8A6',
    subcategories: ['Temperatura', 'Chuvas', 'Eventos Extremos', 'Mudanças Climáticas', 'Previsões']
  },
  {
    name: 'Economia',
    nameEn: 'Economy',
    nameEs: 'Economía',
    nameHi: 'अर्थव्यवस्था',
    nameAr: 'اقتصاد',
    nameZh: '经济',
    nameFr: 'Économie',
    nameRu: 'Экономика',
    nameDe: 'Wirtschaft',
    nameJa: '経済',
    color: '#10B981',
    subcategories: ['Inflação', 'PIB', 'Juros', 'Desemprego', 'Mercados']
  },
  {
    name: 'Menções',
    nameEn: 'Mentions',
    nameEs: 'Menciones',
    nameHi: 'उल्लेख',
    nameAr: 'إشارات',
    nameZh: '提及',
    nameFr: 'Mentions',
    nameRu: 'Упоминания',
    nameDe: 'Erwähnungen',
    nameJa: '言及',
    color: '#EC4899',
    subcategories: ['Personalidades', 'Influencers', 'Políticos', 'Celebridades', 'Trending']
  },
  {
    name: 'Companhias',
    nameEn: 'Companies',
    nameEs: 'Empresas',
    nameHi: 'कंपनियां',
    nameAr: 'شركات',
    nameZh: '公司',
    nameFr: 'Entreprises',
    nameRu: 'Компании',
    nameDe: 'Unternehmen',
    nameJa: '企業',
    color: '#6366F1',
    subcategories: ['IPOs', 'Fusões', 'Falências', 'Lucros', 'Inovações']
  },
  {
    name: 'Finanças',
    nameEn: 'Finance',
    nameEs: 'Finanzas',
    nameHi: 'वित्त',
    nameAr: 'مالية',
    nameZh: '金融',
    nameFr: 'Finance',
    nameRu: 'Финансы',
    nameDe: 'Finanzen',
    nameJa: '金融',
    color: '#EF4444',
    subcategories: ['Ações', 'Fundos', 'Commodities', 'Câmbio', 'Investimentos']
  },
  {
    name: 'Tecnologia & Ciência',
    nameEn: 'Tech & Science',
    nameEs: 'Tecnología y Ciencia',
    nameHi: 'प्रौद्योगिकी और विज्ञान',
    nameAr: 'التكنولوجيا والعلوم',
    nameZh: '科技与科学',
    nameFr: 'Tech & Science',
    nameRu: 'Технологии и Наука',
    nameDe: 'Technologie & Wissenschaft',
    nameJa: 'テクノロジーと科学',
    color: '#22C55E',
    subcategories: ['IA', 'Startups', 'Descobertas', 'Inovação', 'Pesquisa']
  },
  {
    name: 'Guerras',
    nameEn: 'Wars',
    nameEs: 'Guerras',
    nameHi: 'युद्ध',
    nameAr: 'حروب',
    nameZh: '战争',
    nameFr: 'Guerres',
    nameRu: 'Войны',
    nameDe: 'Kriege',
    nameJa: '戦争',
    color: '#64748B',
    subcategories: ['Conflitos Internacionais', 'Tensões Geopolíticas', 'Acordos de Paz', 'Sanções', 'Alianças Militares']
  },
  {
    name: 'Mortes',
    nameEn: 'Deaths',
    nameEs: 'Muertes',
    nameHi: 'मृत्यु',
    nameAr: 'وفيات',
    nameZh: '死亡',
    nameFr: 'Décès',
    nameRu: 'Смерти',
    nameDe: 'Todesfälle',
    nameJa: '死',
    color: '#475569',
    subcategories: ['Celebridades', 'Políticos Idosos', 'Monarcas', 'Ícones da Cultura', 'Líderes Mundiais']
  },
  {
    name: 'Escândalos',
    nameEn: 'Scandals',
    nameEs: 'Escándalos',
    nameHi: 'घोटाले',
    nameAr: 'فضائح',
    nameZh: '丑闻',
    nameFr: 'Scandales',
    nameRu: 'Скандалы',
    nameDe: 'Skandale',
    nameJa: 'スキャンダル',
    color: '#F43F5E',
    subcategories: ['Políticos', 'Celebridades', 'Empresários', 'Esportistas', 'Vazamentos']
  },
  {
    name: 'Improváveis',
    nameEn: 'Unlikely',
    nameEs: 'Improbables',
    nameHi: 'असंभावित',
    nameAr: 'غير محتمل',
    nameZh: '不太可能',
    nameFr: 'Improbables',
    nameRu: 'Маловероятные',
    nameDe: 'Unwahrscheinlich',
    nameJa: 'ありそうもない',
    color: '#8B5CF6',
    subcategories: ['Eventos Sobrenaturais', 'Aliens', 'Fenômenos Inexplicáveis', 'Profecias', 'Teorias da Conspiração']
  }
];

export { CATEGORIES };

export default function CategoryTabs({ selectedCategory, setSelectedCategory, selectedSubcategory, setSelectedSubcategory, language }) {
  const [hoveredCategory, setHoveredCategory] = useState('Política');

  useEffect(() => {
    if (!hoveredCategory) {
      setHoveredCategory('Política');
    }
  }, [hoveredCategory]);

  const currentCategory = CATEGORIES.find(c => c.name === hoveredCategory);
  
  const getCategoryName = (category) => {
    const langMap = {
      en: category.nameEn,
      es: category.nameEs,
      hi: category.nameHi,
      ar: category.nameAr,
      zh: category.nameZh,
      fr: category.nameFr,
      ru: category.nameRu,
      de: category.nameDe,
      ja: category.nameJa
    };
    return langMap[language] || category.name;
  };

  return (
    <div className="border-b bg-background/50 backdrop-blur">
      <div className="container mx-auto px-6">
        {/* Main Categories */}
        <div className="flex flex-wrap items-center gap-2 py-4">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.name;
            return (
              <button
                key={category.name}
                onMouseEnter={() => setHoveredCategory(category.name)}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setSelectedSubcategory(null);
                }}
                className="px-5 py-2.5 rounded-full border-2 font-semibold text-sm whitespace-nowrap transition-all hover:scale-105"
                style={{
                  backgroundColor: isActive ? category.color : 'transparent',
                  borderColor: `${category.color}40`,
                  color: isActive ? '#fff' : category.color
                }}
              >
                {getCategoryName(category)}
              </button>
            );
          })}
        </div>

        {/* Subcategories - Always visible */}
        <div className="pb-4 pt-2 min-h-[44px]">
          <div className="flex flex-wrap items-center gap-2">
            {currentCategory?.subcategories.map((sub) => {
              const isActiveSub = selectedSubcategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => {
                    setSelectedCategory(currentCategory.name);
                    setSelectedSubcategory(sub);
                  }}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isActiveSub ? currentCategory.color : `${currentCategory.color}15`,
                    color: isActiveSub ? '#fff' : currentCategory.color
                  }}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}