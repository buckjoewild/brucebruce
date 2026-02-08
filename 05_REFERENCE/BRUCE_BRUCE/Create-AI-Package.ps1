# HarrisWildlands AI Collaboration Package Creator (PowerShell)
# No Node.js required - pure PowerShell file copying

Write-Host ""
Write-Host "========================================================"
Write-Host " HarrisWildlands AI Collaboration Package Creator"
Write-Host "========================================================"
Write-Host ""

$ProjectRoot = "C:\Users\wilds\harriswildlands.com"
$OutputDir = "C:\Users\wilds\Desktop\harriswildlands-ai-package"

# Essential files to copy
$EssentialFiles = @(
    # === CORE SOURCE CODE ===
    
    # Frontend Entry Points
    "client\src\App.tsx",
    "client\src\main.tsx",
    "client\src\index.css",
    
    # All Page Components
    "client\src\pages\BruceOps.tsx",
    "client\src\pages\Dashboard.tsx",
    "client\src\pages\LifeOps.tsx",
    "client\src\pages\ThinkOps.tsx",
    "client\src\pages\Goals.tsx",
    "client\src\pages\WeeklyReview.tsx",
    "client\src\pages\Settings.tsx",
    "client\src\pages\TeachingAssistant.tsx",
    "client\src\pages\HarrisWildlands.tsx",
    "client\src\pages\Chat.tsx",
    "client\src\pages\RealityCheck.tsx",
    "client\src\pages\not-found.tsx",
    
    # Core Components
    "client\src\components\Layout.tsx",
    "client\src\components\InterfaceOverlay.tsx",
    "client\src\components\BotanicalMotifs.tsx",
    "client\src\components\DemoBanner.tsx",
    "client\src\components\HoverRevealImage.tsx",
    "client\src\components\PageBackground.tsx",
    "client\src\components\ThemeProvider.tsx",
    "client\src\components\CanopyView.tsx",
    
    # Hooks
    "client\src\hooks\use-auth.ts",
    "client\src\hooks\use-demo.tsx",
    "client\src\hooks\use-bruce-ops.ts",
    "client\src\hooks\use-mobile.tsx",
    "client\src\hooks\use-toast.ts",
    
    # Utilities
    "client\src\lib\queryClient.ts",
    "client\src\lib\utils.ts",
    "client\src\lib\auth-utils.ts",
    "client\src\lib\coreImagery.ts",
    
    # Backend Core
    "server\index.ts",
    "server\routes.ts",
    "server\storage.ts",
    "server\db.ts",
    "server\vite.ts",
    "server\static.ts",
    "server\google-drive.ts",
    
    # Auth Integration
    "server\replit_integrations\auth\index.ts",
    "server\replit_integrations\auth\replitAuth.ts",
    "server\replit_integrations\auth\routes.ts",
    "server\replit_integrations\auth\storage.ts",
    
    # Shared Contract Layer (CRITICAL)
    "shared\schema.ts",
    "shared\routes.ts",
    "shared\thinkopsNodes.ts",
    "shared\models\auth.ts",
    
    # === CONFIGURATION FILES ===
    
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "tailwind.config.ts",
    "postcss.config.js",
    "components.json",
    "drizzle.config.ts",
    
    # Deployment
    "Dockerfile",
    "docker-compose.yml",
    ".replit",
    ".env.example",
    ".gitignore",
    
    # Build Scripts
    "script\build.ts",
    "script\seed.ts",
    
    # === DOCUMENTATION ===
    
    # Main Docs
    "docs\README.md",
    "docs\ARCHITECTURE.md",
    "docs\CODEBASE.md",
    "docs\TECHNICAL_EVIDENCE.md",
    "docs\STANDALONE.md",
    
    # Technical Manual (All Volumes)
    "docs\manual\TECHNICAL_MANUAL.md",
    "docs\manual\VOL01_EXECUTIVE_OVERVIEW.md",
    "docs\manual\VOL02_TECH_STACK.md",
    "docs\manual\VOL03_ARCHITECTURE.md",
    "docs\manual\VOL04_FILE_STRUCTURE.md",
    "docs\manual\VOL05_DATABASE_SCHEMA.md",
    "docs\manual\VOL06_API_CATALOG.md",
    "docs\manual\VOL07_AI_INTEGRATION.md",
    "docs\manual\VOL08_USER_WORKFLOWS.md",
    "docs\manual\VOL09_COMPONENTS.md",
    "docs\manual\VOL10_CONFIGURATION.md",
    "docs\manual\VOL11_DEPLOYMENT.md",
    "docs\manual\VOL12_SECURITY.md",
    "docs\manual\VOL13_EXTENSION_PATTERNS.md",
    "docs\manual\VOL14_TROUBLESHOOTING.md",
    "docs\manual\VOL15_TESTING.md",
    "docs\manual\VOL16_MAINTENANCE.md",
    "docs\manual\VOL17_ROADMAP.md",
    "docs\manual\VOL18_APPENDICES.md",
    
    # User Guides
    "docs\00-start-here\00-overview-and-reading-paths.md",
    "docs\00-start-here\01-glossary.md",
    
    # Design
    "design_guidelines.md",
    "HarrisWildlands_UIKit_v1\Docs\README.md",
    "HarrisWildlands_UIKit_v1\Docs\UI_Spec_Sheet.md",
    
    # Release
    "release\README.md",
    "release\CHECKLIST.md",
    "release\STANDALONE_EXPORT_PLAN.md",
    "release\HOW_TO_DOWNLOAD.md",
    "replit.md"
)

