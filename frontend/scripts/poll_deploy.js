const https = require('https');

function req(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve) => {
    const r = https.request('https://zibonbaba.vercel.app' + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(b || '{}') });
        } catch {
          resolve({ status: res.statusCode, raw: b });
        }
      });
    });
    if (data) r.write(JSON.stringify(data));
    r.end();
  });
}

async function poll() {
  console.log('Authenticating as inventory@zibonbaba.com...');
  const login = await req('/api/auth/login', 'POST', {
    email: 'inventory@zibonbaba.com',
    password: 'Password123!'
  });
  const token = login.data?.accessToken;
  console.log(`Login status: ${login.status}`);

  for (let i = 0; i < 15; i++) {
    const inv = await req('/api/erp/inventory', 'GET', null, { Authorization: 'Bearer ' + token });
    console.log(`[Attempt ${i + 1}/15] /api/erp/inventory HTTP Status: ${inv.status}`);
    if (inv.status === 200) {
      console.log('🎉 SUCCESS: Vercel deployment completed! Inventory response:', inv.data);
      return true;
    }
    await new Promise(r => setTimeout(r, 6000));
  }
  return false;
}

poll().then(success => process.exit(success ? 0 : 1)).catch(console.error);
