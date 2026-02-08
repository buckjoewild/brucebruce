#!/usr/bin/env node

/**
 * HarrisWildlands AI Collaboration Package Generator
 * 
 * This script creates a complete bundle of all files that AI systems
 * (ChatGPT, Claude, Replit) need to understand and work with the project.
 * 
 * Usage:
 *   node create-ai-package.js
 * 
 * Output:
 *   harriswildlands-ai-package/ directory with all essential files
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = 'C:\\Users\\wilds\\harriswildlands.com';
const OUTPUT_DIR = 'C:\\Users\\wilds\\Desktop\\harriswildlands-ai-package';

// Essential files that AI systems need
const ESSENTIAL_FILES = [
  // === CORE SOURCE CODE ===
  
  // Frontend Entry Points
  'client/src/App.tsx',
  'client/src/main.tsx',
  'client/src/index.css',
  
  // All Page Components (Core UI)
  'client/src/pages/BruceOps.tsx',
  'client/src/pages/Dashboard.tsx',
  'client/src/pages/LifeOps.tsx',
  'client/src/pages/ThinkOps.tsx',
  'client/src/pages/Goals.tsx',
  'client/src/pages/WeeklyReview.tsx',
  'client/src/pages/Settings.tsx',
  'client/src/pages/TeachingAssistant.tsx',
  'client/src/pages/HarrisWildlands.tsx',
  'client/src/pages/Chat.tsx',
  'client/src/pages/RealityCheck.tsx',
  'client/src/pages/not-found.tsx',
  
  // Core Components
  'client/src/components/Layout.tsx',
  'client/src/components/InterfaceOverlay.tsx',
  'client/src/components/BotanicalMotifs.tsx',
  'client/src/components/DemoBanner.tsx',
  'client/src/components/HoverRevealImage.tsx',
  'client/src/components/PageBackground.tsx',
  'client/src/components/ThemeProvider.tsx',
  'client/src/components/CanopyView.tsx',
  
  // Hooks
  'client/src/hooks/use-auth.ts',
  'client/src/hooks/use-demo.tsx',
  'client/src/hooks/use-bruce-ops.ts',
  'client/src/hooks/use-mobile.tsx',
  'client/src/hooks/use-toast.ts',
  
  // Utilities
  'client/src/lib/queryClient.ts',
  'client/src/lib/utils.ts',
  'client/src/lib/auth-utils.ts',
  'client/src/lib/coreImagery.ts',
  
  // Backend Core
  'server/index.ts',
  'server/routes.ts',
  'server/storage.ts',
  'server/db.ts',
  'server/vite.ts',
  'server/static.ts',
  'server/google-drive.ts',
  
  // Auth Integration
  'server/replit_integrations/auth/index.ts',
  'server/replit_integrations/auth/replitAuth.ts',
  'server/replit_integrations/auth/routes.ts',
  'server/replit_integrations/auth/storage.ts',
  
  // Shared Contract Layer (CRITICAL)
  'shared/schema.ts',
  'shared/routes.ts',
  'shared/thinkopsNodes.ts',
  'shared/models/auth.ts',
  
  // === CONFIGURATION FILES ===
  
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'components.json',
  'drizzle.config.ts',
  
  // Deployment
  'Dockerfile',
  'docker-compose.yml',
  '.replit',
  '.env.example',
  '.gitignore',
  
  // Build Scripts
  'script/build.ts',
  'script/seed.ts',
  
  // === DOCUMENTATION ===
  
  // Main Docs
  'docs/README.md',
  'docs/ARCHITECTURE.md',
  'docs/CODEBASE.md',
  'docs/TECHNICAL_EVIDENCE.md',
  'docs/STANDALONE.md',
  
  // Technical Manual (All Volumes)
  'docs/manual/TECHNICAL_MANUAL.md',
  'docs/manual/VOL01_EXECUTIVE_OVERVIEW.md',
  'docs/manual/VOL02_TECH_STACK.md',
  'docs/manual/VOL03_ARCHITECTURE.md',
  'docs/manual/VOL04_FILE_STRUCTURE.md',
  'docs/manual/VOL05_DATABASE_SCHEMA.md',
  'docs/manual/VOL06_API_CATALOG.md',
  'docs/manual/VOL07_AI_INTEGRATION.md',
  'docs/manual/VOL08_USER_WORKFLOWS.md',
  'docs/manual/VOL09_COMPONENTS.md',
  'docs/manual/VOL10_CONFIGURATION.md',
  'docs/manual/VOL11_DEPLOYMENT.md',
  'docs/manual/VOL12_SECURITY.md',
  'docs/manual/VOL13_EXTENSION_PATTERNS.md',
  'docs/manual/VOL14_TROUBLESHOOTING.md',
  'docs/manual/VOL15_TESTING.md',
  'docs/manual/VOL16_MAINTENANCE.md',
  'docs/manual/VOL17_ROADMAP.md',
  'docs/manual/VOL18_APPENDICES.md',
  
  // User Guides
  'docs/00-start-here/00-overview-and-reading-paths.md',
  'docs/00-start-here/01-glossary.md',
  
  // Design
  'design_guidelines.md',
  'HarrisWildlands_UIKit_v1/Docs/README.md',
  'HarrisWildlands_UIKit_v1/Docs/UI_Spec_Sheet.md',
  
  // Release
  'release/README.md',
  'release/CHECKLIST.md',
  'release/STANDALONE_EXPORT_PLAN.md',
  'release/HOW_TO_DOWNLOAD.md',
  
  // This package documentation
  'replit.md',
];

// UI components to include (sample of most important ones)
const UI_COMPONENTS = [
  'client/src/components/ui/button.tsx',
  'client/src/components/ui/card.tsx',
  'client/src/components/ui/input.tsx',
  'client/src/components/ui/textarea.tsx',
  'client/src/components/ui/select.tsx',
  'client/src/components/ui/dialog.tsx',
  'client/src/components/ui/badge.tsx',
  'client/src/components/ui/tabs.tsx',
  'client/src/components/ui/table.tsx',
  'client/src/components/ui/toast.tsx',
  'client/src/components/ui/toaster.tsx',
];

function copyFile(src, dest) {
  const srcPath = path.join(PROJECT_ROOT, src);
  const destPath = path.join(OUTPUT_DIR, src);
  
  // Create directory if it doesn't exist
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  try {
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ ${src}`);
      return true;
    } else {
      console.log(`⚠ MISSING: ${src}`);
      return false;
    }
  } catch (err) {
    console.log(`✗ ERROR copying ${src}: ${err.message}`);
    return false;
  }
}

function main() {
  console.log('🚀 Creating HarrisWildlands AI Collaboration Package...\n');
  
  // Create output directory
  if (fs.existsSync(OUTPUT_DIR)) {
    console.log(`📁 Cleaning existing package directory...`);
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  let copied = 0;
  let missing = 0;
  
  // Copy all essential files
  console.log('📦 Copying essential files...\n');
  
  const allFiles = [...ESSENTIAL_FILES, ...UI_COMPONENTS];
  
  for (const file of allFiles) {
    if (copyFile(file)) {
      copied++;
    } else {
      missing++;
    }
  }
  
  // Create README in package
  const readmePath = path.join(OUTPUT_DIR, 'README.md');
  const readmeContent = `# HarrisWildlands AI Collaboration Package

**Generated:** ${new Date().toISOString()}
**Source:** C:\\Users\\wilds\\harriswildlands.com

## 📦 Package Contents

This package contains ${copied} essential files for AI collaboration:

- **Source Code:** All TypeScript/React frontend and Express backend files
- **Configuration:** Build configs, deployment files, environment templates
- **Documentation:** Complete technical manual (18 volumes) + guides
- **Schemas:** Database schema and API contracts

## 🎯 Quick Start for AI Systems

### Understanding the Project
1. Read: \`docs/manual/TECHNICAL_MANUAL.md\` (index)
2. Read: \`docs/manual/VOL01_EXECUTIVE_OVERVIEW.md\` (project overview)
3. Read: \`docs/manual/VOL05_DATABASE_SCHEMA.md\` (data model)
4. Read: \`docs/manual/VOL06_API_CATALOG.md\` (API surface)

### Key Files for Modification
- \`server/routes.ts\` - All API endpoints
- \`shared/schema.ts\` - Database schema
- \`shared/routes.ts\` - API contracts
- \`client/src/pages/*.tsx\` - UI pages

### Development Commands
\`\`\`bash
npm install
npm run dev           # Start development server
npm run build         # Production build
npm run db:push       # Sync database schema
\`\`\`

## 📊 Statistics

- Files: ${copied}
- Missing: ${missing}
- Languages: TypeScript, React, CSS
- Framework: Vite + Express + Drizzle ORM

## 🔐 Security

This package does NOT include:
- \`.env\` (secrets/API keys)
- \`node_modules/\` (dependencies)
- \`.git/\` (version history)
- Database dumps

All sensitive data has been excluded. Only source code and documentation are included.

## 📝 Next Steps

1. **ChatGPT:** Use for code generation and feature development
2. **Claude:** Use for architecture analysis and refinement
3. **Replit Agent:** Use for direct deployment and modification

See \`AI_COLLABORATION_PACKAGE.md\` for detailed usage guide.
`;
  
  fs.writeFileSync(readmePath, readmeContent);
  console.log('\n✓ README.md created');
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ AI COLLABORATION PACKAGE CREATED');
  console.log('='.repeat(60));
  console.log(`\n📁 Location: ${OUTPUT_DIR}`);
  console.log(`📊 Files copied: ${copied}`);
  console.log(`⚠️  Files missing: ${missing}`);
  console.log(`\n🎯 This package is ready to share with AI systems!`);
  console.log(`\n💡 Compress to ZIP for easier sharing:`);
  console.log(`   Right-click folder → Send to → Compressed (zipped) folder`);
}

main();
