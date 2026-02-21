import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User } from 'lucide-react';

export default function PredictionDetailsModal({ prediction, isOpen, onClose, language }) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { id: 1, user: 'João Silva', text: 'Acredito que vai acontecer!', date: '2026-02-20' },
    { id: 2, user: 'Maria Santos', text: 'Não tenho certeza sobre isso...', date: '2026-02-19' },
    { id: 3, user: 'Pedro Costa', text: 'Muito interessante essa aposta!', date: '2026-02-18' }
  ]);

  const translations = {
    pt: { 
      evolution: 'Evolução de Palpites',
      yes: 'Sim',
      no: 'Não',
      comments: 'Comentários',
      writeComment: 'Escreva seu comentário...',
      send: 'Enviar',
      loginToComment: 'Faça login para comentar'
    },
    en: { 
      evolution: 'Prediction Evolution',
      yes: 'Yes',
      no: 'No',
      comments: 'Comments',
      writeComment: 'Write your comment...',
      send: 'Send',
      loginToComment: 'Login to comment'
    }
  };

  const t = translations[language] || translations.pt;

  if (!prediction) return null;

  // Mock data for the chart - shows evolution over time
  const chartData = [
    { date: '15/02', yes: 45, no: 55 },
    { date: '16/02', yes: 47, no: 53 },
    { date: '17/02', yes: 49, no: 51 },
    { date: '18/02', yes: 51, no: 49 },
    { date: '19/02', yes: 52, no: 48 },
    { date: '20/02', yes: prediction.yes_percentage, no: prediction.no_percentage },
  ];

  const handleSendComment = () => {
    if (comment.trim()) {
      setComments([
        { id: Date.now(), user: 'Você', text: comment, date: new Date().toLocaleDateString('pt-BR') },
        ...comments
      ]);
      setComment('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{prediction.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Chart Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t.evolution}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="yes" 
                  stroke="#22C55E" 
                  strokeWidth={3}
                  name={t.yes}
                  dot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="no" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  name={t.no}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Current Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border-2 border-green-500">
              <div className="text-green-700 dark:text-green-300 font-bold text-lg">{t.yes}</div>
              <div className="text-3xl font-black text-green-600 dark:text-green-400">{prediction.yes_percentage}%</div>
            </div>
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border-2 border-red-500">
              <div className="text-red-700 dark:text-red-300 font-bold text-lg">{t.no}</div>
              <div className="text-3xl font-black text-red-600 dark:text-red-400">{prediction.no_percentage}%</div>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t.comments}</h3>
            
            {/* Comment Input */}
            <div className="mb-6 space-y-3">
              <Textarea
                placeholder={t.writeComment}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
              />
              <Button 
                onClick={handleSendComment}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold"
              >
                <Send className="h-4 w-4 mr-2" />
                {t.send}
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="p-4 rounded-lg bg-muted">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                      <User className="h-5 w-5 text-black" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{c.user}</span>
                        <span className="text-sm text-muted-foreground">{c.date}</span>
                      </div>
                      <p className="text-sm">{c.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}