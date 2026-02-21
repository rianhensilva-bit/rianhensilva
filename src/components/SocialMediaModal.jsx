import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SOCIAL_MEDIA = [
  { name: 'Facebook', url: 'https://facebook.com/guanxi', icon: '📘' },
  { name: 'Instagram', url: 'https://instagram.com/guanxi', icon: '📷' },
  { name: 'Twitter / X', url: 'https://twitter.com/guanxi', icon: '🐦' },
  { name: 'LinkedIn', url: 'https://linkedin.com/company/guanxi', icon: '💼' },
  { name: 'YouTube', url: 'https://youtube.com/@guanxi', icon: '📺' },
  { name: 'TikTok', url: 'https://tiktok.com/@guanxi', icon: '🎵' }
];

export default function SocialMediaModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Nossas Redes Sociais</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-6">
          {SOCIAL_MEDIA.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 hover:bg-muted transition-all hover:scale-105"
            >
              <span className="text-3xl">{social.icon}</span>
              <span className="font-semibold text-sm text-center">{social.name}</span>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}