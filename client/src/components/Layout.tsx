import React, { useState } from 'react';
import { Header } from '@/components/Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setShowMobileMenu(!showMobileMenu)} showMenu={showMobileMenu} />
      <main className="container py-8 md:py-12">
        {children}
      </main>
      <footer className="bg-card border-t border-border mt-16 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Dyslexia Screening. Designed with accessibility in mind.</p>
        </div>
      </footer>
    </div>
  );
};
