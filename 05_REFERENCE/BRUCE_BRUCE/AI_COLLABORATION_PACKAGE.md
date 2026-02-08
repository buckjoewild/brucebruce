# HarrisWildlands AI Collaboration Package

**Purpose:** This package contains all files that AI systems (ChatGPT, Claude, Replit Agent) need to understand, modify, and work with the HarrisWildlands project.

**Generated:** 2026-01-03
**Project Location:** `C:\Users\wilds\harriswildlands.com`

---

## 📋 Package Contents

### **Category 1: Core Source Code (Essential)**

#### **Frontend (React/TypeScript)**
```
client/src/
├── App.tsx                          # Main app component & routing
├── main.tsx                         # React entry point
├── index.css                        # Global styles
├── pages/                           # All page components
│   ├── BruceOps.tsx                 # Landing/orientation
│   ├── Dashboard.tsx                # Overview dashboard
│   ├── LifeOps.tsx                  # Daily logging interface
│   ├── ThinkOps.tsx                 # Idea capture & analysis
│   ├── Goals.tsx                    # Goal tracking
│   ├── WeeklyReview.tsx             # Weekly synthesis
│   ├── Settings.tsx                 # User settings
│   ├── TeachingAssistant.tsx        # Teaching tools
│   ├── HarrisWildlands.tsx          # Content generator
│   ├── Chat.tsx                     # AI chat interface
│   ├── RealityCheck.tsx             # Idea validation
│   └── not-found.tsx                # 404 page
├── components/                      # Reusable components
│   ├── Layout.tsx                   # Main layout wrapper
│   ├── InterfaceOverlay.tsx         # Terminal aesthetic overlay
│   ├── BotanicalMotifs.tsx          # Decorative elements
│   ├── DemoBanner.tsx               # Demo mode indicator
│   ├── HoverRevealImage.tsx         # Image interaction
│   ├── PageBackground.tsx           # Background visuals
│   ├── ThemeProvider.tsx            # Theme context
│   ├── CanopyView.tsx               # Visual navigation
│   └── ui/                          # shadcn/ui components (50+ files)
├── hooks/                           # Custom React hooks
│   ├── use-auth.ts                  # Authentication hook
│   ├── use-demo.tsx                 # Demo mode hook
│   ├── use-bruce-ops.ts             # BruceOps state
│   ├── use-mobile.tsx               # Mobile detection
│   └── use-toast.ts                 # Toast notifications
└── lib/                             # Utilities
    ├── queryClient.ts               # React Query setup
    ├── utils.ts                     # Helper functions
    ├── auth-utils.ts                # Auth utilities
    └── coreImagery.ts               # Image mappings
```

#### **Backend (Express/TypeScript)**
```
server/
├── index.ts                         # Server entry point & middleware
├── routes.ts                        # API route handlers (ALL ENDPOINTS)
├── storage.ts                       # Database operations
├── db.ts                            # Database connection
├── vite.ts                          # Vite dev server integration
├── static.ts                        # Static file serving
├── google-drive.ts                  # Google Drive integration
└── replit_integrations/
    └── auth/
        ├── index.ts                 # Auth initialization
        ├── replitAuth.ts            # Replit OIDC config
        ├── routes.ts                # Auth routes
        └── storage.ts               # Auth storage operations
```

#### **Shared (Contract Layer)**
```
shared/
├── schema.ts                        # Database schema (Drizzle ORM)
├── routes.ts                        # API route contract (Zod schemas)
├── thinkopsNodes.ts                 # ThinkOps data structures
└── models/
    └── auth.ts                      # Auth models
```

---

### **Category 2: Configuration Files (Critical)**

#### **Build & Dependencies**
```
Root Files:
├── package.json                     # Dependencies & scripts
├── package-lock.json                # Locked dependency versions
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite bundler config
├── tailwind.config.ts               # Tailwind CSS config
├── postcss.config.js                # PostCSS config
├── components.json                  # shadcn/ui config
└── drizzle.config.ts                # Database ORM config
```

#### **Deployment**
```
Deployment Files:
├── Dockerfile                       # Container build instructions
├── docker-compose.yml               # Multi-container setup
├── .replit                          # Replit deployment config
└── .env.example                     # Environment variables template
```

#### **Build Scripts**
```
script/
├── build.ts                         # Production build script
└── seed.ts                          # Database seeding
```

---

### **Category 3: Documentation (Context)**

