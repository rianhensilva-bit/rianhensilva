import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X, ChevronDown } from 'lucide-react';

export default function RoomChat({ roomId, username = 'Visitante', userId = 'guest' }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);

  // Buscar mensagens iniciais
  useEffect(() => {
    if (!roomId) return;
    base44.entities.ChatMessage.filter({ room_id: roomId }, '-created_date', 50)
      .then((msgs) => setMessages(msgs.reverse()));
  }, [roomId]);

  // Subscribe em tempo real
  useEffect(() => {
    if (!roomId) return;
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.room_id !== roomId) return;
      if (event.type === 'create') {
        setMessages((prev) => [...prev, event.data]);
        if (!open) setUnread((u) => u + 1);
      }
    });
    return unsub;
  }, [roomId, open]);

  // Scroll to bottom on new message when open
  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Reset unread when opened
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setLoading(true);
    await base44.entities.ChatMessage.create({
      room_id: roomId,
      user_id: userId,
      username,
      content: text,
      avatar_letter: username.charAt(0).toUpperCase(),
    });
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-bold px-4 py-3 rounded-full shadow-xl transition-all"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">Chat</span>
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
              {unread}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-background border border-border rounded-2xl shadow-2xl flex flex-col" style={{ height: '460px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-zinc-900 dark:bg-zinc-900 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#D4AF37]" />
              <span className="font-semibold text-white text-sm">Chat da Sala</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
            {messages.length === 0 && (
              <div className="text-center text-zinc-400 text-sm mt-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Seja o primeiro a enviar uma mensagem!</p>
              </div>
            )}
            {messages.map((msg, idx) => {
              const msgData = msg.data || msg;
              const isOwn = msgData.user_id === userId;
              return (
                <div key={msg.id || idx} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: isOwn ? '#D4AF37' : '#6366f1' }}
                  >
                    {msgData.avatar_letter || msgData.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                    {!isOwn && (
                      <span className="text-[10px] text-zinc-500 ml-1">{msgData.username}</span>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm ${
                        isOwn
                          ? 'bg-[#D4AF37] text-black rounded-tr-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-tl-sm'
                      }`}
                    >
                      {msgData.content}
                    </div>
                    <span className="text-[10px] text-zinc-400 px-1">{formatTime(msg.created_date)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva uma mensagem..."
              className="flex-1 text-sm h-9"
              maxLength={300}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              size="icon"
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-black h-9 w-9 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}