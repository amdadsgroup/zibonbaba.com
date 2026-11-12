const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    }).on('error', reject);
  });
}

async function verify() {
  console.log('Testing live Vercel Hubs endpoint: https://zibonbaba.vercel.app/api/hubs');
  const res = await get('https://zibonbaba.vercel.app/api/hubs');
  console.log('Live Hubs Status Code:', res.status);
  if (res.data?.hubs) {
    console.log(`✓ Total Live Hubs: ${res.data.hubs.length}`);
    res.data.hubs.forEach(h => {
      console.log(`  - [${h.code}] ${h.name} (${h.district}, ${h.division}) | Status: ${h.status}`);
    });
  } else {
    console.log('Response:', res.data || res.raw);
  }
}

verify().catch(console.error);
