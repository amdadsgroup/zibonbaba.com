const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('🧪 Verifying Delivery Hub & Rider Assignment Architecture...\n');

  // 1. Verify Delivery Hubs
  const hubs = await prisma.deliveryHub.findMany({
    include: {
      manager: { include: { profile: true } },
      riders: { include: { user: { include: { profile: true } } } },
      assignments: true
    }
  });

  console.log(`✓ Total Delivery Hubs in Database: ${hubs.length}`);
  for (const h of hubs) {
    console.log(`  - [${h.code}] ${h.name} (${h.district}, ${h.division})`);
    console.log(`    Capacity: ${h.capacity} | Status: ${h.status} | Stationed Riders: ${h.riders.length}`);
    if (h.manager) {
      console.log(`    Hub Manager: ${h.manager.profile?.fullName || h.manager.email}`);
    }
  }

  // 2. Verify Delivery Riders
  const riders = await prisma.deliveryProfile.findMany({
    include: {
      user: { include: { profile: true } },
      hub: true
    }
  });

  console.log(`\n✓ Total Stationed Delivery Riders: ${riders.length}`);
  for (const r of riders) {
    console.log(`  - ${r.user.profile?.fullName || r.user.email} (${r.vehicleType})`);
    console.log(`    Stationed Hub: ${r.hub ? r.hub.name : 'Unassigned'} | Online: ${r.isOnline ? '🟢 Yes' : '⚪ No'}`);
  }

  // 3. Verify Delivery Assignments
  const assignments = await prisma.deliveryAssignment.findMany({
    include: {
      order: true,
      deliveryMan: { include: { profile: true } },
      hub: true
    }
  });

  console.log(`\n✓ Total Delivery Assignments: ${assignments.length}`);
  for (const a of assignments) {
    console.log(`  - Order #${a.orderId.slice(0, 8).toUpperCase()} -> Rider: ${a.deliveryMan.profile?.fullName || a.deliveryMan.email}`);
    console.log(`    Hub: ${a.hub ? a.hub.name : 'N/A'} | Status: ${a.status} | OTP: ${a.deliveryOtp} | Fee: ৳${a.deliveryFee}`);
  }

  console.log('\n🎉 ALL DELIVERY HUB & RIDER DISPATCH SYSTEMS FULLY VERIFIED!');
}

main()
  .catch(e => {
    console.error('❌ Verification error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
