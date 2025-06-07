#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { execSync } from 'child_process';
import { validateEnv } from '../src/config/env.example';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);

async function setupEnv() {
  const rootDir = path.resolve(__dirname, '..');
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');

  try {
    // Check if .env already exists
    try {
      await access(envPath);
      console.log('ℹ️  .env file already exists');
      return;
    } catch {
      // .env doesn't exist, continue with setup
    }

    // Copy .env.example to .env if it doesn't exist
    const envExample = await readFile(envExamplePath, 'utf8');
    await writeFile(envPath, envExample);
    console.log('✅ Created .env file from .env.example');

    // Generate NEXTAUTH_SECRET if it doesn't exist
    const secret = execSync('openssl rand -base64 32').toString().trim();
    let envContent = await readFile(envPath, 'utf8');
    envContent = envContent.replace('NEXTAUTH_SECRET=your_nextauth_secret', `NEXTAUTH_SECRET=${secret}`);
    await writeFile(envPath, envContent);
    console.log('✅ Generated NEXTAUTH_SECRET');

    console.log('\n📝 Please update the following variables in your .env file:');
    console.log('- EMAIL_API_KEY');
    console.log('- EMAIL_FROM_ADDRESS');
    console.log('- ONESIGNAL_REST_API_KEY');
    console.log('- DATABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    console.log('- STORAGE_BUCKET_NAME');
    console.log('- STORAGE_REGION');

  } catch (error) {
    console.error('❌ Error setting up environment:', error);
    process.exit(1);
  }
}

// Run setup
setupEnv().catch(console.error); 