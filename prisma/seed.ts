import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin account
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword);
    const admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrator',
        role: 'SUPER_ADMIN',
      },
    });
    console.log('✅ Created admin account:', admin.email);
    console.log('   Password:', adminPassword);
  } else {
    console.log('⚠️  Admin account already exists');
  }

  // Create sample categories
  const categories = [
    { name: '마케팅 칼럼', slug: 'marketing-column' },
    { name: '바이럴 마케팅', slug: 'viral-marketing' },
    { name: '블로그 관리', slug: 'blog-management' },
  ];

  for (const categoryData of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: categoryData.slug },
    });

    if (!existing) {
      await prisma.category.create({
        data: categoryData,
      });
      console.log(`✅ Created category: ${categoryData.name}`);
    }
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

