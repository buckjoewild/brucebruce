# HarrisWildlands UI Specification Sheet

## Visual Identity

**Brand Name:** HarrisWildlands
**Design Language:** Botanical Sci-Fi
**Tagline:** Where nature meets innovation

## Typography

### Primary Font Stack
```css
font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Type Scale
- **Display:** 2.5rem (40px) - Hero headings
- **H1:** 2rem (32px) - Page titles
- **H2:** 1.5rem (24px) - Section headers
- **H3:** 1.25rem (20px) - Card titles
- **Body:** 1rem (16px) - Standard text
- **Small:** 0.875rem (14px) - Labels, captions
- **Micro:** 0.75rem (12px) - Timestamps, badges

## Color Tokens

### Field Theme (Default Light)
```css
:root {
  --background: 45 20% 96%;        /* Warm cream */
  --foreground: 30 10% 15%;        /* Deep charcoal */
  --card: 45 15% 98%;              /* Soft white */
  --primary: 142 45% 35%;          /* Forest green */
  --accent: 35 70% 45%;            /* Earth amber */
  --muted: 45 10% 85%;             /* Warm gray */
}
```

### Lab Theme (Dark Technical)
```css
.dark {
  --background: 220 25% 10%;       /* Deep navy */
  --foreground: 210 15% 95%;       /* Soft white */
  --card: 220 20% 14%;             /* Elevated slate */
  --primary: 175 70% 45%;          /* Electric cyan */
  --accent: 142 60% 50%;           /* Bio-luminescent green */
  --muted: 220 15% 25%;            /* Muted slate */
}
```

### Sanctuary Theme (Calm Focus)
```css
.sanctuary {
  --background: 120 15% 92%;       /* Soft sage */
  --foreground: 30 10% 25%;        /* Warm charcoal */
  --card: 120 10% 96%;             /* Light sage */
  --primary: 38 60% 50%;           /* Warm amber */
  --accent: 42 70% 55%;            /* Gentle gold */
  --muted: 120 8% 80%;             /* Muted sage */
}
```

## Spacing System

```css
--space-1: 0.25rem;   /* 4px - Tight */
--space-2: 0.5rem;    /* 8px - Small */
--space-3: 0.75rem;   /* 12px - Compact */
--space-4: 1rem;      /* 16px - Standard */
--space-5: 1.5rem;    /* 24px - Medium */
--space-6: 2rem;      /* 32px - Large */
--space-8: 3rem;      /* 48px - Section */
--space-10: 4rem;     /* 64px - Hero */
```

## Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Badges */
--radius-md: 0.375rem;  /* 6px - Buttons, cards */
--radius-lg: 0.5rem;    /* 8px - Modals */
--radius-full: 9999px;  /* Pills, avatars */
```

## Shadow Levels

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-glow: 0 0 20px rgba(var(--primary), 0.3);
```

## Component Specs

### Cards
- Padding: var(--space-4) to var(--space-6)
- Border-radius: var(--radius-md)
- Background: var(--card)
- Border: 1px solid var(--border) or none if elevated

### Buttons
- Height: 36px (default), 32px (sm), 40px (lg)
- Padding: 0 var(--space-4)
- Border-radius: var(--radius-md)
- Font-weight: 500

### Input Fields
- Height: 36px
- Padding: 0 var(--space-3)
- Border: 1px solid var(--border)
- Border-radius: var(--radius-md)

## Icon Guidelines

- Size: 16px (inline), 20px (standard), 24px (large)
- Stroke width: 1.5px - 2px
- Style: Rounded line icons (Lucide preferred)
- Color: Inherit from parent (currentColor)

## Animation

- Duration: 150ms (micro), 200ms (default), 300ms (emphasis)
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Hover transitions: background-color, transform
- Transform scale on hover: 1.02 (subtle)

## Responsive Breakpoints

```css
--bp-sm: 640px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
--bp-2xl: 1536px;
```

## Lane-Specific Accents

Each operational lane has a subtle color accent:

| Lane | Accent Color | Use Case |
|------|--------------|----------|
| LifeOps | Forest Green | Daily calibration, routines |
| ThinkOps | Electric Cyan | Ideas, projects |
| Teaching | Warm Amber | Lesson planning |
| HarrisWildlands | Bio Green | Brand content |
