const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, raw: body.slice(0, 300), headers: res.headers });
        }
      });
    }).on('error', reject);
  });
}

async function verifyLiveSite() {
  console.log('=== Zibonbaba Production Deployment Health Verification ===');
  const baseUrl = 'https://zibonbaba.vercel.app';
  
  const endpoints = [
    '/',
    '/api/homepage',
    '/api/products',
    '/api/categories',
    '/seller/login',
    '/admin/login',
    '/customer/login'
  ];

  for (const ep of endpoints) {
    const start = Date.now();
    try {
      const res = await get(`${baseUrl}${ep}`);
      const duration = Date.now() - start;
      const isSuccess = res.status >= 200 && res.status < 400;
      console.log(`${isSuccess ? '✅' : '❌'} [${res.status}] ${ep} (${duration}ms)`);
      if (ep === '/api/homepage') {
        console.log(`   - Categories: ${res.data?.categories?.length || 0}`);
        console.log(`   - Flash Sales / Products: ${res.data?.products?.length || 0}`);
      }
      if (ep === '/api/products') {
        console.log(`   - Products fetched: ${res.data?.products?.length || res.data?.length || 0}`);
      }
    } catch (err) {
      console.log(`❌ Error fetching ${ep}:`, err.message);
    }
  }
}

verifyLiveSite().catch(console.error);
