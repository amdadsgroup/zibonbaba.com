import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/rateLimit';
import { communicationService } from '@/lib/services/communicationService';

export async function POST(request: Request) {
  // 1. Rate Limiting Protection (Max 5 requests per minute per IP)
  const rateLimitResponse = checkRateLimit(request, 'forgot-password', {
    limit: 5,
    windowSeconds: 60
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { profile: true }
    });

    // Generic response message to prevent account enumeration
    const genericSuccessResponse = {
      success: true,
      message: 'If an account is registered with this email, password recovery instructions have been dispatched.'
    };

    if (!user) {
      return NextResponse.json(genericSuccessResponse);
    }

    // 2. Cryptographically secure 256-bit token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Strict 15-minute expiration

    // 3. Invalidate any existing unused reset tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // 4. Store active reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // 5. Construct secure reset URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zibonbaba.com';
    const resetUrl = `${baseUrl}/forgot-password?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    // 6. Dispatch private transactional email
    await communicationService.sendPasswordResetEmail(
      cleanEmail,
      resetUrl,
      user.profile?.fullName || 'Zibonbaba User'
    );

    // 7. Return generic success WITHOUT exposing the raw token
    return NextResponse.json(genericSuccessResponse);
  } catch (err: any) {
    console.error('Auth Forgot Password Error:', err);
    return NextResponse.json({ error: 'Unable to process password reset request. Please try again later.' }, { status: 500 });
  }
}
