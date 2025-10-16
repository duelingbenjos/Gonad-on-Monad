import { Card } from "@/components/ui/card";
import { Zap, DollarSign, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "100% EVM-Compatible",
    description: "Use the existing EVM ecosystem to your advantage.",
  },
  {
    icon: Clock,
    title: "10,000 TPS",
    description: "Incredibly fast transaction speeds create a seamless user experience.",
  },
  {
    icon: DollarSign,
    title: "Near zero gas fees",
    description: "Allows for extreme scalability for the most demanding apps.",
  },
  {
    icon: Shield,
    title: "1s block times",
    description: "Ultra-fast finality with single slot confirmation.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm uppercase tracking-wider text-primary font-semibold">Features</p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            The L1 Blockchain with
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Limitless Potential
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Card
              key={idx}
              className="p-8 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
            >
              <feature.icon className="h-12 w-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              10,000+
            </div>
            <p className="text-muted-foreground">Transactions per second</p>
          </div>
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              800ms
            </div>
            <p className="text-muted-foreground">Finality time</p>
          </div>
          <div className="space-y-2">
            <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              $0.001
            </div>
            <p className="text-muted-foreground">Average transaction cost</p>
          </div>
        </div>
      </div>
    </section>
  );
};
