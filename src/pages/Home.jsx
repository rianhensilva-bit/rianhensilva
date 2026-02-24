import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import CategoryTabs from '../components/CategoryTabs';
import RoomCard from '../components/RoomCard';
import RoomAccessModal from '../components/RoomAccessModal';
import Footer from '../components/Footer';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [language, setLanguage] = useState('pt');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showAccessModal, setShowAccessModal] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const { data: rooms = [], isLoading, refetch } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => base44.entities.Room.list(),
  });

  const handleLogoClick = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery('');
    refetch();
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = !searchQuery || 
      room.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || room.secondary_label === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || room.primary_label === selectedSubcategory;

    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setShowAccessModal(true);
  };

  const handleAccessGranted = () => {
    setShowAccessModal(false);
    // TODO: Redirecionar para a página da sala
  };

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

      <div className="container mx-auto px-8 py-12" style={{ maxWidth: '1400px' }}>
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2 text-zinc-900 dark:text-zinc-50 elegant-font">
            SALAS PRIVADAS
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 text-lg">
            {filteredRooms.length} salas disponíveis
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-600 dark:text-zinc-300 text-lg">
              Nenhuma sala encontrada
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard 
                key={room.id} 
                room={room}
                onRoomClick={handleRoomClick}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />

      <RoomAccessModal
        room={selectedRoom}
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        onAccessGranted={handleAccessGranted}
      />
    </div>
  );
}