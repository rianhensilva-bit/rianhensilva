import GuidedTour from '@/components/GuidedTour';
import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import CategoryTabs from '../components/CategoryTabs';
import RoomCard from '../components/RoomCard';
import RoomAccessModal from '../components/RoomAccessModal';
import RoomSidebar from '../components/RoomSidebar';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import { Loader2 } from 'lucide-react';

const ROOMS_PER_PAGE = 9;

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [language, setLanguage] = useState('pt');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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
    setSearchQuery('');
    setCurrentPage(1);
    refetch();
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const filteredRooms = useMemo(() => rooms.filter(room => {
    const roomData = room.data || room;
    const matchesSearch = !searchQuery || 
      roomData.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || roomData.secondary_label === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [rooms, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE);
  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * ROOMS_PER_PAGE;
    return filteredRooms.slice(start, start + ROOMS_PER_PAGE);
  }, [filteredRooms, currentPage]);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setShowAccessModal(true);
  };

  const handleAccessGranted = (userType = 'manager') => {
    setShowAccessModal(false);
    // Redirecionar baseado no tipo de usuário
    if (userType === 'manager') {
      window.location.href = `/ManagerDashboard?roomId=${selectedRoom.id}`;
    } else {
      window.location.href = `/RoomView?roomId=${selectedRoom.id}`;
    }
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
        language={language}
      />

      <div className="flex">
        <div className="flex-1">
          <div className="container mx-auto px-3 md:px-8 py-8 md:py-12" style={{ maxWidth: '1200px' }}>
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-4xl font-bold mb-1 text-zinc-900 dark:text-zinc-50 elegant-font">
            SALAS PRIVADAS
          </h2>
          <p className="text-lg md:text-2xl font-semibold text-[#D4AF37] mb-2">
            SELECIONE UMA COMUNIDADE GUANXI
          </p>
          <p className="text-zinc-600 dark:text-zinc-300 text-base md:text-lg">
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 justify-items-center">
              {paginatedRooms.map((room) => (
                <RoomCard 
                  key={room.id} 
                  room={room}
                  onRoomClick={handleRoomClick}
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          </>
        )}
          </div>
        </div>

        {/* Sidebar - Hidden no Mobile */}
        <div className="hidden lg:block">
          <RoomSidebar rooms={rooms} onRoomClick={handleRoomClick} />
        </div>
      </div>

      <Footer />

      <RoomAccessModal
        room={selectedRoom}
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        onAccessGranted={handleAccessGranted}
      />
      <GuidedTour />
    </div>
  );
}