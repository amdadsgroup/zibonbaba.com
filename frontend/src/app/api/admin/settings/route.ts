import { NextResponse } from 'next/server';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

// In-memory persistent default platform config (can also be saved to DB or env)
let platformSettings = {
  platformName: 'Zibonbaba Multi-Vendor Enterprise',
  currency: 'BDT',
  currencySymbol: '৳',
  shippingCost: 60,
  freeShippingThreshold: 2000,
  globalVAT: 7.5,
  platformCommission: 10.0,
  minWithdrawalAmount: 1000,
  autoApproveSellers: false,
  maintenanceMode: false,
  gateways: {
    SSLCommerz: true,
    bKash: true,
    Nagad: true,
    Rocket: true,
    Stripe: true,
    CashOnDelivery: true
  }
};

export async function GET(request: Request) {
  try {
    const auth = await requireAdminRole(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    return NextResponse.json({
      success: true,
      settings: platformSettings
    });
  } catch (err: any) {
    console.error('Admin Settings GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN', 'ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    platformSettings = {
      ...platformSettings,
      ...body,
      gateways: {
        ...platformSettings.gateways,
        ...(body.gateways || {})
      }
    };

    await logAdminAction(
      auth.user?.id || null,
      `Updated platform global configuration settings`
    );

    return NextResponse.json({
      success: true,
      message: 'Platform settings updated successfully.',
      settings: platformSettings
    });
  } catch (err: any) {
    console.error('Admin Settings POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
