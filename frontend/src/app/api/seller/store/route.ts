import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context) {
      return NextResponse.json({ error }, { status });
    }

    if (!context.store) {
      return NextResponse.json({
        store: null,
        isPending: true,
        message: 'No store currently registered for this account.'
      });
    }

    const fullStore = await prisma.store.findUnique({
      where: { id: context.store.id },
      include: {
        _count: {
          select: { products: true, orders: true }
        }
      }
    });

    return NextResponse.json({
      store: fullStore,
      isPending: fullStore ? !fullStore.isApproved : true
    });
  } catch (err: any) {
    console.error('Seller Store API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ error: error || 'Store not found.' }, { status: status || 404 });
    }

    const body = await request.json();
    const { name, description, logo, banner } = body;

    const updatedStore = await prisma.store.update({
      where: { id: context.store.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(logo !== undefined ? { logo } : {}),
        ...(banner !== undefined ? { banner } : {})
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Store settings updated successfully.',
      store: updatedStore
    });
  } catch (err: any) {
    console.error('Seller Store Update API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
