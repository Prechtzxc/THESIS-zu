#!/bin/bash

# ============================================================================
# PNPM Lockfile Regeneration Script
# ============================================================================
# This script properly regenerates the pnpm-lock.yaml file to match the
# current package.json. It must be run before committing dependency changes.
#
# Usage: bash scripts/regenerate-lockfile.sh
# ============================================================================

set -e

echo "📦 Regenerating pnpm lockfile..."
echo "=================================="

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm is not installed"
    echo "Install pnpm with: npm install -g pnpm"
    exit 1
fi

# Show pnpm version
echo "✓ pnpm version: $(pnpm --version)"
echo ""

# Step 1: Remove existing lockfile
echo "Step 1/3: Removing old lockfile..."
rm -f pnpm-lock.yaml
echo "✓ Old lockfile removed"
echo ""

# Step 2: Regenerate lockfile by installing dependencies
echo "Step 2/3: Regenerating lockfile with pnpm install..."
pnpm install --frozen-lockfile=false
echo "✓ Lockfile regenerated"
echo ""

# Step 3: Verify lockfile is in sync
echo "Step 3/3: Verifying lockfile integrity..."
pnpm install --frozen-lockfile
echo "✓ Lockfile verified and in sync with package.json"
echo ""

echo "=================================="
echo "✅ Lockfile regeneration complete!"
echo ""
echo "Next steps:"
echo "1. Commit the updated pnpm-lock.yaml to git"
echo "2. Run: git add pnpm-lock.yaml && git commit -m 'chore: regenerate pnpm lockfile'"
echo "3. Push to your repository"
