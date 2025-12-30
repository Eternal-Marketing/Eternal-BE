'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const SALT_ROUNDS = 10;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🌱 Seeding database...');

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', SALT_ROUNDS);

    // Create default admin account
    const adminEmail = 'admin@example.com';
    
    const [existingAdmin] = await queryInterface.sequelize.query(
      `SELECT id FROM admins WHERE email = :email`,
      {
        replacements: { email: adminEmail },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (!existingAdmin) {
      const adminId = uuidv4();
      await queryInterface.bulkInsert('admins', [
        {
          id: adminId,
          email: adminEmail,
          password: hashedPassword,
          name: 'Administrator',
          role: 'SUPER_ADMIN',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
      console.log('✅ Created admin account:', adminEmail);
      console.log('   Password: admin123');
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
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM categories WHERE slug = :slug`,
        {
          replacements: { slug: categoryData.slug },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (!existing) {
        await queryInterface.bulkInsert('categories', [
          {
            id: uuidv4(),
            name: categoryData.name,
            slug: categoryData.slug,
            order: 0,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);
        console.log(`✅ Created category: ${categoryData.name}`);
      }
    }

    console.log('✨ Seeding completed!');
  },

  async down(queryInterface, Sequelize) {
    // Remove seeded data
    await queryInterface.bulkDelete('categories', {
      slug: ['marketing-column', 'viral-marketing', 'blog-management'],
    });
    await queryInterface.bulkDelete('admins', {
      email: 'admin@example.com',
    });
  },
};
