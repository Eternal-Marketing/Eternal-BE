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

    console.log('✨ Initial data seeding completed!');
    console.log('💡 5개 고정 카테고리는 터미널에서 npm run db:seed:categories 로 추가하세요.');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admins', {
      email: 'admin@example.com',
    });
  },
};
