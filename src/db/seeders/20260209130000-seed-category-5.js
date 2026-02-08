'use strict';
const { v4: uuidv4 } = require('uuid');

/**
 * 기존 카테고리 전부 삭제 후, CategoryCode 이넘 5개만 넣기.
 * 터미널에서 실행: npm run db:seed:categories
 */
const CATEGORIES = [
  { name: '바이럴 마케팅', slug: 'viral-marketing' },
  { name: '퍼포먼스 마케팅', slug: 'performance-marketing' },
  { name: 'SNS 마케팅', slug: 'sns-marketing' },
  { name: '영상 컨텐츠 마케팅', slug: 'video-content-marketing' },
  { name: '이터널 마케팅', slug: 'eternal-marketing' },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🌱 기존 카테고리 삭제 후 5개만 넣기...');

    // 1. 칼럼이 카테고리 참조하고 있으면 FK 오류 나니까, 먼저 참조 끊기
    await queryInterface.sequelize.query(
      `UPDATE columns SET category_id = NULL WHERE category_id IS NOT NULL`
    );

    // 2. 카테고리 전부 삭제 (기존 3개 등 뭐가 있든)
    await queryInterface.bulkDelete('categories', {});

    // 3. 우리가 정한 5개만 넣기
    const now = new Date();
    await queryInterface.bulkInsert(
      'categories',
      CATEGORIES.map((row, index) => ({
        id: uuidv4(),
        name: row.name,
        slug: row.slug,
        order: index,
        is_active: true,
        created_at: now,
        updated_at: now,
      }))
    );

    console.log('✅ 기존 카테고리 삭제됨 → 5개 카테고리만 추가됨.');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `UPDATE columns SET category_id = NULL WHERE category_id IS NOT NULL`
    );
    await queryInterface.bulkDelete('categories', {});
    console.log('Rolled back: categories cleared.');
  },
};
