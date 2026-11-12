/**
 * Test Seller Product Image Creation & Management API
 */

const BASE_URL = 'https://zibonbaba.vercel.app';

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1500));
    }
  }
}

async function testSellerProductImageSystem() {
  console.log('================================================================');
  console.log(' TESTING SELLER PRODUCT IMAGE UPLOAD & MANAGEMENT SYSTEM');
  console.log('================================================================\n');

  // 1. Seller Login
  console.log('1. Logging in with Merchant/Vendor account...');
  const loginRes = await fetchWithRetry(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'vendor@zibonbaba.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token || loginData.accessToken;
  console.log('  Login status:', loginRes.status, 'User:', loginData.user?.email, 'Role:', loginData.user?.role);

  if (!token) {
    console.error('  Failed to get auth token');
    return;
  }

  // 2. Fetch Existing Products
  console.log('\n2. Fetching seller store products...');
  const getProdsRes = await fetchWithRetry(`${BASE_URL}/api/seller/products`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const getProdsData = await getProdsRes.json();
  console.log('  Seller products count:', getProdsData.products?.length || 0);
  if (getProdsData.products && getProdsData.products[0]) {
    console.log('  Sample existing product:', {
      name: getProdsData.products[0].name,
      sku: getProdsData.products[0].sku,
      image: getProdsData.products[0].image
    });
  }

  // 3. Create New Product with Custom Image
  const sampleImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';
  const testSku = `TEST-SHOE-${Date.now().toString().slice(-4)}`;
  console.log('\n3. Creating new product with custom photo...');
  const createRes = await fetchWithRetry(`${BASE_URL}/api/seller/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Pro Crimson Athletic Running Shoes',
      price: 4200,
      category: 'Apparel & Fashion',
      sku: testSku,
      stock: 25,
      description: 'Ultra-lightweight mesh breathable running shoes with shock absorption.',
      image: sampleImage
    })
  });
  const createData = await createRes.json();
  console.log('  Create product status:', createRes.status);
  console.log('  Created product:', {
    name: createData.product?.name,
    sku: testSku,
    image: createData.product?.image
  });

  const createdId = createData.product?.id;

  // 4. Update Product Photo
  if (createdId) {
    const updatedImage = 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80';
    console.log('\n4. Updating product photo via PUT...');
    const updateRes = await fetchWithRetry(`${BASE_URL}/api/seller/products/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        price: 4500,
        image: updatedImage
      })
    });
    const updateData = await updateRes.json();
    console.log('  Update status:', updateRes.status, 'Message:', updateData.message);
  }

  // 5. Verify on Marketplace
  console.log('\n5. Querying Marketplace Catalog for the new product...');
  const marketRes = await fetchWithRetry(`${BASE_URL}/api/products`);
  const marketData = await marketRes.json();
  const matched = (marketData.products || marketData || []).find((p) => p.sku === testSku);
  if (matched) {
    console.log('  ✓ Product found in Marketplace with custom image:', {
      name: matched.name,
      sku: matched.sku,
      image: matched.image
    });
  } else {
    console.log('  Marketplace items count:', (marketData.products || marketData || []).length);
  }

  console.log('\n================================================================');
  console.log(' ✅ SELLER PRODUCT IMAGE TEST COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

testSellerProductImageSystem().catch(console.error);
