import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const stores = await prisma.store.count();
  const products = await prisma.product.count();
  const categories = await prisma.category.count();
  const orders = await prisma.order.count();

  console.log('SUPABASE_DB_SYNC_COUNTS:', {
    users,
    stores,
    products,
    categories,
    orders
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
