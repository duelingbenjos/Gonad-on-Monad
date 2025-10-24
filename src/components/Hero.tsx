"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { WhitelistDialog } from "./WhitelistDialog";
import { GonadStarfield, GonadStarfieldRef } from "./GonadStarfield";
import { GameHUD } from "./GameHUD";
import { SocialIcons } from "./SocialIcons";
import { useEffect, useRef, useState } from "react";

export const Hero = () => {
  const starfieldRef = useRef<GonadStarfieldRef>(null);
  const [isExploding, setIsExploding] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [gameMode, setGameMode] = useState<boolean>(true);

  // Initialize game mode from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gonad-game-mode');
      const enabled = stored ? stored === '1' : true; // default ON
      setGameMode(enabled);
      const html = document.documentElement;
      if (enabled) {
        html.classList.add('game');
        html.classList.add('dark');
      } else {
        html.classList.remove('game');
        html.classList.remove('dark');
      }
    } catch {}
  }, []);

  const toggleGameMode = () => {
    const next = !gameMode;
    setGameMode(next);
    try {
      localStorage.setItem('gonad-game-mode', next ? '1' : '0');
    } catch {}
    const html = document.documentElement;
    if (next) {
      html.classList.add('game');
      html.classList.add('dark');
    } else {
      html.classList.remove('game');
      html.classList.remove('dark');
    }
  };

  const handleGonadClick = () => {
    if (starfieldRef.current && !isExploding) {
      setIsExploding(true);
      setScreenShake(true);
      starfieldRef.current.explode();
      
      // Extended burst for better laser visibility
      setTimeout(() => {
        setIsExploding(false);
        setScreenShake(false);
      }, 1200); // Extended from 800ms to 1200ms to match black flash duration
    }
  };
  return (
    <section className={`relative h-screen flex flex-col overflow-hidden ${screenShake ? 'animate-screen-shake' : ''}`}>
      {/* Starfield background */}
      <GonadStarfield ref={starfieldRef} />
      
      {/* Black flash overlay */}
      <div className={`absolute inset-0 pointer-events-none z-50 ${isExploding ? 'animate-black-flash' : ''}`} />
      
      {/* Background vignette - custom masking effect */}
      <div className="vignette vignette-top vignette-subtle" />
      
      {/* Header spacer */}
      <div style={{ height: 'clamp(4rem, 10vh, 8rem)' }} />
      
      {/* Logo section - centered in upper space */}
      <div className="flex-1 flex items-center justify-center pt-4 sm:pt-8 md:pt-16 lg:pt-12 xl:pt-8">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          {/* Interactive Portal Image */}
          <div className="relative">
            <div className="relative mx-auto" style={{ 
              width: 'clamp(8rem, 25vw, 20rem)', 
              height: 'clamp(8rem, 25vw, 20rem)' 
            }}>
              {/* Diamond-shaped container */}
              <div className="absolute inset-0 rotate-45 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30"
                   style={{ 
                     boxShadow: 'var(--shadow-glow)',
                     borderRadius: 'clamp(1rem, 2vw, 2rem)'
                   }}>
                <div className="absolute inset-0 -rotate-45 flex items-center justify-center">
                  <img 
                    src="/gonad.png" 
                    alt="Gonad Portal" 
                    className={`object-contain cursor-pointer transition-all duration-300 touch-optimized ${isExploding ? 'animate-explode-logo' : ''}`}
                    style={{
                      width: 'clamp(6rem, 20vw, 18rem)',
                      height: 'clamp(6rem, 20vw, 18rem)'
                    }}
                    onClick={handleGonadClick}
                    onMouseEnter={(e) => !isExploding && (e.target as HTMLImageElement).classList.add('animate-gentle-shake')}
                    onMouseLeave={(e) => (e.target as HTMLImageElement).classList.remove('animate-gentle-shake')}
                    onTouchStart={(e) => !isExploding && (e.target as HTMLImageElement).classList.add('animate-gentle-shake')}
                    onTouchEnd={(e) => (e.target as HTMLImageElement).classList.remove('animate-gentle-shake')}
                  />
                </div>
              </div>
              {/* Simple outer glow */}
              <div className="absolute bg-gradient-to-r from-primary/20 to-accent/20 blur-xl -z-10 rotate-45" 
                   style={{
                     inset: 'clamp(-0.5rem, -1vw, -1rem)',
                     borderRadius: 'clamp(1rem, 2vw, 2rem)'
                   }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Positioned higher */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center" style={{ 
        paddingTop: 'clamp(2rem, 5vh, 4rem)',
        paddingBottom: 'clamp(3rem, 8vh, 6rem)'
      }}>
        <div className="max-w-4xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 3vh, 2rem)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 2vh, 1.5rem)' }}>
            <h1 className="font-medodica font-bold leading-none tracking-tight" style={{ fontSize: 'clamp(3rem, 12vw, 8rem)' }}>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Gonad
              </span>
            </h1>
            
            <div className="max-w-2xl mx-auto">
              <p className="text-muted-foreground px-2" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
                Q4 2025, CryptoDickButts continue the infinite expansion of Gooch Island to Monad.
              </p>
              
              <div className="flex items-center justify-center border-t border-border/20" style={{ 
                gap: 'clamp(0.5rem, 2vw, 1rem)',
                marginTop: 'clamp(1rem, 3vh, 2rem)',
                paddingTop: 'clamp(0.5rem, 2vh, 1rem)'
              }}>
                <a 
                  href="https://magiceden.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  {/* Swap logo based on theme */}
                  <picture>
                    {/* Default light image */}
                    <source media="(prefers-color-scheme: light)" srcSet="/ME_Full_Hor_2C_Pos.png" />
                    {/* Dark mode image via class-based theme */}
                    {/* We still render both and hide/show via CSS to ensure class-based dark works */}
                    <img 
                      src={typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '/ME_Full_Hor_2C_Neg.svg' : '/ME_Full_Hor_2C_Pos.png'}
                      alt="Magic Eden"
                      className="opacity-80 hover:opacity-100 transition-opacity dark:hidden"
                      style={{ height: 'clamp(2rem, 4vw, 3rem)' }}
                    />
                  </picture>
                  {/* Explicit dark image overlay for class-based dark */}
                  <img
                    src="/ME_Full_Hor_2C_Neg.svg"
                    alt="Magic Eden"
                    className="hidden dark:inline opacity-90 hover:opacity-100 transition-opacity"
                    style={{ height: 'clamp(2rem, 4vw, 3rem)' }}
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <WhitelistDialog triggerVariant="hero" triggerText="Get Whitelist" />
          </div>
        </div>
      </div>

      {/* Game Mode Toggle - bottom-left */}
      {/* <div className="absolute left-4 bottom-4 z-50">
        <button
          onClick={toggleGameMode}
          className="px-3 py-2 rounded-md text-sm font-medium border border-border/50 bg-secondary/40 backdrop-blur-sm hover:bg-secondary/60 transition-colors text-foreground shadow-sm"
          aria-pressed={gameMode}
        >
        </button>
      </div> */}

      {/* HUD disabled for deployment */}
    </section>
  );
};
