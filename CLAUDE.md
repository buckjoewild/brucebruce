# Claude Code Instructions

## Highest Leverage Help Tasks

These are the areas where I can provide the most value to this project:

### Code & Engineering
- Debugging complex issues across large codebases
- Implementing features end-to-end (design, code, test)
- Refactoring and modernizing legacy code
- Writing tests and improving coverage
- Code reviews and identifying bugs/vulnerabilities

### Codebase Understanding
- Exploring and explaining unfamiliar codebases
- Tracing data flow and understanding architecture
- Finding where specific functionality lives
- Documenting how systems work

### Automation & DevOps
- Writing build scripts, CI/CD configs
- Git operations (commits, PRs, branch management)
- Setting up tooling and configurations

### Research & Analysis
- Searching the web for current docs, APIs, best practices
- Comparing libraries/frameworks for a specific use case
- Analyzing data files (CSV, JSON, Excel) with Python/Node

### Browser Automation
- Navigating websites and extracting information
- Filling forms and interacting with web apps
- Taking screenshots and recording workflows as GIFs

### File & System Operations
- Reading, writing, and editing files across your system
- Searching for files and content across directories
- Organizing and managing files

### Planning & Architecture
- Breaking down complex tasks into actionable steps
- Designing implementation approaches before writing code
- Identifying tradeoffs between different solutions

## Operating Principles

- **Highest leverage**: Tedious but well-defined tasks
  - Fixing bulk errors (type errors, linting issues)
  - Renaming symbols across codebases
  - Implementing features with clear specifications
  - Exploring unfamiliar repos to answer specific questions

- **Task structure**: Clear scope > speed
  - Ask for clarification if scope is ambiguous
  - Show current state before modifying files
  - Test changes before considering work complete
  - Keep changes minimal and reversible

## How to Work Together

When requesting help:
1. Be specific about what you're working on
2. Provide context if jumping between projects
3. Ask me to verify or test changes before moving forward
4. Use `/help` in Claude Code for available commands


## GRAVITY Hard Rules (Non-negotiable)

### Scope
WRITE: C:\GRAVITY only
READ:  C:\Users\wilds\harriswildlands.com (reference only)
SUPPORT EXECUTE: C:\Users\wilds\Desktop\UV (execute only)

### Proof Gate (No Proof = INCOMPLETE)
I may NOT claim TEST or PUBLISH complete without:
1) Output log captured in C:\GRAVITY\04_LOGS\*_OUTPUT_YYYY-MM-DD.txt
2) Exit code captured in C:\GRAVITY\04_LOGS\*_EXITCODE_YYYY-MM-DD.txt (echo %ERRORLEVEL%)
3) Bundle listing captured: dir /s /b C:\GRAVITY\06_PUBLISH\bundle_*

If I cannot run required commands in my context, I must STOP and request FOREMAN to run the exact CMD commands and paste outputs.
No simulation. No "context constraints" completion claims.

### Windows Reality
BAT files require Windows CMD. If I'm in bash-like context, I must switch to CMD for execution/proof.
