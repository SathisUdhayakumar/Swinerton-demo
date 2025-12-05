# Deployment Guide

This document provides step-by-step instructions for deploying the Swinerton Demo to GitHub and Vercel.

---

## Prerequisites

### Required Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| Node.js 18+ | Runtime | [nodejs.org](https://nodejs.org/) |
| npm | Package manager | Included with Node.js |
| Git | Version control | [git-scm.com](https://git-scm.com/) |

### Optional Tools (Recommended)

| Tool | Purpose | Installation |
|------|---------|--------------|
| GitHub CLI | Automate repo creation | [cli.github.com](https://cli.github.com/) |
| Vercel CLI | Automate deployment | `npm i -g vercel` |

---

## Quick Deploy (Automated Script)

The fastest way to deploy:

```bash
# Make script executable
chmod +x tools/push_and_setup.sh

# Run the automated setup
bash tools/push_and_setup.sh
```

The script will:
1. Validate CLI tools are installed
2. Prompt for repo configuration
3. Create a GitHub repository
4. Push your code
5. Deploy to Vercel

---

## Manual Deployment Steps

### Step 1: Authenticate CLIs

#### GitHub CLI

```bash
# Install (macOS)
brew install gh

# Install (Windows)
winget install GitHub.cli

# Login
gh auth login

# Verify
gh auth status
```

#### Vercel CLI

```bash
# Install globally
npm i -g vercel

# Login
vercel login

# Verify
vercel whoami
```

---

### Step 2: Create GitHub Repository

#### Option A: Using GitHub CLI

```bash
# Create branch
git checkout -b feat/site-workflow-krane-chat

# Stage and commit
git add -A
git commit -m "feat: site workflow + chat + budgets"

# Create repo and push (replace YOUR_USERNAME)
gh repo create YOUR_USERNAME/swinerton-demo --private --source=. --remote=origin --push

# Push branch
git push -u origin feat/site-workflow-krane-chat
```

#### Option B: Using GitHub Web UI

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `swinerton-demo`
3. Visibility: Private (or Public)
4. Click **Create repository**
5. Copy the repository URL
6. Run locally:

```bash
git remote add origin https://github.com/YOUR_USERNAME/swinerton-demo.git
git branch -M main
git push -u origin main
```

---

### Step 3: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your GitHub repository
4. Framework Preset: Next.js (auto-detected)
5. Click **Deploy**

---

## Environment Variables

This demo uses **no external environment variables**. All data is mocked in-memory.

If you add real integrations, set environment variables in Vercel:

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Environment Variables**
3. Add your variables (e.g., `DATABASE_URL`, `API_KEY`)
4. Redeploy for changes to take effect

---

## Inspecting Logs on Vercel

### Deployment Logs

1. Vercel Dashboard → Your Project
2. Click **Deployments**
3. Click on a deployment
4. View **Build Logs** tab

### Runtime Logs (Functions)

1. Vercel Dashboard → Your Project
2. Click **Logs** tab
3. Filter by function name or time range

### Real-time Logs (CLI)

```bash
vercel logs --follow
```

---

## SSE Limitations on Serverless

⚠️ **Important Caveat**

Server-Sent Events (SSE) have limitations on Vercel's serverless platform:

| Issue | Description |
|-------|-------------|
| Timeout | Functions timeout after ~10-25 seconds |
| Cold starts | Connections drop when functions scale down |
| No persistence | In-memory EventBus resets between invocations |

### Workarounds

1. **For Demo**: SSE works in local development. On Vercel, dashboard may need manual refresh.

2. **For Production**: Consider:
   - Vercel Edge Functions (longer timeout)
   - External pub/sub service (Pusher, Ably, Supabase Realtime)
   - Database-backed polling as fallback

---

## Troubleshooting

### Build Fails on Vercel

```bash
# Check locally first
npm run build

# If TypeScript errors
npx tsc --noEmit

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### GitHub Push Rejected

```bash
# Check remote
git remote -v

# If wrong remote, update it
git remote set-url origin https://github.com/YOUR_USERNAME/swinerton-demo.git

# Force push (careful!)
git push -u origin main --force
```

### Vercel Deployment Stuck

```bash
# Cancel current deployment
vercel cancel

# Check project linking
vercel project ls

# Re-link project
vercel link
```

---

## Useful Commands Reference

```bash
# === Development ===
npm run dev              # Start dev server
npm run dev -- -p 3005   # Start on port 3005

# === Build ===
npm run build            # Production build
npm start                # Start production server

# === Git ===
git status               # Check status
git log --oneline -5     # Recent commits
git branch -a            # All branches

# === GitHub CLI ===
gh repo view             # View current repo
gh pr create             # Create pull request
gh issue list            # List issues

# === Vercel CLI ===
vercel                   # Preview deploy
vercel --prod            # Production deploy
vercel logs              # View logs
vercel env pull          # Pull env vars locally
```

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **GitHub CLI Docs**: [cli.github.com/manual](https://cli.github.com/manual)