# UI Components (important ones)
$UIComponents = @(
    "client\src\components\ui\button.tsx",
    "client\src\components\ui\card.tsx",
    "client\src\components\ui\input.tsx",
    "client\src\components\ui\textarea.tsx",
    "client\src\components\ui\select.tsx",
    "client\src\components\ui\dialog.tsx",
    "client\src\components\ui\badge.tsx",
    "client\src\components\ui\tabs.tsx",
    "client\src\components\ui\table.tsx",
    "client\src\components\ui\toast.tsx",
    "client\src\components\ui\toaster.tsx"
)

Write-Host "[1/4] Cleaning old package directory..."
if (Test-Path $OutputDir) {
    Remove-Item -Path $OutputDir -Recurse -Force
}
New-Item -Path $OutputDir -ItemType Directory -Force | Out-Null

Write-Host "[2/4] Copying essential files..."
$Copied = 0
$Missing = 0

$AllFiles = $EssentialFiles + $UIComponents

foreach ($File in $AllFiles) {
    $SourcePath = Join-Path $ProjectRoot $File
    $DestPath = Join-Path $OutputDir $File
    
    # Create directory if needed
    $DestDir = Split-Path $DestPath -Parent
    if (-not (Test-Path $DestDir)) {
        New-Item -Path $DestDir -ItemType Directory -Force | Out-Null
    }
    
    if (Test-Path $SourcePath) {
        Copy-Item -Path $SourcePath -Destination $DestPath -Force
        Write-Host "  ✓ $File" -ForegroundColor Green
        $Copied++
    } else {
        Write-Host "  ⚠ MISSING: $File" -ForegroundColor Yellow
        $Missing++
    }
}

Write-Host ""
Write-Host "[3/4] Creating package README..."

$ReadmeContent = @"
# HarrisWildlands AI Collaboration Package

**Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Source:** C:\Users\wilds\harriswildlands.com

## 📦 Package Contents

This package contains $Copied essential files for AI collaboration:

- **Source Code:** All TypeScript/React frontend and Express backend files
- **Configuration:** Build configs, deployment files, environment templates
- **Documentation:** Complete technical manual (18 volumes) + guides
- **Schemas:** Database schema and API contracts

