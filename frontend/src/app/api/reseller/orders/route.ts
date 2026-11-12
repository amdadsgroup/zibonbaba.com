import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireReseller, logAdminAction } from '@/lib/auth';
import { sendNotification } from '@/lib/services/eventBus';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireReseller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    const where: any = { resellerId: userId };
    if (statusFilter && statusFilter !== 'ALL') {
      where.status = statusFilter;
    }

    const orders = await prisma.resellerOrder.findMany({
      where,
      include: {
        order: {
          include: {
            store: true,
            deliveryAssignment: {
              include: {
                deliveryMan: {
                  include: { profile: true, deliveryProfile: true }
                }
              }
            },
            items: {
              include: {
                variant: {
                  include: { product: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrders = orders.map((ro) => {
      const o = ro.order;
      const delivery = o?.deliveryAssignment;
      const rider = delivery?.deliveryMan;

      return {
        id: ro.orderId,
        resellerOrderId: ro.id,
        date: ro.createdAt.toISOString(),
        customerName: ro.customerName,
        customerPhone: ro.customerPhone,
        altPhone: ro.altPhone,
        shippingAddress: ro.shippingAddress,
        district: ro.district,
        upazila: ro.upazila,
        baseAmount: ro.baseAmount,
        sellingAmount: ro.sellingAmount,
        profit: ro.resellerProfit,
        platformFee: ro.platformFee,
        deliveryFee: ro.deliveryFee,
        status: ro.status,
        payoutStatus: ro.payoutStatus,
        storeName: o?.store?.name || 'Zibonbaba Seller',
        items: o?.items?.map((it) => ({
          id: it.id,
          name: it.variant?.product?.name || 'Product',
          sku: it.variant?.sku || 'SKU',
          price: it.price,
          quantity: it.quantity,
          attributes: it.variant?.attributes || ''
        })) || [],
        delivery: delivery ? {
          id: delivery.id,
          status: delivery.status,
          deliveryManName: rider?.profile?.fullName || rider?.email || 'Assigned Courier',
          deliveryManPhone: rider?.phone || 'N/A',
          vehicleType: rider?.deliveryProfile?.vehicleType || 'BIKE',
          assignedAt: delivery.assignedAt,
          deliveredAt: delivery.deliveredAt
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      total: formattedOrders.length
    });
  } catch (err: any) {
    console.error('Reseller Orders GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { context, error, status } = await requireReseller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const resellerId = context.user.id;
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      altPhone,
      address,
      district,
      upazila,
      notes,
      items, // Array of { productId, variantId, sku, quantity, customSellingPrice }
      deliveryMethod
    } = body;

    if (!customerName || !customerPhone || !address) {
      return NextResponse.json({
        error: 'Customer name, mobile number, and full delivery address are required.'
      }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Please select at least one product.' }, { status: 400 });
    }

    // Execute order creation transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Validate items and inventory
      const storeItemsMap = new Map<string, Array<{ dbVariant: any; quantity: number; sellingPrice: number }>>();
      let overallBaseTotal = 0;
      let overallSellingTotal = 0;

      for (const item of items) {
        let dbVariant = null;

        if (item.variantId) {
          dbVariant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: { include: { store: true } }, inventory: true }
          });
        } else if (item.sku) {
          dbVariant = await tx.productVariant.findUnique({
            where: { sku: item.sku },
            include: { product: { include: { store: true } }, inventory: true }
          });
        } else if (item.productId) {
          dbVariant = await tx.productVariant.findFirst({
            where: { productId: item.productId },
            include: { product: { include: { store: true } }, inventory: true }
          });
        }

        if (!dbVariant) {
          throw new Error(`Product or variant specified is no longer available.`);
        }

        const requestedQty = Math.max(1, parseInt(item.quantity) || 1);
        const primaryInv = dbVariant.inventory[0];
        if (primaryInv && primaryInv.quantity < requestedQty) {
          throw new Error(`Insufficient stock for ${dbVariant.product.name}. Available: ${primaryInv.quantity}`);
        }

        // Deduct inventory
        if (primaryInv) {
          await tx.inventory.update({
            where: { id: primaryInv.id },
            data: { quantity: Math.max(0, primaryInv.quantity - requestedQty) }
          });
        }

        const baseUnit = dbVariant.price;
        const sellingUnit = item.customSellingPrice ? parseFloat(item.customSellingPrice) : Math.round(baseUnit * 1.1);

        if (sellingUnit < baseUnit) {
          throw new Error(`Selling price (৳${sellingUnit}) cannot be below base cost (৳${baseUnit}) for ${dbVariant.product.name}.`);
        }

        overallBaseTotal += (baseUnit * requestedQty);
        overallSellingTotal += (sellingUnit * requestedQty);

        const storeId = dbVariant.product.storeId;
        if (!storeItemsMap.has(storeId)) {
          storeItemsMap.set(storeId, []);
        }
        storeItemsMap.get(storeId)!.push({
          dbVariant,
          quantity: requestedQty,
          sellingPrice: sellingUnit
        });
      }

      // 2. Platform fee & profit calculation
      const platformFee = Math.round(overallBaseTotal * 0.02); // 2% platform handling fee
      const deliveryFee = 60.0;
      const resellerProfit = Math.max(0, overallSellingTotal - overallBaseTotal - platformFee);

      // 3. Create the main Order for the first store (or group)
      const primaryStoreId = Array.from(storeItemsMap.keys())[0];
      const allOrderItemsData = [];

      for (const [storeId, sItems] of Array.from(storeItemsMap.entries())) {
        for (const sItem of sItems) {
          allOrderItemsData.push({
            variantId: sItem.dbVariant.id,
            quantity: sItem.quantity,
            price: sItem.sellingPrice
          });
        }
      }

      const order = await tx.order.create({
        data: {
          customerId: resellerId, // Created by reseller
          storeId: primaryStoreId,
          source: 'RESELLER',
          subTotal: overallSellingTotal,
          tax: 0,
          discount: 0,
          total: overallSellingTotal + deliveryFee,
          status: 'PENDING',
          items: {
            create: allOrderItemsData
          }
        }
      });

      // 4. Create immutable ResellerOrder financial snapshot
      const resellerOrder = await tx.resellerOrder.create({
        data: {
          orderId: order.id,
          resellerId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          altPhone: altPhone ? altPhone.trim() : null,
          shippingAddress: address.trim(),
          district: district ? district.trim() : null,
          upazila: upazila ? upazila.trim() : null,
          baseAmount: overallBaseTotal,
          sellingAmount: overallSellingTotal,
          resellerProfit,
          platformFee,
          deliveryFee,
          status: 'PENDING',
          payoutStatus: 'PENDING'
        }
      });

      // 5. Upsert ResellerCustomer profile for customer management
      const existingCustomer = await tx.resellerCustomer.findFirst({
        where: { resellerId, phone: customerPhone.trim() }
      });

      if (existingCustomer) {
        await tx.resellerCustomer.update({
          where: { id: existingCustomer.id },
          data: {
            name: customerName.trim(),
            address: address.trim(),
            district: district ? district.trim() : existingCustomer.district,
            upazila: upazila ? upazila.trim() : existingCustomer.upazila,
            totalOrders: { increment: 1 },
            totalSales: { increment: overallSellingTotal },
            totalProfit: { increment: resellerProfit }
          }
        });
      } else {
        await tx.resellerCustomer.create({
          data: {
            resellerId,
            name: customerName.trim(),
            phone: customerPhone.trim(),
            altPhone: altPhone ? altPhone.trim() : null,
            address: address.trim(),
            district: district ? district.trim() : null,
            upazila: upazila ? upazila.trim() : null,
            totalOrders: 1,
            totalSales: overallSellingTotal,
            totalProfit: resellerProfit,
            status: 'ACTIVE'
          }
        });
      }

      const primaryStore = await tx.store.findUnique({
        where: { id: primaryStoreId },
        select: { id: true, name: true, ownerId: true }
      });

      return {
        orderId: order.id,
        resellerOrderId: resellerOrder.id,
        sellingAmount: overallSellingTotal,
        resellerProfit,
        sellerOwnerId: primaryStore?.ownerId,
        storeName: primaryStore?.name
      };
    });

    await logAdminAction(resellerId, `RESELLER_ORDER_CREATED: OrderId=${result.orderId}, Profit=৳${result.resellerProfit}`);

    // 1. Notify Reseller
    await sendNotification({
      userId: resellerId,
      title: 'Customer Order Submitted! 📦',
      body: `Order #${result.orderId.slice(0, 8).toUpperCase()} for ${customerName} submitted. Expected profit: ৳${result.resellerProfit.toLocaleString()}.`,
      type: 'SUCCESS',
      priority: 'HIGH',
      module: 'WALLET',
      link: '/reseller/orders'
    });

    // 2. Notify Merchant Store Owner
    if (result.sellerOwnerId) {
      await sendNotification({
        userId: result.sellerOwnerId,
        title: 'New Reseller Order Received! 🛍️',
        body: `New reseller dispatch order #${result.orderId.slice(0, 8).toUpperCase()} for ${customerName} received!`,
        type: 'INFO',
        priority: 'HIGH',
        module: 'ERP',
        link: '/seller/orders'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully for customer!',
      orderId: result.orderId,
      resellerOrderId: result.resellerOrderId,
      sellingAmount: result.sellingAmount,
      profit: result.resellerProfit
    }, { status: 201 });

  } catch (err: any) {
    console.error('Reseller Order Creation POST Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create customer order.' }, { status: 400 });
  }
}
