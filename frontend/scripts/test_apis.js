const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + path, res => {
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

async function test() {
  const hp = await get('/api/homepage');
  console.log('Homepage API status:', hp.status);
  console.log('Categories count:', hp.data?.categories?.length);
  console.log('Categories:', hp.data?.categories);
  console.log('Products count:', hp.data?.products?.length);
  console.log('Sample 3 products:', hp.data?.products?.slice(0, 3));

  const prods = await get('/api/products');
  console.log('\nProducts API status:', prods.status);
  console.log('Products count:', prods.data?.products?.length || prods.data?.length);
}

test().catch(console.error);
