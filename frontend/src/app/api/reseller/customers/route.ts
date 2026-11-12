import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireReseller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireReseller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.toLowerCase().trim() || '';

    const where: any = { resellerId: userId };
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } }
      ];
    }

    const customers = await prisma.resellerCustomer.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      customers,
      total: customers.length
    });
  } catch (err: any) {
    console.error('Reseller Customers GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { context, error, status } = await requireReseller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const body = await request.json();
    const { name, phone, altPhone, email, address, district, upazila, notes } = body;

    if (!name || !phone || !address) {
      return NextResponse.json({ error: 'Name, phone, and address are required.' }, { status: 400 });
    }

    const existing = await prisma.resellerCustomer.findFirst({
      where: { resellerId: userId, phone: phone.trim() }
    });

    let customer;
    if (existing) {
      customer = await prisma.resellerCustomer.update({
        where: { id: existing.id },
        data: {
          name: name.trim(),
          altPhone: altPhone ? altPhone.trim() : existing.altPhone,
          email: email ? email.trim() : existing.email,
          address: address.trim(),
          district: district ? district.trim() : existing.district,
          upazila: upazila ? upazila.trim() : existing.upazila,
          notes: notes !== undefined ? notes : existing.notes
        }
      });
    } else {
      customer = await prisma.resellerCustomer.create({
        data: {
          resellerId: userId,
          name: name.trim(),
          phone: phone.trim(),
          altPhone: altPhone ? altPhone.trim() : null,
          email: email ? email.trim() : null,
          address: address.trim(),
          district: district ? district.trim() : null,
          upazila: upazila ? upazila.trim() : null,
          notes: notes || null,
          status: 'ACTIVE'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Customer saved successfully.',
      customer
    });
  } catch (err: any) {
    console.error('Reseller Customer POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
