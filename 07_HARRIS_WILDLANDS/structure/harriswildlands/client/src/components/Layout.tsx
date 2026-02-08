/* ================================================================
   LAYOUT - Holo-Atlas Navigation with Botanical Sci-Fi Aesthetic
   ================================================================ */

import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Activity, 
  Lightbulb, 
  GraduationCap, 
  Trees, 
  Menu, 
  X,
  Settings,
  LogOut,
  User,
  Grid3X3,
  Leaf,
  FlaskConical,
  Church,
  Eye,
  Target,
  Sprout,
  TreeDeciduous,
  CloudSun,
  Microscope,
  BrainCircuit,
  BarChart3,
  MessageSquare,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useTheme, ThemeMode } from "./ThemeProvider";
import { InterfaceOverlay } from "./InterfaceOverlay";
import { BotanicalCorner } from "./BotanicalMotifs";
import { DemoBanner } from "./DemoBanner";
import CoreImagery from "@/lib/coreImagery";

interface LayoutProps {
  children: ReactNode;
}

const themeConfig: Record<ThemeMode, { label: string; icon: any; color: string }> = {
  field: { label: "FIELD", icon: Leaf, color: "text-green-400" },
  lab: { label: "LAB", icon: FlaskConical, color: "text-teal-400" },
  sanctuary: { label: "SANCTUARY", icon: Church, color: "text-amber-400" },
};

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { theme, setTheme, overlayEnabled, setOverlayEnabled } = useTheme();

