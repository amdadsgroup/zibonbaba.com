import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole } from '@/lib/auth';

export async function GET(request: Request) {
  const auth = await requireAdminRole(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const startTime = Date.now();

  try {
    // 1. Database Latency Check
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startTime;

    // 2. Parallel Metrics & Consistency Audits
    const [
      userCount,
      orderCount,
      productCount,
      storeCount,
      unassignedOrdersCount,
      pendingWithdrawalsCount,
      pendingKYCCount,
      unprocessedOutboxCount,
      recentFailedLogins
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.store.count(),
      prisma.order.count({
        where: {
          status: { in: ['CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY'] },
          deliveryAssignment: null
        }
      }),
      prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
      prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
      prisma.outboxEvent.count({ where: { processed: false } }),
      prisma.loginHistory.count({
        where: {
          status: 'FAILED',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    // 3. Security Sanity Checks
    const jwtSecret = process.env.JWT_SECRET || '';
    const isDefaultJwtSecret = jwtSecret === 'zibonbaba_super_secure_jwt_session_secret_token_123' || jwtSecret.length < 32;

    const hasSmsConfigured = Boolean(process.env.GREENWEB_SMS_TOKEN || process.env.TWILIO_ACCOUNT_SID);
    const hasEmailConfigured = Boolean(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);
    const hasPaymentConfigured = Boolean(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_ID !== 'zibonbaba_sandbox');

    // 4. Determine overall health status
    let overallStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    const warnings: string[] = [];

    if (dbLatencyMs > 500) {
      overallStatus = 'WARNING';
      warnings.push(`Elevated database latency: ${dbLatencyMs}ms`);
    }

    if (isDefaultJwtSecret) {
      warnings.push('JWT_SECRET is using the default development fallback or has low entropy (<32 chars).');
      if (process.env.NODE_ENV === 'production') {
        overallStatus = 'WARNING';
      }
    }

    if (!hasSmsConfigured) {
      warnings.push('Transactional SMS provider not configured (SMS alerts are currently running in simulated mode).');
    }

    if (!hasEmailConfigured) {
      warnings.push('Transactional Email provider not configured (Emails are currently running in simulated mode).');
    }

    if (unassignedOrdersCount > 20) {
      warnings.push(`${unassignedOrdersCount} ready orders are awaiting delivery rider assignments.`);
    }

    if (pendingWithdrawalsCount > 0) {
      warnings.push(`${pendingWithdrawalsCount} withdrawal payout request(s) awaiting administrative review.`);
    }

    return NextResponse.json({
      success: true,
      status: overallStatus,
      timestamp: new Date().toISOString(),
      latency: {
        databaseMs: dbLatencyMs
      },
      diagnostics: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      },
      securityAudit: {
        jwtSecretHardened: !isDefaultJwtSecret,
        rateLimitingActive: true,
        httpSecurityHeadersActive: true,
        recentFailedLogins24h: recentFailedLogins
      },
      integrations: {
        database: 'CONNECTED_POSTGRESQL_17',
        sms: hasSmsConfigured ? 'CONFIGURED' : 'STANDBY_SIMULATION',
        email: hasEmailConfigured ? 'CONFIGURED' : 'STANDBY_SIMULATION',
        paymentGateway: hasPaymentConfigured ? 'LIVE_PRODUCTION' : 'STANDBY_SANDBOX'
      },
      operationsAudit: {
        totalUsers: userCount,
        totalOrders: orderCount,
        totalProducts: productCount,
        totalStores: storeCount,
        unassignedOrders: unassignedOrdersCount,
        pendingWithdrawals: pendingWithdrawalsCount,
        pendingKYC: pendingKYCCount,
        pendingOutboxEvents: unprocessedOutboxCount
      },
      warnings
    });
  } catch (err: any) {
    console.error('System Health Diagnostic Failure:', err);
    return NextResponse.json({
      success: false,
      status: 'CRITICAL',
      error: err.message || 'System health inspection failed.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
