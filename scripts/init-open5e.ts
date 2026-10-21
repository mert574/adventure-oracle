#!/usr/bin/env tsx

/**
 * Script to initialize Open5e data store
 * This script fetches 5E data from the Open5e API and stores it locally
 */

import { initializeOpen5eData } from '../server/utils/open5e/data-loader';

async function main() {
  console.log('🎲 Initializing Open5e data store...');
  
  try {
    await initializeOpen5eData();
    console.log('✅ Open5e data store initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize Open5e data store:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Run the script
main();