const fs = require('fs');
const path = require('path');
const https = require('https');

const FRONTEND_DIR = path.join(__dirname, '..');

function getGitHubTree() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/needelectro/zibonbaba.com/git/trees/main?recursive=1',
      headers: {
        'User-Agent': 'NodeJS',
      }
    };
    https.get(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git' && file !== '.vercel') {
        getAllFiles(filePath, fileList);
      }
    } else {
      const relPath = path.relative(FRONTEND_DIR, filePath).replace(/\\/g, '/');
      fileList.push({ relPath, fullPath: filePath, size: stat.size });
    }
  }
  return fileList;
}

async function run() {
  try {
    console.log('Fetching GitHub tree...');
    const tree = await getGitHubTree();
    if (!tree.tree) {
      console.error('Tree error:', tree);
      return;
    }
    
    const ghFilesMap = new Map();
    tree.tree.forEach(item => {
      if (item.type === 'blob') {
        ghFilesMap.set(item.path, item);
      }
    });

    const localFiles = getAllFiles(FRONTEND_DIR);
    console.log(`Local files count: ${localFiles.length}, GitHub files count: ${ghFilesMap.size}`);

    const modifiedOrNew = [];
    for (const file of localFiles) {
      if (file.relPath.includes('compare_with_github') || file.relPath.endsWith('.tsbuildinfo') || file.relPath.startsWith('.env')) continue;
      
      const ghItem = ghFilesMap.get(file.relPath);
      if (!ghItem) {
        modifiedOrNew.push({ status: 'NEW', path: file.relPath, fullPath: file.fullPath });
      } else {
        const localContent = fs.readFileSync(file.fullPath);
        if (localContent.length !== ghItem.size) {
          modifiedOrNew.push({ status: 'MODIFIED', path: file.relPath, fullPath: file.fullPath, localSize: localContent.length, ghSize: ghItem.size });
        }
      }
    }

    console.log(`Total modified/new files: ${modifiedOrNew.length}`);
    modifiedOrNew.forEach(f => console.log(`${f.status}: ${f.path}`));
  } catch (err) {
    console.error('Execution failed:', err);
  }
}

run().catch(console.error);
