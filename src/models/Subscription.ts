import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db';

// ----------------------------
// TypeScript 타입 정의
// ----------------------------

export enum SubscriptionStatus {
  PENDING = 'PENDING', // 상담신청 대기
  APPROVED = 'APPROVED', // 승인됨 (가입자)
  REJECTED = 'REJECTED', // 거절됨
}

export interface SubscriptionAttributes {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  status: SubscriptionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SubscriptionCreationAttributes = Optional<
  SubscriptionAttributes,
  'id' | 'status' | 'phone' | 'message' | 'createdAt' | 'updatedAt'
>;

export class SubscriptionModel
  extends Model<SubscriptionAttributes, SubscriptionCreationAttributes>
  implements SubscriptionAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public phone!: string | null;
  public message!: string | null;
  public status!: SubscriptionStatus;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ----------------------------
// Sequelize 모델 초기화
// ----------------------------
SubscriptionModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SubscriptionStatus)),
      allowNull: false,
      defaultValue: SubscriptionStatus.PENDING,
    },
  },
  {
    sequelize,
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true,
  }
);

export default SubscriptionModel;
