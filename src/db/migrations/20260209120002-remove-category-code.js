'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('categories', 'code');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'code', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
    });
  },
};
