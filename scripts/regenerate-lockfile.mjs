#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const lockfilePath = path.join(projectRoot, 'pnpm-lock.yaml');

console.log('📦 Regenerating pnpm lockfile...');
console.log('==================================');
console.log('');

try {
  // Step 1: Check if pnpm is available
  console.log('Step 1/3: Checking pnpm installation...');
  try {
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
    console.log(`✓ pnpm version: ${pnpmVersion}`);
  } catch (e) {
    console.error('❌ Error: pnpm is not installed');
    console.error('Install with: npm install -g pnpm');
    process.exit(1);
  }
  console.log('');

  // Step 2: Remove old lockfile if it exists
  console.log('Step 2/3: Removing old lockfile...');
  if (fs.existsSync(lockfilePath)) {
    fs.unlinkSync(lockfilePath);
    console.log('✓ Old lockfile removed');
  } else {
    console.log('✓ No existing lockfile found (fresh install)');
  }
  console.log('');

  // Step 3: Regenerate lockfile
  console.log('Step 3/3: Regenerating lockfile with pnpm install...');
  execSync('pnpm install --no-frozen-lockfile', {
    stdio: 'inherit',
    cwd: projectRoot,
  });
  console.log('✓ Lockfile regenerated');
  console.log('');

  // Step 4: Verify with frozen lockfile
  console.log('Step 4/4: Verifying lockfile with frozen-lockfile mode...');
  execSync('pnpm install --frozen-lockfile', {
    stdio: 'inherit',
    cwd: projectRoot,
  });
  console.log('✓ Lockfile verified');
  console.log('');

  console.log('==================================');
  console.log('✅ Lockfile regeneration complete!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Verify the pnpm-lock.yaml file was updated');
  console.log('2. Run: git add pnpm-lock.yaml');
  console.log('3. Run: git commit -m "chore: regenerate pnpm lockfile for Supabase and bcryptjs dependencies"');
  console.log('4. Push to your repository');
  console.log('');
  console.log('This will resolve the frozen-lockfile error in CI/CD environments.');
} catch (error) {
  console.error('❌ Error during lockfile regeneration:');
  console.error(error.message);
  process.exit(1);
}
