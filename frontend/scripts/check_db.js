const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const products = await prisma.product.count();
  const categories = await prisma.category.count();
  const stores = await prisma.store.count();
  const orders = await prisma.order.count();
  const verifications = await prisma.verificationRequest.count();

  console.log('Database Counts:');
  console.log({ users, products, categories, stores, orders, verifications });

  const catList = await prisma.category.findMany({ select: { id: true, name: true, slug: true } });
  console.log('\nCategories in DB (' + catList.length + '):');
  catList.forEach(c => console.log(` - ${c.name} (${c.slug})`));

  const storeList = await prisma.store.findMany({ select: { id: true, name: true, isApproved: true, _count: { select: { products: true } } } });
  console.log('\nStores in DB (' + storeList.length + '):');
  storeList.forEach(s => console.log(` - ${s.name} [Approved: ${s.isApproved}] (${s._count.products} products)`));

  const sampleProducts = await prisma.product.findMany({
    take: 8,
    select: { id: true, name: true, basePrice: true, status: true, store: { select: { name: true } }, category: { select: { name: true } } }
  });
  console.log('\nSample Products (' + sampleProducts.length + '):');
  sampleProducts.forEach(p => console.log(` - [${p.category?.name || 'No Cat'}] ${p.name} - ৳${p.basePrice} (Store: ${p.store?.name}, Status: ${p.status})`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
