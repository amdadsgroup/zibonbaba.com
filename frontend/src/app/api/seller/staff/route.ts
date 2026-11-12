import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const staff = await prisma.staffMember.findMany({
      where: { sellerId: context.user.id },
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    return NextResponse.json({ staff });
  } catch (err: any) {
    console.error('Seller Staff GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const body = await request.json();
    const { email, fullName, phone, jobTitle, permissions } = body;

    if (!email || !fullName || !jobTitle) {
      return NextResponse.json({ error: 'email, fullName, and jobTitle are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    let staffUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!staffUser) {
      const tempPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      const referralCode = cleanEmail.split('@')[0].toUpperCase() + Math.floor(Math.random() * 9000 + 1000);

      staffUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          phone: phone || null,
          passwordHash,
          role: 'VENDOR_STAFF',
          status: 'ACTIVE',
          referralCode,
          profile: { create: { fullName } }
        }
      });
    }

    const permsString = typeof permissions === 'string' ? permissions : JSON.stringify(permissions || ['inventory', 'orders']);

    const staffMember = await prisma.staffMember.upsert({
      where: {
        sellerId_userId: {
          sellerId: context.user.id,
          userId: staffUser.id
        }
      },
      update: {
        jobTitle,
        permissions: permsString,
        isActive: true
      },
      create: {
        sellerId: context.user.id,
        userId: staffUser.id,
        jobTitle,
        permissions: permsString,
        isActive: true
      },
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    return NextResponse.json({ success: true, staffMember }, { status: 201 });
  } catch (err: any) {
    console.error('Seller Staff POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
