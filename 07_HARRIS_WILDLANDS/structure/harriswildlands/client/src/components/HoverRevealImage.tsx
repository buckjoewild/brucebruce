/* ================================================================
   HOVER REVEAL IMAGE - Botanical sci-fi images revealed on hover
   Smooth fade-in animation for visual discovery
   ================================================================ */

import { useState } from "react";
import type { ReactNode } from "react";

interface HoverRevealImageProps {
  src: string;
  alt: string;
  children: ReactNode;
  className?: string;
  imagePosition?: "left" | "right" | "top" | "bottom" | "overlay" | "corner";
  imageSize?: "sm" | "md" | "lg" | "full";
  opacity?: number;
}

export function HoverRevealImage({
  src,
  alt,
  children,
  className = "",
  imagePosition = "corner",
  imageSize = "md",
  opacity = 0.15
}: HoverRevealImageProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-40 h-40",
    lg: "w-64 h-64",
    full: "w-full h-full"
  };

  const positionClasses = {
    left: "left-0 top-1/2 -translate-y-1/2",
    right: "right-0 top-1/2 -translate-y-1/2",
    top: "top-0 left-1/2 -translate-x-1/2",
    bottom: "bottom-0 left-1/2 -translate-x-1/2",
    overlay: "inset-0",
    corner: "bottom-0 right-0"
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      <div
        className={`
          absolute pointer-events-none
          ${positionClasses[imagePosition]}
          ${imagePosition === "overlay" ? "w-full h-full" : sizeClasses[imageSize]}
          transition-all duration-500 ease-out
          ${isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}
        style={{ opacity: isHovered ? opacity : 0 }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
}

interface LaneHeroImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function LaneHeroImage({ src, alt, className = "" }: LaneHeroImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          absolute inset-0 pointer-events-none
          transition-all duration-700 ease-out
          ${isHovered ? "opacity-20 scale-105" : "opacity-0 scale-100"}
        `}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}

interface CardHoverImageProps {
  src: string;
  alt: string;
  children: ReactNode;
  className?: string;
}

export function CardHoverImage({ src, alt, children, className = "" }: CardHoverImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`relative overflow-hidden group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      <div
        className={`
          absolute bottom-0 right-0 w-32 h-32
          pointer-events-none
          transition-all duration-500 ease-out
          ${isHovered ? "translate-x-0 translate-y-0" : "translate-x-4 translate-y-4"}
        `}
        style={{ opacity: isHovered ? 0.15 : 0 }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
}

interface PageHeaderWithImageProps {
  src: string;
  alt: string;
  children: ReactNode;
  className?: string;
}

export function PageHeaderWithImage({ src, alt, children, className = "" }: PageHeaderWithImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          absolute -right-8 -top-8 w-48 h-48
          pointer-events-none
          transition-all duration-700 ease-out
          ${isHovered ? "opacity-20 rotate-0 scale-100" : "opacity-0 -rotate-12 scale-90"}
        `}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
