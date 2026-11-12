import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN', 'ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const [auditLogs, loginHistory] = await Promise.all([
      prisma.auditLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: { select: { fullName: true } }
            }
          }
        }
      }),
      prisma.loginHistory.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      auditLogs,
      loginHistory
    });
  } catch (err: any) {
    console.error('Admin Audit Logs Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
