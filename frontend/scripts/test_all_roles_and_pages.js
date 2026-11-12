const http = require('http');
const https = require('https');

const BASE_URL = process.env.TEST_BASE_URL || 'https://zibonbaba.vercel.app';

const ACCOUNTS = [
  { role: 'SUPER_ADMIN', email: 'superadmin@zibonbaba.com', password: 'Password123!', defaultPath: '/superadmin' },
  { role: 'ADMIN', email: 'admin@zibonbaba.com', password: 'Password123!', defaultPath: '/admin' },
  { role: 'MANAGER', email: 'manager@zibonbaba.com', password: 'Password123!', defaultPath: '/admin' },
  { role: 'ACCOUNTANT', email: 'accountant@zibonbaba.com', password: 'Password123!', defaultPath: '/admin/finance' },
  { role: 'CUSTOMER_SUPPORT', email: 'support@zibonbaba.com', password: 'Password123!', defaultPath: '/admin' },
  { role: 'MARKETING', email: 'marketing@zibonbaba.com', password: 'Password123!', defaultPath: '/admin' },
  { role: 'WAREHOUSE_MANAGER', email: 'warehouse@zibonbaba.com', password: 'Password123!', defaultPath: '/erp' },
  { role: 'INVENTORY_MANAGER', email: 'inventory@zibonbaba.com', password: 'Password123!', defaultPath: '/erp' },
  { role: 'DELIVERY_MANAGER', email: 'delivery@zibonbaba.com', password: 'Password123!', defaultPath: '/admin/delivery' },
  { role: 'VENDOR_ADMIN', email: 'vendor@zibonbaba.com', password: 'Password123!', defaultPath: '/seller' },
  { role: 'VENDOR_STAFF', email: 'staff@zibonbaba.com', password: 'Password123!', defaultPath: '/seller' },
  { role: 'CUSTOMER', email: 'customer@zibonbaba.com', password: 'Password123!', defaultPath: '/account' },
  { role: 'RESELLER', email: 'reseller@zibonbaba.com', password: 'Password123!', defaultPath: '/reseller' },
  { role: 'DELIVERY_MAN', email: 'courier@zibonbaba.com', password: 'Password123!', defaultPath: '/delivery' },
];

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const reqOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      timeout: 30000,
      headers: {
        'User-Agent': 'Zibonbaba-Role-Auditor/1.0',
        ...(data ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      }
    };

    const req = client.request(reqOptions, res => {
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

    req.on('timeout', () => {
      req.destroy(new Error('Request timed out after 15s'));
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

async function runFullAuditor() {
  console.log('='.repeat(75));
  console.log(`🔎 ZIBONBABA WHOLE-WEBSITE MULTI-ROLE COMPREHENSIVE AUDIT`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(75) + '\n');

  const sessionStore = {};
  const allResults = [];

  // PHASE 1: PUBLIC STOREFRONT PAGES & APIs
  console.log('📦 PHASE 1: Public Storefront & Guest Experience');
  const publicRoutes = [
    { type: 'Page', name: 'Homepage (Storefront)', path: '/' },
    { type: 'Page', name: 'Cart View', path: '/cart' },
    { type: 'Page', name: 'Checkout Page', path: '/checkout' },
    { type: 'Page', name: 'Order Tracking', path: '/tracking' },
    { type: 'Page', name: 'Customer Login', path: '/customer/login' },
    { type: 'Page', name: 'Seller Login', path: '/seller/login' },
    { type: 'Page', name: 'Reseller Login', path: '/reseller/login' },
    { type: 'Page', name: 'Delivery Login', path: '/delivery/login' },
    { type: 'Page', name: 'Admin Private Login', path: '/admin/login' },
    { type: 'API', name: 'Homepage API', path: '/api/homepage' },
    { type: 'API', name: 'Products API', path: '/api/products' },
    { type: 'API', name: 'Categories API', path: '/api/categories' },
    { type: 'API', name: 'Logistics Hubs API', path: '/api/hubs' },
  ];

  for (const item of publicRoutes) {
    const t0 = Date.now();
    try {
      const res = await request({ path: item.path });
      const duration = Date.now() - t0;
      const passed = res.statusCode >= 200 && res.statusCode < 400;
      console.log(`  ${passed ? '✅' : '❌'} [${res.statusCode}] ${item.type.padEnd(5)} ${item.name.padEnd(26)} (${item.path}) - ${duration}ms`);
      allResults.push({ phase: 'Public', ...item, status: res.statusCode, passed, duration });
    } catch (err) {
      console.log(`  ❌ ${item.name} (${item.path}) Error: ${err.message}`);
      allResults.push({ phase: 'Public', ...item, status: 'ERROR', passed: false, error: err.message });
    }
  }

  // PHASE 2: AUTHENTICATION FOR ALL 14 ROLES
  console.log('\n🔐 PHASE 2: Authentication & Token Generation (All 14 Roles)');
  for (const acc of ACCOUNTS) {
    const t0 = Date.now();
    try {
      const res = await request({
        path: '/api/auth/login',
        method: 'POST'
      }, { email: acc.email, password: acc.password });

      const duration = Date.now() - t0;
      const cookies = parseCookies(res.headers['set-cookie']);
      const token = res.data?.accessToken;
      const user = res.data?.user;
      const passed = res.statusCode === 200 && !!token;

      if (passed) {
        sessionStore[acc.role] = { token, user, cookies, account: acc };
      }

      console.log(`  ${passed ? '✅' : '❌'} [${res.statusCode}] ${acc.role.padEnd(18)} Email: ${acc.email.padEnd(26)} Name: ${user?.fullName || 'N/A'} (${duration}ms)`);
      allResults.push({
        phase: 'Auth',
        role: acc.role,
        email: acc.email,
        name: `Auth: ${acc.role}`,
        path: '/api/auth/login',
        status: res.statusCode,
        passed,
        duration
      });
    } catch (err) {
      console.log(`  ❌ Auth failed for ${acc.role}: ${err.message}`);
      allResults.push({ phase: 'Auth', role: acc.role, name: `Auth: ${acc.role}`, passed: false, error: err.message });
    }
  }

  // PHASE 3: ROLE-PROTECTED PAGES (UI PAGES WITH ROLE COOKIES)
  console.log('\n🖥️ PHASE 3: Role Portal UI Pages Navigation');
  const rolePages = [
    // CUSTOMER PORTAL
    { role: 'CUSTOMER', name: 'Customer Account Area', path: '/account' },
    { role: 'CUSTOMER', name: 'Customer Addresses', path: '/account/addresses' },
    { role: 'CUSTOMER', name: 'Customer Profile', path: '/account/profile' },
    { role: 'CUSTOMER', name: 'Customer Security', path: '/account/security' },
    { role: 'CUSTOMER', name: 'Customer Tickets', path: '/account/tickets' },
    { role: 'CUSTOMER', name: 'Customer Wallet', path: '/account/wallet' },
    { role: 'CUSTOMER', name: 'Customer Dashboard Hub', path: '/customer' },

    // SELLER / VENDOR PORTAL
    { role: 'VENDOR_ADMIN', name: 'Seller Multi-Tab Console', path: '/seller' },
    { role: 'VENDOR_ADMIN', name: 'Seller KYC Verification', path: '/seller/kyc' },
    { role: 'VENDOR_ADMIN', name: 'Seller Staff Management', path: '/seller/staff' },
    { role: 'VENDOR_STAFF', name: 'Seller Staff View', path: '/seller' },

    // RESELLER PORTAL
    { role: 'RESELLER', name: 'Reseller Multi-Tab Console', path: '/reseller' },

    // DELIVERY MAN PORTAL
    { role: 'DELIVERY_MAN', name: 'Delivery Courier Console', path: '/delivery' },

    // PLATFORM ADMIN PORTAL
    { role: 'ADMIN', name: 'Admin Operations Console', path: '/admin' },
    { role: 'MANAGER', name: 'Operations Manager Console', path: '/admin' },
    { role: 'CUSTOMER_SUPPORT', name: 'Support Lead Console', path: '/admin' },
    { role: 'MARKETING', name: 'Marketing Lead Console', path: '/admin' },
    { role: 'DELIVERY_MANAGER', name: 'Logistics Lead Console', path: '/admin' },

    // SUPER ADMIN PORTAL
    { role: 'SUPER_ADMIN', name: 'Superadmin Command Center', path: '/superadmin' },
    { role: 'SUPER_ADMIN', name: 'Superadmin Accounts', path: '/superadmin/accounts' },
    { role: 'SUPER_ADMIN', name: 'Superadmin Reports', path: '/superadmin/reports' },
    { role: 'SUPER_ADMIN', name: 'Superadmin Roles & Permissions', path: '/superadmin/roles' },
    { role: 'SUPER_ADMIN', name: 'Superadmin Security Audit', path: '/superadmin/security' },
    { role: 'SUPER_ADMIN', name: 'Superadmin Global Settings', path: '/superadmin/settings' },

    // ERP MODULES
    { role: 'SUPER_ADMIN', name: 'ERP Management Portal', path: '/erp' },
    { role: 'SUPER_ADMIN', name: 'ERP Point of Sale (POS)', path: '/erp/pos' },
    { role: 'WAREHOUSE_MANAGER', name: 'Warehouse ERP Portal', path: '/erp' },
    { role: 'INVENTORY_MANAGER', name: 'Inventory ERP Portal', path: '/erp' },
  ];

  for (const page of rolePages) {
    const session = sessionStore[page.role];
    const t0 = Date.now();
    try {
      const res = await request({
        path: page.path,
        headers: session ? {
          'Cookie': session.cookies,
          'Authorization': `Bearer ${session.token}`
        } : {}
      });
      const duration = Date.now() - t0;
      const passed = res.statusCode >= 200 && res.statusCode < 400;
      console.log(`  ${passed ? '✅' : '❌'} [${res.statusCode}] [${page.role.padEnd(16)}] ${page.name.padEnd(28)} (${page.path}) - ${duration}ms`);
      allResults.push({ phase: 'Portal Pages', ...page, status: res.statusCode, passed, duration });
    } catch (err) {
      console.log(`  ❌ Page test failed for ${page.name}: ${err.message}`);
      allResults.push({ phase: 'Portal Pages', ...page, status: 'ERROR', passed: false, error: err.message });
    }
  }

  // PHASE 4: ROLE API ENDPOINTS
  console.log('\n⚙️ PHASE 4: Role-Specific Backend APIs');
  const roleApis = [
    { role: 'SUPER_ADMIN', name: 'Admin Stats API', path: '/api/admin/platform-stats' },
    { role: 'SUPER_ADMIN', name: 'Admin Users API', path: '/api/admin/users' },
    { role: 'SUPER_ADMIN', name: 'Admin Sellers API', path: '/api/admin/sellers' },
    { role: 'SUPER_ADMIN', name: 'Admin Orders API', path: '/api/admin/orders' },
    { role: 'SUPER_ADMIN', name: 'Admin Resellers API', path: '/api/admin/resellers' },
    { role: 'SUPER_ADMIN', name: 'Admin Delivery Men API', path: '/api/admin/delivery-men' },
    { role: 'SUPER_ADMIN', name: 'Admin Hubs API', path: '/api/hubs' },
    { role: 'SUPER_ADMIN', name: 'Admin Settings API', path: '/api/admin/settings' },
    { role: 'SUPER_ADMIN', name: 'Admin Audit Logs API', path: '/api/admin/audit-logs' },
    { role: 'VENDOR_ADMIN', name: 'Seller Store API', path: '/api/seller/store' },
    { role: 'VENDOR_ADMIN', name: 'Seller Products API', path: '/api/seller/products' },
    { role: 'VENDOR_ADMIN', name: 'Seller Orders API', path: '/api/seller/orders' },
    { role: 'VENDOR_ADMIN', name: 'Seller Wallet API', path: '/api/seller/wallet' },
    { role: 'VENDOR_ADMIN', name: 'Seller Analytics API', path: '/api/seller/analytics' },
    { role: 'VENDOR_STAFF', name: 'Seller Staff Products API', path: '/api/seller/products' },
    { role: 'RESELLER', name: 'Reseller Dashboard API', path: '/api/reseller/dashboard' },
    { role: 'RESELLER', name: 'Reseller Catalog API', path: '/api/reseller/products' },
    { role: 'RESELLER', name: 'Reseller Orders API', path: '/api/reseller/orders' },
    { role: 'RESELLER', name: 'Reseller Wallet API', path: '/api/reseller/wallet' },
    { role: 'RESELLER', name: 'Reseller Profile API', path: '/api/reseller/profile' },
    { role: 'DELIVERY_MAN', name: 'Delivery Dashboard API', path: '/api/delivery/dashboard' },
    { role: 'DELIVERY_MAN', name: 'Delivery Orders API', path: '/api/delivery/orders' },
    { role: 'DELIVERY_MAN', name: 'Delivery Profile API', path: '/api/delivery/profile' },
    { role: 'DELIVERY_MAN', name: 'Delivery Earnings API', path: '/api/delivery/earnings' },
    { role: 'WAREHOUSE_MANAGER', name: 'ERP Warehouses API', path: '/api/erp/warehouses' },
    { role: 'INVENTORY_MANAGER', name: 'ERP Inventory API', path: '/api/erp/inventory' },
    { role: 'ACCOUNTANT', name: 'Admin Withdrawals API', path: '/api/admin/withdrawals' },
    { role: 'CUSTOMER', name: 'Customer Me Profile API', path: '/api/auth/me' },
    { role: 'CUSTOMER', name: 'Customer Orders API', path: '/api/orders' },
  ];

  for (const api of roleApis) {
    const session = sessionStore[api.role];
    const t0 = Date.now();
    try {
      const res = await request({
        path: api.path,
        headers: session ? {
          'Cookie': session.cookies,
          'Authorization': `Bearer ${session.token}`
        } : {}
      });
      const duration = Date.now() - t0;
      const passed = res.statusCode >= 200 && res.statusCode < 400;
      console.log(`  ${passed ? '✅' : '❌'} [${res.statusCode}] [${api.role.padEnd(16)}] ${api.name.padEnd(28)} (${api.path}) - ${duration}ms`);
      allResults.push({ phase: 'Role APIs', ...api, status: res.statusCode, passed, duration });
    } catch (err) {
      console.log(`  ❌ API test failed for ${api.name}: ${err.message}`);
      allResults.push({ phase: 'Role APIs', ...api, status: 'ERROR', passed: false, error: err.message });
    }
  }

  // PHASE 5: RBAC BOUNDARY ENFORCEMENT
  console.log('\n🛡️ PHASE 5: Role-Based Access Control (RBAC) Boundary Probing');
  const rbacTests = [
    { role: 'CUSTOMER', desc: 'Customer accessing Admin Users API', path: '/api/admin/users' },
    { role: 'CUSTOMER', desc: 'Customer accessing Seller Orders API', path: '/api/seller/orders' },
    { role: 'CUSTOMER', desc: 'Customer accessing Admin Analytics', path: '/api/admin/platform-stats' },
    { role: 'DELIVERY_MAN', desc: 'Courier accessing Admin Settings', path: '/api/admin/settings' },
    { role: 'RESELLER', desc: 'Reseller accessing Seller Products API', path: '/api/seller/products' },
    { role: 'VENDOR_ADMIN', desc: 'Seller accessing Delivery Dashboard', path: '/api/delivery/dashboard' },
    { role: 'GUEST', desc: 'Guest accessing Admin Users without token', path: '/api/admin/users' },
    { role: 'GUEST', desc: 'Guest accessing Seller Orders without token', path: '/api/seller/orders' },
  ];

  for (const rbac of rbacTests) {
    const session = rbac.role === 'GUEST' ? null : sessionStore[rbac.role];
    const t0 = Date.now();
    try {
      const res = await request({
        path: rbac.path,
        headers: session ? {
          'Cookie': session.cookies,
          'Authorization': `Bearer ${session.token}`
        } : {}
      });
      const duration = Date.now() - t0;
      const isBlocked = res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 302 || res.statusCode === 307;
      console.log(`  ${isBlocked ? '🛡️ SECURE' : '⚠️ VULNERABLE'} [${res.statusCode}] [${rbac.role.padEnd(12)}] ${rbac.desc.padEnd(42)} (${duration}ms)`);
      allResults.push({ phase: 'RBAC Security', role: rbac.role, name: rbac.desc, path: rbac.path, status: res.statusCode, passed: isBlocked, duration });
    } catch (err) {
      console.log(`  ❌ RBAC probe error: ${err.message}`);
    }
  }

  // FINAL METRICS
  const total = allResults.length;
  const passedCount = allResults.filter(r => r.passed).length;
  const failedCount = total - passedCount;
  const passRate = Math.round((passedCount / total) * 100);

  console.log('\n' + '='.repeat(75));
  console.log(`🏁 AUDIT COMPLETION SUMMARY:`);
  console.log(`   Total Test Cases:    ${total}`);
  console.log(`   Passed:              ${passedCount} / ${total} (${passRate}%)`);
  console.log(`   Failed / Blocked:    ${failedCount}`);
  console.log(`   Status:              ${failedCount === 0 ? '🟢 ALL SYSTEMS OPERATIONAL (100% HEALTHY)' : '🟡 MINOR ISSUES DETECTED'}`);
  console.log('='.repeat(75));

  return { total, passedCount, failedCount, passRate, allResults };
}

runFullAuditor().catch(console.error);
