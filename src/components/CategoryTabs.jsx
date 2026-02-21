import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  {
    name: 'Política',
    color: 'blue',
    subcategories: ['Eleições', 'Partidos', 'Corrupção', 'Legislação', 'Governo']
  },
  {
    name: 'Esporte',
    color: 'orange',
    subcategories: ['Times', 'Campeonatos', 'Copa do Mundo', 'Olimpíadas', 'Transferências']
  },
  {
    name: 'Cultura',
    color: 'purple',
    subcategories: ['Cinema', 'Música', 'Literatura', 'Arte', 'Entretenimento']
  },
  {
    name: 'Crypto',
    color: 'amber',
    subcategories: ['Bitcoin', 'Ethereum', 'NFTs', 'DeFi', 'Regulação']
  },
  {
    name: 'Clima',
    color: 'cyan',
    subcategories: ['Temperatura', 'Chuvas', 'Eventos Extremos', 'Mudanças Climáticas', 'Previsões']
  },
  {
    name: 'Economia',
    color: 'teal',
    subcategories: ['Inflação', 'PIB', 'Juros', 'Desemprego', 'Mercados']
  },
  {
    name: 'Menções',
    color: 'pink',
    subcategories: ['Personalidades', 'Influencers', 'Políticos', 'Celebridades', 'Trending']
  },
  {
    name: 'Companhias',
    color: 'indigo',
    subcategories: ['IPOs', 'Fusões', 'Falências', 'Lucros', 'Inovações']
  },
  {
    name: 'Finanças',
    color: 'red',
    subcategories: ['Ações', 'Fundos', 'Commodities', 'Câmbio', 'Investimentos']
  },
  {
    name: 'Tecnologia & Ciência',
    color: 'green',
    subcategories: ['IA', 'Startups', 'Descobertas', 'Inovação', 'Pesquisa']
  },
  {
    name: 'Guerras',
    color: 'slate',
    subcategories: ['Conflitos Internacionais', 'Tensões Geopolíticas', 'Acordos de Paz', 'Sanções', 'Alianças Militares']
  },
  {
    name: 'Mortes',
    color: 'zinc',
    subcategories: ['Celebridades', 'Políticos Idosos', 'Monarcas', 'Ícones da Cultura', 'Líderes Mundiais']
  },
  {
    name: 'Escândalos',
    color: 'rose',
    subcategories: ['Políticos', 'Celebridades', 'Empresários', 'Esportistas', 'Vazamentos']
  },
  {
    name: 'Improváveis',
    color: 'violet',
    subcategories: ['Eventos Sobrenaturais', 'Aliens', 'Fenômenos Inexplicáveis', 'Profecias', 'Teorias da Conspiração']
  }
];

const colorClasses = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20',
  teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20 hover:bg-teal-500/20',
  pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20 hover:bg-pink-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20',
  slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 hover:bg-slate-500/20',
  zinc: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 hover:bg-violet-500/20'
};

export { CATEGORIES };

export default function CategoryTabs({ selectedCategory, setSelectedCategory, selectedSubcategory, setSelectedSubcategory }) {
  const [hoveredCategory, setHoveredCategory] = useState('Política');

  useEffect(() => {
    if (!hoveredCategory) {
      setHoveredCategory('Política');
    }
  }, [hoveredCategory]);

  const currentCategory = CATEGORIES.find(c => c.name === hoveredCategory);

  return (
    <div className="border-b bg-background/50 backdrop-blur">
      <div className="container mx-auto px-6">
        {/* Main Categories */}
        <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
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
                className={`
                  px-5 py-2.5 rounded-full border-2 font-semibold text-sm whitespace-nowrap transition-all
                  ${colorClasses[category.color]}
                  ${isActive ? 'ring-2 ring-offset-2 ring-offset-background' : ''}
                `}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Subcategories - Always visible */}
        <div className="pb-4 pt-2 min-h-[44px]">
          <div className="flex items-center gap-2">
            {currentCategory?.subcategories.map((sub) => {
              const isActiveSub = selectedSubcategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => {
                    setSelectedCategory(currentCategory.name);
                    setSelectedSubcategory(sub);
                  }}
                  className={`
                    px-4 py-1.5 rounded-full text-sm font-medium transition-all
                    bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground
                    ${isActiveSub ? 'bg-foreground text-background' : ''}
                  `}
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