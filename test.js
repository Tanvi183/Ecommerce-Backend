const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Products:', await prisma.product.count());
  console.log('Categories:', await prisma.category.count());
  console.log('Users:', await prisma.user.count());
  console.log('Orders:', await prisma.order.count());
}

main().catch(console.error).finally(() => prisma.$disconnect());
