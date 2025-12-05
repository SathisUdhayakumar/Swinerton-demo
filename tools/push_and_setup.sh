#!/usr/bin/env bash
#
# push_and_setup.sh
# Automates GitHub repo creation and Vercel deployment for Swinerton Demo
#
# Usage: bash tools/push_and_setup.sh
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored messages
info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# Prompt for confirmation
confirm() {
    local prompt="$1"
    local default="${2:-n}"
    local response
    
    if [[ "$default" == "y" ]]; then
        read -rp "$prompt [Y/n]: " response
        response=${response:-y}
    else
        read -rp "$prompt [y/N]: " response
        response=${response:-n}
    fi
    
    [[ "$response" =~ ^[Yy]$ ]]
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Swinerton Demo - GitHub & Vercel Setup Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# =============================================================================
# Step 1: Validate CLI tools
# =============================================================================

info "Checking required CLI tools..."

GH_INSTALLED=false
VERCEL_INSTALLED=false

if command_exists gh; then
    GH_INSTALLED=true
    success "GitHub CLI (gh) is installed"
else
    warn "GitHub CLI (gh) is NOT installed"
    echo "  Install: https://cli.github.com/"
    echo "  macOS: brew install gh"
    echo "  Windows: winget install GitHub.cli"
fi

if command_exists vercel; then
    VERCEL_INSTALLED=true
    success "Vercel CLI is installed"
else
    warn "Vercel CLI is NOT installed"
    echo "  Install: npm i -g vercel"
fi

if ! command_exists git; then
    error "Git is NOT installed. Please install Git first."
    exit 1
fi

success "Git is installed"
echo ""

# =============================================================================
# Step 2: Check authentication status
# =============================================================================

GH_AUTHENTICATED=false
VERCEL_AUTHENTICATED=false

if $GH_INSTALLED; then
    if gh auth status >/dev/null 2>&1; then
        GH_AUTHENTICATED=true
        GH_USER=$(gh api user --jq '.login' 2>/dev/null || echo "")
        success "GitHub CLI authenticated as: $GH_USER"
    else
        warn "GitHub CLI is NOT authenticated"
        echo "  Run: gh auth login"
    fi
fi

if $VERCEL_INSTALLED; then
    if vercel whoami >/dev/null 2>&1; then
        VERCEL_AUTHENTICATED=true
        VERCEL_USER=$(vercel whoami 2>/dev/null || echo "")
        success "Vercel CLI authenticated as: $VERCEL_USER"
    else
        warn "Vercel CLI is NOT authenticated"
        echo "  Run: vercel login"
    fi
fi

echo ""

# =============================================================================
# Step 3: Gather user inputs
# =============================================================================

info "Configuration"
echo ""

# Default owner to current gh user if available
DEFAULT_OWNER="${GH_USER:-your-username}"
read -rp "GitHub owner (username or org) [$DEFAULT_OWNER]: " GITHUB_OWNER
GITHUB_OWNER=${GITHUB_OWNER:-$DEFAULT_OWNER}

# Repository name
DEFAULT_REPO="swinerton-demo"
read -rp "Repository name [$DEFAULT_REPO]: " REPO_NAME
REPO_NAME=${REPO_NAME:-$DEFAULT_REPO}

# Branch name
DEFAULT_BRANCH="feat/site-workflow-krane-chat"
read -rp "Branch name [$DEFAULT_BRANCH]: " BRANCH_NAME
BRANCH_NAME=${BRANCH_NAME:-$DEFAULT_BRANCH}

# Visibility
read -rp "Repository visibility (public/private) [private]: " VISIBILITY
VISIBILITY=${VISIBILITY:-private}

echo ""
info "Configuration summary:"
echo "  Owner:      $GITHUB_OWNER"
echo "  Repository: $REPO_NAME"
echo "  Branch:     $BRANCH_NAME"
echo "  Visibility: $VISIBILITY"
echo ""

if ! confirm "Proceed with this configuration?" "y"; then
    info "Aborted by user"
    exit 0
fi

echo ""

# =============================================================================
# Step 4: Git operations
# =============================================================================

info "Preparing Git repository..."

# Check if we're in a git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    info "Initializing Git repository..."
    git init
    success "Git repository initialized"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")

if [[ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]]; then
    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME" 2>/dev/null; then
        info "Switching to existing branch: $BRANCH_NAME"
        git checkout "$BRANCH_NAME"
    else
        info "Creating new branch: $BRANCH_NAME"
        git checkout -b "$BRANCH_NAME"
    fi
    success "Now on branch: $BRANCH_NAME"
fi

# Stage changes
STAGED_CHANGES=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')
UNSTAGED_CHANGES=$(git diff --name-only 2>/dev/null | wc -l | tr -d ' ')
UNTRACKED_FILES=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')

TOTAL_CHANGES=$((STAGED_CHANGES + UNSTAGED_CHANGES + UNTRACKED_FILES))

if [[ "$TOTAL_CHANGES" -gt 0 ]]; then
    info "Found $TOTAL_CHANGES file(s) with changes"
    
    if confirm "Stage all changes with 'git add -A'?" "y"; then
        git add -A
        success "All changes staged"
    fi
fi

# Commit
COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo "0")
STAGED_FOR_COMMIT=$(git diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')

if [[ "$STAGED_FOR_COMMIT" -gt 0 ]] || [[ "$COMMIT_COUNT" == "0" ]]; then
    DEFAULT_MSG="chore: initial commit for deployment"
    read -rp "Commit message [$DEFAULT_MSG]: " COMMIT_MSG
    COMMIT_MSG=${COMMIT_MSG:-$DEFAULT_MSG}
    
    if confirm "Commit with message: '$COMMIT_MSG'?" "y"; then
        if [[ "$COMMIT_COUNT" == "0" ]]; then
            git commit --allow-empty -m "$COMMIT_MSG"
        else
            git commit -m "$COMMIT_MSG"
        fi
        success "Changes committed"
    fi
else
    info "No changes to commit"
fi

echo ""

# =============================================================================
# Step 5: Create GitHub repository
# =============================================================================

REMOTE_EXISTS=$(git remote get-url origin 2>/dev/null || echo "")

if [[ -n "$REMOTE_EXISTS" ]]; then
    info "Remote 'origin' already exists: $REMOTE_EXISTS"
    if ! confirm "Keep existing remote?" "y"; then
        git remote remove origin
        REMOTE_EXISTS=""
    fi
fi

if [[ -z "$REMOTE_EXISTS" ]]; then
    info "Creating GitHub repository..."
    
    VISIBILITY_FLAG="--private"
    if [[ "$VISIBILITY" == "public" ]]; then
        VISIBILITY_FLAG="--public"
    fi
    
    if $GH_AUTHENTICATED; then
        if confirm "Create repo '$GITHUB_OWNER/$REPO_NAME' using GitHub CLI?" "y"; then
            if gh repo create "$GITHUB_OWNER/$REPO_NAME" $VISIBILITY_FLAG --source=. --remote=origin 2>/dev/null; then
                success "GitHub repository created: $GITHUB_OWNER/$REPO_NAME"
            else
                warn "Failed to create repo. It may already exist."
                REPO_URL="https://github.com/$GITHUB_OWNER/$REPO_NAME.git"
                info "Adding remote manually: $REPO_URL"
                git remote add origin "$REPO_URL" 2>/dev/null || true
            fi
        fi
    else
        warn "GitHub CLI not authenticated. Manual steps required:"
        echo ""
        echo "  1. Go to https://github.com/new"
        echo "  2. Create repository: $REPO_NAME"
        echo "  3. Run these commands:"
        echo ""
        echo "     git remote add origin https://github.com/$GITHUB_OWNER/$REPO_NAME.git"
        echo "     git push -u origin $BRANCH_NAME"
        echo ""
        
        read -rp "Press Enter after creating the repo manually (or Ctrl+C to exit)..."
        
        REPO_URL="https://github.com/$GITHUB_OWNER/$REPO_NAME.git"
        git remote add origin "$REPO_URL" 2>/dev/null || true
    fi
fi

echo ""

# =============================================================================
# Step 6: Push to GitHub
# =============================================================================

info "Pushing to GitHub..."

if confirm "Push branch '$BRANCH_NAME' to origin?" "y"; then
    if git push -u origin "$BRANCH_NAME" 2>/dev/null; then
        success "Pushed to: https://github.com/$GITHUB_OWNER/$REPO_NAME"
    else
        error "Push failed. Check your credentials and try:"
        echo "  git push -u origin $BRANCH_NAME"
    fi
fi

echo ""

# =============================================================================
# Step 7: Vercel Deployment
# =============================================================================

info "Vercel Deployment"

if $VERCEL_AUTHENTICATED; then
    if confirm "Deploy to Vercel?" "y"; then
        echo ""
        
        DEPLOY_PROD=false
        if confirm "Deploy to PRODUCTION (vs preview)?" "n"; then
            DEPLOY_PROD=true
        fi
        
        info "Starting Vercel deployment..."
        
        if $DEPLOY_PROD; then
            if vercel --prod --yes; then
                success "Production deployment complete!"
            else
                error "Deployment failed"
            fi
        else
            if vercel --yes; then
                success "Preview deployment complete!"
            else
                error "Deployment failed"
            fi
        fi
    fi
else
    warn "Vercel CLI not authenticated. Manual steps:"
    echo ""
    echo "  1. Install: npm i -g vercel"
    echo "  2. Login:   vercel login"
    echo "  3. Deploy:  vercel --prod"
    echo ""
    echo "  Or use Vercel Dashboard:"
    echo "  https://vercel.com/new"
fi

echo ""

# =============================================================================
# Step 8: Summary
# =============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "Next steps:"
echo "  • View repo:     https://github.com/$GITHUB_OWNER/$REPO_NAME"
echo "  • Vercel dash:   https://vercel.com/dashboard"
echo "  • Run locally:   npm run dev"
echo ""
success "Done!"