## 🎯 Quick Start for AI Systems

### Understanding the Project
1. Read: ``docs\manual\TECHNICAL_MANUAL.md`` (index)
2. Read: ``docs\manual\VOL01_EXECUTIVE_OVERVIEW.md`` (project overview)
3. Read: ``docs\manual\VOL05_DATABASE_SCHEMA.md`` (data model)
4. Read: ``docs\manual\VOL06_API_CATALOG.md`` (API surface)

### Key Files for Modification
- ``server\routes.ts`` - All API endpoints
- ``shared\schema.ts`` - Database schema
- ``shared\routes.ts`` - API contracts
- ``client\src\pages\*.tsx`` - UI pages

### Development Commands
``````bash
npm install
npm run dev           # Start development server
npm run build         # Production build
npm run db:push       # Sync database schema
``````

## 📊 Statistics

- **Files Copied:** $Copied
- **Files Missing:** $Missing
- **Languages:** TypeScript, React, CSS
- **Framework:** Vite + Express + Drizzle ORM

## 🔐 Security

This package does NOT include:
- ``.env`` (secrets/API keys)
- ``node_modules/`` (dependencies)
- ``.git/`` (version history)
- Database dumps

All sensitive data has been excluded. Only source code and documentation are included.

## 📝 What's Included

### Core Source Code
- All React frontend pages and components
- All Express backend routes and storage
- Complete authentication system
- Database schema and API contracts

### Documentation
- 18-volume technical manual
- User guides and operator guides
- Architecture and design documents
- API catalog and database schema reference

### Configuration
- All build configuration files
- Deployment configs (Docker, Replit)
- Environment variable templates

## 🚀 How to Use

**For ChatGPT:**
- Upload specific files as needed
- Start with ``server\routes.ts`` and ``shared\schema.ts``

**For Claude:**
- Upload entire package as ZIP
- Ask for architecture analysis or code review

**For Replit:**
- Share via GitHub repository
- Replit has direct file access

## 📞 Support

This package was created to enable seamless AI collaboration on the HarrisWildlands project.
All files are organized by category and purpose for easy navigation.

---

**Ready to share with AI systems!** 🚀
"@

$ReadmePath = Join-Path $OutputDir "README.md"
$ReadmeContent | Out-File -FilePath $ReadmePath -Encoding UTF8

Write-Host "  ✓ README.md created" -ForegroundColor Green

Write-Host ""
Write-Host "[4/4] Creating file list..."

$FileListContent = @"
# HarrisWildlands AI Package - Complete File List

**Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Total Files:** $Copied

## Files Included

"@

foreach ($File in $AllFiles) {
    if (Test-Path (Join-Path $ProjectRoot $File)) {
        $FileListContent += "- $File`n"
    }
}

$FileListPath = Join-Path $OutputDir "FILE_LIST.md"
$FileListContent | Out-File -FilePath $FileListPath -Encoding UTF8

Write-Host "  ✓ FILE_LIST.md created" -ForegroundColor Green

Write-Host ""
Write-Host "============================================================"
Write-Host "✅ AI COLLABORATION PACKAGE CREATED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "============================================================"
Write-Host ""
Write-Host "📁 Location: $OutputDir" -ForegroundColor Cyan
Write-Host "📊 Files copied: $Copied" -ForegroundColor Cyan
Write-Host "⚠️  Files missing: $Missing" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor White
Write-Host "  1. Right-click the folder and select 'Send to > Compressed (zipped) folder'"
Write-Host "  2. Share the ZIP file with ChatGPT, Claude, or Replit"
Write-Host "  3. Include AI_COLLABORATION_PACKAGE.md for usage instructions"
Write-Host ""
Write-Host "💡 The package is ready to share with AI systems!" -ForegroundColor Green
Write-Host ""

# Keep window open
Read-Host "Press Enter to exit"
