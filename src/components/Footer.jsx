import React from 'react';

export default function Footer() {
  const links = [
    { label: 'Sobre Nós', href: '#' },
    { label: 'Carreiras', href: '#' },
    { label: 'Contato', href: '#' },
    { label: 'Termos de Uso', href: '#' },
    { label: 'Política de Privacidade', href: '#' },
    { label: 'Ajuda', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Afiliados', href: '#' }
  ];

  return (
    <footer className="mt-16 border-t bg-muted/30 backdrop-blur">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        
        <div className="pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 <span className="font-bold">GUANXI</span> MERCADO DE PREVISÕES. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}