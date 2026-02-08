/* ================================================================
   BOTANICAL MOTIFS - Lightweight SVG decorations
   Leaf veins, roots, sacred geometry for sci-fi botanical aesthetic
   ================================================================ */

import type { ReactNode } from "react";

export function BotanicalCorner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <path d="M2 38 Q2 20 20 2" strokeLinecap="round" />
      <path d="M8 38 Q8 24 24 8" strokeLinecap="round" />
      <path d="M2 28 Q8 22 14 22" strokeLinecap="round" />
      <path d="M18 2 Q18 8 12 14" strokeLinecap="round" />
      <circle cx="6" cy="34" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="34" cy="6" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function LeafVein({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 40" className={className}>
      <path d="M0 20 Q25 20 50 10 Q75 0 100 5" fill="none" strokeLinecap="round" />
      <path d="M50 10 L55 18" fill="none" strokeLinecap="round" />
      <path d="M65 6 L68 14" fill="none" strokeLinecap="round" />
      <path d="M80 4 L82 12" fill="none" strokeLinecap="round" />
      <path d="M35 14 L32 22" fill="none" strokeLinecap="round" />
      <path d="M20 18 L18 26" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function RootNetwork({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className}>
      <path d="M60 0 L60 15 Q55 25 45 35 Q40 45 35 60" fill="none" strokeLinecap="round" />
      <path d="M60 15 Q65 25 75 35 Q80 45 85 60" fill="none" strokeLinecap="round" />
      <path d="M45 35 Q40 40 30 45" fill="none" strokeLinecap="round" />
      <path d="M75 35 Q80 40 90 45" fill="none" strokeLinecap="round" />
      <path d="M60 15 L60 35 Q60 45 55 55" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="8" r="2" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function ConstellationDots({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="20" cy="30" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="45" cy="15" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="70" cy="25" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="85" cy="50" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="60" cy="60" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="30" cy="70" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="50" cy="85" r="1.5" fill="currentColor" opacity="0.5" />
      <path d="M20 30 L45 15 L70 25" fill="none" strokeWidth="0.3" opacity="0.3" />
      <path d="M70 25 L85 50 L60 60" fill="none" strokeWidth="0.3" opacity="0.3" />
      <path d="M60 60 L30 70 L50 85" fill="none" strokeWidth="0.3" opacity="0.3" />
    </svg>
  );
}

export function SacredGeometry({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className}>
      <circle cx="30" cy="30" r="20" fill="none" strokeWidth="0.5" opacity="0.3" />
      <circle cx="30" cy="30" r="12" fill="none" strokeWidth="0.5" opacity="0.4" />
      <circle cx="30" cy="30" r="4" fill="none" strokeWidth="0.5" opacity="0.5" />
      <path d="M30 10 L47.32 40 L12.68 40 Z" fill="none" strokeWidth="0.3" opacity="0.2" />
      <path d="M30 50 L12.68 20 L47.32 20 Z" fill="none" strokeWidth="0.3" opacity="0.2" />
    </svg>
  );
}

export function CardWithBotanical({ 
  children, 
  className = "" 
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative reveal-botanical ${className}`}>
      <div className="botanical-corner botanical-corner-tl">
        <BotanicalCorner />
      </div>
      <div className="botanical-corner botanical-corner-tr">
        <BotanicalCorner />
      </div>
      <div className="botanical-corner botanical-corner-bl">
        <BotanicalCorner />
      </div>
      <div className="botanical-corner botanical-corner-br">
        <BotanicalCorner />
      </div>
      {children}
    </div>
  );
}