#### **Technical Documentation**
```
docs/
├── README.md                        # Main documentation entry
├── ARCHITECTURE.md                  # System architecture
├── CODEBASE.md                      # Code organization
├── TECHNICAL_EVIDENCE.md            # Implementation proof
├── STANDALONE.md                    # Self-hosting guide
└── manual/                          # 18-volume technical manual
    ├── TECHNICAL_MANUAL.md          # Index
    ├── VOL01_EXECUTIVE_OVERVIEW.md
    ├── VOL02_TECH_STACK.md
    ├── VOL03_ARCHITECTURE.md
    ├── VOL04_FILE_STRUCTURE.md
    ├── VOL05_DATABASE_SCHEMA.md     # **CRITICAL: All DB tables**
    ├── VOL06_API_CATALOG.md         # **CRITICAL: All API endpoints**
    ├── VOL07_AI_INTEGRATION.md
    ├── VOL08_USER_WORKFLOWS.md
    ├── VOL09_COMPONENTS.md
    ├── VOL10_CONFIGURATION.md
    ├── VOL11_DEPLOYMENT.md
    ├── VOL12_SECURITY.md
    ├── VOL13_EXTENSION_PATTERNS.md
    ├── VOL14_TROUBLESHOOTING.md
    ├── VOL15_TESTING.md
    ├── VOL16_MAINTENANCE.md
    ├── VOL17_ROADMAP.md
    └── VOL18_APPENDICES.md
```

#### **User & Operator Guides**
```
docs/
├── 00-start-here/
│   ├── 00-overview-and-reading-paths.md
│   └── 01-glossary.md
├── 10-user-guide/                   # End-user documentation
├── 20-operator-guide/               # Deployment & operations
├── 30-developer-reference/          # Technical reference
├── 40-protocols-and-governance/     # System principles
└── 50-releases-and-evidence/        # Release tracking
```

---

### **Category 4: Project Context (Essential for AI Understanding)**

#### **Design Guidelines**
```
Root:
└── design_guidelines.md             # UI/UX design principles
```

#### **UI Kit**
```
HarrisWildlands_UIKit_v1/
├── Docs/
│   ├── README.md                    # UI kit overview
│   └── UI_Spec_Sheet.md             # Design specifications
└── Code_Snippets/
    ├── components.tsx               # Component patterns
    └── theme-colors.css             # Color system
```

#### **Release Package**
```
release/
├── README.md                        # Release documentation
├── CHECKLIST.md                     # Acceptance criteria
├── STANDALONE_EXPORT_PLAN.md        # Self-hosting strategy
└── HOW_TO_DOWNLOAD.md               # Distribution guide
```

---

## 🎯 Critical Files for AI Modification

### **Top 10 Files AI Systems Must Have Access To:**

1. **`server/routes.ts`** (850+ lines)
   - All API endpoint implementations
   - Business logic for LifeOps, ThinkOps, Goals, etc.
   - AI integration points

2. **`shared/schema.ts`** (500+ lines)
   - Complete database schema
   - All table definitions
   - Data relationships

3. **`shared/routes.ts`** (400+ lines)
   - API contract definitions
   - Zod validation schemas
   - Type-safe route contracts

4. **`client/src/pages/LifeOps.tsx`** (500+ lines)
   - Daily logging UI
   - Core user workflow

5. **`client/src/pages/ThinkOps.tsx`** (600+ lines)
   - Idea capture interface
   - AI reality check integration

6. **`server/storage.ts`** (800+ lines)
   - Database operations
   - CRUD functions
   - Data access layer

7. **`package.json`**
   - All dependencies
   - Build scripts
   - Project metadata

8. **`.env.example`**
   - Environment variables
   - Configuration options
   - API keys structure

9. **`docs/manual/VOL05_DATABASE_SCHEMA.md`**
   - Human-readable schema documentation
   - All tables, fields, relationships

10. **`docs/manual/VOL06_API_CATALOG.md`**
    - Complete API reference
    - All endpoints documented
    - Request/response examples

---

## 📦 How to Share This Package

### **Option 1: Complete Repository Clone**
```bash
# Clone the entire repo
git clone <your-repo-url>
cd harriswildlands.com

# Install dependencies
npm install

# AI can now access all files
```

### **Option 2: Essential Files Bundle (Recommended for AI Chat)**

**Create a zip with these core files:**
```
harriswildlands-ai-package.zip
├── server/
│   ├── routes.ts
│   ├── storage.ts
│   └── index.ts
├── shared/
│   ├── schema.ts
│   └── routes.ts
├── client/src/
│   ├── pages/
│   │   ├── LifeOps.tsx
│   │   ├── ThinkOps.tsx
│   │   └── Goals.tsx
│   └── App.tsx
├── docs/manual/
│   ├── VOL05_DATABASE_SCHEMA.md
│   ├── VOL06_API_CATALOG.md
│   └── VOL13_EXTENSION_PATTERNS.md
├── package.json
├── .env.example
└── README.md
```

### **Option 3: Context Document (This File + Key Files)**

