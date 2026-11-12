const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const OWNER = 'needelectro';
const REPO = 'zibonbaba.com';
const BRANCH = 'main';

function githubRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      method: method,
      headers: {
        'User-Agent': 'NodeJS-Deployer',
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

async function main() {
  console.log(`Starting GitHub push for ${OWNER}/${REPO} on branch ${BRANCH}...`);
  
  // 1. Get HEAD commit of main
  console.log('1. Fetching current branch ref...');
  const refData = await githubRequest('GET', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`);
  const headCommitSha = refData.object.sha;
  console.log(`Current HEAD commit: ${headCommitSha}`);

  // 2. Get commit details to find base tree
  console.log('2. Fetching commit details...');
  const commitData = await githubRequest('GET', `/repos/${OWNER}/${REPO}/git/commits/${headCommitSha}`);
  const baseTreeSha = commitData.tree.sha;
  console.log(`Base tree SHA: ${baseTreeSha}`);

  // 3. Read payload
  const payloadPath = path.join(__dirname, 'payload.json');
  const files = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
  console.log(`3. Preparing tree with ${files.length} files...`);

  // Create tree entries
  const treeEntries = files.map(file => ({
    path: file.path,
    mode: '100644',
    type: 'blob',
    content: file.content
  }));

  // 4. Create new tree
  console.log('4. Creating new tree on GitHub...');
  const newTree = await githubRequest('POST', `/repos/${OWNER}/${REPO}/git/trees`, {
    base_tree: baseTreeSha,
    tree: treeEntries
  });
  console.log(`New tree created: ${newTree.sha}`);

  // 5. Create new commit
  const commitMessage = 'fix(seller): clean up products tab JSX structure and closing tags in Seller Center';
  console.log('5. Creating new commit...');
  const newCommit = await githubRequest('POST', `/repos/${OWNER}/${REPO}/git/commits`, {
    message: commitMessage,
    tree: newTree.sha,
    parents: [headCommitSha]
  });
  console.log(`New commit created: ${newCommit.sha}`);

  // 6. Update ref
  console.log('6. Updating branch ref...');
  const updatedRef = await githubRequest('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    sha: newCommit.sha,
    force: false
  });
  console.log(`Branch ${BRANCH} successfully updated to ${updatedRef.object.sha}!`);
  console.log(`Commit URL: https://github.com/${OWNER}/${REPO}/commit/${newCommit.sha}`);
}

main().catch(err => {
  console.error('Push failed:', err);
  process.exit(1);
});
