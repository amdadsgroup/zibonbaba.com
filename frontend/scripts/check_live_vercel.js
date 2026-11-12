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

async function checkLive() {
  console.log('Testing live Vercel deployment: https://zibonbaba.vercel.app');
  const hp = await get('https://zibonbaba.vercel.app/api/homepage');
  console.log('Live Homepage Status:', hp.status);
  console.log('Live Categories count:', hp.data?.categories?.length);
  console.log('Live Products count:', hp.data?.products?.length);
  console.log('Sample product:', hp.data?.products?.[0]);

  const prods = await get('https://zibonbaba.vercel.app/api/products');
  console.log('\nLive Products Status:', prods.status);
  console.log('Live Products count:', prods.data?.products?.length || prods.data?.length);
}

checkLive().catch(console.error);
