'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'subscriptions',
      'company_name',
      {
        type: Sequelize.STRING(255),
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'subscriptions',
      'industry',
      {
        type: Sequelize.STRING(50),
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'subscriptions',
      'industry_other',
      {
        type: Sequelize.STRING(255),
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'subscriptions',
      'concerns',
      {
        type: Sequelize.JSON,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'subscriptions',
      'marketing_status',
      {
        type: Sequelize.STRING(50),
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'subscriptions',
      'interested_channels',
      {
        type: Sequelize.JSON,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'subscriptions',
      'channels_other',
      {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'subscriptions',
      'region',
      {
        type: Sequelize.STRING(255),
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'subscriptions',
      'contact_time_slots',
      {
        type: Sequelize.JSON,
        allowNull: true,
      }
    );
    await queryInterface.addColumn(
      'subscriptions',
      'contact_time_other',
      {
        type: Sequelize.STRING(255),
        allowNull: true,
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('subscriptions', 'company_name');
    await queryInterface.removeColumn('subscriptions', 'industry');
    await queryInterface.removeColumn('subscriptions', 'industry_other');
    await queryInterface.removeColumn('subscriptions', 'concerns');
    await queryInterface.removeColumn('subscriptions', 'marketing_status');
    await queryInterface.removeColumn('subscriptions', 'interested_channels');
    await queryInterface.removeColumn('subscriptions', 'channels_other');
    await queryInterface.removeColumn('subscriptions', 'region');
    await queryInterface.removeColumn('subscriptions', 'contact_time_slots');
    await queryInterface.removeColumn('subscriptions', 'contact_time_other');
  },
};
