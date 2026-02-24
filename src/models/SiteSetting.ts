/**
 * [당일 진단 건수 표시] 앱 설정 키-값 모델
 * - 테이블: site_settings (id, key, value, updated_at)
 * - 검증: key unique, value는 문자열(숫자도 "20" 형태로 저장 후 파싱)
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db';

export interface SiteSettingAttributes {
  id: string;
  key: string;
  value: string;
  updatedAt?: Date;
}

export type SiteSettingCreationAttributes = Optional<
  SiteSettingAttributes,
  'id' | 'updatedAt'
>;

export class SiteSettingModel
  extends Model<SiteSettingAttributes, SiteSettingCreationAttributes>
  implements SiteSettingAttributes
{
  public id!: string;
  public key!: string;
  public value!: string;
  public readonly updatedAt!: Date;
}

SiteSettingModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'site_settings',
    timestamps: false, // updated_at만 수동 관리
    underscored: true,
  }
);

export default SiteSettingModel;
