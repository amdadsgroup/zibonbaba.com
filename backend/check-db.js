const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const storeCount = await prisma.store.count();
  const categoryCount = await prisma.category.count();
  const productCount = await prisma.product.count();
  const variantCount = await prisma.productVariant.count();

  console.log(`📊 DB STATUS REPORT:`);
  console.log(`- Users: ${userCount}`);
  console.log(`- Stores: ${storeCount}`);
  console.log(`- Categories: ${categoryCount}`);
  console.log(`- Products: ${productCount}`);
  console.log(`- Variants: ${variantCount}`);
}

main().finally(() => prisma.$disconnect());
