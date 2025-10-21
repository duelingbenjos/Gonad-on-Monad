"use client";

import { Button } from "@/components/ui/button";
import { WhitelistDialog } from "./WhitelistDialog";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-1">
          <img src="/gonad.png" alt="GONAD Logo" className="h-11 w-11" />
            <img src="/gonad-text.png" alt="GONAD" className="h-6" />
        </div>
        

        <WhitelistDialog triggerVariant="hero" triggerText="Get Whitelist" />
      </nav>
    </header>
  );
};
