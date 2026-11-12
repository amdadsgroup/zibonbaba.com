import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'HR_MANAGER']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ employees });
  } catch (err: any) {
    console.error('Admin Employees GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'HR_MANAGER']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { name, role, dept, salary, attendance, status } = body;

    if (!name || !role) {
      return NextResponse.json({ error: 'name and role are required.' }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        role,
        dept: dept || 'Administration',
        salary: parseFloat(salary) || 30000,
        attendance: attendance || '100%',
        status: status || 'Processing'
      }
    });

    return NextResponse.json({ employee }, { status: 201 });
  } catch (err: any) {
    console.error('Admin Employees POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
