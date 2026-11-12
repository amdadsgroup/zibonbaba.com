import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const rateLimitResponse = checkRateLimit(request, 'reset-password', { limit: 5, windowSeconds: 60 });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { token, email, newPassword } = await request.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json({ error: 'token, email, and newPassword are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        token,
        usedAt: null
      }
    });

    if (!resetToken) {
      return NextResponse.json({ error: 'Invalid or already used password reset link.' }, { status: 400 });
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({ error: 'Password reset link has expired. Please request a new one.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockoutUntil: null
        }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() }
      }),
      prisma.session.deleteMany({
        where: { userId: user.id }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. Please log in with your new credentials.'
    });
  } catch (err: any) {
    console.error('Auth Reset Password Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
