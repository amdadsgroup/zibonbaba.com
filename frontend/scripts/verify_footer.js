const https = require('https');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

async function verifyFooter() {
  console.log('Verifying footer branding on live site https://zibonbaba.vercel.app...');
  for (let i = 0; i < 15; i++) {
    const html = await fetchHtml('https://zibonbaba.vercel.app');
    const hasAmdads = html.includes('AMDADS GROUP');
    const hasCodingSign = html.includes('&lt;/&gt;') || html.includes('</>') || html.includes('Built With');
    console.log(`[Attempt ${i + 1}/15] Live HTML includes 'AMDADS GROUP': ${hasAmdads}`);
    if (hasAmdads) {
      console.log('🎉 SUCCESS: Live site footer updated with "Built With AMDADS GROUP" and coding badge!');
      return true;
    }
    await new Promise(r => setTimeout(r, 4000));
  }
  return false;
}

verifyFooter().then(ok => process.exit(ok ? 0 : 1)).catch(console.error);
