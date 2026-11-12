/**
 * Security Utility: Rotate Admin & Superadmin Passwords
 * Usage:
 *   npx ts-node prisma/rotate-admin-password.ts "admin@zibonbaba.com" "YourNewStrongPasswordHere!"
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = (args[0] || 'admin@zibonbaba.com').trim().toLowerCase();
  const newPassword = args[1];

  if (!newPassword || newPassword.length < 8) {
    console.error('❌ Error: Please provide a secure password with at least 8 characters.');
    console.log('Usage: npx ts-node prisma/rotate-admin-password.ts <email> <newPassword>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error(`❌ User with email "${email}" not found.`);
    process.exit(1);
  }

  console.log(`🔒 Hashing new password for ${user.email} (Role: ${user.role})...`);
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      failedLoginAttempts: 0,
      lockoutUntil: null,
      status: 'ACTIVE'
    }
  });

  // Terminate any old active sessions
  await prisma.session.deleteMany({
    where: { userId: user.id }
  });

  // Log audit trail
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: `ADMIN_PASSWORD_ROTATED: Email=${email}`
    }
  });

  console.log(`✅ Success! Password for ${email} has been rotated securely.`);
  console.log(`🚪 All prior sessions invalidated.`);
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
