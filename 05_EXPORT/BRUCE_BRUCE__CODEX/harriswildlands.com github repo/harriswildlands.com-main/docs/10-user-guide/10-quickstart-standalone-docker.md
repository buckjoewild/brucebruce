# Standalone quickstart (Docker)

**Audience:** End users (beginner-friendly)  
**Status:** VERIFIED  
**Last updated:** 2025-12-27

## Purpose

Get the app running on your own machine using Docker (no Replit required).

## Prerequisites

- Internet access (setup/download only)
- Docker Desktop installed
- Git installed

## Steps

### Step 1: Install Docker Desktop

1. Download from [docker.com](https://docker.com)
2. Install and start Docker Desktop
3. Verify it works:
   ```bash
   docker --version
   ```
   You should see something like `Docker version 24.x.x`

### Step 2: Get the application files

1. Clone the repository:
   ```bash
   git clone https://github.com/buckjoewild/harriswildlands.com.git
   ```

2. Enter the folder:
   ```bash
   cd harriswildlands.com
   ```

### Step 3: Configure environment

1. Copy the example configuration:
   - **Windows:** `copy .env.example .env`
   - **Mac/Linux:** `cp .env.example .env`

2. The defaults work out of the box:
   - Replit keys are **not needed** for standalone mode
   - AI keys are **optional** (AI features will be off without them)
   - Database is auto-configured by Docker

### Step 4: Start the application

```bash
docker compose up
```

Wait for the message indicating the app is ready (usually "ready on port 5000").

**Troubleshooting:**
- If it fails, ensure Docker Desktop is running
- Try rebuilding: `docker compose up --build`

### Step 5: Use the app

1. Open your browser to: `http://localhost:5000`
2. You're automatically logged in (standalone mode)
3. Your data is saved to the database

## Core features

| Feature | What it does |
|---------|--------------|
| **Daily Logging (LifeOps)** | Quick yes/no checks and 1-10 scales. Under 5 minutes. |
| **Ideas (ThinkOps)** | Capture and track ideas with status (draft, promoted, etc.) |
| **Weekly Review** | See your completion rates and drift signals |
| **Export Data** | Download your data as a JSON file |

## Stop / restart

- **Stop:** Press `Ctrl+C` in the terminal
- **Restart:** `docker compose up`

## Updating to a new version

```bash
git pull
docker compose up --build
```

## Accessing from your phone

You can access the app from your phone on the same network:

1. Find your computer's IP address:
   - **Windows:** `ipconfig` (look for IPv4 Address)
   - **Mac/Linux:** `ifconfig` or `ip addr`

2. On your phone, open: `http://YOUR_IP:5000`

**Security note:** See `20-operator-guide/24-security-local-lan-and-auth-modes.md` for LAN security considerations.

## References

- Demo mode explained: `11-first-run-demo-mode.md`
- Troubleshooting: `16-troubleshooting.md`
- Operator guide: `20-operator-guide/20-standalone-deployment-docker-compose.md`
