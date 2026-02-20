import React, { useState } from "react";

const TAGS = [
  {
    name: "Política",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
    subtags: ["Eleições", "Partidos", "Corrupção", "Legislação", "Governo", "Diplomacia"]
  },
  {
    name: "Esporte",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.1)",
    subtags: ["Times", "Campeonatos", "Copa do Mundo", "Olimpíadas", "Transferências", "MMA"]
  },
  {
    name: "Cultura",
    color: "#A855F7",
    bg: "rgba(168,85,247,0.1)",
    subtags: ["Cinema", "Música", "Celebridades", "Prêmios", "Séries", "Livros"]
  },
  {
    name: "Crypto",
    color: "#F97316",
    bg: "rgba(249,115,22,0.1)",
    subtags: ["Bitcoin", "Ethereum", "Altcoins", "DeFi", "NFTs", "Regulação"]
  },
  {
    name: "Clima",
    color: "#14B8A6",
    bg: "rgba(20,184,166,0.1)",
    subtags: ["Temperatura", "Furacões", "Secas", "Enchentes", "Previsões", "Mudanças Climáticas"]
  },
  {
    name: "Economia",
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    subtags: ["PIB", "Inflação", "Juros", "Câmbio", "Emprego", "Comércio"]
  },
  {
    name: "Mansões",
    color: "#F43F5E",
    bg: "rgba(244,63,94,0.1)",
    subtags: ["Imóveis de Luxo", "Leilões", "Celebridades", "Mercado Imobiliário", "Decoração", "Arquitetura"]
  },
  {
    name: "Companhias",
    color: "#6366F1",
    bg: "rgba(99,102,241,0.1)",
    subtags: ["Startups", "IPOs", "Fusões", "CEOs", "Lucros", "Demissões"]
  },
  {
    name: "Finanças",
    color: "#EAB308",
    bg: "rgba(234,179,8,0.1)",
    subtags: ["Bolsa", "Ações", "Fundos", "Dividendos", "Renda Fixa", "Commodities"]
  },
  {
    name: "Tech & Ciência",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.1)",
    subtags: ["IA", "Espaço", "Robótica", "Medicina", "Energia", "Gadgets"]
  }
];

export { TAGS };

export default function TagsNav({ activeTag, setActiveTag, activeSubtag, setActiveSubtag, darkMode }) {
  const [hoveredTag, setHoveredTag] = useState(null);

  const currentTag = TAGS.find(t => t.name === (hoveredTag || activeTag));

  return (
    <div className="w-full">
      {/* Main Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => { setActiveTag(null); setActiveSubtag(null); }}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !activeTag
              ? "text-white shadow-lg"
              : darkMode
                ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
          }`}
          style={!activeTag ? { background: "linear-gradient(135deg, #D4A843, #B8912E)" } : {}}
        >
          Todos
        </button>
        {TAGS.map((tag) => {
          const isActive = activeTag === tag.name;
          return (
            <button
              key={tag.name}
              onClick={() => { setActiveTag(tag.name); setActiveSubtag(null); }}
              onMouseEnter={() => setHoveredTag(tag.name)}
              onMouseLeave={() => setHoveredTag(null)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive ? "text-white shadow-lg" : ""
              }`}
              style={
                isActive
                  ? { backgroundColor: tag.color, boxShadow: `0 4px 14px ${tag.color}33` }
                  : {
                      backgroundColor: darkMode ? "transparent" : "transparent",
                      color: darkMode ? "#a1a1aa" : "#71717a",
                    }
              }
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = tag.bg;
                  e.currentTarget.style.color = tag.color;
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = darkMode ? "#a1a1aa" : "#71717a";
                }
              }}
            >
              {tag.name}
            </button>
          );
        })}
      </div>

      {/* Subtags */}
      <div className={`mt-2 min-h-[36px] flex items-center gap-2 overflow-x-auto scrollbar-hide transition-all duration-300`}>
        {currentTag && currentTag.subtags.map((sub) => {
          const isActiveSub = activeSubtag === sub;
          return (
            <button
              key={sub}
              onClick={() => {
                setActiveTag(currentTag.name);
                setActiveSubtag(sub);
              }}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={
                isActiveSub
                  ? { backgroundColor: currentTag.color, color: "#fff" }
                  : {
                      backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : currentTag.bg,
                      color: currentTag.color,
                    }
              }
            >
              {sub}
            </button>
          );
        })}
        {!currentTag && (
          <span className={`text-xs ${darkMode ? "text-zinc-600" : "text-zinc-400"}`}>
            Passe o mouse sobre uma categoria para ver as subcategorias
          </span>
        )}
      </div>
    </div>
  );
}