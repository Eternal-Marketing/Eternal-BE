'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Backfill legacy rows so local/staging databases can adopt NOT NULL safely.
    await queryInterface.sequelize.query(`
      UPDATE subscriptions
      SET phone = 'UNKNOWN'
      WHERE phone IS NULL OR TRIM(phone) = ''
    `);

    await queryInterface.sequelize.query(`
      UPDATE subscriptions
      SET region = 'UNKNOWN'
      WHERE region IS NULL OR TRIM(region) = ''
    `);

    await queryInterface.changeColumn('subscriptions', 'phone', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('subscriptions', 'region', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('subscriptions', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('subscriptions', 'region', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
};
