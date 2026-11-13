const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'superadmin@zibonbaba.com' }
    });
    console.log('USER_FOUND:', user ? { id: user.id, email: user.email, status: user.status, role: user.role } : 'NOT_FOUND');
    if (user) {
      const match = await bcrypt.compare('Password123!', user.passwordHash);
      console.log('PASSWORD_MATCH:', match);
      console.log('HASH:', user.passwordHash);
    }
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
