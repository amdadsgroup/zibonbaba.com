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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const bodyData = await req.json();
    const { body } = bodyData;

    if (!body) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const isStaff = ['CUSTOMER_SUPPORT', 'ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role);
    const msg = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: user.id,
        body,
        isStaff
      }
    });

    if (!isStaff && ticket.status === 'RESOLVED') {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: 'OPEN' }
      });
    }

    return NextResponse.json({ message: msg }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
