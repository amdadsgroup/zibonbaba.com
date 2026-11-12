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

export async function GET(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allowedRoles = ['VENDOR_ADMIN', 'ADMIN', 'SUPER_ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Permission denied. Insufficient credentials.' }, { status: 403 });
  }

  try {
    const store = await prisma.store.findFirst({ where: { ownerId: user.id } });
    if (!store) return NextResponse.json({ expenses: [] }, { status: 200 });

    const list = await prisma.expense.findMany({
      where: { storeId: store.id },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ expenses: list }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allowedRoles = ['VENDOR_ADMIN', 'ADMIN', 'SUPER_ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Permission denied. Insufficient credentials.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { desc, category, amount } = body;

    if (!desc || !amount) {
      return NextResponse.json({ error: 'Description and amount are required.' }, { status: 400 });
    }

    const store = await prisma.store.findFirst({ where: { ownerId: user.id } });
    if (!store) {
      return NextResponse.json({ error: 'No registered vendor store found.' }, { status: 400 });
    }

    const exp = await prisma.expense.create({
      data: {
        storeId: store.id,
        desc,
        category: category || 'Operations',
        amount: parseFloat(amount)
      }
    });

    return NextResponse.json({ expense: exp }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
