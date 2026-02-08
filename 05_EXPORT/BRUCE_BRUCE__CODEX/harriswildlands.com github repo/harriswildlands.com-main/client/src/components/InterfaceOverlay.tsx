/* ================================================================
   INTERFACE OVERLAY - Sci-Fi Grid System
   Shows faint gridlines, coordinate ticks, and micro-labels
   ================================================================ */

interface InterfaceOverlayProps {
  isActive: boolean;
  currentPage?: string;
}

export function InterfaceOverlay({ isActive, currentPage = "HOME" }: InterfaceOverlayProps) {
  if (!isActive) return null;

  const nodeLabel = getNodeLabel(currentPage);

  return (
    <div className={`interface-overlay ${isActive ? 'active' : ''}`}>
      <div className="overlay-grid" />
      <div className="overlay-ticks" />
      
      <span className="overlay-label overlay-label-tl">
        WILDLANDS // {nodeLabel}
      </span>
      <span className="overlay-label overlay-label-tr">
        SYS.ACTIVE
      </span>
      <span className="overlay-label overlay-label-bl">
        GRID.60PX
      </span>
      <span className="overlay-label overlay-label-br">
        BRUCE.OS v1.0
      </span>
    </div>
  );
}

function getNodeLabel(page: string): string {
  const labels: Record<string, string> = {
    "/": "HOME NODE",
    "/life-ops": "LIFEOPS CHANNEL",
    "/think-ops": "THINKOPS CHANNEL",
    "/teaching": "TEACHING NODE",
    "/harris": "HARRIS WILDLANDS",
    "/settings": "SYSTEM CONFIG",
  };
  return labels[page] || "ACTIVE NODE";
}
