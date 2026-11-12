import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminRole(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            profile: true,
            addresses: true
          }
        },
        products: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            category: true,
            variants: {
              include: { inventory: true }
            }
          }
        },
        orders: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            items: true
          }
        },
        warehouses: true,
        branches: true,
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      store
    });
  } catch (err: any) {
    console.error('Admin Get Seller Detail Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN', 'ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, commissionRate, isApproved, ownerName, ownerPhone, ownerStatus } = body;

    const existingStore = await prisma.store.findUnique({
      where: { id },
      include: { owner: true }
    });

    if (!existingStore) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 });
    }

    let updateData: any = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (commissionRate !== undefined) updateData.commissionRate = parseFloat(commissionRate);
    if (isApproved !== undefined) updateData.isApproved = Boolean(isApproved);

    const updatedStore = await prisma.store.update({
      where: { id },
      data: updateData,
      include: {
        owner: { include: { profile: true } }
      }
    });

    // Update owner details if provided
    if (existingStore.ownerId && (ownerName || ownerPhone !== undefined || ownerStatus)) {
      await prisma.user.update({
        where: { id: existingStore.ownerId },
        data: {
          phone: ownerPhone !== undefined ? ownerPhone : undefined,
          status: ownerStatus ? ownerStatus.toUpperCase() : undefined,
          profile: ownerName
            ? {
                upsert: {
                  create: { fullName: ownerName },
                  update: { fullName: ownerName }
                }
              }
            : undefined
        }
      });
    }

    await logAdminAction(
      auth.user?.id || null,
      `Updated vendor store ${updatedStore.name} [Approval: ${updatedStore.isApproved}, Commission: ${updatedStore.commissionRate}%]`
    );

    return NextResponse.json({
      success: true,
      message: `Store ${updatedStore.name} updated successfully.`,
      store: updatedStore
    });
  } catch (err: any) {
    console.error('Admin Update Seller Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const existingStore = await prisma.store.findUnique({
      where: { id },
      include: { products: { include: { variants: true } } }
    });

    if (!existingStore) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 });
    }

    // Safely delete products, variants, and inventories associated with this store
    for (const prod of existingStore.products) {
      const variantIds = prod.variants.map((v) => v.id);
      if (variantIds.length > 0) {
        await prisma.inventory.deleteMany({ where: { variantId: { in: variantIds } } });
        await prisma.orderItem.deleteMany({ where: { variantId: { in: variantIds } } });
        await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
      }
      await prisma.product.delete({ where: { id: prod.id } });
    }

    await prisma.staffMember.deleteMany({ where: { sellerId: existingStore.ownerId } });
    await prisma.store.delete({ where: { id } });

    await logAdminAction(auth.user?.id || null, `Deleted vendor store ${existingStore.name}`);

    return NextResponse.json({
      success: true,
      message: `Store ${existingStore.name} and associated catalog deleted successfully.`
    });
  } catch (err: any) {
    console.error('Admin Delete Seller Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
