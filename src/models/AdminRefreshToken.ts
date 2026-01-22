import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db';

// ----------------------------
// TypeScript 타입 정의
// ----------------------------

// Refresh Token 테이블 한 줄의 구조
export interface AdminRefreshTokenAttributes {
  id: string;
  adminId: string;
  token: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AdminRefreshTokenCreationAttributes = Optional<
  AdminRefreshTokenAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class AdminRefreshTokenModel
  extends Model<
    AdminRefreshTokenAttributes,
    AdminRefreshTokenCreationAttributes
  >
  implements AdminRefreshTokenAttributes
{
  public id!: string;
  public adminId!: string;
  public token!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ----------------------------
// Sequelize 모델 초기화
// ----------------------------
AdminRefreshTokenModel.init(
  {
    // PK: 토큰 레코드 고유 ID
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    // FK: 이 토큰이 어떤 어드민 계정에 속하는지
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'admin_id',
      references: {
        model: 'admins',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    // 실제 Refresh Token 문자열(JWT)
    // 길이가 길 수 있어 500으로 넉넉히 설정
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'admin_refresh_tokens',
    timestamps: true,
    underscored: true,
    // 조회 최적화: admin_id, token 기준 검색
    indexes: [{ fields: ['admin_id'] }, { fields: ['token'] }],
  }
);

export default AdminRefreshTokenModel;
