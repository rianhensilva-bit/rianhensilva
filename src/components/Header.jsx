import React from "react";
import { Search, Sun, Moon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Header({ darkMode, setDarkMode, searchQuery, setSearchQuery, mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${darkMode ? "bg-zinc-950/90 border-zinc-800" : "bg-white/90 border-zinc-200"}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "#D4A843", textShadow: "0 0 20px rgba(212,168,67,0.3)" }}>
              GUANXI
            </h1>
          </div>

          {/* Search - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-zinc-500" : "text-zinc-400"}`} />
              <Input
                placeholder="Pesquisar mercados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 h-10 rounded-full border ${
                  darkMode
                    ? "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-[#D4A843]/50"
                    : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-[#D4A843]/50"
                } focus:ring-1 focus:ring-[#D4A843]/20`}
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-all ${darkMode ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-full border-[#D4A843]/40 text-[#D4A843] hover:bg-[#D4A843]/10 hover:border-[#D4A843] font-semibold"
              >
                Entrar
              </Button>
              <Button
                className="rounded-full font-semibold"
                style={{ background: "linear-gradient(135deg, #D4A843, #B8912E)", color: "#fff" }}
              >
                Inscrever-se
              </Button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-zinc-500" : "text-zinc-400"}`} />
              <Input
                placeholder="Pesquisar mercados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 h-10 rounded-full ${
                  darkMode ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-zinc-50 border-zinc-200"
                }`}
              />
            </div>
            <div className="flex gap-2 sm:hidden">
              <Button variant="outline" className="flex-1 rounded-full border-[#D4A843]/40 text-[#D4A843] font-semibold">
                Entrar
              </Button>
              <Button className="flex-1 rounded-full font-semibold" style={{ background: "linear-gradient(135deg, #D4A843, #B8912E)", color: "#fff" }}>
                Inscrever-se
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}