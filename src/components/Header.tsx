"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WhitelistDialog } from "./WhitelistDialog";
import { WalletStatus } from "./WalletStatus";
import { SocialIcons } from "./SocialIcons";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/10">
        <nav className="container mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
          <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
            <img src="/gonad.png" alt="GONAD Logo" className="h-8 w-8 md:h-11 md:w-11" />
            <img src="/gonad-text.png" alt="GONAD" className="h-4 md:h-6" />
          </Link>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
            <Link 
              href="/lore" 
              className="block text-lg md:text-2xl font-bold text-foreground hover:text-primary transition-all duration-300 hover:scale-105 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-primary/20 hover:border-primary/40 backdrop-blur-sm whitespace-nowrap"
            >
              GENESIS OF GENESES
            </Link>
          </div>
          
          {/* Desktop Wallet & Social Icons - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-4 scale-90 md:scale-100">
            <WalletStatus variant="header" />
            <SocialIcons className="justify-center" />
          </div>
          
          {/* Mobile Burger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative z-50 flex flex-col items-center justify-center w-10 h-10 space-y-1.5 transition-all duration-300"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 transition-all duration-500 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-background/95 backdrop-blur-lg"
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div className={`relative h-full flex flex-col items-center justify-center space-y-12 transition-all duration-500 ${isMenuOpen ? 'translate-y-0' : 'translate-y-8'}`}>
          {/* Navigation Links */}
          <div className="text-center space-y-8">
            <Link 
              href="/lore"
              onClick={() => setIsMenuOpen(false)}
              className="block text-4xl font-bold text-foreground hover:text-primary transition-all duration-300 hover:scale-105 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-primary/20 hover:border-primary/40 backdrop-blur-sm"
            >
              GENESIS OF GENESES
            </Link>
            
            {/* Wallet Connection */}
            <div className="flex justify-center">
              <WalletStatus 
                variant="mobile" 
                onMenuClose={() => setIsMenuOpen(false)}
              />
            </div>
            
            {/* Whitelist Button */}
            <div className="flex justify-center">
              <WhitelistDialog 
                triggerVariant="outline" 
                triggerText="Get Whitelist"
              />
            </div>
          </div>
          
          {/* Social Icons */}
          <div className="scale-125">
            <SocialIcons className="justify-center gap-8" />
          </div>
          
          {/* Close hint */}
        </div>
      </div>
    </>
  );
};
