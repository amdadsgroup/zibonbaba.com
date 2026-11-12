import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { permissions, jobTitle, isActive } = body;

    const updateData: any = {};
    if (permissions !== undefined) {
      updateData.permissions = typeof permissions === 'string' ? permissions : JSON.stringify(permissions);
    }
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (isActive !== undefined) updateData.isActive = isActive;

    await prisma.staffMember.updateMany({
      where: { id, sellerId: context.user.id },
      data: updateData
    });

    return NextResponse.json({ success: true, message: 'Staff member updated.' });
  } catch (err: any) {
    console.error('Seller Staff PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const { id } = await params;

    await prisma.staffMember.deleteMany({
      where: { id, sellerId: context.user.id }
    });

    return NextResponse.json({ success: true, message: 'Staff member removed.' });
  } catch (err: any) {
    console.error('Seller Staff DELETE Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
