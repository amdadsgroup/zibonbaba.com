const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('Testing default PrismaClient()...');
  const count = await prisma.user.count();
  console.log('✓ Success! Total Users:', count);
}

test()
  .catch(e => console.error('Connection error:', e.message))
  .finally(() => prisma.$disconnect());
