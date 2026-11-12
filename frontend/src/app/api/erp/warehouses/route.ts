import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'zibonbaba_super_secure_jwt_session_secret_token_123';

async function getUser(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}

export async function GET(req: Request) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const store = await prisma.store.findFirst({ where: { ownerId: user.id } });
    if (!store) return NextResponse.json({ warehouses: [] });

    const whs = await prisma.warehouse.findMany({ where: { storeId: store.id } });
    const formatted = whs.map((w: any) => ({
      id: w.id,
      name: w.name,
      location: w.location,
      capacities: '65%'
    }));

    return NextResponse.json({ warehouses: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
