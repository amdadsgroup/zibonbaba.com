import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// @ts-ignore
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'zibonbaba_super_secure_jwt_session_secret_token_123';

async function getUser(req: Request) {
  const authHeader = req.headers.get('authorization');
  let token: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, c) => {
        const parts = c.trim().split('=');
        acc[parts[0]] = parts.slice(1).join('=');
        return acc;
      }, {});
      token = cookies.zibonbaba_token || null;
    }
  }

  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (e) {
    return null;
  }
}

export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { amount } = body;
    const addAmt = parseFloat(amount);

    if (isNaN(addAmt) || addAmt <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        walletBalance: { increment: addAmt }
      }
    });

    const tx = await prisma.walletTransaction.create({
      data: {
        userId: user.id,
        amount: addAmt,
        type: 'CREDIT',
        description: 'Funded wallet via mobile dashboard',
        balance: updatedUser.walletBalance
      }
    });

    return NextResponse.json({ balance: updatedUser.walletBalance, transaction: tx }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
