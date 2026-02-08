# HarrisWildlands UI Kit v1

A complete visual asset kit for the HarrisWildlands brand, featuring the "botanical sci-fi" design system used across BruceOps/Thought Weaver.

## Folder Structure

```
HarrisWildlands_UIKit_v1/
├── UI_Embedded_Images/     # Full-resolution UI mockups
│   ├── root-ui.png         # Root/foundation layer design
│   ├── trunk-ui.png        # Core navigation layer
│   ├── canopy-ui.png       # Top-level overview
│   └── lifeops-dashboard.png
├── Optimized/              # WebP versions for production
│   └── *.webp              # Compressed web-ready images
├── Components/             # Reusable UI elements
│   ├── icons/              # Icon assets
│   └── overlays/           # Decorative overlays
├── Code_Snippets/          # Implementation code
│   ├── theme-colors.css    # Color variables
│   └── components.tsx      # React components
└── Docs/
    ├── README.md           # This file
    └── UI_Spec_Sheet.md    # Design specifications
```

## Design System: Botanical Sci-Fi

### Color Palettes (Three Themes)

**Field Mode (Light/Natural)**
- Background: Warm cream/wheat tones
- Accents: Forest greens, earth browns
- Text: Deep charcoal

**Lab Mode (Dark/Technical)**
- Background: Deep navy/slate
- Accents: Electric cyan, bioluminescent greens
- Text: Soft white

**Sanctuary Mode (Calm/Focus)**
- Background: Soft sage/muted greens
- Accents: Warm amber, gentle gold
- Text: Warm gray

### Usage

1. Place full-resolution images in `UI_Embedded_Images/`
2. Convert to WebP and place in `Optimized/`
3. Extract icons and save to `Components/icons/`
4. Reference `Code_Snippets/` for implementation

## Image Sources

Images should be exported from ChatGPT image generation history:
- Search your ChatGPT history for "HarrisWildlands UI" or "botanical sci-fi dashboard"
- Download full resolution versions
- Name according to the structure above

## Quick Start

```bash
# After adding images, create the distribution zip:
cd HarrisWildlands_UIKit_v1
zip -r ../HarrisWildlands_UIKit_v1.zip .
```
