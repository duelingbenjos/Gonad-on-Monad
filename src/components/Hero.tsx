import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { WhitelistDialog } from "./WhitelistDialog";
import { GonadStarfield } from "./GonadStarfield";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Starfield background */}
      <GonadStarfield />
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-background to-background" />
      
      <div className="container mx-auto px-6 py-20 relative z-10 text-center">
        {/* Portal Image */}
        <div className="relative mb-16">
          <div className="relative w-80 h-80 mx-auto">
            {/* Diamond-shaped container */}
            <div className="absolute inset-0 rotate-45 overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30"
                 style={{ boxShadow: 'var(--shadow-glow)' }}>
              <div className="absolute inset-0 -rotate-45 flex items-center justify-center">
                <img 
                  src="/gonad.png" 
                  alt="Gonad Portal" 
                  className="w-120 h-120 object-contain"
                />
              </div>
            </div>
            {/* Outer glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl -z-10 rotate-45" />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-6">
            <h1 className="font-medodica text-6xl md:text-8xl font-bold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Gonad on Monad.
              </span>
              <br />
              <span className="text-foreground">Gonads in motion stay in motion</span>
            </h1>
            
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-xl md:text-3xl text-muted-foreground">
                Q4 2025, Gooch Island continues its infinite expansion on Monad.
              </p>
              
              <p className="text-base md:text-lg font-medium text-foreground">
                One chain. Two balls. Infinite goo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <WhitelistDialog triggerVariant="hero" triggerText="Join whitelist" />
            <WhitelistDialog triggerVariant="outline" triggerText="Check status" />
          </div>

        </div>
      </div>
    </section>
  );
};
