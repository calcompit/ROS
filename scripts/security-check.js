#!/usr/bin/env node

/**
 * Security Check Script
 * ตรวจสอบไฟล์ที่อาจมีข้อมูลสำคัญที่ควรซ่อน
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Patterns ที่ควรตรวจสอบ
const sensitivePatterns = [
  // IP addresses (เฉพาะที่อาจเป็นส่วนตัว)
  /(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3})/g,
  
  // Secrets and keys (เฉพาะที่มีค่าจริง)
  /(password|secret|key|token)\s*[:=]\s*["']?(?!your-|YOUR_|example|localhost|127\.0\.0\.1)[^"'\s]+["']?/gi,
  
  // Database credentials (เฉพาะที่มีค่าจริง)
  /(db_password|db_user|db_host)\s*[:=]\s*["']?(?!your-|YOUR_|example)[^"'\s]+["']?/gi,
  
  // JWT secrets (เฉพาะที่มีค่าจริง)
  /jwt_secret\s*[:=]\s*["']?(?!your-|YOUR_|example)[^"'\s]+["']?/gi,
  
  // API keys (เฉพาะที่มีค่าจริง)
  /api_key\s*[:=]\s*["']?(?!your-|YOUR_|example)[^"'\s]+["']?/gi,
  
  // Private domains (เฉพาะที่อาจเป็นส่วนตัว)
  /(neofelis|mooneye|ts\.net|\.local|\.internal)/gi,
  
  // Specific private IPs
  /10\.53\.64\.205|10\.51\.101\.49|100\.73\.2\.100/g,
];

// ไฟล์ที่ควรตรวจสอบ
const filesToCheck = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'src/**/*.js',
  'src/**/*.jsx',
  'backend/**/*.js',
  'backend/**/*.json',
  '*.json',
  '*.md',
];

// ไฟล์ที่ควรข้าม
const excludePatterns = [
  'node_modules',
  'dist',
  'build',
  '.git',
  '*.log',
  'package-lock.json',
  'yarn.lock',
];

function getAllFiles(dir, patterns, excludes) {
  const files = [];
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip excluded directories
        if (!excludes.some(pattern => fullPath.includes(pattern))) {
          walkDir(fullPath);
        }
      } else if (stat.isFile()) {
        // Check if file matches patterns
        const relativePath = path.relative(projectRoot, fullPath);
        if (patterns.some(pattern => {
          if (pattern.includes('**')) {
            const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
            return regex.test(relativePath);
          }
          return relativePath.includes(pattern);
        })) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walkDir(dir);
  return files;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  sensitivePatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Skip common false positives
        if (match.includes('localhost') && match.includes('3000')) return;
        if (match.includes('127.0.0.1')) return;
        if (match.includes('example.com')) return;
        if (match.includes('your-') || match.includes('YOUR_')) return;
        if (match.includes('localhost:3001')) return;
        if (match.includes('localhost:5173')) return;
        if (match.includes('localhost:8081')) return;
        
        issues.push({
          pattern: pattern.toString(),
          match: match,
          line: content.substring(0, content.indexOf(match)).split('\n').length
        });
      });
    }
  });
  
  return issues;
}

function main() {
  console.log('🔍 กำลังตรวจสอบความปลอดภัย...\n');
  
  const files = getAllFiles(projectRoot, filesToCheck, excludePatterns);
  let totalIssues = 0;
  
  files.forEach(filePath => {
    const issues = checkFile(filePath);
    if (issues.length > 0) {
      const relativePath = path.relative(projectRoot, filePath);
      console.log(`⚠️  ${relativePath}:`);
      
      issues.forEach(issue => {
        console.log(`   Line ${issue.line}: ${issue.match}`);
        totalIssues++;
      });
      console.log('');
    }
  });
  
  if (totalIssues === 0) {
    console.log('✅ ไม่พบข้อมูลที่อาจเป็นความเสี่ยง');
  } else {
    console.log(`❌ พบ ${totalIssues} จุดที่อาจเป็นความเสี่ยง`);
    console.log('\n💡 คำแนะนำ:');
    console.log('1. ใช้ environment variables แทนการ hardcode');
    console.log('2. ตรวจสอบไฟล์ .env ว่าถูก .gitignore แล้ว');
    console.log('3. ใช้ placeholder values ในโค้ด');
  }
}

main();