Share this markdown file along with:
1. `server/routes.ts`
2. `shared/schema.ts`
3. `shared/routes.ts`
4. `docs/manual/VOL05_DATABASE_SCHEMA.md`
5. `docs/manual/VOL06_API_CATALOG.md`

---

## 🔍 What Each AI Needs to Know

### **For ChatGPT (Code Generation)**
**Primary Files:**
- `server/routes.ts` - To understand API patterns
- `shared/schema.ts` - To understand data model
- `client/src/pages/*.tsx` - To understand UI patterns
- `package.json` - To know available libraries

**Use Case:** "Add a new feature to track exercise routines"

### **For Claude (Architecture & Refinement)**
**Primary Files:**
- `docs/manual/VOL03_ARCHITECTURE.md` - System design
- `docs/manual/VOL05_DATABASE_SCHEMA.md` - Data model
- `docs/manual/VOL06_API_CATALOG.md` - API surface
- `server/routes.ts` - Implementation details

**Use Case:** "Analyze the scalability of the current architecture"

### **For Replit Agent (Direct Code Modification)**
**Direct Access Required:**
- ALL files in `server/`
- ALL files in `client/src/`
- ALL files in `shared/`
- `package.json`, `tsconfig.json`, config files

**Use Case:** "Deploy to Replit with working authentication"

---

## 🚀 Quick Start Commands for AI Collaboration

```bash
# Development
npm install
npm run dev

# Database
npm run db:push          # Sync schema to database

# Build
npm run build            # Production build

# Testing
npm run check            # TypeScript type check

# Docker
docker-compose up -d     # Start with PostgreSQL
```

---

## 📝 File Modification Guidelines for AI

### **Rules:**
1. **Never modify** files in `node_modules/` or `dist/`
2. **Always validate** changes against TypeScript compiler
3. **Preserve** existing route contracts in `shared/routes.ts`
4. **Maintain** database schema compatibility in `shared/schema.ts`
5. **Follow** existing code patterns (see `docs/manual/VOL13_EXTENSION_PATTERNS.md`)

### **Safe Modification Zones:**
- ✅ `server/routes.ts` - Add new endpoints
- ✅ `client/src/pages/*.tsx` - Modify UI
- ✅ `shared/schema.ts` - Add new tables/fields
- ✅ `shared/routes.ts` - Add new route contracts

### **High-Risk Modification Zones:**
- ⚠️ `server/index.ts` - Core server setup
- ⚠️ `server/db.ts` - Database connection
- ⚠️ `server/replit_integrations/auth/` - Authentication
- ⚠️ `client/src/main.tsx` - React initialization

---

## 🎯 Common AI Tasks & Required Files

### **Task: Add New API Endpoint**
**Files Needed:**
1. `shared/routes.ts` - Add route contract
2. `server/routes.ts` - Add implementation
3. `server/storage.ts` - Add database function (if needed)
4. `shared/schema.ts` - Add table (if needed)

### **Task: Modify UI Page**
**Files Needed:**
1. `client/src/pages/[PageName].tsx` - The page
2. `shared/routes.ts` - API contracts (for data fetching)
3. `client/src/components/ui/` - UI components

### **Task: Add New Database Table**
**Files Needed:**
1. `shared/schema.ts` - Define table
2. `server/storage.ts` - Add CRUD functions
3. `shared/routes.ts` - Add API contracts
4. `server/routes.ts` - Add endpoints

### **Task: Deploy to New Environment**
**Files Needed:**
1. `Dockerfile` or `docker-compose.yml`
2. `.env.example` - Copy to `.env` and configure
3. `package.json` - Understand scripts
4. `docs/20-operator-guide/` - Deployment docs

---

## 🔐 Security Note for AI Systems

**Sensitive Files (NEVER share publicly):**
- `.env` - Contains API keys and secrets
- `node_modules/` - Contains dependencies
- `.git/` - Contains commit history
- Database dumps or backups

**Safe to Share:**
- All source code files
- Configuration templates (`.env.example`)
- Documentation
- This collaboration package

---

## 📊 File Statistics

**Total Source Files:** ~120+
**Total Lines of Code:** ~15,000+
**Languages:** TypeScript (95%), CSS (3%), Config (2%)
**Key Dependencies:** React, Express, Drizzle ORM, TanStack Query, Tailwind CSS

---

## ✅ Verification Checklist

Before sharing this package with an AI, ensure:
- [ ] All source files are present
- [ ] `package.json` is included
- [ ] `.env.example` is provided (not `.env`)
- [ ] Documentation is up-to-date
- [ ] Schema and routes are synchronized
- [ ] No secrets or API keys are included

---

**This package enables AI systems to:**
- Understand the complete project architecture
- Modify code with full context
- Add new features following established patterns
- Debug issues with access to all relevant files
- Deploy and configure the application
- Extend functionality while maintaining consistency
