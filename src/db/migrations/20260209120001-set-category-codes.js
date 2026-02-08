'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const slugToCode = [
      ['viral-marketing', 'VIRAL_MARKETING'],
      ['performance-marketing', 'PERFORMANCE_MARKETING'],
      ['sns-marketing', 'SNS_MARKETING'],
      ['video-content-marketing', 'VIDEO_CONTENT_MARKETING'],
    ];

    for (const [slug, code] of slugToCode) {
      await queryInterface.sequelize.query(
        `UPDATE categories SET code = :code WHERE slug = :slug`,
        {
          replacements: { code, slug },
        }
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE categories SET code = NULL WHERE code IN (
        'VIRAL_MARKETING', 'PERFORMANCE_MARKETING', 'SNS_MARKETING', 'VIDEO_CONTENT_MARKETING'
      )`
    );
  },
};
