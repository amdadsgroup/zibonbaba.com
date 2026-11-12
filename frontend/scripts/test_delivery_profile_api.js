async function runTest() {
  console.log('Testing live Delivery Partner Profile System on https://zibonbaba.vercel.app...\n');

  try {
    // 1. Rider Login
    console.log('1. Logging in as delivery rider (courier@zibonbaba.com)...');
    const loginRes = await fetch('https://zibonbaba.vercel.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'courier@zibonbaba.com',
        password: 'Password123!'
      })
    });

    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    const token = loginData?.token || loginData?.accessToken;
    if (!token) {
      console.error('Login failed:', loginData);
      process.exit(1);
    }
    console.log('Rider Token received successfully:', token.slice(0, 20) + '...');

    // 2. Fetch Profile (GET /api/delivery/profile)
    console.log('\n2. Fetching Rider Fleet Profile (GET /api/delivery/profile)...');
    const profileRes = await fetch('https://zibonbaba.vercel.app/api/delivery/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const profileData = await profileRes.json();
    console.log('GET Profile Status:', profileRes.status);
    console.log('Profile User:', profileData.user);
    console.log('Delivery Profile:', profileData.deliveryProfile);

    // 3. Update Profile (PUT /api/delivery/profile)
    console.log('\n3. Updating Rider Profile Details (PUT /api/delivery/profile)...');
    const updateRes = await fetch('https://zibonbaba.vercel.app/api/delivery/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fullName: 'Sabbir Ahmed (Express Rider)',
        phone: '01777777777',
        vehicleType: 'BIKE',
        vehicleNumber: 'DHAKA METRO-HA-12-3456',
        drivingLicense: 'DL-8802938192',
        nidNumber: '19942691234567890',
        emergencyContact: '01899999999',
        preferredZone: 'Dhaka Central (Gulshan - Banani)',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Gulshan 2 / Banani'
      })
    });
    const updateData = await updateRes.json();
    console.log('PUT Profile Status:', updateRes.status);
    console.log('Update Message:', updateData.message);
    console.log('Updated Profile:', updateData.deliveryProfile);

    if (updateRes.ok && updateData.success) {
      console.log('\n✅ ALL LIVE DELIVERY PROFILE SYSTEM TESTS PASSED ON VERCEL PRODUCTION!');
    } else {
      console.error('Update profile failed:', updateData);
    }
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTest();
