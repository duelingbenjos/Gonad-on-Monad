import React from 'react';
import { TunnelAnimation } from './TunnelAnimation';

export const TunnelPortal = () => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-black/20 backdrop-blur-sm border border-primary/20" 
           style={{ boxShadow: 'var(--shadow-glow)' }}>
        <TunnelAnimation 
          width={600} 
          height={600} 
          className="w-full h-full"
        />
        
        {/* Optional overlay effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
        
        {/* Outer glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl -z-10" />
      </div>
      
      {/* Portal label */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">
          Enter the Gonad Portal
        </p>
      </div>
    </div>
  );
};
