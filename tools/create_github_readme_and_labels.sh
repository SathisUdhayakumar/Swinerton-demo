#!/usr/bin/env bash
#
# create_github_readme_and_labels.sh
# Creates GitHub issue labels for the Swinerton Demo project
#
# Usage: bash tools/create_github_readme_and_labels.sh
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

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

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  GitHub Labels Setup Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if gh is installed
if ! command -v gh >/dev/null 2>&1; then
    error "GitHub CLI (gh) is not installed"
    echo "  Install: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status >/dev/null 2>&1; then
    error "GitHub CLI is not authenticated"
    echo "  Run: gh auth login"
    exit 1
fi

success "GitHub CLI authenticated"

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner' 2>/dev/null || echo "")

if [[ -z "$REPO" ]]; then
    error "Not in a GitHub repository or remote not set"
    echo "  Run this script from within a cloned repo with 'origin' remote"
    exit 1
fi

info "Repository: $REPO"
echo ""

# Define labels
declare -A LABELS=(
    ["bug"]="d73a4a:Something isn't working"
    ["enhancement"]="a2eeef:New feature or request"
    ["documentation"]="0075ca:Improvements or additions to documentation"
    ["good first issue"]="7057ff:Good for newcomers"
    ["help wanted"]="008672:Extra attention is needed"
    ["wontfix"]="ffffff:This will not be worked on"
    ["duplicate"]="cfd3d7:This issue or pull request already exists"
    ["invalid"]="e4e669:This doesn't seem right"
    ["question"]="d876e3:Further information is requested"
    ["workflow:receipt"]="1d76db:Receipt capture workflow"
    ["workflow:bol"]="5319e7:BOL/Delivery workflow"
    ["workflow:chat"]="0e8a16:Krane chat interface"
    ["area:dashboard"]="fbca04:Dashboard component"
    ["area:api"]="b60205:API routes"
    ["area:sse"]="c5def5:Server-Sent Events"
    ["priority:high"]="b60205:High priority issue"
    ["priority:medium"]="fbca04:Medium priority issue"
    ["priority:low"]="0e8a16:Low priority issue"
)

if confirm "Create/update ${#LABELS[@]} labels for $REPO?" "y"; then
    echo ""
    
    for label in "${!LABELS[@]}"; do
        IFS=':' read -r color description <<< "${LABELS[$label]}"
        
        # Try to create label, update if it exists
        if gh label create "$label" --color "$color" --description "$description" --force 2>/dev/null; then
            success "Label: $label"
        else
            warn "Failed to create label: $label"
        fi
    done
    
    echo ""
    success "Labels created/updated!"
    echo ""
    info "View labels at: https://github.com/$REPO/labels"
else
    info "Skipped label creation"
fi

echo ""

# =============================================================================
# Check README exists
# =============================================================================

info "Checking README..."

if [[ -f "README.md" ]]; then
    success "README.md exists"
else
    warn "README.md not found"
    
    if confirm "Create a basic README.md?" "y"; then
        cat > README.md << 'EOF'
# Swinerton Field Operations Demo

A Next.js demo application for construction field operations.

## Quick Start

```bash
npm install
npm run dev
```

## Documentation

See [docs/DEPLOY.md](docs/DEPLOY.md) for deployment instructions.
EOF
        success "README.md created"
    fi
fi

echo ""
success "Done!"

