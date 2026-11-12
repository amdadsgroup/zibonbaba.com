const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const OWNER = 'needelectro';
const REPO = 'zibonbaba.com';

function getTree() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/git/trees/main?recursive=1`,
      headers: {
        'User-Agent': 'NodeJS',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    https.get(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  const tree = await getTree();
  console.log(`Total files on GitHub: ${tree.tree?.length}`);
  const samplePaths = tree.tree?.slice(0, 30).map(t => t.path);
  console.log('Sample file paths on GitHub:');
  console.log(samplePaths);
}

main().catch(console.error);
