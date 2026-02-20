import React, { useState } from "react";
import { Flame, BarChart3, Clock, TrendingUp } from "lucide-react";

const SIDEBAR_TABS = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "most_bet", label: "Mais Apostados", icon: BarChart3 },
  { id: "recent", label: "Recém Criados", icon: Clock },
  { id: "volume", label: "Maiores Volumes", icon: TrendingUp },
];

const SIDEBAR_DATA = {
  trending: [
    { title: "Bitcoin vai atingir $200k em 2026?", percent: 42, color: "#F97316" },
    { title: "Brasil vai sediar as Olimpíadas 2036?", percent: 28, color: "#EF4444" },
    { title: "IA vai substituir programadores até 2030?", percent: 65, color: "#22C55E" },
  ],
  most_bet: [
    { title: "Lula será reeleito em 2026?", percent: 38, color: "#3B82F6" },
    { title: "Flamengo vai ganhar a Libertadores?", percent: 55, color: "#EF4444" },
    { title: "Tesla vai valer $2 trilhões?", percent: 31, color: "#6366F1" },
  ],
  recent: [
    { title: "Vai nevar em São Paulo em 2026?", percent: 5, color: "#14B8A6" },
    { title: "Netflix vai lançar jogos AAA?", percent: 22, color: "#A855F7" },
    { title: "Fed vai cortar juros no Q3?", percent: 61, color: "#EAB308" },
  ],
  volume: [
    { title: "Ethereum vai ultrapassar $10k?", percent: 34, color: "#F97316" },
    { title: "Eleições EUA: Republicanos vencem?", percent: 52, color: "#3B82F6" },
    { title: "Apple vai lançar carro elétrico?", percent: 18, color: "#6366F1" },
  ],
};

export default function Sidebar({ darkMode }) {
  const [activeTab, setActiveTab] = useState("trending");

  return (
    <div className={`rounded-2xl border p-5 ${
      darkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200"
    }`}>
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {SIDEBAR_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "text-white shadow-md"
                  : darkMode
                    ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                    : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              }`}
              style={isActive ? { background: "linear-gradient(135deg, #D4A843, #B8912E)" } : {}}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {SIDEBAR_DATA[activeTab].map((item, idx) => (
          <div
            key={idx}
            className={`group p-3.5 rounded-xl transition-all cursor-pointer ${
              darkMode ? "hover:bg-zinc-800/80" : "hover:bg-zinc-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className={`text-sm font-medium leading-snug flex-1 ${
                darkMode ? "text-zinc-200" : "text-zinc-700"
              }`}>
                {item.title}
              </p>
              <span
                className="shrink-0 px-2 py-0.5 rounded-md text-xs font-bold"
                style={{ backgroundColor: `${item.color}15`, color: item.color }}
              >
                {item.percent}%
              </span>
            </div>
            <div className={`mt-2 h-1 rounded-full overflow-hidden ${darkMode ? "bg-zinc-800" : "bg-zinc-100"}`}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${item.percent}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}