const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment or token
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const OWNER = 'needelectro';
const REPO = 'zibonbaba.com';
const BRANCH = 'main';

const FRONTEND_DIR = path.join(__dirname, '..');

const filesToDeploy = [
  'next.config.ts',
  'package.json',
  'tsconfig.json',
  'vercel.json',
  'src/components/navbar.tsx',
  'src/components/mobile-header.tsx',
  'src/components/footer.tsx',
  'src/components/layout-client.tsx',
  'src/store/useStore.ts',
  'src/utils/translations.ts',
  'src/utils/roleRoutes.ts',
  'src/utils/supabase/client.ts',
  'src/utils/supabase/server.ts',
  'src/hooks/useNotifications.ts',
  'src/hooks/usePlatformSync.ts',
  'src/hooks/useIsMobile.ts',
  'src/components/providers/platform-sync-provider.tsx',
  'src/middleware.ts'
];

function githubRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      method: method,
      headers: {
        'User-Agent': 'Zibonbaba-Deployer',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        ...(dataString ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataString)
        } : {})
      }
    };

    const req = https.request(options, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(resBody);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`GitHub API error (${res.statusCode}): ${resBody}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(resBody);
          } else {
            reject(new Error(`GitHub API parse error (${res.statusCode}): ${resBody}`));
          }
        }
      });
    });

    req.on('error', reject);
    if (dataString) {
      req.write(dataString);
    }
    req.end();
  });
}

async function deploy() {
  console.log(`🚀 Preparing Deployment to GitHub (${OWNER}/${REPO}) on branch "${BRANCH}"...\n`);

  // 1. Validate local files
  const treeEntries = [];
  for (const relPath of filesToDeploy) {
    const fullPath = path.join(FRONTEND_DIR, relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Warning: File not found locally: ${relPath}`);
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    const normalized = relPath.replace(/\\/g, '/');
    
    // Root path entry
    treeEntries.push({
      path: normalized,
      mode: '100644',
      type: 'blob',
      content: content
    });
    
    // Frontend subfolder path entry
    treeEntries.push({
      path: `frontend/${normalized}`,
      mode: '100644',
      type: 'blob',
      content: content
    });
    
    console.log(`✓ Staged: ${normalized} & frontend/${normalized} (${content.length} bytes)`);
  }

  console.log(`\n📦 Staged ${treeEntries.length} files for deployment commit.`);

  // 2. Fetch current HEAD
  console.log('📡 1. Fetching current main branch commit ref...');
  const refData = await githubRequest('GET', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`);
  const headCommitSha = refData.object.sha;
  console.log(`   Current HEAD: ${headCommitSha}`);

  // 3. Fetch base tree
  console.log('📡 2. Fetching base commit tree...');
  const commitData = await githubRequest('GET', `/repos/${OWNER}/${REPO}/git/commits/${headCommitSha}`);
  const baseTreeSha = commitData.tree.sha;
  console.log(`   Base Tree SHA: ${baseTreeSha}`);

  // 4. Create new tree
  console.log('📡 3. Creating new tree with updated Delivery Hub & System files...');
  const newTree = await githubRequest('POST', `/repos/${OWNER}/${REPO}/git/trees`, {
    base_tree: baseTreeSha,
    tree: treeEntries
  });
  console.log(`   New Tree SHA: ${newTree.sha}`);

  // 5. Create new commit
  const commitMsg = 'fix(build): sync all frontend source files, update navbar import alias and ignore eslint during vercel build';
  console.log('📡 4. Creating commit on GitHub...');
  const newCommit = await githubRequest('POST', `/repos/${OWNER}/${REPO}/git/commits`, {
    message: commitMsg,
    tree: newTree.sha,
    parents: [headCommitSha]
  });
  console.log(`   New Commit SHA: ${newCommit.sha}`);

  // 6. Update branch ref
  console.log('📡 5. Updating main branch reference...');
  const updatedRef = await githubRequest('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    sha: newCommit.sha,
    force: false
  });

  console.log(`\n🎉 DEPLOYMENT COMMITTED SUCCESSFULLY!`);
  console.log(`🔗 Commit: https://github.com/${OWNER}/${REPO}/commit/${newCommit.sha}`);
  console.log(`⚡ Vercel Deployment Triggered: https://zibonbaba.vercel.app`);
}

deploy().catch(err => {
  console.error('❌ Deployment error:', err);
  process.exit(1);
});
