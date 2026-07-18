const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@decorculture.com' },
    update: { password: hash, role: 'ADMIN' },
    create: {
      name: 'Admin',
      email: 'admin@decorculture.com',
      password: hash,
      role: 'ADMIN'
    }
  });
  console.log('Admin created');
}
main().catch(console.error).finally(() => prisma.$disconnect());
