import { Link } from "wouter";
import { useDashboardStats } from "@/hooks/use-bruce-ops";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Lightbulb, GraduationCap, Trees, Sprout, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import coreBackground from "@assets/systems2_1766828428459.webp";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const laneLinks = [
    { href: "/life-ops", label: "ROOTS", sublabel: "LifeOps", icon: Sprout, color: "text-amber-400 border-amber-500/50", testId: "link-lane-roots" },
    { href: "/goals", label: "GROWTH", sublabel: "Goals", icon: Target, color: "text-emerald-400 border-emerald-500/50", testId: "link-lane-growth" },
    { href: "/think-ops", label: "CANOPY", sublabel: "ThinkOps", icon: Lightbulb, color: "text-violet-400 border-violet-500/50", testId: "link-lane-canopy" },
    { href: "/teaching", label: "LAB", sublabel: "Teaching", icon: GraduationCap, color: "text-cyan-400 border-cyan-500/50", testId: "link-lane-lab" },
    { href: "/harris", label: "WILDLANDS", sublabel: "Brand", icon: Trees, color: "text-emerald-400 border-emerald-500/50", testId: "link-lane-wildlands" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] -m-4 md:-m-6 lg:-m-8">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35"
        style={{ backgroundImage: `url(${coreBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/85" />
      
      <div className="relative z-10 p-4 md:p-6 lg:p-8 flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="bg-black/70 border border-cyan-500/50 p-4 backdrop-blur-sm max-w-lg mb-8">
          <p className="font-mono text-cyan-400 text-xs mb-1">C:\CORE\BRUCEOPS&gt;</p>
          <h1 className="font-mono font-normal text-2xl md:text-3xl tracking-tight text-cyan-300 uppercase">
            BRUCE_OPS<span className="cursor-blink">_</span>
          </h1>
          <p className="font-mono text-cyan-400/80 text-xs mt-2 tracking-wide">
            &gt; personal operating system // command center
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Card className="bg-black/60 border border-cyan-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="font-mono text-[10px] text-cyan-400/70 tracking-widest uppercase mb-1">DAILY_LOG</p>
              <p className="font-mono text-lg text-cyan-300">
                {stats?.logsToday ? "COMPLETE" : "PENDING"}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-black/60 border border-violet-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="font-mono text-[10px] text-violet-400/70 tracking-widest uppercase mb-1">OPEN_IDEAS</p>
              <p className="font-mono text-lg text-violet-300">{stats?.openLoops || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-black/60 border border-amber-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="font-mono text-[10px] text-amber-400/70 tracking-widest uppercase mb-1">DRIFT_FLAGS</p>
              <p className="font-mono text-lg text-amber-300">{Array.isArray(stats?.driftFlags) ? stats.driftFlags.length : 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-black/60 border border-emerald-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="font-mono text-[10px] text-emerald-400/70 tracking-widest uppercase mb-1">SYSTEM</p>
              <p className="font-mono text-lg text-emerald-300">ACTIVE</p>
            </CardContent>
          </Card>
        </div>

        {stats?.driftFlags && Array.isArray(stats.driftFlags) && stats.driftFlags.length > 0 && (
          <Card className="bg-black/60 border border-red-500/30 backdrop-blur-sm mb-8">
            <CardContent className="p-4">
              <p className="font-mono text-[10px] text-red-400 tracking-widest uppercase mb-2">&gt; ATTENTION_REQUIRED</p>
              <ul className="space-y-1">
                {stats.driftFlags.map((flag: string, i: number) => (
                  <li key={i} className="font-mono text-sm text-red-300/80 flex items-start gap-2">
                    <span className="text-red-400">-</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex-1" />

        <div className="border-t border-cyan-500/30 pt-6">
          <p className="font-mono text-[10px] text-cyan-400/60 tracking-widest uppercase mb-4">&gt; NAVIGATE_TO_LANE</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {laneLinks.map((lane) => (
              <Link key={lane.href} href={lane.href} data-testid={lane.testId}>
                <Card className={`bg-black/60 border ${lane.color} backdrop-blur-sm cursor-pointer hover-elevate transition-all`}>
                  <CardContent className="p-3 flex flex-col items-center text-center">
                    <lane.icon className={`w-5 h-5 mb-2 ${lane.color.split(' ')[0]}`} />
                    <p className={`font-mono text-xs ${lane.color.split(' ')[0]}`}>{lane.label}</p>
                    <p className="font-mono text-[10px] text-muted-foreground/60">{lane.sublabel}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 pb-4">
          <p className="font-mono text-[10px] text-cyan-400/40 tracking-widest uppercase">
            PRIVATE BY DEFAULT // NO SHARING // BRUCE.OS v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
