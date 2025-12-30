import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db';

// ----------------------------
// TypeScript 타입 정의
// ----------------------------

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
}

export interface AdminAttributes {
  id: string;
  email: string;
  password: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AdminCreationAttributes = Optional<
  AdminAttributes,
  'id' | 'role' | 'isActive' | 'lastLoginAt' | 'createdAt' | 'updatedAt'
>;

export class AdminModel
  extends Model<AdminAttributes, AdminCreationAttributes>
  implements AdminAttributes
{
  public id!: string;
  public email!: string;
  public password!: string;
  public name!: string;
  public role!: AdminRole;
  public isActive!: boolean;
  public lastLoginAt!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ----------------------------
// Sequelize 모델 초기화
// ----------------------------
AdminModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(AdminRole)),
      allowNull: false,
      defaultValue: AdminRole.EDITOR,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
    },
  },
  {
    sequelize,
    tableName: 'admins',
    timestamps: true,
    underscored: true,
  }
);

export default AdminModel;

