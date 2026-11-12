import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminRole(request, ['ADMIN', 'SUPER_ADMIN', 'MANAGER']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();
    const { active } = body;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { active: !!active }
    });

    return NextResponse.json({ coupon });
  } catch (err: any) {
    console.error('Admin Coupon PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminRole(request, ['ADMIN', 'SUPER_ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    await prisma.coupon.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (err: any) {
    console.error('Admin Coupon DELETE Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
