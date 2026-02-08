import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, string> = {
    draft: "bg-zinc-800 text-zinc-300 border-zinc-700",
    parked: "bg-yellow-950/30 text-yellow-400 border-yellow-900/50",
    promoted: "bg-blue-950/30 text-blue-400 border-blue-900/50",
    discarded: "bg-red-950/30 text-red-400 border-red-900/50",
    shipped: "bg-green-950/30 text-green-400 border-green-900/50",
  };

  const variantClass = variants[status.toLowerCase()] || variants.draft;

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider",
      variantClass
    )}>
      {status}
    </span>
  );
}
