#!/bin/bash
set -e

echo "[Lockfile] Starting pnpm lockfile regeneration..."
echo "[Lockfile] Current working directory: $(pwd)"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "[Lockfile] ERROR: pnpm is not installed or not in PATH"
    echo "[Lockfile] Please install pnpm globally: npm install -g pnpm"
    exit 1
fi

echo "[Lockfile] pnpm version: $(pnpm --version)"

# Remove old lockfile to ensure clean regeneration
if [ -f "pnpm-lock.yaml" ]; then
    echo "[Lockfile] Removing old pnpm-lock.yaml..."
    rm -f pnpm-lock.yaml
fi

# Run pnpm install to regenerate lockfile
echo "[Lockfile] Running pnpm install..."
pnpm install

echo "[Lockfile] Verifying lockfile was created..."
if [ -f "pnpm-lock.yaml" ]; then
    echo "[Lockfile] SUCCESS: pnpm-lock.yaml has been regenerated"
    echo "[Lockfile] Lockfile size: $(wc -c < pnpm-lock.yaml) bytes"
    echo "[Lockfile] Lockfile lines: $(wc -l < pnpm-lock.yaml) lines"
else
    echo "[Lockfile] ERROR: pnpm-lock.yaml was not created"
    exit 1
fi

echo "[Lockfile] Regeneration complete!"
