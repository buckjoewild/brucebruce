# How to Download This Project

Since direct download from Replit can be unreliable, we've created pre-packaged zip files:

## Method 1: Download Zip from Replit UI (Easiest)
1. In Replit Files pane, navigate to `/release/`
2. Right-click on the zip file you want:
   - `harriswildlands-source.zip` - Full source code for development
   - `harriswildlands-prod-bundle.zip` - Ready-to-run Docker bundle
3. Select "Download"

## Method 2: Push to GitHub
1. Open the Git pane in Replit (left sidebar)
2. Create a new GitHub repository or connect to existing
3. Commit all changes
4. Push to GitHub
5. Clone from GitHub on your local machine

## Method 3: Shell Command (If Replit Shell Works)
1. Zips are already created in `/release/`
2. In Replit Shell, run:
   ```bash
   # Verify zips exist
   ls -lh release/*.zip
   
   # If you have a way to transfer files (scp, cloud storage CLI):
   # Example: rclone copy release/*.zip mydrive:backups/
   ```

## What's in Each Zip?

**harriswildlands-source.zip**: Everything you need to develop
- Source code (TypeScript, React components)
- Configuration files
- Documentation
- Scripts and tooling

**harriswildlands-prod-bundle.zip**: Everything you need to deploy
- Pre-built `dist/` folder
- Docker configuration
- README and setup docs
- No source code (smaller file)

## After Download
1. Extract the zip file
2. Follow instructions in `README.md`
3. Run `docker compose up` or set up local development
