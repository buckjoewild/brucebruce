import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type LaneType = "trunk" | "root" | "canopy" | "lab" | "wildlands" | "default";

const laneImages: Record<LaneType, string> = {
  trunk: "/assets/img/trunk-system-v1.webp",
  root: "/assets/img/root-system-v1.webp",
  canopy: "/assets/img/canopy-v1.webp",
  lab: "/assets/img/lab-viz-v1.webp",
  wildlands: "/assets/img/lifeops-dashboard-v1.webp",
  default: "",
};

interface PageBackgroundProps {
  lane: LaneType;
  children: ReactNode;
  className?: string;
  opacity?: number;
}

export function PageBackground({ lane, children, className, opacity = 0.15 }: PageBackgroundProps) {
  const imageUrl = laneImages[lane];
  
  if (!imageUrl) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <div className={cn("relative min-h-full", className)}>
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ 
          backgroundImage: `url('${imageUrl}')`,
          opacity: opacity,
          zIndex: -1
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
