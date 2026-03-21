#!/usr/bin/env node

/**
 * Password Hash Generator for Admin Account
 * 
 * This script generates a secure bcryptjs hash for the admin password.
 * 
 * Usage:
 *   node scripts/generate-admin-hash.js
 * 
 * Output:
 *   A bcryptjs hash that you can use in the SQL seeding script
 */

const bcrypt = require('bcryptjs');

const ADMIN_PASSWORD = 'Admin123';
const ADMIN_EMAIL = 'admin@carmona.gov.ph';
const BCRYPT_ROUNDS = 10;

console.log('====================================================');
console.log('BTS Admin Account Hash Generator');
console.log('====================================================');
console.log(`\nGenerating bcryptjs hash for password: "${ADMIN_PASSWORD}"`);
console.log(`Rounds: ${BCRYPT_ROUNDS}`);
console.log(`\nThis may take a few seconds...\n`);

bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }

  console.log('====================================================');
  console.log('ADMIN ACCOUNT DETAILS');
  console.log('====================================================');
  console.log(`Email:    ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log(`\nBcrypt Hash (use this in SQL):`);
  console.log(`\n${hash}`);
  console.log('\n====================================================');
  console.log('NEXT STEPS');
  console.log('====================================================');
  console.log('\n1. Copy the hash above');
  console.log('2. Open scripts/002_seed_admin.sql');
  console.log('3. Find the placeholder hash (starts with $2a$10$)');
  console.log('4. Replace it with the hash above');
  console.log('5. Run the SQL script in your Supabase dashboard');
  console.log('6. Login with:');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('\n====================================================\n');

  // Also verify the hash works
  bcrypt.compare(ADMIN_PASSWORD, hash, (err, isMatch) => {
    if (err) {
      console.error('Verification error:', err);
      process.exit(1);
    }

    if (isMatch) {
      console.log('✓ Hash verification successful!');
      console.log('✓ The password will work correctly with this hash.\n');
    } else {
      console.error('✗ Hash verification failed!');
      process.exit(1);
    }
  });
});
