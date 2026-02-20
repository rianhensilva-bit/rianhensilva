import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import CategoryTabs from '../components/CategoryTabs';
import PredictionCard from '../components/PredictionCard';
import Sidebar from '../components/Sidebar';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('trending');

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Fetch predictions
  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.Prediction.list(),
  });

  // Filter predictions
  const filteredPredictions = predictions.filter(pred => {
    const matchesSearch = !searchQuery || 
      pred.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || pred.category === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || pred.subcategory === selectedSubcategory;
    
    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  // Sort by filter
  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    switch (selectedFilter) {
      case 'trending':
        return (b.yes_percentage + b.no_percentage) - (a.yes_percentage + a.no_percentage);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <CategoryTabs
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubcategory={selectedSubcategory}
        setSelectedSubcategory={setSelectedSubcategory}
      />

      <div className="flex">
        <Sidebar 
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />

        <main className="flex-1 p-8">
          <div className="container mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">
                {selectedCategory || 'Todos os Mercados'}
              </h2>
              <p className="text-muted-foreground">
                {sortedPredictions.length} previsões disponíveis
              </p>
            </div>

            {/* Predictions Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sortedPredictions.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  Nenhuma previsão encontrada
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedPredictions.map((prediction) => (
                  <PredictionCard key={prediction.id} prediction={prediction} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}