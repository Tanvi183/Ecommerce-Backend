const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@decorculture.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN'
    },
    create: {
      name: 'Admin User',
      email: 'admin@decorculture.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log('Admin user created/updated:', adminUser.email);
  console.log('Password: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
