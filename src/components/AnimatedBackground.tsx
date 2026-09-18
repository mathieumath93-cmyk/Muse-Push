import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#0a0a10]">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* Floating Aurora Glow Orbs */}
      {/* Orb 1: Rose / Magenta Deep Glow */}
      <div 
        className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-tr from-rose-600/25 via-pink-600/15 to-transparent blur-[120px] animate-aurora-1" 
      />

      {/* Orb 2: Deep Violet / Indigo Glow */}
      <div 
        className="absolute top-[35%] -right-[15%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-bl from-purple-700/20 via-indigo-600/15 to-transparent blur-[130px] animate-aurora-2" 
      />

      {/* Orb 3: Warm Amber / Gold Accent Bottom Left */}
      <div 
        className="absolute -bottom-[15%] left-[20%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-tr from-amber-600/15 via-rose-500/10 to-transparent blur-[110px] animate-aurora-3" 
      />

      {/* Top light beam accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
    </div>
  );
};
