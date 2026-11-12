const https = require('https');

const BASE_URL = process.env.TEST_BASE_URL || 'https://zibonbaba.vercel.app';

const ACCOUNTS = [
  { role: 'SUPER_ADMIN', email: 'superadmin@zibonbaba.com', password: 'Password123!', portal: '/superadmin' },
  { role: 'ADMIN', email: 'admin@zibonbaba.com', password: 'Password123!', portal: '/admin' },
  { role: 'MANAGER', email: 'manager@zibonbaba.com', password: 'Password123!', portal: '/admin' },
  { role: 'ACCOUNTANT', email: 'accountant@zibonbaba.com', password: 'Password123!', portal: '/admin/finance' },
  { role: 'CUSTOMER_SUPPORT', email: 'support@zibonbaba.com', password: 'Password123!', portal: '/admin' },
  { role: 'MARKETING', email: 'marketing@zibonbaba.com', password: 'Password123!', portal: '/admin' },
  { role: 'WAREHOUSE_MANAGER', email: 'warehouse@zibonbaba.com', password: 'Password123!', portal: '/erp' },
  { role: 'INVENTORY_MANAGER', email: 'inventory@zibonbaba.com', password: 'Password123!', portal: '/erp' },
  { role: 'DELIVERY_MANAGER', email: 'delivery@zibonbaba.com', password: 'Password123!', portal: '/admin/delivery' },
  { role: 'VENDOR_ADMIN', email: 'vendor@zibonbaba.com', password: 'Password123!', portal: '/seller' },
  { role: 'VENDOR_STAFF', email: 'staff@zibonbaba.com', password: 'Password123!', portal: '/seller' },
  { role: 'CUSTOMER', email: 'customer@zibonbaba.com', password: 'Password123!', portal: '/account' },
  { role: 'RESELLER', email: 'reseller@zibonbaba.com', password: 'Password123!', portal: '/reseller' },
  { role: 'DELIVERY_MAN', email: 'courier@zibonbaba.com', password: 'Password123!', portal: '/delivery' },
];

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path, BASE_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Zibonbaba-E2E-Role-Tester/1.0',
        ...(options.headers || {})
      }
    };

    const req = https.request(reqOptions, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json,
          raw: body
        });
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

function parseCookies(setCookieHeaders) {
  if (!setCookieHeaders) return '';
  const list = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  return list.map(c => c.split(';')[0]).join('; ');
}

async function loginUser(email, password) {
  const res = await request({
    path: '/api/auth/login',
    method: 'POST'
  }, { email, password });

  const cookies = parseCookies(res.headers['set-cookie']);
  const token = res.data?.accessToken;
  const user = res.data?.user;

  return {
    statusCode: res.statusCode,
    token,
    user,
    cookies,
    success: res.statusCode === 200 && !!token
  };
}

