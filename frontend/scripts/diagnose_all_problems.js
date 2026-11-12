const fs = require('fs');
const path = require('path');

// Load environment variables
const envLocal = path.join(__dirname, '..', '.env.local');
const envMain = path.join(__dirname, '..', '.env');
if (fs.existsSync(envLocal)) {
  const content = fs.readFileSync(envLocal, 'utf8');
  content.split('\n').forEach(line => {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '').trim();
    }
  });
}
if (fs.existsSync(envMain)) {
  const content = fs.readFileSync(envMain, 'utf8');
  content.split('\n').forEach(line => {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '').trim();
    }
  });
}

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const issues = [];

function logIssue(category, file, message, severity = 'WARNING') {
  issues.push({ category, file, message, severity });
}

// 1. SCAN ALL PAGES FOR 'use client' DIRECTIVE IF THEY USE CLIENT HOOKS
function scanClientPages(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      scanClientPages(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const hasClientHooks = /use(State|Effect|Ref|Router|Store|Context|Reducer|Callback|Memo|Id|Transition)\b/.test(content);
      const hasUseClient = /^\s*['"]use client['"]/m.test(content);
      if (hasClientHooks && !hasUseClient) {
        logIssue('CLIENT_DIRECTIVE', fullPath, 'Uses React client hooks but missing "use client" directive', 'ERROR');
      }
    }
  }
}

// 2. SCAN ALL API ROUTES FOR PROPER HANDLERS
function scanApiRoutes(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      scanApiRoutes(fullPath);
    } else if (file.name === 'route.ts' || file.name === 'route.js') {
      const content = fs.readFileSync(fullPath, 'utf8');
      const hasMethod = /export\s+(async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/.test(content);
      if (!hasMethod) {
        logIssue('API_ROUTE', fullPath, 'No HTTP method handlers (GET/POST/PATCH/etc.) exported', 'ERROR');
      }
    }
  }
}

// 3. SCAN FRONTEND API CALLS TO VERIFY ALL CALLED ENDPOINTS EXIST
function scanApiEndpointsCalled(srcDir, apiRoutes) {
  function scan(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        scan(fullPath);
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        if (fullPath.includes(path.join('app', 'api'))) continue;
        const content = fs.readFileSync(fullPath, 'utf8');
        const matches = content.matchAll(/fetch\(\s*['"`](\/api\/[a-zA-Z0-9_\-\/]+)['"`]/g);
        for (const match of matches) {
          const endpoint = match[1];
          // Check if this endpoint pattern exists
          const cleanEndpoint = endpoint.replace(/\/+$/, '');
          const exists = apiRoutes.some(r => {
            const regex = new RegExp('^' + r.replace(/\[\w+\]/g, '[^/]+') + '$');
            return regex.test(cleanEndpoint);
          });
          if (!exists) {
            logIssue('MISSING_API', fullPath, `Calls API endpoint "${endpoint}" which may not have a matching route handler`, 'WARNING');
          }
        }
      }
    }
  }
  scan(srcDir);
}

// 4. DATABASE INTEGRITY CHECKS
async function checkDatabaseIntegrity() {
  console.log('🔍 Checking Database Integrity & Relations...');

  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      logIssue('DATABASE', 'User table', 'User table is empty! System seed needs to be executed.', 'ERROR');
    }

    const hubs = await prisma.deliveryHub.findMany({
      include: { manager: true, riders: true, assignments: true }
    });
    if (hubs.length === 0) {
      logIssue('DATABASE', 'DeliveryHub table', 'No delivery hubs found in database.', 'WARNING');
    }

    const unassignedProfiles = await prisma.deliveryProfile.findMany({
      where: { hubId: null }
    });
    if (unassignedProfiles.length > 0) {
      logIssue('DATABASE', 'DeliveryProfile', `${unassignedProfiles.length} rider profiles have no assigned delivery hub.`, 'INFO');
    }

    // Check for orphaned records
    const orphanedAssignments = await prisma.deliveryAssignment.findMany({
      where: {
        order: { is: null }
      }
    }).catch(() => []);
    if (orphanedAssignments.length > 0) {
      logIssue('DATABASE', 'DeliveryAssignment', `Found ${orphanedAssignments.length} orphaned delivery assignments.`, 'ERROR');
    }

  } catch (err) {
    logIssue('DATABASE', 'Prisma Query', `Database check failed: ${err.message}`, 'ERROR');
  }
}

