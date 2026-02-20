import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import TagsNav from "@/components/market/TagsNav";
import PredictionCard from "@/components/market/PredictionCard";
import Sidebar from "@/components/market/Sidebar";
import { PREDICTIONS } from "@/components/market/predictionsData";
import { BarChart3, Globe } from "lucide-react";

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [activeSubtag, setActiveSubtag] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredPredictions = useMemo(() => {
    let filtered = PREDICTIONS;

    if (activeTag) {
      filtered = filtered.filter((p) => p.tag === activeTag);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tag.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [activeTag, searchQuery]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        {/* Hero Stats */}
        <div className={`rounded-2xl border p-6 mb-6 ${darkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-zinc-100" : "text-zinc-800"}`}>
                Mercados de Previsão
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>
                Negocie nas previsões dos eventos mais importantes do mundo
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" style={{ color: "#D4A843" }} />
                  <span className="text-lg font-bold" style={{ color: "#D4A843" }}>R$48.2M</span>
                </div>
                <span className={`text-[11px] ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}>Volume Total</span>
              </div>
              <div className={`w-px h-8 ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}`} />
              <div className="text-center">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" style={{ color: "#D4A843" }} />
                  <span className="text-lg font-bold" style={{ color: "#D4A843" }}>247k</span>
                </div>
                <span className={`text-[11px] ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}>Traders Ativos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags Navigation */}
        <div className={`rounded-2xl border p-4 mb-6 ${darkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"}`}>
          <TagsNav
            activeTag={activeTag}
            setActiveTag={setActiveTag}
            activeSubtag={activeSubtag}
            setActiveSubtag={setActiveSubtag}
            darkMode={darkMode}
          />
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Prediction Grid */}
          <div className="flex-1">
            {activeTag && (
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? "text-zinc-200" : "text-zinc-700"}`}>
                  {activeTag}
                  {activeSubtag && (
                    <span className={`text-sm font-normal ml-2 ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}>
                      / {activeSubtag}
                    </span>
                  )}
                </h3>
                <span className={`text-sm ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}>
                  {filteredPredictions.length} mercados
                </span>
              </div>
            )}

            {filteredPredictions.length === 0 ? (
              <div className={`text-center py-16 rounded-2xl border ${darkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"}`}>
                <p className={`text-lg font-medium ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}>
                  Nenhum mercado encontrado
                </p>
                <p className={`text-sm mt-1 ${darkMode ? "text-zinc-600" : "text-zinc-400"}`}>
                  Tente ajustar os filtros ou pesquisa
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPredictions.map((prediction, idx) => (
                  <PredictionCard key={idx} prediction={prediction} darkMode={darkMode} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[340px] shrink-0">
            <Sidebar darkMode={darkMode} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-12 border-t py-8 ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-2xl font-black" style={{ color: "#D4A843" }}>GUANXI</span>
            <p className={`text-sm ${darkMode ? "text-zinc-600" : "text-zinc-400"}`}>
              © 2026 Guanxi. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}