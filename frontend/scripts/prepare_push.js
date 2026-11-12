const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..');

const fileRelPaths = [
  'src/lib/constants/roles.ts',
  'src/lib/services/stateMachine.ts',
  'src/lib/services/eventBus.ts',
  'src/lib/auth.ts',
  'src/app/api/auth/login/route.ts',
  'src/app/api/upload/route.ts',
  'src/app/api/products/route.ts',
  'src/app/api/seller/products/route.ts',
  'src/app/api/seller/products/[id]/route.ts',
  'src/app/api/delivery/profile/route.ts',
  'src/app/api/delivery/orders/[id]/status/route.ts',
  'src/app/api/orders/route.ts',
  'src/app/api/reseller/orders/route.ts',
  'src/app/api/admin/platform-stats/route.ts',
  'src/app/seller/page.tsx',
  'src/app/delivery/login/page.tsx',
  'src/app/delivery/page.tsx',
  'src/components/footer.tsx',
  'src/components/mobile-bottom-navigation.tsx',
  'prisma/schema.prisma',
  'prisma/seed.ts'
];

const filesToPush = [];
for (const relPath of fileRelPaths) {
  const fullPath = path.join(FRONTEND_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error('File missing:', fullPath);
    process.exit(1);
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  filesToPush.push({
    path: relPath,
    content: content
  });
  console.log(`+ Added: ${relPath} (${content.length} chars)`);
}

fs.writeFileSync(path.join(__dirname, 'payload.json'), JSON.stringify(filesToPush, null, 2));
console.log(`\nGenerated payload with ${filesToPush.length} files. Total payload size: ${JSON.stringify(filesToPush).length} bytes`);
