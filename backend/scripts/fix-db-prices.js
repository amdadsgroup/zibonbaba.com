const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adjusting low legacy product prices to BDT values...');

  // Update products with low base prices (under 500 BDT which look like USD)
  const products = await prisma.product.findMany({});
  let updatedProductsCount = 0;
  let updatedVariantsCount = 0;

  for (const p of products) {
    if (p.basePrice < 500) {
      const bdtPrice = Math.round(p.basePrice * 110); // convert e.g. $149 to BDT 16,390
      
      // Update Product
      await prisma.product.update({
        where: { id: p.id },
        data: { basePrice: bdtPrice }
      });
      updatedProductsCount++;

      // Update ProductVariant
      await prisma.productVariant.updateMany({
        where: { productId: p.id },
        data: { price: bdtPrice }
      });
      updatedVariantsCount++;
    }
  }

  console.log(`✅ Completed! Updated ${updatedProductsCount} products and ${updatedVariantsCount} variants to BDT pricing.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
