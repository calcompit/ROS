#!/usr/bin/env node

/**
 * Environment Setup Script
 * สร้างไฟล์ .env จาก .env.example อย่างปลอดภัย
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

function generateRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function setupFrontendEnv() {
  const envExamplePath = path.join(projectRoot, 'env.example');
  const envLocalPath = path.join(projectRoot, '.env.local');
  
  if (fs.existsSync(envLocalPath)) {
    console.log('✅ .env.local already exists');
    return;
  }
  
  if (!fs.existsSync(envExamplePath)) {
    console.log('❌ env.example not found');
    return;
  }
  
  let content = fs.readFileSync(envExamplePath, 'utf8');
  
  // Replace placeholder values with actual values
  content = content.replace(/YOUR_WINDOWS_IP/g, 'YOUR_ACTUAL_WINDOWS_IP');
  content = content.replace(/your-production-api\.com/g, 'your-actual-production-api.com');
  content = content.replace(/your-app-secret-key/g, generateRandomString(32));
  content = content.replace(/your-encryption-key/g, generateRandomString(32));
  
  fs.writeFileSync(envLocalPath, content);
  console.log('✅ Created .env.local');
}

function setupBackendEnv() {
  const envExamplePath = path.join(projectRoot, 'backend', 'env.example');
  const envPath = path.join(projectRoot, 'backend', '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ backend/.env already exists');
    return;
  }
  
  if (!fs.existsSync(envExamplePath)) {
    console.log('❌ backend/env.example not found');
    return;
  }
  
  let content = fs.readFileSync(envExamplePath, 'utf8');
  
  // Replace placeholder values with actual values
  content = content.replace(/your-secret-key-here-change-this-in-production/g, generateRandomString(64));
  content = content.replace(/your-session-secret-here/g, generateRandomString(32));
  content = content.replace(/http:\/\/10\.13\.10\.41:8081/g, 'http://localhost:3000,http://localhost:5173');
  
  fs.writeFileSync(envPath, content);
  console.log('✅ Created backend/.env');
}

function checkGitIgnore() {
  const gitignorePath = path.join(projectRoot, '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    console.log('❌ .gitignore not found');
    return;
  }
  
  const content = fs.readFileSync(gitignorePath, 'utf8');
  const requiredPatterns = [
    '.env',
    '.env.local',
    '.env.production',
    '*.db',
    '*.sqlite',
    '*.log'
  ];
  
  const missingPatterns = requiredPatterns.filter(pattern => !content.includes(pattern));
  
  if (missingPatterns.length > 0) {
    console.log('⚠️  Missing patterns in .gitignore:', missingPatterns);
  } else {
    console.log('✅ .gitignore looks good');
  }
}

function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const sensitiveFiles = status.split('\n').filter(line => {
      return line.includes('.env') || 
             line.includes('.db') || 
             line.includes('.log') ||
             line.includes('secret') ||
             line.includes('key');
    });
    
    if (sensitiveFiles.length > 0) {
      console.log('⚠️  Sensitive files in git status:');
      sensitiveFiles.forEach(file => console.log(`   ${file}`));
    } else {
      console.log('✅ No sensitive files in git status');
    }
  } catch (error) {
    console.log('⚠️  Could not check git status');
  }
}

function main() {
  console.log('🔧 Setting up environment files...\n');
  
  setupFrontendEnv();
  setupBackendEnv();
  
  console.log('\n🔍 Checking security...\n');
  
  checkGitIgnore();
  checkGitStatus();
  
  console.log('\n✅ Setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Edit .env.local and backend/.env with your actual values');
  console.log('2. Run npm run security-check to verify');
  console.log('3. Never commit .env files to git');
  console.log('4. Use environment variables in your deployment platform');
}

main();
