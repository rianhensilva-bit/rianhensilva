import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, User } from 'lucide-react';

export default function SignupModal({ isOpen, onClose, language }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    state: '',
    city: '',
    bio: '',
    profileImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const translations = {
    pt: {
      title: 'Criar Conta',
      username: 'Nome de Usuário',
      email: 'Email',
      state: 'Estado',
      city: 'Cidade',
      bio: 'Bio / Sobre Você',
      profileImage: 'Foto de Perfil',
      uploadImage: 'Carregar Imagem',
      submit: 'Criar Conta',
      usernamePlaceholder: 'Digite seu nome de usuário',
      emailPlaceholder: 'seu@email.com',
      statePlaceholder: 'Ex: São Paulo',
      cityPlaceholder: 'Ex: São Paulo',
      bioPlaceholder: 'Conte um pouco sobre você...'
    },
    en: {
      title: 'Sign Up',
      username: 'Username',
      email: 'Email',
      state: 'State',
      city: 'City',
      bio: 'Bio / About You',
      profileImage: 'Profile Picture',
      uploadImage: 'Upload Image',
      submit: 'Create Account',
      usernamePlaceholder: 'Enter your username',
      emailPlaceholder: 'your@email.com',
      statePlaceholder: 'Ex: California',
      cityPlaceholder: 'Ex: Los Angeles',
      bioPlaceholder: 'Tell us about yourself...'
    }
  };

  const t = translations[language] || translations.pt;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle signup logic here
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-black" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <Upload className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <span className="text-sm text-muted-foreground">{t.uploadImage}</span>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">{t.username}</Label>
            <Input
              id="username"
              placeholder={t.usernamePlaceholder}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t.emailPlaceholder}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* State and City */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">{t.state}</Label>
              <Input
                id="state"
                placeholder={t.statePlaceholder}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t.city}</Label>
              <Input
                id="city"
                placeholder={t.cityPlaceholder}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">{t.bio}</Label>
            <Textarea
              id="bio"
              placeholder={t.bioPlaceholder}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black"
          >
            {t.submit}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}