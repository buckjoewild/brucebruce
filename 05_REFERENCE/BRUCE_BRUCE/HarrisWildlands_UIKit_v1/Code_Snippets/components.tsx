// HarrisWildlands Component Patterns
// Botanical Sci-Fi Design System

// Theme Toggle with Three Modes
export function ThemeToggle() {
  const [theme, setTheme] = useState<'field' | 'lab' | 'sanctuary'>('field');
  
  const cycleTheme = () => {
    const next = theme === 'field' ? 'lab' : theme === 'lab' ? 'sanctuary' : 'field';
    setTheme(next);
    document.documentElement.classList.remove('dark', 'sanctuary');
    if (next === 'lab') document.documentElement.classList.add('dark');
    if (next === 'sanctuary') document.documentElement.classList.add('sanctuary');
  };
  
  return (
    <Button size="icon" variant="ghost" onClick={cycleTheme}>
      {theme === 'field' && <Sun className="h-4 w-4" />}
      {theme === 'lab' && <Moon className="h-4 w-4" />}
      {theme === 'sanctuary' && <Leaf className="h-4 w-4" />}
    </Button>
  );
}

// Lane Badge Component
interface LaneBadgeProps {
  lane: 'lifeops' | 'thinkops' | 'teaching' | 'harriswildlands';
  children: React.ReactNode;
}

export function LaneBadge({ lane, children }: LaneBadgeProps) {
  const laneStyles = {
    lifeops: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    thinkops: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    teaching: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    harriswildlands: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  };
  
  return (
    <Badge className={laneStyles[lane]}>
      {children}
    </Badge>
  );
}

// Glass Card for overlaying on images
export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "backdrop-blur-md bg-background/70 border border-border/50 rounded-md p-4",
      className
    )}>
      {children}
    </div>
  );
}

// Bio-luminescent glow effect for Lab theme
export function GlowRing({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
      <div className="relative">{children}</div>
    </div>
  );
}

// Nature-inspired divider
export function OrganicDivider() {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      <Leaf className="h-4 w-4 text-muted-foreground" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}

// Animated loading indicator
export function GrowthLoader() {
  return (
    <div className="flex items-end gap-1 h-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full animate-pulse"
          style={{
            height: `${20 + i * 10}%`,
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}
