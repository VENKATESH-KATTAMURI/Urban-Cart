#!/usr/bin/env node

/**
 * Pre-deployment verification script
 * Run this before deploying to ensure everything is configured correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-deployment verification...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Node version
console.log('✓ Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher required. Current:', nodeVersion);
  hasErrors = true;
} else {
  console.log(`  ✓ Node.js ${nodeVersion} is compatible\n`);
}

// Check 2: Environment file
console.log('✓ Checking environment configuration...');
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ backend/.env file not found!');
  hasErrors = true;
} else {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check required variables
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'NODE_ENV', 'PORT'];
  const optionalVars = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
  
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName + '=')) {
      console.error(`  ❌ Missing required variable: ${varName}`);
      hasErrors = true;
    } else if (envContent.includes(`${varName}=your_`) || envContent.includes(`${varName}=\n`)) {
      console.error(`  ❌ ${varName} not configured (still has placeholder value)`);
      hasErrors = true;
    } else {
      console.log(`  ✓ ${varName} is set`);
    }
  });
  
  optionalVars.forEach(varName => {
    if (!envContent.includes(varName + '=') || envContent.includes(`${varName}=your_`)) {
      console.warn(`  ⚠️  ${varName} not configured (payment features disabled)`);
      hasWarnings = true;
    } else {
      console.log(`  ✓ ${varName} is set`);
    }
  });
  
  // Check JWT_SECRET strength
  const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);
  if (jwtMatch && jwtMatch[1].trim().length < 32) {
    console.warn('  ⚠️  JWT_SECRET should be at least 32 characters for production');
    hasWarnings = true;
  }
  
  console.log('');
}

// Check 3: Dependencies installed
console.log('✓ Checking dependencies...');
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
const frontendNodeModules = path.join(__dirname, 'frontend', 'client', 'node_modules');

if (!fs.existsSync(backendNodeModules)) {
  console.error('  ❌ Backend dependencies not installed. Run: cd backend && npm install');
  hasErrors = true;
} else {
  console.log('  ✓ Backend dependencies installed');
}

if (!fs.existsSync(frontendNodeModules)) {
  console.error('  ❌ Frontend dependencies not installed. Run: cd frontend/client && npm install');
  hasErrors = true;
} else {
  console.log('  ✓ Frontend dependencies installed');
}
console.log('');

// Check 4: Frontend build
console.log('✓ Checking frontend build...');
const frontendBuild = path.join(__dirname, 'frontend', 'client', 'build');
const backendPublic = path.join(__dirname, 'backend', 'public');

if (!fs.existsSync(frontendBuild)) {
  console.warn('  ⚠️  Frontend not built. Run: npm run build:frontend');
  hasWarnings = true;
} else {
  console.log('  ✓ Frontend build exists');
}

if (!fs.existsSync(backendPublic) || !fs.existsSync(path.join(backendPublic, 'index.html'))) {
  console.warn('  ⚠️  Frontend build not copied to backend/public. Run: npm run build');
  hasWarnings = true;
} else {
  console.log('  ✓ Frontend build copied to backend/public');
}
console.log('');

// Check 5: Package.json configuration
console.log('✓ Checking package.json...');
const rootPackageJson = path.join(__dirname, 'package.json');
const backendPackageJson = path.join(__dirname, 'backend', 'package.json');

if (fs.existsSync(rootPackageJson)) {
  const pkg = JSON.parse(fs.readFileSync(rootPackageJson, 'utf8'));
  if (!pkg.engines || !pkg.engines.node) {
    console.warn('  ⚠️  Root package.json missing engines.node specification');
    hasWarnings = true;
  } else {
    console.log(`  ✓ Root package.json specifies Node ${pkg.engines.node}`);
  }
}

if (fs.existsSync(backendPackageJson)) {
  const pkg = JSON.parse(fs.readFileSync(backendPackageJson, 'utf8'));
  if (!pkg.engines || !pkg.engines.node) {
    console.warn('  ⚠️  Backend package.json missing engines.node specification');
    hasWarnings = true;
  } else {
    console.log(`  ✓ Backend package.json specifies Node ${pkg.engines.node}`);
  }
  
  if (!pkg.scripts || !pkg.scripts.start) {
    console.error('  ❌ Backend package.json missing "start" script');
    hasErrors = true;
  } else {
    console.log('  ✓ Backend has start script');
  }
}
console.log('');

// Check 6: Critical files exist
console.log('✓ Checking critical files...');
const criticalFiles = [
  'backend/server.js',
  'backend/config/db.js',
  'Procfile',
  'Dockerfile',
  '.gitignore'
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`  ❌ Missing critical file: ${file}`);
    hasErrors = true;
  } else {
    console.log(`  ✓ ${file} exists`);
  }
});
console.log('');

// Check 7: Git status
console.log('✓ Checking Git status...');
if (!fs.existsSync(path.join(__dirname, '.git'))) {
  console.warn('  ⚠️  Not a Git repository. Initialize with: git init');
  hasWarnings = true;
} else {
  console.log('  ✓ Git repository initialized');
}
console.log('');

// Summary
console.log('═══════════════════════════════════════════════════');
if (!hasErrors && !hasWarnings) {
  console.log('✅ ALL CHECKS PASSED - Ready for deployment!');
  console.log('═══════════════════════════════════════════════════\n');
  process.exit(0);
} else if (!hasErrors && hasWarnings) {
  console.log('⚠️  WARNINGS DETECTED - Review before deploying');
  console.log('   Deployment may work but some features might be limited');
  console.log('═══════════════════════════════════════════════════\n');
  process.exit(0);
} else {
  console.log('❌ ERRORS DETECTED - Fix issues before deploying');
  console.log('═══════════════════════════════════════════════════\n');
  process.exit(1);
}
