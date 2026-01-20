'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Refresh Token 저장 테이블 생성
    // - 로그인 시 발급된 Refresh Token을 DB에 저장하여
    //   서버가 토큰을 회수/검증할 수 있게 함
    await queryInterface.createTable('admin_refresh_tokens', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      admin_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'admins',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      token: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
    });

    // 조회 성능을 위해 인덱스 추가
    await queryInterface.addIndex('admin_refresh_tokens', ['admin_id']);
    await queryInterface.addIndex('admin_refresh_tokens', ['token']);
  },

  async down(queryInterface) {
    // 테이블 제거
    await queryInterface.dropTable('admin_refresh_tokens');
  },
};
