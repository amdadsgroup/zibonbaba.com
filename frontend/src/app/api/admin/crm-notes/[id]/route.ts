import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminRole(request, ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'CRM_MANAGER']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    await prisma.cRMNote.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'CRM note removed.' });
  } catch (err: any) {
    console.error('Admin CRM Note DELETE Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
