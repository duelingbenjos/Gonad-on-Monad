"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { WhitelistDialog } from "./WhitelistDialog";
import { GonadStarfield, GonadStarfieldRef } from "./GonadStarfield";
import { SocialIcons } from "./SocialIcons";
import { useRef, useState } from "react";

export const Hero = () => {
  const starfieldRef = useRef<GonadStarfieldRef>(null);
  const [isExploding, setIsExploding] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

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
    <section className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 md:pt-32 ${screenShake ? 'animate-screen-shake' : ''}`}>
      {/* Starfield background */}
      <GonadStarfield ref={starfieldRef} />
      
      {/* Black flash overlay */}
      <div className={`absolute inset-0 pointer-events-none z-50 ${isExploding ? 'animate-black-flash' : ''}`} />
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-background to-background" />
      
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-20 relative z-10 text-center">
        {/* Interactive Portal Image */}
        <div className="relative mb-4 md:mb-16">
          <div className="relative w-32 h-32 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto">
            {/* Diamond-shaped container */}
            <div className="absolute inset-0 rotate-45 overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30"
                 style={{ boxShadow: 'var(--shadow-glow)' }}>
              <div className="absolute inset-0 -rotate-45 flex items-center justify-center">
                <img 
                  src="/gonad.png" 
                  alt="Gonad Portal" 
                  className={`w-40 h-40 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-90 lg:h-90 object-contain cursor-pointer transition-all duration-300 touch-optimized ${isExploding ? 'animate-explode-logo' : ''}`}
                  onClick={handleGonadClick}
                  onMouseEnter={(e) => !isExploding && (e.target as HTMLImageElement).classList.add('animate-gentle-shake')}
                  onMouseLeave={(e) => (e.target as HTMLImageElement).classList.remove('animate-gentle-shake')}
                  onTouchStart={(e) => !isExploding && (e.target as HTMLImageElement).classList.add('animate-gentle-shake')}
                  onTouchEnd={(e) => (e.target as HTMLImageElement).classList.remove('animate-gentle-shake')}
                />
              </div>
            </div>
            {/* Simple outer glow */}
            <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl md:rounded-3xl blur-xl -z-10 rotate-45" />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          <div className="space-y-4 md:space-y-6">
            <h1 className="font-medodica text-8xl sm:text-6xl md:text-8xl lg:text-9xl font-bold leading-none sm:leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Gonad
              </span>
              {/* <br />
              <span className="text-foreground text-6xl">Gonads in motion stay in motion</span> */}
            </h1>
            
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-base sm:text-lg md:text-xl lg:text-3xl text-muted-foreground px-2">
                Q4 2025, CryptoDickButts continue the infinite expansion of Gooch Island to Monad.
              </p>
              
              <div className="flex items-center justify-center gap-3 mt-4 md:mt-6 pt-3 md:pt-4 border-t border-border/20">
                <a 
                  href="https://magiceden.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <img 
                    src="/ME_Full_Hor_2C_Pos.png" 
                    alt="Magic Eden" 
                    className="h-8 md:h-10 opacity-80 hover:opacity-100 transition-opacity"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-6 md:mt-8">
            <WhitelistDialog triggerVariant="hero" triggerText="Get Whitelist" />
          </div>

          {/* Connect with us section */}
          <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-border/20">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4 md:mb-6">
              Connect with us
            </h3>
            <SocialIcons className="justify-center" />
          </div>

        </div>
      </div>
    </section>
  );
};
