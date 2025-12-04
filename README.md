# Swinerton Field Operations Demo

A Next.js demo application showcasing two integrated workflows for construction field operations:

1. **Workflow 1 (Ad-hoc Receipt Capture)** — WhatsApp-style chat interface for capturing receipts, OCR processing, project/cost-code assignment, and real-time dashboard updates via SSE.

2. **Workflow 2 (Subcontractor PO → Delivery Reconciliation)** — BOL scanning, PO matching, line-item comparison, approval workflows, and SSE-powered live dashboard.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Server-Sent Events (SSE)** for real-time updates
- **In-memory mock storage** (no database required)

---

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or on a specific port
npm run dev -- -p 3005
```

### Build for Production

```bash
npm run build
npm start
```

---

## Deployment

### Option 1: Automated Script

Run the helper script to create a GitHub repo and deploy to Vercel:

```bash
# Make script executable (first time only)
chmod +x tools/push_and_setup.sh

# Run the script
bash tools/push_and_setup.sh
```

### Option 2: Manual Git + GitHub CLI

```bash
# Create a new branch
git checkout -b feat/site-workflow-krane-chat

# Stage all changes
git add -A

# Commit
git commit -m "feat: site workflow + chat + budgets"

# Create remote repo via GitHub CLI (replace <owner> with your username/org)
gh repo create <owner>/swinerton-demo --private --source=. --remote=origin --push

# Push branch
git push -u origin feat/site-workflow-krane-chat
```

### Option 3: Manual GitHub UI

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `swinerton-demo`
3. Copy the remote URL
4. Run locally:
   ```bash
   git remote add origin https://github.com/<owner>/swinerton-demo.git
   git branch -M main
   git push -u origin main
   ```

---

## Vercel Deployment

### Via Vercel CLI

```bash
# Install Vercel CLI globally (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

### Via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Keep default settings (Next.js auto-detected)
4. Click **Deploy**

### Environment Variables

This demo uses in-memory storage and mock APIs, so **no environment variables are required**.

If you extend the app with real APIs, add them in Vercel Dashboard → Project → Settings → Environment Variables.

---

## Helper Scripts

### `tools/push_and_setup.sh`

Automates GitHub repo creation and Vercel deployment:

```bash
bash tools/push_and_setup.sh
```

Features:
- Validates `gh` and `vercel` CLI installation
- Prompts for repo name, visibility, branch
- Creates GitHub repo and pushes code
- Optionally deploys to Vercel

### `tools/create_github_readme_and_labels.sh`

Adds GitHub labels for issue tracking:

```bash
bash tools/create_github_readme_and_labels.sh
```

---

## Acceptance Tests (Manual)

1. **Start dev server**: `npm run dev` → Confirm app loads at `http://localhost:3000`

2. **Dashboard loads**: Navigate to `/dashboard` → See Projects & Budgets + Receipts & Deliveries

3. **Site Team Workflow**: Click floating pill → Navigate to `/site-workflow` → See WhatsApp-style chat

4. **Receipt capture**: 
   - In Krane chat, tap attachment → Select sample image
   - OCR processes → Select cost code → Confirm
   - Receipt appears in dashboard (SSE)

5. **BOL capture**:
   - Switch to "Upload BOL" tab
   - Upload demo BOL → PO matched → Create delivery
   - Delivery appears in dashboard (SSE)

6. **Delete functionality**:
   - Click on receipt/delivery card → Detail page
   - Click Delete → Confirm → Item removed from dashboard

7. **Real-time updates**: Open dashboard in two tabs → Create receipt in one → See it appear in both

---

## Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit
```

### SSE on Vercel (Serverless Caveat)

⚠️ **Important**: Server-Sent Events (SSE) have limitations on serverless platforms like Vercel:

- SSE connections may timeout after ~10 seconds on Vercel's serverless functions
- The in-memory EventBus doesn't persist across function invocations
- For production, consider using Vercel Edge Functions or external services (Pusher, Ably, etc.)

**For demo purposes**, SSE works correctly in local development. On Vercel, the dashboard will still function but may require manual refresh for updates.

### GitHub CLI Not Authenticated

```bash
# Login to GitHub CLI
gh auth login

# Verify authentication
gh auth status
```

### Vercel CLI Not Authenticated

```bash
# Login to Vercel
vercel login

# Verify with whoami
vercel whoami
```

---

## Project Structure

```
├── app/
│   ├── (combined)/          # Main app routes
│   │   ├── dashboard/       # Real-time dashboard
│   │   ├── delivery/[id]/   # Delivery detail page
│   │   ├── receipt/[id]/    # Receipt detail page
│   │   ├── site-workflow/   # Mobile workflow mockup
│   │   └── krane-chat/      # Standalone chat page
│   └── api/                 # API routes
│       ├── deliveries/      # Delivery CRUD + SSE stream
│       ├── receipts/        # Receipt CRUD + SSE stream
│       └── mock/            # Mock OCR, AI, CMiC APIs
├── components/
│   ├── chat/                # WhatsApp-style chat components
│   ├── capture/             # BOL/Receipt capture components
│   ├── dashboard/           # Dashboard cards and widgets
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── eventBus.ts          # SSE event emitter
│   ├── mockStorage.ts       # In-memory data store
│   └── matchUtils.ts        # PO/BOL matching logic
├── types/
│   └── index.ts             # TypeScript interfaces
└── tools/                   # Helper scripts
```

---

## License

Private demo project for Swinerton.
