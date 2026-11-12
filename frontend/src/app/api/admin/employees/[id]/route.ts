import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminRole(request, ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'HR_MANAGER']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, role, dept, salary, attendance, status } = body;

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(dept && { dept }),
        ...(salary !== undefined && { salary: parseFloat(salary) }),
        ...(attendance && { attendance }),
        ...(status && { status })
      }
    });

    return NextResponse.json({ employee });
  } catch (err: any) {
    console.error('Admin Employee PATCH Error:', err);
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

    await prisma.employee.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Employee record removed.' });
  } catch (err: any) {
    console.error('Admin Employee DELETE Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
