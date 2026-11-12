import { server } from '../server';

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('\n=======================================');
  console.log('STARTING SYSTEM INTEGRATION API TESTS');
  console.log('=======================================\n');

  let successCount = 0;
  let failCount = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ SUCCESS: ${message}`);
      successCount++;
    } else {
      console.error(`❌ FAILURE: ${message}`);
      failCount++;
    }
  }

  try {
    // 1. Check health status
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json() as any;
    assert(healthRes.status === 200, 'Health endpoint responds with 200 OK');
    assert(healthData.status === 'healthy', 'Health payload status is healthy');

    // 2. Fetch public categories and products
    const catsRes = await fetch(`${API_BASE}/categories`);
    const catsData = await catsRes.json() as any;
    assert(catsRes.status === 200, 'Categories endpoint returns 200');
    assert(catsData.categories.includes('Electronics'), 'Categories list includes Electronics');

    const prodsRes = await fetch(`${API_BASE}/products`);
    const prodsData = await prodsRes.json() as any;
    assert(prodsRes.status === 200, 'Products catalog responds with 200 OK');
    assert(prodsData.products.length > 0, 'Initial product seed list is fetched successfully');

    // 3. Register a new Customer profile
    const testEmail = `testuser_${Date.now()}@domain.com`;
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
        fullName: 'John Testperson',
        phone: '+8801700982103',
        address: 'Dhaka Sector 12',
        role: 'CUSTOMER'
      })
    });
    const regData = await regRes.json() as any;
    assert(regRes.status === 201, 'User registration succeeds with 201 Created');
    assert(regData.user.email === testEmail, 'Registered user email matches payload');

    // 4. Authenticate Customer user
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!'
      })
    });
    const loginData = await loginRes.json() as any;
    assert(loginRes.status === 200, 'User login succeeds with 200 OK');
    assert(!!loginData.accessToken, 'Access token is returned on login');
    const customerToken = loginData.accessToken;

    // 5. Test Account Lockout Protection (Repeated wrong passwords)
    console.log('Testing Account Lockout protection...');
    const targetLockoutEmail = `lockout_${Date.now()}@domain.com`;
    // Register lockout test user
    await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: targetLockoutEmail,
        password: 'SecurePassword123!',
        fullName: 'Lockout Test'
      })
    });

    // Make wrong password inputs to lock account
    let lockoutTriggered = false;
    for (let i = 0; i < 7; i++) {
      const wrongLoginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetLockoutEmail,
          password: 'IncorrectPassword'
        })
      });
      const wrongLoginData = await wrongLoginRes.json() as any;
      if (wrongLoginRes.status === 403 && wrongLoginData.error.includes('locked')) {
        lockoutTriggered = true;
        break;
      }
    }
    assert(lockoutTriggered, 'Account Lockout protection successfully triggers after failed attempts');

    // 6. Test Online Cart Checkout
    const orderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        items: [
          {
            product: { sku: 'HP-PRO-WHT' },
            quantity: 1
          }
        ],
        shippingAddress: 'Dhaka Sector 12',
        paymentMethod: 'CASH'
      })
    });
    const orderData = await orderRes.json() as any;
    assert(orderRes.status === 201, 'Online Checkout order succeeds with 201 Created');
    assert(!!orderData.orderId, 'Order checkout returns valid orderId');

    // 7. Authenticate Vendor and run POS Checkouts
    const vendorLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vendor@zibonbaba.com',
        password: 'Password123!'
      })
    });
    const vendorLoginData = await vendorLoginRes.json() as any;
    assert(vendorLoginRes.status === 200, 'Vendor login succeeds');
    const vendorToken = vendorLoginData.accessToken;

    const posRes = await fetch(`${API_BASE}/erp/pos/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${vendorToken}`
      },
      body: JSON.stringify({
        items: [
          {
            product: { sku: 'HP-PRO-WHT', price: 149.00 },
            quantity: 1
          }
        ],
        discountPercent: 10,
        paymentMethod: 'CASH'
      })
    });
    const posData = await posRes.json() as any;
    assert(posRes.status === 200, 'POS Cashier checkout succeeds with 200 OK');
    assert(!!posData.receiptId, 'POS checkout receipt details issued');

    // 8. Fetch ERP warehouses and stocks
    const whRes = await fetch(`${API_BASE}/erp/warehouses`, {
      headers: { 'Authorization': `Bearer ${vendorToken}` }
    });
    const whData = await whRes.json() as any;
    assert(whRes.status === 200, 'ERP Warehouses directory responds with 200');
    assert(whData.warehouses.length > 0, 'ERP Warehouses list parsed successfully');

    const invRes = await fetch(`${API_BASE}/erp/inventory`, {
      headers: { 'Authorization': `Bearer ${vendorToken}` }
    });
    const invData = await invRes.json() as any;
    assert(invRes.status === 200, 'ERP Inventory stocks lookup responds with 200');
    assert(invData.stock.length > 0, 'SKU stocks are fetched successfully');

    // 9. Superadmin Governance
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@zibonbaba.com',
        password: 'Password123!'
      })
    });
    const adminLoginData = await adminLoginRes.json() as any;
    const adminToken = adminLoginData.accessToken;

    const auditRes = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const auditData = await auditRes.json() as any;
    assert(auditRes.status === 200, 'Superadmin audit logs responds with 200');
    assert(auditData.auditLogs.length > 0, 'Platform security audit logs entries retrieved');

    console.log('\n=======================================');
    console.log(`TEST EXECUTION RESULTS:`);
    console.log(`PASSED: ${successCount} | FAILED: ${failCount}`);
    console.log('=======================================\n');

    if (failCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution error caught:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

// Introduce short delay to let server initialize
setTimeout(runTests, 1000);
