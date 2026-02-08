import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db';
import type {
  SubscriptionIndustry,
  SubscriptionConcern,
  SubscriptionMarketingStatus,
  SubscriptionChannel,
  SubscriptionContactTimeSlot,
} from '../common/types/subscription';

// ----------------------------
// TypeScript 타입 정의
// ----------------------------

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface SubscriptionAttributes {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  status: SubscriptionStatus;
  companyName?: string | null;
  industry?: SubscriptionIndustry | null;
  industryOther?: string | null;
  concerns?: SubscriptionConcern[] | null;
  marketingStatus?: SubscriptionMarketingStatus | null;
  interestedChannels?: SubscriptionChannel[] | null;
  channelsOther?: string | null;
  region?: string | null;
  contactTimeSlots?: SubscriptionContactTimeSlot[] | null;
  contactTimeOther?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SubscriptionCreationAttributes = Optional<
  SubscriptionAttributes,
  | 'id'
  | 'status'
  | 'phone'
  | 'message'
  | 'companyName'
  | 'industry'
  | 'industryOther'
  | 'concerns'
  | 'marketingStatus'
  | 'interestedChannels'
  | 'channelsOther'
  | 'region'
  | 'contactTimeSlots'
  | 'contactTimeOther'
  | 'createdAt'
  | 'updatedAt'
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
  public companyName!: string | null;
  public industry!: SubscriptionIndustry | null;
  public industryOther!: string | null;
  public concerns!: SubscriptionConcern[] | null;
  public marketingStatus!: SubscriptionMarketingStatus | null;
  public interestedChannels!: SubscriptionChannel[] | null;
  public channelsOther!: string | null;
  public region!: string | null;
  public contactTimeSlots!: SubscriptionContactTimeSlot[] | null;
  public contactTimeOther!: string | null;

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
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'company_name',
    },
    industry: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    industryOther: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'industry_other',
    },
    concerns: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    marketingStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'marketing_status',
    },
    interestedChannels: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'interested_channels',
    },
    channelsOther: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'channels_other',
    },
    region: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    contactTimeSlots: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'contact_time_slots',
    },
    contactTimeOther: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'contact_time_other',
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
