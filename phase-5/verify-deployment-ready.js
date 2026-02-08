/**
 * Deployment Readiness Verification Script
 * Run this before deploying to check if everything is configured correctly
 *
 * Usage: node verify-deployment-ready.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper functions
const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}\n${'─'.repeat(50)}`),
};

let errorCount = 0;
let warningCount = 0;

// Check if file exists
function checkFile(filePath, name) {
  if (fs.existsSync(filePath)) {
    log.success(`${name} exists`);
    return true;
  } else {
    log.error(`${name} not found at ${filePath}`);
    errorCount++;
    return false;
  }
}

// Check if directory exists
function checkDir(dirPath, name) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log.success(`${name} directory exists`);
    return true;
  } else {
    log.error(`${name} directory not found at ${dirPath}`);
    errorCount++;
    return false;
  }
}

// Check file content for specific text
function checkFileContent(filePath, searchText, name) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchText)) {
      log.success(`${name} contains required configuration`);
      return true;
    } else {
      log.warning(`${name} might be missing configuration`);
      warningCount++;
      return false;
    }
  } else {
    log.error(`Cannot check ${name} - file not found`);
    errorCount++;
    return false;
  }
}

// Main verification
console.log(`
╔════════════════════════════════════════════════════════╗
║  Todo App - Deployment Readiness Verification         ║
╚════════════════════════════════════════════════════════╝
`);

// Backend checks
log.section('Backend Verification');

checkFile('backend/Dockerfile', 'Backend Dockerfile');
checkFile('backend/requirements.txt', 'Backend requirements.txt');
checkFile('backend/app/main.py', 'Backend main.py');
checkDir('backend/app', 'Backend app');
checkDir('backend/app/routers', 'Backend routers');

// Check backend dependencies
if (checkFile('backend/requirements.txt', 'requirements.txt')) {
  const requirements = fs.readFileSync('backend/requirements.txt', 'utf8');
  const requiredPackages = ['fastapi', 'sqlalchemy', 'pyjwt', 'uvicorn', 'passlib'];
  requiredPackages.forEach(pkg => {
    if (requirements.toLowerCase().includes(pkg)) {
      log.success(`${pkg} is in requirements.txt`);
    } else {
      log.warning(`${pkg} might be missing from requirements.txt`);
      warningCount++;
    }
  });
}

// Check Dockerfile
if (checkFile('backend/Dockerfile', 'Dockerfile')) {
  checkFileContent('backend/Dockerfile', 'FROM python', 'Dockerfile Python base image');
  checkFileContent('backend/Dockerfile', 'uvicorn', 'Dockerfile uvicorn command');
  checkFileContent('backend/Dockerfile', 'EXPOSE', 'Dockerfile port exposure');
}

// Frontend checks
log.section('Frontend Verification');

checkFile('frontend/package.json', 'Frontend package.json');
checkFile('frontend/next.config.ts', 'Next.js config');
checkDir('frontend/app', 'Frontend app directory');
checkDir('frontend/components', 'Frontend components');
checkFile('frontend/vercel.json', 'Vercel configuration');

// Check frontend dependencies
if (checkFile('frontend/package.json', 'package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  const requiredDeps = ['next', 'react', 'react-dom', 'better-auth', 'axios'];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      log.success(`${dep} is in dependencies`);
    } else {
      log.warning(`${dep} might be missing from dependencies`);
      warningCount++;
    }
  });

  // Check build script
  if (packageJson.scripts && packageJson.scripts.build) {
    log.success('Build script exists in package.json');
  } else {
    log.error('Build script missing in package.json');
    errorCount++;
  }
}

// Check Next.js config
if (checkFile('frontend/next.config.ts', 'next.config.ts')) {
  const config = fs.readFileSync('frontend/next.config.ts', 'utf8');
  if (config.includes('standalone')) {
    log.success('Next.js configured for standalone output');
  } else {
    log.warning('Next.js might not be configured for Docker deployment');
    warningCount++;
  }
}

// Environment files check
log.section('Environment Configuration');

if (checkFile('backend/.env.example', 'Backend .env.example')) {
  log.info('Backend .env.example found - use this as reference for deployment secrets');
}

if (checkFile('frontend/.env.example', 'Frontend .env.example')) {
  log.info('Frontend .env.example found - use this as reference for Vercel env vars');
}

// Check for sensitive files that should NOT be deployed
log.section('Security Check');

const sensitiveFiles = [
  'backend/.env',
  'frontend/.env.local',
  'backend/todos.db',
];

let hasSensitiveFiles = false;
sensitiveFiles.forEach(file => {
  if (fs.existsSync(file)) {
    log.warning(`Sensitive file ${file} exists - ensure it's in .gitignore`);
    warningCount++;
    hasSensitiveFiles = true;
  }
});

if (!hasSensitiveFiles) {
  log.success('No sensitive files detected in project root');
}

// Check gitignore
if (checkFile('.gitignore', '.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  const shouldIgnore = ['.env', 'node_modules', '__pycache__', '*.db'];

  shouldIgnore.forEach(pattern => {
    if (gitignore.includes(pattern)) {
      log.success(`.gitignore includes ${pattern}`);
    } else {
      log.warning(`.gitignore might be missing ${pattern}`);
      warningCount++;
    }
  });
}

// Deployment documentation check
log.section('Documentation Check');

const deployDocs = [
  'DEPLOYMENT_GUIDE.md',
  'QUICK_DEPLOY.md',
  'DEPLOYMENT_CHECKLIST.md',
];

deployDocs.forEach(doc => {
  checkFile(doc, doc);
});

// Final summary
log.section('Verification Summary');

console.log(`
Total Checks Performed: ${errorCount + warningCount + (checkFile.length || 0)}
${colors.red}Errors: ${errorCount}${colors.reset}
${colors.yellow}Warnings: ${warningCount}${colors.reset}
`);

if (errorCount === 0 && warningCount === 0) {
  console.log(`${colors.green}
╔════════════════════════════════════════════════════════╗
║  ✓ All checks passed! Ready for deployment!           ║
╚════════════════════════════════════════════════════════╝
${colors.reset}

Next steps:
1. Read QUICK_DEPLOY.md for deployment instructions
2. Generate secrets: openssl rand -hex 32
3. Deploy backend to Hugging Face Spaces
4. Deploy frontend to Vercel
5. Update CORS settings
6. Test the deployed application

Good luck with your deployment! 🚀
`);
} else if (errorCount === 0) {
  console.log(`${colors.yellow}
╔════════════════════════════════════════════════════════╗
║  ⚠ Ready with warnings - review issues above          ║
╚════════════════════════════════════════════════════════╝
${colors.reset}

You can proceed with deployment, but please review the warnings above.
Some issues might affect your deployment.
`);
} else {
  console.log(`${colors.red}
╔════════════════════════════════════════════════════════╗
║  ✗ Deployment not ready - fix errors above             ║
╚════════════════════════════════════════════════════════╝
${colors.reset}

Please fix the errors before deploying.
Check the error messages above for details.
`);
  process.exit(1);
}
