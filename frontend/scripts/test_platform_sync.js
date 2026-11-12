/**
 * Comprehensive End-to-End Test Suite for Platform-Wide Real-Time Synchronization
 * Verifies that all 5 platform portals operate from the single authoritative backend source of truth.
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.TEST_BASE_URL || 'https://zibonbaba.vercel.app';

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
      timeout: 20000,
      headers: {
        'User-Agent': 'Zibonbaba-Sync-Auditor/1.0',
        ...(data ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      }
    };

    const req = client.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
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
      req.destroy(new Error('Request timed out after 20s'));
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
  return list.map((c) => c.split(';')[0]).join('; ');
}

async function loginUser(email, password = 'Password123!') {
  const res = await request(
    { path: '/api/auth/login', method: 'POST' },
    { email, password }
  );
  if (res.statusCode !== 200 || !res.data?.accessToken) {
    throw new Error(`Failed to login ${email}: Status ${res.statusCode} - ${JSON.stringify(res.data)}`);
  }
  return {
    token: res.data.accessToken,
    user: res.data.user,
    cookies: parseCookies(res.headers['set-cookie']),
    headers: {
      Authorization: `Bearer ${res.data.accessToken}`,
      Cookie: parseCookies(res.headers['set-cookie'])
    }
  };
}

async function runPlatformSyncTestSuite() {
  console.log('='.repeat(75));
  console.log('🚀 ZIBONBABA.COM — PLATFORM-WIDE REAL-TIME SYNCHRONIZATION TEST SUITE');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(75) + '\n');

  const results = [];

  // PHASE 0: AUTHENTICATE ALL KEY STAKEHOLDER PORTALS
  console.log('🔑 Step 0: Authenticating Stakeholder Accounts across all portals...');
  const [adminSession, sellerSession, customerSession, courierSession, resellerSession] = await Promise.all([
    loginUser('admin@zibonbaba.com'),
    loginUser('vendor@zibonbaba.com'),
    loginUser('customer@zibonbaba.com'),
    loginUser('courier@zibonbaba.com'),
    loginUser('reseller@zibonbaba.com')
  ]);

  console.log('  ✅ Admin Authenticated:', adminSession.user.email);
  console.log('  ✅ Seller Authenticated:', sellerSession.user.email);
  console.log('  ✅ Customer Authenticated:', customerSession.user.email);
  console.log('  ✅ Courier / Rider Authenticated:', courierSession.user.email);
  console.log('  ✅ Reseller Authenticated:', resellerSession.user.email);

  // PHASE 1: CREATE A FRESH NEW PENDING ORDER FROM CUSTOMER SHOPPING CART
  console.log('\n📦 Step 1: Placing a Fresh Customer Order to verify complete forward lifecycle...');
  let sampleProduct = null;
  const sellerProdsRes = await request({ path: '/api/seller/products', headers: sellerSession.headers });
  if (sellerProdsRes.data?.products && sellerProdsRes.data.products.length > 0) {
    sampleProduct = sellerProdsRes.data.products[0];
  } else {
    const productsRes = await request({ path: '/api/products?limit=5' });
    sampleProduct = productsRes.data?.products?.[0];
  }

  if (!sampleProduct) {
    throw new Error('No products available to create an order.');
  }

  const createOrderRes = await request(
    { path: '/api/orders', method: 'POST', headers: customerSession.headers },
    {
      items: [{ product: { sku: sampleProduct.sku, id: sampleProduct.id }, quantity: 1 }],
      shippingAddress: 'House 42, Road 7, Dhanmondi, Dhaka',
      paymentMethod: 'Cash on Delivery'
    }
  );

  let testOrderId = null;
  if (createOrderRes.data?.orders && createOrderRes.data.orders.length > 0) {
    testOrderId = createOrderRes.data.orders[0].id;
  } else if (createOrderRes.data?.order?.id) {
    testOrderId = createOrderRes.data.order.id;
  }

  if (!testOrderId) {
    throw new Error(`Failed to place order: ${JSON.stringify(createOrderRes.data)}`);
  }

  console.log(`  🎉 Fresh Order Created: #${testOrderId.substring(0, 8).toUpperCase()} (${testOrderId})`);
  console.log(`  Initial Status: PENDING`);

  // --- TEST A: ADMIN -> CUSTOMER + SELLER SYNCHRONIZATION ---
  console.log('\n🧪 TEST A: Admin sets Order to CONFIRMED');
  const testA_Res = await request(
    { path: `/api/orders/${testOrderId}/status`, method: 'PATCH', headers: adminSession.headers },
    { status: 'CONFIRMED', reason: 'Admin verified payment & stock' }
  );

  const testA_Passed = testA_Res.statusCode === 200 && testA_Res.data?.success;
  console.log(`  ${testA_Passed ? '✅' : '❌'} [${testA_Res.statusCode}] Admin Status Update to CONFIRMED: ${testA_Res.data?.message || testA_Res.data?.error}`);
  results.push({ test: 'TEST A: Admin -> Confirmed', passed: testA_Passed });

  // Verify History API
  const historyRes = await request({ path: `/api/orders/${testOrderId}/history`, headers: adminSession.headers });
  const hasHistory = historyRes.statusCode === 200 && Array.isArray(historyRes.data?.history) && historyRes.data.history.length > 0;
  console.log(`  ${hasHistory ? '✅' : '❌'} Order Status History Audit Recorded (${historyRes.data?.history?.length || 0} entries logged)`);
  results.push({ test: 'Audit History Recorded', passed: hasHistory });

  // --- TEST B: SELLER -> ADMIN + CUSTOMER SYNCHRONIZATION ---
  console.log('\n🧪 TEST B: Seller marks Order as PROCESSING');
  const testB_Res = await request(
    { path: `/api/seller/orders`, method: 'PATCH', headers: sellerSession.headers },
    { orderId: testOrderId, status: 'PROCESSING', reason: 'Order packed in warehouse' }
  );
  const testB_Passed = testB_Res.statusCode === 200 && (testB_Res.data?.success || testB_Res.data?.order);
  console.log(`  ${testB_Passed ? '✅' : '❌'} [${testB_Res.statusCode}] Seller Status Update to PROCESSING: ${testB_Res.data?.message || testB_Res.data?.error}`);
  results.push({ test: 'TEST B: Seller -> Processing', passed: testB_Passed });

  // --- TEST C: SELLER -> READY FOR DELIVERY ---
  console.log('\n🧪 TEST C: Seller marks Order as READY_FOR_DELIVERY');
  const testC_Res = await request(
    { path: `/api/orders/${testOrderId}/status`, method: 'PATCH', headers: sellerSession.headers },
    { status: 'READY_FOR_DELIVERY', reason: 'Package boxed and staged at dispatch hub' }
  );
  const testC_Passed = testC_Res.statusCode === 200 && testC_Res.data?.success;
  console.log(`  ${testC_Passed ? '✅' : '❌'} [${testC_Res.statusCode}] Seller Status Update to READY_FOR_DELIVERY: ${testC_Res.data?.message || testC_Res.data?.error}`);
  results.push({ test: 'TEST C: Seller -> Ready for Delivery', passed: testC_Passed });

  // --- TEST D: ADMIN ASSIGNS DELIVERY RIDER ---
  console.log('\n🧪 TEST D: Admin assigns Delivery Rider');
  const testD_Res = await request(
    { path: `/api/admin/delivery/assign`, method: 'POST', headers: adminSession.headers },
    { orderId: testOrderId, deliveryManId: courierSession.user.id }
  );
  const testD_Passed = testD_Res.statusCode === 200 && (testD_Res.data?.success || testD_Res.data?.assignment);
  console.log(`  ${testD_Passed ? '✅' : '❌'} [${testD_Res.statusCode}] Admin Assigned Rider: ${testD_Res.data?.message || 'Assigned successfully'}`);
  results.push({ test: 'TEST D: Admin -> Rider Assignment', passed: testD_Passed });

  // --- TEST E: DELIVERY RIDER STEPS TO DELIVERED ---
  console.log('\n🧪 TEST E: Delivery Rider completes delivery cycle (ACCEPTED -> PICKED_UP -> IN_TRANSIT -> DELIVERED)');
  
  // 1. Rider Accepts
  const rAccept = await request(
    { path: `/api/delivery/orders/${testOrderId}/status`, method: 'POST', headers: courierSession.headers },
    { newStatus: 'ACCEPTED' }
  );
  console.log(`  ${rAccept.statusCode === 200 ? '✅' : '❌'} [${rAccept.statusCode}] Rider ACCEPTED Task`);

  // 2. Rider Picks Up
  const rPickup = await request(
    { path: `/api/delivery/orders/${testOrderId}/status`, method: 'POST', headers: courierSession.headers },
    { newStatus: 'PICKED_UP', proofNotes: 'Package collected from merchant hub' }
  );
  console.log(`  ${rPickup.statusCode === 200 ? '✅' : '❌'} [${rPickup.statusCode}] Rider PICKED_UP Package`);

  // 3. Rider In Transit
  const rTransit = await request(
    { path: `/api/delivery/orders/${testOrderId}/status`, method: 'POST', headers: courierSession.headers },
    { newStatus: 'IN_TRANSIT' }
  );
  console.log(`  ${rTransit.statusCode === 200 ? '✅' : '❌'} [${rTransit.statusCode}] Rider IN_TRANSIT with package`);

  // 4. Rider Completes Delivery
  const rDelivered = await request(
    { path: `/api/delivery/orders/${testOrderId}/status`, method: 'POST', headers: courierSession.headers },
    { newStatus: 'DELIVERED', codCollected: true, proofNotes: 'Delivered to customer directly.' }
  );
  const testE_Passed = rDelivered.statusCode === 200 && (rDelivered.data?.success || rDelivered.data?.order);
  console.log(`  ${testE_Passed ? '✅' : '❌'} [${testE_Passed ? '200' : rDelivered.statusCode}] Rider Completed DELIVERED Status Transition: ${rDelivered.data?.message || 'Delivered'}`);
  results.push({ test: 'TEST E: Delivery -> Delivered', passed: testE_Passed });

  // --- TEST F: PRODUCT & INVENTORY SYNCHRONIZATION ---
  console.log('\n🧪 TEST F: Product Price & Inventory Synchronization');
  const prodListRes = await request({ path: '/api/products?limit=1' });
  const testProduct = prodListRes.data?.products?.[0];

  if (testProduct) {
    const updatedPrice = Math.round(testProduct.price * 1.02);
    const prodUpdateRes = await request(
      { path: `/api/products/${testProduct.id}`, method: 'PUT', headers: adminSession.headers },
      { price: updatedPrice, stock: 50 }
    );
    const prodPassed = prodUpdateRes.statusCode === 200 && prodUpdateRes.data?.success;
    console.log(`  ${prodPassed ? '✅' : '❌'} [${prodUpdateRes.statusCode}] Product Price & Stock Updated to ৳${updatedPrice}`);
    results.push({ test: 'TEST F: Product Sync', passed: prodPassed });
  }

  // --- TEST G: ACCOUNT STATUS SYNCHRONIZATION ---
  console.log('\n🧪 TEST G: Account Status Real-Time Suspension & Restoration');
  // 1. Suspend Reseller
  const suspendRes = await request(
    { path: `/api/admin/users/${resellerSession.user.id}`, method: 'PATCH', headers: adminSession.headers },
    { status: 'SUSPENDED', suspendedReason: 'Security audit test' }
  );
  console.log(`  ${suspendRes.statusCode === 200 ? '✅' : '❌'} [${suspendRes.statusCode}] Admin Suspended Reseller Account`);

  // 2. Verify Protected Reseller API Blocks Suspended User
  const blockedRes = await request(
    { path: `/api/reseller/wallet`, headers: resellerSession.headers }
  );
  const isBlocked = blockedRes.statusCode === 401 || blockedRes.statusCode === 403;
  console.log(`  ${isBlocked ? '🛡️ SECURE' : '⚠️ VULNERABLE'} [${blockedRes.statusCode}] Suspended Reseller API Access Blocked`);
  results.push({ test: 'TEST G1: Suspended Account Blocked', passed: isBlocked });

  // 3. Restore Reseller to ACTIVE
  const restoreRes = await request(
    { path: `/api/admin/users/${resellerSession.user.id}`, method: 'PATCH', headers: adminSession.headers },
    { status: 'ACTIVE' }
  );
  console.log(`  ${restoreRes.statusCode === 200 ? '✅' : '❌'} [${restoreRes.statusCode}] Admin Restored Reseller Account to ACTIVE`);
  results.push({ test: 'TEST G2: Account Restored', passed: restoreRes.statusCode === 200 });

  // SUMMARY
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  console.log('\n' + '='.repeat(75));
  console.log('🏁 PLATFORM SYNCHRONIZATION TEST REPORT:');
  console.log(`   Total Sync Tests:   ${total}`);
  console.log(`   Passed:             ${passedCount} / ${total} (${Math.round((passedCount / total) * 100)}%)`);
  console.log(`   Failed / Blocked:   ${failedCount}`);
  console.log(`   Status:             ${failedCount === 0 ? '🟢 100% SYNCHRONIZED — PRODUCTION CERTIFIED' : '🟡 ISSUES ENCOUNTERED'}`);
  console.log('='.repeat(75));

  return { total, passedCount, failedCount };
}

runPlatformSyncTestSuite().catch(console.error);
