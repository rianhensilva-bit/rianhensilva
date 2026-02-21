import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import CategoryTabs from '../components/CategoryTabs';
import PredictionCard from '../components/PredictionCard';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('trending');
  const [language, setLanguage] = useState('pt');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const { data: predictions = [], isLoading, refetch } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.Prediction.list(),
  });

  const handleLogoClick = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery('');
    refetch();
  };

  const filteredPredictions = predictions.filter(pred => {
    const matchesSearch = !searchQuery || 
      pred.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || pred.category === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || pred.subcategory === selectedSubcategory;
    
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    switch (selectedFilter) {
      case 'trending':
        return Math.abs(50 - a.yes_percentage) - Math.abs(50 - b.yes_percentage);
      case 'most_bet':
        return (b.total_volume || 0) - (a.total_volume || 0);
      case 'recent':
        return new Date(b.created_date) - new Date(a.created_date);
      case 'volume':
        return (b.total_volume || 0) - (a.total_volume || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        language={language}
        setLanguage={setLanguage}
        onLogoClick={handleLogoClick}
      />
      
      <CategoryTabs
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubcategory={selectedSubcategory}
        setSelectedSubcategory={setSelectedSubcategory}
        language={language}
      />

      <div className="flex">
        <main className="flex-1 p-8">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">
                {selectedCategory || 'MERCADOS'}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300">
                {sortedPredictions.length} previsões disponíveis
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sortedPredictions.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-zinc-600 dark:text-zinc-300 text-lg">
                  Nenhuma previsão encontrada
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-6">
                {sortedPredictions.map((prediction) => (
                  <PredictionCard key={prediction.id} prediction={prediction} language={language} />
                ))}
              </div>
            )}
          </div>
        </main>

        <Sidebar 
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          predictions={predictions}
          language={language}
        />
      </div>

      <Footer />
    </div>
  );
}