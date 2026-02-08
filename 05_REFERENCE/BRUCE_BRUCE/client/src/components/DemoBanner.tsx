import { isDemoMode } from "@/hooks/use-auth";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  
  if (!isDemoMode() || dismissed) return null;
  
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
        <span className="text-amber-700 dark:text-amber-300">
          <strong>Demo Mode</strong> - Changes are temporary and not saved to a database.
        </span>
      </div>
      <button 
        onClick={() => setDismissed(true)}
        className="p-1 rounded hover:bg-amber-500/20 transition-colors"
        data-testid="button-dismiss-demo-banner"
      >
        <X className="w-4 h-4 text-amber-500" />
      </button>
    </div>
  );
}