// 5. ENVIRONMENT VARIABLES CHECK
function checkEnvVariables() {
  console.log('🔍 Checking Environment Variables...');
  const envPath = path.join(__dirname, '..', '.env');
  const envLocalPath = path.join(__dirname, '..', '.env.local');

  let envContent = '';
  if (fs.existsSync(envPath)) envContent += fs.readFileSync(envPath, 'utf8') + '\n';
  if (fs.existsSync(envLocalPath)) envContent += fs.readFileSync(envLocalPath, 'utf8') + '\n';

  const requiredVars = [
    'DATABASE_URL',
    'DIRECT_URL',
    'JWT_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ];

  for (const v of requiredVars) {
    const regex = new RegExp(`^${v}=.+`, 'm');
    if (!regex.test(envContent) && !process.env[v]) {
      logIssue('ENV', '.env / .env.local', `Missing required environment variable: ${v}`, 'WARNING');
    }
  }
}

// COLLECT ALL API ROUTES
function getAllApiRoutes(apiDir) {
  const routes = [];
  function scan(dir, baseRoute = '/api') {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        scan(fullPath, `${baseRoute}/${file.name}`);
      } else if (file.name === 'route.ts' || file.name === 'route.js') {
        routes.push(baseRoute);
      }
    }
  }
  if (fs.existsSync(apiDir)) {
    scan(apiDir);
  }
  return routes;
}

async function main() {
  console.log('====================================================');
  console.log('🩺 RUNNING FULL SYSTEM & REPOSITORY DIAGNOSTICS');
  console.log('====================================================\n');

  const appDir = path.join(__dirname, '..', 'src', 'app');
  const apiDir = path.join(appDir, 'api');

  console.log('🔍 1. Scanning client components for missing directives...');
  scanClientPages(appDir);

  console.log('🔍 2. Scanning all API route handlers...');
  scanApiRoutes(apiDir);

  console.log('🔍 3. Collecting and validating API endpoints...');
  const apiRoutes = getAllApiRoutes(apiDir);
  console.log(`   Found ${apiRoutes.length} registered API endpoints.`);
  scanApiEndpointsCalled(path.join(__dirname, '..', 'src'), apiRoutes);

  console.log('🔍 4. Auditing database schema and relations...');
  await checkDatabaseIntegrity();

  console.log('🔍 5. Auditing environment configuration...');
  checkEnvVariables();

  console.log('\n====================================================');
  console.log(`📋 DIAGNOSTIC RESULTS: ${issues.length} Items Found`);
  console.log('====================================================\n');

  if (issues.length === 0) {
    console.log('🎉 PERFECT HEALTH: Zero issues, errors, or warnings detected!');
  } else {
    const errorCount = issues.filter(i => i.severity === 'ERROR').length;
    const warnCount = issues.filter(i => i.severity === 'WARNING').length;
    const infoCount = issues.filter(i => i.severity === 'INFO').length;

    console.log(`Summary: ${errorCount} Errors, ${warnCount} Warnings, ${infoCount} Info notes\n`);

    issues.forEach((iss, idx) => {
      const icon = iss.severity === 'ERROR' ? '❌' : iss.severity === 'WARNING' ? '⚠️' : 'ℹ️';
      console.log(`${idx + 1}. ${icon} [${iss.category}] (${iss.severity})`);
      console.log(`   File: ${iss.file}`);
      console.log(`   Issue: ${iss.message}\n`);
    });
  }
}

main()
  .catch(err => {
    console.error('Fatal diagnostic failure:', err);
  })
  .finally(() => prisma.$disconnect());
