import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkRateLimit } from '@/lib/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET || 'zibonbaba_super_secure_jwt_session_secret_token_123';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ikocqacatdvhrameqeox.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qC9hzMB61EWQLVH7flBdXA_GurkO2rd';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  // 1. Sliding window rate limit (Max 10 attempts per minute per IP)
  const rateLimitResponse = checkRateLimit(request, 'login', {
    limit: 10,
    windowSeconds: 60
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const cleanInput = email.trim();
    const cleanEmail = cleanInput.toLowerCase();

    // 2. Check Prisma User Database by Email or Phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { phone: cleanInput },
          { phone: cleanInput.replace(/^\+880/, '0') },
          { phone: cleanInput.startsWith('0') ? `+88${cleanInput}` : cleanInput }
        ]
      },
      include: { profile: true, stores: true }
    });

    // 3. Check Account Lockout
    if (user && user.lockoutUntil && new Date() < user.lockoutUntil) {
      const minutesRemaining = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / (60 * 1000));
      return NextResponse.json(
        { error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minute(s).` },
        { status: 423 }
      );
    }

    // 4. Authenticate via Supabase Auth if email format
    let supabaseAuthSuccess = false;
    if (cleanEmail.includes('@')) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (!authError && authData.user) {
          supabaseAuthSuccess = true;
        }
      } catch (_) {}
    }

    // 5. Password Verification
    let isValidPassword = false;
    if (user) {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    }

    if (!isValidPassword && !supabaseAuthSuccess) {
      // Increment failed attempts & enforce lockout
      if (user) {
        const newFailedCount = (user.failedLoginAttempts || 0) + 1;
        const isLocked = newFailedCount >= 5;
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: isLocked ? 0 : newFailedCount,
            lockoutUntil: isLocked ? new Date(Date.now() + 15 * 60 * 1000) : null
          }
        });
        if (isLocked) {
          return NextResponse.json(
            { error: 'Account locked for 15 minutes due to 5 consecutive failed login attempts.' },
            { status: 423 }
          );
        }
      }

      return NextResponse.json({ error: 'Invalid credentials. Please check your email/phone and password.' }, { status: 401 });
    }

    if (user && (user.status === 'SUSPENDED' || user.status === 'BLOCKED')) {
      return NextResponse.json({ error: 'Account is suspended or blocked. Please contact support.' }, { status: 403 });
    }

    // Reset failed count upon successful login
    if (user && (user.failedLoginAttempts > 0 || user.lockoutUntil)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockoutUntil: null, lastLoginAt: new Date() }
      });
    }

    const payload = {
      id: user ? user.id : 'supa-user',
      email: user ? user.email : cleanEmail,
      role: user ? user.role : 'CUSTOMER'
    };

    const isProd = process.env.NODE_ENV === 'production';
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    const primaryStore = user?.stores && user.stores.length > 0 ? user.stores[0] : null;

    const responseUser = {
      id: user ? user.id : 'supa-user',
      email: cleanEmail,
      role: user ? user.role : 'CUSTOMER',
      fullName: user?.profile?.fullName || cleanEmail.split('@')[0],
      avatar: user?.avatar || null
    };

    const userJson = encodeURIComponent(JSON.stringify(responseUser));

    const response = NextResponse.json(
      {
        message: 'Login successful.',
        accessToken,
        user: responseUser,
        store: primaryStore
      },
      { status: 200 }
    );

    response.cookies.set('zibonbaba_token', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: 604800
    });
    response.cookies.set('zibonbaba_role', responseUser.role, {
      path: '/',
      sameSite: 'lax',
      secure: isProd,
      maxAge: 604800
    });
    response.cookies.set('zibonbaba_user', userJson, {
      path: '/',
      sameSite: 'lax',
      secure: isProd,
      maxAge: 604800
    });

    return response;
  } catch (err: any) {
    console.error('Auth Login API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
