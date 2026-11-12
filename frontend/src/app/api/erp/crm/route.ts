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

  const allowedRoles = ['VENDOR_ADMIN', 'VENDOR_STAFF', 'ADMIN', 'SUPER_ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Permission denied. Insufficient credentials.' }, { status: 403 });
  }

  try {
    const list = await prisma.cRMClient.findMany({ orderBy: { spentTotal: 'desc' } });
    const mapped = list.map((c) => {
      let status: 'VIP' | 'Regular' | 'New' = 'New';
      if (c.spentTotal > 1000) status = 'VIP';
      else if (c.spentTotal > 200) status = 'Regular';

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        ordersCount: 2,
        totalSpent: c.spentTotal,
        status
      };
    });

    return NextResponse.json({ customers: mapped }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
