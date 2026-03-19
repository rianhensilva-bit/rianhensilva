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
    name: 'Variados',
    nameEn: 'Various',
    nameEs: 'Variados',
    nameHi: 'विविध',
    nameAr: 'متنوعة',
    nameZh: '杂项',
    nameFr: 'Divers',
    nameRu: 'Разное',
    nameDe: 'Verschiedenes',
    nameJa: 'その他',
    color: '#78716C',
    subcategories: ['Geral', 'Curiosidades', 'Cotidiano', 'Humor', 'Outros']
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

export default function CategoryTabs({ selectedCategory, setSelectedCategory, language }) {
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
    <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto px-3 md:px-6">
        {/* Categorias Principais - Estilo Kalshi Clean */}
        <div className="flex items-center gap-2 md:gap-3 py-4 overflow-x-scroll md:overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.name;
            return (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(isActive ? null : category.name)}
                className="px-4 md:px-5 py-2 rounded-lg font-semibold text-sm md:text-base whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  backgroundColor: isActive ? category.color : 'transparent',
                  color: isActive ? '#fff' : category.color,
                  border: `1.5px solid ${category.color}${isActive ? '' : '40'}`
                }}
              >
                {getCategoryName(category)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}