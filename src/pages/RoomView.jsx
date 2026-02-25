import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, TrendingUp, Moon, Sun } from 'lucide-react';
import BetModal from '@/components/BetModal';

export default function RoomView() {
  const [darkMode, setDarkMode] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showBetModal, setShowBetModal] = useState(false);
  
  const roomId = new URLSearchParams(window.location.search).get('roomId');

  const { data: room } = useQuery({
    queryKey: ['room', roomId],
    queryFn: async () => {
      const rooms = await base44.entities.Room.list();
      return rooms.find(r => r.id === roomId);
    },
    enabled: !!roomId
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions', roomId],
    queryFn: () => base44.entities.Prediction.filter({ room_id: roomId, status: 'active' }),
    enabled: !!roomId
  });

  const roomData = room?.data || room;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleBet = (prediction) => {
    setSelectedPrediction(prediction);
    setShowBetModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold elegant-font">{roomData?.name}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {roomData?.room_image && (
              <img src={roomData.room_image} alt={roomData.name} className="w-16 h-16 rounded-lg object-cover" />
            )}
            <div>
              <h2 className="text-3xl font-bold elegant-font">{roomData?.name}</h2>
              <p className="text-zinc-500">{roomData?.country_flag} {roomData?.secondary_label}</p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4">Previsões Disponíveis</h3>

        {predictions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-zinc-500">Nenhuma previsão ativa no momento.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {predictions.map((prediction) => {
              const predData = prediction.data || prediction;
              return (
                <Card key={prediction.id} className="hover:border-[#D4AF37] transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{predData.title}</CardTitle>
                        <p className="text-sm text-zinc-500">{predData.description}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        ATIVA
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Volume: R$ {predData.total_volume || 0}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {predData.end_date ? new Date(predData.end_date).toLocaleDateString('pt-BR') : 'Sem data'}
                      </span>
                    </div>

                    {predData.bet_type === 'yes_no' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => handleBet(prediction)}
                          className="h-16 bg-green-600 hover:bg-green-700 text-white font-bold text-lg"
                        >
                          SIM
                          <span className="block text-sm font-normal">{predData.yes_percentage || 50}%</span>
                        </Button>
                        <Button
                          onClick={() => handleBet(prediction)}
                          className="h-16 bg-red-600 hover:bg-red-700 text-white font-bold text-lg"
                        >
                          NÃO
                          <span className="block text-sm font-normal">{predData.no_percentage || 50}%</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {predData.options?.map((option, idx) => (
                          <Button
                            key={idx}
                            onClick={() => handleBet(prediction)}
                            variant="outline"
                            className="w-full h-12 justify-between"
                          >
                            <span>{option.label}</span>
                            <span className="text-sm text-zinc-500">{option.percentage || 0}%</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BetModal
        isOpen={showBetModal}
        onClose={() => setShowBetModal(false)}
        prediction={selectedPrediction}
      />
    </div>
  );
}