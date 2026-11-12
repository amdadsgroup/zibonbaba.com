const https = require('https');
const { execSync } = require('child_process');

async function pollAndTest() {
  console.log('⏳ Polling Vercel deployment for real-time synchronization...');

  for (let i = 1; i <= 25; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    try {
      const statusCode = await new Promise((resolve) => {
        https
          .get('https://zibonbaba.vercel.app/api/realtime/events', (res) => {
            resolve(res.statusCode);
          })
          .on('error', () => resolve(0));
      });

      console.log(`[Attempt ${i}/25] /api/realtime/events HTTP Status: ${statusCode}`);
      if (statusCode === 200) {
        console.log('\n🎉 NEW DEPLOYMENT IS LIVE! Executing End-to-End Platform Synchronization Tests...\n');
        execSync('node scripts/test_platform_sync.js', {
          stdio: 'inherit',
          env: { ...process.env, TEST_BASE_URL: 'https://zibonbaba.vercel.app' }
        });
        return;
      }
    } catch (err) {
      console.log(`Waiting for Vercel build... (${err.message})`);
    }
  }

  console.error('Timed out waiting for Vercel deployment.');
  process.exit(1);
}

pollAndTest().catch(console.error);
