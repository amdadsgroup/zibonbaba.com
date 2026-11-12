import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'CRM_MANAGER']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const notes = await prisma.cRMNote.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ notes });
  } catch (err: any) {
    console.error('Admin CRM Notes GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'CRM_MANAGER']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { name, note } = body;

    if (!name || !note) {
      return NextResponse.json({ error: 'name and note are required.' }, { status: 400 });
    }

    const crmNote = await prisma.cRMNote.create({
      data: {
        name,
        note
      }
    });

    return NextResponse.json({ note: crmNote }, { status: 201 });
  } catch (err: any) {
    console.error('Admin CRM Notes POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
