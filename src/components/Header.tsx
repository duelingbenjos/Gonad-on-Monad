"use client";

import { Button } from "@/components/ui/button";
import { WhitelistDialog } from "./WhitelistDialog";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/0 bg-background/0">
      <nav className="container mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-1">
          <img src="/gonad.png" alt="GONAD Logo" className="h-8 w-8 md:h-11 md:w-11" />
            <img src="/gonad-text.png" alt="GONAD" className="h-4 md:h-6" />
        </div>
        
        <div className="hidden md:block scale-90 md:scale-100">
          <WhitelistDialog triggerVariant="hero" triggerText="Get Whitelist" />
        </div>
      </nav>
    </header>
  );
};
