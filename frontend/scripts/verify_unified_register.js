const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request('http://localhost:3000' + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function verify() {
  const ts = Date.now().toString().slice(-5);

  // 1. Customer registration test
  console.log('Testing unified Customer registration...');
  const custRes = await post('/api/auth/register', {
    fullName: 'Customer Test ' + ts,
    email: `cust_${ts}@test.com`,
    password: 'Password123!',
    role: 'CUSTOMER'
  });
  console.log('Customer registration status:', custRes.status, custRes.data?.user?.email, 'Role:', custRes.data?.user?.role);

  // 2. Seller registration test
  console.log('Testing unified Seller / Merchant registration...');
  const sellerRes = await post('/api/auth/register', {
    fullName: 'Seller Merchant ' + ts,
    email: `seller_${ts}@test.com`,
    password: 'Password123!',
    role: 'VENDOR_ADMIN',
    storeName: 'Dhaka Electronics Mart ' + ts,
    businessType: 'Fashion & Apparel'
  });
  console.log('Seller registration status:', sellerRes.status, sellerRes.data?.user?.email, 'Store:', sellerRes.data?.store?.name, 'Role:', sellerRes.data?.user?.role);
}

verify().catch(console.error);