async function runE2ETests() {
  console.log('='.repeat(70));
  console.log(`🚀 Zibonbaba Multi-Role Comprehensive E2E Testing`);
  console.log(`🌐 Target: ${BASE_URL}`);
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log('='.repeat(70) + '\n');

  const testResults = [];

  // 1. PUBLIC STOREFRONT & API TESTS
  console.log('--- 1. Testing Public Endpoints ---');
  const publicEndpoints = [
    { name: 'Storefront Homepage', path: '/' },
    { name: 'Homepage Data API', path: '/api/homepage' },
    { name: 'Products Catalog API', path: '/api/products' },
    { name: 'Categories API', path: '/api/categories' },
    { name: 'Logistics Hubs API', path: '/api/hubs' },
  ];

  for (const ep of publicEndpoints) {
    const t0 = Date.now();
    try {
      const res = await request({ path: ep.path });
      const duration = Date.now() - t0;
      const passed = res.statusCode >= 200 && res.statusCode < 400;
      console.log(`${passed ? '✅' : '❌'} [${res.statusCode}] ${ep.name} (${ep.path}) - ${duration}ms`);
      testResults.push({ category: 'Public', name: ep.name, path: ep.path, status: res.statusCode, passed, duration });
    } catch (err) {
      console.log(`❌ Failed ${ep.name}: ${err.message}`);
      testResults.push({ category: 'Public', name: ep.name, path: ep.path, status: 'ERROR', passed: false, error: err.message });
    }
  }

  // 2. AUTHENTICATION TEST FOR ALL 14 ROLES
  console.log('\n--- 2. Testing Authentication for All 14 Roles ---');
  const sessionStore = {};

  for (const acc of ACCOUNTS) {
    const t0 = Date.now();
    try {
      const auth = await loginUser(acc.email, acc.password);
      const duration = Date.now() - t0;
      const passed = auth.success;
      sessionStore[acc.role] = auth;

      console.log(
        `${passed ? '✅' : '❌'} [${auth.statusCode}] Role: ${acc.role.padEnd(18)} Email: ${acc.email.padEnd(26)} User: ${auth.user?.fullName || 'N/A'} (${duration}ms)`
      );
      testResults.push({
        category: 'Authentication',
        name: `Auth: ${acc.role}`,
        role: acc.role,
        email: acc.email,
        status: auth.statusCode,
        passed,
        duration,
        details: auth.user ? `ID: ${auth.user.id}, Role: ${auth.user.role}` : 'Login Failed'
      });
    } catch (err) {
      console.log(`❌ Auth Error for ${acc.role} (${acc.email}): ${err.message}`);
      testResults.push({ category: 'Authentication', name: `Auth: ${acc.role}`, role: acc.role, passed: false, error: err.message });
    }
  }

  // 3. ROLE-SPECIFIC AUTHORIZED ENDPOINT TESTS
  console.log('\n--- 3. Testing Role-Authorized Endpoints ---');
  const roleEndpointTests = [
    // SUPER_ADMIN / ADMIN
    { role: 'SUPER_ADMIN', name: 'Admin Platform Stats', path: '/api/admin/platform-stats' },
    { role: 'SUPER_ADMIN', name: 'Admin Users List', path: '/api/admin/users' },
    { role: 'SUPER_ADMIN', name: 'Admin Sellers List', path: '/api/admin/sellers' },
    { role: 'SUPER_ADMIN', name: 'Admin Orders List', path: '/api/admin/orders' },
    { role: 'SUPER_ADMIN', name: 'Admin Resellers List', path: '/api/admin/resellers' },
    { role: 'SUPER_ADMIN', name: 'Admin Delivery Men', path: '/api/admin/delivery-men' },
    { role: 'SUPER_ADMIN', name: 'Admin Logistics Hubs', path: '/api/hubs' },
    { role: 'SUPER_ADMIN', name: 'Admin Settings', path: '/api/admin/settings' },
    { role: 'SUPER_ADMIN', name: 'Admin Audit Logs', path: '/api/admin/audit-logs' },

    // SELLER / VENDOR
    { role: 'VENDOR_ADMIN', name: 'Seller Store Profile', path: '/api/seller/store' },
    { role: 'VENDOR_ADMIN', name: 'Seller Products', path: '/api/seller/products' },
    { role: 'VENDOR_ADMIN', name: 'Seller Orders', path: '/api/seller/orders' },
    { role: 'VENDOR_ADMIN', name: 'Seller Wallet', path: '/api/seller/wallet' },
    { role: 'VENDOR_ADMIN', name: 'Seller Analytics', path: '/api/seller/analytics' },
    { role: 'VENDOR_STAFF', name: 'Seller Staff Products', path: '/api/seller/products' },

    // RESELLER
    { role: 'RESELLER', name: 'Reseller Dashboard', path: '/api/reseller/dashboard' },
    { role: 'RESELLER', name: 'Reseller Catalog', path: '/api/reseller/products' },
    { role: 'RESELLER', name: 'Reseller Orders', path: '/api/reseller/orders' },
    { role: 'RESELLER', name: 'Reseller Wallet', path: '/api/reseller/wallet' },
    { role: 'RESELLER', name: 'Reseller Profile', path: '/api/reseller/profile' },

    // DELIVERY MAN
    { role: 'DELIVERY_MAN', name: 'Delivery Dashboard', path: '/api/delivery/dashboard' },
    { role: 'DELIVERY_MAN', name: 'Delivery Orders', path: '/api/delivery/orders' },
    { role: 'DELIVERY_MAN', name: 'Delivery Profile', path: '/api/delivery/profile' },
    { role: 'DELIVERY_MAN', name: 'Delivery Earnings', path: '/api/delivery/earnings' },

    // ERP & STAFF
    { role: 'WAREHOUSE_MANAGER', name: 'ERP Warehouses', path: '/api/erp/warehouses' },
    { role: 'INVENTORY_MANAGER', name: 'ERP Inventory', path: '/api/erp/inventory' },
    { role: 'ACCOUNTANT', name: 'Admin Finance Withdrawals', path: '/api/admin/withdrawals' },

    // CUSTOMER
    { role: 'CUSTOMER', name: 'Customer Me Profile', path: '/api/auth/me' },
    { role: 'CUSTOMER', name: 'Customer Orders', path: '/api/orders' },
  ];

  for (const test of roleEndpointTests) {
    const session = sessionStore[test.role];
    if (!session || !session.token) {
      console.log(`⚠️ Skipped ${test.name} (No session for ${test.role})`);
      continue;
    }

    const t0 = Date.now();
    try {
      const res = await request({
        path: test.path,
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Cookie': session.cookies
        }
      });
      const duration = Date.now() - t0;
      const passed = res.statusCode >= 200 && res.statusCode < 400;
      console.log(`${passed ? '✅' : '❌'} [${res.statusCode}] [${test.role}] ${test.name} (${test.path}) - ${duration}ms`);
      testResults.push({
        category: 'Role Authorized APIs',
        role: test.role,
        name: test.name,
        path: test.path,
        status: res.statusCode,
        passed,
        duration,
        dataSnippet: typeof res.data === 'object' ? Object.keys(res.data || {}).slice(0, 4).join(', ') : 'raw'
      });
    } catch (err) {
      console.log(`❌ Error [${test.role}] ${test.name}: ${err.message}`);
      testResults.push({ category: 'Role Authorized APIs', role: test.role, name: test.name, path: test.path, passed: false, error: err.message });
    }
  }

  // 4. RBAC & PERMISSION BOUNDARY TESTS (UNAUTHORIZED ACCESS ATTEMPTS)
  console.log('\n--- 4. Testing RBAC & Boundary Protection (Unauthorized Access Probing) ---');
  const rbacTests = [
    { role: 'CUSTOMER', attempt: 'Customer accessing Admin Users', path: '/api/admin/users', expectBlocked: true },
    { role: 'CUSTOMER', attempt: 'Customer accessing Seller Orders', path: '/api/seller/orders', expectBlocked: true },
    { role: 'CUSTOMER', attempt: 'Customer accessing Admin Stats', path: '/api/admin/platform-stats', expectBlocked: true },
    { role: 'DELIVERY_MAN', attempt: 'Courier accessing Admin Settings', path: '/api/admin/settings', expectBlocked: true },
    { role: 'RESELLER', attempt: 'Reseller accessing Seller Products Manager', path: '/api/seller/products', expectBlocked: true },
    { role: 'VENDOR_ADMIN', attempt: 'Seller accessing Delivery Man Dashboard', path: '/api/delivery/dashboard', expectBlocked: true },
    { role: 'GUEST', attempt: 'Unauthenticated user accessing Admin Users', path: '/api/admin/users', expectBlocked: true },
  ];

  for (const test of rbacTests) {
    const session = test.role === 'GUEST' ? null : sessionStore[test.role];
    const t0 = Date.now();
    try {
      const res = await request({
        path: test.path,
        headers: session ? {
          'Authorization': `Bearer ${session.token}`,
          'Cookie': session.cookies
        } : {}
      });
      const duration = Date.now() - t0;
      // Protected endpoint should return 401, 403, or 302/307 redirect
      const isBlocked = res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 302 || res.statusCode === 307;
      console.log(`${isBlocked ? '🛡️ PROTECTED' : '⚠️ VULNERABLE'} [${res.statusCode}] ${test.attempt} (${test.path}) - ${duration}ms`);
      testResults.push({
        category: 'RBAC Boundary Probing',
        role: test.role,
        name: test.attempt,
        path: test.path,
        status: res.statusCode,
        passed: isBlocked,
        duration
      });
    } catch (err) {
      console.log(`❌ Error in RBAC test: ${err.message}`);
    }
  }

  // 5. SUMMARY
  const total = testResults.length;
  const passedCount = testResults.filter(t => t.passed).length;
  const failedCount = total - passedCount;

  console.log('\n' + '='.repeat(70));
  console.log(`📊 TEST SUITE SUMMARY:`);
  console.log(`   Total Tests:  ${total}`);
  console.log(`   Passed:       ${passedCount} (${Math.round((passedCount/total)*100)}%)`);
  console.log(`   Failed:       ${failedCount}`);
  console.log('='.repeat(70));

  return { total, passedCount, failedCount, testResults };
}

runE2ETests().catch(console.error);
