import React from 'react';
import { Search, Sun, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Header({ darkMode, toggleDarkMode, searchQuery, setSearchQuery }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent drop-shadow-lg">
              GUANXI
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar mercados e previsões..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full border-2 bg-background/50 focus:bg-background transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full h-10 w-10"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-2 border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 font-semibold px-6"
            >
              Entrar
            </Button>
            <Button
              className="rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-700 text-black font-bold px-6 shadow-lg"
            >
              Inscrever-se
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}