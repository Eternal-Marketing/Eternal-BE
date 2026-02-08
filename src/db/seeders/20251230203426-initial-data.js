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

    let adminId = existingAdmin ? existingAdmin.id : null;

    if (!adminId) {
      adminId = uuidv4();
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

    // Create default categories (5개 고정, 칼럼 작성 시 categoryCode 이넘과 slug로 매칭)
    const categories = [
      { name: '바이럴 마케팅', slug: 'viral-marketing' },
      { name: '퍼포먼스 마케팅', slug: 'performance-marketing' },
      { name: 'SNS 마케팅', slug: 'sns-marketing' },
      { name: '영상 컨텐츠 마케팅', slug: 'video-content-marketing' },
      { name: '이터널 마케팅', slug: 'eternal-marketing' },
    ];

    for (const categoryData of categories) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM categories WHERE slug = :slug`,
        {
          replacements: { slug: categoryData.slug },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      let categoryId = existing ? existing.id : null;

      if (!categoryId) {
        categoryId = uuidv4();
        await queryInterface.bulkInsert('categories', [
          {
            id: categoryId,
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

      const columnSlug = `sample-${categoryData.slug}`;
      const [existingColumn] = await queryInterface.sequelize.query(
        `SELECT id FROM columns WHERE slug = :slug`,
        {
          replacements: { slug: columnSlug },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (!existingColumn) {
        await queryInterface.bulkInsert('columns', [
          {
            id: uuidv4(),
            title: `${categoryData.name} 샘플 칼럼`,
            slug: columnSlug,
            content: `${categoryData.name} 관련 샘플 콘텐츠입니다.`,
            excerpt: `${categoryData.name} 샘플 요약`,
            status: 'DRAFT',
            author_id: adminId,
            category_id: categoryId,
            view_count: 0,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);
        console.log(`✅ Created sample column: ${categoryData.name}`);
      }
    }

    console.log('✨ Seeding completed!');
  },

  async down(queryInterface, Sequelize) {
    // Remove seeded data
    await queryInterface.bulkDelete('categories', {
      slug: [
        'viral-marketing',
        'performance-marketing',
        'sns-marketing',
        'video-content-marketing',
        'eternal-marketing',
      ],
    });
    await queryInterface.bulkDelete('columns', {
      slug: [
        'sample-viral-marketing',
        'sample-performance-marketing',
        'sample-sns-marketing',
        'sample-video-content-marketing',
        'sample-eternal-marketing',
      ],
    });
    await queryInterface.bulkDelete('admins', {
      email: 'admin@example.com',
    });
  },
};
