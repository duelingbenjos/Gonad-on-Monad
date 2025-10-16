import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
          <span className="text-xl font-bold tracking-tight">GONAD</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </a>
          <a href="#ecosystem" className="text-sm font-medium hover:text-primary transition-colors">
            Ecosystem
          </a>
          <a href="#developers" className="text-sm font-medium hover:text-primary transition-colors">
            Developers
          </a>
          <a href="#resources" className="text-sm font-medium hover:text-primary transition-colors">
            Resources
          </a>
        </div>

        <Button variant="hero" size="default">
          Join Testnet
        </Button>
      </nav>
    </header>
  );
};
