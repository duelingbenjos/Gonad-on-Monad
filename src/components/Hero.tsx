import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import heroPortal from "@/assets/hero-portal.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-background to-background" />
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden" style={{ boxShadow: 'var(--shadow-glow)' }}>
              <img 
                src={heroPortal} 
                alt="Gonad Portal" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Speed without sacrifice.
                </span>
                <br />
                Welcome to Gonad.
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                The Gonad protocol delivers full EVM compatibility with breakthrough performance, 
                true decentralization, production-grade security, and exceptional throughput.
              </p>
              
              <p className="text-base md:text-lg font-medium text-foreground">
                Say goodbye to the blockchain trilemma forever.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg" className="gap-2">
                <Zap className="h-5 w-5" />
                Start building
              </Button>
              <Button variant="outline" size="lg" className="gap-2 border-primary/30 hover:border-primary">
                How it works
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="pt-8">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
                SCROLL
              </p>
              <div className="h-8 w-px bg-gradient-to-b from-primary to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
