# BruceOps Holo-Atlas Design Guidelines

## Design Approach
**Reference-Based with Custom Botanical Sci-Fi Aesthetic**
Drawing from Linear's precision, Notion's modularity, and sci-fi interface design (Blade Runner, Mass Effect). Creating a high-tech nature control center that feels both organic and futuristic.

## Typography
**Font Stack:**
- Primary: "Inter" (800, 600, 500, 400) for UI elements and data
- Display: "Space Grotesk" (700, 600) for feature headers and mode titles
- Mono: "JetBrains Mono" (500, 400) for timestamps, data readouts, code-like elements

**Hierarchy:**
- Hero/Mode Titles: Space Grotesk 700, 3xl-4xl, tracking-tight
- Section Headers: Space Grotesk 600, xl-2xl
- Feature Labels: Inter 600, sm-base, uppercase, tracking-wide
- Body/Data: Inter 400, sm-base
- Metadata: JetBrains Mono 400, xs-sm, tracking-wider

## Layout System
**Spacing Units:** Tailwind 2, 4, 6, 8, 12, 16 for consistency
- Component padding: p-6 to p-8
- Section spacing: gap-8 to gap-12
- Card margins: space-y-4 to space-y-6
- Container max-width: max-w-7xl

**Grid Structure:**
- Dashboard: 12-column grid (lg:grid-cols-12) for flexible layouts
- Feature cards: 2-3 columns (md:grid-cols-2 lg:grid-cols-3)
- Split views: 60/40 or 50/50 ratio for main/sidebar layouts

## Component Library

**Navigation:**
- Top navbar with mode switcher (Field/Lab/Sanctuary tabs)
- Side rail with feature icons (LifeOps, ThinkOps, Goals, Teaching, Reality Check, Weekly Review, AI Chat)
- Mode indicator with animated glow effect on active state
- Breadcrumb trail using JetBrains Mono

**Cards/Panels:**
- Glass-morphism containers: backdrop-blur-xl with low opacity backgrounds
- Glowing borders (1px) that pulse subtly in mode colors
- Rounded-2xl corners for organic feel
- Nested cards use rounded-xl
- Elevation: Shadow-2xl for floating elements

**Data Display:**
- Reality Check Dashboard: Large stat cards in grid-cols-4, circular progress indicators with gradient fills
- Weekly Review Visualizer: Timeline view with connected nodes, data visualization charts with nature-inspired gradients
- LifeOps Logger: Daily entry cards with timestamp badges, tag pills with glow effects
- ThinkOps: Kanban-style columns or masonry grid for idea cards

**Interactive Elements:**
- Primary buttons: Solid with mode color, rounded-lg, px-6 py-3, medium weight text
- Secondary buttons: Outline with backdrop-blur background, same sizing
- Buttons on images: backdrop-blur-md background with white/10 opacity
- Input fields: Backdrop-blur containers, underline or subtle border, focus state glows in mode color
- Toggles/Switches: Custom pill-shaped with glow trail animation

**AI Features:**
- AI Chat: Full-height sidebar or modal, message bubbles with gradient backgrounds
- Teaching Assistant: Expandable panel with code syntax highlighting, step-by-step cards
- Suggestion chips: Pill-shaped with glowing edges, float above content

**Special Components:**
- Mode switcher: Tab bar with sliding indicator and color-shifting background
- Progress rings: Circular SVG with gradient stroke, percentage in center
- Status badges: Small pills with dot indicators, pulsing for active states
- Notification toasts: Top-right, glass morphism, slide-in animation

## Gradient Backgrounds
**Per Mode:**
- Field: Diagonal gradient from deep green to lime, with dark overlay (60% opacity)
- Lab: Radial gradient from teal to cyan, emanating from top-right
- Sanctuary: Warm gradient from amber to orange, soft horizontal blend
- Apply gradients to full viewport background, overlay with noise texture (5% opacity)

## Images

**Hero Section:**
Large full-width hero (h-screen or min-h-[600px]) with botanical sci-fi imagery:
- **Field Mode:** Lush bioluminescent forest with holographic plant analysis overlays, glowing fungi, scan lines
- **Lab Mode:** High-tech greenhouse laboratory, glass chambers with plants, holographic data readouts floating
- **Sanctuary Mode:** Warm meditation pod surrounded by amber-lit botanical environment, soft bokeh lights

All hero images use: Overlay gradient (dark at bottom 40% opacity), backdrop-blur on text containers, vignette effect

**Feature Illustrations:**
- LifeOps: Daily routine icon with nature elements
- ThinkOps: Brain/neural network merged with botanical patterns
- Goals: Growth/sprouting plant metaphor
- Reality Check: Holographic data sphere with plant tendrils
- Weekly Review: Timeline tree with data nodes as leaves

Place these as decorative elements within feature cards or section backgrounds.

## Animations
Minimal and purposeful:
- Mode transitions: 300ms ease color shifts
- Card hovers: Subtle glow intensity increase (150ms)
- Progress indicators: Smooth fill animations
- No scroll-triggered animations except fade-in on first load