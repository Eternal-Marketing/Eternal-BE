'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const updatedAtDefault = 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP';
    //updated_at DATETIME NOT NULL
    //DEFAULT CURRENT_TIMESTAMP 와 같은 의미
    //ON UPDATE CURRENT_TIMESTAMP 와 같은 의미

    // ----------------------------------------
    // 테이블 생성
    // ----------------------------------------
    await queryInterface.createTable('site_settings', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },

      key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      value: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(updatedAtDefault),
      },
    });

    // 초기데이터
    // 주의: key 는 MySQL 예약어라 컬럼명을 반드시 백틱(`)으로 감싸야 함
    await queryInterface.sequelize.query(
      "INSERT INTO site_settings (id, `key`, value, updated_at) VALUES (UUID(), 'daily_diagnostic_max', '20', NOW())"
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('site_settings');
  },
};