const navItems = [
    { href: "/", label: "Home", sublabel: "Dashboard", icon: Eye },
    { href: "/life", label: "Life", sublabel: "Daily Calibration", icon: Sprout },
    { href: "/goals", label: "Goals", sublabel: "Trunk & Leaves", icon: Target },
    { href: "/think", label: "Think", sublabel: "Ideas & Analysis", icon: CloudSun },
    { href: "/mud", label: "MUD", sublabel: "Text Adventure", icon: Terminal },
    { href: "/bruce", label: "Bruce\u2122", sublabel: "AI Hub", icon: BrainCircuit },
    { href: "/lab", label: "Lab", sublabel: "AI Playground", icon: Microscope },
    { href: "/harris", label: "Wildlands", sublabel: "Brand", icon: Trees },
  ];

  const cycleTheme = () => {
    const themes: ThemeMode[] = ["field", "lab", "sanctuary"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const NavLink = ({ href, icon: Icon, label, sublabel }: { href: string; icon: any; label: string; sublabel?: string }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <div className={cn(
          "holo-nav-item flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 cursor-pointer",
          isActive && "active bg-emerald-500/15 border border-emerald-500/40"
        )}>
          <Icon className={cn(
            "w-5 h-5 transition-colors",
            isActive ? "text-emerald-400" : "text-muted-foreground"
          )} />
          <div className="flex flex-col">
            <span className={cn(
              "text-sm tracking-wide leading-tight",
              isActive ? "text-foreground font-medium" : "text-muted-foreground"
            )}>{label}</span>
            {sublabel && (
              <span className="text-[10px] text-muted-foreground/70 tracking-wide">{sublabel}</span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center aurora-bg">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/50 to-accent/50 animate-pulse" />
            <div className="absolute inset-2 rounded-lg bg-background flex items-center justify-center">
              <Trees className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: `url(${CoreImagery.bruceopsNew})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />
        
        {/* Energy Lines Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Horizontal energy lines */}
          <div className="absolute top-[20%] left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent energy-line-h" />
          <div className="absolute top-[40%] left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent energy-line-h" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[70%] left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent energy-line-h" style={{ animationDelay: '2s' }} />
          
          {/* Vertical energy lines */}
          <div className="absolute left-[15%] top-0 h-full w-px bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent energy-line-v" />
          <div className="absolute left-[85%] top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-500/25 to-transparent energy-line-v" style={{ animationDelay: '1.5s' }} />
          
          {/* Corner symbols */}
          <div className="absolute top-8 right-8 text-cyan-500/30 font-mono text-xs">
            <div className="flex flex-col items-end gap-1">
              <span>[SYS.ACTIVE]</span>
              <span className="text-emerald-500/40">NODE.READY</span>
            </div>
          </div>
          <div className="absolute bottom-8 left-8 text-emerald-500/25 font-mono text-[10px]">
            <div className="flex flex-col gap-1">
              <span>// BOTANICAL_NET</span>
              <span className="text-cyan-500/30">// v2.0.GROWTH</span>
            </div>
          </div>
          
          {/* Floating circuit symbols */}
          <div className="absolute top-[30%] left-[10%] w-3 h-3 border border-cyan-500/20 rounded-full animate-pulse" />
          <div className="absolute top-[60%] right-[20%] w-2 h-2 bg-emerald-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-[25%] left-[25%] w-4 h-4 border border-emerald-500/15 rotate-45" />
          <div className="absolute top-[15%] right-[30%] text-cyan-500/20 font-mono text-lg">+</div>
          <div className="absolute bottom-[40%] right-[10%] text-emerald-500/15 font-mono text-lg">*</div>
        </div>
        
        <div className="relative min-h-screen flex flex-col p-6 z-10">
          <div className="bg-black/80 border border-emerald-500/40 p-4 backdrop-blur-md max-w-md">
            <p className="font-mono text-emerald-400/80 text-xs mb-1 tracking-wider">C:\WILDLANDS&gt;</p>
            <h1 className="font-mono font-normal text-2xl md:text-3xl tracking-tight text-emerald-300 uppercase">
              HARRIS_WILDLANDS<span className="cursor-blink">_</span>
            </h1>
            <p className="font-mono text-emerald-400/70 text-xs mt-2 tracking-wide">
              &gt; faith over fear &amp; systems over skills
            </p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <button 
              className="portal-button group relative px-8 py-4 font-mono text-lg tracking-wider uppercase"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              <span className="portal-button-bg" />
              <span className="portal-button-glow" />
              <span className="relative z-10 flex items-center gap-3 text-emerald-100">
                <Trees className="w-5 h-5" />
                ENTER_THE_WILDLANDS
              </span>
            </button>
            <p className="font-mono text-[10px] text-emerald-400/40 mt-4 tracking-widest">
              &gt; AUTHENTICATE TO CONTINUE
            </p>
          </div>
          
          <div className="text-center">
            <p className="font-mono text-[10px] text-emerald-200/50 tracking-widest uppercase">
              PRIVATE BY DEFAULT // NO SHARING // BOTANICAL INTELLIGENCE
            </p>
          </div>
        </div>
      </div>
    );
  }

  const CurrentThemeIcon = themeConfig[theme].icon;

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden grain-texture">
      <InterfaceOverlay isActive={overlayEnabled} currentPage={location} />
      
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/30 bg-card/50 backdrop-blur-sm p-4 fixed inset-y-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/40 to-accent/40 blur-sm" />
            <div className="relative w-full h-full rounded-lg bg-card border border-primary/20 flex items-center justify-center">
              <Trees className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight leading-none">Wildlands</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">BRUCE.OS</p>
          </div>
        </div>

        {/* Theme & Overlay Controls */}
        <div className="flex items-center gap-2 px-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={cycleTheme}
            className={cn("flex-1 text-xs gap-2", themeConfig[theme].color)}
            data-testid="button-theme-switch"
          >
            <CurrentThemeIcon className="w-3 h-3" />
            {themeConfig[theme].label}
          </Button>
          <Button
            variant={overlayEnabled ? "default" : "outline"}
            size="icon"
            onClick={() => setOverlayEnabled(!overlayEnabled)}
            className="shrink-0"
            data-testid="button-overlay-toggle"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase px-4 mb-2">FOREST SYSTEMS</p>
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        {/* Settings */}
        <div className="pt-4 border-t border-border/30">
          <NavLink href="/settings" label="System Config" icon={Settings} />
        </div>

        {/* User Profile */}
        <div className="pt-4 mt-4 border-t border-border/30">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="w-8 h-8 border border-primary/20">
              <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || 'User'} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" data-testid="text-username">
                {user?.firstName || 'Operator'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate tracking-wide">
                ACTIVE SESSION
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => logout()}
              className="shrink-0"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background/90 backdrop-blur-md border-b border-border/30 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-card border border-primary/20 flex items-center justify-center">
            <Trees className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold">Wildlands</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOverlayEnabled(!overlayEnabled)}
            className={overlayEnabled ? "text-primary" : ""}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-background/98 z-30 pt-16 px-4 lg:hidden animate-in fade-in duration-200">
          <div className="flex gap-2 mb-6">
            {(["field", "lab", "sanctuary"] as ThemeMode[]).map((t) => {
              const Icon = themeConfig[t].icon;
              return (
                <Button
                  key={t}
                  variant={theme === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme(t)}
                  className="flex-1 text-xs gap-1"
                >
                  <Icon className="w-3 h-3" />
                  {themeConfig[t].label}
                </Button>
              );
            })}
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <div key={item.href} onClick={() => setSidebarOpen(false)}>
                <NavLink {...item} />
              </div>
            ))}
            <div onClick={() => setSidebarOpen(false)} className="pt-4 mt-4 border-t border-border/30">
              <NavLink href="/settings" label="System Config" icon={Settings} />
            </div>
            <div className="pt-4 mt-4 border-t border-border/30">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign out
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 w-full min-h-screen overflow-y-auto pt-16 lg:pt-0 aurora-bg">
        <DemoBanner />
        <div className="container mx-auto max-w-6xl p-4 md:p-6 lg:p-8 animate-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
